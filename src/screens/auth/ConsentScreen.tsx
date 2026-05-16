import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import type { AuthStackNavigationProp } from '../../navigation/types';

export default function ConsentScreen() {
  const navigation = useNavigation<AuthStackNavigationProp<'Consent'>>();
  const route = useRoute<any>();
  
  // Extract the language passed from the previous screen, default to auto if missing
  const preferredLanguage = route.params?.preferredLanguage || 'auto';

  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Detect when user has scrolled to the bottom of the container
  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleConfirm = async () => {
    if (!isChecked) return;
    setIsLoading(true);

    try {
      // 1. Retrieve the active authenticated session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        throw new Error('Authentication session not found. Please log in again.');
      }

      // 2. Insert the onboarding record into public.users
      // Note: phone is NOT NULL in the schema, so we extract it from session.user
      const { error: insertError } = await supabase.from('users').insert({
        id: session.user.id,
        phone: session.user.phone,
        preferred_language: preferredLanguage,
        pdpa_consent: true,
        pdpa_consent_at: new Date().toISOString(),
      });

      if (insertError) {
        throw insertError;
      }

      // 3. Navigate directly to the main application shell
      navigation.reset({
        index: 0,
        routes: [{ name: 'HomeShell' }],
      });
      
    } catch (error: any) {
      console.error('Consent Record Insert Error:', error);
      Alert.alert('Database Error', error.message || 'Failed to save consent. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    setIsLoading(true);
    // 1. Clear the active Supabase auth session
    await supabase.auth.signOut();
    setIsLoading(false);
    
    // 2. Safely return the user to the PhoneInput screen, clearing stack history
    navigation.reset({
      index: 0,
      routes: [{ name: 'PhoneInput' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Terms & Privacy</Text>
          <Text style={styles.subtitle}>
            Please review the Data Collection Policy (PDPA 2023)
          </Text>
        </View>

        <View style={styles.scrollWrapper}>
          <ScrollView
            style={styles.scrollView}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.policyText}>
              <Text style={styles.policyBold}>Mock Privacy Policy (PDPA 2023 Compliant)</Text>
              {'\n\n'}
              1. Information Collection: We collect your phone number, location data, and interaction history to provide reliable service orchestration.
              {'\n\n'}
              2. Data Usage: Your information is used strictly to match you with service providers and resolve disputes via Google Antigravity.
              {'\n\n'}
              3. Data Retention: Real-time location vectors are permanently purged 7 days post-booking completion. General identifiable information is anonymized upon account deletion.
              {'\n\n'}
              4. Third-Party Sharing: Your data is never sold. It is only shared securely with assigned service providers strictly for the duration of the active job.
              {'\n\n'}
              5. Dispute Resolution: Call logs and interaction traces are maintained temporarily to ensure a fair resolution process.
              {'\n\n'}
              <Text style={styles.policyInstruction}>[Scroll to bottom to agree to these terms...]</Text>
              {'\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n'}
              --- End of Policy Document ---
            </Text>
          </ScrollView>
        </View>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => {
            if (hasScrolledToBottom) setIsChecked(!isChecked);
          }}
          activeOpacity={hasScrolledToBottom ? 0.7 : 1}
        >
          <View
            style={[
              styles.checkbox,
              !hasScrolledToBottom ? styles.checkboxDisabled : null,
              isChecked ? styles.checkboxChecked : null,
            ]}
          >
            {isChecked && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text
            style={[
              styles.checkboxLabel,
              !hasScrolledToBottom ? styles.textDisabled : null,
            ]}
          >
            Main ServeIQ ki data collection policy se mutafiq hoon
          </Text>
        </TouchableOpacity>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.declineButton}
            onPress={handleDecline}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Text style={styles.declineText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              (!isChecked || isLoading) ? styles.confirmButtonDisabled : null,
            ]}
            onPress={handleConfirm}
            disabled={!isChecked || isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.confirmText}>Aage Barho</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
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
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  scrollWrapper: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 24,
    overflow: 'hidden',
  },
  scrollView: {
    padding: 16,
  },
  policyText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
  },
  policyBold: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#111827',
  },
  policyInstruction: {
    fontStyle: 'italic',
    color: '#9CA3AF',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    paddingRight: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxDisabled: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
  },
  checkboxChecked: {
    borderColor: '#2563EB',
    backgroundColor: '#2563EB',
  },
  checkmark: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
    lineHeight: 20,
    fontWeight: '500',
  },
  textDisabled: {
    color: '#9CA3AF',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  declineButton: {
    flex: 1,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  declineText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 2,
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
  confirmButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
