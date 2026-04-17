import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, ThemeMode } from '../types';
import { COMMANDS, COMMAND_TO_CATEGORY } from '../data/commands';
import { UnlockedAchievement, checkAchievements } from '../data/achievements';

interface Statistics {
  totalDraws: number;
  totalFavorites: number;
  categoryDraws: Record<Category, number>;
  streak: number;
  lastDrawDate: string | null;
  completedChallenges: number;
}

interface DailyChallenge {
  command: string;
  category: Category;
  date: string;
  completed: boolean;
}

interface AppState {
  favorites: string[];
  history: string[];
  customCommands: Record<Category, string[]>;
  disabledCategories: Category[];
  themeMode: ThemeMode;
  soundEnabled: boolean;
  statistics: Statistics;
  dailyChallenge: DailyChallenge | null;
  lastDrawnCommand: string | null;
  unlockedAchievements: UnlockedAchievement[];
  newAchievements: UnlockedAchievement[];
  hasSeenOnboarding: boolean;
  
  addFavorite: (command: string) => void;
  removeFavorite: (command: string) => void;
  isFavorite: (command: string) => boolean;
  
  addToHistory: (command: string) => void;
  clearHistory: () => void;
  
  addCustomCommand: (category: Category, command: string) => void;
  removeCustomCommand: (category: Category, command: string) => void;
  getAllCommands: (category: Category) => string[];
  
  toggleCategory: (category: Category) => void;
  isCategoryEnabled: (category: Category) => boolean;
  
  setThemeMode: (mode: ThemeMode) => void;
  setSoundEnabled: (enabled: boolean) => void;
  
  setLastDrawnCommand: (command: string | null) => void;
  undoLastDraw: () => void;
  
  generateDailyChallenge: () => void;
  completeDailyChallenge: () => void;
  getDailyChallenge: () => DailyChallenge | null;
  
  getStatistics: () => Statistics;
  getUnlockedAchievements: () => UnlockedAchievement[];
  getNewAchievements: () => UnlockedAchievement[];
  clearNewAchievements: () => void;
  checkAndUnlockAchievements: () => void;
  
  exportData: () => any;
  importData: (data: any) => boolean;
  clearAllData: () => void;
  
  setHasSeenOnboarding: (value: boolean) => void;
}

const getToday = () => new Date().toISOString().split('T')[0];

const getRandomCategory = (): Category => {
  const categories: Category[] = ['Romantic', 'Playful', 'Spicy', 'Adventure', 'Relaxing'];
  return categories[Math.floor(Math.random() * categories.length)];
};

