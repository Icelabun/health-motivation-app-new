import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';

// Schedule default daily reminders
const scheduleDailyReminders = async () => {
  const workoutNotification = {
    content: {
      title: "Time to work out!",
      body: "Let's get moving and stay healthy. It's workout time!",
    },
    trigger: {
      hour: 7, // 7 AM workout reminder
      minute: 0,
      repeats: true,
    },
  };

  const mealNotification = {
    content: {
      title: "Meal Time!",
      body: "It's time for a healthy meal. Eat well and stay fueled!",
    },
    trigger: {
      hour: 12, // 12 PM lunch reminder
      minute: 0,
      repeats: true,
    },
  };

  const readingNotification = {
    content: {
      title: "Time to read!",
      body: "Continue your daily reading habit. You're doing great!",
    },
    trigger: {
      hour: 18, // 6 PM reading reminder
      minute: 0,
      repeats: true,
    },
  };

  const progressNotification = {
    content: {
      title: "Track Your Progress!",
      body: "Check your health progress, set new goals, and stay motivated!",
    },
    trigger: {
      hour: 20, // 8 PM reminder for progress check
      minute: 0,
      repeats: true,
    },
  };

  // Schedule notifications
  await scheduleNotifications(workoutNotification, mealNotification, readingNotification, progressNotification);
};

// Save user notification preferences
const saveUserNotificationPreferences = async (preferences) => {
  try {
    await AsyncStorage.setItem('notificationPreferences', JSON.stringify(preferences));
  } catch (error) {
    console.error("Error saving preferences:", error);
  }
};

// Load user notification preferences
const loadUserNotificationPreferences = async () => {
  try {
    const preferences = await AsyncStorage.getItem('notificationPreferences');
    return preferences ? JSON.parse(preferences) : null;
  } catch (error) {
    console.error("Error loading preferences:", error);
    return null;
  }
};

// Schedule custom reminders based on user preferences
const scheduleCustomReminders = async () => {
  const preferences = await loadUserNotificationPreferences();

  if (preferences) {
    const workoutNotification = {
      content: {
        title: "Time to work out!",
        body: "Let's get moving and stay healthy. It's workout time!",
      },
      trigger: {
        hour: preferences.workoutTime.hour, // User-defined hour
        minute: preferences.workoutTime.minute, // User-defined minute
        repeats: true,
      },
    };

    const mealNotification = {
      content: {
        title: "Meal Time!",
        body: "It's time for a healthy meal. Eat well and stay fueled!",
      },
      trigger: {
        hour: preferences.mealTime.hour,
        minute: preferences.mealTime.minute,
        repeats: true,
      },
    };

    const readingNotification = {
      content: {
        title: "Time to read!",
        body: "Continue your daily reading habit. You're doing great!",
      },
      trigger: {
        hour: preferences.readingTime.hour,
        minute: preferences.readingTime.minute,
        repeats: true,
      },
    };

    const progressNotification = {
      content: {
        title: "Track Your Progress!",
        body: "Check your health progress, set new goals, and stay motivated!",
      },
      trigger: {
        hour: preferences.progressTime.hour,
        minute: preferences.progressTime.minute,
        repeats: true,
      },
    };

    await scheduleNotifications(workoutNotification, mealNotification, readingNotification, progressNotification);
  }
};

const scheduleNotifications = async (workoutNotification, mealNotification, readingNotification, progressNotification) => {
  // Schedule notifications
    await Notifications.scheduleNotificationAsync(workoutNotification);
    await Notifications.scheduleNotificationAsync(mealNotification);
    await Notifications.scheduleNotificationAsync(readingNotification);
    await Notifications.scheduleNotificationAsync(progressNotification);
};

const NotificationSettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTimeType, setSelectedTimeType] = useState('');
  const [notificationPreferences, setNotificationPreferences] = useState({
    workout: {
      enabled: true,
      time: new Date(),
      frequency: 'daily',
      priority: 'high',
      customMessage: 'Time to energize your body!',
    },
    meal: {
      enabled: true,
      time: new Date(),
      frequency: 'daily',
      priority: 'medium',
      customMessage: 'Fuel your body with healthy choices!',
    },
    reading: {
      enabled: true,
      time: new Date(),
      frequency: 'daily',
      priority: 'low',
      customMessage: 'Expand your mind with daily reading!',
    },
    progress: {
      enabled: true,
      time: new Date(),
      frequency: 'weekly',
      priority: 'medium',
      customMessage: 'Track your progress and celebrate achievements!',
    },
  });

  useEffect(() => {
    loadPreferences();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.error('Notification permissions denied');
      }
  };

  const loadPreferences = async () => {
    try {
      const savedPreferences = await AsyncStorage.getItem('notificationPreferences');
      if (savedPreferences) {
        setNotificationPreferences(JSON.parse(savedPreferences));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const savePreferences = async () => {
    try {
      await AsyncStorage.setItem('notificationPreferences', JSON.stringify(notificationPreferences));
      scheduleNotifications();
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setNotificationPreferences(prev => ({
        ...prev,
        [selectedTimeType]: {
          ...prev[selectedTimeType],
          time: selectedTime,
        },
      }));
    }
  };

  const renderTimePicker = (type) => {
    setSelectedTimeType(type);
    setShowTimePicker(true);
  };

  const renderNotificationSetting = (type, settings) => (
    <View style={styles.settingCard} key={type}>
      <View style={styles.settingHeader}>
        <Text style={styles.settingTitle}>
          {type.charAt(0).toUpperCase() + type.slice(1)} Reminders
        </Text>
        <Switch
          value={settings.enabled}
          onValueChange={(value) => {
            setNotificationPreferences(prev => ({
              ...prev,
              [type]: { ...prev[type], enabled: value },
            }));
          }}
        />
      </View>

      {settings.enabled && (
        <>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => renderTimePicker(type)}
          >
            <MaterialCommunityIcons name="clock-outline" size={24} color="#34D399" />
            <Text style={styles.timeText}>
              {settings.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>

          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Frequency:</Text>
            <Picker
              selectedValue={settings.frequency}
              style={styles.picker}
              onValueChange={(value) => {
                setNotificationPreferences(prev => ({
                  ...prev,
                  [type]: { ...prev[type], frequency: value },
                }));
              }}
            >
              <Picker.Item label="Daily" value="daily" />
              <Picker.Item label="Weekly" value="weekly" />
              <Picker.Item label="Custom" value="custom" />
            </Picker>
          </View>

          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Priority:</Text>
            <Picker
              selectedValue={settings.priority}
              style={styles.picker}
              onValueChange={(value) => {
                setNotificationPreferences(prev => ({
                  ...prev,
                  [type]: { ...prev[type], priority: value },
                }));
              }}
            >
              <Picker.Item label="High" value="high" />
              <Picker.Item label="Medium" value="medium" />
              <Picker.Item label="Low" value="low" />
            </Picker>
          </View>

      <TextInput
            style={styles.messageInput}
            value={settings.customMessage}
            onChangeText={(text) => {
              setNotificationPreferences(prev => ({
                ...prev,
                [type]: { ...prev[type], customMessage: text },
              }));
            }}
            placeholder="Custom notification message"
          />
        </>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notification Settings</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        />
      </View>

      {notificationsEnabled && (
        <>
          {Object.entries(notificationPreferences).map(([type, settings]) =>
            renderNotificationSetting(type, settings)
          )}

          <TouchableOpacity
            style={styles.saveButton}
            onPress={savePreferences}
          >
            <Text style={styles.saveButtonText}>Save Preferences</Text>
          </TouchableOpacity>
        </>
      )}

      {showTimePicker && (
        <DateTimePicker
          value={notificationPreferences[selectedTimeType].time}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2F855A',
  },
  settingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  timeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4A5568',
  },
  pickerContainer: {
    marginBottom: 12,
  },
  pickerLabel: {
    fontSize: 16,
    color: '#4A5568',
    marginBottom: 4,
  },
  picker: {
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
  },
  messageInput: {
    backgroundColor: '#F7FAFC',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#4A5568',
  },
  saveButton: {
    backgroundColor: '#34D399',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default NotificationSettingsScreen;
