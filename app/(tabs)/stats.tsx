import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/store/useAppStore';
import { CATEGORIES } from '../../src/types';

export default function StatsScreen() {
  const theme = useTheme();
  const statistics = useAppStore(state => state.statistics);
  const favorites = useAppStore(state => state.favorites);
  const history = useAppStore(state => state.history);

  const totalCommands = Object.values(statistics.categoryDraws).reduce((a, b) => a + b, 0);

  const getCategoryPercentage = (category: keyof typeof statistics.categoryDraws) => {
    if (totalCommands === 0) return 0;
    return Math.round((statistics.categoryDraws[category] / totalCommands) * 100);
  };

  const getMostDrawnCategory = () => {
    let max = 0;
    let category = 'Romantic';
    Object.entries(statistics.categoryDraws).forEach(([cat, count]) => {
      if (count > max) {
        max = count;
        category = cat;
      }
    });
    return { category, count: max };
  };

  const mostDrawn = getMostDrawnCategory();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Your Statistics</Text>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <LinearGradient
              colors={['#ff595e', '#ff4047']}
              style={styles.statIcon}
            >
              <Feather name="zap" size={24} color="#fff" />
            </LinearGradient>
            <Text style={[styles.statValue, { color: theme.text }]}>{statistics.totalDraws}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Cards Drawn</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <LinearGradient
              colors={['#ff6b6b', '#ee5a5a']}
              style={styles.statIcon}
            >
              <Feather name="heart" size={24} color="#fff" />
            </LinearGradient>
            <Text style={[styles.statValue, { color: theme.text }]}>{favorites.length}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Favorites</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <LinearGradient
              colors={['#6bcb77', '#56b368']}
              style={styles.statIcon}
            >
              <Feather name="award" size={24} color="#fff" />
            </LinearGradient>
            <Text style={[styles.statValue, { color: theme.text }]}>{statistics.completedChallenges}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Challenges</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <LinearGradient
              colors={['#ffd93d', '#f4c430']}
              style={styles.statIcon}
            >
              <Feather name="calendar" size={24} color="#fff" />
            </LinearGradient>
            <Text style={[styles.statValue, { color: theme.text }]}>{statistics.streak}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Day Streak</Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Category Breakdown
          </Text>
          
          {CATEGORIES.map((cat) => {
            const percentage = getCategoryPercentage(cat.id);
            return (
              <View key={cat.id} style={styles.categoryRow}>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text style={[styles.categoryName, { color: theme.text }]}>{cat.name}</Text>
                  <Text style={[styles.categoryCount, { color: theme.textSecondary }]}>
                    {statistics.categoryDraws[cat.id] || 0}
                  </Text>
                </View>
                <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${percentage}%`, backgroundColor: cat.color },
                    ]}
                  />
                </View>
                <Text style={[styles.percentage, { color: theme.textSecondary }]}>{percentage}%</Text>
              </View>
            );
          })}
        </View>

        {mostDrawn.count > 0 && (
          <View style={[styles.highlightCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.highlightLabel, { color: theme.textSecondary }]}>
              Most Played Category
            </Text>
            <View style={styles.highlightContent}>
              <Text style={styles.highlightEmoji}>
                {CATEGORIES.find(c => c.id === mostDrawn.category)?.emoji}
              </Text>
              <Text style={[styles.highlightText, { color: theme.text }]}>
                {mostDrawn.category}
              </Text>
            </View>
            <Text style={[styles.highlightSubtext, { color: theme.textSecondary }]}>
              {mostDrawn.count} cards drawn
            </Text>
          </View>
        )}

        <View style={[styles.quoteCard, { backgroundColor: theme.primary + '15' }]}>
          <Feather name="message-circle" size={24} color={theme.primary} />
          <Text style={[styles.quoteText, { color: theme.text }]}>
            "{history[0] || 'Start drawing cards to see your activity!'}"
          </Text>
          {history.length > 0 && (
            <Text style={[styles.quoteLabel, { color: theme.textSecondary }]}>
              Latest card
            </Text>
          )}
        </View>
      </ScrollView>
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
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
  },
  categoryEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  categoryCount: {
    fontSize: 12,
    marginLeft: 4,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentage: {
    fontSize: 12,
    width: 35,
    textAlign: 'right',
  },
  highlightCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  highlightLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  highlightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  highlightEmoji: {
    fontSize: 32,
  },
  highlightText: {
    fontSize: 24,
    fontWeight: '700',
  },
  highlightSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  quoteCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  quoteLabel: {
    fontSize: 12,
    marginTop: 8,
  },
});
