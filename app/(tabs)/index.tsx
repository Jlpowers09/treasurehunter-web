import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, TextInput, Platform, Modal, Image
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { trpc } from '../../lib/trpc';
import { useAuth } from '@clerk/clerk-expo';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const CATEGORIES: { type: string; label: string; icon: IoniconsName; color: string; image: string }[] = [
  { type: 'YARD_SALE', label: 'Yard', icon: 'home-outline', color: '#C0392B',
    image: 'https://api.treasurehunter.jjgtpsevices.com/public/categories/yard.jpg' },
  { type: 'ESTATE_SALE', label: 'Estate', icon: 'business-outline', color: '#2A7F6F',
    image: 'https://api.treasurehunter.jjgtpsevices.com/public/categories/estate.jpg' },
  { type: 'GARAGE_SALE', label: 'Garage', icon: 'car-outline', color: '#5B9BD5',
    image: 'https://api.treasurehunter.jjgtpsevices.com/public/categories/garage.jpg' },
  { type: 'MOVING_SALE', label: 'Moving', icon: 'cube-outline', color: '#D4870A',
    image: 'https://api.treasurehunter.jjgtpsevices.com/public/categories/moving.jpg' },
  { type: 'THRIFT_STORE', label: 'Thrift', icon: 'shirt-outline', color: '#27AE60',
    image: 'https://api.treasurehunter.jjgtpsevices.com/public/categories/thrift.jpg' },
  { type: 'FLEA_MARKET', label: 'Flea', icon: 'storefront-outline', color: '#8E44AD',
    image: 'https://api.treasurehunter.jjgtpsevices.com/public/categories/flea.jpg' },
];

const GOOGLE_MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ?? '';


function StarRating({ saleId, currentCount, avgRating = 0 }: { saleId: string; currentCount: number; avgRating?: number }) {
  const [submitted, setSubmitted] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  const utils = trpc.useUtils();
  const createReview = trpc.review.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      utils.sale.list.invalidate();
    },
  });

  const handleRate = (rating: number) => {
    if (submitted) return;
    setUserRating(rating);
    createReview.mutate({ saleId, rating, comment: '' });
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
      <View style={{ flexDirection: 'row', gap: 3 }}>
        {[1,2,3,4,5].map(star => (
          <TouchableOpacity key={star} onPress={() => handleRate(star)} activeOpacity={0.7} disabled={submitted}>
            <Ionicons
              name={(userRating || hovered) >= star ? 'star' : avgRating >= star ? 'star' : avgRating >= star - 0.5 ? 'star-half' : 'star-outline'}
              size={20}
              color={(userRating || hovered) >= star || avgRating >= star - 0.4 ? '#D4870A' : '#ddd'}
            />
          </TouchableOpacity>
        ))}
      </View>
      {submitted
        ? <Text style={{ fontSize: 12, color: '#27AE60', fontWeight: '700' }}>Thanks!</Text>
        : <Text style={{ fontSize: 12, color: '#999' }}>{currentCount > 0 ? `${avgRating} · ${currentCount} review${currentCount !== 1 ? 's' : ''}` : 'Tap to rate'}</Text>
      }
    </View>
  );
}

const getCategorySvg = (type: string, color: string) => {
  const svgs: Record<string, string> = {
    YARD_SALE: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    ESTATE_SALE: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><path d="M2 7l10-5 10 5"/></svg>`,
    GARAGE_SALE: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 4v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
    MOVING_SALE: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
    THRIFT_STORE: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
    FLEA_MARKET: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/><path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2"/><path d="M12 5v4"/><path d="M8 9V5"/><path d="M16 9V5"/></svg>`,
  };
  return svgs[type] ?? svgs['YARD_SALE'];
};

