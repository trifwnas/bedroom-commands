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
  { id: 'Romantic', name: 'Romantic', emoji: '💕', color: '#ff6b6b', gradient: ['#ff6b6b', '#ee5a5a'], defaultMood: 'flirty' },
  { id: 'Playful', name: 'Playful', emoji: '🎉', color: '#ffd93d', gradient: ['#ffd93d', '#f4c430'], defaultMood: 'playful' },
  { id: 'Spicy', name: 'Spicy', emoji: '🔥', color: '#ff595e', gradient: ['#ff595e', '#ff4047'], defaultMood: 'spicy' },
  { id: 'Adventure', name: 'Adventure', emoji: '🌟', color: '#6bcb77', gradient: ['#6bcb77', '#56b368'], defaultMood: 'flirty' },
  { id: 'Relaxing', name: 'Relaxing', emoji: '🌙', color: '#4d96ff', gradient: ['#4d96ff', '#3d86ef'], defaultMood: 'sweet' },
];

export const MOODS: { id: Mood; emoji: string; label: string; color: string }[] = [
  { id: 'sweet', emoji: '🧊', label: 'Chill', color: '#4d96ff' },
  { id: 'playful', emoji: '😄', label: 'Fun', color: '#ffd93d' },
  { id: 'flirty', emoji: '😏', label: 'Flirty', color: '#ff6b6b' },
  { id: 'spicy', emoji: '🌶️', label: 'Spicy', color: '#ff595e' },
  { id: 'wild', emoji: '🔥', label: 'Wild', color: '#e74c3c' },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c])) as Record<Category, CategoryInfo>;
