import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Linking, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ActivityProvider } from './src/context/ActivityContext';
import { ThemeProvider } from './src/context/ThemeContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import ActivityLogScreen from './src/screens/ActivityLogScreen';
import DailyActivityLogScreen from './src/screens/DailyActivityLogScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import AdminScreen from './src/screens/AdminScreen';
import AdminAccessScreen from './src/screens/AdminAccessScreen';
import LoadingScreen from './src/components/LoadingScreen';

// Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import NutritionTipsScreen from './src/screens/NutritionTipsScreen';
import QuotesAndBooksScreen from './src/screens/QuotesAndBooksScreen';
import DailyReadingScreen from './src/screens/DailyReadingScreen';
import ExercisePlansScreen from './src/screens/ExercisePlansScreen';
import FavoritePlansScreen from './src/screens/FavoritePlansScreen';
import FavoriteTipsScreen from './src/screens/FavoriteTipsScreen';
import NotificationSettingsScreen from './src/screens/NotificationSettingsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import DetailTipsScreen from './src/screens/DetailTipsScreen';
import ResultScreen from './src/screens/ResultScreen';
import SavedTipsScreen from './src/screens/SavedTipsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SaveLogScreen from './src/screens/SaveLogScreen';

// Navigators
const Stack = createNativeStackNavigator();

