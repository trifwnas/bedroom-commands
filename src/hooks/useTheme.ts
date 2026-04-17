import { useColorScheme } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { ThemeMode } from '../types';

export interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  primary: string;
  secondary: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

export const LightTheme: ThemeColors = {
  background: '#f5f5f5',
  surface: '#ffffff',
  card: '#ffffff',
  primary: '#ff595e',
  secondary: '#ff595e',
  text: '#1a1a1a',
  textSecondary: '#666666',
  border: '#e0e0e0',
  success: '#6bcb77',
  warning: '#ffd93d',
  error: '#ff595e',
};

export const DarkTheme: ThemeColors = {
  background: '#1a1a1a',
  surface: '#2d2d2d',
  card: '#3d3d3d',
  primary: '#ff595e',
  secondary: '#ff6f73',
  text: '#ffffff',
  textSecondary: '#a0a0a0',
  border: '#404040',
  success: '#6bcb77',
  warning: '#ffd93d',
  error: '#ff595e',
};

export const useTheme = (): ThemeColors => {
  const systemColorScheme = useColorScheme();
  const themeMode = useAppStore((state) => state.themeMode);

  if (themeMode === 'system') {
    return systemColorScheme === 'dark' ? DarkTheme : LightTheme;
  }

  return themeMode === 'dark' ? DarkTheme : LightTheme;
};

export const useIsDarkMode = (): boolean => {
  const systemColorScheme = useColorScheme();
  const themeMode = useAppStore((state) => state.themeMode);

  if (themeMode === 'system') {
    return systemColorScheme === 'dark';
  }

  return themeMode === 'dark';
};
