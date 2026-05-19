import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

export default function CNICUploadScreen() {
  const navigation = useNavigation<any>();
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const pickImage = async (side: 'front' | 'back') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { alert('Camera roll permissions needed!'); return; }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets?.[0]) {
      const b64 = result.assets[0].base64;
      if (!b64) { alert("Failed to get image data."); return; }
      if (side === 'front') setFrontImage(b64);
      else setBackImage(b64);
    }
  };

  const handleVerify = async () => {
    if (!frontImage || !backImage) { alert('Please upload both sides.'); return; }
    setIsVerifying(true);
    try {
      const apiKeys = [
        process.env.EXPO_PUBLIC_GEMINI_API_KEY,
        "AIzaSyAZ6s2NvgglX3amOHs_e-ioAblkd7UH8Gk"
      ];
      const selectedKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];

      const prompt = `You are a strict KYC Compliance Officer for ServeIQ in Pakistan.
        Analyze this image which claims to be a CNIC (Pakistani ID Card).
        Task: 1. Verify if it looks like a valid Pakistani CNIC. 2. Extract the 13-digit CNIC number if visible.
        Output MUST be strict JSON: { "is_valid_cnic": boolean, "cnic_number": "XXXXX-XXXXXXX-X" | null, "reason": "brief reason" }`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${selectedKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: "image/jpeg", data: frontImage } }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      if (!response.ok) throw new Error('Failed to reach Gemini Vision');

      const data = await response.json();
      const cleaned = data.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(cleaned);

      if (result.is_valid_cnic) {
        navigation.navigate('TechnicianProfile', { cnicData: result });
      } else {
        alert(`Verification Failed: ${result.reason}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message || 'Could not verify CNIC.'}`);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.iconBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="card" size={26} color="#FFF" />
          </LinearGradient>
          <Text style={styles.title}>Identity Verification</Text>
          <Text style={styles.subtitle}>Our AI will securely verify your CNIC in seconds.</Text>
        </View>

        {/* Front Upload */}
        <View style={styles.uploadSection}>
          <Text style={styles.label}>CNIC Front</Text>
          <TouchableOpacity
            style={[styles.uploadBox, frontImage && styles.uploadBoxSuccess]}
            onPress={() => pickImage('front')}
            activeOpacity={0.8}
          >
            {frontImage ? (
              <View style={styles.imageSuccess}>
                <View style={styles.successCircle}>
                  <Ionicons name="checkmark" size={24} color="#FFF" />
                </View>
                <Text style={styles.successText}>Front Captured</Text>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <View style={styles.cameraCircle}>
                  <Ionicons name="camera-outline" size={28} color="#94A3B8" />
                </View>
                <Text style={styles.uploadText}>Tap to capture CNIC Front</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Back Upload */}
        <View style={styles.uploadSection}>
          <Text style={styles.label}>CNIC Back</Text>
          <TouchableOpacity
            style={[styles.uploadBox, backImage && styles.uploadBoxSuccess]}
            onPress={() => pickImage('back')}
            activeOpacity={0.8}
          >
            {backImage ? (
              <View style={styles.imageSuccess}>
                <View style={styles.successCircle}>
                  <Ionicons name="checkmark" size={24} color="#FFF" />
                </View>
                <Text style={styles.successText}>Back Captured</Text>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <View style={styles.cameraCircle}>
                  <Ionicons name="camera-outline" size={28} color="#94A3B8" />
                </View>
                <Text style={styles.uploadText}>Tap to capture CNIC Back</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          disabled={!frontImage || !backImage || isVerifying}
          onPress={handleVerify}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={(!frontImage || !backImage) ? ['#CBD5E1', '#CBD5E1'] : ['#10B981', '#059669']}
            style={styles.verifyButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isVerifying ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.verifyButtonText}>Verify via Agentic KYC</Text>
                <Ionicons name="shield-checkmark" size={20} color="#FFF" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ alignItems: 'center', marginTop: 16 }}
          onPress={() => navigation.navigate('TechnicianProfile', { cnicData: { cnic_number: '00000-0000000-0', is_valid_cnic: true } })}
        >
          <Text style={{ color: '#94A3B8', fontWeight: '500', fontSize: 13 }}>Skip for now (Dev Testing)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, padding: 24, paddingTop: Platform.OS === 'android' ? 48 : 20 },
  header: { alignItems: 'center', marginBottom: 36 },
  iconBadge: {
    width: 64, height: 64, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22, paddingHorizontal: 16 },
  uploadSection: { marginBottom: 20 },
  label: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 10 },
  uploadBox: {
    height: 120, backgroundColor: '#F8FAFC',
    borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed',
    borderRadius: 22, justifyContent: 'center', alignItems: 'center',
  },
  uploadBoxSuccess: {
    borderColor: '#10B981', borderStyle: 'solid', backgroundColor: '#ECFDF5',
  },
  uploadPlaceholder: { alignItems: 'center' },
  cameraCircle: {
    width: 52, height: 52, borderRadius: 18, backgroundColor: '#F1F5F9',
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  uploadText: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
  imageSuccess: { alignItems: 'center' },
  successCircle: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#10B981',
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  successText: { color: '#059669', fontSize: 14, fontWeight: '700' },
  footer: { padding: 24, borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#FFFFFF' },
  verifyButton: {
    borderRadius: 18, height: 58, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  verifyButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
