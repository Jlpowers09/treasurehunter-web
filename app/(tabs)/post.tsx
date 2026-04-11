import {
  View, Text, StyleSheet, TouchableOpacity, Platform,
  TextInput, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { trpc } from '../../lib/trpc';


type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const SALE_TYPES: { type: string; label: string; icon: IoniconsName; color: string }[] = [
  { type: 'YARD_SALE', label: 'Yard Sale', icon: 'home-outline', color: '#FF385C' },
  { type: 'ESTATE_SALE', label: 'Estate Sale', icon: 'business-outline', color: '#7C3AED' },
  { type: 'GARAGE_SALE', label: 'Garage Sale', icon: 'car-outline', color: '#0EA5E9' },
  { type: 'MOVING_SALE', label: 'Moving Sale', icon: 'cube-outline', color: '#F59E0B' },
  { type: 'THRIFT_STORE', label: 'Thrift Store', icon: 'shirt-outline', color: '#10B981' },
  { type: 'FLEA_MARKET', label: 'Flea Market', icon: 'storefront-outline', color: '#F97316' },
];

function AddressAutocomplete({ onSelect }: { 
  onSelect: (address: string, city: string, state: string, zip: string) => void 
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showList, setShowList] = useState(false);

  const search = async (text: string) => {
    setQuery(text);
    if (text.length < 3) { setSuggestions([]); return; }
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/places/autocomplete?input=${encodeURIComponent(text)}`
      );
      const data = await res.json();
      setSuggestions(data.predictions ?? []);
      setShowList(true);
    } catch {}
  };

  const selectPlace = async (placeId: string, description: string) => {
    setQuery(description.split(',')[0]);
    setShowList(false);
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/places/details?place_id=${placeId}`
      );
      const data = await res.json();
      const components = data.result?.address_components ?? [];
      const get = (type: string) => components.find((c: any) => c.types.includes(type))?.long_name ?? '';
      const getShort = (type: string) => components.find((c: any) => c.types.includes(type))?.short_name ?? '';
      onSelect(
        description.split(',')[0],
        get('locality') || get('sublocality'),
        getShort('administrative_area_level_1'),
        get('postal_code')
      );
    } catch {}
  };

  return (
    <View style={{ zIndex: 999 }}>
      <TextInput
        style={acStyles.input}
        placeholder="Start typing your address..."
        placeholderTextColor="#bbb"
        value={query}
        onChangeText={search}
      />
      {showList && suggestions.length > 0 && (
        <View style={acStyles.list}>
          {suggestions.map((s: any) => (
            <TouchableOpacity
              key={s.place_id}
              style={acStyles.item}
              onPress={() => selectPlace(s.place_id, s.description)}
            >
              <Ionicons name="location-outline" size={14} color="#FF385C" />
              <Text style={acStyles.itemText} numberOfLines={1}>{s.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const acStyles = StyleSheet.create({
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e8e8e8',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#333',
  },
  list: {
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e8e8e8',
    marginTop: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  itemText: { fontSize: 13, color: '#333', flex: 1 },
});

export default function PostScreen() {
  const [step, setStep] = useState(1);
  const [saleType, setSaleType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [success, setSuccess] = useState(false);

  const createSale = trpc.sale.create.useMutation({
    onSuccess: () => setSuccess(true),
    onError: (err: any) => Alert.alert('Error', err.message),
  });

  const selectedType = SALE_TYPES.find(t => t.type === saleType);

  const handleSubmit = async () => {
  if (!title || !saleType || !address || !city || !state || !zip || !startDate || !endDate) {
    Alert.alert('Missing fields', 'Please fill in all required fields.');
    return;
  }

  // Geocode the address to get real lat/lng
  let lat = 0, lng = 0;
  try {
    const fullAddress = encodeURIComponent(`${address}, ${city}, ${state} ${zip}`);
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/api/places/geocode?address=${fullAddress}`
    );
    const data = await res.json();
    lat = data.lat ?? 0;
    lng = data.lng ?? 0;
  } catch (e) {
    console.warn('Geocode failed, using 0,0');
  }

  createSale.mutate({
    title, description, type: saleType as any,
    address, city, state, zip,
    lat, lng,
    startDate, endDate, startTime, endTime,
  });
};

  const resetForm = () => {
    setSuccess(false); setStep(1); setSaleType(''); setTitle('');
    setDescription(''); setAddress(''); setCity(''); setState('');
    setZip(''); setStartDate(''); setEndDate(''); setStartTime(''); setEndTime('');
  };

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.header}><Text style={styles.title}>Post a Sale</Text></View>
        <View style={styles.successBody}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color="#10B981" />
          </View>
          <Text style={styles.successTitle}>Sale Posted!</Text>
          <Text style={styles.successSub}>Your sale is now live and visible to treasure hunters nearby.</Text>
          <TouchableOpacity style={[styles.btn, { paddingHorizontal: 24 }]} onPress={resetForm}>
            <Text style={[styles.btnText, { fontSize: 14 }]}>Post Another Sale</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {step > 1 && (
            <TouchableOpacity onPress={() => setStep(step - 1)} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={20} color="#333" />
            </TouchableOpacity>
          )}
          <Text style={styles.title}>Post a Sale</Text>
        </View>
        <Text style={styles.stepLabel}>Step {step} of 3</Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` as any }]} />
      </View>
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What type of sale?</Text>
            <Text style={styles.stepSub}>Choose the category that best describes your sale.</Text>
            <View style={styles.typeGrid}>
              {SALE_TYPES.map(t => (
                <TouchableOpacity
                  key={t.type}
                  style={[styles.typeCard, saleType === t.type && { borderColor: t.color, borderWidth: 2 }]}
                  onPress={() => setSaleType(t.type)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.typeIconBox, { backgroundColor: saleType === t.type ? t.color : t.color + '15' }]}>
                    <Ionicons name={t.icon} size={24} color={saleType === t.type ? '#fff' : t.color} />
                  </View>
                  <Text style={[styles.typeLabel, saleType === t.type && { color: t.color, fontWeight: '700' }]}>
                    {t.label}
                  </Text>
                  {saleType === t.type && (
                    <Ionicons name="checkmark-circle" size={16} color={t.color} style={styles.checkmark} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Sale Details</Text>
            <Text style={styles.stepSub}>Tell buyers what you're selling.</Text>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Title *</Text>
              <TextInput style={styles.input} placeholder="e.g. Moving Sale — Furniture, Tools & More"
                placeholderTextColor="#bbb" value={title} onChangeText={setTitle} />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="Describe what you're selling..."
                placeholderTextColor="#bbb" value={description} onChangeText={setDescription}
                multiline numberOfLines={4} />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Address *</Text>
              <AddressAutocomplete
                onSelect={(addr, c, s, z) => {
                  setAddress(addr);
                  setCity(c);
                  setState(s);
                  setZip(z);
                }}
              />
            </View>
            <View style={styles.row}>
              <View style={[styles.fieldGroup, { flex: 2 }]}>
                <Text style={styles.fieldLabel}>City *</Text>
                <TextInput style={styles.input} placeholder="City"
                  placeholderTextColor="#bbb" value={city} onChangeText={setCity} />
              </View>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>State *</Text>
                <TextInput style={styles.input} placeholder="CA"
                  placeholderTextColor="#bbb" value={state} onChangeText={setState} maxLength={2} />
              </View>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>Zip *</Text>
                <TextInput style={styles.input} placeholder="12345"
                  placeholderTextColor="#bbb" value={zip} onChangeText={setZip} maxLength={5} />
              </View>
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>When is your sale?</Text>
            <Text style={styles.stepSub}>Set the dates and times.</Text>
            <View style={styles.row}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>Start Date *</Text>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e: any) => setStartDate(e.target.value)}
                  style={{
                    backgroundColor: '#fff', border: '1px solid #e8e8e8',
                    borderRadius: 12, padding: '12px 14px', fontSize: 14,
                    color: '#333', width: '100%', boxSizing: 'border-box',
                    outline: 'none', fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                />
              </View>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>End Date *</Text>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e: any) => setEndDate(e.target.value)}
                  style={{
                    backgroundColor: '#fff', border: '1px solid #e8e8e8',
                    borderRadius: 12, padding: '12px 14px', fontSize: 14,
                    color: '#333', width: '100%', boxSizing: 'border-box',
                    outline: 'none', fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>Start Time</Text>
                <select
                  value={startTime}
                  onChange={(e: any) => setStartTime(e.target.value)}
                  style={{
                    backgroundColor: '#fff', border: '1px solid #e8e8e8',
                    borderRadius: '12px', padding: '12px 14px', fontSize: '14px',
                    color: '#333', width: '100%', outline: 'none',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    WebkitAppearance: 'none', appearance: 'none', cursor: 'pointer',
                  }}
                >
                  <option value="">Select time</option>
                  {['6:00 AM','6:30 AM','7:00 AM','7:30 AM','8:00 AM','8:30 AM','9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM','5:00 PM','5:30 PM','6:00 PM','6:30 PM','7:00 PM'].map((t: string) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </View>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>End Time</Text>
                <select
                  value={endTime}
                  onChange={(e: any) => setEndTime(e.target.value)}
                  style={{
                    backgroundColor: '#fff', border: '1px solid #e8e8e8',
                    borderRadius: '12px', padding: '12px 14px', fontSize: '14px',
                    color: '#333', width: '100%', outline: 'none',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    WebkitAppearance: 'none', appearance: 'none', cursor: 'pointer',
                  }}
                >
                  <option value="">Select time</option>
                  {['6:00 AM','6:30 AM','7:00 AM','7:30 AM','8:00 AM','8:30 AM','9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM','5:00 PM','5:30 PM','6:00 PM','6:30 PM','7:00 PM'].map((t: string) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </View>
            </View>
            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Summary</Text>
              <View style={styles.summaryRow}>
                <Ionicons name={selectedType?.icon ?? 'pricetag-outline'} size={16} color={selectedType?.color ?? '#FF385C'} />
                <Text style={styles.summaryText}>{selectedType?.label}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="text-outline" size={16} color="#999" />
                <Text style={styles.summaryText} numberOfLines={1}>{title}</Text>
              </View>
              {description ? (
                <View style={styles.summaryRow}>
                  <Ionicons name="document-text-outline" size={16} color="#999" />
                  <Text style={styles.summaryText} numberOfLines={2}>{description}</Text>
                </View>
              ) : null}
              <View style={styles.summaryRow}>
                <Ionicons name="location-outline" size={16} color="#999" />
                <Text style={styles.summaryText}>{address}, {city}, {state} {zip}</Text>
              </View>
            </View>
          </View>
        )}
        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.bottomAction}>
        {step < 3 ? (
          <TouchableOpacity
            style={[styles.btn, (!saleType && step === 1) && styles.btnDisabled]}
            onPress={() => { if (step === 1 && !saleType) return; setStep(step + 1); }}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.btn, createSale.isPending && styles.btnDisabled]}
            onPress={handleSubmit} disabled={createSale.isPending} activeOpacity={0.8}
          >
            {createSale.isPending ? <ActivityIndicator color="#fff" /> : (
              <>
                <Ionicons name="checkmark" size={18} color="#fff" />
                <Text style={styles.btnText}>Post Sale</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800', color: '#111', letterSpacing: -0.5 },
  stepLabel: { fontSize: 13, color: '#999', fontWeight: '500' },
  progressBar: { height: 3, backgroundColor: '#f0f0f0' },
  progressFill: { height: 3, backgroundColor: '#FF385C', borderRadius: 2 },
  body: { flex: 1 },
  stepContent: { padding: 20 },
  stepTitle: { fontSize: 22, fontWeight: '800', color: '#111', marginBottom: 6 },
  stepSub: { fontSize: 14, color: '#999', marginBottom: 24, lineHeight: 20 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  typeCard: {
    width: '47%', padding: 16, borderRadius: 16, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#f0f0f0', alignItems: 'center', gap: 8, position: 'relative',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  typeIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  typeLabel: { fontSize: 13, fontWeight: '600', color: '#555', textAlign: 'center' },
  checkmark: { position: 'absolute', top: 8, right: 8 },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e8e8e8',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#333',
  },
  textArea: { height: 100, textAlignVertical: 'top', paddingTop: 12 },
  row: { flexDirection: 'row', gap: 12 },
  summary: { marginTop: 20, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f0f0f0', gap: 10 },
  summaryTitle: { fontSize: 13, fontWeight: '700', color: '#111', marginBottom: 4 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryText: { fontSize: 13, color: '#555', flex: 1 },
  bottomAction: {
    padding: 20, paddingBottom: Platform.OS === 'web' ? 20 : 34,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f5f5f5',
  },
  btn: {
    backgroundColor: '#FF385C', borderRadius: 14, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  successBody: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  successIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#10B98115', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#111' },
  successSub: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 8, lineHeight: 20, marginBottom: 8 },
});
