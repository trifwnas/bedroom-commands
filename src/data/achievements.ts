import { Category } from '../types';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'draws' | 'favorites' | 'challenges' | 'streak' | 'categories';
  requirement: number;
  unlockedAt?: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Draw achievements
  {
    id: 'first_draw',
    title: 'Getting Started',
    description: 'Draw your first card',
    icon: '🎯',
    category: 'draws',
    requirement: 1,
  },
  {
    id: 'draw_10',
    title: 'Warm Up',
    description: 'Draw 10 cards',
    icon: '🔥',
    category: 'draws',
    requirement: 10,
  },
  {
    id: 'draw_50',
    title: 'Getting Into It',
    description: 'Draw 50 cards',
    icon: '💪',
    category: 'draws',
    requirement: 50,
  },
  {
    id: 'draw_100',
    title: 'Dedicated',
    description: 'Draw 100 cards',
    icon: '⭐',
    category: 'draws',
    requirement: 100,
  },
  {
    id: 'draw_500',
    title: 'Command Master',
    description: 'Draw 500 cards',
    icon: '👑',
    category: 'draws',
    requirement: 500,
  },
  
  // Favorites achievements
  {
    id: 'first_favorite',
    title: 'Saver',
    description: 'Save your first favorite',
    icon: '💾',
    category: 'favorites',
    requirement: 1,
  },
  {
    id: 'favorites_10',
    title: 'Collector',
    description: 'Save 10 favorites',
    icon: '📚',
    category: 'favorites',
    requirement: 10,
  },
  {
    id: 'favorites_50',
    title: 'Treasury',
    description: 'Save 50 favorites',
    icon: '💎',
    category: 'favorites',
    requirement: 50,
  },
  
  // Challenge achievements
  {
    id: 'first_challenge',
    title: 'Daily Player',
    description: 'Complete your first daily challenge',
    icon: '🎖️',
    category: 'challenges',
    requirement: 1,
  },
  {
    id: 'challenges_7',
    title: 'Week Warrior',
    description: 'Complete 7 daily challenges',
    icon: '🗓️',
    category: 'challenges',
    requirement: 7,
  },
  {
    id: 'challenges_30',
    title: 'Monthly Champion',
    description: 'Complete 30 daily challenges',
    icon: '🏆',
    category: 'challenges',
    requirement: 30,
  },
  
  // Streak achievements
  {
    id: 'streak_3',
    title: 'Hat Trick',
    description: 'Maintain a 3-day streak',
    icon: '✨',
    category: 'streak',
    requirement: 3,
  },
  {
    id: 'streak_7',
    title: 'Week Long',
    description: 'Maintain a 7-day streak',
    icon: '🌟',
    category: 'streak',
    requirement: 7,
  },
  {
    id: 'streak_30',
    title: 'Monthly Magic',
    description: 'Maintain a 30-day streak',
    icon: '🌙',
    category: 'streak',
    requirement: 30,
  },
  
  // Category exploration
  {
    id: 'all_categories',
    title: 'Explorer',
    description: 'Draw from all 5 categories',
    icon: '🧭',
    category: 'categories',
    requirement: 5,
  },
];

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: string;
}

export const checkAchievements = (
  statistics: {
    totalDraws: number;
    totalFavorites: number;
    completedChallenges: number;
    streak: number;
    categoryDraws: Record<Category, number>;
  },
  unlockedAchievements: UnlockedAchievement[]
): UnlockedAchievement[] => {
  const newlyUnlocked: UnlockedAchievement[] = [];
  const unlockedIds = unlockedAchievements.map(a => a.achievementId);
  const today = new Date().toISOString().split('T')[0];
  
  for (const achievement of ACHIEVEMENTS) {
    if (unlockedIds.includes(achievement.id)) continue;
    
    let progress = 0;
    switch (achievement.category) {
      case 'draws':
        progress = statistics.totalDraws;
        break;
      case 'favorites':
        progress = statistics.totalFavorites;
        break;
      case 'challenges':
        progress = statistics.completedChallenges;
        break;
      case 'streak':
        progress = statistics.streak;
        break;
      case 'categories':
        progress = Object.values(statistics.categoryDraws).filter(c => c > 0).length;
        break;
    }
    
    if (progress >= achievement.requirement) {
      newlyUnlocked.push({
        achievementId: achievement.id,
        unlockedAt: today,
      });
    }
  }
  
  return newlyUnlocked;
};

export const getAchievementProgress = (
  achievement: Achievement,
  statistics: {
    totalDraws: number;
    totalFavorites: number;
    completedChallenges: number;
    streak: number;
    categoryDraws: Record<Category, number>;
  }
): number => {
  switch (achievement.category) {
    case 'draws':
      return statistics.totalDraws;
    case 'favorites':
      return statistics.totalFavorites;
    case 'challenges':
      return statistics.completedChallenges;
    case 'streak':
      return statistics.streak;
    case 'categories':
      return Object.values(statistics.categoryDraws).filter(c => c > 0).length;
    default:
      return 0;
  }
};
