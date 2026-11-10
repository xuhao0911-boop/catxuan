import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { byId } from '../data/catalog';
import { colors } from '../theme';
import { approvedArtStyle, ArtStyle } from '../data/artwork';

type Store = {
  favorites: string[]; compare: string[]; recent: string[]; hydrated: boolean;
  toggleFavorite: (id: string) => void; toggleCompare: (id: string) => void;
  clearCompare: () => void; visit: (id: string) => void; notify: (message: string) => void;
  artStyle: ArtStyle;
};
const Context = createContext<Store | null>(null);
const key = '@cat-atlas/v1';
function clean(value: unknown, limit = 2000): string[] {
  return Array.isArray(value) ? [...new Set(value.filter((x): x is string => typeof x === 'string' && !!byId[x]))].slice(0, limit) : [];
}
export function AtlasProvider({ children }: React.PropsWithChildren) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const artStyle = approvedArtStyle;
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const writeQueue = useRef(Promise.resolve());
  const notify = (message: string) => {
    if (timer.current) clearTimeout(timer.current);
    setToast(message); timer.current = setTimeout(() => setToast(''), 2600);
  };
  useEffect(() => {
    AsyncStorage.getItem(key).then(raw => {
      if (raw) { const data = JSON.parse(raw); setFavorites(clean(data.favorites)); setCompare(clean(data.compare, 3)); setRecent(clean(data.recent, 8)); }
    }).catch(() => notify('无法读取本地记录，本次仍可正常浏览')).finally(() => setHydrated(true));
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    const snapshot = JSON.stringify({ favorites, compare, recent, artStyle });
    writeQueue.current = writeQueue.current.then(() => AsyncStorage.setItem(key, snapshot)).catch(() => notify('保存失败，请检查设备存储空间'));
  }, [favorites, compare, recent, artStyle, hydrated]);
  const toggleFavorite = (id: string) => {
    if (!hydrated || !byId[id]) return;
    setFavorites(previous => previous.includes(id) ? previous.filter(x => x !== id) : [...previous, id]);
  };
  const toggleCompare = (id: string) => {
    if (!hydrated || !byId[id]) return;
    if (!compare.includes(id) && compare.length >= 3) { notify('最多对比 3 种猫咪，请先移除一种'); return; }
    setCompare(previous => previous.includes(id) ? previous.filter(x => x !== id) : previous.length < 3 ? [...previous, id] : previous);
  };
  const visit = useCallback((id: string) => { if (hydrated && byId[id]) setRecent(previous => [id, ...previous.filter(x => x !== id)].slice(0, 8)); }, [hydrated]);
  return <Context.Provider value={{ favorites, compare, recent, hydrated, toggleFavorite, toggleCompare, clearCompare: () => setCompare([]), visit, notify, artStyle }}>
    {children}
    {!!toast && <View pointerEvents="box-none" style={{ position: 'absolute', bottom: 108, left: 24, right: 24, alignItems: 'center', zIndex: 999 }}>
      <Pressable accessibilityRole="alert" onPress={() => setToast('')} style={{ backgroundColor: colors.text, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14, maxWidth: 420 }}><Text style={{ color: 'white', fontSize: 14, lineHeight: 21 }}>{toast}</Text></Pressable>
    </View>}
  </Context.Provider>;
}
export function useAtlas() { const store = useContext(Context); if (!store) throw new Error('缺少 AtlasProvider'); return store; }
