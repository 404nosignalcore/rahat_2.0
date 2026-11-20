import { IWearableService } from '../interfaces';
import { WearableTelemetry } from '../../types/safety';

export class MockWearableService implements IWearableService {
  private telemetry: WearableTelemetry = {
    deviceId: 'BLE_RAHAT_RING_99',
    name: 'Rahat Smart Ring V2',
    batteryPercent: 84,
    firmwareVersion: 'v2.1.4-secure',
    isConnected: true,
    heartbeatTimestamp: Date.now(),
  };

  private sosListeners: (() => void)[] = [];

  onSosPress(listener: () => void): () => void {
    this.sosListeners.push(listener);
    return () => {
      this.sosListeners = this.sosListeners.filter((l) => l !== listener);
    };
  }

  async getTelemetry(): Promise<WearableTelemetry> {
    return {
      ...this.telemetry,
      heartbeatTimestamp: Date.now(),
    };
  }

  async connect(): Promise<void> {
    this.telemetry.isConnected = true;
    this.telemetry.heartbeatTimestamp = Date.now();
  }

  async disconnect(): Promise<void> {
    this.telemetry.isConnected = false;
  }

  async simulateSosPress(): Promise<void> {
    this.sosListeners.forEach((listener) => {
      try {
        listener();
      } catch {
        // Safe callback handling
      }
    });
  }
}
