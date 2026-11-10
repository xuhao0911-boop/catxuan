import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import BreedProfile from '../components/BreedProfile';

export default function BreedDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <BreedProfile key={id} id={id} />;
}
