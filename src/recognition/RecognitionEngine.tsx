import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { RecognitionEvent, recognitionHTML } from './html';
export type EngineProps = { image: string; jobId: string; onEvent: (event: RecognitionEvent) => void };
export default function RecognitionEngine({ image, jobId, onEvent }: EngineProps) {
  return <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: 'absolute', width: 2, height: 2, opacity: 0.01, overflow: 'hidden' }}><WebView source={{ html: recognitionHTML(image, jobId) }} originWhitelist={['*']} javaScriptEnabled onMessage={event => {
    try { const data = JSON.parse(event.nativeEvent.data); if (data.source === 'cat-atlas-engine' && data.jobId === jobId) onEvent(data); } catch { /* Ignore unrelated webview messages. */ }
  }} onError={() => onEvent({ source: 'cat-atlas-engine', jobId, type: 'error', message: '模型加载失败，请检查网络后重试' })} style={{ width: 2, height: 2 }} /></View>;
}
