import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Platform, Alert, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
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

function StarRating({ saleId, currentCount, avgRating = 0 }: { saleId: string; currentCount: number; avgRating?: number }) {
  const [hovered, setHovered] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [userRating, setUserRating] = useState(0);

  const utils = trpc.useUtils();
  const createReview = trpc.review.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      utils.sale.list.invalidate();
    },
    onError: (e: any) => Alert.alert('Error', e.message),
  });

  const handleRate = (rating: number) => {
    if (submitted) return;
    setUserRating(rating);
    createReview.mutate({ saleId, rating, comment: '' });
  };

  return (
    <View style={starStyles.container}>
      <View style={starStyles.stars}>
        {[1,2,3,4,5].map(star => (
          <TouchableOpacity
            key={star}
            onPress={() => handleRate(star)}
            activeOpacity={0.7}
            disabled={submitted}
          >
            <Ionicons
              name={(userRating || hovered) >= star ? 'star' : avgRating >= star ? 'star' : avgRating >= star - 0.5 ? 'star-half' : 'star-outline'}
              size={18}
              color={(userRating || hovered) >= star || avgRating >= star - 0.4 ? '#F59E0B' : '#ddd'}
            />
          </TouchableOpacity>
        ))}
      </View>
      {submitted ? (
        <Text style={starStyles.thanks}>Thanks!</Text>
      ) : (
        <Text style={starStyles.count}>{currentCount > 0 ? `${avgRating} · ${currentCount} review${currentCount !== 1 ? 's' : ''}` : 'Be first to rate'}</Text>
      )}

    </View>
  );
}

const starStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  stars: { flexDirection: 'row', gap: 2 },
  count: { fontSize: 11, color: '#bbb' },
  thanks: { fontSize: 11, color: '#10B981', fontWeight: '700' },
});

export default function ListScreen() {
  const [selectedSale, setSelectedSale] = useState<any>(null);
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
            <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => setSelectedSale(item)}>
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
                    <Ionicons name="heart-outline" size={14} color="#bbb" />
                    <Text style={styles.statText}>{item._count?.favorites ?? 0}</Text>
                  </View>
                </View>
                <StarRating saleId={item.id} currentCount={item._count?.reviews ?? 0} avgRating={item.avgRating ?? 0} />
              </View>
            </TouchableOpacity>
          );
        }}
      />


      {/* Sale Detail Modal */}
      <Modal visible={!!selectedSale} animationType="slide" transparent onRequestClose={() => setSelectedSale(null)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setSelectedSale(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            {selectedSale && (() => {
              const cat = CATEGORIES.find(c => c.type === selectedSale.type);
              return (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.modalHeader}>
                    <View style={[styles.modalTypeBox, { backgroundColor: (cat?.color ?? '#FF385C') + '15' }]}>
                      <Ionicons name={cat?.icon ?? 'pricetag-outline'} size={18} color={cat?.color ?? '#FF385C'} />
                      <Text style={[styles.modalTypeText, { color: cat?.color ?? '#FF385C' }]}>{cat?.label}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setSelectedSale(null)} style={styles.modalCloseBtn}>
                      <Ionicons name="close" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.modalTitle}>{selectedSale.title}</Text>
                  {selectedSale.description ? <Text style={styles.modalDesc}>{selectedSale.description}</Text> : null}
                  <View style={styles.modalRow}>
                    <Ionicons name="location-outline" size={15} color="#FF385C" />
                    <Text style={styles.modalRowText}>{selectedSale.address}, {selectedSale.city}, {selectedSale.state} {selectedSale.zip}</Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Ionicons name="calendar-outline" size={15} color="#FF385C" />
                    <Text style={styles.modalRowText}>
                      {new Date(selectedSale.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
                      {' — '}
                      {new Date(selectedSale.endDate).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
                    </Text>
                  </View>
                  {selectedSale.startTime && (
                    <View style={styles.modalRow}>
                      <Ionicons name="time-outline" size={15} color="#FF385C" />
                      <Text style={styles.modalRowText}>{selectedSale.startTime} — {selectedSale.endTime}</Text>
                    </View>
                  )}
                  <StarRating
                    saleId={selectedSale.id}
                    currentCount={selectedSale._count?.reviews ?? 0}
                    avgRating={selectedSale.avgRating ?? 0}
                  />
                  <TouchableOpacity style={styles.directionsBtn} onPress={() => {
                    const addr = encodeURIComponent(`${selectedSale.address}, ${selectedSale.city}, ${selectedSale.state}`);
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${addr}`, '_blank');
                  }}>
                    <Ionicons name="navigate-outline" size={18} color="#fff" />
                    <Text style={styles.directionsBtnText}>Get Directions</Text>
                  </TouchableOpacity>
                </ScrollView>
              );
            })()}
          </View>
        </View>
      </Modal>
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
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40, maxHeight: '85%' },
  modalHandle: { width: 40, height: 4, backgroundColor: '#e0e0e0', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  modalTypeBox: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  modalTypeText: { fontSize: 12, fontWeight: '700' },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111', marginBottom: 8 },
  modalDesc: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 12 },
  modalRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  modalRowText: { fontSize: 14, color: '#444', flex: 1, lineHeight: 20 },
  directionsBtn: { backgroundColor: '#FF385C', borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 },
  directionsBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#999', marginTop: 16 },
  emptySub: { fontSize: 14, color: '#bbb', marginTop: 4 },
});
