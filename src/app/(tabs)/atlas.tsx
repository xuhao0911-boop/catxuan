import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import AtlasCatalog from '../../screens/AtlasCatalog';
export { default as AtlasCatalog } from '../../screens/AtlasCatalog';
export default function Atlas() {
  const params = useLocalSearchParams<{ q?: string; size?: string }>();
  return <AtlasCatalog key={(params.q || '') + '|' + (params.size || '')} initialQuery={params.q || ''} initialSize={params.size || '全部'} />;
}
