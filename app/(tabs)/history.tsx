import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Pressable, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/store/useAppStore';
import { COMMAND_TO_CATEGORY } from '../../src/data/commands';
import { shareCommand, triggerHaptic, formatDate } from '../../src/utils/helpers';

const HistoryItem = React.memo(({ item, index, theme, onShare }: { item: string; index: number; theme: any; onShare: (cmd: string) => void }) => {
  const category = COMMAND_TO_CATEGORY.get(item) || null;
  const date = new Date();
  date.setMinutes(date.getMinutes() - index);
  
  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {category && (
        <View style={[styles.categoryBadge, { backgroundColor: category.color }]}>
          <Text style={styles.categoryEmoji}>{category.emoji}</Text>
          <Text style={styles.categoryText}>{category.name}</Text>
        </View>
      )}
      <Text style={[styles.commandText, { color: theme.text }]}>{item}</Text>
      <View style={styles.footer}>
        <Text style={[styles.timestamp, { color: theme.textSecondary }]}>{formatDate(date)}</Text>
        <Pressable onPress={() => onShare(item)} style={[styles.actionButton, { backgroundColor: theme.surface }]}>
          <Feather name="share" size={18} color={theme.text} />
        </Pressable>
      </View>
    </View>
  );
});

export default function HistoryScreen() {
  const theme = useTheme();
  const history = useAppStore(state => state.history);
  const clearHistory = useAppStore(state => state.clearHistory);
  const soundEnabled = useAppStore(state => state.soundEnabled);

  const handleClear = useCallback(() => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all draw history?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => { clearHistory(); if (soundEnabled) triggerHaptic('warning'); } },
      ]
    );
  }, [clearHistory, soundEnabled]);

  const handleShare = useCallback((command: string) => {
    const category = COMMAND_TO_CATEGORY.get(command);
    shareCommand(command, category?.name || 'Unknown');
  }, []);

  const renderItem = useCallback(({ item, index }: { item: string; index: number }) => (
    <HistoryItem item={item} index={index} theme={theme} onShare={handleShare} />
  ), [theme, handleShare]);

  const renderEmpty = useMemo(() => () => (
    <View style={styles.emptyContainer}>
      <Feather name="clock" size={64} color={theme.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>No history yet</Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Start drawing cards and your history will appear here</Text>
    </View>
  ), [theme]);

  const renderHeader = useMemo(() => {
    if (history.length === 0) return null;
    return (
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: theme.textSecondary }]}>{history.length} commands drawn</Text>
        <Pressable onPress={handleClear}><Text style={[styles.clearButton, { color: theme.error }]}>Clear All</Text></Pressable>
      </View>
    );
  }, [history.length, theme, handleClear]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={history}
        keyExtractor={(item) => item}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty()}
        contentContainerStyle={[styles.listContent, history.length === 0 && styles.emptyList]}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 100 },
  emptyList: { flex: 1, justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerText: { fontSize: 14 },
  clearButton: { fontSize: 14, fontWeight: '600' },
  card: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 10 },
  categoryEmoji: { fontSize: 14, marginRight: 4 },
  categoryText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  commandText: { fontSize: 16, fontWeight: '500', lineHeight: 24, marginBottom: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timestamp: { fontSize: 12 },
  actionButton: { padding: 8, borderRadius: 8 },
  emptyContainer: { alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '600', marginTop: 16 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
});
