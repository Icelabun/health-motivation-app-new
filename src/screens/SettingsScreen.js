import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Platform,
  Alert,
  Dimensions,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const SettingsScreen = ({ navigation, route }) => {
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dailyRemindersEnabled, setDailyRemindersEnabled] = useState(true);
  const [weightChangeAlerts, setWeightChangeAlerts] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '' });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('userSettings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        setNotificationsEnabled(parsedSettings.notificationsEnabled ?? true);
        setDailyRemindersEnabled(parsedSettings.dailyRemindersEnabled ?? true);
        setWeightChangeAlerts(parsedSettings.weightChangeAlerts ?? true);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      const settings = {
        notificationsEnabled,
        dailyRemindersEnabled,
        weightChangeAlerts,
        darkMode: isDarkMode
      };
      await AsyncStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleSettingChange = async (setting, value) => {
    switch (setting) {
      case 'notifications':
        setNotificationsEnabled(value);
        break;
      case 'dailyReminders':
        setDailyRemindersEnabled(value);
        break;
      case 'weightChangeAlerts':
        setWeightChangeAlerts(value);
        break;
      case 'darkMode':
        toggleTheme();
        return; // toggleTheme already saves to AsyncStorage
    }
    await saveSettings();
  };

  const renderSettingItem = (icon, title, value, onValueChange, description, settingKey, iconColor = theme.colors.primary) => (
    <Animatable.View 
      animation="fadeIn" 
      style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.settingInfo}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          <MaterialCommunityIcons name={icon} size={24} color={iconColor} />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{title}</Text>
          <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={(newValue) => handleSettingChange(settingKey, newValue)}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary + '50' }}
        thumbColor={value ? theme.colors.primary : theme.colors.textSecondary}
        ios_backgroundColor={theme.colors.border}
      />
    </Animatable.View>
  );

  const renderSectionHeader = (title, icon) => (
    <Animatable.View 
      animation="fadeInLeft" 
      style={[styles.sectionHeader, { backgroundColor: theme.colors.primary }]}
    >
      <MaterialCommunityIcons name={icon} size={20} color="#fff" />
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </Animatable.View>
  );

  const showInfoModal = (title, content) => {
    setModalContent({ title, content });
    setShowModal(true);
  };

  const renderModal = () => (
    <Modal
      visible={showModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowModal(false)}
    >
      <View style={styles.modalOverlay}>
        <Animatable.View 
          animation="slideInUp"
          style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{modalContent.title}</Text>
            <TouchableOpacity 
              onPress={() => setShowModal(false)} 
              style={styles.closeButton}
            >
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <Text style={[styles.modalText, { color: theme.colors.text }]}>{modalContent.content}</Text>
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="cog" size={40} color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={theme.gradients.primary}
        style={styles.gradient}
      >
        <Animatable.View 
          animation="fadeInDown" 
          style={styles.header}
        >
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.colors.surface + '30' }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <TouchableOpacity
            style={[styles.themeButton, { backgroundColor: theme.colors.surface + '30' }]}
            onPress={toggleTheme}
          >
            <MaterialCommunityIcons 
              name={isDarkMode ? "weather-sunny" : "weather-night"} 
              size={24} 
              color="#fff" 
            />
          </TouchableOpacity>
        </Animatable.View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderSectionHeader('Notifications', 'bell')}
          <Animatable.View 
            animation="fadeIn" 
            delay={100}
            style={[styles.section, { backgroundColor: theme.colors.surface }]}
          >
            {renderSettingItem(
              'bell-outline',
              'Push Notifications',
              notificationsEnabled,
              setNotificationsEnabled,
              'Receive app notifications',
              'notifications',
              theme.colors.info
            )}
            {renderSettingItem(
              'calendar-clock',
              'Daily Reminders',
              dailyRemindersEnabled,
              setDailyRemindersEnabled,
              'Get daily activity reminders',
              'dailyReminders',
              theme.colors.warning
            )}
            {renderSettingItem(
              'chart-bell-curve',
              'Weight Change Alerts',
              weightChangeAlerts,
              setWeightChangeAlerts,
              'Get notified of significant weight changes',
              'weightChangeAlerts',
              theme.colors.success
            )}
          </Animatable.View>

          {renderSectionHeader('Appearance', 'palette')}
          <Animatable.View 
            animation="fadeIn" 
            delay={200} 
            style={[styles.section, { backgroundColor: theme.colors.surface }]}
          >
            {renderSettingItem(
              'theme-light-dark',
              'Dark Mode',
              isDarkMode,
              toggleTheme,
              'Switch between light and dark theme',
              'darkMode',
              theme.colors.accent
            )}
          </Animatable.View>

          {renderSectionHeader('About', 'information')}
          <Animatable.View 
            animation="fadeIn" 
            delay={300} 
            style={[styles.section, { backgroundColor: theme.colors.surface }]}
          >
            <TouchableOpacity 
              style={[styles.infoItem, { backgroundColor: theme.colors.surface }]}
              activeOpacity={0.7}
              onPress={() => {
                console.log('App Info button pressed');
                showInfoModal(
                  'App Information', 
                  'Version: 1.0.0\nBuild: 2024.1.0\nPlatform: React Native\nFramework: Expo SDK 53\n\nFeatures:\n• Nutrition tips\n• Exercise plans\n• Activity tracking\n• Progress monitoring\n• Daily reading goals\n• Motivational quotes\n\nCopyright: © 2024 Health & Motivation App'
                );
              }}
            >
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.info + '20' }]}>
                  <MaterialCommunityIcons name="information" size={24} color={theme.colors.info} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingTitle, { color: theme.colors.text }]}>App Information</Text>
                  <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>Version 1.0.0 • Build 2024.1.0</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.infoItem, { backgroundColor: theme.colors.surface }]}
              activeOpacity={0.7}
              onPress={() => {
                console.log('Developer Info button pressed');
                showInfoModal(
                  'Developer Information', 
                  'Developer: HealthTech Solutions\n\nTech Stack:\n• React Native with Expo\n• Node.js with Express\n• MongoDB\n\nContact:\n• Email: support@healthmotivation.app\n• Website: www.healthmotivation.app\n\nMessage: Thank you for using our app!'
                );
              }}
            >
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.success + '20' }]}>
                  <MaterialCommunityIcons name="account-hard-hat" size={24} color={theme.colors.success} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Developer Info</Text>
                  <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>HealthTech Solutions</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.infoItem, { backgroundColor: theme.colors.surface }]}
              activeOpacity={0.7}
              onPress={() => {
                console.log('Privacy & Terms button pressed');
                showInfoModal(
                  'Privacy & Terms', 
                  'Privacy Policy: Data collection and usage\n\nData Collection:\n• User profile\n• Activity logs\n• App usage statistics\n\nData Usage:\n• Personalization\n• App improvement\n• Health insights\n\nTerms of Service: Usage agreement\n\nBy using this app, you agree to our terms of service and privacy policy.'
                );
              }}
            >
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.warning + '20' }]}>
                  <MaterialCommunityIcons name="shield-check" size={24} color={theme.colors.warning} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Privacy & Terms</Text>
                  <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>Privacy policy and terms of service</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </Animatable.View>
        </ScrollView>
      </LinearGradient>
      {renderModal()}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 10,
    borderRadius: 10,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  section: {
    borderRadius: 15,
    padding: 5,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 5,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
    maxHeight: 300,
  },
  modalText: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen; 