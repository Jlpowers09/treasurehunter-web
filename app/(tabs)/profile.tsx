import { View, Text, StyleSheet, TouchableOpacity, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/clerk-expo';

export default function ProfileScreen() {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();

  const handleSignIn = () => {
    Linking.openURL('https://nearby-sculpin-81.clerk.accounts.dev/sign-in?redirect_url=https://treasurehunter.jjgtpsevices.com');
  };

  const handleSignUp = () => {
    Linking.openURL('https://nearby-sculpin-81.clerk.accounts.dev/sign-up?redirect_url=https://treasurehunter.jjgtpsevices.com');
  };

  if (isSignedIn && user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>
        <View style={styles.body}>
          <View style={styles.avatarCircle}>
            {user.imageUrl ? (
              <Ionicons name="person" size={48} color="#FF385C" />
            ) : (
              <Ionicons name="person-outline" size={48} color="#ccc" />
            )}
          </View>
          <Text style={styles.name}>{user.fullName || user.username || 'TreasureHunter'}</Text>
          <Text style={styles.email}>{user.primaryEmailAddress?.emailAddress}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>0</Text>
              <Text style={styles.statLabel}>Sales Posted</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>0</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>0</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.signOutBtn} onPress={() => signOut()}>
            <Ionicons name="log-out-outline" size={18} color="#FF385C" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person-outline" size={48} color="#ccc" />
        </View>
        <Text style={styles.name}>Sign in to TreasureHunter</Text>
        <Text style={styles.sub}>Track favorites, post sales, and get alerts near you.</Text>
        <TouchableOpacity style={styles.signInBtn} onPress={handleSignIn}>
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signUpBtn} onPress={handleSignUp}>
          <Text style={styles.signUpText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: {
    paddingTop: Platform.OS === 'web' ? 16 : 52, paddingHorizontal: 20, paddingBottom: 16,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  title: { fontSize: 20, fontWeight: '800', color: '#111', letterSpacing: -0.5 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  avatarCircle: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: '#f5f5f5',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  name: { fontSize: 20, fontWeight: '700', color: '#111', textAlign: 'center' },
  email: { fontSize: 14, color: '#999', marginTop: 4 },
  sub: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  statsRow: { flexDirection: 'row', marginTop: 28, marginBottom: 8, backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%', justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  statBox: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800', color: '#111' },
  statLabel: { fontSize: 11, color: '#aaa', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#f0f0f0' },
  signInBtn: {
    marginTop: 24, backgroundColor: '#FF385C', borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 40, width: '100%', alignItems: 'center',
  },
  signInText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  signUpBtn: {
    marginTop: 12, borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 40, width: '100%', alignItems: 'center',
  },
  signUpText: { color: '#333', fontSize: 15, fontWeight: '600' },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 32, padding: 14, borderWidth: 1.5, borderColor: '#FF385C', borderRadius: 14, width: '100%', justifyContent: 'center' },
  signOutText: { color: '#FF385C', fontSize: 15, fontWeight: '700' },
});
