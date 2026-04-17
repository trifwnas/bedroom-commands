import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Feather } from '@expo/vector-icons';

import { CommandCard } from '../../src/components/CommandCard';
import { CategorySelector } from '../../src/components/CategorySelector';
import { ActionButton } from '../../src/components/ActionButton';
import { Timer } from '../../src/components/Timer';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/store/useAppStore';
import { Category, CATEGORIES, CategoryInfo } from '../../src/types';
import { COMMANDS } from '../../src/data/commands';
import { triggerHaptic, shareCommand } from '../../src/utils/helpers';

export default function HomeScreen() {
  const theme = useTheme();
  const favorites = useAppStore(state => state.favorites);
  const addFavorite = useAppStore(state => state.addFavorite);
  const removeFavorite = useAppStore(state => state.removeFavorite);
  const addToHistory = useAppStore(state => state.addToHistory);
  const disabledCategories = useAppStore(state => state.disabledCategories);
  const soundEnabled = useAppStore(state => state.soundEnabled);
  const history = useAppStore(state => state.history);
  const undoLastDraw = useAppStore(state => state.undoLastDraw);
  const checkAndUnlockAchievements = useAppStore(state => state.checkAndUnlockAchievements);

  const [selectedCategory, setSelectedCategory] = useState<Category>('Random');
  const [currentCommand, setCurrentCommand] = useState<string>('');
  const [currentCategory, setCurrentCategory] = useState<CategoryInfo>(CATEGORIES[0]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnCommands, setDrawnCommands] = useState<string[]>([]);
  const [showTimer, setShowTimer] = useState(false);
  const [selectedTimerMinutes, setSelectedTimerMinutes] = useState(5);

  const isMountedRef = useRef(true);
  const drawTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (drawTimeoutRef.current) clearTimeout(drawTimeoutRef.current);
    };
  }, []);

  const cardScale = useSharedValue(1);
  const cardTranslateX = useSharedValue(0);
  const cardTranslateY = useSharedValue(0);
  const cardRotation = useSharedValue(0);

  const enabledCategories = useMemo(() => {
    return CATEGORIES.filter(cat => !disabledCategories.includes(cat.id)).map(cat => cat.id);
  }, [disabledCategories]);

  const getRandomCategory = useCallback((): CategoryInfo => {
    const available = CATEGORIES.filter(cat => !disabledCategories.includes(cat.id));
    if (available.length === 0) return CATEGORIES[0];
    return available[Math.floor(Math.random() * available.length)];
  }, [disabledCategories]);

  const getRandomCommand = useCallback((category: Category): { command: string; categoryInfo: CategoryInfo } => {
    let categoryInfo: CategoryInfo;
    let categoryKey: Category;

    if (category === 'Random') {
      categoryInfo = getRandomCategory();
      categoryKey = categoryInfo.id;
    } else {
      categoryInfo = CATEGORIES.find(c => c.id === category) || CATEGORIES[0];
      categoryKey = category;
    }

    const allCommands = COMMANDS[categoryKey] || [];
    const remainingCommands = allCommands.filter(cmd => !drawnCommands.includes(cmd));

    if (remainingCommands.length === 0) {
      return { command: 'All commands drawn! Press shuffle to reset.', categoryInfo };
    }

    return { command: remainingCommands[Math.floor(Math.random() * remainingCommands.length)], categoryInfo };
  }, [drawnCommands, getRandomCategory]);

  const drawCard = useCallback(() => {
    if (isDrawing) return;

    setIsDrawing(true);
    
    cardScale.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withSpring(1.1),
      withSpring(1)
    );
    
    cardRotation.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );

    if (soundEnabled) {
      triggerHaptic('medium');
    }

    if (drawTimeoutRef.current) clearTimeout(drawTimeoutRef.current);

    drawTimeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;

      const { command, categoryInfo } = getRandomCommand(selectedCategory);
      setCurrentCommand(command);
      setCurrentCategory(categoryInfo);
      
      if (!drawnCommands.includes(command) && command !== 'All commands drawn! Press shuffle to reset.') {
        setDrawnCommands(prev => [...prev, command]);
        addToHistory(command);
        checkAndUnlockAchievements();
      }

      if (soundEnabled) {
        triggerHaptic('success');
      }
      
      setIsDrawing(false);
    }, 300);
  }, [selectedCategory, isDrawing, drawnCommands, getRandomCommand, soundEnabled, addToHistory, checkAndUnlockAchievements, cardScale, cardRotation]);

  const handleReset = useCallback(() => {
    setDrawnCommands([]);
    setCurrentCommand('');
    setCurrentCategory(CATEGORIES[0]);
    if (soundEnabled) {
      triggerHaptic('light');
    }
  }, [soundEnabled]);

  const handleUndo = useCallback(() => {
    const lastCommand = history[0];
    if (lastCommand && drawnCommands.includes(lastCommand)) {
      setDrawnCommands(prev => prev.filter(cmd => cmd !== lastCommand));
      undoLastDraw();
      setCurrentCommand('');
      if (soundEnabled) {
        triggerHaptic('light');
      }
    }
  }, [history, drawnCommands, undoLastDraw, soundEnabled]);

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

  const handleShare = useCallback(() => {
    if (!currentCommand) return;
    shareCommand(currentCommand, currentCategory.name);
    if (soundEnabled) {
      triggerHaptic('light');
    }
  }, [currentCommand, currentCategory, soundEnabled]);

  const handleCategorySelect = useCallback((category: Category) => {
    setSelectedCategory(category);
    if (soundEnabled) {
      triggerHaptic('light');
    }
  }, [soundEnabled]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: cardScale.value },
      { translateX: cardTranslateX.value },
      { translateY: cardTranslateY.value },
      { rotate: `${cardRotation.value}deg` },
    ],
  }));

  const swipeGesture = useMemo(() => Gesture.Pan()
    .onUpdate((event) => {
      cardTranslateX.value = event.translationX;
      cardTranslateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > 100 || Math.abs(event.translationY) > 100) {
        runOnJS(drawCard)();
      }
      cardTranslateX.value = withSpring(0);
      cardTranslateY.value = withSpring(0);
    }), [drawCard]);

  const isFavorite = useMemo(() => currentCommand ? favorites.includes(currentCommand) : false, [currentCommand, favorites]);
  const canUndo = useMemo(() => history.length > 0 && drawnCommands.includes(history[0]), [history, drawnCommands]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Bedroom Commands
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {drawnCommands.length} cards drawn this session
          </Text>
        </View>

        <CategorySelector
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
          enabledCategories={enabledCategories}
        />

        <View style={styles.cardContainer}>
          <GestureDetector gesture={swipeGesture}>
            <Animated.View style={cardAnimatedStyle}>
              <CommandCard
                command={currentCommand}
                category={currentCategory}
                isFavorite={isFavorite}
                onFavoriteToggle={handleFavoriteToggle}
                onShare={handleShare}
                onTimerClick={(minutes) => {
                  setSelectedTimerMinutes(minutes);
                  setShowTimer(true);
                }}
                isDrawing={isDrawing}
              />
            </Animated.View>
          </GestureDetector>
        </View>

        <View style={styles.buttonContainer}>
          <ActionButton
            title="Draw Card"
            icon="zap"
            onPress={drawCard}
            disabled={isDrawing}
          />
          
          <View style={styles.buttonRow}>
            <ActionButton
              title="Timer"
              icon="clock"
              onPress={() => setShowTimer(true)}
              variant="secondary"
              style={styles.smallButton}
            />
            <ActionButton
              title="Shuffle"
              icon="shuffle"
              onPress={() => {
                setDrawnCommands([]);
                if (soundEnabled) triggerHaptic('light');
              }}
              variant="secondary"
              style={styles.smallButton}
            />
          </View>

          <View style={styles.buttonRow}>
            <ActionButton
              title="Undo"
              icon="corner-up-left"
              onPress={handleUndo}
              variant="outline"
              disabled={!canUndo}
              style={styles.smallButton}
            />
            <ActionButton
              title="Reset"
              icon="rotate-ccw"
              onPress={handleReset}
              variant="outline"
              style={styles.smallButton}
            />
          </View>
        </View>

        <Text style={[styles.hint, { color: theme.textSecondary }]}>
          Swipe the card to draw a new command
        </Text>
      </ScrollView>

      <Timer 
        visible={showTimer} 
        onClose={() => setShowTimer(false)}
        initialMinutes={selectedTimerMinutes}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 4 },
  cardContainer: { alignItems: 'center', paddingVertical: 32 },
  buttonContainer: { paddingHorizontal: 20, gap: 12 },
  buttonRow: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  smallButton: { flex: 1, minWidth: 120 },
  hint: { textAlign: 'center', marginTop: 24, fontSize: 14, fontStyle: 'italic' },
});
