import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const SKILL_CATALOG = ['AC Repair', 'Plumbing', 'Electrical', 'Home Appliances', 'Carpentry', 'Cleaning'];
const COMPLEXITY_LEVELS = ['Basic', 'Intermediate', 'Expert'];

export default function TechnicianProfileScreen() {
  const navigation = useNavigation<any>();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('Fetching live location...');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [complexity, setComplexity] = useState<string | null>(null);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(prev => prev.filter(s => s !== skill));
    } else {
      setSelectedSkills(prev => [...prev, skill]);
    }
  };

  const handleNext = () => {
    if (!name || selectedSkills.length === 0 || !complexity) {
      alert('Please fill out your name, select at least one skill, and your level.');
      return;
    }
    // Navigate to the AI Vetting Agent
    navigation.navigate('TechnicianVetting', {
      profileData: {
        name,
        location,
        skills: selectedSkills,
        claimed_complexity: complexity
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Build Your Profile</Text>
          <Text style={styles.subtitle}>Set up your skills so our system can find you the best jobs.</Text>
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Ali Raza"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Location Simulation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live Location</Text>
          <View style={styles.locationBox}>
            <Ionicons name="location" size={24} color="#2563EB" />
            <Text style={styles.locationText}>{location}</Text>
          </View>
        </View>

        {/* Skills Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Your Skills</Text>
          <View style={styles.chipsContainer}>
            {SKILL_CATALOG.map((skill) => {
              const isSelected = selectedSkills.includes(skill);
              return (
                <TouchableOpacity
                  key={skill}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => toggleSkill(skill)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {skill}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Complexity Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience Level</Text>
          <Text style={styles.hintText}>Be honest! Our AI will verify your knowledge.</Text>
          <View style={styles.chipsContainer}>
            {COMPLEXITY_LEVELS.map((level) => {
              const isSelected = complexity === level;
              return (
                <TouchableOpacity
                  key={level}
                  style={[styles.chip, isSelected && styles.chipSelectedLevel]}
                  onPress={() => setComplexity(level)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

      </ScrollView>

      {/* Fixed Bottom Action */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Start Verification Interview</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={{ alignItems: 'center', marginTop: 16 }}
          onPress={() => navigation.navigate('ProviderDashboard')}
        >
          <Text style={{ color: '#64748B', fontWeight: '500' }}>Skip for now (Developer Testing)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 24, paddingBottom: 100 },
  header: { marginBottom: 32, marginTop: Platform.OS === 'android' ? 24 : 0 },
  title: { fontSize: 32, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748B', lineHeight: 24 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  hintText: { fontSize: 13, color: '#EF4444', marginBottom: 12, fontStyle: 'italic' },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0F172A'
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 16,
    gap: 12
  },
  locationText: { fontSize: 16, color: '#1D4ED8', fontWeight: '500' },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
  },
  chipSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  chipSelectedLevel: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  chipText: { fontSize: 15, color: '#475569', fontWeight: '500' },
  chipTextSelected: { color: '#0F172A', fontWeight: '700' },
  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 24,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  nextButton: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
