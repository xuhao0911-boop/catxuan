import React from 'react';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors as c } from '../../theme';
import { Icon } from '../../components/ui';
import { useAtlas } from '../../state/store';

export default function TabLayout() {
  const { compare } = useAtlas();
  const insets = useSafeAreaInsets(); const bottom = Math.max(insets.bottom, 14);
  const tabIcon = (name: React.ComponentProps<typeof Icon>['name'], focused: boolean, color: React.ComponentProps<typeof Icon>['color']) => <View style={{ width: 50, height: 34, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: focused ? c.pale : 'transparent' }}><Icon name={name} color={color} size={22} /></View>;
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: c.green, tabBarInactiveTintColor: c.muted, tabBarStyle: { backgroundColor: '#FFFFFF', borderTopWidth: 0, height: 70 + bottom, paddingTop: 9, paddingBottom: bottom, boxShadow: '0 -5px 24px rgba(30,60,42,0.035)' }, tabBarLabelStyle: { fontSize: 12, marginTop: 3, fontWeight: '500' }, sceneStyle: { backgroundColor: c.background } }}>
    <Tabs.Screen name="index" options={{ title: '图鉴', tabBarIcon: ({ color, focused }) => tabIcon(focused ? 'book' : 'book-outline', focused, color) }} />
    <Tabs.Screen name="atlas" options={{ href: null, title: '筛选' }} />
    <Tabs.Screen name="recognize" options={{ title: '识别', tabBarIcon: ({ color, focused }) => tabIcon('scan-outline', focused, color) }} />
    <Tabs.Screen name="compare" options={{ title: '对比', tabBarBadge: compare.length || undefined, tabBarBadgeStyle: { backgroundColor: c.green, fontSize: 10 }, tabBarIcon: ({ color, focused }) => tabIcon('git-compare-outline', focused, color) }} />
    <Tabs.Screen name="favorites" options={{ title: '收藏', tabBarIcon: ({ color, focused }) => tabIcon(focused ? 'heart' : 'heart-outline', focused, color) }} />
  </Tabs>;
}
