import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  Pressable,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/store/useAppStore';
import { COMMANDS } from '../../src/data/commands';
import { CATEGORIES } from '../../src/types';
import { shareCommand, triggerHaptic } from '../../src/utils/helpers';
import { Category } from '../../src/types';

export default function SearchScreen() {
  const theme = useTheme();
  const favorites = useAppStore(state => state.favorites);
  const addFavorite = useAppStore(state => state.addFavorite);
  const removeFavorite = useAppStore(state => state.removeFavorite);
  const soundEnabled = useAppStore(state => state.soundEnabled);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');

  const allCommands = useMemo(() => {
    const commands: Array<{ text: string; category: Category }> = [];
    
    (Object.keys(COMMANDS) as Category[]).forEach(category => {
      COMMANDS[category].forEach(cmd => {
        commands.push({ text: cmd, category });
      });
    });

    return commands;
  }, []);

  const filteredCommands = useMemo(() => {
    let filtered = allCommands;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(cmd => cmd.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(cmd => 
        cmd.text.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allCommands, selectedCategory, searchQuery]);

  const handleToggleFavorite = useCallback((command: string) => {
    if (favorites.includes(command)) {
      removeFavorite(command);
    } else {
      addFavorite(command);
    }
    if (soundEnabled) {
      triggerHaptic('light');
    }
  }, [favorites, addFavorite, removeFavorite, soundEnabled]);

  const handleShare = useCallback((command: string, category: string) => {
    shareCommand(command, category);
  }, []);

  const getCategoryInfo = useCallback((categoryId: string) => {
    return CATEGORIES.find(c => c.id === categoryId);
  }, []);

  const renderItem = ({ item }: { item: { text: string; category: Category } }) => {
    const category = getCategoryInfo(item.category);
    const isFavorite = favorites.includes(item.text);

    return (
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {category && (
          <View style={[styles.categoryBadge, { backgroundColor: category.color }]}>
            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
            <Text style={styles.categoryText}>{category.name}</Text>
          </View>
        )}
        <Text style={[styles.commandText, { color: theme.text }]}>{item.text}</Text>
        <View style={styles.actions}>
          <Pressable 
            onPress={() => handleShare(item.text, item.category)}
            style={[styles.actionButton, { backgroundColor: theme.surface }]}
          >
            <Feather name="share" size={20} color={theme.text} />
          </Pressable>
          <Pressable 
            onPress={() => handleToggleFavorite(item.text)}
            style={[styles.actionButton, { backgroundColor: theme.surface }]}
          >
            <Feather 
              name="heart" 
              size={20} 
              color={isFavorite ? theme.primary : theme.textSecondary}
              style={isFavorite ? { opacity: 1 } : { opacity: 0.5 }}
            />
          </Pressable>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="search" size={64} color={theme.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        No commands found
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Try adjusting your search or filters
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.searchContainer}>
        <View style={[styles.searchInput, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Feather name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchText, { color: theme.text }]}
            placeholder="Search commands..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Feather name="x" size={20} color={theme.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={['All', ...CATEGORIES.map(c => c.id)]}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedCategory(item as Category | 'All')}
              style={[
                styles.filterChip,
                { 
                  backgroundColor: selectedCategory === item ? theme.primary : theme.surface,
                  borderColor: theme.border,
                }
              ]}
            >
              <Text style={[
                styles.filterText,
                { color: selectedCategory === item ? '#fff' : theme.text }
              ]}>
                {item === 'All' ? '🎲 All' : CATEGORIES.find(c => c.id === item)?.emoji + ' ' + item}
              </Text>
            </Pressable>
          )}
        />
      </View>

      <FlatList
        data={filteredCommands}
        keyExtractor={(item) => item.text}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          filteredCommands.length === 0 && styles.emptyList,
        ]}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  searchText: {
    flex: 1,
    fontSize: 16,
  },
  filterContainer: {
    paddingVertical: 12,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  categoryEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  commandText: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    padding: 10,
    borderRadius: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});
