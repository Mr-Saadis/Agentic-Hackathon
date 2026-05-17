import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from './src/lib/supabase';
import { Session } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Auth Screens
import WelcomeScreen from './src/screens/auth/WelcomeScreen';
import PhoneInputScreen from './src/screens/auth/PhoneInputScreen';
import OTPVerificationScreen from './src/screens/auth/OTPVerificationScreen';
import LanguageSelectionScreen from './src/screens/auth/LanguageSelectionScreen';
import ConsentScreen from './src/screens/auth/ConsentScreen';

// Main Screens
import HomeScreen from './src/screens/main/HomeScreen';
import ProviderDashboardScreen from './src/screens/provider/ProviderDashboardScreen';
import CNICUploadScreen from './src/screens/provider/CNICUploadScreen';
import TechnicianProfileScreen from './src/screens/provider/TechnicianProfileScreen';
import TechnicianVettingScreen from './src/screens/provider/TechnicianVettingScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'customer' | 'technician' | null>(null);

  useEffect(() => {
    // Check active session and local role on boot
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        if (session) {
          const storedRole = await SecureStore.getItemAsync('user_role');
          setUserRole(storedRole as 'customer' | 'technician');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        const storedRole = await SecureStore.getItemAsync('user_role');
        setUserRole(storedRole as 'customer' | 'technician');
      } else {
        // Clear role on logout
        setUserRole(null);
        await SecureStore.deleteItemAsync('user_role');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator id="RootStack" screenOptions={{ headerShown: false }}>
        {!session ? (
          // --- AUTHENTICATION STACK ---
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="PhoneInput" component={PhoneInputScreen} />
            <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
            <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
            <Stack.Screen name="Consent" component={ConsentScreen} />
          </>
        ) : (
          // --- MAIN APP STACK ---
          <>
            {userRole === 'technician' ? (
              <>
                <Stack.Screen name="CNICUpload" component={CNICUploadScreen} />
                <Stack.Screen name="TechnicianProfile" component={TechnicianProfileScreen} />
                <Stack.Screen name="TechnicianVetting" component={TechnicianVettingScreen} />
                <Stack.Screen name="ProviderDashboard" component={ProviderDashboardScreen} />
              </>
            ) : (
              <Stack.Screen name="HomeShell" component={HomeScreen} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
