import React, { useState } from 'react';
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
import { supabase } from '../../lib/supabase';
import type { AuthStackNavigationProp } from '../../navigation/types';

export default function PhoneInputScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigation = useNavigation<AuthStackNavigationProp<'PhoneInput'>>();
  const route = useRoute<any>();
  const role = route.params?.role || 'customer';

  const handlePhoneChange = (text: string) => {
    setErrorMessage('');
    let cleaned = text.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
    if (cleaned.length > 10) cleaned = cleaned.substring(0, 10);
    setPhoneNumber(cleaned);
  };

  const formatDisplayNumber = (number: string) => {
    if (number.length === 0) return '';
    if (number.length <= 3) return number;
    return `${number.slice(0, 3)} ${number.slice(3)}`;
  };

  const handleSendOTP = async () => {
    if (phoneNumber.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    Keyboard.dismiss();
    setIsLoading(true);
    setErrorMessage('');
    const formattedE164Phone = `+92${phoneNumber}`;
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: formattedE164Phone });
      if (error) throw error;
      navigation.navigate('OTPVerification', { phone: formattedE164Phone, role });
    } catch (error: any) {
      setErrorMessage(error.message || 'An network or unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          {/* Back Button */}
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
              <Ionicons name="call" size={24} color="#FFF" />
            </LinearGradient>
            <Text style={styles.title}>Enter your number</Text>
            <Text style={styles.subtitle}>
              We'll send a verification code to log you in securely.
            </Text>
          </View>

          <View style={styles.inputSection}>
            <View
              style={[
                styles.inputWrapper,
                errorMessage ? styles.inputWrapperError : null,
              ]}
            >
              <View style={styles.prefixContainer}>
                <Text style={styles.flagIcon}>🇵🇰</Text>
                <Text style={styles.prefixText}>+92</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="300 1234567"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={formatDisplayNumber(phoneNumber)}
                onChangeText={handlePhoneChange}
                maxLength={11}
                editable={!isLoading}
                returnKeyType="done"
                onSubmitEditing={handleSendOTP}
              />
            </View>
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              phoneNumber.length !== 10 ? styles.buttonDisabled : null,
            ]}
            onPress={handleSendOTP}
            disabled={isLoading || phoneNumber.length !== 10}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Send OTP</Text>
            )}
          </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: 40,
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
    paddingHorizontal: 16,
  },
  inputSection: {
    marginBottom: 32,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    height: 60,
    paddingHorizontal: 16,
  },
  inputWrapperError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  prefixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    paddingRight: 12,
  },
  flagIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  prefixText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    color: '#0F172A',
    fontWeight: '600',
    height: '100%',
    letterSpacing: 1,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 10,
    fontWeight: '600',
  },
  button: {
    height: 58,
    backgroundColor: '#6366F1',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
