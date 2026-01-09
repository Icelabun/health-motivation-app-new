// ProgressScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const ProgressScreen = ({ route, navigation }) => {
  const [loading, setLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      fetchActivityLogs();
    }, [])
  );

  useEffect(() => {
    if (route.params?.refresh) {
      fetchActivityLogs();
    }
  }, [route.params?.refresh]);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      // Get current user's ID from AsyncStorage
      const userProfile = await AsyncStorage.getItem('userProfile');
      if (!userProfile) {
        setActivityLogs([]);
        return;
      }
      
      const { email } = JSON.parse(userProfile);
      const userSpecificKey = `activityLogs_${email}`;
      
      const storedLogs = await AsyncStorage.getItem(userSpecificKey);
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs);
        // Sort logs by date, most recent first
        const sortedLogs = parsedLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
        setActivityLogs(sortedLogs);
      } else {
        setActivityLogs([]);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDailyLogs = () => (
    <Animatable.View animation="fadeInUp" style={styles.dailyLogsContainer}>
      <Text style={styles.sectionTitle}>Daily Activity Logs</Text>
      {activityLogs.length === 0 ? (
        <Text style={styles.noLogsText}>No activity logs yet. Start logging your activities!</Text>
      ) : (
        activityLogs.map((log, index) => {
          const date = new Date(log.date);
          const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          });

          return (
            <Animatable.View
              key={log.id}
              animation="fadeInUp"
              delay={index * 100}
              style={styles.logCard}
            >
              <View style={styles.logHeader}>
                <Text style={styles.logDate}>{formattedDate}</Text>
                {log.mood && (
                  <View style={styles.moodIndicator}>
                    <Text style={styles.moodText}>{log.mood}</Text>
                  </View>
                )}
              </View>

              <View style={styles.logContent}>
                {log.activities.workout && (
                  <View style={styles.logItem}>
                    <MaterialCommunityIcons name="run" size={20} color="#34D399" />
                    <Text style={styles.logText}>Workout: {log.activities.workout}</Text>
                  </View>
                )}

                {log.activities.meal && (
                  <View style={styles.logItem}>
                    <MaterialCommunityIcons name="food-apple" size={20} color="#34D399" />
                    <Text style={styles.logText}>Meal: {log.activities.meal}</Text>
                  </View>
                )}

                {log.activities.reading && (
                  <View style={styles.logItem}>
                    <MaterialCommunityIcons name="book-open" size={20} color="#34D399" />
                    <Text style={styles.logText}>Reading: {log.activities.reading}</Text>
                  </View>
                )}

                {log.activities.waterIntake && (
                  <View style={styles.logItem}>
                    <MaterialCommunityIcons name="water" size={20} color="#34D399" />
                    <Text style={styles.logText}>Water: {log.activities.waterIntake}</Text>
                  </View>
                )}

                {log.activities.sleepHours && (
                  <View style={styles.logItem}>
                    <MaterialCommunityIcons name="sleep" size={20} color="#34D399" />
                    <Text style={styles.logText}>Sleep: {log.activities.sleepHours} hours</Text>
                  </View>
                )}

                {log.activities.selectedActivities && log.activities.selectedActivities.length > 0 && (
                  <View style={styles.logItem}>
                    <MaterialCommunityIcons name="dumbbell" size={20} color="#34D399" />
                    <Text style={styles.logText}>
                      Activities: {log.activities.selectedActivities.join(', ')}
                    </Text>
                  </View>
                )}

                {log.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesText}>{log.notes}</Text>
                  </View>
                )}
              </View>
            </Animatable.View>
          );
        })
      )}
    </Animatable.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34D399" />
          <Text style={styles.loadingText}>Loading your logs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.title}>Progress Tracking</Text>
        <View style={styles.headerRight} />
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderDailyLogs()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFD700',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFD700',
  },
  loadingText: {
    color: '#2C3E50',
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(44, 62, 80, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
    height: 40,
  },
  dailyLogsContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  noLogsText: {
    textAlign: 'center',
    color: '#34495E',
    fontSize: 16,
    marginTop: 20,
  },
  logCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(44, 62, 80, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(44, 62, 80, 0.1)',
  },
  logDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  moodIndicator: {
    backgroundColor: 'rgba(0, 128, 128, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  moodText: {
    color: '#008080',
    fontSize: 14,
    fontWeight: '500',
  },
  logContent: {
    gap: 10,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logText: {
    color: '#34495E',
    fontSize: 14,
  },
  notesContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(44, 62, 80, 0.05)',
    borderRadius: 10,
  },
  notesText: {
    color: '#34495E',
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default ProgressScreen; 