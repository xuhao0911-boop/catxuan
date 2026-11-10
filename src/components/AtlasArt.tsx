import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { byId } from '../data/catalog';
import { colors as c } from '../theme';
import { CatPhoto, Icon } from './ui';

export function AtlasHero() {
  const date = new Date();
  const ids = ['british-shorthair', 'ragdoll', 'maine-coon', 'american-shorthair'];
  const breed = byId[ids[(date.getFullYear() + date.getMonth() + date.getDate()) % ids.length]];
  return <Pressable accessibilityRole="button" accessibilityLabel={'今日发现：' + breed.name} onPress={() => router.push('/breed/' + breed.id)} style={({ pressed }) => ({ borderRadius: 24, overflow: 'hidden', marginTop: 16, backgroundColor: '#FFFFFF', opacity: pressed ? .82 : 1 })}>
    <View style={{ minHeight: 139, padding: 19, justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
      <View pointerEvents="none" accessibilityElementsHidden style={{ position: 'absolute', width: 205, height: 205, borderRadius: 105, backgroundColor: '#E8F0DE', left: -36, top: -34 }} />
      <View pointerEvents="none" accessibilityElementsHidden style={{ position: 'absolute', width: 110, height: 110, borderRadius: 56, borderWidth: 1, borderColor: '#C4D8B4', left: -40, top: 48 }} />
      <View pointerEvents="none" accessibilityElementsHidden style={{ position: 'absolute', width: 7, height: 7, borderRadius: 5, backgroundColor: '#B2CA98', left: 145, top: 18 }} />
      <View style={{ width: '51%', zIndex: 1, gap: 8 }}>
        <Text style={{ fontSize: 12, color: c.green }}>今日发现</Text>
        <Text numberOfLines={2} style={{ fontSize: 21, lineHeight: 29, fontWeight: '700', color: c.text }}>{breed.name}</Text>
        <View style={{ width: 27, height: 27, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}><Icon name="arrow-forward" size={15} color={c.green} /></View>
      </View>
      <CatPhoto breed={breed} style={{ position: 'absolute', right: 3, bottom: 2, width: '49%', height: 133 }} />
    </View>
  </Pressable>;
}

export function CollectionArt({ compare = false }: { compare?: boolean }) {
  const ids = compare ? ['british-shorthair', 'ragdoll'] : ['british-shorthair'];
  return <View aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: 262, height: 208, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ position: 'absolute', width: 230, height: 140, borderRadius: 90, backgroundColor: c.pale, transform: [{ rotate: '-15deg' }] }} />
    <View style={{ position: 'absolute', left: 15, top: 30, width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: '#A9BFA5' }} />
    {ids.map((id, i) => <View key={id} style={{ position: 'absolute', width: compare ? 136 : 175, height: compare ? 160 : 190, padding: 9, backgroundColor: '#FFFFFF', borderRadius: 23, left: compare ? 17 + i * 96 : 42, top: compare ? 24 - i * 7 : 7, transform: [{ rotate: (compare ? i ? '9deg' : '-9deg' : '-7deg') }], boxShadow: '0 8px 22px rgba(40,70,45,0.07)' }}><CatPhoto breed={byId[id]} style={{ flex: 1, width: '100%', borderRadius: 16 }} /><View style={{ width: '48%', height: 4, borderRadius: 3, backgroundColor: c.pale, alignSelf: 'center', marginTop: 7, marginBottom: 5 }} /></View>)}
    <View style={{ position: 'absolute', bottom: 21, right: 23, width: 44, height: 44, borderRadius: 16, backgroundColor: c.green, borderWidth: 3, borderColor: c.background, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '9deg' }] }}><Icon name={compare ? 'git-compare-outline' : 'heart'} size={20} color="#FFFFFF" /></View>
  </View>;
}
