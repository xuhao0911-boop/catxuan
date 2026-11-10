import React from 'react';
import { Image, Text, View } from 'react-native';
import { router } from 'expo-router';
import { IconButton, Screen, Title } from '../components/ui';
import { approvedArtwork } from '../data/artwork';
import { colors as c } from '../theme';
export default function IllustrationStyle() {
  return <Screen><Title title="画风示例" action={<IconButton name="chevron-back" label="返回" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} />} />
    <View style={{ backgroundColor: c.paper, borderRadius: 22, overflow: 'hidden', paddingVertical: 14 }}>
      <Image accessibilityLabel="柔和立体猫种插画" source={approvedArtwork.image} resizeMode="contain" style={{ width: '100%', aspectRatio: 1.5 }} />
    </View>
    <Text style={{ color: c.text, fontSize: 20, fontWeight: '600', marginTop: 24 }}>柔和立体</Text>
    <Text style={{ color: c.muted, fontSize: 14, lineHeight: 24, marginTop: 10 }}>英短、美短、布偶、缅因、波斯与暹罗的原创插画示例。</Text>
  </Screen>;
}
