import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  DeviceEventEmitter,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import * as Location from 'expo-location';

export default function UserProfileSetupScreen() {
  const [name, setName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchLiveLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        setIsLocating(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({ lat: location.coords.latitude, lng: location.coords.longitude });

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode && reverseGeocode.length > 0) {
        const place = reverseGeocode[0];
        const parts = [place.name, place.street, place.district, place.city, place.subregion]
          .filter(Boolean)
          .filter((v, i, a) => a.indexOf(v) === i);
        const formattedAddress = parts.join(', ');
        setLocationName(formattedAddress.replace(/^, /, '').trim() || 'Location detected');
      } else {
        setLocationName('Coordinates fetched (No address found)');
      }
    } catch (error) {
      console.warn('Error fetching location:', error);
      alert('Could not fetch location. Please ensure GPS is enabled.');
    } finally {
      setIsLocating(false);
    }
  };

  const completeProfile = async () => {
    if (!name.trim()) { alert('Please enter your full name'); return; }
    if (!locationName.trim()) { alert('Please detect or enter your location'); return; }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: name.trim(),
          location: locationName.trim(),
          location_lat: coords?.lat || null,
          location_lng: coords?.lng || null,
        }
      });
      if (authError) throw authError;

      const { error: dbError } = await supabase
        .from('users')
        .update({ name: name.trim() })
        .eq('id', user.id);
      if (dbError) throw dbError;

      DeviceEventEmitter.emit('profile_completed');
    } catch (error) {
      console.error("Error saving profile:", error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              style={styles.iconBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="person" size={28} color="#FFF" />
            </LinearGradient>
            <Text style={styles.title}>Almost there!</Text>
            <Text style={styles.subtitle}>Tell us your name and where you are located.</Text>
          </View>

          {/* Name Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#94A3B8" style={{ marginRight: 12 }} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Saad Shahid"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          {/* Location Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Live Location</Text>
            <View style={styles.locationRow}>
              <View style={[styles.inputWrapper, { flex: 1, marginRight: 12 }]}>
                <Ionicons name="location-outline" size={20} color="#94A3B8" style={{ marginRight: 12 }} />
                <TextInput
                  style={styles.input}
                  placeholder="Tap to detect..."
                  placeholderTextColor="#94A3B8"
                  value={locationName}
                  onChangeText={setLocationName}
                />
              </View>
              <TouchableOpacity
                onPress={fetchLiveLocation}
                disabled={isLocating}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  style={styles.locateBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {isLocating ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name="navigate" size={22} color="#FFFFFF" />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <Text style={styles.helpText}>
              <Ionicons name="information-circle-outline" size={13} color="#94A3B8" />
              {'  '}We need your location to find providers near you.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={completeProfile}
            disabled={isSaving}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              style={styles.nextButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.nextButtonText}>Let's Go!</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    padding: 24,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locateBtn: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpText: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 10,
    fontWeight: '500',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  nextButton: {
    borderRadius: 18,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