const getRandomCommand = (category: Category): string => {
  const commands = COMMANDS[category] || [];
  return commands[Math.floor(Math.random() * commands.length)];
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      favorites: [],
      history: [],
      customCommands: {
        Romantic: [],
        Playful: [],
        Spicy: [],
        Adventure: [],
        Relaxing: [],
      },
      disabledCategories: [],
      themeMode: 'system',
      soundEnabled: true,
      statistics: {
        totalDraws: 0,
        totalFavorites: 0,
        categoryDraws: {
          Romantic: 0,
          Playful: 0,
          Spicy: 0,
          Adventure: 0,
          Relaxing: 0,
        },
        streak: 0,
        lastDrawDate: null,
        completedChallenges: 0,
      },
      dailyChallenge: null,
      lastDrawnCommand: null,
      unlockedAchievements: [],
      newAchievements: [],
      hasSeenOnboarding: false,

      addFavorite: (command: string) => {
        const { favorites, statistics, checkAndUnlockAchievements } = get();
        if (!favorites.includes(command)) {
          set({ 
            favorites: [...favorites, command],
            statistics: {
              ...statistics,
              totalFavorites: statistics.totalFavorites + 1,
            }
          });
          checkAndUnlockAchievements();
        }
      },

      removeFavorite: (command: string) => {
        const { favorites } = get();
        set({ favorites: favorites.filter((f) => f !== command) });
      },

      isFavorite: (command: string) => {
        return get().favorites.includes(command);
      },

      addToHistory: (command: string) => {
        const { history, statistics } = get();
        const today = getToday();
        const newHistory = [command, ...history].slice(0, 50);
        
        let newStreak = statistics.streak;
        if (statistics.lastDrawDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          if (statistics.lastDrawDate === yesterdayStr) {
            newStreak = statistics.streak + 1;
          } else {
            newStreak = 1;
          }
        }
        
        const categoryDraws = { ...statistics.categoryDraws };
        const categoryInfo = COMMAND_TO_CATEGORY.get(command);
        if (categoryInfo) {
          categoryDraws[categoryInfo.id] = (categoryDraws[categoryInfo.id] || 0) + 1;
        }

        set({ 
          history: newHistory,
          statistics: {
            ...statistics,
            totalDraws: statistics.totalDraws + 1,
            categoryDraws,
            streak: newStreak,
            lastDrawDate: today,
          },
          lastDrawnCommand: command,
        });
      },

      clearHistory: () => {
        set({ history: [] });
      },

      addCustomCommand: (category: Category, command: string) => {
        const { customCommands } = get();
        if (!customCommands[category].includes(command)) {
          set({
            customCommands: {
              ...customCommands,
              [category]: [...customCommands[category], command],
            },
          });
        }
      },

      removeCustomCommand: (category: Category, command: string) => {
        const { customCommands } = get();
        set({
          customCommands: {
            ...customCommands,
            [category]: customCommands[category].filter((c) => c !== command),
          },
        });
      },

      getAllCommands: (category: Category) => {
        const { customCommands } = get();
        const defaultCommands = COMMANDS[category] || [];
        const userCommands = customCommands[category] || [];
        return [...defaultCommands, ...userCommands];
      },

      toggleCategory: (category: Category) => {
        const { disabledCategories } = get();
        if (disabledCategories.includes(category)) {
          set({
            disabledCategories: disabledCategories.filter((c) => c !== category),
          });
        } else {
          set({ disabledCategories: [...disabledCategories, category] });
        }
      },

      isCategoryEnabled: (category: Category) => {
        return !get().disabledCategories.includes(category);
      },

      setThemeMode: (mode: ThemeMode) => {
        set({ themeMode: mode });
      },

      setSoundEnabled: (enabled: boolean) => {
        set({ soundEnabled: enabled });
      },

      setLastDrawnCommand: (command: string | null) => {
        set({ lastDrawnCommand: command });
      },

      undoLastDraw: () => {
        const { history, lastDrawnCommand } = get();
        if (lastDrawnCommand && history.length > 0) {
          const index = history.indexOf(lastDrawnCommand);
          if (index !== -1) {
            const newHistory = [...history];
            newHistory.splice(index, 1);
            set({
              history: newHistory,
              lastDrawnCommand: null,
            });
          }
        }
      },

      generateDailyChallenge: () => {
        const { dailyChallenge } = get();
        const today = getToday();
        
        if (dailyChallenge?.date === today) {
          return;
        }

        const category = getRandomCategory();
        const command = getRandomCommand(category);
        
        set({
          dailyChallenge: {
            command,
            category,
            date: today,
            completed: false,
          }
        });
      },

      completeDailyChallenge: () => {
        const { dailyChallenge, statistics, checkAndUnlockAchievements } = get();
        if (dailyChallenge && !dailyChallenge.completed) {
          set({
            dailyChallenge: {
              ...dailyChallenge,
              completed: true,
            },
            statistics: {
              ...statistics,
              completedChallenges: statistics.completedChallenges + 1,
            }
          });
          checkAndUnlockAchievements();
        }
      },

      getDailyChallenge: () => {
        const { dailyChallenge } = get();
        const today = getToday();
        
        if (!dailyChallenge || dailyChallenge.date !== today) {
          get().generateDailyChallenge();
          return get().dailyChallenge;
        }
        
        return dailyChallenge;
      },

      getStatistics: () => {
        return get().statistics;
      },

      exportData: () => {
        const state = get();
        return {
          version: '1.0.0',
          favorites: state.favorites,
          history: state.history,
          customCommands: state.customCommands,
          disabledCategories: state.disabledCategories,
          statistics: state.statistics,
          themeMode: state.themeMode,
          soundEnabled: state.soundEnabled,
        };
      },

      importData: (data: any) => {
        if (data && data.version === '1.0.0') {
          set({
            favorites: data.favorites || [],
            history: data.history || [],
            customCommands: data.customCommands || {
              Romantic: [],
              Playful: [],
              Spicy: [],
              Adventure: [],
              Relaxing: [],
            },
            disabledCategories: data.disabledCategories || [],
            themeMode: data.themeMode || 'system',
            soundEnabled: data.soundEnabled ?? true,
            statistics: data.statistics || get().statistics,
          });
          return true;
        }
        return false;
      },

      getUnlockedAchievements: () => {
        return get().unlockedAchievements;
      },

      getNewAchievements: () => {
        return get().newAchievements;
      },

      clearNewAchievements: () => {
        set({ newAchievements: [] });
      },

      checkAndUnlockAchievements: () => {
        const { statistics, unlockedAchievements } = get();
        const newlyUnlocked = checkAchievements(statistics, unlockedAchievements);
        
        if (newlyUnlocked.length > 0) {
          set({
            unlockedAchievements: [...unlockedAchievements, ...newlyUnlocked],
            newAchievements: newlyUnlocked,
          });
        }
      },

      setHasSeenOnboarding: (value: boolean) => {
        set({ hasSeenOnboarding: value });
      },

      clearAllData: () => {
        set({
          favorites: [],
          history: [],
          customCommands: {
            Romantic: [],
            Playful: [],
            Spicy: [],
            Adventure: [],
            Relaxing: [],
          },
          disabledCategories: [],
          themeMode: 'system',
          soundEnabled: true,
          statistics: {
            totalDraws: 0,
            totalFavorites: 0,
            categoryDraws: {
              Romantic: 0,
              Playful: 0,
              Spicy: 0,
              Adventure: 0,
              Relaxing: 0,
            },
            streak: 0,
            lastDrawDate: null,
            completedChallenges: 0,
          },
          dailyChallenge: null,
          lastDrawnCommand: null,
          unlockedAchievements: [],
          newAchievements: [],
          hasSeenOnboarding: false,
        });
      },
    }),
    {
      name: 'bedroom-commands-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
