import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { breeds, byId } from '../data/catalog';
import { cleanMatchDraft, MatchAnswers, matchBreeds, matchQuestions, matchStorageKey, validMatchAnswers } from '../lib/matching';
import { colors as c } from '../theme';
import { Button, CatPhoto, Empty, Fold, Icon, IconButton, Screen } from './ui';
import { useAtlas } from '../state/store';

export default function MatchPanel() {
  const [answers, setAnswers] = useState<Partial<MatchAnswers>>({});
  const [step, setStep] = useState(0), [finished, setFinished] = useState(false), [loaded, setLoaded] = useState(false);
  const writeQueue = useRef(Promise.resolve());
  const { notify } = useAtlas();
  useEffect(() => { AsyncStorage.getItem(matchStorageKey).then(raw => { if (raw) { const saved = JSON.parse(raw); setAnswers(cleanMatchDraft(saved.answers)); setFinished(saved.finished === true && validMatchAnswers(saved.answers)); } }).catch(() => notify('暂时无法恢复选择')).finally(() => setLoaded(true)); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (loaded) writeQueue.current = writeQueue.current.then(() => AsyncStorage.setItem(matchStorageKey, JSON.stringify({ answers, finished }))).catch(() => notify('选择暂未保存')); }, [answers, finished, loaded]); // eslint-disable-line react-hooks/exhaustive-deps
  const question = matchQuestions[step];
  const results = validMatchAnswers(answers) ? matchBreeds(answers, breeds) : [];
  const change = () => { setFinished(false); setStep(0); };
  return <Screen scrollResetKey={finished ? 'result' : String(step)}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 15, paddingBottom: 25 }}><IconButton name="chevron-back" label="返回" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} /><Text style={{ flex: 1, fontSize: 17, fontWeight: '600', color: c.text }}>选猫助手</Text>{finished && <Pressable accessibilityRole="button" accessibilityLabel="重新选择偏好" onPress={change} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: c.green, fontSize: 13 }}>重新选择</Text></Pressable>}</View>
    {!loaded ? <Text style={{ color: c.muted }}>读取中…</Text> : !finished ? <>
      <View accessibilityLabel={'第 ' + (step + 1) + ' 题，共 5 题'} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 31 }}><View style={{ flex: 1, flexDirection: 'row', gap: 5 }}>{matchQuestions.map((q, i) => <View key={q.key} style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: i <= step ? c.green : c.border }} />)}</View><Text style={{ color: c.muted, fontSize: 12 }}>{step + 1}/5</Text></View>
      <Text accessibilityRole="header" style={{ fontSize: 27, lineHeight: 38, color: c.text, fontWeight: '700', marginBottom: 10 }}>{question.title}</Text>
      
      <View style={{ gap: 12 }}>{question.options.map(option => {
        const selected = answers[question.key] === option.id;
        return <Pressable key={option.id} accessibilityRole="button" accessibilityLabel={option.label} accessibilityState={{ selected }} aria-pressed={selected} onPress={() => setAnswers(previous => ({ ...previous, [question.key]: option.id }))} style={({ pressed }) => ({ padding: 20, borderRadius: 21, backgroundColor: selected ? c.pale : '#FFFFFF', borderWidth: 1.5, borderColor: selected ? c.green : '#FFFFFF', flexDirection: 'row', gap: 12, alignItems: 'center', opacity: pressed ? .7 : 1 })}><View style={{ flex: 1 }}><Text style={{ fontSize: 16, fontWeight: '600', color: c.text }}>{option.label}</Text></View><Icon name={selected ? 'checkmark-circle' : 'ellipse-outline'} color={selected ? c.green : '#C2CEC5'} /></Pressable>;
      })}</View>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 28 }}>{step > 0 && <Button title="上一题" secondary onPress={() => setStep(previous => previous - 1)} style={{ flex: 1 }} />}<Button title={step === 4 ? '查看结果' : '下一题'} disabled={!answers[question.key]} onPress={() => { if (step < 4) setStep(previous => previous + 1); else if (validMatchAnswers(answers)) setFinished(true); }} style={{ flex: 2 }} /></View>
    </> : <>
      <Text accessibilityRole="header" style={{ fontSize: 29, fontWeight: '700', color: c.text, lineHeight: 39 }}>{results.length ? '推荐猫种' : '暂无匹配'}</Text>
      
      {results.length ? <View style={{ gap: 17 }}>{results.map(result => <View key={result.breedId} style={{ backgroundColor: '#FFFFFF', borderRadius: 25, padding: 18 }}><Pressable accessibilityRole="button" accessibilityLabel={'了解推荐猫种' + result.name} onPress={() => router.push('/breed/' + result.breedId)} style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}><CatPhoto breed={byId[result.breedId]} form={result.formId} style={{ width: 105, height: 105, borderRadius: 17 }} /><View style={{ flex: 1 }}><Text style={{ color: c.text, fontSize: 19, fontWeight: '700', lineHeight: 28 }}>{result.name}</Text><Text style={{ color: c.muted, fontSize: 12, marginTop: 7 }}>{result.size}</Text></View></Pressable><View style={{ marginTop: 14, gap: 9 }}>{result.reasons.slice(0, 3).map(reason => <View key={reason} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}><Icon name="checkmark-circle-outline" size={17} color={c.green} /><Text style={{ flex: 1, color: c.text, fontSize: 13, lineHeight: 20 }}>{reason}</Text></View>)}</View>{!!result.considerations.length && <Text style={{ color: c.muted, fontSize: 12, lineHeight: 21, marginTop: 13 }}>{result.considerations.join('；')}。</Text>}<View style={{ flexDirection: 'row', gap: 9, marginTop: 18 }}><Button title="查看图鉴" secondary onPress={() => router.push('/breed/' + result.breedId)} style={{ flex: 1 }} /><Button title="分享" onPress={() => router.push({ pathname: '/share/[id]', params: { id: result.breedId, form: result.formId, from: 'match' } })} style={{ flex: 1 }} /></View></View>)}</View> : <Empty title="暂时没有合适候选" description="" action={<Button title="调整偏好" onPress={change} />} />}
      <View style={{ marginTop: 23 }}><Fold title="推荐依据"><Text style={{ color: c.muted, fontSize: 13, lineHeight: 23 }}>按体型、活跃程度与照护需求筛选。标签为编辑归纳，个体表现可能不同。</Text></Fold></View>
    </>}
  </Screen>;
}
