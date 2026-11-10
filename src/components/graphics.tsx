import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors as c } from '../theme';

export function BrandMark({ size = 36 }: { size?: number }) {
  return <View aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: size, height: size, borderRadius: size * .35, backgroundColor: c.green, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-7deg' }] }}>
    <Ionicons name="paw" size={size * .57} color="#F3F7EB" style={{ transform: [{ rotate: '7deg' }] }} />
    <View style={{ position: 'absolute', right: -3, top: -3, width: size * .25, height: size * .25, borderRadius: size, backgroundColor: c.lime, borderWidth: 2, borderColor: c.background }} />
  </View>;
}

export function FieldMotif({ size = 180, icon = 'paw-outline' }: { size?: number; icon?: React.ComponentProps<typeof Ionicons>['name'] }) {
  return <View aria-hidden pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ position: 'absolute', width: size * .9, height: size * .7, borderRadius: size, backgroundColor: c.pale, transform: [{ rotate: '-28deg' }] }} />
    <View style={{ position: 'absolute', width: size * .95, height: size * .95, borderRadius: size, borderWidth: 1, borderColor: '#D5E2D6', transform: [{ scaleX: .72 }, { rotate: '23deg' }] }} />
    <View style={{ position: 'absolute', top: size * .12, right: size * .16, width: size * .09, height: size * .09, borderRadius: size, backgroundColor: c.lime }} />
    <View style={{ position: 'absolute', bottom: size * .15, left: size * .15, width: size * .045, height: size * .045, borderRadius: size, backgroundColor: '#97B5A1' }} />
    <Ionicons name={icon} color={c.green} size={size * .32} style={{ transform: [{ rotate: '-12deg' }] }} />
  </View>;
}

export function SizeRail({ value, onChange }: { value: string; onChange: (size: string) => void }) {
  return <View style={g.sizeRail} accessibilityLabel="体型筛选">{['全部', '小型', '中型', '大型'].map((size, i) => {
    const selected = value === size;
    return <Pressable key={size} accessibilityRole="button" accessibilityLabel={size === '全部' ? '全部体型' : size + '猫'} accessibilityState={{ selected }} aria-pressed={selected} onPress={() => onChange(size)} style={({ pressed }) => [g.sizeButton, selected && g.sizeSelected, pressed && { opacity: .72 }]}>
      <View style={{ height: 23, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={i ? 'paw-outline' : 'apps-outline'} color={selected ? '#FFFFFF' : c.green} size={i ? 12 + i * 3 : 18} /></View>
      <Text style={{ color: selected ? '#FFFFFF' : c.green, fontSize: 12, fontWeight: selected ? '600' : '400' }}>{size}</Text>
    </Pressable>;
  })}</View>;
}

export function ColorDots({ colors, count }: { colors: string[]; count?: number }) {
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
    <View style={{ flexDirection: 'row', paddingLeft: 3 }}>{colors.slice(0, 4).map((color, i) => <View key={i} style={{ width: 13, height: 13, borderRadius: 7, backgroundColor: color, borderWidth: 1.5, borderColor: '#FFFFFF', marginLeft: -3, boxShadow: '0 0 0 0.5px #D6DFD6' }} />)}</View>
    {count !== undefined && <Text style={{ fontSize: 12, color: c.muted }}>{count} 色</Text>}
  </View>;
}

export function colorDotTone(swatches: string[]) {
  return swatches.find(tone => {
    const hex = tone.replace('#', '');
    return hex.length === 6 && [0, 2, 4].some(index => parseInt(hex.slice(index, index + 2), 16) < 226);
  }) || swatches[0] || '#C7D2C8';
}

export function SegmentControl({ value, items, onChange }: { value: string; items: string[]; onChange: (value: string) => void }) {
  return <View style={g.segment}>{items.map(item => <Pressable key={item} accessibilityRole="button" accessibilityLabel={item} accessibilityState={{ selected: value === item }} aria-pressed={value === item} onPress={() => onChange(item)} style={[g.segmentButton, value === item && g.segmentSelected]}><Text style={{ fontSize: 14, fontWeight: value === item ? '600' : '400', color: value === item ? c.text : c.green }}>{item}</Text></Pressable>)}</View>;
}

const g = StyleSheet.create({
  sizeRail: { flexDirection: 'row', gap: 8, marginTop: 19, marginBottom: 17 },
  sizeButton: { flex: 1, minHeight: 65, alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: '#EAF1E9', borderRadius: 18 },
  sizeSelected: { backgroundColor: c.green },
  segment: { padding: 4, borderRadius: 16, backgroundColor: '#E7EEE7', flexDirection: 'row', gap: 4 },
  segmentButton: { flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  segmentSelected: { backgroundColor: '#FFFFFF', boxShadow: '0 2px 6px rgba(30,60,42,0.05)' },
});
