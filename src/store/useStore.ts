import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Category, ThemeMode, Mood } from '../types';
import { COMMANDS, cmdId, getCommandCategory, getCommandMoodById, toCommandId } from '../data/commands';
import type { CommandId } from '../data/commands';
import { getCachedCommands } from '../i18n/commands/loader';
import type { Lang } from '../i18n/languages';
import type { UnlockedAchievement } from '../data/achievements';
import { checkAchievements } from '../data/achievements';

interface Statistics {
  totalDraws: number;
  totalFavorites: number;
  categoryDraws: Record<Category, number>;
  moodDraws: Record<Mood, number>;
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
  completedCommands: string[];
  customCommands: Record<Category, string[]>;
  disabledCategories: Category[];
  disabledMoods: Mood[];
  themeMode: ThemeMode;
  soundEnabled: boolean;
  language: Lang;
  statistics: Statistics;
  dailyChallenge: DailyChallenge | null;
  lastDrawnCommand: string | null;
  unlockedAchievements: UnlockedAchievement[];
  newAchievements: UnlockedAchievement[];
  hasSeenOnboarding: boolean;
  shuffledDeck: string[];
  deckCursor: number;
  seenIds: string[];

  addFavorite: (command: string) => void;
  removeFavorite: (command: string) => void;
  addToHistory: (command: string) => void;
  clearHistory: () => void;
  addCustomCommand: (category: Category, command: string) => void;
  removeCustomCommand: (category: Category, command: string) => void;
  getAllCommands: (category: Category) => string[];
  toggleCategory: (category: Category) => void;
  toggleMood: (mood: Mood) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setLanguage: (lang: Lang) => void;
  undoLastDraw: () => void;
  markCompleted: (command: string) => void;
  generateDailyChallenge: () => void;
  completeDailyChallenge: () => void;
  getDailyChallenge: () => DailyChallenge | null;
  checkAndUnlockAchievements: () => void;
  clearNewAchievements: () => void;
  exportData: () => ExportData;
  importData: (data: unknown) => boolean;
  clearAllData: () => void;
  setHasSeenOnboarding: (value: boolean) => void;
  getShuffledDeck: (pool: string[]) => string[];
  drawFromDeck: (pool: string[]) => string | null;
  resetDeck: () => void;
  undoDeck: (id: string) => void;
}

interface ExportData {
  version: string;
  favorites: string[];
  history: string[];
  completedCommands: string[];
  customCommands: Record<Category, string[]>;
  disabledCategories: Category[];
  disabledMoods: Mood[];
  statistics: Statistics;
  themeMode: ThemeMode;
  soundEnabled: boolean;
  language?: Lang;
}

const getToday = () => new Date().toISOString().split('T')[0];

