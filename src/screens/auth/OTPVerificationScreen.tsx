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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [timer]);

  useEffect(() => {
    const otpString = otp.join('');
    if (otpString.length === 6 && !isLoading) verifyOTP(otpString);
  }, [otp]);

  const verifyOTP = async (token: string) => {
    Keyboard.dismiss();
    setIsLoading(true);
    setErrorMessage('');
    try {
      await SecureStore.setItemAsync('user_role', role || 'customer');
      const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
      if (error) throw error;
      if (data.session?.user && role !== 'technician') {
        await supabase.from('users').upsert({
          id: data.session.user.id,
          phone: data.session.user.phone,
        }, { onConflict: 'id' });
      }
    } catch (error: any) {
      console.error('OTP Verification Error:', error);
      setErrorMessage('Galat code — dobara try karein / Invalid code — try again');
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
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
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred while resending.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    if (text.length > 1) {
      const pastedCode = text.replace(/\D/g, '').split('').slice(0, 6);
      pastedCode.forEach((char, i) => { if (index + i < 6) newOtp[index + i] = char; });
      setOtp(newOtp);
      inputRefs.current[Math.min(index + pastedCode.length, 5)]?.focus();
      return;
    }
    const cleanedText = text.replace(/\D/g, '');
    newOtp[index] = cleanedText;
    setOtp(newOtp);
    if (cleanedText !== '' && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e: any, index: number) => {
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
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              style={styles.iconBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="shield-checkmark" size={24} color="#FFF" />
            </LinearGradient>
            <Text style={styles.title}>Verify Your Number</Text>
            <Text style={styles.subtitle}>
              Code sent to <Text style={styles.phoneHighlight}>{phone}</Text>
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
                maxLength={6}
                editable={!isLoading}
                selectTextOnFocus
              />
            ))}
          </View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366F1" />
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
              <Text style={[styles.resendText, timer > 0 ? styles.resendTextDisabled : null]}>
                {timer > 0 ? `Resend (${timer}s)` : 'Resend OTP'}
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
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 48 : 16,
    left: 24,
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerContainer: {
    marginBottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
    textAlign: 'center',
  },
  phoneHighlight: {
    fontWeight: '700',
    color: '#6366F1',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 24,
    gap: 10,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#0F172A',
  },
  otpInputFilled: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  otpInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
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
    color: '#64748B',
    fontWeight: '500',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  resendPrompt: {
    fontSize: 14,
    color: '#64748B',
  },
  resendText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6366F1',
  },
  resendTextDisabled: {
    color: '#94A3B8',
  },
});
