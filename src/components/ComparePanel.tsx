import React, { useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { byId, searchBreeds, sizeLabel } from '../data/catalog';
import { useAtlas } from '../state/store';
import { colors as c } from '../theme';
import { BreedRow, Button, CatPhoto, Empty, Fold, Icon, IconButton, Screen, Search, Title } from './ui';
import { CollectionArt } from './AtlasArt';
import { SegmentControl } from './graphics';

const compactNames: Record<string, string> = {};

export default function ComparePanel() {
  const { compare, toggleCompare, clearCompare } = useAtlas();
  const [picker, setPicker] = useState(false), [query, setQuery] = useState(''), [section, setSection] = useState('概况');
  const list = compare.map(id => byId[id]);
  const { width } = useWindowDimensions();
  const columnWidth = (Math.min(width, 480) - 40 - 60) / Math.max(list.length, 1);
  const photoSize = Math.min(116, columnWidth - 15);

  const rows = section === '概况' ? [
    ['体型', ...list.map(b => sizeLabel(b.size))], ['被毛', ...list.map(b => b.coat === '多种' ? '多毛型' : b.coat || '—')],
    ['性格', ...list.map(b => b.temperament || b.tags.join('、'))], ['起源', ...list.map(b => b.origin)],
  ] : [
    ['活跃', ...list.map(b => b.activity)], ['相处', ...list.map(b => b.social)], ['梳理', ...list.map(b => b.groomingLevel)], ['掉毛', ...list.map(b => b.sheddingLevel)],
    ['照护', ...list.map(b => b.care)],
  ];
  return <Screen><Title title="对比" action={<IconButton name="add" label="选择对比猫种" onPress={() => setPicker(true)} />} />
    {!list.length ? <Empty title="选择对比" description="最多选择 3 种" art={<CollectionArt compare />} action={<Button title="选择猫种" onPress={() => setPicker(true)} />} /> : <>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 17 }}><View accessibilityLabel={'已选 ' + list.length + ' 种，最多 3 种'} style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}><View style={{ flexDirection: 'row', gap: 4 }}>{[0, 1, 2].map(i => <View key={i} style={{ width: 17, height: 5, borderRadius: 3, backgroundColor: i < list.length ? c.green : '#D8E2D6' }} />)}</View><Text style={{ color: c.muted, fontSize: 12 }}>{list.length}/3</Text></View><Pressable accessibilityRole="button" accessibilityLabel="清空对比" onPress={clearCompare} style={{ minHeight: 44, justifyContent: 'center', paddingLeft: 15 }}><Text style={{ color: c.muted, fontSize: 13 }}>清空</Text></Pressable></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ width: Math.min(width, 480) - 40 }}>
          <View style={{ flexDirection: 'row', paddingLeft: 60, alignItems: 'stretch', marginBottom: 19 }}>{list.map(b => <View key={b.id} style={{ width: columnWidth, alignItems: 'center', paddingHorizontal: 3 }}><View style={{ width: '100%', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 21, paddingTop: 7 }}><Pressable accessibilityRole="button" accessibilityLabel={'查看' + b.name} onPress={() => router.push('/breed/' + b.id)}><CatPhoto breed={b} style={{ width: photoSize, height: photoSize, borderRadius: 16 }} /></Pressable><Text numberOfLines={2} style={{ fontSize: 13, color: c.text, fontWeight: '600', lineHeight: 20, textAlign: 'center', marginTop: 6, minHeight: 40, paddingHorizontal: 4 }}>{compactNames[b.id] || b.name}</Text><IconButton name="close" label={'移除' + b.name} onPress={() => toggleCompare(b.id)} style={{ backgroundColor: 'transparent', width: 44, height: 44 }} /></View></View>)}</View>
          <SegmentControl value={section} items={['概况', '照护']} onChange={setSection} />
          <View style={{ marginTop: 15 }}>{rows.map(([label, ...values], row) => <View key={label} style={{ flexDirection: 'row', borderRadius: 13, backgroundColor: row % 2 === 0 ? '#FFFFFF' : 'transparent', minHeight: 54, marginBottom: 3 }}><View style={{ width: 60, paddingVertical: 15, paddingLeft: 10 }}><Text style={{ color: c.muted, fontSize: 12 }}>{label}</Text></View>{values.map((value, i) => <View key={list[i].id} style={{ width: columnWidth, paddingHorizontal: 9, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' }}>{/^[1-5]\/5$/.test(value) ? <View accessible accessibilityLabel={label + ' ' + value} style={{ flexDirection: 'row', gap: 4 }}>{[0, 1, 2, 3, 4].map(n => <View key={n} style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: n < Number(value[0]) ? c.green : c.border }} />)}</View> : <Text style={{ color: c.text, fontSize: 14, lineHeight: 23, textAlign: 'center' }}>{value}</Text>}</View>)}</View>)}</View>
        </View>
      </ScrollView>
      <Fold title="对比说明"><Text style={p.note}>部分猫种的长短毛与已绘毛色可在详情切换。照护标签为编辑归纳，个体表现会有差异。</Text></Fold>
    </>}
    <Modal visible={picker} animationType="slide" onRequestClose={() => setPicker(false)}><Screen scroll={false}>
      <View style={{ paddingHorizontal: 20 }}><Title title="选择猫种" action={<IconButton name="close" label="关闭猫种选择" onPress={() => setPicker(false)} />} /><Search value={query} onChange={setQuery} placeholder="搜索猫种" /></View>
      <FlatList accessibilityLabel="可对比猫种" data={searchBreeds({ query })} keyExtractor={b => b.id} extraData={compare} initialNumToRender={8} maxToRenderPerBatch={8} windowSize={5} keyboardShouldPersistTaps="handled" style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20 }} renderItem={({ item: b }) => <BreedRow breed={b} onPress={() => toggleCompare(b.id)} trailing={<Icon name={compare.includes(b.id) ? 'checkmark-circle' : 'add-circle-outline'} color={compare.includes(b.id) ? c.green : '#8B9D8E'} />} />} ListEmptyComponent={<Empty title="没有找到" description="" />} />
      <View style={{ paddingHorizontal: 20, paddingVertical: 14 }}><Button title={'完成（' + compare.length + '/3）'} onPress={() => setPicker(false)} /></View>
    </Screen></Modal>
  </Screen>;
}

const p = StyleSheet.create({ note: { fontSize: 13, lineHeight: 23, color: c.muted } });
