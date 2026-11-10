import React, { useEffect, useRef, useState } from 'react';
import { Platform, Text, useWindowDimensions, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { breeds, byId } from '../data/catalog';
import { createPoster, posterDescription } from '../lib/poster';
import { savePoster, shareDescription } from '../lib/save-poster';
import { matchBreeds, matchStorageKey, validMatchAnswers } from '../lib/matching';
import { useAtlas } from '../state/store';
import { colors as c } from '../theme';
import { BrandMark } from './graphics';
import { Button, CatPhoto, Empty, IconButton, Screen } from './ui';

export default function SharePanel() {
  const params = useLocalSearchParams<{ id: string; color?: string; form?: string; from?: string }>();
  const [busy, setBusy] = useState(false), [ready, setReady] = useState(false), [note, setNote] = useState('');
  const card = useRef<View>(null); const { notify } = useAtlas();
  const { width } = useWindowDimensions(); const cardWidth = Math.min(width - 40, 380), scale = cardWidth / 360;
  const breed = typeof params.id === 'string' ? byId[params.id] : undefined;
  const kind = params.from === 'match' ? 'match' : 'atlas';
  const model = breed && createPoster(breed, typeof params.color === 'string' ? params.color : undefined, typeof params.form === 'string' ? params.form : undefined, kind, note);
  useEffect(() => { if (kind === 'match') AsyncStorage.getItem(matchStorageKey).then(raw => { if (!raw) return; const saved = JSON.parse(raw); if (validMatchAnswers(saved.answers)) setNote(matchBreeds(saved.answers, breeds).find(item => item.breedId === params.id)?.reasons[0] || ''); }).catch(() => {}); }, [kind, params.id]);
  const save = async () => { if (!model || busy || !ready) return; setBusy(true); try { const message = await savePoster(card, model); if (message) notify(message); } catch { notify('图片暂未生成，请重试'); } finally { setBusy(false); } };
  return <Screen><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 15, paddingBottom: 23 }}><IconButton name="chevron-back" label="返回" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} /><Text style={{ color: c.text, fontSize: 19, fontWeight: '600' }}>图鉴分享卡</Text></View>
    {!model ? <Empty title="这个外观尚未收录" description="返回图鉴选择已有外观。" action={<Button title="返回图鉴" onPress={() => router.replace('/')} />} /> : <>
      <View ref={card} collapsable={false} accessibilityLabel={model.breed.name + '分享卡预览'} style={{ width: cardWidth, height: cardWidth * 4 / 3, alignSelf: 'center', backgroundColor: '#FFFFFF', overflow: 'hidden', borderRadius: 0 }}>
        <View style={{ position: 'absolute', left: 20 * scale, right: 20 * scale, top: 20 * scale, flexDirection: 'row', alignItems: 'center', gap: 8 * scale }}><BrandMark size={27 * scale} /><Text style={{ color: c.text, fontSize: 16 * scale, fontWeight: '700', flex: 1 }}>CatXuan</Text><Text style={{ color: c.muted, fontSize: Math.max(12, 10 * scale) }}>{kind === 'match' ? '我的选猫清单' : '猫种图鉴'}</Text></View>
        <CatPhoto breed={model.breed} color={model.color} form={model.form} onLoad={() => setReady(true)} style={{ position: 'absolute', left: 20 * scale, top: 60 * scale, width: cardWidth - 40 * scale, height: 241 * scale }} />
        <Text numberOfLines={2} style={{ position: 'absolute', left: 22 * scale, right: 22 * scale, top: 318 * scale, color: c.text, fontSize: (breed!.name.length > 12 ? 20 : 25) * scale, lineHeight: 29 * scale, fontWeight: '700' }}>{breed!.name}</Text>
        <Text numberOfLines={1} style={{ position: 'absolute', left: 22 * scale, right: 22 * scale, top: 379 * scale, color: c.muted, fontSize: Math.max(12, 11 * scale) }}>{breed!.en}</Text>
        <Text style={{ position: 'absolute', left: 22 * scale, top: 399 * scale, color: c.green, fontSize: Math.max(12, 12 * scale), fontWeight: '500' }}>{model.attributes}</Text>
        <Text numberOfLines={2} style={{ position: 'absolute', left: 22 * scale, right: 22 * scale, top: 418 * scale, color: c.muted, fontSize: Math.max(12, 11 * scale), lineHeight: 14 * scale }}>{model.variant}</Text>
        <View style={{ position: 'absolute', left: 20 * scale, right: 20 * scale, top: 455 * scale, height: 1, backgroundColor: c.border }} />
        <Text numberOfLines={1} style={{ position: 'absolute', left: 22 * scale, right: 22 * scale, top: 462 * scale, color: c.muted, fontSize: Math.max(12, 10 * scale) }}>{kind === 'match' ? note || '认识与你合拍的猫咪' : '每一种猫咪，都值得被认识'}</Text>
      </View>
      <View style={{ gap: 10, marginTop: 24 }}><Button title={busy ? '生成中…' : Platform.OS === 'web' ? '保存图片' : '分享图片'} icon="image-outline" disabled={busy || !ready} onPress={() => { void save(); }} /><Button title={Platform.OS === 'web' ? '复制介绍' : '分享介绍'} secondary onPress={() => { void shareDescription(posterDescription(model)).then(message => { if (message) notify(message); }).catch(() => notify('暂时无法分享介绍')); }} /></View>
      <Text style={{ color: c.muted, fontSize: 12, lineHeight: 21, marginTop: 15, textAlign: 'center' }}>插画展示当前选中的外观。</Text>
    </>}
  </Screen>;
}
