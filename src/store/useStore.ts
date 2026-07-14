import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Category, ThemeMode } from '../types';
import { COMMANDS, COMMAND_TO_CATEGORY } from '../data/commands';
import type { UnlockedAchievement } from '../data/achievements';
import { checkAchievements } from '../data/achievements';

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
  addToHistory: (command: string) => void;
  clearHistory: () => void;
  addCustomCommand: (category: Category, command: string) => void;
  removeCustomCommand: (category: Category, command: string) => void;
  getAllCommands: (category: Category) => string[];
  toggleCategory: (category: Category) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setSoundEnabled: (enabled: boolean) => void;
  undoLastDraw: () => void;
  generateDailyChallenge: () => void;
  completeDailyChallenge: () => void;
  getDailyChallenge: () => DailyChallenge | null;
  checkAndUnlockAchievements: () => void;
  clearNewAchievements: () => void;
  exportData: () => any;
  importData: (data: any) => boolean;
  clearAllData: () => void;
  setHasSeenOnboarding: (value: boolean) => void;
}

const getToday = () => new Date().toISOString().split('T')[0];

const defaultStats: Statistics = {
  totalDraws: 0,
  totalFavorites: 0,
  categoryDraws: { Romantic: 0, Playful: 0, Spicy: 0, Adventure: 0, Relaxing: 0 },
  streak: 0,
  lastDrawDate: null,
  completedChallenges: 0,
};

const defaultCustom: Record<Category, string[]> = {
  Romantic: [], Playful: [], Spicy: [], Adventure: [], Relaxing: [],
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      favorites: [],
      history: [],
      customCommands: { ...defaultCustom },
      disabledCategories: [],
      themeMode: 'system',
      soundEnabled: true,
      statistics: { ...defaultStats },
      dailyChallenge: null,
      lastDrawnCommand: null,
      unlockedAchievements: [],
      newAchievements: [],
      hasSeenOnboarding: false,

      addFavorite: (command) => {
        const { favorites, statistics } = get();
        if (!favorites.includes(command)) {
          set({
            favorites: [...favorites, command],
            statistics: { ...statistics, totalFavorites: statistics.totalFavorites + 1 },
          });
          get().checkAndUnlockAchievements();
        }
      },

      removeFavorite: (command) => {
        set({ favorites: get().favorites.filter(f => f !== command) });
      },

      addToHistory: (command) => {
        const { history, statistics } = get();
        const today = getToday();
        const newHistory = [command, ...history].slice(0, 50);

        let newStreak = statistics.streak;
        if (statistics.lastDrawDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          newStreak = statistics.lastDrawDate === yesterdayStr ? statistics.streak + 1 : 1;
        }

        const categoryDraws = { ...statistics.categoryDraws };
        const cat = COMMAND_TO_CATEGORY.get(command);
        if (cat) categoryDraws[cat.id] = (categoryDraws[cat.id] || 0) + 1;

        set({
          history: newHistory,
          statistics: { ...statistics, totalDraws: statistics.totalDraws + 1, categoryDraws, streak: newStreak, lastDrawDate: today },
          lastDrawnCommand: command,
        });
      },

      clearHistory: () => set({ history: [] }),

      addCustomCommand: (category, command) => {
        const { customCommands } = get();
        if (!customCommands[category].includes(command)) {
          set({ customCommands: { ...customCommands, [category]: [...customCommands[category], command] } });
        }
      },

      removeCustomCommand: (category, command) => {
        const { customCommands } = get();
        set({ customCommands: { ...customCommands, [category]: customCommands[category].filter(c => c !== command) } });
      },

      getAllCommands: (category) => {
        return [...(COMMANDS[category] || []), ...(get().customCommands[category] || [])];
      },

      toggleCategory: (category) => {
        const { disabledCategories } = get();
        set({
          disabledCategories: disabledCategories.includes(category)
            ? disabledCategories.filter(c => c !== category)
            : [...disabledCategories, category],
        });
      },

      setThemeMode: (mode) => set({ themeMode: mode }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),

      undoLastDraw: () => {
        const { history, lastDrawnCommand } = get();
        if (lastDrawnCommand && history.length > 0) {
          const newHistory = [...history];
          const idx = newHistory.indexOf(lastDrawnCommand);
          if (idx !== -1) {
            newHistory.splice(idx, 1);
            set({ history: newHistory, lastDrawnCommand: null });
          }
        }
      },

      generateDailyChallenge: () => {
        const { dailyChallenge } = get();
        const today = getToday();
        if (dailyChallenge?.date === today) return;

        const cats: Category[] = ['Romantic', 'Playful', 'Spicy', 'Adventure', 'Relaxing'];
        const category = cats[Math.floor(Math.random() * cats.length)];
        const commands = COMMANDS[category];
        const command = commands[Math.floor(Math.random() * commands.length)];

        set({ dailyChallenge: { command, category, date: today, completed: false } });
      },

      completeDailyChallenge: () => {
        const { dailyChallenge, statistics } = get();
        if (dailyChallenge && !dailyChallenge.completed) {
          set({
            dailyChallenge: { ...dailyChallenge, completed: true },
            statistics: { ...statistics, completedChallenges: statistics.completedChallenges + 1 },
          });
          get().checkAndUnlockAchievements();
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

      clearNewAchievements: () => set({ newAchievements: [] }),

      exportData: () => {
        const s = get();
        return {
          version: '2.0.0', favorites: s.favorites, history: s.history,
          customCommands: s.customCommands, disabledCategories: s.disabledCategories,
          statistics: s.statistics, themeMode: s.themeMode, soundEnabled: s.soundEnabled,
        };
      },

      importData: (data) => {
        if (data && data.version === '2.0.0') {
          set({
            favorites: data.favorites || [], history: data.history || [],
            customCommands: data.customCommands || defaultCustom,
            disabledCategories: data.disabledCategories || [],
            themeMode: data.themeMode || 'system',
            soundEnabled: data.soundEnabled ?? true,
            statistics: data.statistics || get().statistics,
          });
          return true;
        }
        return false;
      },

      clearAllData: () => set({
        favorites: [], history: [], customCommands: { ...defaultCustom },
        disabledCategories: [], themeMode: 'system', soundEnabled: true,
        statistics: { ...defaultStats }, dailyChallenge: null,
        lastDrawnCommand: null, unlockedAchievements: [], newAchievements: [],
        hasSeenOnboarding: false,
      }),

      setHasSeenOnboarding: (value) => set({ hasSeenOnboarding: value }),
    }),
    { name: 'bedroom-commands-v2' }
  )
);
