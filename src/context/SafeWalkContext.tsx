import React from 'react';
import { AuthProvider } from './AuthProvider';
import { ReportsProvider } from './ReportsProvider';
import { JourneyProvider } from './JourneyProvider';
import { SOSProvider } from './SOSProvider';

export const SafeWalkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <ReportsProvider>
        <JourneyProvider>
          <SOSProvider>{children}</SOSProvider>
        </JourneyProvider>
      </ReportsProvider>
    </AuthProvider>
  );
};

export * from './AuthProvider';
export * from './ReportsProvider';
export * from './JourneyProvider';
export * from './SOSProvider';
