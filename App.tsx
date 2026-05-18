import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, DeviceEventEmitter } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from './src/lib/supabase';
import { Session } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Splash Screen
import SplashScreen from './src/screens/SplashScreen';

// Auth Screens
import WelcomeScreen from './src/screens/auth/WelcomeScreen';
import PhoneInputScreen from './src/screens/auth/PhoneInputScreen';
import OTPVerificationScreen from './src/screens/auth/OTPVerificationScreen';
import LanguageSelectionScreen from './src/screens/auth/LanguageSelectionScreen';
import ConsentScreen from './src/screens/auth/ConsentScreen';
import UserProfileSetupScreen from './src/screens/auth/UserProfileSetupScreen';

// Main Screens
import DashboardScreen from './src/screens/main/DashboardScreen';
import AiAssistantScreen from './src/screens/main/AiAssistantScreen';
import ProviderDashboardScreen from './src/screens/provider/ProviderDashboardScreen';
import CNICUploadScreen from './src/screens/provider/CNICUploadScreen';
import TechnicianProfileScreen from './src/screens/provider/TechnicianProfileScreen';
import TechnicianVettingScreen from './src/screens/provider/TechnicianVettingScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'customer' | 'technician' | null>(null);
  const [hasConsented, setHasConsented] = useState<boolean>(false);
  const [hasCompletedProfile, setHasCompletedProfile] = useState<boolean>(false);
  const [hasCompletedProviderKYC, setHasCompletedProviderKYC] = useState<boolean>(false);
  const [showSplash, setShowSplash] = useState(true);

  const checkUserStatus = async (currentSession: Session) => {
    try {
      const storedRole = await SecureStore.getItemAsync('user_role');
      setUserRole(storedRole as 'customer' | 'technician');

      if (storedRole === 'technician') {
        const localKyc = await SecureStore.getItemAsync('provider_kyc_completed');
        if (localKyc === 'true') {
          setHasCompletedProviderKYC(true);
        } else {
          // Check DB
          const { data, error } = await supabase
            .from('providers')
            .select('kyc_status')
            .eq('id', currentSession.user.id)
            .single();
            
          if (data && data.kyc_status?.toLowerCase() === 'verified') {
            await SecureStore.setItemAsync('provider_kyc_completed', 'true');
            setHasCompletedProviderKYC(true);
          } else {
            setHasCompletedProviderKYC(false);
          }
        }
      }

      // Check consent
      const localConsent = await SecureStore.getItemAsync('has_consented');
      if (localConsent === 'true') {
        setHasConsented(true);
      } else {
        // Fallback: check database
        const { data } = await supabase
          .from('users')
          .select('pdpa_consent')
          .eq('id', currentSession.user.id)
          .single();
        
        if (data?.pdpa_consent) {
          await SecureStore.setItemAsync('has_consented', 'true');
          setHasConsented(true);
        } else {
          setHasConsented(false);
        }
      }

      // Check if profile is completed (has name)
      if (currentSession.user.user_metadata?.full_name) {
        setHasCompletedProfile(true);
      } else {
        setHasCompletedProfile(false);
      }

    } catch (error) {
      console.error('Error checking user status:', error);
      setHasConsented(false);
      setHasCompletedProfile(false);
      setHasCompletedProviderKYC(false);
    }
  };

  useEffect(() => {
    // Check active session and local role on boot
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
          await checkUserStatus(session);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (newSession && (!session || newSession.user.id !== session?.user.id)) {
        setIsLoading(true);
        setSession(newSession);
        await checkUserStatus(newSession);
        setIsLoading(false);
      } else if (!newSession) {
        setSession(null);
        setUserRole(null);
        setHasConsented(false);
        await SecureStore.deleteItemAsync('user_role');
        await SecureStore.deleteItemAsync('has_consented');
      }
    });

    const consentListener = DeviceEventEmitter.addListener('consent_granted', () => {
      setHasConsented(true);
    });

    const profileListener = DeviceEventEmitter.addListener('profile_completed', () => {
      setHasCompletedProfile(true);
    });

    const providerKycListener = DeviceEventEmitter.addListener('provider_kyc_completed', () => {
      setHasCompletedProviderKYC(true);
    });

    return () => {
      authListener.subscription.unsubscribe();
      consentListener.remove();
      profileListener.remove();
      providerKycListener.remove();
    };
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#6366F1" />
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
          </>
        ) : (
          <>
            {userRole === 'technician' ? (
               // --- TECHNICIAN STACK ---
               hasCompletedProviderKYC ? (
                 <>
                   <Stack.Screen name="ProviderDashboard" component={ProviderDashboardScreen} />
                 </>
               ) : (
                 <>
                   <Stack.Screen name="CNICUpload" component={CNICUploadScreen} />
                   <Stack.Screen name="TechnicianProfile" component={TechnicianProfileScreen} />
                   <Stack.Screen name="TechnicianVetting" component={TechnicianVettingScreen} />
                   <Stack.Screen name="ProviderDashboard" component={ProviderDashboardScreen} />
                 </>
               )
            ) : !hasConsented || !hasCompletedProfile ? (
              // --- ONBOARDING STACK (Customer Only) ---
              <>
                {!hasConsented ? (
                  <>
                    <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
                    <Stack.Screen name="Consent" component={ConsentScreen} />
                  </>
                ) : (
                  <Stack.Screen name="UserProfileSetup" component={UserProfileSetupScreen} />
                )}
              </>
            ) : (
              // --- MAIN APP STACK (Customer) ---
              <>
                <Stack.Screen name="HomeShell" component={DashboardScreen} />
                <Stack.Screen name="AiAssistant" component={AiAssistantScreen} />
              </>
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
