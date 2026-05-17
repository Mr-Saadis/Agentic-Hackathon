import React, { useState, useRef } from 'react';
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

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  type: 'text' | 'chips';
  chips?: string[];
}

export default function HomeScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome_1',
      text: 'Assalam-o-Alaikum! Main ServeIQ AI hoon. Aaj aapko kya service chahiye?',
      sender: 'ai',
      type: 'text',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const flatListRef = useRef<FlatList<Message>>(null);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      type: 'text',
    };

    // Append user message and clear any active chips from previous AI messages
    setMessages((prev) => {
      const updatedMessages = prev.map((msg) => {
        if (msg.type === 'chips' && msg.chips && msg.chips.length > 0) {
          // Clear chips so they disappear after selection
          return { ...msg, chips: [] };
        }
        return msg;
      });
      return [...updatedMessages, userMessage];
    });

    setInputText('');
    Keyboard.dismiss();
    setIsAiTyping(true);

    // Mock AI processing delay (1.5 seconds)
    setTimeout(() => {
      const inputLower = text.toLowerCase();
      const isAC = inputLower.includes('ac');

      const aiReply: Message = {
        id: (Date.now() + 1).toString(),
        text: isAC
          ? 'G-13 ke liye AC ka kya kaam karwana hai?'
          : 'Samajh gaya. Abhi mera backend Antigravity se connect nahi hai, lekin aapki request test ho gayi hai!',
        sender: 'ai',
        type: isAC ? 'chips' : 'text',
        chips: isAC ? ['Gas Refill', 'General Service', 'Not Cooling'] : [],
      };

      setMessages((prev) => [...prev, aiReply]);
      setIsAiTyping(false);
    }, 1500);
  };

  const handleChipPress = (chipText: string) => {
    sendMessage(chipText);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAi]}>
        <View style={[styles.messageBubble, isUser ? styles.messageBubbleUser : styles.messageBubbleAi]}>
          <Text style={[styles.messageText, isUser ? styles.messageTextUser : styles.messageTextAi]}>
            {item.text}
          </Text>
        </View>

        {/* Render Clarification Chips if they exist */}
        {item.type === 'chips' && item.chips && item.chips.length > 0 && (
          <View style={styles.chipsContainer}>
            {item.chips.map((chip, index) => (
              <TouchableOpacity
                key={index.toString()}
                style={styles.chipButton}
                onPress={() => handleChipPress(chip)}
                activeOpacity={0.7}
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
      <View style={styles.container}>
        {/* Top Header Bar */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ServeIQ</Text>
          <Text style={styles.headerSubtitle}>Assalam-o-Alaikum, Aapko kya madad chahiye?</Text>
        </View>

        {/* Chat Scroll View */}
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

        {/* AI Thinking Indicator */}
        {isAiTyping && (
          <View style={styles.typingIndicatorContainer}>
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color="#2563EB" />
              <Text style={styles.typingText}>AI is thinking...</Text>
            </View>
          </View>
        )}

        {/* Sticky Fixed Bottom Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Apna masla likhein..."
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
              returnKeyType="send"
              onSubmitEditing={() => sendMessage(inputText)}
            />
            {inputText.trim().length > 0 ? (
              <TouchableOpacity
                style={styles.sendButton}
                onPress={() => sendMessage(inputText)}
                activeOpacity={0.8}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.micButton} activeOpacity={0.8}>
                <Text style={styles.micIcon}>🎤</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Light gray background common in chat apps
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  messageRow: {
    marginBottom: 16,
    flexDirection: 'column',
    maxWidth: '100%',
  },
  messageRowUser: {
    alignItems: 'flex-end',
  },
  messageRowAi: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  messageBubbleUser: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 4, // WhatsApp style tail effect
  },
  messageBubbleAi: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4, // WhatsApp style tail effect
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTextUser: {
    color: '#FFFFFF',
  },
  messageTextAi: {
    color: '#111827',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
    maxWidth: '85%',
  },
  chipButton: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  chipText: {
    color: '#1D4ED8',
    fontWeight: '600',
    fontSize: 14,
  },
  typingIndicatorContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  typingText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    maxHeight: 100,
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981', // WhatsApp green for mic
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  micIcon: {
    fontSize: 20,
  },
  sendButton: {
    width: 60,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
