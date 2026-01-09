import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
  Dimensions, Platform, Animated, StatusBar, SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;
const isDesktop = width >= 1024;

// Atomic Habits content - 3 pages per day structure
// Each day shows 3 consecutive pages
const ATOMIC_HABITS_CONTENT = [
  // Day 1 - Pages 1-3
  {
    startPage: 1,
    pages: [
      {
        number: 1,
        content: 'No matter your goals, Atomic Habits offers a proven framework for improving every day. Learn how to make time for new habits (even when life gets crazy), overcome a lack of motivation and willpower, get back on track when you fall off course, and most importantly, how to change your habits for good. The problem is that we often focus on the wrong things. We think we need to change our results, but the results are not the problem. What we really need to change are the systems that produce those results.'
      },
      {
        number: 2,
        content: 'The quality of our lives often depends on the quality of our habits. With the same habits, you\'ll end up with the same results. But with better habits, anything is possible. The most powerful outcomes of any compounding process are delayed. You need to be patient. When you finally break through the Plateau of Latent Potential, people will call it an overnight success. The outside world only sees the most dramatic event rather than all that preceded it.'
      },
      {
        number: 3,
        content: 'Habits are the compound interest of self-improvement. The same way that money multiplies through compound interest, the effects of your habits multiply as you repeat them. They seem to make little difference on any given day and yet the impact they deliver over the months and years can be enormous. Success is the product of daily habits—not once-in-a-lifetime transformations. What you do today impacts your life tomorrow.'
      }
    ]
  },
  // Day 2 - Pages 4-6
  {
    startPage: 4,
    pages: [
      {
        number: 4,
        content: 'If you want better results, then forget about setting goals. Focus on your system instead. Goals are about the results you want to achieve. Systems are about the processes that lead to those results. Many people think they lack motivation when what they really lack is clarity. It is not always obvious when and where to take action. Few people can tell you what they\'re going to do today in detail.'
      },
      {
        number: 5,
        content: 'The Four Laws of Behavior Change are a simple set of rules we can use to build better habits. They are: (1) Make it obvious, (2) Make it attractive, (3) Make it easy, and (4) Make it satisfying. We can also invert these laws to learn how to break a bad habit. The inversion would be: (1) Make it invisible, (2) Make it unattractive, (3) Make it difficult, and (4) Make it unsatisfying.'
      },
      {
        number: 6,
        content: 'Your habits shape your identity, and your identity shapes your habits. Every action is a vote for the type of person you wish to become. No single instance will transform your beliefs, but as the votes build up, so does the evidence of your new identity. The real reason habits matter is not because they can get you better results (although they can do that), but because they can change your beliefs about yourself.'
      }
    ]
  },
  // Day 3 - Pages 7-9
  {
    startPage: 7,
    pages: [
      {
        number: 7,
        content: 'The ultimate form of intrinsic motivation is when a habit becomes part of your identity. It\'s one thing to say "I\'m the type of person who wants this." It\'s something very different to say "I\'m the type of person who is this." The more pride you have in a particular aspect of your identity, the more motivated you will be to maintain the habits associated with it. Once your pride gets involved, you\'ll fight tooth and nail to maintain your habits.'
      },
      {
        number: 8,
        content: 'True behavior change is identity change. You might start a habit because of motivation, but the only reason you\'ll stick with one is that it becomes part of your identity. The goal is not to read a book, the goal is to become a reader. The goal is not to run a marathon, the goal is to become a runner. The goal is not to learn an instrument, the goal is to become a musician.'
      },
      {
        number: 9,
        content: 'The process of building a habit can be divided into four simple steps: cue, craving, response, and reward. The cue triggers your brain to initiate a behavior. It is a bit of information that predicts a reward. Cravings are the motivational force behind every habit. Without some level of motivation or desire—without craving a change—we have no reason to act. What you crave is not the habit itself but the change in state it delivers.'
      }
    ]
  },
  // Day 4 - Pages 10-12
  {
    startPage: 10,
    pages: [
      {
        number: 10,
        content: 'The response is the actual habit you perform, which can take the form of a thought or an action. Whether a response occurs depends on how motivated you are and how much friction is associated with the behavior. The reward is the end goal of every habit. We chase rewards because they serve two purposes: (1) they satisfy us and (2) they teach us. The first purpose of rewards is to satisfy your craving.'
      },
      {
        number: 11,
        content: 'The second purpose of rewards is to teach you which actions are worth remembering in the future. Your brain is a reward detector. As you go about your life, your sensory nervous system is continuously monitoring which actions satisfy your desires and deliver pleasure. Feelings of pleasure and disappointment are part of the feedback mechanism that helps your brain distinguish useful actions from useless ones.'
      },
      {
        number: 12,
        content: 'The cue is about noticing the reward. The craving is about wanting the reward. The response is about obtaining the reward. We chase rewards because they serve two purposes: they satisfy us and they teach us. This four-step process is not something that happens occasionally, but rather it is an endless feedback loop that is running and active during every moment you are alive—even now.'
      }
    ]
  },
  // Day 5 - Pages 13-15
  {
    startPage: 13,
    pages: [
      {
        number: 13,
        content: 'The human brain is a prediction machine. It is continuously taking in your surroundings and analyzing the information it comes across. Whenever you predict that an opportunity will be rewarding, your levels of dopamine spike in anticipation. And whenever dopamine rises, so does your motivation to act. It is the anticipation of a reward—not the fulfillment of it—that gets us to take action.'
      },
      {
        number: 14,
        content: 'The inversion of the 1st Law (Make it obvious) is to make it invisible. Once a habit is formed, it is unlikely to be forgotten. People with high self-control tend to spend less time in tempting situations. It\'s easier to avoid temptation than resist it. One of the most practical ways to eliminate a bad habit is to reduce exposure to the cue that causes it. Remove a single cue and the entire habit often fades away.'
      },
      {
        number: 15,
        content: 'Self-control is a short-term strategy, not a long-term one. You may be able to resist temptation once or twice, but it\'s unlikely you can muster the willpower to overcome your desires every time. Instead of summoning a new dose of willpower whenever you want to do the right thing, your energy would be better spent optimizing your environment. This is the secret to self-control. Make the cues of your good habits obvious and the cues of your bad habits invisible.'
      }
    ]
  }
  // Add more days as needed - the system will cycle through these
];

const DailyReadingScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [currentReading, setCurrentReading] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Get user-specific storage key
  const getReadingProgressKey = () => {
    if (!user) return null;
    const userId = user._id || user.id || user.email || user.username || 'anonymous';
    return `readingProgress_${userId}`;
  };

  // Check if it's a new day (after 6 AM)
  const isNewDay = (lastReadDate) => {
    if (!lastReadDate) return true;
    const now = new Date();
    const lastRead = new Date(lastReadDate);
    const currentHour = now.getHours();
    const lastHour = lastRead.getHours();
    const isNewDate = now.toDateString() !== lastRead.toDateString();
    const isAfter6AM = currentHour >= 6;
    const wasAfter6AM = lastHour >= 6;
    
    // If it's a new date and it's after 6 AM, or if last read was before 6 AM and now it's after
    return isNewDate && isAfter6AM || (!wasAfter6AM && isAfter6AM);
  };

  // Get the day number based on last read date
  const getDayNumber = async () => {
    try {
      const progressKey = getReadingProgressKey();
      if (!progressKey) return 0;

      const savedProgress = await AsyncStorage.getItem(progressKey);
      if (!savedProgress) return 0;

      const progress = JSON.parse(savedProgress);
      const lastReadDate = progress.lastReadDate;
      
      if (!lastReadDate || isNewDay(lastReadDate)) {
        // New day - increment day number
        const newDayNumber = (progress.dayNumber || 0) + 1;
        return newDayNumber;
      }
      
      return progress.dayNumber || 0;
    } catch (error) {
      console.error('Error getting day number:', error);
      return 0;
    }
  };

  // Load daily reading content
  const loadDailyReading = async () => {
    try {
      setLoading(true);
      
      const progressKey = getReadingProgressKey();
      if (!progressKey) {
        // No user - show first day
        const dayContent = ATOMIC_HABITS_CONTENT[0];
        setCurrentReading(dayContent);
        setCurrentPageIndex(0);
        setIsCompleted(false);
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
        return;
      }

      const savedProgress = await AsyncStorage.getItem(progressKey);
      const now = new Date();
      
      let dayNumber = 0;
      let shouldUpdate = false;

      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        const lastReadDate = progress.lastReadDate ? new Date(progress.lastReadDate) : null;
        
        if (isNewDay(lastReadDate)) {
          // New day - move to next day
          dayNumber = (progress.dayNumber || 0) + 1;
          shouldUpdate = true;
        } else {
          // Same day - continue from where we left off
          dayNumber = progress.dayNumber || 0;
          setCurrentPageIndex(progress.currentPageIndex || 0);
          setIsCompleted(progress.isCompleted || false);
        }
      } else {
        // First time user
        dayNumber = 0;
        shouldUpdate = true;
      }

      // Get content for this day (cycle through available content)
      const dayIndex = dayNumber % ATOMIC_HABITS_CONTENT.length;
      const dayContent = ATOMIC_HABITS_CONTENT[dayIndex];
      
      // Update page numbers based on day
      const adjustedContent = {
        ...dayContent,
        pages: dayContent.pages.map(page => ({
          ...page,
          number: dayContent.startPage + (page.number - dayContent.startPage)
        }))
      };

      setCurrentReading(adjustedContent);
      
      if (shouldUpdate) {
        // Save progress
        await AsyncStorage.setItem(progressKey, JSON.stringify({
          dayNumber,
          currentPageIndex: 0,
          isCompleted: false,
          lastReadDate: now.toISOString(),
          startPage: dayContent.startPage
        }));
        setCurrentPageIndex(0);
        setIsCompleted(false);
      }

      setLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error loading daily reading:', error);
      setLoading(false);
    }
  };

  // Save reading progress
  const saveProgress = async (pageIndex, completed) => {
    try {
      const progressKey = getReadingProgressKey();
      if (!progressKey) return;

      const savedProgress = await AsyncStorage.getItem(progressKey);
      const progress = savedProgress ? JSON.parse(savedProgress) : {};
      
      await AsyncStorage.setItem(progressKey, JSON.stringify({
        ...progress,
        currentPageIndex: pageIndex,
        isCompleted: completed,
        lastReadDate: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // Handle next page
  const handleNextPage = () => {
    if (!currentReading) return;
    
    if (currentPageIndex < currentReading.pages.length - 1) {
      const newIndex = currentPageIndex + 1;
      setCurrentPageIndex(newIndex);
      saveProgress(newIndex, false);
      
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Completed all pages
      setIsCompleted(true);
      saveProgress(currentPageIndex, true);
    }
  };

  // Handle previous page
  const handlePreviousPage = () => {
    if (currentPageIndex > 0) {
      const newIndex = currentPageIndex - 1;
      setCurrentPageIndex(newIndex);
      setIsCompleted(false);
      saveProgress(newIndex, false);
      
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  useEffect(() => {
    loadDailyReading();
  }, [user]);

  if (loading) {
    return (
      <LinearGradient
        colors={['#20B2AA', '#66CDAA', '#7FFFD4']}
        style={styles.container}
      >
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.loadingContainer}>
          <Animatable.View animation="pulse" iterationCount="infinite">
            <ActivityIndicator size="large" color="#fff" />
          </Animatable.View>
          <Animatable.Text 
            animation="fadeIn" 
            style={styles.loadingText}
          >
            Loading today's reading...
          </Animatable.Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!currentReading) {
    return (
      <LinearGradient
        colors={['#20B2AA', '#66CDAA', '#7FFFD4']}
        style={styles.container}
      >
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.loadingContainer}>
          <Text style={styles.errorText}>Unable to load reading content</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const currentPage = currentReading.pages[currentPageIndex];
  const totalPages = 240; // Total pages in Atomic Habits
  const currentPageNumber = currentPage?.number || 0;

  return (
    <LinearGradient
      colors={['#20B2AA', '#66CDAA', '#7FFFD4']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('Main', { screen: 'Home' })}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>📖 Daily Reading – Atomic Habits</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Indicator */}
          <Animatable.View 
            animation="fadeInDown"
            style={styles.progressContainer}
          >
            <Text style={styles.progressText}>
              Page {currentPageNumber} of {totalPages}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(currentPageNumber / totalPages) * 100}%` }
                ]} 
              />
            </View>
          </Animatable.View>

          {/* Reading Content */}
          <Animated.View 
            style={[
              styles.readingContainer,
              { opacity: fadeAnim }
            ]}
          >
            <Animatable.View 
              animation="fadeInUp"
              style={styles.pageCard}
            >
              <Text style={styles.pageNumber}>Page {currentPage.number}</Text>
              <Text style={styles.pageContent}>{currentPage.content}</Text>
            </Animatable.View>

            {/* Navigation */}
            <View style={styles.navigationContainer}>
              <TouchableOpacity
                style={[
                  styles.navButton,
                  currentPageIndex === 0 && styles.disabledButton
                ]}
                onPress={handlePreviousPage}
                disabled={currentPageIndex === 0}
              >
                <MaterialCommunityIcons 
                  name="chevron-left" 
                  size={isTablet ? 36 : 28} 
                  color="#fff" 
                />
              </TouchableOpacity>
              
              <Text style={styles.pageIndicator}>
                {currentPageIndex + 1} / {currentReading.pages.length}
              </Text>
              
              <TouchableOpacity
                style={[
                  styles.navButton,
                  currentPageIndex === currentReading.pages.length - 1 && styles.disabledButton
                ]}
                onPress={handleNextPage}
                disabled={currentPageIndex === currentReading.pages.length - 1 || isCompleted}
              >
                <MaterialCommunityIcons 
                  name="chevron-right" 
                  size={isTablet ? 36 : 28} 
                  color="#fff" 
                />
              </TouchableOpacity>
            </View>

            {/* Success Message */}
            {isCompleted && (
              <Animatable.View 
                animation="fadeInUp"
                delay={300}
                style={styles.successContainer}
              >
                <MaterialCommunityIcons 
                  name="check-circle" 
                  size={48} 
                  color="#4CAF50" 
                />
                <Text style={styles.successTitle}>
                  ✨ You've completed today's reading!
                </Text>
                <Text style={styles.successMessage}>
                  Come back tomorrow at 6 AM for more.
                </Text>
              </Animatable.View>
            )}

            {/* Motivational Quote */}
            <Animatable.View 
              animation="fadeInUp"
              delay={500}
              style={styles.quoteContainer}
            >
              <MaterialCommunityIcons 
                name="format-quote-open" 
                size={24} 
                color="rgba(255,255,255,0.6)" 
              />
              <Text style={styles.quoteText}>
                Small habits make a big difference.
              </Text>
            </Animatable.View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: Dimensions.get('window').height,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: isTablet ? 22 : 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
    ...Platform.select({
      web: {
        textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
      },
      default: {
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
      },
    }),
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: isTablet ? 30 : 20,
    paddingBottom: 40,
    maxWidth: isDesktop ? 800 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  progressContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  progressText: {
    fontSize: isTablet ? 18 : 16,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 10,
    ...Platform.select({
      web: {
        textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
      },
      default: {
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
      },
    }),
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  readingContainer: {
    marginBottom: 20,
  },
  pageCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: isTablet ? 35 : 25,
    marginBottom: 25,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
      },
    }),
  },
  pageNumber: {
    fontSize: isTablet ? 20 : 18,
    color: '#20B2AA',
    marginBottom: 20,
    fontWeight: '700',
  },
  pageContent: {
    fontSize: isTablet ? 20 : 18,
    color: '#1a1a2e',
    lineHeight: isTablet ? 32 : 28,
    letterSpacing: 0.3,
    textAlign: 'left',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 30,
  },
  navButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    padding: isTablet ? 16 : 12,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  disabledButton: {
    opacity: 0.3,
  },
  pageIndicator: {
    color: '#fff',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    ...Platform.select({
      web: {
        textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
      },
      default: {
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
      },
    }),
  },
  successContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  successTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
    ...Platform.select({
      web: {
        textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
      },
      default: {
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
      },
    }),
  },
  successMessage: {
    fontSize: isTablet ? 18 : 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  quoteContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  quoteText: {
    fontSize: isTablet ? 18 : 16,
    color: '#fff',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '500',
    ...Platform.select({
      web: {
        textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
      },
      default: {
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
      },
    }),
  },
});

export default DailyReadingScreen;
