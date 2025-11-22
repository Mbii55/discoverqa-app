// App.js
import React, { useEffect } from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BottomTabs from './src/navigation/BottomTabs';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import { AuthProvider } from './src/context/AuthContext';
import EventsScreen from "./src/screens/EventsScreen";
import EventDetailScreen from "./src/screens/EventDetailScreen";
import PlacesScreen from "./src/screens/PlacesScreen";
import PlaceDetailScreen from "./src/screens/PlaceDetailScreen";
import FavoritesScreen from "./src/screens/FavoritesScreen";
import ManageAccountScreen from "./src/screens/ManageAccountScreen";
import AboutDiscoverQAScreen from "./src/screens/AboutDiscoverQAScreen";
import TermsScreen from "./src/screens/TermsScreen";
import PrivacyPolicyScreen from "./src/screens/PrivacyPolicyScreen";

import { requestNotificationPermissionsIfNeeded } from './src/lib/notifications';

const Stack = createNativeStackNavigator();

export default function App() {

    useEffect(() => {
    requestNotificationPermissionsIfNeeded();
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="MainTabs">
          <Stack.Screen
            name="MainTabs"
            component={BottomTabs}
            options={{ headerShown: false }}
          />
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
          name="EventDetail"
          component={EventDetailScreen}
          options={{ title: "Event Details" }}
          />
          <Stack.Screen
          name="PlaceDetail"
          component={PlaceDetailScreen}
          options={{ title: "Place Details" }}
        />
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
    </AuthProvider>
  );
}
