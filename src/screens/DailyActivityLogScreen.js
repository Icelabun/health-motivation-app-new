import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');

const DailyActivityLogScreen = ({ navigation }) => {
  const [workout, setWorkout] = useState('');
  const [meal, setMeal] = useState('');
  const [reading, setReading] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mood, setMood] = useState(null);
  const [notes, setNotes] = useState('');
  const [waterIntake, setWaterIntake] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [selectedActivities, setSelectedActivities] = useState([]);

  const moods = [
    { emoji: '😊', label: 'Great', color: '#4CAF50' },
    { emoji: '😌', label: 'Good', color: '#8BC34A' },
    { emoji: '😐', label: 'Okay', color: '#FFC107' },
    { emoji: '😔', label: 'Tired', color: '#FF9800' },
    { emoji: '😫', label: 'Exhausted', color: '#F44336' }
  ];

  const activities = [
    { id: 'meditation', icon: 'om', label: 'Meditation' },
    { id: 'yoga', icon: 'spa', label: 'Yoga' },
    { id: 'walking', icon: 'walking', label: 'Walking' },
    { id: 'cycling', icon: 'bicycle', label: 'Cycling' },
    { id: 'swimming', icon: 'swimmer', label: 'Swimming' },
    { id: 'gym', icon: 'dumbbell', label: 'Gym' }
  ];

  const validateInputs = () => {
    if (!workout && !meal && !reading && !waterIntake && !sleepHours && selectedActivities.length === 0) {
      Alert.alert('Error', 'Please enter at least one activity');
      return false;
    }
    return true;
  };

  const toggleActivity = (activityId) => {
    setSelectedActivities(prev => 
      prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const saveDailyActivity = async () => {
    try {
      setIsSaving(true);
      
      // Get current user's profile
      const userProfile = await AsyncStorage.getItem('userProfile');
      if (!userProfile) {
        Alert.alert('Error', 'User profile not found. Please log in again.');
        return;
      }
      
      const parsedProfile = JSON.parse(userProfile);
      const profileEmail = parsedProfile.email;
      const profileUsername = parsedProfile.username || parsedProfile.name || 'guest';
      // Prefer email for per-user logs; fallback to username if email is missing
      const storageKeyId = (profileEmail && profileEmail.trim().length > 0) ? profileEmail : profileUsername;
      
      // Save daily activity log (general activities like mood, water, sleep, etc.)
      const dailyLogKey = `activityLogs_${storageKeyId}`;
      const existingDailyLogs = await AsyncStorage.getItem(dailyLogKey);
      const dailyLogs = existingDailyLogs ? JSON.parse(existingDailyLogs) : [];
      
      const dailyLog = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        activities: {
          workout: workout,
          meal: meal,
          waterIntake: waterIntake,
          sleepHours: sleepHours,
          selectedActivities: selectedActivities
        },
        mood: mood,
        notes: notes
      };
      
      dailyLogs.push(dailyLog);
      await AsyncStorage.setItem(dailyLogKey, JSON.stringify(dailyLogs));
      
      // Save exercise activity separately if workout is provided
      if (workout && workout.trim().length > 0) {
        const exerciseKey = `exerciseProgress_${storageKeyId}`;
        const existingExerciseLogs = await AsyncStorage.getItem(exerciseKey);
        const exerciseLogs = existingExerciseLogs ? JSON.parse(existingExerciseLogs) : [];
        
        const exerciseLog = {
          id: Date.now().toString(),
          type: 'exercise',
          title: workout,
          duration: workout, // Store the workout description as duration
          notes: notes,
          date: new Date().toISOString(),
          userId: storageKeyId
        };
        
        exerciseLogs.push(exerciseLog);
        await AsyncStorage.setItem(exerciseKey, JSON.stringify(exerciseLogs));
      }
      
      // Save reading activity separately if reading is provided
      if (reading && reading.trim().length > 0) {
        const readingKey = `readingProgress_${storageKeyId}`;
        const existingReadingLogs = await AsyncStorage.getItem(readingKey);
        const readingLogs = existingReadingLogs ? JSON.parse(existingReadingLogs) : [];
        
        const readingLog = {
          id: Date.now().toString(),
          type: 'reading',
          title: 'Daily Reading',
          duration: reading,
          notes: notes,
          date: new Date().toISOString(),
          userId: storageKeyId
        };
        
        readingLogs.push(readingLog);
        await AsyncStorage.setItem(readingKey, JSON.stringify(readingLogs));
      }
      
      // Clear the form and go to Progress screen immediately
      clearInputs();
      navigation.navigate('Progress', { refresh: true });
    } catch (error) {
      console.error('Error saving daily activity:', error);
      Alert.alert('Error', 'Failed to save daily activity. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const clearInputs = () => {
    setWorkout('');
    setMeal('');
    setReading('');
    setMood(null);
    setNotes('');
    setWaterIntake('');
    setSleepHours('');
    setSelectedActivities([]);
  };

  const renderMoodSelector = () => (
    <Animatable.View animation="fadeInUp" delay={300} style={styles.moodContainer}>
      <Text style={styles.sectionTitle}>How are you feeling?</Text>
      <View style={styles.moodButtons}>
        {moods.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.moodButton,
              mood === item.label && styles.selectedMood,
              { borderColor: item.color }
            ]}
            onPress={() => setMood(item.label)}
          >
            <Text style={styles.moodEmoji}>{item.emoji}</Text>
            <Text style={styles.moodLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animatable.View>
  );

  const renderActivitySelector = () => (
    <Animatable.View animation="fadeInUp" delay={400} style={styles.activityContainer}>
      <Text style={styles.sectionTitle}>Select Activities</Text>
      <View style={styles.activityButtons}>
        {activities.map((activity, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.activityButton,
              selectedActivities.includes(activity.id) && styles.selectedActivity
            ]}
            onPress={() => toggleActivity(activity.id)}
          >
            <FontAwesome5 name={activity.icon} size={20} color="#fff" />
            <Text style={styles.activityLabel}>{activity.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#2ecc71', '#27ae60', '#219a52']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animatable.View 
          animation="fadeInDown" 
          duration={800}
          style={styles.header}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Daily Activity Log</Text>
          <View style={styles.headerRight} />
        </Animatable.View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <Animatable.View animation="fadeInUp" style={styles.form}>
              {renderActivitySelector()}

              {/* Exercise Section */}
              <Animatable.View animation="fadeInUp" delay={200} style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>🏃 Exercise Activities</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="run" size={24} color="#fff" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Workout (e.g., 30 minutes running)"
                    value={workout}
                    onChangeText={setWorkout}
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    keyboardType="numeric"
                  />
                </View>
              </Animatable.View>

              {/* Nutrition Section */}
              <Animatable.View animation="fadeInUp" delay={300} style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>🍎 Nutrition</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="food-apple" size={24} color="#fff" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Meal (e.g., Healthy lunch with salad)"
                    value={meal}
                    onChangeText={setMeal}
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />
                </View>
              </Animatable.View>

              {/* Reading Section */}
              <Animatable.View animation="fadeInUp" delay={400} style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>📚 Reading Activities</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="book-open" size={24} color="#fff" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Reading Progress (e.g., 2 hours)"
                    value={reading}
                    onChangeText={setReading}
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    keyboardType="numeric"
                  />
                </View>
              </Animatable.View>

              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="water" size={24} color="#fff" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Water Intake (e.g., 2 liters)"
                  value={waterIntake}
                  onChangeText={setWaterIntake}
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="sleep" size={24} color="#fff" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Sleep Hours (e.g., 7.5)"
                  value={sleepHours}
                  onChangeText={setSleepHours}
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  keyboardType="numeric"
                />
              </View>

              {renderMoodSelector()}

              <View style={styles.notesContainer}>
                <Text style={styles.sectionTitle}>Additional Notes</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Add any additional notes or reflections..."
                  value={notes}
                  onChangeText={setNotes}
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <TouchableOpacity 
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
                onPress={saveDailyActivity}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Log</Text>
                )}
              </TouchableOpacity>
            </Animatable.View>
          </ScrollView>
        </KeyboardAvoidingView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 15,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
    gap: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  inputIcon: {
    padding: 15,
  },
  input: {
    flex: 1,
    padding: 15,
    color: '#fff',
    fontSize: 16,
  },
  moodContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  sectionContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  moodButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  moodButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    width: (width - 60) / 5,
    borderWidth: 1,
  },
  selectedMood: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  moodLabel: {
    color: '#fff',
    fontSize: 12,
  },
  activityContainer: {
    marginTop: 10,
  },
  activityButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  activityButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    width: (width - 50) / 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  selectedActivity: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderColor: '#fff',
  },
  activityLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
  },
  notesContainer: {
    marginTop: 10,
  },
  notesInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default DailyActivityLogScreen; 