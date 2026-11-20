import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useI18n } from '../i18n';
import { ConnectScreen } from '../screens/ConnectScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RouteScreen } from '../screens/RouteScreen';
import { SafeZoneScreen } from '../screens/SafeZoneScreen';
import { SosScreen } from '../screens/SosScreen';
import { useTheme } from '../theme';
import { Text } from 'react-native';

export type RootTabParamList = {
  SafeZone: undefined;
  Route: undefined;
  SOS: undefined;
  Connect: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export const RootNavigator: React.FC = () => {
  const { colors, typography, accessibility } = useTheme();
  const { t } = useI18n();

  return (
    <Tab.Navigator
      initialRouteName="SafeZone"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.canvas,
          borderTopColor: colors.hairline,
          minHeight: 56,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inkMuted48,
        tabBarItemStyle: {
          minHeight: accessibility.minTouchTarget,
        },
        tabBarLabelStyle: {
          ...typography.finePrint,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="SafeZone"
        component={SafeZoneScreen}
        options={{
          tabBarLabel: t.tabs.safezone,
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🛡️</Text>,
        }}
      />
      <Tab.Screen
        name="Route"
        component={RouteScreen}
        options={{
          tabBarLabel: t.tabs.route,
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🧭</Text>,
        }}
      />
      <Tab.Screen
        name="SOS"
        component={SosScreen}
        options={{
          tabBarLabel: t.tabs.sos,
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🚨</Text>,
        }}
      />
      <Tab.Screen
        name="Connect"
        component={ConnectScreen}
        options={{
          tabBarLabel: t.tabs.connect,
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>👥</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t.tabs.profile,
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
};
