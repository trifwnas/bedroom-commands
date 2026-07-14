import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { CategoryInfo } from '../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;
const CARD_HEIGHT = 260;

interface CommandCardProps {
  command: string;
  category: CategoryInfo;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  onShare: () => void;
  onTimerClick: (minutes: number) => void;
  isDrawing?: boolean;
}

export const CommandCard: React.FC<CommandCardProps> = React.memo(({
  command,
  category,
  isFavorite,
  onFavoriteToggle,
  onShare,
  onTimerClick,
  isDrawing = false,
}) => {
  const theme = useTheme();
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const handlePress = useCallback(() => {
    if (isDrawing) return;
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
    rotation.value = withSpring(rotation.value + 360, { damping: 15 });
  }, [isDrawing, scale, rotation]);

  const frontAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${rotation.value}deg` },
      { scale: scale.value },
    ],
    backfaceVisibility: 'hidden',
  }));

  if (!command) {
    return (
      <Pressable onPress={handlePress} style={[styles.cardContainer, { width: CARD_WIDTH, height: CARD_HEIGHT }]}>
        <LinearGradient
          colors={['#e0e0e0', '#c0c0c0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, { backgroundColor: theme.card }]}
        >
          <Feather name="help-circle" size={64} color={theme.textSecondary} />
          <Text style={[styles.tapText, { color: theme.textSecondary }]}>
            Tap to draw a card!
          </Text>
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={handlePress} style={[styles.cardContainer, { width: CARD_WIDTH, height: CARD_HEIGHT }]}>
      <Animated.View style={[styles.cardWrapper, frontAnimatedStyle]}>
        <LinearGradient
          colors={category.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, styles.cardFront]}
        >
          <Text style={styles.categoryEmoji}>{category.emoji}</Text>
          <Text style={styles.categoryLabel}>{category.name}</Text>
          <View style={styles.cardContent}>
            <Text style={styles.commandText} numberOfLines={4}>
              {command}
            </Text>
          </View>
          
          <View style={styles.timerPresets}>
            <Text style={styles.timerLabel}>Quick Timer:</Text>
            <View style={styles.timerButtons}>
              {[1, 3, 5, 10].map((mins) => (
                <Pressable 
                  key={mins}
                  onPress={() => onTimerClick(mins)}
                  style={styles.timerPresetButton}
                >
                  <Text style={styles.timerPresetText}>{mins}m</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.cardActions}>
            <Pressable onPress={onFavoriteToggle} style={styles.actionButton}>
              <Feather 
                name="heart" 
                size={24} 
                color="#fff" 
                style={isFavorite ? styles.heartFilled : undefined}
              />
            </Pressable>
            <Pressable onPress={onShare} style={styles.actionButton}>
              <Feather name="share" size={24} color="#fff" />
            </Pressable>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
});

CommandCard.displayName = 'CommandCard';

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardWrapper: {
    width: '100%',
    height: '100%',
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFront: {
    backgroundColor: '#ff595e',
  },
  categoryEmoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  commandText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 30,
  },
  timerPresets: {
    alignItems: 'center',
    marginVertical: 8,
  },
  timerLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 6,
  },
  timerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  timerPresetButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timerPresetText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  heartFilled: {
    opacity: 1,
  },
  tapText: {
    fontSize: 18,
    marginTop: 16,
    fontWeight: '500',
  },
});
