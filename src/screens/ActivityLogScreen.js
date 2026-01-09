import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  SafeAreaView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const ActivityLogScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('meditation');
  const [showAddModal, setShowAddModal] = useState(false);
  const [meditationLogs, setMeditationLogs] = useState([]);
  const [readingLogs, setReadingLogs] = useState([]);
  const [newActivity, setNewActivity] = useState({
    type: 'meditation',
    title: '',
    duration: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserActivities();
  }, []);

  // Update newActivity type when activeTab changes
  useEffect(() => {
    setNewActivity(prev => ({
      ...prev,
      type: activeTab
    }));
  }, [activeTab]);

  const loadUserActivities = async () => {
    try {
      setLoading(true);
      const userProfile = await AsyncStorage.getItem('userProfile');
      if (!userProfile) {
        Alert.alert('Error', 'User profile not found. Please log in again.');
        return;
      }

      const { email } = JSON.parse(userProfile);
      
      // Load meditation logs
      const meditationKey = `meditationProgress_${email}`;
      const meditationData = await AsyncStorage.getItem(meditationKey);
      if (meditationData) {
        const parsedMeditationData = JSON.parse(meditationData);
        setMeditationLogs(parsedMeditationData);
      }

      // Load reading logs
      const readingKey = `readingProgress_${email}`;
      const readingData = await AsyncStorage.getItem(readingKey);
      if (readingData) {
        const parsedReadingData = JSON.parse(readingData);
        setReadingLogs(parsedReadingData);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
      Alert.alert('Error', 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const meditationTypes = [
    { id: '1', name: 'Mindfulness Meditation', icon: 'meditation' },
    { id: '2', name: 'Breathing Exercises', icon: 'weather-windy' },
    { id: '3', name: 'Body Scan', icon: 'body' },
    { id: '4', name: 'Loving Kindness', icon: 'heart' },
    { id: '5', name: 'Walking Meditation', icon: 'walk' },
    { id: '6', name: 'Guided Visualization', icon: 'eye' },
  ];

  const readingCategories = [
    { id: '1', name: 'Health & Fitness', icon: 'heart-pulse' },
    { id: '2', name: 'Nutrition', icon: 'food-apple' },
    { id: '3', name: 'Mental Health', icon: 'brain' },
    { id: '4', name: 'Self-Improvement', icon: 'book-open-variant' },
    { id: '5', name: 'Biography', icon: 'account' },
    { id: '6', name: 'Other', icon: 'book' },
  ];

  const handleAddActivity = async () => {
    try {
      // Get current user's profile
      const userProfile = await AsyncStorage.getItem('userProfile');
      if (!userProfile) {
        Alert.alert('Error', 'User profile not found. Please log in again.');
        return;
      }
      
      const { email } = JSON.parse(userProfile);
      const userSpecificKey = newActivity.type === 'meditation' 
        ? `meditationProgress_${email}` 
        : `readingProgress_${email}`;

      const activityData = {
        ...newActivity,
        id: Date.now().toString(),
        date: new Date().toISOString(),
        userId: email // Add user ID to the activity data
      };

      // Save to local state
      if (newActivity.type === 'meditation') {
        setMeditationLogs([...meditationLogs, activityData]);
      } else {
        setReadingLogs([...readingLogs, activityData]);
      }

      // Save to AsyncStorage with proper structure
      const existingData = await AsyncStorage.getItem(userSpecificKey);
      const parsedData = existingData ? JSON.parse(existingData) : [];
      
      const progressData = {
        type: newActivity.type,
        title: newActivity.title,
        duration: newActivity.duration,
        notes: newActivity.notes,
        date: new Date().toISOString(),
        id: Date.now().toString(),
        userId: email // Add user ID to the progress data
      };

      await AsyncStorage.setItem(userSpecificKey, JSON.stringify([...parsedData, progressData]));

      setShowAddModal(false);
      setNewActivity({
        type: activeTab,
        title: '',
        duration: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
      });

      Alert.alert('Success', 'Activity logged successfully!');
    } catch (error) {
      console.error('Error saving activity:', error);
      Alert.alert('Error', 'Failed to save activity');
    }
  };

  const handleViewProgress = () => {
    navigation.navigate('Progress');
  };

  const renderActivityCard = (item) => (
    <Animatable.View
      animation="fadeInUp"
      duration={500}
      style={styles.activityCard}
    >
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons
          name={item.type === 'meditation' ? 'meditation' : 'book-open-page-variant'}
          size={24}
          color="#fff"
        />
        <Text style={styles.cardTitle}>{item.title}</Text>
      </View>
      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={20} color="#fff" />
          <Text style={styles.detailText}>{item.duration}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={20} color="#fff" />
          <Text style={styles.detailText}>{item.date}</Text>
        </View>
      </View>
      {item.notes && (
        <Text style={styles.notesText}>{item.notes}</Text>
      )}
    </Animatable.View>
  );

  const renderAddModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Add New {activeTab === 'exercise' ? 'Exercise' : 'Reading'}
            </Text>
            <TouchableOpacity
              onPress={() => setShowAddModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm}>
            <Text style={styles.inputLabel}>
              {activeTab === 'meditation' ? 'Meditation Type' : 'Reading Title'}
            </Text>
            <TextInput
              style={styles.input}
              value={newActivity.title}
              onChangeText={(text) => setNewActivity({ ...newActivity, title: text })}
              placeholder={activeTab === 'meditation' ? "e.g., Mindfulness Meditation" : "e.g., Health Book Chapter 3"}
              placeholderTextColor="rgba(255,255,255,0.5)"
            />

            <Text style={styles.inputLabel}>
              {activeTab === 'meditation' ? 'Duration' : 'Reading Time'}
            </Text>
            <TextInput
              style={styles.input}
              value={newActivity.duration}
              onChangeText={(text) => setNewActivity({ ...newActivity, duration: text })}
              placeholder={activeTab === 'meditation' ? "e.g., 15 minutes" : "e.g., 2 hours"}
              placeholderTextColor="rgba(255,255,255,0.5)"
            />

            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={newActivity.notes}
              onChangeText={(text) => setNewActivity({ ...newActivity, notes: text })}
              placeholder="Add any additional notes..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddActivity}
            >
              <Text style={styles.addButtonText}>Add Activity</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const saveActivityLog = async () => {
    try {
      setLoading(true);
      
      // Get current user's profile
      const userProfile = await AsyncStorage.getItem('userProfile');
      if (!userProfile) {
        Alert.alert('Error', 'User profile not found. Please log in again.');
        return;
      }
      
      const { email } = JSON.parse(userProfile);
      const userSpecificKey = `activityLogs_${email}`;
      
      // Get existing logs for this user
      const existingLogs = await AsyncStorage.getItem(userSpecificKey);
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      
      const newLog = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        activities: {
          workout: selectedWorkout,
          meal: selectedMeal,
          reading: selectedReading,
          waterIntake: waterIntake,
          sleepHours: sleepHours,
          selectedActivities: selectedActivities
        },
        mood: selectedMood,
        notes: notes
      };
      
      logs.push(newLog);
      await AsyncStorage.setItem(userSpecificKey, JSON.stringify(logs));
      
      Alert.alert(
        'Success',
        'Activity log saved successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              resetForm();
              navigation.navigate('Progress', { refresh: true });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error saving activity log:', error);
      Alert.alert('Error', 'Failed to save activity log. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FFD700', '#FFC107', '#FFB300']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wellness Activities</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.progressButton}
              onPress={handleViewProgress}
            >
              <Ionicons name="stats-chart" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'meditation' && styles.activeTab]}
            onPress={() => {
              setActiveTab('meditation');
              setNewActivity({
                type: 'meditation',
                title: '',
                duration: '',
                notes: '',
                date: new Date().toISOString().split('T')[0],
              });
            }}
          >
            <MaterialCommunityIcons
              name="meditation"
              size={24}
              color={activeTab === 'meditation' ? '#fff' : 'rgba(255,255,255,0.5)'}
            />
            <Text style={[styles.tabText, activeTab === 'meditation' && styles.activeTabText]}>
              Meditation
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'reading' && styles.activeTab]}
            onPress={() => {
              setActiveTab('reading');
              setNewActivity({
                type: 'reading',
                title: '',
                duration: '',
                notes: '',
                date: new Date().toISOString().split('T')[0],
              });
            }}
          >
            <MaterialCommunityIcons
              name="book-open-page-variant"
              size={24}
              color={activeTab === 'reading' ? '#fff' : 'rgba(255,255,255,0.5)'}
            />
            <Text style={[styles.tabText, activeTab === 'reading' && styles.activeTabText]}>
              Reading
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2C3E50" />
            <Text style={styles.loadingText}>Loading activities...</Text>
          </View>
        ) : (
          <FlatList
            data={activeTab === 'meditation' ? meditationLogs : readingLogs}
            renderItem={({ item }) => renderActivityCard(item)}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No {activeTab} activities logged yet. Add your first activity!
                </Text>
              </View>
            }
          />
        )}

        {renderAddModal()}
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
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  progressButton: {
    backgroundColor: 'rgba(44, 62, 80, 0.15)',
    padding: 10,
    borderRadius: 10,
  },
  addButton: {
    backgroundColor: 'rgba(44, 62, 80, 0.15)',
    padding: 10,
    borderRadius: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(44, 62, 80, 0.1)',
    gap: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(44, 62, 80, 0.2)',
  },
  tabText: {
    color: '#2C3E50',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#2C3E50',
  },
  listContainer: {
    padding: 15,
    gap: 15,
  },
  activityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 15,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  cardTitle: {
    color: '#2C3E50',
    fontSize: 18,
    fontWeight: '600',
  },
  cardDetails: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detailText: {
    color: '#34495E',
    fontSize: 14,
  },
  notesText: {
    color: '#34495E',
    fontSize: 14,
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#008080',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  modalForm: {
    gap: 15,
  },
  inputLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#2C3E50',
    fontSize: 16,
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#34495E',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ActivityLogScreen; 