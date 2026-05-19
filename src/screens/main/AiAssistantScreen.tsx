import React, { useState, useRef, useEffect } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';

const getDynamicSystemPrompt = (activeService: string) => `You are the First-Touch Diagnostic Agent for ServeIQ. Act as an expert ${activeService} in Pakistan. 

CONVERSATION PHASES (You MUST progress through these strictly in order based on user's input):

1. Phase "diagnosing": 
   - Ask exactly 1 or 2 technical troubleshooting questions about their ${activeService} issue. (Use Roman Urdu and English).
   - If the user gives a vague answer (e.g., "Idea nai", "Nai pata"), DO NOT repeat the question. Immediately transition to phase "booking_intent".

2. Phase "booking_intent":
   - Briefly summarize the likely issue as an expert technician.
   - Ask: "Kya aap isay theek karwane ke liye technician book karna chahte hain?"
   - Set "suggested_chips": ["Jee haan", "Nahi, shukriya"]
   - If user says no, transition to "completed" and say goodbye. If yes, transition to "location".

3. Phase "location":
   - Ask: "Kya main aapki current saved location par technician bhejoon ya kisi nayi location par?"
   - Set "suggested_chips": ["Saved Location", "New Location"]
   - Once user answers, acknowledge it and transition to "scheduling".

4. Phase "scheduling":
   - Ask: "Aap ke liye kaunsa waqt behtar rahega?"
   - Set "suggested_chips": ["Aaj shaam 4 baje", "Kal subah 10 baje", "Kal shaam 5 baje"] (use realistic times).
   - Once user selects a time, transition to "completed".

5. Phase "completed":
   - Say: "Shukriya! Aap ki booking confirm ho gayi hai. Humara technician jald aap se raabta karega."
   - Do not ask any more questions.

RULES:
- "suggested_chips" must be an array of strings for clickable options. Leave empty [] if not applicable.
- If activeService is "More" or "General", ask what exact service they need and update "detected_specific_service" to the specific category name (e.g., "Fridge Repair"). Otherwise, leave it null.
- Output strictly JSON on every turn.

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "ai_reply": "your conversational response",
  "detected_specific_service": "string or null",
  "chat_phase": "diagnosing | booking_intent | location | scheduling | completed",
  "suggested_chips": ["option 1", "option 2"]
}`;

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  type: 'text' | 'chips';
  chips?: string[];
}

