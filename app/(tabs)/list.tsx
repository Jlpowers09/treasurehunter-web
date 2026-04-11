import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { trpc } from '../../lib/trpc';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const CATEGORIES: { type: string; label: string; icon: IoniconsName; color: string }[] = [
  { type: 'YARD_SALE', label: 'Yard Sale', icon: 'home-outline', color: '#FF385C' },
  { type: 'ESTATE_SALE', label: 'Estate Sale', icon: 'business-outline', color: '#7C3AED' },
  { type: 'GARAGE_SALE', label: 'Garage Sale', icon: 'car-outline', color: '#0EA5E9' },
  { type: 'MOVING_SALE', label: 'Moving Sale', icon: 'cube-outline', color: '#F59E0B' },
  { type: 'THRIFT_STORE', label: 'Thrift Store', icon: 'shirt-outline', color: '#10B981' },
  { type: 'FLEA_MARKET', label: 'Flea Market', icon: 'storefront-outline', color: '#F97316' },
];

export default function ListScreen() {
  const { data: sales, isLoading, refetch } = trpc.sale.list.useQuery({});

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#FF385C" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Sales</Text>
        <Text style={styles.subtitle}>{sales?.length ?? 0} found</Text>
      </View>
      <FlatList
        data={sales}
        keyExtractor={item => item.id}
        onRefresh={refetch}
        refreshing={isLoading}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={48} color="#ddd" />
            <Text style={styles.emptyText}>No sales found nearby</Text>
            <Text style={styles.emptySub}>Be the first to post a sale!</Text>
          </View>
        }
        renderItem={({ item }) => {
          const cat = CATEGORIES.find(c => c.type === item.type);
          return (
            <TouchableOpacity style={styles.card} activeOpacity={0.7}>
              <View style={[styles.typeBar, { backgroundColor: cat?.color ?? '#FF385C' }]} />
              <View style={styles.cardContent}>
                <View style={styles.cardTop}>
                  <View style={[styles.typeBadge, { backgroundColor: (cat?.color ?? '#FF385C') + '20' }]}>
                    <Ionicons name={cat?.icon ?? 'pricetag-outline'} size={12} color={cat?.color ?? '#FF385C'} />
                    <Text style={[styles.typeText, { color: cat?.color ?? '#FF385C' }]}>{cat?.label}</Text>
                  </View>
                  <Text style={styles.dateText}>
                    {new Date(item.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                <View style={styles.cardBottom}>
                  <Ionicons name="location-outline" size={14} color="#999" />
                  <Text style={styles.addressText}>{item.address}, {item.city}</Text>
                </View>
                <View style={styles.cardStats}>
                  <View style={styles.stat}>
                    <Ionicons name="eye-outline" size={14} color="#bbb" />
                    <Text style={styles.statText}>{item.viewCount}</Text>
                  </View>
                  <View style={styles.stat}>
                    <Ionicons name="star-outline" size={14} color="#bbb" />
                    <Text style={styles.statText}>{item._count?.reviews ?? 0}</Text>
                  </View>
                  <View style={styles.stat}>
                    <Ionicons name="heart-outline" size={14} color="#bbb" />
                    <Text style={styles.statText}>{item._count?.favorites ?? 0}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 16 : 52,
    paddingBottom: 16, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  title: { fontSize: 24, fontWeight: '800', color: '#333' },
  subtitle: { fontSize: 14, color: '#999', marginTop: 2 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, flexDirection: 'row',
    overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  typeBar: { width: 4 },
  cardContent: { flex: 1, padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  typeText: { fontSize: 11, fontWeight: '700' },
  dateText: { fontSize: 12, color: '#999', fontWeight: '600' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 8 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  addressText: { fontSize: 12, color: '#999', flex: 1 },
  cardStats: { flexDirection: 'row', gap: 12 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12, color: '#bbb' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#999', marginTop: 16 },
  emptySub: { fontSize: 14, color: '#bbb', marginTop: 4 },
});
