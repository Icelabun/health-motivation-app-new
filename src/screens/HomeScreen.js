import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  Image, StatusBar, SafeAreaView, Dimensions,
  Animated, Platform
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userProfile = await AsyncStorage.getItem('userProfile');
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        setUserName(profile.username || 'User');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [120, 80],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const renderHeader = () => (
    <Animated.View style={[styles.header, { height: headerHeight, opacity: headerOpacity }]}>
      <LinearGradient
        colors={['#FFD700', '#FFC107', '#FFB300']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{userName}</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Settings')} 
            style={styles.settingsButton}
          >
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderCard = (icon, title, subtitle, colors, delay, onPress) => (
    <Animatable.View 
      animation="fadeInUp" 
      delay={delay} 
      style={styles.card}
    >
      <TouchableOpacity
        style={styles.cardContent}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={colors}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardIconContainer}>
            <MaterialCommunityIcons name={icon} size={40} color="#fff" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardSubtitle}>{subtitle}</Text>
          </View>
          <View style={styles.cardArrowContainer}>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#FFD700', '#FFC107', '#FFB300']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Welcome Back, {userName}!</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animatable.View animation="fadeInUp" delay={200} style={styles.section}>
            <Text style={styles.sectionTitle}>Health & Wellness</Text>
            {renderCard(
              'food-apple',
              'Nutrition Tips',
              'Get personalized nutrition advice',
              ['#008080', '#006666'],
              200,
              () => navigation.navigate('Nutrition')
            )}
            {renderCard(
              'run-fast',
              'Exercise Plans',
              'Customized workout routines',
              ['#2C3E50', '#1a252f'],
              300,
              () => navigation.navigate('Exercise')
            )}
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={400} style={styles.section}>
            <Text style={styles.sectionTitle}>Mind & Motivation</Text>
            {renderCard(
              'format-quote-close',
              'Quotes & Books',
              'Inspirational content',
              ['#008080', '#006666'],
              400,
              () => navigation.navigate('QuotesAndBooks')
            )}
            {renderCard(
              'book-open',
              'Daily Reading',
              'Your daily dose of wisdom',
              ['#2C3E50', '#1a252f'],
              500,
              () => navigation.navigate('DailyReading')
            )}
            {renderCard(
              'bell-ring',
              'Notifications',
              'Messages from admin',
              ['#4CAF50', '#2E7D32'],
              550,
              () => navigation.navigate('Notifications')
            )}
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={600} style={styles.section}>
            <Text style={styles.sectionTitle}>Progress & Activity</Text>
            {renderCard(
              'chart-line',
              'Progress Tracking',
              'Monitor your achievements',
              ['#008080', '#006666'],
              600,
              () => navigation.navigate('Progress')
            )}
            {renderCard(
              'calendar-check',
              'Daily Activity Log',
              'Record your daily activities',
              ['#2C3E50', '#1a252f'],
              700,
              () => navigation.navigate('DailyActivityLog')
            )}
          </Animatable.View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingTop: Platform.OS === 'ios' ? 0 : 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(44, 62, 80, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 30,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
  },
  welcomeText: {
    color: '#2C3E50',
    fontSize: 16,
    opacity: 0.8,
  },
  userName: {
    color: '#2C3E50',
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  cardGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
  },
  cardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  cardArrowContainer: {
    marginLeft: 10,
  },
});

export default HomeScreen;
