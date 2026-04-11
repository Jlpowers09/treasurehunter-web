import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
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
        <TouchableOpacity style={styles.signInBtn}>
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signUpBtn}>
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
  sub: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 8, lineHeight: 20 },
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
});
