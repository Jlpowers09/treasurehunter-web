import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SavedScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Sales</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.iconCircle}>
          <Ionicons name="bookmark-outline" size={48} color="#FF385C" />
        </View>
        <Text style={styles.heading}>No Saved Sales Yet</Text>
        <Text style={styles.sub}>Tap the heart on any sale to save it here for later.</Text>
        <TouchableOpacity style={styles.btn}>
          <Text style={styles.btnText}>Explore Sales</Text>
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
  iconCircle: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: '#FF385C10',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  heading: { fontSize: 20, fontWeight: '700', color: '#111', textAlign: 'center' },
  sub: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  btn: {
    marginTop: 24, backgroundColor: '#FF385C', borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 32,
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
