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
    // Clear any previous error message when the user types
    setErrorMessage('');
    
    // Strip out all non-digit characters
    let cleaned = text.replace(/\D/g, '');
    
    // Auto-format: if the user types a leading 0 (e.g., '0300...'), strip it out
    // because the +92 prefix implies we don't need the local zero.
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    // Pakistani mobile numbers have exactly 10 digits after the 0
    if (cleaned.length > 10) {
      cleaned = cleaned.substring(0, 10);
    }

    setPhoneNumber(cleaned);
  };

  // Dynamically format the display. E.g., '3001234567' -> '300 1234567'
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

    // E.164 compliant phone number format for Supabase Auth
    const formattedE164Phone = `+92${phoneNumber}`;

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedE164Phone,
      });

      if (error) {
        throw error;
      }

      // Automatically navigate to OTP verification, passing the phone and role as parameters
      navigation.navigate('OTPVerification', { phone: formattedE164Phone, role });
    } catch (error: any) {
      let message = 'An network or unexpected error occurred. Please try again.';
      if (error.message) {
        message = error.message;
      }
      setErrorMessage(message);
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
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Welcome to ServeIQ</Text>
            <Text style={styles.subtitle}>
              Enter your mobile number to log in or register.
            </Text>
          </View>

          <View style={styles.inputSection}>
            <View
              style={[
                styles.inputWrapper,
                errorMessage ? styles.inputWrapperError : null,
              ]}
            >
              {/* Prefix Indicator */}
              <View style={styles.prefixContainer}>
                <Text style={styles.flagIcon}>🇵🇰</Text>
                <Text style={styles.prefixText}>+92</Text>
              </View>
              
              {/* Phone Input Field */}
              <TextInput
                style={styles.textInput}
                placeholder="300 1234567"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={formatDisplayNumber(phoneNumber)}
                onChangeText={handlePhoneChange}
                maxLength={11} // "300 1234567" is 11 chars
                editable={!isLoading}
                returnKeyType="done"
                onSubmitEditing={handleSendOTP}
              />
            </View>
            
            {/* Error Message Display */}
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[
              styles.button,
              phoneNumber.length !== 10 ? styles.buttonDisabled : null,
            ]}
            onPress={handleSendOTP}
            disabled={isLoading || phoneNumber.length !== 10}
            activeOpacity={0.8}
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
  headerContainer: {
    marginBottom: 40,
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
  inputSection: {
    marginBottom: 32,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    height: 56,
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
    borderRightColor: '#E5E7EB',
    paddingRight: 12,
  },
  flagIcon: {
    fontSize: 20,
    marginRight: 4,
  },
  prefixText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    color: '#111827',
    fontWeight: '500',
    height: '100%',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  button: {
    height: 56,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
