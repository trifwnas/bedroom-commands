import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TextInput, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { triggerHaptic } from '../utils/helpers';

interface TimerProps {
  visible: boolean;
  onClose: () => void;
  initialMinutes?: number;
}

const PRESET_TIMES = [
  { label: '1 min', value: 1 },
  { label: '3 min', value: 3 },
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
];

export const Timer: React.FC<TimerProps> = ({ visible, onClose, initialMinutes = 5 }) => {
  const theme = useTheme();
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [customTime, setCustomTime] = useState('');
  
  const pulseAnim = useSharedValue(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      setMinutes(initialMinutes);
      setSeconds(0);
      setIsRunning(false);
      setIsPaused(false);
    }
  }, [visible, initialMinutes]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        false
      );

      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s === 0) {
            setMinutes(m => {
              if (m === 0) {
                setTimeout(() => handleStop(), 0);
                return 0;
              }
              return m - 1;
            });
            return 59;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      pulseAnim.value = 1;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, handleStop]);

  const handleStart = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
    triggerHaptic('light');
  }, []);

  const handlePause = useCallback(() => {
    setIsPaused(true);
    triggerHaptic('light');
  }, []);

  const handleResume = useCallback(() => {
    setIsPaused(false);
    triggerHaptic('light');
  }, []);

  const handleStop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Show completion alert
    Alert.alert(
      '⏱️ Time\'s Up!',
      'Your activity time is complete!',
      [{ text: 'OK', style: 'default' }]
    );
  }, []);

  const handleReset = useCallback(() => {
    handleStop();
    setMinutes(initialMinutes);
    setSeconds(0);
    triggerHaptic('light');
  }, [initialMinutes, handleStop]);

  const handlePresetSelect = useCallback((value: number) => {
    setMinutes(value);
    setSeconds(0);
    triggerHaptic('light');
  }, []);

  const handleCustomTime = useCallback(() => {
    const val = parseInt(customTime);
    if (val > 0 && val <= 180) {
      setMinutes(val);
      setSeconds(0);
      setCustomTime('');
      triggerHaptic('light');
    }
  }, [customTime]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((initialMinutes * 60 - (minutes * 60 + seconds)) / (initialMinutes * 60)) * 100;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Timer</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Feather name="x" size={24} color={theme.text} />
            </Pressable>
          </View>

          {!isRunning ? (
            <View style={styles.setupContainer}>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Select duration for your activity
              </Text>
              
              <View style={styles.presetGrid}>
                {PRESET_TIMES.map((preset) => (
                  <Pressable
                    key={preset.value}
                    onPress={() => handlePresetSelect(preset.value)}
                    style={[
                      styles.presetButton,
                      { 
                        backgroundColor: minutes === preset.value ? theme.primary : theme.background,
                        borderColor: theme.border,
                      }
                    ]}
                  >
                    <Text style={[
                      styles.presetText,
                      { color: minutes === preset.value ? '#fff' : theme.text }
                    ]}>
                      {preset.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.customInput}>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: theme.background,
                      color: theme.text,
                      borderColor: theme.border,
                    }
                  ]}
                  placeholder="Custom (min)"
                  placeholderTextColor={theme.textSecondary}
                  value={customTime}
                  onChangeText={setCustomTime}
                  keyboardType="number-pad"
                  maxLength={3}
                />
                <Pressable 
                  onPress={handleCustomTime}
                  style={[styles.setButton, { backgroundColor: theme.primary }]}
                >
                  <Text style={styles.setButtonText}>Set</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.timerContainer}>
              <Animated.View style={[styles.timerCircle, pulseStyle]}>
                <Text style={[styles.timerText, { color: theme.text }]}>
                  {formatTime(minutes, seconds)}
                </Text>
                <Text style={[styles.timerLabel, { color: theme.textSecondary }]}>
                  {isPaused ? 'PAUSED' : 'REMAINING'}
                </Text>
              </Animated.View>

              <View style={styles.controls}>
                {isPaused ? (
                  <Pressable 
                    onPress={handleResume}
                    style={[styles.controlButton, { backgroundColor: theme.primary }]}
                  >
                    <Feather name="play" size={32} color="#fff" />
                  </Pressable>
                ) : (
                  <Pressable 
                    onPress={handlePause}
                    style={[styles.controlButton, { backgroundColor: theme.warning }]}
                  >
                    <Feather name="pause" size={32} color="#fff" />
                  </Pressable>
                )}
                
                <Pressable 
                  onPress={handleStop}
                  style={[styles.controlButton, { backgroundColor: theme.error }]}
                >
                  <Feather name="square" size={32} color="#fff" />
                </Pressable>
              </View>
            </View>
          )}

          {!isRunning && (
            <Pressable 
              onPress={handleStart}
              style={[styles.startButton, { backgroundColor: theme.primary }]}
            >
              <Feather name="play" size={24} color="#fff" />
              <Text style={styles.startText}>Start Timer</Text>
            </Pressable>
          )}

          {isRunning && (
            <Pressable 
              onPress={handleReset}
              style={[styles.resetButton, { borderColor: theme.border }]}
            >
              <Feather name="rotate-ccw" size={20} color={theme.text} />
              <Text style={[styles.resetText, { color: theme.text }]}>Reset</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  setupContainer: {
    marginBottom: 20,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  presetButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 14,
    fontWeight: '600',
  },
  customInput: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    maxWidth: 150,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  setButton: {
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
  },
  setButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  timerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 89, 94, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
  },
  timerLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    gap: 20,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
  },
  startText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
    gap: 8,
  },
  resetText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
