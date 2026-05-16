import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

export type AuthStackParamList = {
  PhoneInput: undefined;
  OTPVerification: { phone: string };
  LanguageSelection: undefined;
  Consent: undefined;
  HomeShell: undefined;
};

export type AuthStackNavigationProp<T extends keyof AuthStackParamList> = 
  NativeStackNavigationProp<AuthStackParamList, T>;

export type AuthStackRouteProp<T extends keyof AuthStackParamList> = 
  RouteProp<AuthStackParamList, T>;
