import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Pressable, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/store/useAppStore';
import { CATEGORIES } from '../../src/types';
import { COMMAND_TO_CATEGORY } from '../../src/data/commands';
import { shareCommand, triggerHaptic } from '../../src/utils/helpers';

const FavoriteItem = React.memo(({ item, theme, onRemove, onShare }: { item: string; theme: any; onRemove: (cmd: string) => void; onShare: (cmd: string) => void }) => {
  const category = COMMAND_TO_CATEGORY.get(item) || null;
  
  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {category && (
        <View style={[styles.categoryBadge, { backgroundColor: category.color }]}>
          <Text style={styles.categoryEmoji}>{category.emoji}</Text>
          <Text style={styles.categoryText}>{category.name}</Text>
        </View>
      )}
      <Text style={[styles.commandText, { color: theme.text }]}>{item}</Text>
      <View style={styles.actions}>
        <Pressable onPress={() => onShare(item)} style={[styles.actionButton, { backgroundColor: theme.surface }]}>
          <Feather name="share" size={20} color={theme.text} />
        </Pressable>
        <Pressable onPress={() => onRemove(item)} style={[styles.actionButton, { backgroundColor: theme.surface }]}>
          <Feather name="trash-2" size={20} color={theme.error} />
        </Pressable>
      </View>
    </View>
  );
});

export default function FavoritesScreen() {
  const theme = useTheme();
  const favorites = useAppStore(state => state.favorites);
  const removeFavorite = useAppStore(state => state.removeFavorite);
  const soundEnabled = useAppStore(state => state.soundEnabled);

  const handleRemove = useCallback((command: string) => {
    Alert.alert(
      'Remove from Favorites',
      'Are you sure you want to remove this command from favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            removeFavorite(command);
            if (soundEnabled) triggerHaptic('light');
          }
        },
      ]
    );
  }, [removeFavorite, soundEnabled]);

  const handleShare = useCallback((command: string) => {
    const category = COMMAND_TO_CATEGORY.get(command);
    shareCommand(command, category?.name || 'Unknown');
  }, []);

  const renderItem = useCallback(({ item }: { item: string }) => (
    <FavoriteItem item={item} theme={theme} onRemove={handleRemove} onShare={handleShare} />
  ), [theme, handleRemove, handleShare]);

  const renderEmpty = useMemo(() => () => (
    <View style={styles.emptyContainer}>
      <Feather name="heart" size={64} color={theme.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>No favorites yet</Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Tap the heart icon on any command to save it here</Text>
    </View>
  ), [theme]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty()}
        contentContainerStyle={[styles.listContent, favorites.length === 0 && styles.emptyList]}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 100 },
  emptyList: { flex: 1, justifyContent: 'center' },
  card: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 10 },
  categoryEmoji: { fontSize: 14, marginRight: 4 },
  categoryText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  commandText: { fontSize: 16, fontWeight: '500', lineHeight: 24, marginBottom: 12 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  actionButton: { padding: 10, borderRadius: 10 },
  emptyContainer: { alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '600', marginTop: 16 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
});
