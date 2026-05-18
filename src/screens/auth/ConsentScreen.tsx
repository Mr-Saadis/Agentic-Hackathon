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
  DeviceEventEmitter,
  Platform,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import type { AuthStackNavigationProp } from '../../navigation/types';

export default function ConsentScreen() {
  const navigation = useNavigation<AuthStackNavigationProp<'Consent'>>();
  const route = useRoute<any>();
  const preferredLanguage = route.params?.preferredLanguage || 'auto';

  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20) {
      setHasScrolledToBottom(true);
    }
  };

  const handleConfirm = async () => {
    if (!isChecked) return;
    setIsLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) throw new Error('Session not found. Please log in again.');

      const { error: insertError } = await supabase.from('users').upsert({
        id: session.user.id,
        phone: session.user.phone,
        preferred_language: preferredLanguage,
        pdpa_consent: true,
        pdpa_consent_at: new Date().toISOString(),
      }, { onConflict: 'id' });
      if (insertError) throw insertError;

      await supabase.auth.updateUser({ data: { preferred_language: preferredLanguage } });
      await SecureStore.setItemAsync('has_consented', 'true');
      DeviceEventEmitter.emit('consent_granted');
    } catch (error: any) {
      console.error('Consent Error:', error);
      Alert.alert('Error', error.message || 'Failed to save. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setIsLoading(false);
    navigation.reset({ index: 0, routes: [{ name: 'PhoneInput' }] });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            style={styles.iconBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="shield-checkmark" size={24} color="#FFF" />
          </LinearGradient>
          <Text style={styles.title}>Terms & Privacy</Text>
          <Text style={styles.subtitle}>
            Review our Data Collection Policy (PDPA 2023)
          </Text>
        </View>

        {/* Scrollable Policy */}
        <View style={styles.scrollWrapper}>
          <ScrollView
            style={styles.scrollView}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.policyText}>
              <Text style={styles.policyBold}>Privacy Policy (PDPA 2023 Compliant)</Text>
              {'\n\n'}
              1. Information Collection: We collect your phone number, location data, and interaction history to provide reliable service orchestration.
              {'\n\n'}
              2. Data Usage: Your information is used strictly to match you with service providers and resolve disputes.
              {'\n\n'}
              3. Data Retention: Location vectors are purged 7 days post-booking. Identifiable information is anonymized upon deletion.
              {'\n\n'}
              4. Third-Party Sharing: Your data is never sold. It is shared only with assigned providers for the active job.
              {'\n\n'}
              5. Dispute Resolution: Call logs are maintained temporarily for fair resolution.
              {'\n\n'}
              <Text style={styles.policyInstruction}>[Scroll to bottom to agree...]</Text>
              {'\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n'}
              — End of Policy Document —
            </Text>
          </ScrollView>
        </View>

        {/* Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => { if (hasScrolledToBottom) setIsChecked(!isChecked); }}
          activeOpacity={hasScrolledToBottom ? 0.7 : 1}
        >
          <View style={[
            styles.checkbox,
            !hasScrolledToBottom && styles.checkboxDisabled,
            isChecked && styles.checkboxChecked,
          ]}>
            {isChecked && <Ionicons name="checkmark" size={16} color="#FFF" />}
          </View>
          <Text style={[styles.checkboxLabel, !hasScrolledToBottom && styles.textDisabled]}>
            Main ServeIQ ki data collection policy se mutafiq hoon
          </Text>
        </TouchableOpacity>

        {/* Action Buttons */}
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
            style={[styles.confirmButton, (!isChecked || isLoading) && styles.confirmButtonDisabled]}
            onPress={handleConfirm}
            disabled={!isChecked || isLoading}
            activeOpacity={0.85}
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
    paddingTop: Platform.OS === 'android' ? 44 : 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  scrollWrapper: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    marginBottom: 20,
    overflow: 'hidden',
  },
  scrollView: {
    padding: 18,
  },
  policyText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  policyBold: {
    fontWeight: '800',
    fontSize: 15,
    color: '#0F172A',
  },
  policyInstruction: {
    fontStyle: 'italic',
    color: '#94A3B8',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingRight: 24,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxDisabled: {
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  checkboxChecked: {
    borderColor: '#6366F1',
    backgroundColor: '#6366F1',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#0F172A',
    flex: 1,
    lineHeight: 20,
    fontWeight: '600',
  },
  textDisabled: {
    color: '#94A3B8',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },
  declineButton: {
    flex: 1,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  declineText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '700',
  },
  confirmButton: {
    flex: 2,
    height: 56,
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
  confirmButtonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
