import React, { useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { router } from 'expo-router';
import { BreedCard, Button, Empty, Screen, Search, Title } from '../../components/ui';
import { CollectionArt } from '../../components/AtlasArt';
import { byId, searchBreeds } from '../../data/catalog';
import { useAtlas } from '../../state/store';
import { colors as c } from '../../theme';
export default function Favorites() {
  const { favorites, hydrated } = useAtlas(); const [query, setQuery] = useState('');
  const list = searchBreeds({ query }, favorites.map(id => byId[id]));
  return <Screen scroll={false}><FlatList accessibilityLabel="收藏列表" data={list} keyExtractor={breed => breed.id} numColumns={2} initialNumToRender={6} maxToRenderPerBatch={6} windowSize={5} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 }} columnWrapperStyle={{ justifyContent: 'space-between' }} ListHeaderComponent={<View><Title title="收藏" action={favorites.length ? <View style={{ minWidth: 36, height: 36, borderRadius: 13, backgroundColor: c.pale, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 14, color: c.green }}>{favorites.length}</Text></View> : undefined} />{!!favorites.length && <View style={{ marginBottom: 18 }}><Search value={query} onChange={setQuery} placeholder="搜索收藏" /></View>}</View>} renderItem={({ item }) => <View style={{ width: '48.3%', marginBottom: 14 }}><BreedCard breed={item} /></View>} ListEmptyComponent={!hydrated ? <Text style={{ color: c.muted, paddingVertical: 30, textAlign: 'center' }}>读取中…</Text> : favorites.length ? <Empty title="没有找到" description="试试其他名字。" action={<Button title="清空搜索" onPress={() => setQuery('')} secondary />} /> : <Empty title="暂无收藏" description="在猫咪详情页加入喜欢。" art={<CollectionArt />} action={<Button title="浏览图鉴" onPress={() => router.push('/')} />} />} /></Screen>;
}
