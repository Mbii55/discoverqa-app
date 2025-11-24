// src/screens/OnboardingScreen.js - ENHANCED VERSION
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 600;
const isAndroid = Platform.OS === 'android';

const ONBOARDING_KEY = '@discoverqa_onboarding_completed';

const slides = [
  {
    id: '1',
    type: 'image', // First slide uses app logo
    title: 'Welcome to DiscoverQA',
    subtitle: 'Your ultimate guide to exploring Qatar',
    description: 'Discover amazing events, places, and experiences throughout Qatar',
    color: '#2D3748',
  },
  {
    id: '2',
    icon: '🎫',
    title: 'Discover Events',
    subtitle: 'Never miss out',
    description: 'Find concerts, festivals, sports events, cultural activities and more',
    color: '#4A5568',
  },
  {
    id: '3',
    icon: '📍',
    title: 'Explore Places',
    subtitle: 'Find hidden gems',
    description: 'Discover museums, parks, beaches, and top attractions',
    color: '#2D3748',
  },
  {
    id: '4',
    icon: '❤️',
    title: 'Save & Get Reminded',
    subtitle: 'Personalize your experience',
    description: 'Bookmark your favorites and set reminders for events you love',
    color: '#4A5568',
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
  };

  const handleGetStarted = async () => {
    await completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      navigation.replace('MainTabs');
    } catch (error) {
      console.error('Error saving onboarding state:', error);
      navigation.replace('MainTabs');
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderSlide = ({ item, index }) => {
    const isLast = index === slides.length - 1;
    const isFirst = index === 0;

    return (
      <View style={styles.slide}>
        {/* Content Container */}
        <View style={styles.slideContent}>
          {/* Icon/Logo Section */}
          <View style={styles.visualContainer}>
            {isFirst ? (
              // App Logo for first slide
              <View style={styles.logoContainer}>
                <View style={styles.logoBackground}>
                  <Image
                    source={require('../../assets/D.png')}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
              </View>
            ) : (
              // Emoji icons for other slides
                <View style={styles.iconWrapper}>
                    <Text style={styles.icon}>{item.icon}</Text>
              </View>
            )}
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Pagination Dots */}
          <View style={styles.pagination}>
            {slides.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  idx === currentIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            {!isLast ? (
              <>
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={handleSkip}
                  activeOpacity={0.7}
                >
                  <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={handleNext}
                  activeOpacity={0.8}
                >
                  <Text style={styles.nextText}>Next</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.getStartedButton}
                onPress={handleGetStarted}
                activeOpacity={0.8}
              >
                <Text style={styles.getStartedText}>Get Started</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEnabled={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: isTablet ? 60 : 24,
    paddingTop: isTablet ? 60 : (isAndroid ? 40 : 50),
    paddingBottom: isTablet ? 40 : (isAndroid ? 30 : 40),
  },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
  },
  
  // Visual Section (Logo/Icons)
  visualContainer: {
    alignItems: 'center',
    marginBottom: isTablet ? 60 : (isAndroid ? 40 : 50),
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoBackground: {
    width: isTablet ? 160 : (isAndroid ? 120 : 140),
    height: isTablet ? 160 : (isAndroid ? 120 : 140),
    borderRadius: isTablet ? 32 : (isAndroid ? 24 : 28),
    backgroundColor: '#F7F8FA',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  logo: {
    width: '75%',
    height: '75%',
  },
  iconWrapper: {
    alignItems: 'center',
  },
  iconCircle: {
    width: isTablet ? 120 : (isAndroid ? 80 : 100),
    height: isTablet ? 120 : (isAndroid ? 80 : 100),
    borderRadius: isTablet ? 60 : (isAndroid ? 40 : 50),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  icon: {
    fontSize: isTablet ? 56 : (isAndroid ? 36 : 44),
    textAlign: 'center',
  },

  // Text Content
  textContainer: {
    paddingHorizontal: isTablet ? 40 : (isAndroid ? 12 : 20),
  },
  title: {
    fontSize: isTablet ? 34 : (isAndroid ? 26 : 30),
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: isTablet ? 12 : (isAndroid ? 8 : 10),
    lineHeight: isTablet ? 42 : (isAndroid ? 34 : 38),
  },
  subtitle: {
    fontSize: isTablet ? 18 : (isAndroid ? 15 : 17),
    fontWeight: '600',
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: isTablet ? 20 : (isAndroid ? 12 : 16),
  },
  description: {
    fontSize: isTablet ? 17 : (isAndroid ? 14 : 16),
    color: '#718096',
    textAlign: 'center',
    lineHeight: isTablet ? 26 : (isAndroid ? 22 : 24),
    paddingHorizontal: isTablet ? 20 : (isAndroid ? 0 : 10),
  },

  // Bottom Section
  bottomSection: {
    paddingTop: isTablet ? 40 : (isAndroid ? 20 : 30),
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isTablet ? 40 : (isAndroid ? 24 : 32),
  },
  dot: {
    width: isTablet ? 10 : (isAndroid ? 8 : 9),
    height: isTablet ? 10 : (isAndroid ? 8 : 9),
    borderRadius: isTablet ? 5 : (isAndroid ? 4 : 4.5),
    backgroundColor: '#E2E8F0',
    marginHorizontal: isTablet ? 5 : 4,
  },
  dotActive: {
    backgroundColor: '#2D3748',
    width: isTablet ? 28 : (isAndroid ? 24 : 26),
  },

  // Buttons
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: isTablet ? 16 : (isAndroid ? 12 : 14),
  },
  skipButton: {
    flex: 1,
    paddingVertical: isTablet ? 16 : (isAndroid ? 14 : 15),
    paddingHorizontal: isTablet ? 28 : (isAndroid ? 20 : 24),
    borderRadius: isTablet ? 14 : (isAndroid ? 10 : 12),
    backgroundColor: '#F7F8FA',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  skipText: {
    fontSize: isTablet ? 16 : (isAndroid ? 14 : 15),
    fontWeight: '600',
    color: '#4A5568',
  },
  nextButton: {
    flex: 1,
    paddingVertical: isTablet ? 16 : (isAndroid ? 14 : 15),
    paddingHorizontal: isTablet ? 28 : (isAndroid ? 20 : 24),
    borderRadius: isTablet ? 14 : (isAndroid ? 10 : 12),
    backgroundColor: '#2D3748',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextText: {
    fontSize: isTablet ? 16 : (isAndroid ? 14 : 15),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  getStartedButton: {
    flex: 1,
    paddingVertical: isTablet ? 16 : (isAndroid ? 14 : 15),
    paddingHorizontal: isTablet ? 28 : (isAndroid ? 20 : 24),
    borderRadius: isTablet ? 14 : (isAndroid ? 10 : 12),
    backgroundColor: '#2D3748',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  getStartedText: {
    fontSize: isTablet ? 16 : (isAndroid ? 14 : 15),
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default OnboardingScreen;