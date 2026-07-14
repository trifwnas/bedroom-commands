import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/store/useAppStore';
import { ACHIEVEMENTS, getAchievementProgress } from '../../src/data/achievements';
import { triggerHaptic } from '../../src/utils/helpers';

export default function AchievementsScreen() {
  const theme = useTheme();
  const statistics = useAppStore(state => state.statistics);
  const unlockedAchievements = useAppStore(state => state.unlockedAchievements);
  const newAchievements = useAppStore(state => state.newAchievements);
  const clearNewAchievements = useAppStore(state => state.clearNewAchievements);
  const soundEnabled = useAppStore(state => state.soundEnabled);

  const unlockedIds = useMemo(
    () => unlockedAchievements.map(a => a.achievementId),
    [unlockedAchievements]
  );

  useEffect(() => {
    if (newAchievements.length > 0 && soundEnabled) {
      triggerHaptic('success');
      const timer = setTimeout(() => {
        clearNewAchievements();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [newAchievements, soundEnabled, clearNewAchievements]);

  const renderAchievement = (achievement: typeof ACHIEVEMENTS[0]) => {
    const isUnlocked = unlockedIds.includes(achievement.id);
    const progress = getAchievementProgress(achievement, statistics);
    const percent = Math.min((progress / achievement.requirement) * 100, 100);

    return (
      <View 
        key={achievement.id} 
        style={[
          styles.achievementCard, 
          { backgroundColor: theme.card, borderColor: theme.border },
          isUnlocked && styles.unlockedCard,
        ]}
      >
        <View style={[
          styles.achievementIcon,
          isUnlocked ? styles.iconUnlocked : styles.iconLocked,
        ]}>
          <Text style={styles.iconText}>{achievement.icon}</Text>
        </View>
        
        <View style={styles.achievementInfo}>
          <Text style={[
            styles.achievementTitle, 
            { color: isUnlocked ? theme.text : theme.textSecondary }
          ]}>
            {achievement.title}
          </Text>
          <Text style={[styles.achievementDesc, { color: theme.textSecondary }]}>
            {achievement.description}
          </Text>
          
          {!isUnlocked && (
            <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${percent}%`, backgroundColor: theme.primary }
                ]} 
              />
            </View>
          )}
          
          {!isUnlocked && (
            <Text style={[styles.progressText, { color: theme.textSecondary }]}>
              {progress} / {achievement.requirement}
            </Text>
          )}
        </View>

        {isUnlocked && (
          <Feather name="check-circle" size={24} color={theme.success} />
        )}
      </View>
    );
  };

  const renderNewAchievementModal = () => {
    if (newAchievements.length === 0) return null;

    const achievement = ACHIEVEMENTS.find(a => a.id === newAchievements[0]?.achievementId);
    if (!achievement) return null;

    return (
      <Modal visible transparent animationType="fade">
        <Animated.View 
          entering={FadeIn} 
          exiting={FadeOut}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={styles.modalTitle}>🏆 Achievement Unlocked!</Text>
            
            <View style={[styles.modalAchievement, { backgroundColor: theme.primary + '20' }]}>
              <Text style={styles.modalIcon}>{achievement.icon}</Text>
              <Text style={[styles.modalAchievementTitle, { color: theme.text }]}>
                {achievement.title}
              </Text>
              <Text style={[styles.modalAchievementDesc, { color: theme.textSecondary }]}>
                {achievement.description}
              </Text>
            </View>

            <Pressable 
              onPress={clearNewAchievements}
              style={[styles.modalButton, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.modalButtonText}>Awesome!</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Modal>
    );
  };

  const totalUnlocked = unlockedIds.length;
  const totalAchievements = ACHIEVEMENTS.length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.header, { backgroundColor: theme.card }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Achievements
          </Text>
          <Text style={[styles.headerProgress, { color: theme.textSecondary }]}>
            {totalUnlocked} / {totalAchievements} unlocked
          </Text>
          <View style={[styles.headerProgressBar, { backgroundColor: theme.border }]}>
            <View 
              style={[
                styles.headerProgressFill, 
                { width: `${(totalUnlocked / totalAchievements) * 100}%`, backgroundColor: theme.primary }
              ]} 
            />
          </View>
        </View>

        <View style={styles.section}>
          {ACHIEVEMENTS.map(renderAchievement)}
        </View>
      </ScrollView>

      {renderNewAchievementModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerProgress: {
    fontSize: 14,
    marginBottom: 12,
  },
  headerProgressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  headerProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  section: {
    gap: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  unlockedCard: {
    borderColor: '#6bcb77',
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconUnlocked: {
    backgroundColor: '#fff3cd',
  },
  iconLocked: {
    backgroundColor: '#f0f0f0',
    opacity: 0.5,
  },
  iconText: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  achievementDesc: {
    fontSize: 13,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  modalAchievement: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  modalIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  modalAchievementTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalAchievementDesc: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalButton: {
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