export default function AiAssistantScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [activeService, setActiveService] = useState(route.params?.serviceType || 'General');

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome_1',
      text: `Assalam-o-Alaikum! 👋 Main ServeIQ AI hoon. ${activeService !== 'General' && activeService !== 'More' ? `Aap ko ${activeService} ka kya masla aa raha hai?` : 'Apna masla batayein, main madad karunga!'}`,
      sender: 'ai',
      type: 'text',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMessage: Message = { id: Date.now().toString(), text: text.trim(), sender: 'user', type: 'text' };
    let updatedMessageHistory: Message[] = [];

    setMessages((prev) => {
      const updated = prev.map((msg) => (msg.type === 'chips' && msg.chips?.length ? { ...msg, chips: [] } : msg));
      updatedMessageHistory = [...updated, userMessage];
      return updatedMessageHistory;
    });

    setInputText('');
    Keyboard.dismiss();
    setIsAiTyping(true);

    try {
      // Limit to last 8 messages to prevent token bloat
      const recentMessages = updatedMessageHistory.slice(-8);
      const contents = recentMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const selectedKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY_2;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${selectedKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: getDynamicSystemPrompt(activeService) }] },
          contents,
          generationConfig: { temperature: 0.1, topK: 40, topP: 0.95, maxOutputTokens: 512, responseMimeType: "application/json" }
        })
      });

      const data = await response.json();
      if (!response.ok) {
        console.warn("Gemini API error:", JSON.stringify(data));
        throw new Error(data.error?.message || 'Gemini API failed');
      }
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (rawText) {
        let cleanText = rawText.trim();
        if (cleanText.startsWith('```json')) cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '').trim();
        else if (cleanText.startsWith('```')) cleanText = cleanText.replace(/```/g, '').trim();

        const aiOutput = JSON.parse(cleanText);
        
        if (aiOutput.detected_specific_service) {
          setActiveService(aiOutput.detected_specific_service);
        }

        const aiReply: Message = {
          id: (Date.now() + 1).toString(),
          text: aiOutput.ai_reply || 'Mujhe samajh nahi aayi, kya aap wazahat kar sakte hain?',
          sender: 'ai',
          type: aiOutput.suggested_chips && aiOutput.suggested_chips.length > 0 ? 'chips' : 'text',
          chips: aiOutput.suggested_chips || [],
        };
        
        setMessages((prev) => [...prev, aiReply]);
      } else {
        throw new Error("No response from AI");
      }
    } catch (error) {
      console.warn("AI extraction failed:", error);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        text: 'Maazrat! Kya aap dobara bata sakte hain?',
        sender: 'ai',
        type: 'text'
      }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAi]}>
        {!isUser && (
          <View style={styles.aiAvatarSmall}>
            <Ionicons name="sparkles" size={14} color="#6366F1" />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.messageBubbleUser : styles.messageBubbleAi]}>
          <Text style={[styles.messageText, isUser ? styles.messageTextUser : styles.messageTextAi]}>
            {item.text}
          </Text>
        </View>

        {item.type === 'chips' && item.chips && item.chips.length > 0 && (
          <View style={styles.chipsContainer}>
            {item.chips.map((chip, index) => (
              <TouchableOpacity
                key={index.toString()}
                style={styles.chipButton}
                onPress={() => sendMessage(chip)}
                activeOpacity={0.75}
              >
                <Text style={styles.chipText}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.containerWrapper}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              style={styles.headerAvatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="sparkles" size={16} color="#FFF" />
            </LinearGradient>
            <View>
              <Text style={styles.headerTitle}>{activeService !== 'General' && activeService !== 'More' ? `${activeService} Service` : 'ServeIQ AI'}</Text>
              <Text style={styles.headerSubtitle}>Smart Diagnostic Agent</Text>
            </View>
          </View>
          <View style={{ width: 42 }} />
        </View>

        {/* Chat Area */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />

        {/* Typing Indicator */}
        {isAiTyping && (
          <View style={styles.typingContainer}>
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color="#6366F1" />
              <Text style={styles.typingText}>AI is thinking...</Text>
            </View>
          </View>
        )}

        {/* Input Bar */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder={`Describe your ${activeService !== 'General' && activeService !== 'More' ? activeService : 'service'} issue...`}
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              returnKeyType="send"
              onSubmitEditing={() => sendMessage(inputText)}
            />
            {inputText.trim().length > 0 ? (
              <TouchableOpacity onPress={() => sendMessage(inputText)} activeOpacity={0.85}>
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  style={styles.sendButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="send" size={18} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.micButton} activeOpacity={0.8}>
                <Ionicons name="mic" size={20} color="#6366F1" />
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerWrapper: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },

  /* Chat */
  chatContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  messageRow: {
    marginBottom: 14,
    flexDirection: 'column',
    maxWidth: '100%',
  },
  messageRowUser: {
    alignItems: 'flex-end',
  },
  messageRowAi: {
    alignItems: 'flex-start',
  },
  aiAvatarSmall: {
    width: 26,
    height: 26,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: '82%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  messageBubbleUser: {
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 6,
  },
  messageBubbleAi: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  messageTextUser: {
    color: '#FFFFFF',
  },
  messageTextAi: {
    color: '#0F172A',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
    maxWidth: '85%',
  },
  chipButton: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  chipText: {
    color: '#4338CA',
    fontWeight: '700',
    fontSize: 13,
  },

  /* Typing */
  typingContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  typingText: {
    fontSize: 13,
    color: '#64748B',
    fontStyle: 'italic',
  },

  /* Input */
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
    maxHeight: 100,
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
