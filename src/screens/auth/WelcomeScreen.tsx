import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import type { AuthStackNavigationProp } from '../../navigation/types';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const navigation = useNavigation<AuthStackNavigationProp<'Welcome'>>();

  const handleRoleSelection = (role: 'customer' | 'technician') => {
    navigation.navigate('PhoneInput', { role });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Logo & Branding */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            style={styles.logoBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="flash" size={28} color="#FFF" />
          </LinearGradient>
          <Text style={styles.logoText}>ServeIQ</Text>
          <Text style={styles.tagline}>Smart services at your fingertips</Text>
        </View>

        {/* Role Selection Cards */}
        <View style={styles.cardsContainer}>
          {/* Customer Card */}
          <TouchableOpacity
            style={styles.roleCard}
            activeOpacity={0.85}
            onPress={() => handleRoleSelection('customer')}
          >
            <LinearGradient
              colors={['#EEF2FF', '#E0E7FF']}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardTop}>
                <View style={[styles.iconWrap, { backgroundColor: '#6366F1' }]}>
                  <Ionicons name="search" size={24} color="#FFF" />
                </View>
                <View style={styles.arrowWrap}>
                  <Ionicons name="arrow-forward" size={18} color="#6366F1" />
                </View>
              </View>
              <Text style={[styles.cardTitle, { color: '#312E81' }]}>I need a service</Text>
              <Text style={styles.cardDesc}>
                Find trusted plumbers, electricians & more near you in seconds.
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Technician Card */}
          <TouchableOpacity
            style={styles.roleCard}
            activeOpacity={0.85}
            onPress={() => handleRoleSelection('technician')}
          >
            <LinearGradient
              colors={['#ECFDF5', '#D1FAE5']}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardTop}>
                <View style={[styles.iconWrap, { backgroundColor: '#10B981' }]}>
                  <Ionicons name="briefcase" size={24} color="#FFF" />
                </View>
                <View style={styles.arrowWrap}>
                  <Ionicons name="arrow-forward" size={18} color="#10B981" />
                </View>
              </View>
              <Text style={[styles.cardTitle, { color: '#064E3B' }]}>I provide services</Text>
              <Text style={styles.cardDesc}>
                Join as a verified technician, get jobs & earn on your schedule.
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>By continuing, you agree to our Terms of Service</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
    marginTop: Platform.OS === 'android' ? 24 : 0,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 38,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -1,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  cardsContainer: {
    gap: 18,
  },
  roleCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  cardGradient: {
    padding: 24,
    borderRadius: 24,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 21,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
