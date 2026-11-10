import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Platform, Pressable, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { router, useFocusEffect } from 'expo-router';
import { Button, CatPhoto, Icon, Screen, Section, Title } from '../../components/ui';
import { colors as c } from '../../theme';
import RecognitionEngine from '../../recognition/RecognitionEngine';
import { catPredictions } from '../../recognition/candidates';
import { Prediction, RecognitionEvent } from '../../recognition/html';
import { FieldMotif } from '../../components/graphics';

async function asDataUri(uri: string): Promise<string> {
  if (uri.startsWith('data:')) return uri;
  if (Platform.OS !== 'web') return 'data:image/jpeg;base64,' + await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  const blob = await (await fetch(uri)).blob();
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(blob); });
}
export default function Recognize() {
  const [photo, setPhoto] = useState<string | null>(null); const [job, setJob] = useState<string | null>(null);
  const [progress, setProgress] = useState(''); const [error, setError] = useState(''); const [predictions, setPredictions] = useState<Prediction[] | null>(null); const [picking, setPicking] = useState(false);
  const reset = () => { setJob(null); setError(''); setPredictions(null); setProgress(''); };
  useFocusEffect(useCallback(() => () => { setPhoto(null); setJob(null); setPredictions(null); setError(''); setProgress(''); }, []));
  const choose = async (camera: boolean) => {
    if (picking || job) return;
    reset(); setPicking(true);
    try {
      if (camera && Platform.OS !== 'web') { const permission = await ImagePicker.requestCameraPermissionsAsync(); if (!permission.granted) { setError('请允许相机权限，或选择相册。'); return; } }
      const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], base64: true, quality: 0.7, allowsEditing: true, aspect: [1, 1] };
      const result = camera ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
      if (!result.canceled && result.assets[0]) { const asset = result.assets[0]; setPhoto(asset.base64 ? 'data:' + (asset.mimeType || 'image/jpeg') + ';base64,' + asset.base64 : await asDataUri(asset.uri)); }
    } catch { setError('无法读取照片，请重选。'); }
    finally { setPicking(false); }
  };
  const start = () => { if (!photo || job) return; setError(''); setPredictions(null); setProgress('正在准备本地识别…'); setJob(String(Date.now())); };
  const receive = (event: RecognitionEvent) => {
    if (event.jobId !== job) return;
    if (event.type === 'progress') setProgress(event.message || '正在分析…');
    if (event.type === 'error') { setError(event.message || '识别失败，请重试'); setJob(null); }
    if (event.type === 'result') { setPredictions(event.predictions || []); setJob(null); }
  };
  const candidates = predictions ? catPredictions(predictions) : [];
  return <Screen><Title title="识别" /><View style={{ borderRadius: 28, overflow: 'hidden', backgroundColor: c.paper, height: photo ? 280 : 330, alignItems: 'center', justifyContent: 'center' }}>{photo ? <Image accessibilityLabel="待识别照片预览" source={{ uri: photo }} style={{ width: '100%', height: '100%' }} resizeMode="contain" /> : <>
      <View pointerEvents="none" accessibilityElementsHidden style={{ position: 'absolute', left: 28, top: 25, width: 32, height: 32, borderTopWidth: 2, borderLeftWidth: 2, borderColor: '#A4BDA4', borderTopLeftRadius: 15 }} /><View pointerEvents="none" accessibilityElementsHidden style={{ position: 'absolute', right: 28, top: 25, width: 32, height: 32, borderTopWidth: 2, borderRightWidth: 2, borderColor: '#A4BDA4', borderTopRightRadius: 15 }} /><View pointerEvents="none" accessibilityElementsHidden style={{ position: 'absolute', left: 28, bottom: 25, width: 32, height: 32, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: '#A4BDA4', borderBottomLeftRadius: 15 }} /><View pointerEvents="none" accessibilityElementsHidden style={{ position: 'absolute', right: 28, bottom: 25, width: 32, height: 32, borderBottomWidth: 2, borderRightWidth: 2, borderColor: '#A4BDA4', borderBottomRightRadius: 15 }} />
      <FieldMotif size={170} /><Text style={{ color: c.text, fontSize: 19, fontWeight: '600', marginTop: 9 }}>添加猫咪照片</Text></>}</View>
    <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}><Button title="拍照" icon="camera-outline" style={{ flex: 1 }} disabled={!!job || picking} onPress={() => { void choose(true); }} /><Button title="相册" icon="images-outline" secondary style={{ flex: 1 }} disabled={!!job || picking} onPress={() => { void choose(false); }} /></View>
    {picking && <ActivityIndicator color={c.green} style={{ marginTop: 15 }} />}
    {photo && !job && <Button title={predictions ? '重新识别' : error ? '重试识别' : '开始识别'} icon="scan-outline" onPress={start} style={{ marginTop: 14 }} />}
    {photo && !job && <Pressable accessibilityRole="button" onPress={() => { reset(); setPhoto(null); }} style={{ alignItems: 'center', paddingVertical: 14 }}><Text style={{ fontSize: 12, color: c.muted }}>移除</Text></Pressable>}
    {!!job && <View style={{ marginTop: 20, alignItems: 'center', gap: 14 }}><ActivityIndicator color={c.green} /><Text accessibilityLiveRegion="polite" style={{ color: c.green, fontSize: 13, textAlign: 'center', lineHeight: 22 }}>{progress}</Text><Button title="取消识别" secondary onPress={reset} /></View>}
    {!!error && <View accessibilityRole="alert" style={{ backgroundColor: '#FCF0EB', borderRadius: 13, padding: 15, marginTop: 16 }}><Text style={{ color: c.danger, fontSize: 13, lineHeight: 23 }}>{error}</Text></View>}
    {predictions && <><Section title={candidates.length ? '外观参考' : '暂时无法判断'} />{candidates.length ? candidates.map((candidate, i) => <Pressable key={candidate.className} accessibilityRole={candidate.breed ? 'button' : undefined} onPress={() => candidate.breed && router.push('/breed/' + candidate.breed.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.paper, padding: 14, borderRadius: 20, marginBottom: 10 }}>{candidate.breed ? <CatPhoto breed={candidate.breed} style={{ width: 60, height: 60, borderRadius: 12 }} /> : <View style={{ width: 60, height: 60, backgroundColor: c.pale, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}><Icon name="paw-outline" color={c.green} /></View>}<View style={{ flex: 1, gap: 6 }}><Text style={{ color: c.text, fontSize: 14, fontWeight: '600' }}>{candidate.name}</Text><Text style={{ fontSize: 12, color: c.muted }}>{candidate.breed ? '查看图鉴' : '暂未收录'}</Text></View><View style={{ width: 27, height: 27, borderRadius: 10, backgroundColor: c.pale, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: c.green, fontSize: 12 }}>{i + 1}</Text></View></Pressable>) : <View style={{ backgroundColor: c.pale, padding: 18, borderRadius: 18 }}><Text style={{ color: c.green, fontSize: 14, lineHeight: 24 }}>请换一张清晰照片。</Text></View>}</>}
    <View style={{ marginTop: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }}><Icon name="shield-checkmark-outline" color={c.green} size={16} /><Text style={{ color: c.muted, fontSize: 12 }}>照片不上传 · 外观识别</Text></View>
    {!!job && !!photo && <RecognitionEngine key={job} image={photo} jobId={job} onEvent={receive} />}
  </Screen>;
}
