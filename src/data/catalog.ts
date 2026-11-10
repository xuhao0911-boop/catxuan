import source from './breeds.json';
export type CoatColor = { id: string; name: string; en: string; swatches: string[]; source: string; kind: string };
export type FormProfile = { description?: string; appearance?: string; temperament?: string; coatNote?: string; care?: string; beginnerNote?: string; height?: string; weight?: string; size?: string; coat?: string; profileNote?: string };
export type BreedForm = { id: string; name: string; kind: string; source: string; profile?: FormProfile };
export type Breed = {
  id: string; name: string; en: string; aliases: string[]; origin: string; size: string; sizes?: string[]; coat: string; coats?: string[]; tags: string[];
  description: string; care: string; height: string; weight: string; energy: number | null; trainability: number | null; grooming: number | null; shedding: number | null;
  source: string; sourceDate: string; wikiUrl?: string; imageAttribution?: string; imageLicense?: string; imageSource?: string; imageLicenseUrl?: string;
  groupName: string; association: 'CFA资料' | 'TICA资料' | '家猫类型'; activity: string; groomingLevel: string; sheddingLevel: string; social: string; matchEligible: boolean;
  complete: boolean; artStatus: string; colors: CoatColor[]; forms: BreedForm[]; standardVarieties: string[]; profileNote?: string;
  catalogKind: 'breed' | 'household'; profileLevel?: 'index' | 'intro' | 'standard' | 'detailed';
  appearance?: string; temperament?: string; coatNote?: string; beginnerNote?: string; sourceLabel?: string; referenceSources?: { label: string; url: string }[];
};
export const breeds = source as unknown as Breed[];
export const detailedCount = breeds.filter(b => b.complete).length;
export const introducedCount = breeds.filter(b => !!b.description.trim()).length;
export const breedGroups = ['全部', 'CFA资料', 'TICA资料', '家猫类型'];
export const groupNames: Record<string, string> = { 'CFA资料': 'CFA 猫种资料', 'TICA资料': 'TICA 猫种资料', '家猫类型': '地方与家猫类型' };
export function catalogLabel(breed: Breed) { return groupNames[breed.association] || breed.association; }
export function sizeLabel(size: string) { return size === '多种' ? '多体型' : size ? size + '猫' : '—'; }
export const byId = Object.assign(Object.create(null), Object.fromEntries(breeds.map(b => [b.id, b]))) as Record<string, Breed>;
export const sizes = ['全部', '小型', '中型', '大型'];
export type Filters = { query: string; size: string; coat: string; energy: string; group: string; profile: string };
export const emptyFilters: Filters = { query: '', size: '全部', coat: '全部', energy: '全部', group: '全部', profile: '全部' };
export function searchBreeds(filters: Partial<Filters>, list = breeds) {
  const terms = filters.query?.normalize('NFKC').trim().toLocaleLowerCase().split(/\s+/).filter(Boolean) || [];
  return list.filter(b => {
    const searchText = [b.name, b.en, b.origin, b.temperament, ...b.aliases, ...b.tags, ...b.forms.map(form => form.name), ...b.colors.map(color => color.name + ' ' + color.en)].join(' ').normalize('NFKC').toLocaleLowerCase();
    return terms.every(term => searchText.includes(term))
    && (!filters.size || filters.size === '全部' || (b.sizes || [b.size]).includes(filters.size))
    && (!filters.coat || filters.coat === '全部' || b.coat === filters.coat || b.coats?.includes(filters.coat) || b.forms.some(f => f.profile?.coat === filters.coat))
    && (!filters.energy || filters.energy === '全部' || b.activity === filters.energy)
    && (!filters.group || filters.group === '全部' || b.association === filters.group)
    && (!filters.profile || filters.profile === '全部' || !!b.description.trim());
  });
}
export function energyLabel(value: number | null) { return value === null ? '—' : value >= 4 ? '较高' : value >= 3 ? '中等' : '较低'; }
export function levelLabel(value: number | null) { return value === null ? '—' : `${value}/5`; }
