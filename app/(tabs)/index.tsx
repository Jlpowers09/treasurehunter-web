import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, TextInput, Platform
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { trpc } from '../../lib/trpc';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const CATEGORIES: { type: string; label: string; icon: IoniconsName; color: string }[] = [
  { type: 'YARD_SALE', label: 'Yard', icon: 'home-outline', color: '#FF385C' },
  { type: 'ESTATE_SALE', label: 'Estate', icon: 'business-outline', color: '#7C3AED' },
  { type: 'GARAGE_SALE', label: 'Garage', icon: 'car-outline', color: '#0EA5E9' },
  { type: 'MOVING_SALE', label: 'Moving', icon: 'cube-outline', color: '#F59E0B' },
  { type: 'THRIFT_STORE', label: 'Thrift', icon: 'shirt-outline', color: '#10B981' },
  { type: 'FLEA_MARKET', label: 'Flea Mkt', icon: 'storefront-outline', color: '#F97316' },
];

export default function MapScreen() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const { data: sales, isLoading, refetch } = trpc.sale.list.useQuery({});

  const filtered = sales?.filter((s: any) =>
    (!selectedType || s.type === selectedType) &&
    (!searchText ||
      s.title.toLowerCase().includes(searchText.toLowerCase()) ||
      s.city.toLowerCase().includes(searchText.toLowerCase()))
  );

  const getCategoryCount = (type: string) =>
    sales?.filter((s: any) => s.type === type).length ?? 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>TreasureHunter</Text>
          <Text style={styles.tagline}>Find hidden gems near you</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={22} color="#222" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search city, zip, or sale type..."
            placeholderTextColor="#bbb"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={18} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.categoriesWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          {CATEGORIES.map(cat => {
            const isSelected = selectedType === cat.type;
            const count = getCategoryCount(cat.type);
            return (
              <TouchableOpacity
                key={cat.type}
                style={[styles.categoryCard, isSelected && { borderColor: cat.color, borderWidth: 2 }]}
                onPress={() => setSelectedType(isSelected ? null : cat.type)}
                activeOpacity={0.7}
              >
                <View style={[styles.categoryIconBox, { backgroundColor: isSelected ? cat.color : cat.color + '15' }]}>
                  <Ionicons name={cat.icon} size={18} color={isSelected ? '#fff' : cat.color} />
                </View>
                <Text style={[styles.categoryLabel, isSelected && { color: cat.color, fontWeight: '700' }]}>
                  {cat.label}
                </Text>
                <View style={[styles.countBadge, { backgroundColor: isSelected ? cat.color : '#f0f0f0' }]}>
                  <Text style={[styles.countText, { color: isSelected ? '#fff' : '#999' }]}>{count}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.mapArea}>
        <View style={styles.mapPlaceholder}>
          {Array.from({ length: 8 }).map((_, i) => (
            <View key={`h${i}`} style={[styles.gridLineH, { top: `${i * 14}%` as any }]} />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={`v${i}`} style={[styles.gridLineV, { left: `${i * 20}%` as any }]} />
          ))}
          {filtered?.slice(0, 6).map((sale: any, i: number) => {
            const cat = CATEGORIES.find(c => c.type === sale.type);
            return (
              <TouchableOpacity
                key={sale.id}
                style={[styles.mapPin, {
                  backgroundColor: cat?.color ?? '#FF385C',
                  top: `${15 + (i * 30) % 55}%` as any,
                  left: `${10 + (i * 35) % 75}%` as any,
                }]}
                activeOpacity={0.8}
              >
                <Ionicons name={cat?.icon ?? 'location-outline'} size={12} color="#fff" />
                <Text style={styles.mapPinText} numberOfLines={1}>{sale.city}</Text>
              </TouchableOpacity>
            );
          })}
          <View style={styles.mapControls}>
            <TouchableOpacity style={styles.mapControlBtn} onPress={() => refetch()}>
              <Ionicons name="locate-outline" size={20} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapControlBtn}>
              <Ionicons name="add-outline" size={20} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapControlBtn}>
              <Ionicons name="remove-outline" size={20} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.resultsBar} onPress={() => setDrawerOpen(prev => !prev)} activeOpacity={0.7}>
          <View style={styles.resultsLeft}>
            <View style={styles.drawerHandle} />
            <Text style={styles.resultsText}>
              <Text style={styles.resultsCount}>{filtered?.length ?? 0}</Text>{' '}sales nearby
            </Text>
          </View>
          <Ionicons name={drawerOpen ? 'chevron-down' : 'chevron-up'} size={16} color="#999" />
        </TouchableOpacity>
      </View>

      {drawerOpen && (
        <View style={styles.drawer}>
          {isLoading ? (
            <ActivityIndicator color="#FF385C" style={{ marginTop: 20 }} />
          ) : filtered?.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={40} color="#ddd" />
              <Text style={styles.emptyText}>No sales found</Text>
              {selectedType && (
                <TouchableOpacity style={styles.clearFilterBtn} onPress={() => setSelectedType(null)}>
                  <Text style={styles.clearFilterText}>Clear filter</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {filtered?.map((sale: any) => {
                const cat = CATEGORIES.find(c => c.type === sale.type);
                return (
                  <TouchableOpacity key={sale.id} style={styles.saleRow} activeOpacity={0.7}>
                    <View style={[styles.saleIconBox, { backgroundColor: (cat?.color ?? '#FF385C') + '15' }]}>
                      <Ionicons name={cat?.icon ?? 'pricetag-outline'} size={20} color={cat?.color ?? '#FF385C'} />
                    </View>
                    <View style={styles.saleRowInfo}>
                      <Text style={styles.saleRowTitle} numberOfLines={1}>{sale.title}</Text>
                      <Text style={styles.saleRowSub} numberOfLines={1}>{sale.address}, {sale.city}</Text>
                      <View style={styles.saleRowMeta}>
                        <Ionicons name="calendar-outline" size={11} color="#bbb" />
                        <Text style={styles.saleRowDate}>
                          {new Date(sale.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Text>
                        <View style={[styles.typePill, { backgroundColor: (cat?.color ?? '#FF385C') + '15' }]}>
                          <Text style={[styles.typePillText, { color: cat?.color ?? '#FF385C' }]}>{cat?.label}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.saleRowRight}>
                      <View style={styles.saleStats}>
                        <Ionicons name="heart-outline" size={13} color="#bbb" />
                        <Text style={styles.statNum}>{sale._count?.favorites ?? 0}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="#ddd" />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'web' ? 16 : 52,
    paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  appName: { fontSize: 20, fontWeight: '800', color: '#111', letterSpacing: -0.5 },
  tagline: { fontSize: 12, color: '#aaa', marginTop: 1 },
  notifBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  searchContainer: { backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f5f5f5', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },
  categoriesWrapper: { backgroundColor: '#fff', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  categoriesScroll: { paddingHorizontal: 20, gap: 8 },
  categoryCard: {
    alignItems: 'center', gap: 6, padding: 10, minWidth: 72,
    backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#f0f0f0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  categoryIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  categoryLabel: { fontSize: 10, fontWeight: '600', color: '#666', textAlign: 'center' },
  countBadge: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 },
  countText: { fontSize: 10, fontWeight: '700' },
  mapArea: { flex: 1 },
  mapPlaceholder: { flex: 1, backgroundColor: '#eef2ee', position: 'relative', overflow: 'hidden' },
  gridLineH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.5)' },
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.5)' },
  mapPin: {
    position: 'absolute', flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 5, borderRadius: 16, gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  mapPinText: { fontSize: 10, color: '#fff', fontWeight: '700', maxWidth: 70 },
  mapControls: { position: 'absolute', right: 12, top: 12, gap: 8 },
  mapControlBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  resultsBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
  },
  resultsLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  drawerHandle: { width: 32, height: 3, backgroundColor: '#e0e0e0', borderRadius: 2 },
  resultsText: { fontSize: 14, color: '#555' },
  resultsCount: { fontWeight: '800', color: '#111' },
  drawer: { backgroundColor: '#fff', maxHeight: 260, borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  emptyState: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#333', marginTop: 12 },
  clearFilterBtn: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#FF385C15', borderRadius: 20 },
  clearFilterText: { fontSize: 13, color: '#FF385C', fontWeight: '600' },
  saleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f8f8f8' },
  saleIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  saleRowInfo: { flex: 1 },
  saleRowTitle: { fontSize: 14, fontWeight: '700', color: '#111' },
  saleRowSub: { fontSize: 12, color: '#999', marginTop: 2 },
  saleRowMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  saleRowDate: { fontSize: 11, color: '#bbb' },
  typePill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  typePillText: { fontSize: 10, fontWeight: '700' },
  saleRowRight: { alignItems: 'center', gap: 4 },
  saleStats: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statNum: { fontSize: 11, color: '#bbb' },
});
