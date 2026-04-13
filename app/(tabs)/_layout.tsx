import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ icon, iconFocused, label, focused }: { 
  icon: IoniconsName, iconFocused: IoniconsName, label: string, focused: boolean 
}) {
  return (
    <View style={styles.tabItem}>
      <Ionicons name={focused ? iconFocused : icon} size={24} color={focused ? '#C0392B' : '#9CA3AF'} />
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: styles.tabBar,
      tabBarItemStyle: styles.tabBarItem,
    }}>
      <Tabs.Screen name="index" options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon icon="map-outline" iconFocused="map" label="Explore" focused={focused} />
        ),
      }} />
      <Tabs.Screen name="list" options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon icon="layers-outline" iconFocused="layers" label="List" focused={focused} />
        ),
      }} />
      <Tabs.Screen name="post" options={{
        tabBarIcon: ({ focused }) => (
          <View style={styles.postBtnWrapper}>
            <View style={styles.postBtn}>
              <Ionicons name="add" size={28} color="#fff" />
            </View>
            <Text style={styles.postLabel}>Post</Text>
          </View>
        ),
      }} />
      <Tabs.Screen name="saved" options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon icon="bookmark-outline" iconFocused="bookmark" label="Saved" focused={focused} />
        ),
      }} />
      <Tabs.Screen name="profile" options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon icon="person-outline" iconFocused="person" label="Profile" focused={focused} />
        ),
      }} />
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0',
    height: 70, paddingBottom: 8, paddingTop: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 8,
  },
  tabBarItem: { paddingVertical: 4 },
  tabItem: { alignItems: 'center', justifyContent: 'center', gap: 3 },
  tabLabel: { fontSize: 10, fontWeight: '500', color: '#9CA3AF', letterSpacing: 0.2 },
  tabLabelFocused: { color: '#C0392B', fontWeight: '600' },
  postBtnWrapper: { alignItems: 'center', justifyContent: 'center', gap: 3, marginTop: -14 },
  postBtn: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: '#C0392B',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#C0392B', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 8,
  },
  postLabel: { fontSize: 10, fontWeight: '600', color: '#C0392B' },
});
