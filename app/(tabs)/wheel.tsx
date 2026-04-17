import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/store/useAppStore';
import { CATEGORIES, Category, CategoryInfo } from '../../src/types';
import { COMMANDS } from '../../src/data/commands';
import { triggerHaptic } from '../../src/utils/helpers';
import { ActionButton } from '../../src/components/ActionButton';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width - 80;
const SEGMENTS = 5;

interface WheelSegment {
  category: CategoryInfo;
  startAngle: number;
  endAngle: number;
}

export default function WheelScreen() {
  const theme = useTheme();
  const { 
    favorites, 
    addFavorite, 
    removeFavorite, 
    addToHistory, 
    disabledCategories,
    soundEnabled,
    checkAndUnlockAchievements,
  } = useAppStore();

  const [currentCommand, setCurrentCommand] = useState<string>('');
  const [currentCategory, setCurrentCategory] = useState<CategoryInfo | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const enabledCategories = CATEGORIES.filter(cat => !disabledCategories.includes(cat.id));
  const segments: WheelSegment[] = enabledCategories.map((cat, index) => ({
    category: cat,
    startAngle: (index * 360) / SEGMENTS,
    endAngle: ((index + 1) * 360) / SEGMENTS,
  }));

  const getRandomCategory = useCallback((): CategoryInfo => {
    const randomIndex = Math.floor(Math.random() * enabledCategories.length);
    return enabledCategories[randomIndex];
  }, [enabledCategories]);

  const getRandomCommand = useCallback((category: Category): string => {
    const commands = COMMANDS[category] || [];
    return commands[Math.floor(Math.random() * commands.length)];
  }, []);

  const spinWheel = useCallback(() => {
    if (isSpinning) return;

    setIsSpinning(true);
    setShowResult(false);
    scale.value = withSpring(1.1, {}, () => {
      scale.value = withSpring(1);
    });

    if (soundEnabled) {
      triggerHaptic('medium');
    }

    const targetCategory = getRandomCategory();
    const segmentIndex = enabledCategories.findIndex(c => c.id === targetCategory.id);
    const segmentAngle = 360 / SEGMENTS;
    
    const segmentMiddle = segmentIndex * segmentAngle + segmentAngle / 2;
    const spins = 5 + Math.random() * 3;
    const targetRotation = spins * 360 + (360 - segmentMiddle);
    
    rotation.value = withTiming(
      rotation.value + targetRotation,
      { duration: 4000 },
      (finished) => {
        if (finished) {
          runOnJS(handleSpinComplete)(targetCategory);
        }
      }
    );
  }, [isSpinning, getRandomCategory, enabledCategories, soundEnabled, rotation, scale]);

  const handleSpinComplete = useCallback((category: CategoryInfo) => {
    const command = getRandomCommand(category.id);
    setCurrentCommand(command);
    setCurrentCategory(category);
    setShowResult(true);
    addToHistory(command);
    checkAndUnlockAchievements();

    if (soundEnabled) {
      triggerHaptic('success');
    }

    setIsSpinning(false);
  }, [getRandomCommand, addToHistory, checkAndUnlockAchievements, soundEnabled]);

  const handleFavoriteToggle = useCallback(() => {
    if (!currentCommand) return;
    
    if (favorites.includes(currentCommand)) {
      removeFavorite(currentCommand);
    } else {
      addFavorite(currentCommand);
    }
    
    if (soundEnabled) {
      triggerHaptic('light');
    }
  }, [currentCommand, favorites, addFavorite, removeFavorite, soundEnabled]);

  const wheelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  const pointerRotation = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value % 360}deg` }],
  }));

  const isFavorite = currentCommand ? favorites.includes(currentCommand) : false;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Spin the Wheel</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Spin to discover a new adventure!
        </Text>
      </View>

      <View style={styles.wheelContainer}>
        <View style={styles.pointer} />
        <Animated.View style={[styles.wheel, wheelAnimatedStyle]}>
          {segments.map((segment, index) => {
            const angle = segment.startAngle + (segment.endAngle - segment.startAngle) / 2;
            return (
              <View
                key={segment.category.id}
                style={[
                  styles.segment,
                  {
                    backgroundColor: segment.category.color,
                    transform: [
                      { rotate: `${angle}deg` },
                      { translateX: WHEEL_SIZE / 4 },
                    ],
                  },
                ]}
              >
                <Text style={styles.segmentText}>{segment.category.emoji}</Text>
                <Text style={styles.segmentLabel}>{segment.category.name}</Text>
              </View>
            );
          })}
          <View style={styles.wheelCenter}>
            <Feather name="heart" size={32} color="#fff" />
          </View>
        </Animated.View>
      </View>

      {showResult && currentCommand && (
        <View style={styles.resultContainer}>
          <View style={[styles.resultCard, { backgroundColor: currentCategory?.color }]}>
            <Text style={styles.resultEmoji}>{currentCategory?.emoji}</Text>
            <Text style={styles.resultText}>{currentCommand}</Text>
            <View style={styles.resultActions}>
              <Pressable onPress={handleFavoriteToggle} style={styles.resultButton}>
                <Feather 
                  name="heart" 
                  size={24} 
                  color={isFavorite ? '#fff' : 'rgba(255,255,255,0.7)'} 
                />
              </Pressable>
            </View>
          </View>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <ActionButton
          title={isSpinning ? 'Spinning...' : 'Spin!'}
          icon="zap"
          onPress={spinWheel}
          disabled={isSpinning}
        />
      </View>

      {!showResult && !isSpinning && (
        <Text style={[styles.hint, { color: theme.textSecondary }]}>
          Tap Spin to pick a random category
        </Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  wheelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  pointer: {
    position: 'absolute',
    top: 10,
    zIndex: 10,
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderTopWidth: 25,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#333',
  },
  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    backgroundColor: '#ff595e',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  segment: {
    position: 'absolute',
    width: WHEEL_SIZE / 2,
    height: 60,
    left: WHEEL_SIZE / 2,
    transformOrigin: 'left center',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
  },
  segmentText: {
    fontSize: 28,
    marginBottom: 2,
  },
  segmentLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  wheelCenter: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ff595e',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    elevation: 5,
  },
  resultContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  resultCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  resultEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  resultText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 16,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 16,
  },
  resultButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  hint: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
    fontStyle: 'italic',
  },
});
