import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { AuthStackNavigationProp } from '../../navigation/types';

type LanguageType = 'ur' | 'en' | 'auto';

interface LanguageOption {
  id: LanguageType;
  title: string;
  subtitle: string;
}

const LANGUAGES: LanguageOption[] = [
  { id: 'ur', title: 'اردو', subtitle: 'Urdu' },
  { id: 'en', title: 'English', subtitle: 'English' },
  { id: 'auto', title: 'Auto-Detect', subtitle: 'Detect from input' },
];

export default function LanguageSelectionScreen() {
  const [selectedLang, setSelectedLang] = useState<LanguageType>('auto');
  const navigation = useNavigation<AuthStackNavigationProp<'LanguageSelection'>>();

  const handleNext = () => {
    // Navigate to Consent screen and pass the language preference as a parameter
    // Casting navigation to any here to pass params since we strictly aren't mutating types.ts
    (navigation.navigate as any)('Consent', { preferredLanguage: selectedLang });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.header}>
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
                  isSelected ? styles.cardSelected : null,
                ]}
                onPress={() => setSelectedLang(lang.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.cardTitle,
                    isSelected ? styles.textSelected : null,
                  ]}
                >
                  {lang.title}
                </Text>
                <Text
                  style={[
                    styles.cardSubtitle,
                    isSelected ? styles.textSelected : null,
                  ]}
                >
                  {lang.subtitle}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.8}>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  cardsContainer: {
    marginBottom: 40,
    gap: 16,
  },
  card: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  cardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  textSelected: {
    color: '#2563EB',
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
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
