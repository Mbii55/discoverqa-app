// App.js - WITH DEEP LINKING FOR PASSWORD RESET
import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';

import BottomTabs from './src/navigation/BottomTabs';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import ResetPasswordScreen from "./src/screens/ResetPasswordScreen";
import { AuthProvider } from './src/context/AuthContext';
import EventDetailScreen from "./src/screens/EventDetailScreen";
import PlaceDetailScreen from "./src/screens/PlaceDetailScreen";
import FavoritesScreen from "./src/screens/FavoritesScreen";
import ManageAccountScreen from "./src/screens/ManageAccountScreen";
import AboutDiscoverQAScreen from "./src/screens/AboutDiscoverQAScreen";
import TermsScreen from "./src/screens/TermsScreen";
import PrivacyPolicyScreen from "./src/screens/PrivacyPolicyScreen";
import { useTermsAgreement } from './src/lib/useTermsAgreement';
import { useOnboarding } from './src/hooks/useOnboarding';
import TermsAgreementModal from "./src/components/TermsAgreementModal";
import { requestNotificationPermissionsIfNeeded } from './src/lib/notifications';
import { supabase } from './config';

const Stack = createNativeStackNavigator();

// Linking configuration
const linking = {
  prefixes: ['discoverqa://', 'exp://'],
  config: {
    screens: {
      ResetPassword: 'reset-password',
      Login: 'login',
      SignUp: 'signup',
      MainTabs: '',
    },
  },
};

function AppNavigator() {
  const { hasCompletedOnboarding, isLoading: onboardingLoading } = useOnboarding();
  const { hasAccepted: hasAcceptedTerms, showModal, acceptTerms } = useTermsAgreement();
  const navigationRef = React.useRef(null);

  useEffect(() => {
    requestNotificationPermissionsIfNeeded();

    // Handle deep links for password reset
    const handleDeepLink = async (event) => {
      const url = event.url;
      console.log('Deep link received:', url);

      // Check if this is a password reset link
      if (url.includes('type=recovery') || url.includes('#access_token=')) {
        console.log('Password reset link detected');
        
        // Extract the full hash/query from URL
        const hashIndex = url.indexOf('#');
        const queryIndex = url.indexOf('?');
        
        let params = '';
        if (hashIndex !== -1) {
          params = url.substring(hashIndex + 1);
        } else if (queryIndex !== -1) {
          params = url.substring(queryIndex + 1);
        }

        // Parse the access token
        const urlParams = new URLSearchParams(params);
        const accessToken = urlParams.get('access_token');
        const type = urlParams.get('type');

        if (accessToken && type === 'recovery') {
          console.log('Valid password reset token found');
          
          // Set the session with the access token
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: urlParams.get('refresh_token') || '',
          });

          if (error) {
            console.error('Error setting session:', error);
          } else {
            console.log('Session set successfully, navigating to ResetPassword');
            // Navigate to reset password screen
            setTimeout(() => {
              navigationRef.current?.navigate('ResetPassword');
            }, 100);
          }
        }
      }
    };

    // Listen for deep links while app is open
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Show loading while checking onboarding status
  if (onboardingLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2D3748" />
      </View>
    );
  }

  // Determine if we should show Terms modal
  // Only show if onboarding is completed AND terms not accepted
  const shouldShowTermsModal = hasCompletedOnboarding && showModal;

  return (
    <>
      <NavigationContainer 
        ref={navigationRef}
        linking={linking}
      >
        <Stack.Navigator 
          initialRouteName={hasCompletedOnboarding ? "MainTabs" : "Onboarding"}
        >
          {/* Onboarding Screen */}
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false }}
          />

          {/* Main App */}
          <Stack.Screen
            name="MainTabs"
            component={BottomTabs}
            options={{ headerShown: false }}
          />

          {/* Auth Screens */}
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Log In' }}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUpScreen}
            options={{ title: 'Sign Up' }}
          />
          <Stack.Screen
            name="ResetPassword"
            component={ResetPasswordScreen}
            options={{ title: 'Reset Password' }}
          />

          {/* Detail Screens */}
          <Stack.Screen
            name="EventDetail"
            component={EventDetailScreen}
            options={{ title: "Event Details" }}
          />
          <Stack.Screen
            name="PlaceDetail"
            component={PlaceDetailScreen}
            options={{ title: "Place Details" }}
          />

          {/* Other Screens */}
          <Stack.Screen
            name="Favorites"
            component={FavoritesScreen}
            options={{ title: 'My Favorites' }}
          />
          <Stack.Screen
            name="ManageAccount"
            component={ManageAccountScreen}
            options={{ title: "Account" }}
          />
          <Stack.Screen
            name="AboutDiscoverQA"
            component={AboutDiscoverQAScreen}
            options={{ title: "About DiscoverQA" }}
          />
          <Stack.Screen
            name="Terms"
            component={TermsScreen}
            options={{ title: "Terms & Conditions" }}
          />
          <Stack.Screen
            name="PrivacyPolicy"
            component={PrivacyPolicyScreen}
            options={{ title: "Privacy Policy" }}
          />
        </Stack.Navigator>
      </NavigationContainer>

      {/* Terms Agreement Modal - Only show AFTER onboarding */}
      <TermsAgreementModal 
        visible={shouldShowTermsModal} 
        onAccept={acceptTerms} 
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});