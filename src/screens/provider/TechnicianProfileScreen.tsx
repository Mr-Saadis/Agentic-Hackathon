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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';

const SKILL_CATALOG = ['AC Repair', 'Plumbing', 'Electrical', 'Home Appliances', 'Carpentry', 'Cleaning'];
const COMPLEXITY_LEVELS = [
  { id: 'Basic', icon: 'school-outline', color: '#0EA5E9' },
  { id: 'Intermediate', icon: 'construct-outline', color: '#F59E0B' },
  { id: 'Expert', icon: 'trophy-outline', color: '#10B981' },
];

export default function TechnicianProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const cnicData = route.params?.cnicData;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Fetching live location...');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [complexity, setComplexity] = useState<string | null>(null);
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(prev => prev.filter(s => s !== skill));
    } else {
      setSelectedSkills(prev => [...prev, skill]);
      setSuggestedSkills(prev => prev.filter(s => s !== skill));
    }
  };

  const fetchAiSkillSuggestions = async () => {
    if (selectedSkills.length === 0) { alert("Select at least one skill first."); return; }
    setIsSuggesting(true);
    try {
      const prompt = `The user has selected these broad skills: ${selectedSkills.join(', ')}. Recommend 4 to 6 specific, practical sub-skills, tool names, or appliance types they might also know to make their profile look expert. 
CRITICAL: Return ONLY a valid JSON array of strings. Do not include any introductory text, markdown formatting, or anything else. Example: ["Pipe Fitting", "Inverter ACs"]`;

      const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 100 }
        })
      });
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        let cleanText = rawText.trim().replace(/```json/g, '').replace(/```/g, '').trim();
        const suggestions = JSON.parse(cleanText);
        if (Array.isArray(suggestions)) {
          setSuggestedSkills(suggestions.filter(s => !selectedSkills.includes(s)));
        }
      }
    } catch (error) {
      console.warn("Failed to fetch AI suggestions:", error);
      alert("Could not fetch suggestions. Check internet.");
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleNext = () => {
    if (!name || selectedSkills.length === 0 || !complexity || !description) {
      alert('Please fill all fields.'); return;
    }
    navigation.navigate('TechnicianVetting', {
      profileData: { name, location, skills: selectedSkills, claimed_complexity: complexity, description, cnicData }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.iconBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="build" size={26} color="#FFF" />
          </LinearGradient>
          <Text style={styles.title}>Build Your Profile</Text>
          <Text style={styles.subtitle}>Set up your skills so our AI can find you the best jobs.</Text>
        </View>

        {/* Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#94A3B8" style={{ marginRight: 12 }} />
            <TextInput style={styles.input} placeholder="Ali Raza" placeholderTextColor="#94A3B8" value={name} onChangeText={setName} />
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <Text style={styles.hintText}>Describe your experience. AI will ask questions based on this.</Text>
          <View style={[styles.inputWrapper, { alignItems: 'flex-start', minHeight: 90 }]}>
            <Ionicons name="document-text-outline" size={20} color="#94A3B8" style={{ marginRight: 12, marginTop: 2 }} />
            <TextInput
              style={[styles.input, { textAlignVertical: 'top', paddingTop: 0 }]}
              placeholder="e.g. 5 years AC repair experience..."
              placeholderTextColor="#94A3B8"
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live Location</Text>
          <View style={styles.locationBox}>
            <Ionicons name="location" size={22} color="#6366F1" />
            <Text style={styles.locationText}>{location}</Text>
          </View>
        </View>

        {/* Skills */}
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
                  activeOpacity={0.75}
                >
                  {isSelected && <Ionicons name="checkmark" size={14} color="#10B981" style={{ marginRight: 4 }} />}
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{skill}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedSkills.length > 0 && (
            <TouchableOpacity style={styles.aiSuggestButton} onPress={fetchAiSkillSuggestions} disabled={isSuggesting}>
              {isSuggesting ? (
                <ActivityIndicator size="small" color="#6366F1" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={18} color="#6366F1" />
                  <Text style={styles.aiSuggestButtonText}>Auto-Suggest Skills</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {suggestedSkills.length > 0 && (
            <View style={styles.suggestedContainer}>
              <Text style={styles.suggestedTitle}>✨ AI Suggestions:</Text>
              <View style={styles.chipsContainer}>
                {suggestedSkills.map((skill) => (
                  <TouchableOpacity key={skill} style={styles.chipSuggested} onPress={() => toggleSkill(skill)}>
                    <Ionicons name="add" size={14} color="#6366F1" style={{ marginRight: 4 }} />
                    <Text style={styles.chipTextSuggested}>{skill}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Complexity Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience Level</Text>
          <Text style={styles.hintText}>Be honest! Our AI will verify your knowledge.</Text>
          <View style={styles.levelRow}>
            {COMPLEXITY_LEVELS.map((level) => {
              const isSelected = complexity === level.id;
              return (
                <TouchableOpacity
                  key={level.id}
                  style={[styles.levelCard, isSelected && { borderColor: level.color, backgroundColor: level.color + '12' }]}
                  onPress={() => setComplexity(level.id)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.levelIcon, { backgroundColor: isSelected ? level.color + '22' : '#F1F5F9' }]}>
                    <Ionicons name={level.icon as any} size={22} color={isSelected ? level.color : '#94A3B8'} />
                  </View>
                  <Text style={[styles.levelLabel, isSelected && { color: level.color, fontWeight: '800' }]}>{level.id}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleNext} activeOpacity={0.85}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.nextButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.nextButtonText}>Start Verification Interview</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: 'center', marginTop: 14 }} onPress={() => navigation.navigate('ProviderDashboard')}>
          <Text style={{ color: '#94A3B8', fontWeight: '500', fontSize: 13 }}>Skip for now (Dev Testing)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { padding: 24, paddingTop: Platform.OS === 'android' ? 48 : 20, paddingBottom: 120 },
  header: { alignItems: 'center', marginBottom: 36 },
  iconBadge: { width: 64, height: 64, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22, paddingHorizontal: 16 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 10 },
  hintText: { fontSize: 13, color: '#F59E0B', marginBottom: 10, fontWeight: '600' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC',
    borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 18, paddingHorizontal: 16, height: 56,
  },
  input: { flex: 1, fontSize: 16, color: '#0F172A', fontWeight: '500' },
  locationBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF',
    borderWidth: 1, borderColor: '#C7D2FE', borderRadius: 18, padding: 16, gap: 12,
  },
  locationText: { fontSize: 15, color: '#4338CA', fontWeight: '600' },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14,
  },
  chipSelected: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  chipText: { fontSize: 14, color: '#475569', fontWeight: '600' },
  chipTextSelected: { color: '#059669', fontWeight: '700' },
  levelRow: { flexDirection: 'row', gap: 12 },
  levelCard: {
    flex: 1, alignItems: 'center', paddingVertical: 18,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC',
  },
  levelIcon: { width: 44, height: 44, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  levelLabel: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 24, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  nextButton: { borderRadius: 18, height: 58, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  nextButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  aiSuggestButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#EEF2FF', paddingVertical: 12, borderRadius: 14, marginTop: 16,
    borderWidth: 1, borderColor: '#C7D2FE', gap: 8,
  },
  aiSuggestButtonText: { color: '#4338CA', fontWeight: '700', fontSize: 14 },
  suggestedContainer: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  suggestedTitle: { fontSize: 14, fontWeight: '700', color: '#6366F1', marginBottom: 12 },
  chipSuggested: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, borderStyle: 'dashed',
  },
  chipTextSuggested: { fontSize: 13, color: '#6366F1', fontWeight: '600' },
});