const defaultStats: Statistics = {
  totalDraws: 0,
  totalFavorites: 0,
  categoryDraws: { Romantic: 0, Playful: 0, Spicy: 0, Adventure: 0, Relaxing: 0 },
  moodDraws: { sweet: 0, playful: 0, flirty: 0, spicy: 0, wild: 0 },
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
      completedCommands: [],
      customCommands: { ...defaultCustom },
      disabledCategories: [],
      disabledMoods: [],
      themeMode: 'system',
      soundEnabled: true,
      language: (() => {
        if (typeof window !== 'undefined') {
          const q = new URLSearchParams(window.location.search).get('lang');
          if (q && (['en','es','de','da','el','fr','pt','ja','ko','zh'] as string[]).includes(q)) return q as Lang;
        }
        if (typeof navigator !== 'undefined') {
          for (const nav of navigator.languages) {
            const code = nav.toLowerCase().replace('_', '-').split('-')[0];
            if ((['en','es','de','da','el','fr','pt','ja','ko','zh'] as string[]).includes(code)) return code as Lang;
          }
        }
        return 'en';
      })(),
      statistics: { ...defaultStats },
      dailyChallenge: null,
      lastDrawnCommand: null,
      unlockedAchievements: [],
      newAchievements: [],
      hasSeenOnboarding: false,
      shuffledDeck: [],
      deckCursor: 0,
      seenIds: [],

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
        const { favorites, statistics } = get();
        set({
          favorites: favorites.filter(f => f !== command),
          statistics: { ...statistics, totalFavorites: Math.max(0, statistics.totalFavorites - 1) },
        });
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
        const moodDraws = { ...statistics.moodDraws };
        const cat = getCommandCategory(command);
        if (cat) {
          categoryDraws[cat] = (categoryDraws[cat] || 0) + 1;
          const mood = getCommandMoodById(command);
          moodDraws[mood] = (moodDraws[mood] || 0) + 1;
        }

        set({
          history: newHistory,
          statistics: {
            ...statistics,
            totalDraws: statistics.totalDraws + 1,
            categoryDraws,
            moodDraws,
            streak: newStreak,
            lastDrawDate: today,
          },
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
        const lang = get().language;
        const cached = getCachedCommands(lang);
        const base = cached?.[category] ?? COMMANDS[category] ?? [];
        return [...base, ...(get().customCommands[category] || [])];
      },

      toggleCategory: (category) => {
        const { disabledCategories } = get();
        set({
          disabledCategories: disabledCategories.includes(category)
            ? disabledCategories.filter(c => c !== category)
            : [...disabledCategories, category],
        });
      },

      toggleMood: (mood) => {
        const { disabledMoods } = get();
        set({
          disabledMoods: disabledMoods.includes(mood)
            ? disabledMoods.filter(m => m !== mood)
            : [...disabledMoods, mood],
        });
      },

      setThemeMode: (mode) => set({ themeMode: mode }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setLanguage: (lang) => set({ language: lang }),

      undoLastDraw: () => {
        const { history, lastDrawnCommand, statistics } = get();
        if (lastDrawnCommand && history.length > 0) {
          const newHistory = [...history];
          const idx = newHistory.indexOf(lastDrawnCommand);
          if (idx !== -1) {
            newHistory.splice(idx, 1);
            const categoryDraws = { ...statistics.categoryDraws };
            const moodDraws = { ...statistics.moodDraws };
            const cat = getCommandCategory(lastDrawnCommand);
            if (cat) {
              categoryDraws[cat] = Math.max(0, (categoryDraws[cat] || 0) - 1);
              const mood = getCommandMoodById(lastDrawnCommand);
              moodDraws[mood] = Math.max(0, (moodDraws[mood] || 0) - 1);
            }
            set({
              history: newHistory,
              lastDrawnCommand: null,
              statistics: {
                ...statistics,
                totalDraws: Math.max(0, statistics.totalDraws - 1),
                categoryDraws,
                moodDraws,
              },
            });
          }
        }
      },

      markCompleted: (command) => {
        const { completedCommands } = get();
        if (!completedCommands.includes(command)) {
          set({ completedCommands: [...completedCommands, command] });
          get().checkAndUnlockAchievements();
        }
      },

      generateDailyChallenge: () => {
        const { dailyChallenge, language } = get();
        const today = getToday();
        if (dailyChallenge?.date === today) return;

        const cats: Category[] = ['Romantic', 'Playful', 'Spicy', 'Adventure', 'Relaxing'];
        const category = cats[Math.floor(Math.random() * cats.length)];
        const cached = getCachedCommands(language);
        const commands = cached?.[category] ?? COMMANDS[category];
        const index = Math.floor(Math.random() * commands.length);
        const command = cmdId(category, index);

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
            newAchievements: [...get().newAchievements, ...newlyUnlocked],
          });
        }
      },

      clearNewAchievements: () => set({ newAchievements: [] }),

      exportData: () => {
        const s = get();
        return {
          version: '4.0.0',
          favorites: s.favorites,
          history: s.history,
          completedCommands: s.completedCommands,
          customCommands: s.customCommands,
          disabledCategories: s.disabledCategories,
          disabledMoods: s.disabledMoods,
          statistics: s.statistics,
          themeMode: s.themeMode,
          soundEnabled: s.soundEnabled,
          language: s.language,
        };
      },

      importData: (data) => {
        const d = data as Partial<ExportData>;
        if (d && (d.version === '3.0.0' || d.version === '4.0.0')) {
          set({
            favorites: (d.favorites || []).map(toCommandId),
            history: (d.history || []).map(toCommandId),
            completedCommands: (d.completedCommands || []).map(toCommandId),
            customCommands: d.customCommands || defaultCustom,
            disabledCategories: d.disabledCategories || [],
            disabledMoods: d.disabledMoods || [],
            themeMode: d.themeMode || 'system',
            soundEnabled: d.soundEnabled ?? true,
            statistics: d.statistics || get().statistics,
            language: ((d as any).language as Lang) || 'en',
          });
          return true;
        }
        return false;
      },

      clearAllData: () => set({
        favorites: [], history: [], completedCommands: [],
        customCommands: { ...defaultCustom },
        disabledCategories: [], disabledMoods: [],
        themeMode: 'system', soundEnabled: true,
        statistics: { ...defaultStats }, dailyChallenge: null,
        lastDrawnCommand: null, unlockedAchievements: [], newAchievements: [],
        hasSeenOnboarding: false,
        shuffledDeck: [], deckCursor: 0, seenIds: [],
      }),

      setHasSeenOnboarding: (value) => set({ hasSeenOnboarding: value }),

      getShuffledDeck: (pool) => {
        const { shuffledDeck, deckCursor, seenIds } = get();
        // If deck is empty or pool size changed or cursor beyond, rebuild
        const poolSet = new Set(pool);
        const deckValid = shuffledDeck.length === pool.length && shuffledDeck.every(id => poolSet.has(id));
        if (!deckValid || shuffledDeck.length === 0) {
          const shuffled = [...pool];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          // Filter out already seen to enforce never-repeat until all seen
          const unseen = shuffled.filter(id => !seenIds.includes(id));
          const finalDeck = unseen.length > 0 ? unseen : shuffled;
          set({ shuffledDeck: finalDeck, deckCursor: 0 });
          return finalDeck;
        }
        return shuffledDeck.slice(deckCursor);
      },

      drawFromDeck: (pool) => {
        const { shuffledDeck, deckCursor, seenIds } = get();
        let deck = shuffledDeck;
        let cursor = deckCursor;
        const poolSet = new Set(pool);
        const deckValid = deck.length > 0 && deck.length === pool.length && deck.every(id => poolSet.has(id));
        if (!deckValid) {
          const shuffled = [...pool];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          const unseen = shuffled.filter(id => !seenIds.includes(id));
          deck = unseen.length > 0 ? unseen : shuffled;
          cursor = 0;
          // If we had to reshuffle full pool because all seen, clear seen
          if (unseen.length === 0) {
            set({ seenIds: [] });
          }
        }
        if (cursor >= deck.length) {
          // Exhausted deck -> reshuffle full pool, clear seen
          const shuffled = [...pool];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          deck = shuffled;
          cursor = 0;
          set({ seenIds: [] });
        }
        const id = deck[cursor];
        set({ shuffledDeck: deck, deckCursor: cursor + 1, seenIds: seenIds.includes(id) ? seenIds : [...seenIds, id] });
        return id;
      },

      resetDeck: () => set({ shuffledDeck: [], deckCursor: 0, seenIds: [] }),

      undoDeck: (id: string) => {
        const { seenIds, shuffledDeck, deckCursor } = get();
        const idx = seenIds.indexOf(id);
        if (idx !== -1) {
          const newSeen = [...seenIds];
          newSeen.splice(idx, 1);
          set({ seenIds: newSeen, deckCursor: Math.max(0, deckCursor - 1) });
        }
      },
    }),
    {
      name: 'bedroom-commands-v3',
      version: 2,
      migrate: (persistedState, _version) => {
        const raw = (persistedState || {}) as Record<string, unknown>;
        const arr = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);
        return {
          ...raw,
          favorites: arr(raw.favorites).map(toCommandId),
          history: arr(raw.history).map(toCommandId),
          completedCommands: arr(raw.completedCommands).map(toCommandId),
          lastDrawnCommand:
            typeof raw.lastDrawnCommand === 'string' ? toCommandId(raw.lastDrawnCommand) : null,
          dailyChallenge: raw.dailyChallenge
            ? { ...(raw.dailyChallenge as Record<string, unknown>), command: toCommandId(String((raw.dailyChallenge as { command: string }).command)) }
            : null,
          shuffledDeck: arr((raw as any).shuffledDeck).map(toCommandId),
          seenIds: arr((raw as any).seenIds).map(toCommandId),
          deckCursor: typeof (raw as any).deckCursor === 'number' ? (raw as any).deckCursor as number : 0,
        };
      },
    }
  )
);
