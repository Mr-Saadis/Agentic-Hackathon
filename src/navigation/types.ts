import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

export type AuthStackParamList = {
  Welcome: undefined;
  PhoneInput: { role?: 'customer' | 'technician' } | undefined;
  OTPVerification: { phone: string; role?: 'customer' | 'technician' };
  LanguageSelection: undefined;
  Consent: undefined;
  HomeShell: undefined;
};

export type AuthStackNavigationProp<T extends keyof AuthStackParamList> = 
  NativeStackNavigationProp<AuthStackParamList, T>;

export type AuthStackRouteProp<T extends keyof AuthStackParamList> = 
  RouteProp<AuthStackParamList, T>;
