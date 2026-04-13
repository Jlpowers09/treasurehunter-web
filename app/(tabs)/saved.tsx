import { View, Text, StyleSheet, TouchableOpacity, Platform, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { trpc } from '../../lib/trpc';
import { useRouter } from 'expo-router';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const CATEGORIES: { type: string; label: string; icon: IoniconsName; color: string }[] = [
  { type: 'YARD_SALE', label: 'Yard Sale', icon: 'home-outline', color: '#C0392B' },
  { type: 'ESTATE_SALE', label: 'Estate Sale', icon: 'business-outline', color: '#2A7F6F' },
  { type: 'GARAGE_SALE', label: 'Garage Sale', icon: 'car-outline', color: '#5B9BD5' },
  { type: 'MOVING_SALE', label: 'Moving Sale', icon: 'cube-outline', color: '#D4870A' },
  { type: 'THRIFT_STORE', label: 'Thrift Store', icon: 'shirt-outline', color: '#27AE60' },
  { type: 'FLEA_MARKET', label: 'Flea Market', icon: 'storefront-outline', color: '#8E44AD' },
];

export default function SavedScreen() {
  const { isSignedIn, userId } = useAuth();
  const router = useRouter();
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const toggleFavorite = trpc.sale.toggleFavorite.useMutation({
    onSuccess: () => refetch(),
  });
  const { data: favorites, isLoading, refetch } = trpc.sale.getFavorites.useQuery(
    { clerkUserId: userId ?? '' },
    { enabled: !!userId }
  );

  if (!isSignedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.header}><Text style={styles.title}>Saved Sales</Text></View>
        <View style={styles.body}>
          <View style={[styles.iconCircle, { backgroundColor: '#C0392B10' }]}>
            <Ionicons name="lock-closed-outline" size={48} color="#C0392B" />
          </View>
          <Text style={styles.heading}>Sign In Required</Text>
          <Text style={styles.sub}>Sign in to save sales and access them here.</Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return <View style={styles.container}><View style={styles.header}><Text style={styles.title}>Saved Sales</Text></View><View style={styles.body}><ActivityIndicator size="large" color="#C0392B" /></View></View>;
  }

  if (!favorites || favorites.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}><Text style={styles.title}>Saved Sales</Text></View>
        <View style={styles.body}>
          <View style={styles.iconCircle}>
            <Ionicons name="heart-outline" size={48} color="#C0392B" />
          </View>
          <Text style={styles.heading}>No Saved Sales Yet</Text>
          <Text style={styles.sub}>Tap the heart on any sale to save it here for later.</Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.push('/')}>
            <Text style={styles.btnText}>Explore Sales</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Sales</Text>
        <Text style={styles.count}>{favorites.length} saved</Text>
      </View>
      <FlatList
        data={favorites}
        keyExtractor={item => item.id}
        onRefresh={refetch}
        refreshing={isLoading}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const cat = CATEGORIES.find(c => c.type === item.type);
          return (
            <View style={styles.card}>
              <View style={[styles.typeBar, { backgroundColor: cat?.color ?? '#C0392B' }]} />
              <View style={styles.cardContent}>
                <View style={styles.cardTop}>
                  <View style={[styles.typeBadge, { backgroundColor: (cat?.color ?? '#C0392B') + '20' }]}>
                    <Ionicons name={cat?.icon ?? 'pricetag-outline'} size={12} color={cat?.color ?? '#C0392B'} />
                    <Text style={[styles.typeText, { color: cat?.color ?? '#C0392B' }]}>{cat?.label}</Text>
                  </View>
                  <Text style={styles.dateText}>
                    {new Date(item.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                <View style={styles.cardBottom}>
                  <Ionicons name="location-outline" size={14} color="#999" />
                  <Text style={styles.addressText}>{item.address}, {item.city}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      if (userId) toggleFavorite.mutate({ saleId: item.id, clerkUserId: userId });
                    }}
                    style={{ padding: 4 }}
                  >
                    <Ionicons name="heart" size={18} color="#C0392B" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Platform.OS === 'web' ? 16 : 52, paddingHorizontal: 20, paddingBottom: 16,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  title: { fontSize: 20, fontWeight: '800', color: '#111', letterSpacing: -0.5 },
  count: { fontSize: 13, color: '#999', fontWeight: '500' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  iconCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#C0392B10', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  heading: { fontSize: 20, fontWeight: '700', color: '#111', textAlign: 'center' },
  sub: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  btn: { marginTop: 24, backgroundColor: '#C0392B', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', flexDirection: 'row', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  typeBar: { width: 4 },
  cardContent: { flex: 1, padding: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  typeText: { fontSize: 11, fontWeight: '600' },
  dateText: { fontSize: 12, color: '#999', fontWeight: '500' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 8, lineHeight: 20 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addressText: { fontSize: 12, color: '#999', flex: 1 },
});
