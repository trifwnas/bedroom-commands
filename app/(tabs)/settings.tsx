import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Switch,
  Pressable,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/store/useAppStore';
import { Category, CATEGORIES, ThemeMode } from '../../src/types';
import { triggerHaptic } from '../../src/utils/helpers';

export default function SettingsScreen() {
  const theme = useTheme();
  const customCommands = useAppStore(state => state.customCommands);
  const addCustomCommand = useAppStore(state => state.addCustomCommand);
  const removeCustomCommand = useAppStore(state => state.removeCustomCommand);
  const disabledCategories = useAppStore(state => state.disabledCategories);
  const toggleCategory = useAppStore(state => state.toggleCategory);
  const themeMode = useAppStore(state => state.themeMode);
  const setThemeMode = useAppStore(state => state.setThemeMode);
  const soundEnabled = useAppStore(state => state.soundEnabled);
  const setSoundEnabled = useAppStore(state => state.setSoundEnabled);
  const exportData = useAppStore(state => state.exportData);
  const importData = useAppStore(state => state.importData);
  const clearAllData = useAppStore(state => state.clearAllData);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>('Romantic');
  const [newCommand, setNewCommand] = useState('');

  const handleThemeChange = useCallback((mode: ThemeMode) => {
    setThemeMode(mode);
    triggerHaptic('light');
  }, [setThemeMode]);

  const handleSoundToggle = useCallback((value: boolean) => {
    setSoundEnabled(value);
    if (value) {
      triggerHaptic('light');
    }
  }, [setSoundEnabled]);

  const handleCategoryToggle = useCallback((category: Category) => {
    toggleCategory(category);
    triggerHaptic('light');
  }, [toggleCategory]);

  const handleAddCommand = useCallback(() => {
    if (!newCommand.trim()) {
      Alert.alert('Error', 'Please enter a command');
      return;
    }
    
    addCustomCommand(selectedCategory, newCommand.trim());
    setNewCommand('');
    setShowAddModal(false);
    triggerHaptic('success');
  }, [newCommand, selectedCategory, addCustomCommand]);

  const handleRemoveCustomCommand = useCallback((category: Category, command: string) => {
    Alert.alert(
      'Remove Command',
      'Are you sure you want to remove this custom command?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            removeCustomCommand(category, command);
            triggerHaptic('light');
          }
        },
      ]
    );
  }, [removeCustomCommand]);

  const openAddModal = useCallback((category: Category) => {
    setSelectedCategory(category);
    setShowAddModal(true);
  }, []);

  const renderThemeSelector = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {(['system', 'light', 'dark'] as ThemeMode[]).map((mode) => (
          <Pressable
            key={mode}
            onPress={() => handleThemeChange(mode)}
            style={[
              styles.optionRow,
              themeMode === mode && { backgroundColor: theme.primary + '20' },
            ]}
          >
            <View style={styles.optionContent}>
              <Feather 
                name={mode === 'system' ? 'smartphone' : mode === 'light' ? 'sun' : 'moon'} 
                size={20} 
                color={themeMode === mode ? theme.primary : theme.text} 
              />
              <Text style={[styles.optionText, { color: theme.text }]}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </View>
            {themeMode === mode && (
              <Feather name="check" size={20} color={theme.primary} />
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );

  const renderSoundToggle = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Sound & Haptics</Text>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.switchRow}>
          <View style={styles.switchContent}>
            <Feather name="volume-2" size={20} color={theme.text} />
            <Text style={[styles.optionText, { color: theme.text }]}>Sound Effects</Text>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={handleSoundToggle}
            trackColor={{ false: theme.border, true: theme.primary + '80' }}
            thumbColor={soundEnabled ? theme.primary : '#f4f3f4'}
          />
        </View>
      </View>
    </View>
  );

  const handleExport = useCallback(async () => {
    try {
      const data = exportData();
      const jsonString = JSON.stringify(data, null, 2);
      await Clipboard.setStringAsync(jsonString);
      Alert.alert('Exported!', 'Data copied to clipboard. Paste it to save or share.');
      if (soundEnabled) triggerHaptic('success');
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  }, [exportData, soundEnabled]);

  const handleImport = useCallback(async () => {
    Alert.prompt(
      'Import Data',
      'Paste your exported data here:',
      async (text) => {
        if (!text) return;
        try {
          const data = JSON.parse(text);
          const success = importData(data);
          if (success) {
            Alert.alert('Success!', 'Data imported successfully.');
            if (soundEnabled) triggerHaptic('success');
          } else {
            Alert.alert('Error', 'Invalid data format');
          }
        } catch (error) {
          Alert.alert('Error', 'Failed to parse data. Make sure it\'s valid JSON.');
        }
      },
      'plain-text'
    );
  }, [importData, soundEnabled]);

  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your favorites, history, custom commands, and statistics. This cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => {
            clearAllData();
            if (soundEnabled) triggerHaptic('warning');
          }
        },
      ]
    );
  }, [clearAllData, soundEnabled]);

  const renderDataManagement = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Data Management</Text>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Pressable onPress={handleExport} style={styles.dataRow}>
          <View style={styles.switchContent}>
            <Feather name="download" size={20} color={theme.text} />
            <Text style={[styles.optionText, { color: theme.text }]}>Export Data</Text>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>
        
        <Pressable onPress={handleImport} style={styles.dataRow}>
          <View style={styles.switchContent}>
            <Feather name="upload" size={20} color={theme.text} />
            <Text style={[styles.optionText, { color: theme.text }]}>Import Data</Text>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>
        
        <Pressable onPress={handleClearAll} style={styles.dataRow}>
          <View style={styles.switchContent}>
            <Feather name="trash-2" size={20} color={theme.error} />
            <Text style={[styles.optionText, { color: theme.error }]}>Clear All Data</Text>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>
      </View>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Categories</Text>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => handleCategoryToggle(cat.id)}
            style={[
              styles.optionRow,
              disabledCategories.includes(cat.id) && styles.disabledRow,
            ]}
          >
            <View style={styles.optionContent}>
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text style={[
                styles.optionText, 
                { color: disabledCategories.includes(cat.id) ? theme.textSecondary : theme.text }
              ]}>
                {cat.name}
              </Text>
            </View>
            <Switch
              value={!disabledCategories.includes(cat.id)}
              onValueChange={() => handleCategoryToggle(cat.id)}
              trackColor={{ false: theme.border, true: cat.color + '80' }}
              thumbColor={disabledCategories.includes(cat.id) ? '#f4f3f4' : cat.color}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );

  const renderCustomCommands = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Custom Commands</Text>
      {CATEGORIES.map((cat) => (
        <View key={cat.id} style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <View style={styles.categoryTitleRow}>
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text style={[styles.categoryTitle, { color: theme.text }]}>{cat.name}</Text>
            </View>
            <Pressable 
              onPress={() => openAddModal(cat.id)}
              style={[styles.addButton, { backgroundColor: cat.color }]}
            >
              <Feather name="plus" size={16} color="#fff" />
            </Pressable>
          </View>
          
          {customCommands[cat.id]?.length > 0 && (
            <View style={[styles.customCommandsList, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              {customCommands[cat.id].map((cmd, idx) => (
                <View key={idx} style={[styles.customCommandRow, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.customCommandText, { color: theme.text }]} numberOfLines={2}>
                    {cmd}
                  </Text>
                  <Pressable 
                    onPress={() => handleRemoveCustomCommand(cat.id, cmd)}
                    hitSlop={8}
                  >
                    <Feather name="x" size={18} color={theme.error} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
          
          {(!customCommands[cat.id] || customCommands[cat.id].length === 0) && (
            <Text style={[styles.noCustomText, { color: theme.textSecondary }]}>
              No custom commands
            </Text>
          )}
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderThemeSelector()}
        {renderSoundToggle()}
        {renderCategories()}
        {renderDataManagement()}
        {renderCustomCommands()}
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Add Custom Command
            </Text>
            <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
              {CATEGORIES.find(c => c.id === selectedCategory)?.emoji} {selectedCategory}
            </Text>
            
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: theme.background, 
                  color: theme.text,
                  borderColor: theme.border,
                }
              ]}
              placeholder="Enter your command..."
              placeholderTextColor={theme.textSecondary}
              value={newCommand}
              onChangeText={setNewCommand}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalButtons}>
              <Pressable 
                onPress={() => setShowAddModal(false)}
                style={[styles.modalButton, { borderColor: theme.border }]}
              >
                <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancel</Text>
              </Pressable>
              <Pressable 
                onPress={handleAddCommand}
                style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: theme.primary }]}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  disabledRow: {
    opacity: 0.6,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    fontSize: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  switchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customCommandsList: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  customCommandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
  },
  customCommandText: {
    flex: 1,
    fontSize: 14,
    marginRight: 8,
  },
  noCustomText: {
    fontSize: 13,
    fontStyle: 'italic',
    marginLeft: 28,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modalButtonPrimary: {
    borderWidth: 0,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
