import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/store/useAppStore';
import { CATEGORIES } from '../../src/types';
import { triggerHaptic, shareCommand } from '../../src/utils/helpers';
import { Timer } from '../../src/components/Timer';

export default function DailyScreen() {
  const theme = useTheme();
  const dailyChallenge = useAppStore(state => state.dailyChallenge);
  const generateDailyChallenge = useAppStore(state => state.generateDailyChallenge);
  const completeDailyChallenge = useAppStore(state => state.completeDailyChallenge);
  const addToHistory = useAppStore(state => state.addToHistory);
  const favorites = useAppStore(state => state.favorites);
  const addFavorite = useAppStore(state => state.addFavorite);
  const removeFavorite = useAppStore(state => state.removeFavorite);
  const soundEnabled = useAppStore(state => state.soundEnabled);
  const completedChallenges = useAppStore(state => state.statistics.completedChallenges);

  const [showTimer, setShowTimer] = useState(false);
  const cardScale = useSharedValue(1);

  useEffect(() => {
    generateDailyChallenge();
  }, []);

  const category = useMemo(() => dailyChallenge ? CATEGORIES.find(c => c.id === dailyChallenge.category) : null, [dailyChallenge]);
  const isFavorite = useMemo(() => dailyChallenge ? favorites.includes(dailyChallenge.command) : false, [dailyChallenge, favorites]);

  const handleComplete = useCallback(() => {
    cardScale.value = withSequence(
      withTiming(1.1, { duration: 200 }),
      withSpring(1)
    );
    
    if (dailyChallenge && !dailyChallenge.completed) {
      completeDailyChallenge();
    }
    
    if (soundEnabled) triggerHaptic('success');
  }, [dailyChallenge, completeDailyChallenge, soundEnabled]);

  const handleShare = useCallback(() => {
    if (dailyChallenge) {
      shareCommand(dailyChallenge.command, dailyChallenge.category);
    }
  }, [dailyChallenge]);

  const handleFavorite = useCallback(() => {
    if (!dailyChallenge) return;
    
    if (favorites.includes(dailyChallenge.command)) {
      removeFavorite(dailyChallenge.command);
    } else {
      addFavorite(dailyChallenge.command);
    }
    
    if (soundEnabled) triggerHaptic('light');
  }, [dailyChallenge, favorites, addFavorite, removeFavorite, soundEnabled]);

  const handleAddToHistory = useCallback(() => {
    if (dailyChallenge) {
      addToHistory(dailyChallenge.command);
      if (soundEnabled) triggerHaptic('light');
    }
  }, [dailyChallenge, addToHistory, soundEnabled]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const getGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  if (!dailyChallenge) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading daily challenge...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.greeting, { color: theme.textSecondary }]}>{getGreeting}</Text>
        <Text style={[styles.title, { color: theme.text }]}>Today's Challenge</Text>

        <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
          {category && (
            <LinearGradient
              colors={category.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              {dailyChallenge.completed && (
                <View style={styles.completedBadge}>
                  <Feather name="check-circle" size={20} color="#fff" />
                  <Text style={styles.completedText}>Completed!</Text>
                </View>
              )}
              
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text style={styles.categoryLabel}>{category.name}</Text>
              
              <View style={styles.cardContent}>
                <Text style={styles.commandText}>{dailyChallenge.command}</Text>
              </View>

              <View style={styles.cardActions}>
                <Pressable onPress={handleFavorite} style={styles.actionButton}>
                  <Feather name="heart" size={24} color={isFavorite ? '#fff' : 'rgba(255,255,255,0.7)'} />
                </Pressable>
                <Pressable onPress={handleShare} style={styles.actionButton}>
                  <Feather name="share" size={24} color="#fff" />
                </Pressable>
              </View>
            </LinearGradient>
          )}
        </Animated.View>

        {!dailyChallenge.completed && (
          <Pressable onPress={handleComplete} style={[styles.completeButton, { backgroundColor: theme.success }]}>
            <Feather name="check" size={24} color="#fff" />
            <Text style={styles.completeButtonText}>Mark as Complete</Text>
          </Pressable>
        )}

        <View style={styles.actionsRow}>
          <Pressable onPress={() => setShowTimer(true)} style={[styles.secondaryButton, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Feather name="clock" size={20} color={theme.text} />
            <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Start Timer</Text>
          </Pressable>

          <Pressable onPress={handleAddToHistory} style={[styles.secondaryButton, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Feather name="plus-circle" size={20} color={theme.text} />
            <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Add to History</Text>
          </Pressable>
        </View>

        <View style={[styles.streakCard, { backgroundColor: theme.card }]}>
          <View style={styles.streakContent}>
            <Feather name="calendar" size={24} color={theme.primary} />
            <View style={styles.streakInfo}>
              <Text style={[styles.streakValue, { color: theme.text }]}>{completedChallenges}</Text>
              <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>Challenges Completed</Text>
            </View>
          </View>
        </View>
      </View>

      <Timer visible={showTimer} onClose={() => setShowTimer(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16 },
  greeting: { fontSize: 16, marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 24 },
  cardContainer: { marginBottom: 24 },
  card: { borderRadius: 24, padding: 32, alignItems: 'center', minHeight: 280 },
  completedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, position: 'absolute', top: 16, right: 16, gap: 6 },
  completedText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  categoryEmoji: { fontSize: 48, marginBottom: 8 },
  categoryLabel: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 },
  cardContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  commandText: { fontSize: 22, fontWeight: '700', color: '#fff', textAlign: 'center', lineHeight: 32 },
  cardActions: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 16 },
  actionButton: { padding: 12, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)' },
  completeButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, gap: 10, marginBottom: 16 },
  completeButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  secondaryButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 8, borderWidth: 1 },
  secondaryButtonText: { fontSize: 14, fontWeight: '600' },
  streakCard: { borderRadius: 16, padding: 16 },
  streakContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  streakInfo: { flex: 1 },
  streakValue: { fontSize: 28, fontWeight: '700' },
  streakLabel: { fontSize: 14 },
});
