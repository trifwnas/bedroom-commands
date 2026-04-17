import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { useTheme } from '../hooks/useTheme';
import { useAppStore } from '../store/useAppStore';
import { CATEGORIES } from '../types';

const { width } = Dimensions.get('window');

interface OnboardingStep {
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
}

const STEPS: OnboardingStep[] = [
  {
    title: 'Welcome to Bedroom Commands',
    description: 'Discover exciting activities to share with your partner. Draw cards, spin the wheel, or complete daily challenges!',
    icon: 'heart',
  },
  {
    title: 'Choose Your Category',
    description: 'Pick from Romantic, Playful, Spicy, Adventure, or Relaxing. Or let fate decide with Random!',
    icon: 'grid',
  },
  {
    title: 'Save Your Favorites',
    description: 'Tap the heart to save commands you love. Build your personal collection!',
    icon: 'heart',
  },
  {
    title: 'Complete Daily Challenges',
    description: 'Every day brings a new challenge. Track your streaks and earn achievements!',
    icon: 'award',
  },
];

export const Onboarding: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { setHasSeenOnboarding } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setHasSeenOnboarding(true);
    }
  };

  const handleSkip = () => {
    setHasSeenOnboarding(true);
  };

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.container}>
      <LinearGradient
        colors={[theme.primary, '#ff4047']}
        style={styles.gradient}
      >
        <Pressable onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Feather name={step.icon} size={64} color="#fff" />
          </View>

          <Text style={styles.stepIndicator}>
            {currentStep + 1} / {STEPS.length}
          </Text>

          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>

          <View style={styles.dots}>
            {STEPS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentStep && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          {isLast ? (
            <Pressable onPress={handleNext} style={styles.startButton}>
              <Text style={styles.startButtonText}>Get Started</Text>
              <Feather name="arrow-right" size={20} color="#ff595e" />
            </Pressable>
          ) : (
            <Pressable onPress={handleNext} style={styles.nextButton}>
              <Text style={styles.nextButtonText}>Next</Text>
              <Feather name="arrow-right" size={20} color="#fff" />
            </Pressable>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 60,
  },
  skipButton: {
    alignSelf: 'flex-end',
  },
  skipText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  stepIndicator: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  dots: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  footer: {
    marginBottom: 20,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  startButtonText: {
    color: '#ff595e',
    fontSize: 18,
    fontWeight: '700',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
