import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 24 * 2 - 16) / 2;

const SERVICES = [
  { id: '1', name: 'AC Repair', nameUr: 'اے سی مرمت', icon: 'snow-outline', bg: '#EEF2FF', accent: '#6366F1' },
  { id: '2', name: 'Plumber', nameUr: 'پلمبر', icon: 'water-outline', bg: '#E0F2FE', accent: '#0EA5E9' },
  { id: '3', name: 'Electrician', nameUr: 'الیکٹریشن', icon: 'flash-outline', bg: '#FEF3C7', accent: '#F59E0B' },
  { id: '4', name: 'Cleaning', nameUr: 'صفائی', icon: 'sparkles-outline', bg: '#D1FAE5', accent: '#10B981' },
  { id: '5', name: 'Painter', nameUr: 'رنگ و روغن', icon: 'color-palette-outline', bg: '#F3E8FF', accent: '#A855F7' },
  { id: '6', name: 'Carpenter', nameUr: 'کارپینٹر', icon: 'hammer-outline', bg: '#FFEDD5', accent: '#F97316' },
  { id: '7', name: 'Appliances', nameUr: 'گھریلو آلات', icon: 'tv-outline', bg: '#FCE7F3', accent: '#EC4899' },
  { id: '8', name: 'More', nameUr: 'مزید', icon: 'apps-outline', bg: '#F1F5F9', accent: '#64748B' },
];

const QUICK_ACTIONS = [
  { id: 'q1', label: 'Emergency', labelUr: 'ایمرجنسی', icon: 'warning-outline', color: '#EF4444' },
  { id: 'q2', label: 'Schedule', labelUr: 'شیڈول', icon: 'calendar-outline', color: '#8B5CF6' },
  { id: 'q3', label: 'History', labelUr: 'ہسٹری', icon: 'time-outline', color: '#0EA5E9' },
  { id: 'q4', label: 'Offers', labelUr: 'آفرز', icon: 'pricetag-outline', color: '#10B981' },
];

const TRANSLATIONS = {
  en: {
    greeting: 'Hello',
    whatDoYouNeed: "What do you need fixed?",
    aiSearch: "Describe your problem to AI...",
    quickActions: 'Quick Actions',
    services: 'All Services',
    recentBookings: 'Recent Activity',
    noBookings: 'Your booking history will appear here.',
  },
  ur: {
    greeting: 'السلام علیکم',
    whatDoYouNeed: 'آج کیا مدد چاہیے؟',
    aiSearch: 'اپنا مسئلہ AI کو بتائیں...',
    quickActions: 'فوری اختیارات',
    services: 'تمام خدمات',
    recentBookings: 'حالیہ سرگرمی',
    noBookings: 'آپ کی بکنگ کی تاریخ یہاں نظر آئے گی۔',
  },
};

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const [userName, setUserName] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [lang, setLang] = useState<'en' | 'ur'>('en');
  const [initials, setInitials] = useState('U');

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        let name = user.user_metadata?.full_name || user.user_metadata?.name;
        if (!name) {
          const { data } = await supabase.from('users').select('name').eq('id', user.id).single();
          if (data && data.name) name = data.name;
        }
        const displayName = name || user.phone || 'User';
        setUserName(displayName);
        
        // Generate initials
        const parts = displayName.split(' ');
        if (parts.length >= 2) {
          setInitials((parts[0][0] + parts[1][0]).toUpperCase());
        } else {
          setInitials(displayName[0]?.toUpperCase() || 'U');
        }

        if (user.user_metadata?.location) {
          setUserLocation(user.user_metadata.location);
        }

        const preferredLang = user.user_metadata?.preferred_language;
        if (preferredLang === 'ur') setLang('ur');
        else setLang('en');
      }
    };
    fetchUserData();
  }, []);

  const t = TRANSLATIONS[lang];
  const isUrdu = lang === 'ur';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView 
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── HEADER ─── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              style={styles.avatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
            <View style={{ marginLeft: 14 }}>
              <Text style={[styles.headerGreeting, isUrdu && styles.rtl]}>
                {t.greeting}, {userName.split(' ')[0]}
              </Text>
              {userLocation ? (
                <View style={[styles.locationRow, isUrdu && { flexDirection: 'row-reverse' }]}>
                  <Ionicons name="location" size={13} color="#6366F1" />
                  <Text style={styles.locationLabel} numberOfLines={1}>{userLocation}</Text>
                </View>
              ) : null}
            </View>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={async () => await supabase.auth.signOut()}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={22} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* ─── AI SEARCH BAR ─── */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('AiAssistant')}
          activeOpacity={0.85}
        >
          <View style={styles.searchIconWrap}>
            <Ionicons name="sparkles" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.searchPlaceholder}>{t.aiSearch}</Text>
          <View style={styles.searchMic}>
            <Ionicons name="mic-outline" size={20} color="#6366F1" />
          </View>
        </TouchableOpacity>

        {/* ─── QUICK ACTIONS ─── */}
        <Text style={[styles.sectionTitle, isUrdu && styles.rtl]}>{t.quickActions}</Text>
        <View style={styles.quickRow}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickItem}
              onPress={() => navigation.navigate('AiAssistant')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickIconWrap, { backgroundColor: action.color + '14' }]}>
                <Ionicons name={action.icon as any} size={22} color={action.color} />
              </View>
              <Text style={styles.quickLabel}>
                {isUrdu ? action.labelUr : action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── SERVICES GRID ─── */}
        <Text style={[styles.sectionTitle, isUrdu && styles.rtl]}>{t.services}</Text>
        <View style={styles.grid}>
          {SERVICES.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[styles.serviceCard, { backgroundColor: s.bg }]}
              onPress={() => navigation.navigate('AiAssistant')}
              activeOpacity={0.8}
            >
              <View style={[styles.serviceIconCircle, { backgroundColor: s.accent + '22' }]}>
                <Ionicons name={s.icon as any} size={26} color={s.accent} />
              </View>
              <Text style={[styles.serviceLabel, { color: s.accent }]}>
                {isUrdu ? s.nameUr : s.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── RECENT ACTIVITY ─── */}
        <Text style={[styles.sectionTitle, { marginTop: 28 }, isUrdu && styles.rtl]}>
          {t.recentBookings}
        </Text>
        <View style={styles.emptyCard}>
          <Ionicons name="clipboard-outline" size={36} color="#CBD5E1" />
          <Text style={styles.emptyText}>{t.noBookings}</Text>
        </View>
      </ScrollView>

      {/* ─── FLOATING AI FAB ─── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AiAssistant')}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="chatbubble-ellipses" size={26} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 120,
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 48 : 16,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  headerGreeting: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  locationLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    maxWidth: width * 0.5,
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── AI Search ── */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 24,
    borderRadius: 18,
    height: 56,
    paddingHorizontal: 6,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  searchIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: '#94A3B8',
    fontWeight: '500',
  },
  searchMic: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── Section Title ── */
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginHorizontal: 24,
    marginBottom: 14,
  },

  /* ── Quick Actions ── */
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 24,
    marginBottom: 28,
  },
  quickItem: {
    alignItems: 'center',
    width: (width - 48 - 36) / 4,
  },
  quickIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },

  /* ── Services Grid ── */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 14,
  },
  serviceCard: {
    width: CARD_WIDTH,
    borderRadius: 22,
    paddingVertical: 22,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceLabel: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },

  /* ── Empty State ── */
  emptyCard: {
    marginHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 36,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    borderStyle: 'dashed',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },

  /* ── FAB ── */
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 62,
    height: 62,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  fabGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── RTL ── */
  rtl: {
    textAlign: 'right',
  },
});
