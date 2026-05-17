import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../../lib/supabase';
import type { AuthStackNavigationProp, AuthStackRouteProp } from '../../navigation/types';

export default function OTPVerificationScreen() {
  const navigation = useNavigation<AuthStackNavigationProp<'OTPVerification'>>();
  const route = useRoute<any>();
  const { phone, role } = route.params;

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState<number>(60);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Timer logic for Resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  // Auto-submit when all 6 digits are filled
  useEffect(() => {
    const otpString = otp.join('');
    if (otpString.length === 6 && !isLoading) {
      verifyOTP(otpString);
    }
  }, [otp]);

  const verifyOTP = async (token: string) => {
    Keyboard.dismiss();
    setIsLoading(true);
    setErrorMessage('');

    try {
      // 1. Save Role to SecureStore FIRST so App.tsx reads it correctly
      await SecureStore.setItemAsync('user_role', role || 'customer');

      // 2. Verify OTP with Supabase Auth
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: token,
        type: 'sms',
      });

      if (error) {
        throw error;
      }

      // Once verified, Supabase session updates and triggers App.tsx to switch stacks automatically.
    } catch (error: any) {
      console.error('OTP Verification Error:', error);
      setErrorMessage('Galat code — dobara try karein / Invalid code — try again');
      // Clear OTP input on error
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;

    Keyboard.dismiss();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone,
      });

      if (error) {
        throw error;
      }

      setTimer(60);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred while resending the code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];

    // Handle pasting a full code
    if (text.length > 1) {
      const pastedCode = text.replace(/\D/g, '').split('').slice(0, 6);
      pastedCode.forEach((char, i) => {
        if (index + i < 6) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);

      // Focus the last filled box or next empty box
      const nextFocusIndex = Math.min(index + pastedCode.length, 5);
      inputRefs.current[nextFocusIndex]?.focus();
      return;
    }

    // Normal digit entry
    const cleanedText = text.replace(/\D/g, '');
    newOtp[index] = cleanedText;
    setOtp(newOtp);

    // Auto-advance focus
    if (cleanedText !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Backspace on empty box reverts focus to previous box
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Verify Your Number</Text>
            <Text style={styles.subtitle}>
              Code successfully sent to <Text style={styles.phoneHighlight}>{phone}</Text>
            </Text>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                style={[
                  styles.otpInput,
                  digit ? styles.otpInputFilled : null,
                  errorMessage ? styles.otpInputError : null,
                ]}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={6} // Allow pasting up to 6 characters
                editable={!isLoading}
                selectTextOnFocus
              />
            ))}
          </View>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.loadingText}>Verifying code...</Text>
            </View>
          )}

          <View style={styles.resendContainer}>
            <Text style={styles.resendPrompt}>Didn't receive the code? </Text>
            <TouchableOpacity
              onPress={handleResendOTP}
              disabled={timer > 0 || isLoading}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.resendText,
                  timer > 0 ? styles.resendTextDisabled : null,
                ]}
              >
                {timer > 0 ? `Resend OTP (${timer}s)` : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  innerContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    marginBottom: 40,
    width: '100%',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  phoneHighlight: {
    fontWeight: '600',
    color: '#111827',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: '#111827',
  },
  otpInputFilled: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  otpInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#4B5563',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  resendPrompt: {
    fontSize: 15,
    color: '#6B7280',
  },
  resendText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563EB',
  },
  resendTextDisabled: {
    color: '#9CA3AF',
  },
});
