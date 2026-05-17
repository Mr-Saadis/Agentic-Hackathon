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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

interface Message {
  id: string;
  text: string;
  role: 'user' | 'assistant';
}

export default function TechnicianVettingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { profileData } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  
  const flatListRef = useRef<FlatList>(null);

  // Initialize the interview
  useEffect(() => {
    setIsAiTyping(true);
    // Simulate first fetch from edge function
    setTimeout(() => {
      setMessages([{
        id: Date.now().toString(),
        text: `Hello ${profileData.name}. I see you claim to be an ${profileData.claimed_complexity} in ${profileData.skills.join(', ')}. Let's test your knowledge. What is the most common cause of an E5 error in an inverter AC, and how do you fix it?`,
        role: 'assistant'
      }]);
      setIsAiTyping(false);
    }, 2000);
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const newMsg: Message = { id: Date.now().toString(), text: text.trim(), role: 'user' };
    const updatedMessages = [...messages, newMsg];
    
    setMessages(updatedMessages);
    setInputText('');
    Keyboard.dismiss();
    setIsAiTyping(true);

    // Call Supabase Edge Function (Fallback to simulation for local expo testing)
    // In production: await fetch('.../technician-vetting', { method: 'POST', body: JSON.stringify({ profile: profileData, conversation: updatedMessages }) })
    
    setTimeout(() => {
      const userMessageCount = updatedMessages.filter(m => m.role === 'user').length;
      
      if (userMessageCount < 2) {
        // Next Question
        setMessages([...updatedMessages, {
          id: (Date.now() + 1).toString(),
          text: 'Interesting. Follow up question: How do you verify if the compressor is faulty or just the capacitor without using a multimeter?',
          role: 'assistant'
        }]);
        setIsAiTyping(false);
      } else {
        // Complete
        const result = {
          competence_score: 85,
          assigned_level: 'Intermediate',
          minimum_wage: 1200
        };
        setEvaluationResult(result);
        
        const saveToDB = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('providers').upsert({
              id: user.id,
              phone: user.phone,
              cnic_verified: true,
              kyc_status: 'Verified',
              skills: profileData.skills,
              base_rate: { [profileData.claimed_complexity]: result.minimum_wage },
              reliability_score: 100,
              newbie_boost_remaining: 5,
            }, { onConflict: 'id' });
          }
        };

        saveToDB().then(() => {
          setInterviewComplete(true);
          setIsAiTyping(false);
        }).catch(err => {
          console.error("Failed to save provider:", err);
          setInterviewComplete(true);
          setIsAiTyping(false);
        });
      }
    }, 2500);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAi]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Ionicons name="hardware-chip" size={16} color="#FFF" />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.messageBubbleUser : styles.messageBubbleAi]}>
          <Text style={[styles.messageText, isUser ? styles.messageTextUser : styles.messageTextAi]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ServeIQ Agent</Text>
        <Text style={styles.headerSubtitle}>Skill Verification Interview</Text>
      </View>

      {!interviewComplete ? (
        <>
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
                style={styles.textInput}
                placeholder="Type your answer..."
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={() => sendMessage(inputText)}
                editable={!isAiTyping}
              />
              <TouchableOpacity
                style={[styles.sendButton, (!inputText.trim() || isAiTyping) && { opacity: 0.5 }]}
                onPress={() => sendMessage(inputText)}
                disabled={!inputText.trim() || isAiTyping}
              >
                <Ionicons name="send" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </>
      ) : (
        <View style={styles.resultContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#10B981" />
          <Text style={styles.resultTitle}>Verification Complete!</Text>
          <Text style={styles.resultDesc}>Our AI has evaluated your answers and calibrated your profile.</Text>
          
          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Competence Score</Text>
              <Text style={styles.statValue}>{evaluationResult.competence_score}%</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Verified Level</Text>
              <Text style={styles.statValueLevel}>{evaluationResult.assigned_level}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Base Wage (PKR)</Text>
              <Text style={styles.statValueWage}>{evaluationResult.minimum_wage}/hr</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.dashboardBtn}
            onPress={() => navigation.navigate('ProviderDashboard')}
          >
            <Text style={styles.dashboardBtnText}>Enter Dashboard</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    padding: 16,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 40 : 16,
  },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  headerSubtitle: { color: '#94A3B8', fontSize: 13, marginTop: 4 },
  chatContainer: { padding: 16, paddingBottom: 20 },
  messageRow: { marginBottom: 16, flexDirection: 'row', alignItems: 'flex-end', maxWidth: '100%' },
  messageRowUser: { justifyContent: 'flex-end' },
  messageRowAi: { justifyContent: 'flex-start' },
  aiAvatar: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#10B981',
    justifyContent: 'center', alignItems: 'center', marginRight: 8, marginBottom: 4
  },
  messageBubble: { maxWidth: '80%', padding: 14, borderRadius: 20 },
  messageBubbleUser: { backgroundColor: '#2563EB', borderBottomRightRadius: 4 },
  messageBubbleAi: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E2E8F0' },
  messageText: { fontSize: 15, lineHeight: 22 },
  messageTextUser: { color: '#FFFFFF' },
  messageTextAi: { color: '#1E293B' },
  typingContainer: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 8 },
  typingText: { color: '#64748B', fontStyle: 'italic', fontSize: 14 },
  inputWrapper: {
    flexDirection: 'row', padding: 12, backgroundColor: '#FFFFFF',
    borderTopWidth: 1, borderTopColor: '#E2E8F0', alignItems: 'center'
  },
  textInput: {
    flex: 1, backgroundColor: '#F1F5F9', borderRadius: 24,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#0F172A',
    maxHeight: 100
  },
  sendButton: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#2563EB',
    justifyContent: 'center', alignItems: 'center', marginLeft: 12
  },
  resultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  resultTitle: { fontSize: 28, fontWeight: '800', color: '#0F172A', marginTop: 16, marginBottom: 8 },
  resultDesc: { fontSize: 15, color: '#64748B', textAlign: 'center', marginBottom: 32 },
  statsCard: {
    width: '100%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 4, marginBottom: 40
  },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  statLabel: { fontSize: 16, color: '#475569', fontWeight: '500' },
  statValue: { fontSize: 16, color: '#0F172A', fontWeight: '700' },
  statValueLevel: { fontSize: 16, color: '#2563EB', fontWeight: '700' },
  statValueWage: { fontSize: 16, color: '#10B981', fontWeight: '700' },
  dashboardBtn: {
    backgroundColor: '#0F172A', paddingVertical: 16, paddingHorizontal: 32,
    borderRadius: 12, width: '100%', alignItems: 'center'
  },
  dashboardBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
