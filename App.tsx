import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens ke paths check kar lijiyega apne folder ke mutabiq
import PhoneInputScreen from './src/screens/auth/PhoneInputScreen';
import OTPVerificationScreen from './src/screens/auth/OTPVerificationScreen';
import LanguageSelectionScreen from './src/screens/auth/LanguageSelectionScreen';
import ConsentScreen from './src/screens/auth/ConsentScreen';
import HomeScreen from './src/screens/main/HomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="PhoneInput" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="PhoneInput" component={PhoneInputScreen} />
        <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
        <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
        <Stack.Screen name="Consent" component={ConsentScreen} />
        <Stack.Screen name="HomeShell" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
