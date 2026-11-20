import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBanner } from './src/components/StatusBanner';
import { TopBar } from './src/components/TopBar';
import { SafeWalkProvider, useAuth } from './src/context/SafeWalkContext';
import { I18nProvider } from './src/i18n';
import { AuthConsentModal } from './src/modals/AuthConsentModal';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ThemeProvider, useTheme } from './src/theme';

const MainAppContent: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { isConsentModalVisible, acceptConsent, hideConsentModal } = useAuth();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.canvas }]} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.canvas} />
      <TopBar />
      <StatusBanner />
      <View style={styles.navContainer}>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </View>
      <AuthConsentModal
        visible={isConsentModalVisible}
        onAccept={acceptConsent}
        onDismiss={hideConsentModal}
      />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <I18nProvider>
          <SafeWalkProvider>
            <MainAppContent />
          </SafeWalkProvider>
        </I18nProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  navContainer: {
    flex: 1,
  },
});
