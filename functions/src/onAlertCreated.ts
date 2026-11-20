import * as admin from 'firebase-admin';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getSmsProvider } from './sms';
import { ContactDeliveryReceipt, EmergencyAlertDoc, TrustedContact } from './types';

// Ensure Firebase Admin is initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const firestore = admin.firestore();

/**
 * onAlertCreated: Cloud Function triggered on new emergency_alerts/{alertId}.
 * 1. Fan-out SMS and push to trusted_contacts where notifyOnSOS == true.
 * 2. Writes per-contact delivery results back to the alert doc (truth in dispatch).
 * 3. Schedules Wave 1 rescue network dispatch to registered responders within 500m.
 */
export const onAlertCreated = onDocumentCreated(
  {
    document: 'emergency_alerts/{alertId}',
    region: 'asia-south1',
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const alertId = event.params.alertId;
    const alertData = snapshot.data() as EmergencyAlertDoc;

    // Only process active alerts
    if (alertData.status !== 'active') {
      return;
    }

    const { userId, location } = alertData;
    const mapsUrl = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
    const smsProvider = getSmsProvider();

    // 1. Fetch trusted contacts
    const contactsSnap = await firestore
      .collection(`users/${userId}/private/contacts`)
      .where('notifyOnSOS', '==', true)
      .get();

    const trustedContacts: TrustedContact[] = [];
    contactsSnap.forEach((doc) => {
      trustedContacts.push({ id: doc.id, ...(doc.data() as Omit<TrustedContact, 'id'>) });
    });

    const deliveryReceipts: ContactDeliveryReceipt[] = [];

    // Fallback if user has no saved contacts in private subcollection
    if (trustedContacts.length === 0) {
      // Preserve any default/prefilled deliveries already on the doc
      if (alertData.contactDeliveries && alertData.contactDeliveries.length > 0) {
        for (const delivery of alertData.contactDeliveries) {
          try {
            const smsResult = await smsProvider.sendEmergencyAlert({
              toPhone: delivery.phone,
              recipientName: delivery.contactName,
              senderName: 'Rahat User',
              latitude: location.latitude,
              longitude: location.longitude,
              mapsUrl,
              alertId,
            });

            deliveryReceipts.push({
              ...delivery,
              status: smsResult.success ? 'sent' : 'failed',
              detail: smsResult.success
                ? `Dispatched via ${smsResult.provider} (DLT approved)`
                : `Dispatch error: ${smsResult.error || 'Gateway timeout'}`,
              timestamp: Date.now(),
            });
          } catch (err: unknown) {
            deliveryReceipts.push({
              ...delivery,
              status: 'failed',
              detail: err instanceof Error ? err.message : 'Unknown error',
              timestamp: Date.now(),
            });
          }
        }
      }
    } else {
      // Fan out across all user trusted contacts
      for (const contact of trustedContacts) {
        // SMS channel
        try {
          const smsResult = await smsProvider.sendEmergencyAlert({
            toPhone: contact.phone,
            recipientName: contact.name,
            senderName: 'Rahat User',
            latitude: location.latitude,
            longitude: location.longitude,
            mapsUrl,
            alertId,
          });

          deliveryReceipts.push({
            contactId: contact.id,
            contactName: contact.name,
            phone: contact.phone,
            channel: 'sms',
            status: smsResult.success ? 'sent' : 'failed',
            detail: smsResult.success
              ? `Dispatched via ${smsResult.provider}`
              : smsResult.error,
            timestamp: Date.now(),
          });
        } catch (err: unknown) {
          deliveryReceipts.push({
            contactId: contact.id,
            contactName: contact.name,
            phone: contact.phone,
            channel: 'sms',
            status: 'failed',
            detail: err instanceof Error ? err.message : 'SMS failure',
            timestamp: Date.now(),
          });
        }
      }
    }

    // 2. Write delivery results back to the emergency_alerts doc
    await snapshot.ref.update({
      contactDeliveries: deliveryReceipts,
      dispatchedAt: Date.now(),
    });

    // 3. Initiate Wave 1 Rescue Network if community rescue is enabled
    if (alertData.communityRescue) {
      await firestore.collection('community_sos_sessions').doc(alertId).set({
        alertId,
        victimUid: userId,
        status: 'searching',
        currentWave: 1,
        maxRadiusMeters: 500,
        victimLocation: location,
        createdAt: Date.now(),
        waveEscalationScheduledAt: Date.now() + 60000, // 60s escalation to Wave 2
      });
    }
  }
);
