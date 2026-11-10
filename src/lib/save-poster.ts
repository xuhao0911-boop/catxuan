import type { RefObject } from 'react';
import { PixelRatio, Share, View } from 'react-native';
import { captureRef, releaseCapture } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import type { PosterModel } from './poster';

export async function savePoster(ref: RefObject<View | null>, model: PosterModel) {
  if (!await Sharing.isAvailableAsync()) throw new Error('Sharing unavailable');
  const ratio = PixelRatio.get();
  const uri = await captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile', width: 1080 / ratio, height: 1440 / ratio });
  try { await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: model.breed.name + '图鉴卡', UTI: 'public.png' }); } finally { releaseCapture(uri); }
  return '';
}

export async function shareDescription(message: string) { await Share.share({ message }); return ''; }
