import React, { useEffect, useMemo, useRef } from 'react';
import { recognitionHTML } from './html';
import type { EngineProps } from './RecognitionEngine';
export default function RecognitionEngine({ image, jobId, onEvent }: EngineProps) {
  const ref = useRef<HTMLIFrameElement>(null); const listener = useRef(onEvent);
  useEffect(() => { listener.current = onEvent; }, [onEvent]);
  const html = useMemo(() => recognitionHTML(image, jobId), [image, jobId]);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.source !== ref.current?.contentWindow) return;
      try { const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data; if (data?.source === 'cat-atlas-engine' && data.jobId === jobId) listener.current(data); } catch { /* Ignore other frame messages. */ }
    };
    window.addEventListener('message', receive); return () => window.removeEventListener('message', receive);
  }, [jobId]);
  return <iframe ref={ref} title="本地照片识别引擎" srcDoc={html} aria-hidden="true" style={{ position: 'absolute', width: 2, height: 2, border: 0, opacity: 0.01, pointerEvents: 'none' }} sandbox="allow-scripts" />;
}
