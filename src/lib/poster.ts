import type { Breed } from '../data/catalog';
import { generatedArtwork } from '../data/artwork';
import { generatedDefaultVariants } from '../data/generated-art';

export type PosterModel = { breed: Breed; color?: string; form?: string; variant: string; attributes: string; note: string; kind: 'atlas' | 'match'; asset: number; crop?: { x: number; y: number; width: number; height: number } };

export function createPoster(breed: Breed, color?: string, form?: string, kind: 'atlas' | 'match' = 'atlas', note = ''): PosterModel | null {
  const defaults = generatedDefaultVariants[breed.id];
  const selectedColor = color || defaults?.color || breed.colors[0]?.id;
  const selectedForm = form || defaults?.form || breed.forms[0]?.id;
  const chosenForm = breed.forms.find(item => item.id === selectedForm);
  const effectiveColor = selectedColor;
  if ((color && !breed.colors.some(item => item.id === color)) || (form && !chosenForm)) return null;
  const standalone = generatedArtwork(breed.id, effectiveColor, selectedForm);
  if (standalone === undefined) return null;
  const profile = { ...breed, ...chosenForm?.profile };
  const variant = [breed.colors.find(item => item.id === effectiveColor)?.name, chosenForm?.name].filter(Boolean).join(' · ');
  return { breed, color: effectiveColor, form: selectedForm, kind, variant: variant || '代表外观', attributes: [profile.size, profile.coat].filter(Boolean).join(' · '), note: note.slice(0, 36), asset: standalone };
}

export function posterDescription(model: PosterModel) { return `${model.breed.name}｜CatXuan\n${model.attributes}\n${model.variant}\n${model.breed.description}`; }
