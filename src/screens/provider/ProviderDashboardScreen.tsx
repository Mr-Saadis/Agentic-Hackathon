import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

const { width, height } = Dimensions.get('window');

type StatusType = 'Offline' | 'Available' | 'Busy';

export default function ProviderDashboardScreen() {
  const [status, setStatus] = useState<StatusType>('Available');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [countdown, setCountdown] = useState(180); // 3 minutes
  const [showTimeoutBanner, setShowTimeoutBanner] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const [providerName, setProviderName] = useState('Valued Partner');
  const [providerInitials, setProviderInitials] = useState('VP');

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // First try to get name and status from providers table
        const { data: providerData, error: fetchError } = await supabase.from('providers').select('*').eq('id', user.id).single();
        if (fetchError) console.warn("Error fetching provider data:", fetchError);

        let name = providerData?.name;

        if (providerData && providerData.current_status) {
          const dbStatus = providerData.current_status.toString();
          const formattedStatus = dbStatus.charAt(0).toUpperCase() + dbStatus.slice(1).toLowerCase();
          if (['Offline', 'Available', 'Busy'].includes(formattedStatus)) {
            setStatus(formattedStatus as StatusType);
          }
        }

        // Fallback to metadata
        if (!name) {
          name = user.user_metadata?.name || user.user_metadata?.full_name;
        }

        // If still not found, fallback to phone number
        if (!name) {
          name = user.phone || 'Provider';
        }

        setProviderName(name);

        // Create initials
        const nameParts = name.split(' ');
        if (nameParts.length >= 2) {
          setProviderInitials(`${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase());
        } else {
          setProviderInitials(name.substring(0, 2).toUpperCase());
        }
      }
    };
    fetchUserData();
  }, []);

  const updateStatus = async (newStatus: StatusType) => {
    setStatus(newStatus); // Optimistic UI update

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Send as lowercase to DB using current_status
        const { error } = await supabase.from('providers').update({ current_status: newStatus.toLowerCase() }).eq('id', user.id);
        if (error) {
          console.warn("Failed to sync status to Supabase:", error);
        }
      }
    } catch (err) {
      console.warn("Error updating status:", err);
    }
  };

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  const bannerAnim = useRef(new Animated.Value(-100)).current;
  const toastAnim = useRef(new Animated.Value(-100)).current;

  // Pulse animation for urgent indicator
  useEffect(() => {
    if (isModalVisible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isModalVisible]);

  // Countdown timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isModalVisible && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && isModalVisible) {
      handleTimeout();
    }
    return () => clearInterval(interval);
  }, [isModalVisible, countdown]);

  const handleSimulateRequest = () => {
    setCountdown(180);
    setIsModalVisible(true);
    setShowTimeoutBanner(false);
    setShowSuccessToast(false);
  };

  const handleTimeout = () => {
    setIsModalVisible(false);
    setShowTimeoutBanner(true);

    // Show banner animation
    Animated.sequence([
      Animated.spring(bannerAnim, {
        toValue: 50,
        useNativeDriver: true,
      }),
      Animated.delay(4000),
      Animated.timing(bannerAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowTimeoutBanner(false);
    });
  };

  const handleAccept = () => {
    setIsModalVisible(false);
    updateStatus('Busy');
    setShowSuccessToast(true);

    // Show toast animation
    Animated.sequence([
      Animated.spring(toastAnim, {
        toValue: 50,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(toastAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowSuccessToast(false);
    });
  };

  const handleDecline = () => {
    setIsModalVisible(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Top Banner & Toast (Absolute positioning) */}
      {showTimeoutBanner && (
        <Animated.View style={[styles.timeoutBanner, { transform: [{ translateY: bannerAnim }] }]}>
          <Ionicons name="warning" size={24} color="#FFF" />
          <Text style={styles.bannerText}>Job Timeout — Reliability Score penalized (-5 points)</Text>
        </Animated.View>
      )}

      {showSuccessToast && (
        <Animated.View style={[styles.successToast, { transform: [{ translateY: toastAnim }] }]}>
          <Ionicons name="checkmark-circle" size={24} color="#FFF" />
          <Text style={styles.toastText}>Job Accepted! Status updated to Busy.</Text>
        </Animated.View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Gamified Header & Status Widget */}
        <View style={styles.headerContainer}>
          <View style={styles.headerProfile}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{providerInitials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.greetingText}>Welcome back,</Text>
              <Text style={styles.technicianName}>{providerName}</Text>
            </View>
            <TouchableOpacity onPress={async () => await supabase.auth.signOut()}>
              <Ionicons name="log-out-outline" size={28} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <View style={styles.statusWidgetContainer}>
            <Text style={styles.statusLabel}>Current Status</Text>
            <View style={styles.statusPillContainer}>
              <TouchableOpacity
                style={[
                  styles.statusPill,
                  status === 'Offline' ? styles.statusOffline : styles.statusInactive
                ]}
                onPress={() => updateStatus('Offline')}
              >
                <Text style={[styles.statusText, status === 'Offline' && styles.statusTextActive]}>Offline</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.statusPill,
                  status === 'Available' ? styles.statusAvailable : styles.statusInactive
                ]}
                onPress={() => updateStatus('Available')}
              >
                <Text style={[styles.statusText, status === 'Available' && styles.statusTextActive]}>Available</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.statusPill,
                  status === 'Busy' ? styles.statusBusy : styles.statusInactive
                ]}
                onPress={() => updateStatus('Busy')}
              >
                <Text style={[styles.statusText, status === 'Busy' && styles.statusTextActive]}>Busy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Executive Metrics Cards Grid */}
        <View style={styles.metricsGrid}>
          {/* Card 1: Reliability Score */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricTitle}>Reliability Score</Text>
              <Ionicons name="shield-checkmark" size={20} color="#10B981" />
            </View>
            <View style={styles.scoreContainer}>
              <Text style={[styles.metricValue, { color: '#10B981' }]}>95</Text>
              <Text style={styles.metricSubValue}>/ 100</Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: '95%', backgroundColor: '#10B981' }]} />
            </View>
            <Text style={styles.metricFootnote}>Top 5% in Islamabad</Text>
          </View>

          {/* Card 2: Today's Earnings */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricTitle}>Today's Earnings</Text>
              <Ionicons name="trending-up" size={20} color="#10B981" />
            </View>
            <Text style={styles.earningsValue}>Rs. 4,500</Text>
            <Text style={styles.metricFootnote}>+15% from yesterday</Text>

            <View style={styles.earningsChartPlaceholder}>
              {/* Minimal aesthetic bar representations */}
              <View style={[styles.chartBar, { height: '40%' }]} />
              <View style={[styles.chartBar, { height: '70%' }]} />
              <View style={[styles.chartBar, { height: '50%' }]} />
              <View style={[styles.chartBar, { height: '90%', backgroundColor: '#10B981' }]} />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button (Simulation) */}
      <TouchableOpacity style={styles.fab} onPress={handleSimulateRequest}>
        <Ionicons name="radio" size={24} color="#FFF" />
        <Text style={styles.fabText}>Simulate Request</Text>
      </TouchableOpacity>

      {/* Immersive Job Radar Overlay Modal */}
      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.sheetHandle} />

            <View style={styles.radarHeader}>
              <Animated.View style={[styles.urgentIndicator, { transform: [{ scale: pulseAnim }] }]}>
                <View style={styles.urgentDot} />
              </Animated.View>
              <Text style={styles.urgentText}>URGENT REQUEST</Text>
              <View style={styles.timerPill}>
                <Ionicons name="time-outline" size={16} color="#FFF" />
                <Text style={styles.timerText}>{formatTime(countdown)}</Text>
              </View>
            </View>

            <View style={styles.jobDetailsCard}>
              <Text style={styles.jobTitle}>AC Inverter Repair</Text>
              <View style={styles.jobLocationRow}>
                <Ionicons name="location" size={18} color="#64748B" />
                <Text style={styles.jobLocationText}>G-13, Islamabad</Text>
                <Text style={styles.jobDistanceText}>• 3.2 km away</Text>
              </View>
              <View style={styles.payoutRow}>
                <Text style={styles.payoutLabel}>Est. Payout</Text>
                <Text style={styles.payoutValue}>Rs. 2,500 - 3,500</Text>
              </View>
            </View>

            {/* Antigravity Reasoning Box */}
            <View style={styles.aiReasoningBox}>
              <View style={styles.aiHeaderRow}>
                <Ionicons name="sparkles" size={16} color="#8B5CF6" />
                <Text style={styles.aiHeaderText}>Antigravity AI Match</Text>
              </View>
              <Text style={styles.aiTraceText}>
                🤖 Matched: 4.8-star AC specialist within 3km radius with optimal pricing profile.
              </Text>
            </View>

            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={styles.declineButton} onPress={handleDecline}>
                <Text style={styles.declineButtonText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
                <Text style={styles.acceptButtonText}>Accept Job</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Light slate background for body
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerContainer: {
    backgroundColor: '#0F172A',
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#475569',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  greetingText: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 4,
  },
  technicianName: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusWidgetContainer: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statusLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 1,
  },
  statusPillContainer: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 4,
  },
  statusPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusInactive: {
    backgroundColor: 'transparent',
  },
  statusOffline: {
    backgroundColor: '#EF4444', // Crimson Red
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  statusAvailable: {
    backgroundColor: '#10B981', // Emerald Green
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  statusBusy: {
    backgroundColor: '#F59E0B', // Warm Amber
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  statusTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-between',
    gap: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricSubValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
    marginLeft: 4,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  metricFootnote: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  earningsValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  earningsChartPlaceholder: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 40,
    marginTop: 16,
    paddingHorizontal: 4,
  },
  chartBar: {
    width: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  fabText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  sheetHandle: {
    width: 48,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 24,
  },
  radarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  urgentIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  urgentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  urgentText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#EF4444',
    letterSpacing: 1,
    flex: 1,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  timerText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
  jobDetailsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  jobLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  jobLocationText: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '600',
    marginLeft: 6,
    marginRight: 8,
  },
  jobDistanceText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  payoutLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  payoutValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10B981',
  },
  aiReasoningBox: {
    backgroundColor: '#F5F3FF', // Light purple/indigo tint
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#EDE9FE',
  },
  aiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  aiHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7C3AED',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  aiTraceText: {
    fontSize: 14,
    color: '#5B21B6',
    lineHeight: 22,
    fontWeight: '500',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineButtonText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '700',
  },
  acceptButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  timeoutBanner: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 50,
    left: 20,
    right: 20,
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
    gap: 12,
  },
  bannerText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  successToast: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 50,
    left: 20,
    right: 20,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
    gap: 12,
  },
  toastText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
});
