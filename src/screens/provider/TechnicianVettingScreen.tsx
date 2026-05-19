import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
  Keyboard,
  DeviceEventEmitter,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import * as SecureStore from 'expo-secure-store';

interface Message {
  id: string;
  text: string;
  role: 'user' | 'assistant';
  options?: string[];
  type?: 'mcq' | 'text';
  rawJson?: string; // Store the full AI JSON response to send back to Gemini
}

export default function TechnicianVettingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { profileData } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [language, setLanguage] = useState<string | null>(null);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const flatListRef = useRef<FlatList>(null);

  const getSystemInstruction = (lang: string) => `You are ServeIQ's expert technical recruiter AI.
You are interviewing a candidate named ${profileData.name} who claims to be at a '${profileData.claimed_complexity}' level in: ${profileData.skills?.join(', ')}.
Their self-provided description is: "${profileData.description}".

Instructions:
1. Conduct a brief, professional interview consisting of EXACTLY 3 technical questions, asked ONE AT A TIME.
2. The questions should practically test their claimed skills.
3. Keep your questions concise (1-2 sentences).
4. CRITICAL: Conduct the ENTIRE interview in exactly this language/style: ${lang}.
5. FORMATTING: For Q1 and Q2, provide 3 multiple-choice options. Q3 must be free-text.
6. CRITICAL: For EVERY turn, output ONLY valid JSON:
{
  "question": "<your question>",
  "type": "<'mcq' for Q1/Q2, 'text' for Q3>",
  "options": ["<option 1>", "<option 2>", "<option 3>"] // empty array if type is 'text'
}
7. On the 4th turn (after Q3 answer), output ONLY:
{
  "status": "complete",
  "competence_score": <0-100>,
  "assigned_level": "<Basic | Intermediate | Expert>",
  "minimum_wage": <500-2500 PKR>,
  "verified_description": "<rewritten description>"
}`;

  const startInterview = (selectedLang: string) => {
    setLanguage(selectedLang);
    setIsAiTyping(true);
    callGemini([], selectedLang);
  };

  const callGemini = async (currentHistory: Message[], lang: string) => {
    try {
      const selectedKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY_2;

      // Build conversation history - send raw JSON for model turns so Gemini keeps context
      const contents = [
        { role: 'user', parts: [{ text: 'Start the interview. Ask the first question.' }] },
        ...currentHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.role === 'assistant' && msg.rawJson ? msg.rawJson : msg.text }]
        }))
      ];
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${selectedKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: getSystemInstruction(lang) }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
            responseMimeType: 'application/json',
          }
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'API Error');

      // Extract text from all non-thought parts (Gemini 2.5 Flash has thinking mode)
      const parts = data.candidates?.[0]?.content?.parts || [];
      let textResponse = '';
      for (const part of parts) {
        // Skip thought parts from Gemini thinking mode
        if (part.thought) continue;
        if (part.text) {
          textResponse += part.text;
        }
      }
      textResponse = textResponse.trim();

      // Robust JSON extraction
      let parsed: any;
      try {
        // First try direct parse
        parsed = JSON.parse(textResponse);
      } catch (e1) {
        try {
          // Try removing markdown code blocks
          const cleaned = textResponse
            .replace(/```json\s*/gi, '')
            .replace(/```\s*/g, '')
            .trim();
          parsed = JSON.parse(cleaned);
        } catch (e2) {
          // Try extracting JSON object with regex
          const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              parsed = JSON.parse(jsonMatch[0]);
            } catch (e3) {
              parsed = { question: textResponse, type: 'text', options: [] };
            }
          } else {
            parsed = { question: textResponse, type: 'text', options: [] };
          }
        }
      }

      // Check for completion - handle various possible shapes from Gemini
      const isComplete = parsed.status === 'complete' || 
        (parsed.competence_score !== undefined && !parsed.question) ||
        (parsed.assigned_level !== undefined && parsed.competence_score !== undefined);

      if (isComplete) {
        console.log('[Vetting] Interview complete, result:', JSON.stringify(parsed));
        setEvaluationResult(parsed);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.auth.updateUser({ data: { full_name: profileData.name, name: profileData.name } });
          await supabase.from('providers').upsert({
            id: user.id, phone: user.phone, name: profileData.name,
            cnic_verified: profileData.cnicData?.is_valid_cnic || false, kyc_status: 'verified',
            skills: profileData.skills, description: parsed.verified_description || profileData.description,
            base_rate: { [parsed.assigned_level || profileData.claimed_complexity]: parsed.minimum_wage || 1000 },
            reliability_score: 100, newbie_boost_remaining: 5,
          }, { onConflict: 'id' });
          await supabase.from('users').update({ full_name: profileData.name }).eq('id', user.id);
        }
        await SecureStore.setItemAsync('provider_kyc_completed', 'true');
        DeviceEventEmitter.emit('provider_kyc_completed');
        setInterviewComplete(true);
      } else if (parsed.question) {
        // Normal question response - store rawJson for context
        setMessages(prev => [...prev, {
          id: Date.now().toString(), text: parsed.question,
          role: 'assistant', options: parsed.options, type: parsed.type,
          rawJson: textResponse,
        }]);
      } else {
        // Fallback: if no question and no completion, show raw text as message
        console.warn('[Vetting] Unexpected AI response:', textResponse);
        setMessages(prev => [...prev, {
          id: Date.now().toString(), text: textResponse,
          role: 'assistant', type: 'text',
          rawJson: textResponse,
        }]);
      }
    } catch (err: any) {
      alert(`Agent Error: ${err.message}`);
    } finally {
      setIsAiTyping(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const newMsg: Message = { id: Date.now().toString(), text: text.trim(), role: 'user' };
    const updated = [...messages, newMsg];
    setMessages(updated);
    setInputText('');
    Keyboard.dismiss();
    setIsAiTyping(true);
    await callGemini(updated, language!);
  };

  const isCurrentQuestionMcq = messages.length > 0 && messages[messages.length - 1].role === 'assistant' && messages[messages.length - 1].type === 'mcq';

  const renderMessage = ({ item, index }: { item: Message, index: number }) => {
    const isUser = item.role === 'user';
    const isLast = index === messages.length - 1;
    return (
      <View>
        <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAi]}>
          {!isUser && (
            <LinearGradient colors={['#10B981', '#059669']} style={styles.aiAvatar}>
              <Ionicons name="hardware-chip" size={14} color="#FFF" />
            </LinearGradient>
          )}
          <View style={[styles.messageBubble, isUser ? styles.messageBubbleUser : styles.messageBubbleAi]}>
            <Text style={[styles.messageText, isUser ? styles.messageTextUser : styles.messageTextAi]}>{item.text}</Text>
          </View>
        </View>
        {!isUser && isLast && item.type === 'mcq' && item.options?.length && !isAiTyping && (
          <View style={styles.optionsContainer}>
            {item.options!.map((opt, i) => (
              <TouchableOpacity key={i} style={styles.optionButton} onPress={() => sendMessage(opt)} activeOpacity={0.75}>
                <Text style={styles.optionButtonText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  // Language Selection
  if (!language) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.langContainer}>
          <LinearGradient colors={['#10B981', '#059669']} style={styles.langBadge}>
            <Ionicons name="mic" size={28} color="#FFF" />
          </LinearGradient>
          <Text style={styles.langTitle}>Choose Interview Language</Text>
          <Text style={styles.langDesc}>Select the language you're most comfortable with.</Text>

          {[
            { label: 'English', value: 'English', bg: '#EEF2FF', color: '#6366F1' },
            { label: 'اردو (Urdu)', value: 'Urdu (in Urdu Script)', bg: '#FEF3C7', color: '#F59E0B' },
            { label: 'Roman Urdu', value: 'Roman Urdu (Urdu written in English alphabets)', bg: '#ECFDF5', color: '#10B981' },
          ].map((lang) => (
            <TouchableOpacity
              key={lang.value}
              style={[styles.langBtn, { backgroundColor: lang.bg }]}
              onPress={() => startInterview(lang.value)}
              activeOpacity={0.8}
            >
              <Text style={[styles.langBtnText, { color: lang.color }]}>{lang.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  // Result Screen
  if (interviewComplete) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.resultContainer}>
          <View style={styles.resultIconWrap}>
            <Ionicons name="checkmark-circle" size={72} color="#10B981" />
          </View>
          <Text style={styles.resultTitle}>Verification Complete!</Text>
          <Text style={styles.resultDesc}>Our AI has evaluated your answers and calibrated your profile.</Text>

          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Competence Score</Text>
              <Text style={[styles.statValue, { color: '#10B981' }]}>{evaluationResult.competence_score}%</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Verified Level</Text>
              <Text style={[styles.statValue, { color: '#6366F1' }]}>{evaluationResult.assigned_level}</Text>
            </View>
            <View style={[styles.statRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.statLabel}>Base Wage (PKR)</Text>
              <Text style={[styles.statValue, { color: '#F59E0B' }]}>{evaluationResult.minimum_wage}/hr</Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('ProviderDashboard')} activeOpacity={0.85}>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.dashboardBtn}>
              <Text style={styles.dashboardBtnText}>Enter Dashboard</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Chat Screen
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <LinearGradient colors={['#10B981', '#059669']} style={styles.headerAvatar}>
            <Ionicons name="hardware-chip" size={16} color="#FFF" />
          </LinearGradient>
          <View>
            <Text style={styles.headerTitle}>ServeIQ Agent</Text>
            <Text style={styles.headerSubtitle}>Skill Verification</Text>
          </View>
        </View>
        <View style={{ width: 42 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {isAiTyping && (
        <View style={styles.typingContainer}>
          <ActivityIndicator size="small" color="#10B981" />
          <Text style={styles.typingText}>Agent is evaluating...</Text>
        </View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.textInput, isCurrentQuestionMcq && { backgroundColor: '#F1F5F9', color: '#94A3B8' }]}
            placeholder={isCurrentQuestionMcq ? "Select an option above" : "Type your answer..."}
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => sendMessage(inputText)}
            editable={!isAiTyping && !isCurrentQuestionMcq}
          />
          <TouchableOpacity
            disabled={!inputText.trim() || isAiTyping || isCurrentQuestionMcq}
            onPress={() => sendMessage(inputText)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={(!inputText.trim() || isAiTyping) ? ['#CBD5E1', '#CBD5E1'] : ['#10B981', '#059669']}
              style={styles.sendButton}
            >
              <Ionicons name="send" size={18} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },

  /* Header */
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 20,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  backBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  headerSubtitle: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },

  /* Chat */
  chatContainer: { padding: 16, paddingBottom: 20, backgroundColor: '#F8FAFC' },
  messageRow: { marginBottom: 14, flexDirection: 'row', alignItems: 'flex-end' },
  messageRowUser: { justifyContent: 'flex-end' },
  messageRowAi: { justifyContent: 'flex-start' },
  aiAvatar: { width: 28, height: 28, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 8, marginBottom: 4 },
  messageBubble: { maxWidth: '80%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  messageBubbleUser: { backgroundColor: '#10B981', borderBottomRightRadius: 6 },
  messageBubbleAi: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 6, borderWidth: 1, borderColor: '#E2E8F0' },
  messageText: { fontSize: 15, lineHeight: 22 },
  messageTextUser: { color: '#FFFFFF' },
  messageTextAi: { color: '#0F172A' },
  optionsContainer: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  optionButton: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0', borderRadius: 14, padding: 14, alignItems: 'center' },
  optionButtonText: { color: '#065F46', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  typingContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  typingText: { color: '#64748B', fontStyle: 'italic', fontSize: 13 },
  inputWrapper: {
    flexDirection: 'row', padding: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: 10, alignItems: 'center',
  },
  textInput: {
    flex: 1, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 20, paddingHorizontal: 18, paddingVertical: 12, fontSize: 15, color: '#0F172A', maxHeight: 100,
  },
  sendButton: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },

  /* Language Selection */
  langContainer: { flex: 1, justifyContent: 'center', padding: 24, alignItems: 'center' },
  langBadge: { width: 64, height: 64, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  langTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 8, textAlign: 'center' },
  langDesc: { fontSize: 15, color: '#64748B', textAlign: 'center', marginBottom: 32 },
  langBtn: { width: '100%', borderRadius: 18, paddingVertical: 18, marginBottom: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0' },
  langBtnText: { fontSize: 18, fontWeight: '700' },

  /* Results */
  resultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  resultIconWrap: { marginBottom: 12 },
  resultTitle: { fontSize: 28, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  resultDesc: { fontSize: 15, color: '#64748B', textAlign: 'center', marginBottom: 32 },
  statsCard: {
    width: '100%', backgroundColor: '#F8FAFC', borderRadius: 22, padding: 20,
    borderWidth: 1.5, borderColor: '#E2E8F0', marginBottom: 32,
  },
  statRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  statLabel: { fontSize: 15, color: '#64748B', fontWeight: '600' },
  statValue: { fontSize: 16, fontWeight: '800' },
  dashboardBtn: { width: 300, borderRadius: 18, height: 58, justifyContent: 'center', alignItems: 'center' },
  dashboardBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