export default function MapScreen() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { userId } = useAuth();
  const { data: existingFavorites } = trpc.sale.getFavorites.useQuery(
    { clerkUserId: userId ?? '' },
    { enabled: !!userId }
  );
  // Load existing favorites into state
  useEffect(() => {
    if (existingFavorites) {
      setFavorites(new Set(existingFavorites.map((f: any) => f.id)));
    }
  }, [existingFavorites]);
  const toggleFavorite = trpc.sale.toggleFavorite.useMutation({
    onSuccess: (data, vars) => {
      setFavorites(prev => {
        const next = new Set(prev);
        if (data.favorited) next.add(vars.saleId);
        else next.delete(vars.saleId);
        return next;
      });
    },
  });
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [radiusMiles, setRadiusMiles] = useState(10);
  const [showRadiusSlider, setShowRadiusSlider] = useState(false);
  const [isScrapingArea, setIsScrapingArea] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const { data: sales, isLoading, refetch } = trpc.sale.list.useQuery({});

  const distanceMiles = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 3958.8;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const filtered = sales?.filter((s: any) => {
    if (selectedType && s.type !== selectedType) return false;
    if (searchText && !s.title.toLowerCase().includes(searchText.toLowerCase()) &&
        !s.city.toLowerCase().includes(searchText.toLowerCase())) return false;
    if (userLocation) {
      const dist = distanceMiles(userLocation.lat, userLocation.lng, s.lat, s.lng);
      if (dist > radiusMiles) return false;
    }
    return true;
  });

  const getCategoryCount = (type: string) =>
    filtered?.filter((s: any) => s.type === type).length ?? 0;

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
      myLocationButton: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    googleMapRef.current = map;
    let scrapeTimeout: any = null;
    let lastScrapedLat: number | null = null;
    let lastScrapedLng: number | null = null;
    map.addListener('idle', () => {
      const center = map.getCenter();
      if (!center) return;
      const lat = center.lat();
      const lng = center.lng();
      // Only scrape if moved more than ~5 miles from last scrape
      if (lastScrapedLat && lastScrapedLng) {
        const dlat = Math.abs(lat - lastScrapedLat);
        const dlng = Math.abs(lng - lastScrapedLng);
        if (dlat < 0.07 && dlng < 0.07) return;
      }
      if (scrapeTimeout) clearTimeout(scrapeTimeout);
      scrapeTimeout = setTimeout(() => {
        lastScrapedLat = lat;
        lastScrapedLng = lng;
        setIsScrapingArea(true);
        fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/scrape`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat, lng }),
        }).then(() => {
          setTimeout(() => setIsScrapingArea(false), 120000);
        }).catch(() => setIsScrapingArea(false));
      }, 2000);
    });

    let userDot: any = null;
    const placeUserDot = (lat: number, lng: number) => {
      const google = (window as any).google;
      if (userDot) userDot.setMap(null);

      // Inject pulse keyframe CSS once
      if (!document.getElementById('pulse-style')) {
        const style = document.createElement('style');
        style.id = 'pulse-style';
        style.innerHTML = [
          '@keyframes pulse-ring {',
          '  0% { transform: scale(0.5); opacity: 1; }',
          '  100% { transform: scale(2.5); opacity: 0; }',
          '}',
          '.user-dot-wrapper { position: relative; width: 24px; height: 24px; }',
          '.user-dot-pulse {',
          '  position: absolute; top: 0; left: 0;',
          '  width: 24px; height: 24px; border-radius: 50%;',
          '  background: rgba(66, 133, 244, 0.4);',
          '  animation: pulse-ring 1.8s ease-out infinite;',
          '}',
          '.user-dot-core {',
          '  position: absolute; top: 4px; left: 4px;',
          '  width: 16px; height: 16px; border-radius: 50%;',
          '  background: #4285F4;',
          '  border: 3px solid #fff;',
          '  box-shadow: 0 2px 6px rgba(0,0,0,0.3);',
          '}',
        ].join(' ');
        document.head.appendChild(style);
      }

      userDot = new google.maps.Marker({
        position: { lat, lng },
        map,
        zIndex: 999,
        title: 'You are here',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent([
            '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">',
            '  <circle cx="18" cy="18" r="16" fill="rgba(66,133,244,0.2)" stroke="rgba(66,133,244,0.4)" stroke-width="1"/>',
            '  <circle cx="18" cy="18" r="9" fill="#4285F4" stroke="#ffffff" stroke-width="3"/>',
            '</svg>',
          ].join('')),
          scaledSize: new google.maps.Size(36, 36),
          anchor: new google.maps.Point(18, 18),
        },
      });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          map.setCenter(loc);
          setUserLocation(loc);
          placeUserDot(loc.lat, loc.lng);
        },
        err => console.warn('Geolocation error:', err.message)
      );
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
          fillColor: cat?.color ?? '#C0392B',
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
          <Image source={require('../../assets/images/logo.png')} style={{ width: 220, height: 64, resizeMode: 'contain', marginLeft: -12 }} />
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
                style={[styles.categoryCard, isSelected && { borderColor: cat.color, borderWidth: 2.5 }]}
                onPress={() => setSelectedType(isSelected ? null : cat.type)}
                activeOpacity={0.8}
              >
                {Platform.OS === 'web' ? (
                  <img
                    src={cat.image}
                    style={{ width: '100%', height: 100, objectFit: 'cover', borderTopLeftRadius: 10, borderTopRightRadius: 10, display: 'block' }}
                    alt={cat.label}
                  />
                ) : (
                  <View style={[styles.categoryIconBox, { backgroundColor: cat.color + '20', width: '100%', height: 80, borderTopLeftRadius: 10, borderTopRightRadius: 10 }]}>
                    <Ionicons name={cat.icon} size={32} color={cat.color} />
                  </View>
                )}
                {isSelected && (
                  <View style={[styles.categorySelectedOverlay, { borderColor: cat.color }]} />
                )}
                <View style={styles.categoryBottom}>
                  <Text style={[styles.categoryLabel, isSelected && { color: cat.color, fontWeight: '800' }]}>
                    {cat.label} {cat.type === 'THRIFT_STORE' ? 'Store' : cat.type === 'FLEA_MARKET' ? 'Market' : 'Sales'}
                  </Text>
                  <View style={[styles.countBadge, { backgroundColor: isSelected ? cat.color : '#f0f0f0' }]}>
                    <Text style={[styles.countText, { color: isSelected ? '#fff' : '#999' }]}>{count}</Text>
                  </View>
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
            <ActivityIndicator color="#C0392B" />
            <Text style={styles.mapLoadingText}>Loading map...</Text>
          </View>
        )}
        {/* Scraping indicator */}
        {isScrapingArea && (
          <View style={{ position: 'absolute', top: 12, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 10 }}>
            <ActivityIndicator size="small" color="#F5A623" />
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Searching for sales nearby...</Text>
          </View>
        )}
        {/* Radius slider panel */}
        {showRadiusSlider && (
          <View style={styles.radiusPanel}>
            <View style={styles.radiusRow}>
              <Ionicons name="radio-outline" size={16} color="#C0392B" />
              <Text style={styles.radiusLabel}>Radius: <Text style={styles.radiusValue}>{radiusMiles} mi</Text></Text>
              <TouchableOpacity onPress={() => setShowRadiusSlider(false)}>
                <Ionicons name="close" size={16} color="#999" />
              </TouchableOpacity>
            </View>
            <View style={styles.sliderTrack}>
              {[5, 10, 15, 25, 50].map(val => (
                <TouchableOpacity
                  key={val}
                  style={[styles.sliderTick, radiusMiles === val && styles.sliderTickActive]}
                  onPress={() => setRadiusMiles(val)}
                >
                  <Text style={[styles.sliderTickText, radiusMiles === val && styles.sliderTickTextActive]}>{val}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        {/* Map controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.mapControlBtn} onPress={() => setShowRadiusSlider(p => !p)}>
            <Ionicons name="radio-outline" size={20} color={showRadiusSlider ? '#C0392B' : '#333'} />
          </TouchableOpacity>
          <View style={{ height: 8 }} />
          <TouchableOpacity style={styles.mapControlBtn} onPress={() => {
            if (navigator.geolocation && googleMapRef.current) {
              navigator.geolocation.getCurrentPosition(pos => {
                const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                googleMapRef.current.setCenter(loc);
                googleMapRef.current.setZoom(13);
                setUserLocation(loc);
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
            <ActivityIndicator color="#C0392B" style={{ marginTop: 20 }} />
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
                    <View style={[styles.saleIconBox, { backgroundColor: (cat?.color ?? '#C0392B') + '15' }]}>
                      <Ionicons name={cat?.icon ?? 'pricetag-outline'} size={20} color={cat?.color ?? '#C0392B'} />
                    </View>
                    <View style={styles.saleRowInfo}>
                      <Text style={styles.saleRowTitle} numberOfLines={1}>{sale.title}</Text>
                      <Text style={styles.saleRowSub} numberOfLines={1}>{sale.address}, {sale.city}</Text>
                      <View style={styles.saleRowMeta}>
                        <Ionicons name="calendar-outline" size={11} color="#bbb" />
                        <Text style={styles.saleRowDate}>
                          {new Date(sale.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Text>
                        <View style={[styles.typePill, { backgroundColor: (cat?.color ?? '#C0392B') + '15' }]}>
                          <Text style={[styles.typePillText, { color: cat?.color ?? '#C0392B' }]}>{cat?.label}</Text>
                        </View>
                      </View>
                      {(sale._count?.reviews ?? 0) > 0 && (
                        <View style={styles.saleRowStars}>
                          {[1,2,3,4,5].map((star: number) => (
                            <Ionicons
                              key={star}
                              name="star"
                              size={10}
                              color={star <= Math.round((sale.avgRating ?? 0)) ? '#D4870A' : '#e0e0e0'}
                            />
                          ))}
                          <Text style={styles.saleRowReviewCount}>({sale._count.reviews})</Text>
                        </View>
                      )}
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
                    <View style={[styles.modalTypeBox, { backgroundColor: (cat?.color ?? '#C0392B') + '15' }]}>
                      <Ionicons name={cat?.icon ?? 'pricetag-outline'} size={20} color={cat?.color ?? '#C0392B'} />
                      <Text style={[styles.modalTypeText, { color: cat?.color ?? '#C0392B' }]}>{cat?.label}</Text>
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
                    <Ionicons name="location-outline" size={16} color="#C0392B" />
                    <Text style={styles.modalInfoText}>{selectedSale.address}, {selectedSale.city}, {selectedSale.state} {selectedSale.zip}</Text>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Ionicons name="calendar-outline" size={16} color="#C0392B" />
                    <Text style={styles.modalInfoText}>
                      {new Date(selectedSale.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
                      {' — '}
                      {new Date(selectedSale.endDate).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
                    </Text>
                  </View>

                  {selectedSale.startTime && (
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="time-outline" size={16} color="#C0392B" />
                      <Text style={styles.modalInfoText}>{selectedSale.startTime} — {selectedSale.endTime}</Text>
                    </View>
                  )}

                  <StarRating
                    saleId={selectedSale.id}
                    currentCount={selectedSale._count?.reviews ?? 0}
                    avgRating={selectedSale.avgRating ?? 0}
                  />
                  <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.modalDirectionsBtn} onPress={() => {
                      const addr = encodeURIComponent(`${selectedSale.address}, ${selectedSale.city}, ${selectedSale.state}`);
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${addr}`, '_blank');
                    }}>
                      <Ionicons name="navigate-outline" size={18} color="#fff" />
                      <Text style={styles.modalDirectionsText}>Get Directions</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.modalSaveBtn}
                      onPress={() => {
                        if (!userId) { alert('Sign in to save sales'); return; }
                        if (selectedSale) toggleFavorite.mutate({ saleId: selectedSale.id, clerkUserId: userId });
                      }}
                    >
                      <Ionicons 
                        name={favorites.has(selectedSale?.id ?? '') ? 'heart' : 'heart-outline'} 
                        size={18} 
                        color="#C0392B" 
                      />
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
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: '#e8e8e8',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
    marginRight: 8,
  },
  chipLabel: { fontSize: 13, fontWeight: '600', color: '#444' },
  chipBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  chipBadgeText: { fontSize: 11, fontWeight: '700' },
  categoryCard: {
    width: 110, overflow: 'hidden',
    backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#f0f0f0',
  },
  categorySelectedOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 14, borderWidth: 2.5 },
  categoryIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  categoryBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, paddingVertical: 6, gap: 4 },
  categoryLabel: { fontSize: 10, fontWeight: '600', color: '#555', textAlign: 'center' },
  countBadge: { borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1 },
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
  clearFilterBtn: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#C0392B15', borderRadius: 20 },
  clearFilterText: { fontSize: 13, color: '#C0392B', fontWeight: '600' },
  saleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f8f8f8' },
  saleIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  saleRowInfo: { flex: 1 },
  saleRowTitle: { fontSize: 14, fontWeight: '700', color: '#111' },
  saleRowSub: { fontSize: 12, color: '#999', marginTop: 2 },
  saleRowMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  saleRowDate: { fontSize: 11, color: '#bbb' },
  saleRowStars: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
  saleRowReviewCount: { fontSize: 10, color: '#bbb', marginLeft: 2 },
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
    flex: 1, backgroundColor: '#C0392B', borderRadius: 14, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  modalDirectionsText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  radiusPanel: {
    position: 'absolute', left: 12, right: 60, top: 12,
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  radiusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  radiusLabel: { flex: 1, fontSize: 13, color: '#555', fontWeight: '600' },
  radiusValue: { color: '#C0392B', fontWeight: '800' },
  sliderTrack: { flexDirection: 'row', justifyContent: 'space-between' },
  sliderTick: {
    flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8,
    backgroundColor: '#f5f5f5', marginHorizontal: 3,
  },
  sliderTickActive: { backgroundColor: '#C0392B' },
  sliderTickText: { fontSize: 12, fontWeight: '700', color: '#999' },
  sliderTickTextActive: { color: '#fff' },
  modalSaveBtn: {
    width: 52, height: 52, borderRadius: 14, borderWidth: 1.5, borderColor: '#e0e0e0',
    alignItems: 'center', justifyContent: 'center',
  },
});
