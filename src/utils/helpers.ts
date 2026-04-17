import * as Haptics from 'expo-haptics';
import { Platform, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';

export const triggerHaptic = async (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'medium') => {
  try {
    switch (type) {
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  } catch (error) {
    // Haptics not available
  }
};

export const shareCommand = async (command: string, category: string): Promise<boolean> => {
  const message = `🎮 Bedroom Commands - ${category}\n\n"${command}"\n\nDownload the app to play!`;
  
  try {
    if (Platform.OS === 'web') {
      if (navigator.share) {
        await navigator.share({ title: 'Bedroom Commands', text: message });
        return true;
      } else {
        await Clipboard.setStringAsync(message);
        return true;
      }
    } else {
      await Share.share({ message });
      return true;
    }
  } catch (error) {
    // User cancelled or share failed
  }
  
  return false;
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
