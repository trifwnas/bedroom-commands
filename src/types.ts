export type Category = 'Romantic' | 'Playful' | 'Spicy' | 'Adventure' | 'Relaxing';
export type ThemeMode = 'system' | 'light' | 'dark';
export type Mood = 'sweet' | 'playful' | 'flirty' | 'spicy' | 'wild';

export interface CategoryInfo {
  id: Category;
  name: Category;
  emoji: string;
  color: string;
  gradient: [string, string];
  defaultMood: Mood;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'Romantic', name: 'Romantic', emoji: '💕', color: '#d94059', gradient: ['#d94059', '#c43049'], defaultMood: 'flirty' },
  { id: 'Playful', name: 'Playful', emoji: '🎉', color: '#c49000', gradient: ['#c49000', '#b08000'], defaultMood: 'playful' },
  { id: 'Spicy', name: 'Spicy', emoji: '🔥', color: '#cc3a40', gradient: ['#cc3a40', '#b82e33'], defaultMood: 'spicy' },
  { id: 'Adventure', name: 'Adventure', emoji: '🌟', color: '#2d8a4e', gradient: ['#2d8a4e', '#237a42'], defaultMood: 'flirty' },
  { id: 'Relaxing', name: 'Relaxing', emoji: '🌙', color: '#2563c0', gradient: ['#2563c0', '#1d55b0'], defaultMood: 'sweet' },
];

export const MOODS: { id: Mood; emoji: string; label: string; color: string }[] = [
  { id: 'sweet', emoji: '🧊', label: 'Chill', color: '#2563c0' },
  { id: 'playful', emoji: '😄', label: 'Fun', color: '#c49000' },
  { id: 'flirty', emoji: '😏', label: 'Flirty', color: '#d94059' },
  { id: 'spicy', emoji: '🌶️', label: 'Spicy', color: '#cc3a40' },
  { id: 'wild', emoji: '🔥', label: 'Wild', color: '#b82e33' },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c])) as Record<Category, CategoryInfo>;
