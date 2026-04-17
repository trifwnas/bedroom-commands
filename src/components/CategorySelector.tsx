import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Category, CATEGORIES } from '../types';
import { useTheme } from '../hooks/useTheme';

interface CategorySelectorProps {
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
  enabledCategories: Category[];
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory,
  enabledCategories,
}) => {
  const theme = useTheme();

  const getFilteredCategories = (): typeof CATEGORIES => {
    if (enabledCategories.length === 0) return CATEGORIES;
    return CATEGORIES.filter(cat => enabledCategories.includes(cat.id));
  };

  const categories = getFilteredCategories();

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <Pressable
        onPress={() => onSelectCategory('Random' as Category)}
        style={[
          styles.chip,
          {
            backgroundColor: selectedCategory === 'Random' ? theme.primary : theme.surface,
            borderColor: theme.primary,
          },
          selectedCategory !== 'Random' && { borderWidth: 2 },
        ]}
      >
        <Text style={[
          styles.chipText,
          { color: selectedCategory === 'Random' ? '#fff' : theme.text },
        ]}>
          🎲 Random
        </Text>
      </Pressable>

      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        return (
          <Pressable
            key={cat.id}
            onPress={() => onSelectCategory(cat.id)}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected ? cat.color : theme.surface,
                borderColor: cat.color,
              },
              !isSelected && { borderWidth: 2 },
            ]}
          >
            <Text style={[
              styles.chipText,
              { color: isSelected ? '#fff' : theme.text },
            ]}>
              {cat.emoji} {cat.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