// Web Admin Dashboard Component
const WebAdminDashboard = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');

  const ADMIN_PASSWORD = 'HealthAdmin2024!';

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      loadUsers();
    } else {
      Alert.alert('Error', 'Invalid password');
      setPassword('');
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      // Load real user data from AsyncStorage
      const allKeys = await AsyncStorage.getAllKeys();
      const userKeys = allKeys.filter(key => key.startsWith('userProfile_') || key === 'userProfile');
      const userData = [];
      
      for (const key of userKeys) {
        try {
          const userProfile = await AsyncStorage.getItem(key);
          if (userProfile) {
            const profile = JSON.parse(userProfile);
            console.log('Admin Dashboard - Loading profile:', key, profile);
            const email = profile.email || 'unknown@example.com';
            
            // Load activity logs for this user
            const activityKey = `activityLogs_${email}`;
            const activityLogs = await AsyncStorage.getItem(activityKey);
            const parsedLogs = activityLogs ? JSON.parse(activityLogs) : [];
            
            // Load exercise progress for this user
            const exerciseKey = `exerciseProgress_${email}`;
            const exerciseData = await AsyncStorage.getItem(exerciseKey);
            const parsedExercise = exerciseData ? JSON.parse(exerciseData) : [];
            
            // Load reading progress for this user
            const readingProgressKey = `readingProgress_${email}`;
            const readingProgressData = await AsyncStorage.getItem(readingProgressKey);
            const parsedReadingProgress = readingProgressData ? JSON.parse(readingProgressData) : [];
            
            // Load nutrition tips data (if saved)
            const nutritionKey = `nutritionTips_${email}`;
            const nutritionData = await AsyncStorage.getItem(nutritionKey);
            const parsedNutrition = nutritionData ? JSON.parse(nutritionData) : [];
            
            console.log('Admin Dashboard - Loaded data:', {
              activityLogs: parsedLogs.length,
              exerciseProgress: parsedExercise.length,
              readingProgress: parsedReadingProgress.length,
              nutritionTips: parsedNutrition.length
            });
            
            // Calculate comprehensive stats - ACCURATE calculations
            const totalDailyLogs = parsedLogs.length;
            const totalWorkouts = parsedLogs.filter(log => log.activities?.workout || log.workout).length;
            const totalExerciseSessions = parsedExercise.length;
            const totalReadingSessions = parsedReadingProgress.length;
            const totalNutritionTips = parsedNutrition.length;
            
            // Calculate mood statistics more accurately
            const moods = parsedLogs.map(log => log.mood).filter(Boolean);
            const moodCounts = moods.reduce((acc, mood) => {
              acc[mood] = (acc[mood] || 0) + 1;
              return acc;
            }, {});
            const averageMood = Object.keys(moodCounts).length > 0 ? 
              Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b) : 'Unknown';
            
            // Calculate engagement metrics - MORE ACCURATE
            const totalActivities = parsedLogs.length + parsedExercise.length + parsedReadingProgress.length;
            
            // Calculate averages with proper null checks
            const validWaterLogs = parsedLogs.filter(log => log.activities?.waterIntake && log.activities.waterIntake > 0);
            const avgWaterIntake = validWaterLogs.length > 0 ? 
              validWaterLogs.reduce((sum, log) => sum + (log.activities.waterIntake || 0), 0) / validWaterLogs.length : 0;
            
            const validSleepLogs = parsedLogs.filter(log => log.activities?.sleepHours && log.activities.sleepHours > 0);
            const avgSleepHours = validSleepLogs.length > 0 ? 
              validSleepLogs.reduce((sum, log) => sum + (log.activities.sleepHours || 0), 0) / validSleepLogs.length : 0;
            
            const totalReadingMinutes = parsedReadingProgress.reduce((sum, reading) => sum + parseDurationToMinutes(reading.duration), 0);
            const totalExerciseMinutes = parsedExercise.reduce((sum, exercise) => sum + parseDurationToMinutes(exercise.duration), 0);
            
            // Calculate streak (consecutive days with activity)
            const sortedLogs = parsedLogs.sort((a, b) => new Date(a.date) - new Date(b.date));
            let streakDays = 0;
            let currentDate = new Date();
            for (let i = sortedLogs.length - 1; i >= 0; i--) {
              const logDate = new Date(sortedLogs[i].date);
              const daysDiff = Math.floor((currentDate - logDate) / (1000 * 60 * 60 * 24));
              if (daysDiff === streakDays) {
                streakDays++;
                currentDate = logDate;
              } else {
                break;
              }
            }
            
            // Calculate health score (0-100) - IMPROVED ALGORITHM
            const healthScore = Math.min(100, Math.max(0, 
              (totalWorkouts * 15) + 
              (totalExerciseSessions * 12) + 
              (totalReadingSessions * 8) + 
              (avgWaterIntake * 3) + 
              (avgSleepHours * 4) + 
              (totalNutritionTips * 3) +
              (streakDays * 2)
            ));
            
            // Determine user status
            const lastActivity = parsedLogs.length > 0 ? new Date(parsedLogs[parsedLogs.length - 1].date) : new Date(profile.registeredAt || profile.createdAt);
            const daysSinceLastActivity = Math.floor((new Date() - lastActivity) / (1000 * 60 * 60 * 24));
            const userStatus = daysSinceLastActivity <= 1 ? 'Active' : 
                              daysSinceLastActivity <= 7 ? 'Moderate' : 
                              daysSinceLastActivity <= 30 ? 'Inactive' : 'Dormant';
            
            console.log('Admin Dashboard - Profile fields:', {
              age: profile.age,
              gender: profile.gender,
              healthGoal: profile.healthGoal,
              activityLevel: profile.activityLevel,
              weight: profile.weight,
              height: profile.height,
              bloodType: profile.bloodType
            });
            
            userData.push({
              id: profile._id || Date.now(),
              name: profile.username || profile.name || 'Unknown User',
              email: email,
              age: profile.age || 'N/A',
              gender: profile.gender || 'N/A',
              weight: profile.weight || 'N/A',
              height: profile.height || 'N/A',
              bloodType: profile.bloodType || 'N/A',
              healthGoal: profile.healthGoal || 'N/A',
              activityLevel: profile.activityLevel || 'N/A',
              dietaryPreference: profile.dietaryPreference || 'N/A',
              medicalHistory: profile.medicalHistory || 'None',
              currentMedications: profile.currentMedications || 'None',
              registeredAt: profile.registeredAt || profile.createdAt || new Date().toISOString().split('T')[0],
              lastLogin: new Date().toISOString().split('T')[0],
              lastActivity: lastActivity.toISOString().split('T')[0],
              activityLogs: parsedLogs.slice(0, 10), // Show last 10 daily activity logs
              exerciseProgress: parsedExercise.slice(0, 10), // Show last 10 exercise entries
              readingProgress: parsedReadingProgress.slice(0, 10), // Show last 10 reading entries
              nutritionTips: parsedNutrition.slice(0, 5), // Show last 5 nutrition tips
              progress: {
                totalDailyLogs,
                totalWorkouts,
                totalExerciseSessions,
                totalReadingSessions,
                totalNutritionTips,
                averageMood,
                streakDays,
                totalActivities,
                avgWaterIntake: Math.round(avgWaterIntake * 10) / 10,
                avgSleepHours: Math.round(avgSleepHours * 10) / 10,
                totalReadingMinutes,
                totalExerciseMinutes,
                healthScore: Math.round(healthScore),
                moodDistribution: moodCounts,
                lastActivityDate: lastActivity.toISOString().split('T')[0]
              },
              engagement: {
                userStatus,
                daysSinceLastActivity,
                totalSessions: parsedLogs.length,
                avgSessionDuration: totalActivities > 0 ? Math.round((totalReadingMinutes + totalExerciseMinutes) / totalActivities) : 0,
                completionRate: Math.round((totalWorkouts / Math.max(parsedLogs.length, 1)) * 100),
                weeklyActivity: Math.round(parsedLogs.length / Math.max(daysSinceLastActivity / 7, 1) * 10) / 10,
                engagementScore: Math.round((healthScore + (streakDays * 5) + (avgWaterIntake * 10) + (avgSleepHours * 15)) / 4)
              },
              isAdmin: profile.isAdmin || false
            });
          }
        } catch (error) {
          console.error(`Error loading user data for key ${key}:`, error);
        }
      }
      
      setUsers(userData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Parse duration strings to extract numeric values
  const parseDurationToMinutes = (duration) => {
    if (!duration || typeof duration !== 'string') return 0;
    
    // Extract numbers from duration string (e.g., "30 minutes" -> 30, "2 hours" -> 120)
    const hourMatch = duration.match(/(\d+)\s*hour/i);
    const minuteMatch = duration.match(/(\d+)\s*minute/i);
    
    let totalMinutes = 0;
    if (hourMatch) totalMinutes += parseInt(hourMatch[1]) * 60;
    if (minuteMatch) totalMinutes += parseInt(minuteMatch[1]);
    
    // If no specific time found, try to extract any number
    if (totalMinutes === 0) {
      const numberMatch = duration.match(/(\d+)/);
      if (numberMatch) totalMinutes = parseInt(numberMatch[1]);
    }
    
    return totalMinutes;
  };

  // Analytics functions - IMPROVED CALCULATIONS
  const getDashboardStats = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.engagement.userStatus === 'Active').length;
    const moderateUsers = users.filter(user => user.engagement.userStatus === 'Moderate').length;
    const inactiveUsers = users.filter(user => user.engagement.userStatus === 'Inactive').length;
    const dormantUsers = users.filter(user => user.engagement.userStatus === 'Dormant').length;
    
    const avgHealthScore = users.reduce((sum, user) => sum + user.progress.healthScore, 0) / Math.max(totalUsers, 1);
    const avgEngagementScore = users.reduce((sum, user) => sum + user.engagement.engagementScore, 0) / Math.max(totalUsers, 1);
    const avgStreakDays = users.reduce((sum, user) => sum + user.progress.streakDays, 0) / Math.max(totalUsers, 1);
    
    // SEPARATE exercise and reading stats - ACCURATE
    const totalExerciseSessions = users.reduce((sum, user) => sum + user.progress.totalExerciseSessions, 0);
    const totalReadingSessions = users.reduce((sum, user) => sum + user.progress.totalReadingSessions, 0);
    const totalExerciseMinutes = users.reduce((sum, user) => sum + user.progress.totalExerciseMinutes, 0);
    const totalReadingMinutes = users.reduce((sum, user) => sum + user.progress.totalReadingMinutes, 0);
    const totalDailyLogs = users.reduce((sum, user) => sum + user.progress.totalDailyLogs, 0);
    const totalWorkouts = users.reduce((sum, user) => sum + user.progress.totalWorkouts, 0);
    const totalNutritionTips = users.reduce((sum, user) => sum + user.progress.totalNutritionTips, 0);
    
    // Calculate platform-wide averages
    const avgWaterIntake = users.reduce((sum, user) => sum + user.progress.avgWaterIntake, 0) / Math.max(totalUsers, 1);
    const avgSleepHours = users.reduce((sum, user) => sum + user.progress.avgSleepHours, 0) / Math.max(totalUsers, 1);
    
    // Calculate retention metrics
    const retentionRate = Math.round((activeUsers + moderateUsers) / Math.max(totalUsers, 1) * 100);
    const churnRate = Math.round(dormantUsers / Math.max(totalUsers, 1) * 100);
    
    return {
      totalUsers,
      activeUsers,
      moderateUsers,
      inactiveUsers,
      dormantUsers,
      avgHealthScore: Math.round(avgHealthScore),
      avgEngagementScore: Math.round(avgEngagementScore),
      avgStreakDays: Math.round(avgStreakDays * 10) / 10,
      totalExerciseSessions,
      totalReadingSessions,
      totalExerciseMinutes,
      totalReadingMinutes,
      totalDailyLogs,
      totalWorkouts,
      totalNutritionTips,
      avgWaterIntake: Math.round(avgWaterIntake * 10) / 10,
      avgSleepHours: Math.round(avgSleepHours * 10) / 10,
      engagementRate: Math.round((activeUsers / Math.max(totalUsers, 1)) * 100),
      retentionRate,
      churnRate
    };
  };

  const getFilteredUsers = () => {
    let filtered = users;
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Status filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(user => user.engagement.userStatus === filterBy);
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'healthScore':
          return b.progress.healthScore - a.progress.healthScore;
        case 'lastActivity':
          return new Date(b.lastActivity) - new Date(a.lastActivity);
        case 'registeredAt':
          return new Date(b.registeredAt) - new Date(a.registeredAt);
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const handleSendMessage = (user) => {
    setSelectedUser(user);
    setShowMessageModal(true);
  };

  const sendMessage = async () => {
    if (!messageText.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }
    
    try {
      // Store message in AsyncStorage
      const messageKey = `adminMessage_${selectedUser.email}`;
      const existingMessages = await AsyncStorage.getItem(messageKey);
      const messages = existingMessages ? JSON.parse(existingMessages) : [];
      
      const newMessage = {
        id: Date.now(),
        text: messageText,
        timestamp: new Date().toISOString(),
        from: 'Admin'
      };
      
      messages.push(newMessage);
      await AsyncStorage.setItem(messageKey, JSON.stringify(messages));
      
      setMessageText('');
      setShowMessageModal(false);
      setSelectedUser(null);
      Alert.alert('Success', 'Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.adminLoginContainer}>
        <View style={styles.adminLoginBox}>
          <Text style={styles.adminTitle}>Admin Dashboard</Text>
          <Text style={styles.adminSubtitle}>Enter password to continue</Text>
          <TextInput
            style={styles.adminInput}
            placeholder="Enter admin password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#666"
          />
          <TouchableOpacity style={styles.adminButton} onPress={handleLogin}>
            <Text style={styles.adminButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const stats = getDashboardStats();
  const filteredUsers = getFilteredUsers();

  return (
    <View style={styles.adminContainer}>
      {/* Modern Header */}
      <View style={styles.modernHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Health & Motivation</Text>
          <Text style={styles.headerSubtitle}>Admin Dashboard</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={loadUsers}
          >
            <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
          </TouchableOpacity>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => setIsAuthenticated(false)}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
        </View>
      </View>
      
      {/* Dashboard Stats - ENHANCED */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
          <Text style={styles.statSubtext}>{stats.retentionRate}% retention</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.activeUsers}</Text>
          <Text style={styles.statLabel}>Active Users</Text>
          <Text style={styles.statSubtext}>{stats.moderateUsers} moderate</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.avgHealthScore}</Text>
          <Text style={styles.statLabel}>Avg Health Score</Text>
          <Text style={styles.statSubtext}>{stats.avgEngagementScore} engagement</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.avgStreakDays}</Text>
          <Text style={styles.statLabel}>Avg Streak Days</Text>
          <Text style={styles.statSubtext}>{stats.churnRate}% churn</Text>
        </View>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>Users</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>Analytics</Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && (
          <View style={styles.overviewContent}>
            <Text style={styles.sectionTitle}>Platform Overview</Text>
            <View style={styles.overviewGrid}>
              <View style={styles.overviewCard}>
                <Text style={styles.overviewCardTitle}>Exercise Sessions</Text>
                <Text style={styles.overviewCardNumber}>{stats.totalExerciseSessions}</Text>
                <Text style={styles.overviewCardSubtitle}>{Math.round(stats.totalExerciseMinutes / 60 * 10) / 10}h {stats.totalExerciseMinutes % 60}m total</Text>
              </View>
              <View style={styles.overviewCard}>
                <Text style={styles.overviewCardTitle}>Reading Sessions</Text>
                <Text style={styles.overviewCardNumber}>{stats.totalReadingSessions}</Text>
                <Text style={styles.overviewCardSubtitle}>{Math.round(stats.totalReadingMinutes / 60 * 10) / 10}h {stats.totalReadingMinutes % 60}m total</Text>
              </View>
              <View style={styles.overviewCard}>
                <Text style={styles.overviewCardTitle}>Daily Logs</Text>
                <Text style={styles.overviewCardNumber}>{stats.totalDailyLogs}</Text>
                <Text style={styles.overviewCardSubtitle}>{stats.totalWorkouts} workouts</Text>
              </View>
              <View style={styles.overviewCard}>
                <Text style={styles.overviewCardTitle}>Nutrition Tips</Text>
                <Text style={styles.overviewCardNumber}>{stats.totalNutritionTips}</Text>
                <Text style={styles.overviewCardSubtitle}>Tips shared</Text>
              </View>
              <View style={styles.overviewCard}>
                <Text style={styles.overviewCardTitle}>Avg Water Intake</Text>
                <Text style={styles.overviewCardNumber}>{stats.avgWaterIntake.toFixed(1)}L</Text>
                <Text style={styles.overviewCardSubtitle}>Per day</Text>
              </View>
              <View style={styles.overviewCard}>
                <Text style={styles.overviewCardTitle}>Avg Sleep Hours</Text>
                <Text style={styles.overviewCardNumber}>{stats.avgSleepHours}h</Text>
                <Text style={styles.overviewCardSubtitle}>Per night</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'users' && (
          <View style={styles.usersContent}>
            {/* Search and Filter Controls */}
            <View style={styles.controlsContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search users..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholderTextColor="#999"
              />
              <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Filter:</Text>
                <TouchableOpacity 
                  style={[styles.filterButton, filterBy === 'all' && styles.activeFilterButton]}
                  onPress={() => setFilterBy('all')}
                >
                  <Text style={[styles.filterButtonText, filterBy === 'all' && styles.activeFilterButtonText]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.filterButton, filterBy === 'Active' && styles.activeFilterButton]}
                  onPress={() => setFilterBy('Active')}
                >
                  <Text style={[styles.filterButtonText, filterBy === 'Active' && styles.activeFilterButtonText]}>Active</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.filterButton, filterBy === 'Inactive' && styles.activeFilterButton]}
                  onPress={() => setFilterBy('Inactive')}
                >
                  <Text style={[styles.filterButtonText, filterBy === 'Inactive' && styles.activeFilterButtonText]}>Inactive</Text>
                </TouchableOpacity>
              </View>
            </View>

        {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading users...</Text>
              </View>
            ) : (
              filteredUsers.map(user => (
                <View key={user.id} style={styles.modernUserCard}>
                  {/* User Header */}
                  <View style={styles.modernUserHeader}>
                    <View style={styles.userInfo}>
                      <Text style={styles.modernUserName}>{user.name}</Text>
                      <Text style={styles.modernUserEmail}>{user.email}</Text>
                      <View style={styles.userStatusContainer}>
                        <View style={[styles.statusIndicator, { backgroundColor: 
                          user.engagement.userStatus === 'Active' ? '#4CAF50' :
                          user.engagement.userStatus === 'Moderate' ? '#FF9800' :
                          user.engagement.userStatus === 'Inactive' ? '#F44336' : '#9E9E9E'
                        }]} />
                        <Text style={styles.userStatusText}>{user.engagement.userStatus}</Text>
                      </View>
                    </View>
                    <View style={styles.userHealthScore}>
                      <Text style={styles.healthScoreNumber}>{user.progress.healthScore}</Text>
                      <Text style={styles.healthScoreLabel}>Health Score</Text>
                    </View>
              </View>
              
                  {/* User Stats Grid - SEPARATE exercise and reading */}
                  <View style={styles.modernStatsGrid}>
                    <View style={styles.modernStatItem}>
                      <Text style={styles.modernStatNumber}>{user.progress.totalDailyLogs}</Text>
                      <Text style={styles.modernStatLabel}>Daily Logs</Text>
                    </View>
                    <View style={styles.modernStatItem}>
                      <Text style={styles.modernStatNumber}>{user.progress.totalExerciseSessions}</Text>
                      <Text style={styles.modernStatLabel}>Exercise Sessions</Text>
                    </View>
                    <View style={styles.modernStatItem}>
                      <Text style={styles.modernStatNumber}>{user.progress.totalReadingSessions}</Text>
                      <Text style={styles.modernStatLabel}>Reading Sessions</Text>
                    </View>
                    <View style={styles.modernStatItem}>
                      <Text style={styles.modernStatNumber}>{Math.round(user.progress.totalExerciseMinutes / 60 * 10) / 10}h {user.progress.totalExerciseMinutes % 60}m</Text>
                      <Text style={styles.modernStatLabel}>Exercise Min</Text>
                    </View>
                    <View style={styles.modernStatItem}>
                      <Text style={styles.modernStatNumber}>{Math.round(user.progress.totalReadingMinutes / 60 * 10) / 10}h {user.progress.totalReadingMinutes % 60}m</Text>
                      <Text style={styles.modernStatLabel}>Reading Min</Text>
                    </View>
                    <View style={styles.modernStatItem}>
                      <Text style={styles.modernStatNumber}>{user.progress.avgWaterIntake.toFixed(1)}L</Text>
                      <Text style={styles.modernStatLabel}>Avg Water</Text>
                    </View>
                  </View>

                  {/* User Details */}
                  <View style={styles.userDetailsContainer}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Age:</Text>
                      <Text style={styles.detailValue}>{user.age}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Gender:</Text>
                      <Text style={styles.detailValue}>{user.gender}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Health Goal:</Text>
                      <Text style={styles.detailValue}>{user.healthGoal}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Activity Level:</Text>
                      <Text style={styles.detailValue}>{user.activityLevel}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Registered:</Text>
                      <Text style={styles.detailValue}>{user.registeredAt}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Last Activity:</Text>
                      <Text style={styles.detailValue}>{user.lastActivity}</Text>
                    </View>
                  </View>

                  {/* Recent Activity Logs */}
                  <View style={styles.recentActivityContainer}>
                    <Text style={styles.recentActivityTitle}>Recent Daily Activity Logs</Text>
                {user.activityLogs.slice(0, 3).map((log, index) => (
                      <View key={index} style={styles.recentActivityItem}>
                        <Text style={styles.activityDate}>{new Date(log.date).toLocaleDateString()}</Text>
                        <Text style={styles.activityDescription}>
                          {log.activities?.workout && `🏃 ${log.activities.workout}`}
                          {log.mood && ` | 😊 ${log.mood}`}
                          {log.activities?.waterIntake && ` | 💧 ${log.activities.waterIntake}L`}
                          {log.activities?.sleepHours && ` | 😴 ${log.activities.sleepHours}h`}
                        </Text>
                  </View>
                ))}
              </View>

                  {/* Exercise Progress */}
                  <View style={styles.recentActivityContainer}>
                    <Text style={styles.recentActivityTitle}>Exercise Progress</Text>
                    {user.exerciseProgress.slice(0, 3).map((exercise, index) => (
                      <View key={index} style={styles.recentActivityItem}>
                        <Text style={styles.activityDate}>{new Date(exercise.date).toLocaleDateString()}</Text>
                        <Text style={styles.activityDescription}>
                          🏋️ {exercise.title} - {parseDurationToMinutes(exercise.duration)} minutes
                          {exercise.notes && ` | ${exercise.notes}`}
                        </Text>
                  </View>
                ))}
              </View>

                  {/* Reading Progress */}
                  <View style={styles.recentActivityContainer}>
                    <Text style={styles.recentActivityTitle}>Reading Progress</Text>
                    {user.readingProgress.slice(0, 3).map((reading, index) => (
                      <View key={index} style={styles.recentActivityItem}>
                        <Text style={styles.activityDate}>{new Date(reading.date).toLocaleDateString()}</Text>
                        <Text style={styles.activityDescription}>
                          📚 {reading.title} - {reading.duration} minutes
                          {reading.notes && ` | ${reading.notes}`}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Actions */}
                  <View style={styles.modernActionsContainer}>
                <TouchableOpacity 
                      style={styles.modernActionButton}
                  onPress={() => handleSendMessage(user)}
                >
                      <Text style={styles.modernActionButtonText}>💬 Send Message</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
        )}

        {activeTab === 'analytics' && (
          <View style={styles.analyticsContent}>
            <Text style={styles.sectionTitle}>Platform Analytics</Text>
            <View style={styles.analyticsGrid}>
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsCardTitle}>Exercise Sessions</Text>
                <Text style={styles.analyticsCardValue}>{stats.totalExerciseSessions}</Text>
                <Text style={styles.analyticsCardSubtitle}>Total sessions</Text>
              </View>
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsCardTitle}>Reading Sessions</Text>
                <Text style={styles.analyticsCardValue}>{stats.totalReadingSessions}</Text>
                <Text style={styles.analyticsCardSubtitle}>Total sessions</Text>
              </View>
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsCardTitle}>Exercise Time</Text>
                <Text style={styles.analyticsCardValue}>{Math.round(stats.totalExerciseMinutes / 60 * 10) / 10}h {stats.totalExerciseMinutes % 60}m</Text>
                <Text style={styles.analyticsCardSubtitle}>Total minutes</Text>
              </View>
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsCardTitle}>Reading Time</Text>
                <Text style={styles.analyticsCardValue}>{Math.round(stats.totalReadingMinutes / 60 * 10) / 10}h {stats.totalReadingMinutes % 60}m</Text>
                <Text style={styles.analyticsCardSubtitle}>Total minutes</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Edit functionality removed */}

      {/* Send Message Modal */}
      {showMessageModal && selectedUser && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Send Message to {selectedUser.name}</Text>
            <TextInput
              style={[styles.modalInput, styles.messageInput]}
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Enter your message..."
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowMessageModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.sendButton]}
                onPress={sendMessage}
              >
                <Text style={styles.modalButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

// Save notification preferences
export const saveUserNotificationPreferences = async (preferences) => {
  try {
    await AsyncStorage.setItem('@user_preferences', JSON.stringify(preferences));
    console.log('Notification preferences saved successfully!');
  } catch (error) {
    console.error('Error saving preferences: ', error);
  }
};

// Schedule daily reminders for native apps only
const scheduleDailyReminders = async () => {
  if (Platform.OS !== 'web') {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time to stay on track!",
        body: "Remember to stay active, eat healthy, and keep up with your reading!",
      },
      trigger: {
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });
  }
};

const Navigation = () => {
  const { user, loading, forceUpdate } = useAuth();
  const [currentPath, setCurrentPath] = useState(Platform.OS === 'web' ? (window?.location?.pathname || '/') : '/');

  console.log('=== NAVIGATION DEBUG ===');
  console.log('Navigation - User state:', user);
  console.log('Navigation - Loading state:', loading);
  console.log('Navigation - User exists:', !!user);
  console.log('Navigation - User ID:', user?._id);
  console.log('Navigation - User type:', typeof user);
  console.log('Navigation - User keys:', user ? Object.keys(user) : 'null');
  console.log('Navigation - Current path:', currentPath);
  console.log('Navigation - Force update:', forceUpdate);

  // Handle URL changes for web
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleLocationChange = () => {
        setCurrentPath(window.location.pathname);
      };
      
      window.addEventListener('popstate', handleLocationChange);
      return () => window.removeEventListener('popstate', handleLocationChange);
    }
  }, []);

  // Check if we're on the admin dashboard URL
  if (Platform.OS === 'web' && currentPath === '/admindashboard') {
    return <WebAdminDashboard />;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  // Determine the initial route based on user state
  const getInitialRoute = () => {
    // Check for various possible ID fields or fallback to username/email
    const hasUserAuth = !!(user && (user._id || user.id || user.userId || user.username || user.email));
    console.log('=== INITIAL ROUTE DEBUG ===');
    console.log('Navigation - User state:', user);
    console.log('Navigation - User ID check:', { 
      user, 
      _id: user?._id, 
      id: user?.id, 
      userId: user?.userId,
      username: user?.username,
      email: user?.email,
      hasUserAuth 
    });
    
    if (hasUserAuth) {
      console.log('Navigation - User is authenticated, setting initial route to Main');
      return "Main";
    }
    console.log('Navigation - User is not authenticated, setting initial route to Welcome');
    return "Welcome";
  };

  const initialRoute = getInitialRoute();
  console.log('Navigation - Final initial route:', initialRoute);


  return (
    <NavigationContainer style={{ pointerEvents: 'auto' }}>
      <Stack.Navigator 
        key={`${user ? 'auth' : 'guest'}-${user?._id || 'no-user'}-${forceUpdate}`}
        screenOptions={{ 
          headerShown: false,
          gestureEnabled: false 
        }}
        initialRouteName={initialRoute}
      >
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ gestureEnabled: false }}
        />
        {/* Always register Main and other screens to avoid conditional mount race conditions */}
        <>
            <Stack.Screen 
              name="Main" 
              component={MainTabNavigator}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="SavedTips" component={SavedTipsScreen} />
            <Stack.Screen name="DetailTips" component={DetailTipsScreen} />
            <Stack.Screen name="Result" component={ResultScreen} />
            <Stack.Screen name="SaveLog" component={SaveLogScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="ActivityLog" component={ActivityLogScreen} />
            <Stack.Screen name="DailyActivityLog" component={DailyActivityLogScreen} />
            <Stack.Screen name="Progress" component={ProgressScreen} />
            <Stack.Screen name="QuotesAndBooks" component={QuotesAndBooksScreen} />
            <Stack.Screen name="DailyReading" component={DailyReadingScreen} />
            <Stack.Screen name="Exercise" component={ExercisePlansScreen} />
            <Stack.Screen name="Nutrition" component={NutritionTipsScreen} />
            {user?.isAdmin && (
              <>
                <Stack.Screen 
                  name="AdminAccess" 
                  component={AdminAccessScreen}
                  options={{
                    headerShown: true,
                    title: 'Admin Access',
                    headerStyle: {
                      backgroundColor: '#FFD700',
                    },
                    headerTintColor: '#2C3E50',
                    headerTitleStyle: {
                      fontWeight: 'bold',
                    },
                  }}
                />
                <Stack.Screen 
                  name="Admin" 
                  component={AdminScreen}
                  options={{
                    headerShown: true,
                    title: 'Admin Dashboard',
                    headerStyle: {
                      backgroundColor: '#FFD700',
                    },
                    headerTintColor: '#2C3E50',
                    headerTitleStyle: {
                      fontWeight: 'bold',
                    },
                  }}
                />
              </>
            )}
          </>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Modern Styles for Web Admin Dashboard
const styles = StyleSheet.create({
  // Login Styles
  adminLoginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  adminLoginBox: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    width: '100%',
    maxWidth: 400,
  },
  adminTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  adminSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  adminInput: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
    backgroundColor: '#f8fafc',
  },
  adminButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  adminButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Main Container
  adminContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  // Modern Header
  modernHeader: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  refreshButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },

  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  statSubtext: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 2,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#3b82f6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  activeTabText: {
    color: 'white',
  },

  // Content Area
  contentArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },

  // Overview Tab
  overviewContent: {
    paddingBottom: 20,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  overviewCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  overviewCardTitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
    textAlign: 'center',
  },
  overviewCardNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  overviewCardSubtitle: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
  },

  // Users Tab
  usersContent: {
    paddingBottom: 20,
  },
  controlsContainer: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  activeFilterButton: {
    backgroundColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: 'white',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },

  // Modern User Card
  modernUserCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  modernUserHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  userInfo: {
    flex: 1,
  },
  modernUserName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  modernUserEmail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  userStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  userStatusText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  userHealthScore: {
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
  },
  healthScoreNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  healthScoreLabel: {
    fontSize: 10,
    color: '#0369a1',
  },

  // Modern Stats Grid
  modernStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  modernStatItem: {
    width: '30%',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modernStatNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  modernStatLabel: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
  },

  // User Details
  userDetailsContainer: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    color: '#1e293b',
  },

  // Recent Activity
  recentActivityContainer: {
    marginBottom: 20,
  },
  recentActivityTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  recentActivityItem: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  activityDate: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 12,
    color: '#1e293b',
  },

  // Actions
  modernActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  modernActionButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modernActionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },

  // Analytics Tab
  analyticsContent: {
    paddingBottom: 20,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  analyticsCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  analyticsCardTitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
    textAlign: 'center',
  },
  analyticsCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  analyticsCardSubtitle: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
  },

  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    backgroundColor: '#f8fafc',
  },
  messageInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
  },
  sendButton: {
    backgroundColor: '#10b981',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default function App() {
  useEffect(() => {
    const initNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions denied');
        return;
      }
      await scheduleDailyReminders();
    };

    initNotifications();
  }, []);

  return (
    <AuthProvider>
      <ActivityProvider>
        <ThemeProvider>
        <Navigation />
        </ThemeProvider>
      </ActivityProvider>
    </AuthProvider>
  );
}
