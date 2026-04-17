export type Category = 'Romantic' | 'Playful' | 'Spicy' | 'Adventure' | 'Relaxing';

export interface Command {
  id: string;
  text: string;
  category: Category;
}

export interface CategoryInfo {
  id: Category;
  name: Category;
  emoji: string;
  color: string;
  gradient: [string, string];
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'Romantic', name: 'Romantic', emoji: '💕', color: '#ff6b6b', gradient: ['#ff6b6b', '#ee5a5a'] },
  { id: 'Playful', name: 'Playful', emoji: '🎉', color: '#ffd93d', gradient: ['#ffd93d', '#f4c430'] },
  { id: 'Spicy', name: 'Spicy', emoji: '🔥', color: '#ff595e', gradient: ['#ff595e', '#ff4047'] },
  { id: 'Adventure', name: 'Adventure', emoji: '🌟', color: '#6bcb77', gradient: ['#6bcb77', '#56b368'] },
  { id: 'Relaxing', name: 'Relaxing', emoji: '🌙', color: '#4d96ff', gradient: ['#4d96ff', '#3d86ef'] },
];

export type ThemeMode = 'system' | 'light' | 'dark';
