import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { BreedCard, Button, Chip, Empty, Icon, IconButton, Screen, Search, Title } from '../components/ui';
import { Breed, breeds, breedGroups, emptyFilters, Filters, groupNames, introducedCount, searchBreeds, sizes } from '../data/catalog';
import { colors as c } from '../theme';
import { BrandMark, SizeRail } from '../components/graphics';
import { AtlasHero } from '../components/AtlasArt';

export default function AtlasCatalog({ initialQuery, initialSize, home = false }: { initialQuery: string; initialSize: string; home?: boolean }) {
  const [filters, setFilters] = useState<Filters>({ ...emptyFilters, query: initialQuery, size: initialSize });
  const [sheet, setSheet] = useState(false);
  const listRef = useRef<FlatList<Breed>>(null);
  const list = useMemo(() => searchBreeds(filters), [filters]);
  useEffect(() => { listRef.current?.scrollToOffset({ offset: 0, animated: false }); }, [filters]);
  const extraCount = Number(filters.coat !== '全部') + Number(filters.energy !== '全部') + Number(filters.group !== '全部') + Number(filters.profile !== '全部');
  const set = (key: keyof Filters, value: string) => { setFilters(previous => ({ ...previous, [key]: value })); };
  return <Screen scroll={false}>
    <FlatList ref={listRef} accessibilityLabel="猫种列表" data={list} keyExtractor={breed => breed.id} numColumns={2}
      initialNumToRender={6} maxToRenderPerBatch={6} windowSize={5} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
      style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 }} columnWrapperStyle={{ justifyContent: 'space-between' }}
      renderItem={({ item }) => <View style={{ width: '48.3%', marginBottom: 14 }}><BreedCard breed={item} /></View>}
      ListHeaderComponent={<View>
    {home ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, paddingTop: 23, paddingBottom: 23 }}><BrandMark size={33} /><Text accessibilityRole="header" style={{ flex: 1, fontSize: 26, fontWeight: '700', letterSpacing: -.9, color: c.text }}>CatXuan</Text><IconButton name="information-circle-outline" label="关于 CatXuan" onPress={() => router.push('/about')} /></View> : <Title title="图鉴" action={<IconButton name="information-circle-outline" label="关于 CatXuan" onPress={() => router.push('/about')} />} />}
    <View style={{ flexDirection: 'row', gap: 9 }}><View style={{ flex: 1 }}><Search value={filters.query} onChange={q => set('query', q)} placeholder="搜索猫种" /></View><IconButton name="options-outline" label="筛选猫种" active={extraCount > 0} onPress={() => setSheet(true)} style={{ width: 52, height: 52, borderRadius: 17 }} /></View>
    {home && !filters.query.trim() && filters.size === '全部' && !extraCount && <AtlasHero />}
    <SizeRail value={filters.size} onChange={value => set('size', value)} />
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13, minHeight: 31, gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Text style={{ color: c.text, fontSize: 16, fontWeight: '600' }}>{filters.query || filters.size !== '全部' || extraCount ? '筛选结果' : '全部猫种'}</Text><Text accessibilityLabel={list.length + ' 个条目'} accessibilityLiveRegion="polite" style={{ color: c.muted, fontSize: 12 }}>{list.length} 条</Text></View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {home && <Pressable accessibilityRole="button" accessibilityLabel="打开选猫助手" onPress={() => router.push('/match')} style={({ pressed }) => ({ minHeight: 38, paddingHorizontal: 12, borderRadius: 13, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.pale, opacity: pressed ? .7 : 1 })}><Icon name="sparkles-outline" size={15} color={c.green} /><Text style={{ color: c.green, fontSize: 12 }}>选猫助手</Text></Pressable>}
        {!!extraCount && <Pressable accessibilityRole="button" accessibilityLabel="清除附加筛选" onPress={() => setFilters(previous => ({ ...emptyFilters, query: previous.query, size: previous.size }))} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: c.green, fontSize: 12 }}>清除</Text></Pressable>}
        {introducedCount < breeds.length && <Pressable accessibilityRole="button" accessibilityLabel="仅看有介绍的猫种" accessibilityState={{ selected: filters.profile === '有介绍' }} onPress={() => set('profile', filters.profile === '有介绍' ? '全部' : '有介绍')} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 5 }}><Icon name={filters.profile === '有介绍' ? 'checkmark-circle' : 'ellipse-outline'} size={16} color={c.green} /><Text style={{ color: c.green, fontSize: 12 }}>有介绍</Text></Pressable>}
      </View>
    </View>
      </View>}
      ListEmptyComponent={<Empty title="未找到猫种" description="更换关键词或筛选条件。" icon="search-outline" action={<Button title="清除筛选" onPress={() => setFilters(emptyFilters)} />} />}
    />
    <Modal visible={sheet} transparent animationType="slide" onRequestClose={() => setSheet(false)}>
      <View style={{ flex: 1, backgroundColor: 'rgba(12,30,20,0.28)', justifyContent: 'flex-end' }}>
        <Pressable accessibilityRole="button" accessibilityLabel="关闭筛选" onPress={() => setSheet(false)} style={{ flex: 1 }} />
        <View style={{ maxHeight: '86%', backgroundColor: c.background, padding: 23, paddingTop: 12, paddingBottom: 30, borderTopLeftRadius: 30, borderTopRightRadius: 30, maxWidth: 480, alignSelf: 'center', width: '100%' }}>
          <View accessibilityElementsHidden style={{ width: 34, height: 4, borderRadius: 3, backgroundColor: '#CFDAD0', alignSelf: 'center', marginBottom: 9 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}><Text style={{ color: c.text, fontSize: 21, fontWeight: '600' }}>筛选</Text><IconButton name="close" label="关闭筛选面板" onPress={() => setSheet(false)} /></View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {([['资料', 'profile', ['全部', '有介绍']], ['资料类型', 'group', breedGroups], ['体型', 'size', sizes], ['被毛', 'coat', ['全部', '短毛', '长毛', '卷毛', '硬毛', '无毛']], ['活跃程度', 'energy', ['全部', '较低', '适中', '较高']]] as [string, keyof Filters, string[]][]).filter(([, key]) => key !== "profile" || introducedCount < breeds.length).map(([title, key, options]) => <View key={key} style={{ marginVertical: 11 }}>
              <Text style={{ color: c.text, fontWeight: '600', fontSize: 14, marginBottom: 11 }}>{title}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{options.map(option => <Chip key={option} label={key === 'group' && option !== '全部' ? (groupNames[option] || option) : option} selected={filters[key] === option} onPress={() => set(key, option)} />)}</View>
            </View>)}
          </ScrollView>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}><Button title="重置" secondary style={{ flex: 1 }} onPress={() => setFilters({ ...emptyFilters, query: filters.query })} /><Button title={'查看 ' + list.length + ' 项'} style={{ flex: 2 }} onPress={() => setSheet(false)} /></View>
        </View>
      </View>
    </Modal>
  </Screen>;
}
