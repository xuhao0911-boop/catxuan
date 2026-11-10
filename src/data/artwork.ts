import { generatedBreedArt, generatedDefaultVariants, generatedVariantArt } from './generated-art';

export const illustratedBreedCount = Object.keys(generatedBreedArt).length;
export const illustrationExampleCount = Object.values(generatedVariantArt).reduce((count, variants) => count + Object.keys(variants).length, 0);

export const approvedArtStyle = 'C' as const;
export type ArtStyle = typeof approvedArtStyle;
export const approvedArtwork = {
  key: approvedArtStyle,
  name: '柔和立体',
  image: require('../../assets/illustrations/style-sheet.jpg.webp'),
};

export function generatedArtwork(breedId: string, color?: string, form?: string): number | undefined {
  const exact = generatedVariantArt[breedId]?.[`${color || ''}--${form || ''}`];
  if (exact !== undefined) return exact;
  const defaults = generatedDefaultVariants[breedId];
  if ((color && color !== defaults?.color) || (form && form !== defaults?.form)) return undefined;
  return generatedBreedArt[breedId];
}
