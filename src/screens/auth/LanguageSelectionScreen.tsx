import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { AuthStackNavigationProp } from '../../navigation/types';

type LanguageType = 'ur' | 'en' | 'auto';

interface LanguageOption {
  id: LanguageType;
  title: string;
  subtitle: string;
  icon: string;
  bg: string;
  accent: string;
}

const LANGUAGES: LanguageOption[] = [
  { id: 'ur', title: 'اردو', subtitle: 'Urdu', icon: 'language', bg: '#FEF3C7', accent: '#F59E0B' },
  { id: 'en', title: 'English', subtitle: 'English', icon: 'globe', bg: '#EEF2FF', accent: '#6366F1' },
  { id: 'auto', title: 'Auto-Detect', subtitle: 'We\'ll figure it out', icon: 'sparkles', bg: '#ECFDF5', accent: '#10B981' },
];

export default function LanguageSelectionScreen() {
  const [selectedLang, setSelectedLang] = useState<LanguageType>('auto');
  const navigation = useNavigation<AuthStackNavigationProp<'LanguageSelection'>>();

  const handleNext = () => {
    (navigation.navigate as any)('Consent', { preferredLanguage: selectedLang });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            style={styles.iconBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="language" size={24} color="#FFF" />
          </LinearGradient>
          <Text style={styles.title}>Choose Language</Text>
          <Text style={styles.subtitle}>
            Aap kis zaban mein app istemal karna chahte hain?
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLang === lang.id;
            return (
              <TouchableOpacity
                key={lang.id}
                style={[
                  styles.card,
                  { backgroundColor: isSelected ? lang.bg : '#F8FAFC' },
                  isSelected && { borderColor: lang.accent },
                ]}
                onPress={() => setSelectedLang(lang.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.langIcon, { backgroundColor: isSelected ? lang.accent + '22' : '#F1F5F9' }]}>
                  <Ionicons name={lang.icon as any} size={22} color={isSelected ? lang.accent : '#94A3B8'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, isSelected && { color: lang.accent }]}>
                    {lang.title}
                  </Text>
                  <Text style={[styles.cardSubtitle, isSelected && { color: lang.accent }]}>
                    {lang.subtitle}
                  </Text>
                </View>
                {isSelected && (
                  <View style={[styles.checkCircle, { backgroundColor: lang.accent }]}>
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
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
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  cardsContainer: {
    marginBottom: 40,
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 18,
  },
  langIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
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
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
