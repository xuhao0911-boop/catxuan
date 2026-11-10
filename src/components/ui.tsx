import React, { useEffect, useRef, useState } from 'react';
import { ColorValue, Image, ImageStyle, Pressable, ScrollView, StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Breed, catalogLabel, sizeLabel } from '../data/catalog';
import { generatedArtwork } from '../data/artwork';
import { colors as c } from '../theme';
import { FieldMotif } from './graphics';

export function Icon({ name, size = 22, color = c.text }: { name: React.ComponentProps<typeof Ionicons>['name']; size?: number; color?: ColorValue }) { return <Ionicons name={name} size={size} color={color} accessible={false} aria-hidden />; }
export function IconButton({ name, label, onPress, active, style }: { name: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void; active?: boolean; style?: ViewStyle }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: active }} aria-pressed={active} onPress={onPress} style={({ pressed }) => [s.iconButton, active && { backgroundColor: c.pale }, pressed && { opacity: 0.65 }, style]}><Icon name={name} color={active ? c.green : c.text} /></Pressable>;
}
export function Button({ title, onPress, secondary = false, disabled = false, icon, style }: { title: string; onPress: () => void; secondary?: boolean; disabled?: boolean; icon?: React.ComponentProps<typeof Ionicons>['name']; style?: ViewStyle }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={title} disabled={disabled} onPress={onPress} style={({ pressed }) => [s.button, secondary && s.buttonSecondary, disabled && { opacity: 0.45 }, pressed && { opacity: 0.78 }, style]}>{icon && <Icon name={icon} size={19} color={secondary ? c.green : 'white'} />}<Text style={[s.buttonText, secondary && { color: c.green }]}>{title}</Text></Pressable>;
}
export function Screen({ children, scroll = true, contentStyle, onEndReached, scrollResetKey }: React.PropsWithChildren<{ scroll?: boolean; contentStyle?: ViewStyle; onEndReached?: () => void; scrollResetKey?: string }>) {
  const scrollRef = useRef<ScrollView>(null);
  const endReachedHeight = useRef(0);
  useEffect(() => { endReachedHeight.current = 0; scrollRef.current?.scrollTo({ y: 0, animated: false }); }, [scrollResetKey]);
  return <SafeAreaView edges={['top', 'left', 'right']} style={s.screen}>{scroll ? <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={[s.content, contentStyle]} scrollEventThrottle={200} onScroll={onEndReached ? event => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    if (contentSize.height > layoutMeasurement.height && contentSize.height - contentOffset.y - layoutMeasurement.height < 450 && endReachedHeight.current !== contentSize.height) {
      endReachedHeight.current = contentSize.height;
      onEndReached();
    }
  } : undefined}>{children}</ScrollView> : children}</SafeAreaView>;
}
export function Title({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) { return <View style={s.titleRow}><View style={{ flex: 1 }}><Text accessibilityRole="header" style={s.title}>{title}</Text>{subtitle && <Text style={s.subtitle}>{subtitle}</Text>}</View>{action}</View>; }
export function Section({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) { return <View style={s.section}><Text style={s.sectionTitle}>{title}</Text>{action && <Pressable accessibilityRole="button" onPress={onPress} style={{ minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 3 }}><Text style={{ fontSize: 13, color: c.green }}>{action}</Text><Icon name="chevron-forward" size={15} color={c.green} /></Pressable>}</View>; }
export function Search({ value, onChange, placeholder = '搜索猫种名称或别名', onSubmit }: { value: string; onChange: (value: string) => void; placeholder?: string; onSubmit?: () => void }) {
  const [focused, setFocused] = useState(false);
  return <View style={[s.search, focused && { borderColor: c.green }]}><Icon name="search-outline" size={21} color={c.muted} /><TextInput accessibilityLabel={placeholder} value={value} onChangeText={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder={placeholder} placeholderTextColor={c.muted} style={s.searchInput} returnKeyType="search" onSubmitEditing={onSubmit} autoCapitalize="none" autoCorrect={false} />{!!value && <IconButton name="close-circle" label="清空搜索" onPress={() => onChange('')} style={{ backgroundColor: 'transparent', width: 35, height: 40 }} />}</View>;
}
export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) { return <Pressable accessibilityRole="button" accessibilityState={{ selected }} aria-pressed={selected} onPress={onPress} style={[s.chip, selected && s.chipActive]}><Text style={[s.chipText, selected && { color: 'white', fontWeight: '600' }]}>{label}</Text></Pressable>; }
export function CatPhoto({ breed, style, color, form, onLoad }: { breed: Breed; style?: ImageStyle; color?: string; form?: string; onLoad?: () => void }) {
  const image = generatedArtwork(breed.id, color, form);
  return <View style={[{ backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, style as ViewStyle]}>{image !== undefined ? <Image accessibilityLabel={breed.name + '插画'} source={image} onLoad={onLoad} resizeMode="contain" style={{ width: '100%', height: '100%' }} /> : <View><Icon name="paw-outline" color={c.muted} /><Text style={{ fontSize: 12, color: c.muted }}>外观未收录</Text></View>}</View>;
}
export function BreedCard({ breed }: { breed: Breed }) {
  return <View style={s.card}>
    <Pressable accessibilityRole="button" accessibilityLabel={'查看' + breed.name} onPress={() => router.push('/breed/' + breed.id)}><CatPhoto breed={breed} style={s.cardPhoto} /></Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel={'打开' + breed.name + '档案'} onPress={() => router.push('/breed/' + breed.id)} style={s.cardCaption}><Text numberOfLines={1} style={s.cardTitle}>{breed.name}</Text><Text numberOfLines={1} style={s.metaText}>{breed.size === '多种' ? '多体型' : breed.size || catalogLabel(breed)}</Text></Pressable>
  </View>;
}
export function BreedGrid({ list }: { list: Breed[] }) { return <View style={s.grid}>{list.map(b => <View key={b.id} style={{ width: '48.3%' }}><BreedCard breed={b} /></View>)}</View>; }
export function Empty({ title, description, icon = 'paw-outline', action, art }: { title: string; description: string; icon?: React.ComponentProps<typeof Ionicons>['name']; action?: React.ReactNode; art?: React.ReactNode }) { return <View style={s.empty}>{art || <FieldMotif size={148} icon={icon} />}<Text style={s.emptyTitle}>{title}</Text>{!!description && <Text style={s.emptyDescription}>{description}</Text>}{action && <View style={{ marginTop: 22, minWidth: 150 }}>{action}</View>}</View>; }
export function Fold({ title, children }: React.PropsWithChildren<{ title: string }>) { const [open, setOpen] = useState(false);return <View style={{ borderBottomWidth: 1, borderBottomColor: c.border }}><Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ expanded: open }} aria-expanded={open} onPress={() => setOpen(previous => !previous)} style={{ minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Text style={{ color: c.text, fontSize: 15, fontWeight: '600' }}>{title}</Text><Icon name={open ? 'remove' : 'add'} size={19} color={c.green} /></Pressable>{open && <View style={{ paddingBottom: 18 }}>{children}</View>}</View>; }
export function Level({ value, label }: { value: number | null; label: string }) { return <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}><Text style={{ color: c.text, fontSize: 14 }}>{label}</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>{Array.from({ length: 5 }, (_, i) => <View key={i} style={{ width: 20, height: 5, borderRadius: 3, backgroundColor: value !== null && i < value ? c.green : c.border }} />)}<Text style={{ fontSize: 12, color: c.muted, minWidth: 28, textAlign: 'right' }}>{value === null ? '—' : value + '/5'}</Text></View></View>; }
export function BreedRow({ breed, trailing, onPress }: { breed: Breed; trailing?: React.ReactNode; onPress?: () => void }) { return <Pressable accessibilityRole="button" onPress={onPress || (() => router.push('/breed/' + breed.id))} style={s.listRow}><CatPhoto breed={breed} style={{ width: 62, height: 62, borderRadius: 13 }} /><View style={{ flex: 1, gap: 5 }}><Text style={{ fontSize: 15, fontWeight: '600', color: c.text }}>{breed.name}</Text><Text numberOfLines={1} style={{ fontSize: 12, color: c.muted }}>{[breed.size ? sizeLabel(breed.size) : catalogLabel(breed), breed.coat, '活跃' + breed.activity].filter(Boolean).join(' · ')}</Text></View>{trailing || <Icon name="chevron-forward" size={17} color={c.muted} />}</Pressable>; }
export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background }, content: { paddingHorizontal: 20, paddingBottom: 28 },
  titleRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 25, paddingBottom: 23, gap: 12 },
  title: { color: c.text, fontSize: 30, lineHeight: 40, fontWeight: '700', letterSpacing: -0.8 }, subtitle: { color: c.muted, fontSize: 13, marginTop: 5, lineHeight: 20 },
  section: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 13 }, sectionTitle: { fontSize: 17, fontWeight: '700', color: c.text },
  iconButton: { height: 44, width: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: c.paper },
  search: { backgroundColor: c.paper, borderWidth: 1, borderColor: c.border, borderRadius: 18, minHeight: 52, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 10 }, searchInput: { flex: 1, height: 50, fontSize: 14, color: c.text, minWidth: 0, outlineWidth: 0 },
  button: { minHeight: 50, paddingHorizontal: 19, paddingVertical: 13, borderRadius: 16, backgroundColor: c.green, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' }, buttonSecondary: { backgroundColor: c.pale }, buttonText: { color: 'white', fontSize: 14, fontWeight: '600' },
  chip: { paddingHorizontal: 16, minHeight: 42, justifyContent: 'center', borderRadius: 14, backgroundColor: c.paper, borderWidth: 1, borderColor: c.border }, chipActive: { backgroundColor: c.green, borderColor: c.green }, chipText: { color: c.muted, fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14 }, card: { borderRadius: 24, overflow: 'hidden', backgroundColor: c.paper, paddingBottom: 14, boxShadow: '0 4px 18px rgba(30,60,42,0.035)' }, cardPhoto: { width: '100%', aspectRatio: 1.08 },
  cardCaption: { alignItems: 'center', paddingHorizontal: 13, paddingTop: 5, gap: 4 }, cardTitle: { width: '100%', textAlign: 'center', color: c.text, fontSize: 16, fontWeight: '600', lineHeight: 25 }, tag: { fontSize: 12, color: c.green, backgroundColor: c.pale, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7 }, metaText: { color: c.muted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  empty: { alignItems: 'center', paddingVertical: 35, paddingHorizontal: 14 }, emptyIcon: { width: 78, height: 78, borderRadius: 39, alignItems: 'center', justifyContent: 'center', backgroundColor: c.pale }, emptyTitle: { fontSize: 21, fontWeight: '600', color: c.text, marginTop: 12 }, emptyDescription: { fontSize: 14, color: c.muted, lineHeight: 23, marginTop: 9, textAlign: 'center' },
  listRow: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.border }, note: { color: c.muted, fontSize: 12, lineHeight: 20 },
});
