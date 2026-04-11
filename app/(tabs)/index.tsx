import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, TextInput, Platform, Modal
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
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

const GOOGLE_MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ?? '';

export default function MapScreen() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const { data: sales, isLoading, refetch } = trpc.sale.list.useQuery({});

  const filtered = sales?.filter((s: any) =>
    (!selectedType || s.type === selectedType) &&
    (!searchText ||
      s.title.toLowerCase().includes(searchText.toLowerCase()) ||
      s.city.toLowerCase().includes(searchText.toLowerCase()))
  );

  const getCategoryCount = (type: string) =>
    sales?.filter((s: any) => s.type === type).length ?? 0;

  // Load Google Maps
  useEffect(() => {
    if (Platform.OS !== 'web' || !GOOGLE_MAPS_KEY) return;
    
    const loadMap = async () => {
      try {
        // Load Google Maps script directly
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`;
        script.async = true;
        script.onload = () => setMapLoaded(true);
        script.onerror = (e) => console.error('Maps script error:', e);
        document.head.appendChild(script);
      } catch (e) {
        console.error('Maps load error:', e);
      }
    };
    loadMap();
  }, []);

  // Initialize map when loaded
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    
    const google = (window as any).google;
    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 38.5816, lng: -121.4944 }, // Sacramento default
      zoom: 11,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    googleMapRef.current = map;

    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        map.setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, [mapLoaded]);

  // Add markers when sales load
  useEffect(() => {
    if (!googleMapRef.current || !filtered) return;
    const google = (window as any).google;
    if (!google) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    filtered.forEach((sale: any) => {
      if (sale.lat == null || sale.lng == null) return;
      const cat = CATEGORIES.find(c => c.type === sale.type);
      
      const marker = new google.maps.Marker({
        position: { lat: sale.lat, lng: sale.lng },
        map: googleMapRef.current,
        title: sale.title,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: cat?.color ?? '#FF385C',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
          scale: 10,
        },
      });

      marker.addListener('click', () => setSelectedSale(sale));
      markersRef.current.push(marker);
    });
  }, [filtered, mapLoaded]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>TreasureHunter</Text>
          <Text style={styles.tagline}>Find hidden gems near you</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={22} color="#222" />
        </TouchableOpacity>
      </View>

      {/* Search */}
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

      {/* Categories */}
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

      {/* Map */}
      <View style={styles.mapArea}>
        {Platform.OS === 'web' ? (
          <div
            ref={mapRef as any}
            style={{ width: '100%', height: '100%', backgroundColor: '#e8ede8' }}
          />
        ) : (
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map-outline" size={48} color="#ccc" />
            <Text style={styles.mapPlaceholderText}>Map available on web</Text>
          </View>
        )}

        {!mapLoaded && Platform.OS === 'web' && (
          <View style={styles.mapLoading}>
            <ActivityIndicator color="#FF385C" />
            <Text style={styles.mapLoadingText}>Loading map...</Text>
          </View>
        )}

        {/* Map controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.mapControlBtn} onPress={() => {
            if (navigator.geolocation && googleMapRef.current) {
              navigator.geolocation.getCurrentPosition(pos => {
                googleMapRef.current.setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                googleMapRef.current.setZoom(13);
              });
            }
          }}>
            <Ionicons name="locate-outline" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Results bar */}
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

      {/* Drawer */}
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
                  <TouchableOpacity
                    key={sale.id}
                    style={styles.saleRow}
                    onPress={() => setSelectedSale(sale)}
                    activeOpacity={0.7}
                  >
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
                    <Ionicons name="chevron-forward" size={16} color="#ddd" />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      )}

      {/* Sale Detail Modal */}
      <Modal visible={!!selectedSale} animationType="slide" transparent onRequestClose={() => setSelectedSale(null)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setSelectedSale(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            {selectedSale && (() => {
              const cat = CATEGORIES.find(c => c.type === selectedSale.type);
              return (
                <>
                  <View style={styles.modalHeader}>
                    <View style={[styles.modalTypeBox, { backgroundColor: (cat?.color ?? '#FF385C') + '15' }]}>
                      <Ionicons name={cat?.icon ?? 'pricetag-outline'} size={20} color={cat?.color ?? '#FF385C'} />
                      <Text style={[styles.modalTypeText, { color: cat?.color ?? '#FF385C' }]}>{cat?.label}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setSelectedSale(null)} style={styles.modalCloseBtn}>
                      <Ionicons name="close" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.modalTitle}>{selectedSale.title}</Text>

                  {selectedSale.description && (
                    <Text style={styles.modalDescription}>{selectedSale.description}</Text>
                  )}

                  <View style={styles.modalInfoRow}>
                    <Ionicons name="location-outline" size={16} color="#FF385C" />
                    <Text style={styles.modalInfoText}>{selectedSale.address}, {selectedSale.city}, {selectedSale.state} {selectedSale.zip}</Text>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Ionicons name="calendar-outline" size={16} color="#FF385C" />
                    <Text style={styles.modalInfoText}>
                      {new Date(selectedSale.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
                      {' — '}
                      {new Date(selectedSale.endDate).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
                    </Text>
                  </View>

                  {selectedSale.startTime && (
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="time-outline" size={16} color="#FF385C" />
                      <Text style={styles.modalInfoText}>{selectedSale.startTime} — {selectedSale.endTime}</Text>
                    </View>
                  )}

                  <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.modalDirectionsBtn} onPress={() => {
                      const addr = encodeURIComponent(`${selectedSale.address}, ${selectedSale.city}, ${selectedSale.state}`);
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${addr}`, '_blank');
                    }}>
                      <Ionicons name="navigate-outline" size={18} color="#fff" />
                      <Text style={styles.modalDirectionsText}>Get Directions</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalSaveBtn}>
                      <Ionicons name="heart-outline" size={18} color="#FF385C" />
                    </TouchableOpacity>
                  </View>
                </>
              );
            })()}
          </View>
        </View>
      </Modal>
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
  mapArea: { flex: 1, position: 'relative' },
  mapPlaceholder: { flex: 1, backgroundColor: '#eef2ee', alignItems: 'center', justifyContent: 'center' },
  mapPlaceholderText: { fontSize: 14, color: '#999', marginTop: 8 },
  mapLoading: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.8)' },
  mapLoadingText: { fontSize: 13, color: '#999', marginTop: 8 },
  mapControls: { position: 'absolute', right: 12, top: 12 },
  mapControlBtn: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: '#fff',
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

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 40,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 16,
  },
  modalHandle: { width: 40, height: 4, backgroundColor: '#e0e0e0', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  modalTypeBox: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  modalTypeText: { fontSize: 12, fontWeight: '700' },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111', marginBottom: 8 },
  modalDescription: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 12 },
  modalInfoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  modalInfoText: { fontSize: 14, color: '#444', flex: 1, lineHeight: 20 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  modalDirectionsBtn: {
    flex: 1, backgroundColor: '#FF385C', borderRadius: 14, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  modalDirectionsText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  modalSaveBtn: {
    width: 52, height: 52, borderRadius: 14, borderWidth: 1.5, borderColor: '#e0e0e0',
    alignItems: 'center', justifyContent: 'center',
  },
});
