import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { AuthStackNavigationProp } from '../../navigation/types';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const navigation = useNavigation<AuthStackNavigationProp<'Welcome'>>();

  const handleRoleSelection = (role: 'customer' | 'technician') => {
    // Navigate to PhoneInput and pass the selected role
    navigation.navigate('PhoneInput', { role });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logoText}>ServeIQ</Text>
          <Text style={styles.subtitle}>Choose your journey to get started</Text>
        </View>

        <View style={styles.cardsContainer}>
          {/* Customer Card */}
          <TouchableOpacity 
            style={[styles.roleCard, styles.customerCard]} 
            activeOpacity={0.8}
            onPress={() => handleRoleSelection('customer')}
          >
            <View style={styles.iconContainerCustomer}>
              <Ionicons name="search" size={32} color="#2563EB" />
            </View>
            <Text style={styles.cardTitle}>I need a service</Text>
            <Text style={styles.cardDescription}>
              Find trusted plumbers, electricians, AC technicians, and more in seconds.
            </Text>
            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-forward" size={20} color="#2563EB" />
            </View>
          </TouchableOpacity>

          {/* Technician Card */}
          <TouchableOpacity 
            style={[styles.roleCard, styles.technicianCard]} 
            activeOpacity={0.8}
            onPress={() => handleRoleSelection('technician')}
          >
            <View style={styles.iconContainerTechnician}>
              <Ionicons name="briefcase" size={32} color="#10B981" />
            </View>
            <Text style={styles.cardTitle}>I provide services</Text>
            <Text style={styles.cardDescription}>
              Join as a verified technician, get steady jobs, and earn more on your own schedule.
            </Text>
            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-forward" size={20} color="#10B981" />
            </View>
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
    backgroundColor: '#F8FAFC',
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
  logoText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -1,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  cardsContainer: {
    gap: 20,
  },
  roleCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
  },
  customerCard: {
    shadowColor: '#2563EB',
    borderColor: '#EFF6FF',
  },
  technicianCard: {
    shadowColor: '#10B981',
    borderColor: '#ECFDF5',
  },
  iconContainerCustomer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainerTechnician: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 16,
  },
  arrowContainer: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
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
