import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Image,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CommonActions } from '@react-navigation/native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { logout, setNavigation, isAdmin } = useAuth();
  const defaultProfile = {
    username: '',
    email: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
    bloodType: '',
    healthGoal: '',
    activityLevel: '',
    dietaryPreference: '',
    dietaryRestrictions: '',
    foodAllergies: '',
    medicalHistory: '',
    currentMedications: ''
  };
  const [profile, setProfile] = useState(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bmi, setBmi] = useState(null);
  const [bmiCategory, setBmiCategory] = useState('');

  useEffect(() => {
    loadProfile();
    // Set navigation in AuthContext
    console.log('ProfileScreen: Setting navigation in AuthContext');
    setNavigation(navigation);
  }, [navigation]);

  const loadProfile = async () => {
    try {
      let base = await AsyncStorage.getItem('userProfile');
      let merged = { ...defaultProfile };
      if (base) {
        try {
          merged = { ...merged, ...JSON.parse(base) };
        } catch {}
      }
      // Attempt to find any per-user profile and merge
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        const profileKeys = allKeys.filter(k => k.startsWith('userProfile_'));
        const candidates = [
          merged.email,
          merged.username,
          merged.username ? merged.username.replace(/\s+/g, '.').toLowerCase() : undefined,
          merged.username ? merged.username.replace(/\s+/g, '_').toLowerCase() : undefined,
        ].filter(Boolean);
        for (const key of profileKeys) {
          const raw = await AsyncStorage.getItem(key);
          if (!raw) continue;
          const prof = JSON.parse(raw);
          const pUser = (prof?.username || '').toString();
          const pEmail = (prof?.email || '').toString();
          const pUserDot = pUser.replace(/\s+/g, '.').toLowerCase();
          const pUserUnd = pUser.replace(/\s+/g, '_').toLowerCase();
          const profCandidates = [pUser, pEmail, pUserDot, pUserUnd];
          const match = profCandidates.some(v => candidates.includes(v));
          if (match) {
            merged = { ...merged, ...prof };
            break;
          }
        }
      } catch {}

      setProfile(merged);
      calculateBMI(merged.weight, merged.height);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const calculateBMI = (weight, height) => {
    if (weight && height) {
      const numericWeight = parseFloat(weight);
      const numericHeight = parseFloat(height);
      if (!isNaN(numericWeight) && !isNaN(numericHeight) && numericHeight > 0) {
        const heightInMeters = numericHeight / 100;
        const bmiValue = (numericWeight / (heightInMeters * heightInMeters)).toFixed(1);
      setBmi(bmiValue);
      
      if (bmiValue < 18.5) setBmiCategory('Underweight');
      else if (bmiValue < 25) setBmiCategory('Normal');
      else if (bmiValue < 30) setBmiCategory('Overweight');
      else setBmiCategory('Obese');
      }
    }
  };

  const saveProfile = async () => {
    try {
      const cleaned = { ...defaultProfile, ...profile };
      await AsyncStorage.setItem('userProfile', JSON.stringify(cleaned));
      // Also persist to a per-user key for resilient reloads
      try {
        const perUserKey = `userProfile_${cleaned.email || cleaned.username || cleaned._id || 'local'}`;
        await AsyncStorage.setItem(perUserKey, JSON.stringify(cleaned));
      } catch {}
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Logout button pressed');
      setLoading(true);
      await logout();
      console.log('Logout completed successfully');
      // Hard reset to Welcome to ensure fresh unauthenticated stack
      navigation.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'Welcome' }] })
      );
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert(
        'Logout Failed',
        'There was an error logging out. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const renderProfileHeader = () => (
    <Animatable.View animation="fadeIn" style={styles.header}>
      <LinearGradient
        colors={['#1a2a6c', '#b21f1f', '#fdbb2d']}
        style={styles.headerGradient}
      >
        <View style={styles.profileContent}>
          <View style={styles.profileImageContainer}>
            <MaterialCommunityIcons name="account-circle" size={100} color="#fff" />
          </View>
          <Text style={styles.username}>{profile.username || 'User'}</Text>
          <Text style={styles.email}>{profile.email || 'No email set'}</Text>
        </View>
      </LinearGradient>
    </Animatable.View>
  );

  const renderBMICard = () => (
    <Animatable.View animation="fadeInUp" delay={200} style={styles.bmiCard}>
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.bmiGradient}
      >
        <View style={styles.bmiContent}>
          <Text style={styles.bmiLabel}>Your BMI</Text>
          <Text style={styles.bmiValue}>{bmi || 'N/A'}</Text>
          <Text style={styles.bmiCategory}>{bmiCategory || 'Not calculated'}</Text>
        </View>
      </LinearGradient>
    </Animatable.View>
  );

  const renderProfileSection = (title, data) => (
    <Animatable.View animation="fadeInUp" delay={300} style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {Object.entries(data).map(([key, value]) => (
          <View key={key} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{key.replace(/([A-Z])/g, ' $1').trim()}</Text>
            <Text style={styles.infoValue}>{value || 'Not set'}</Text>
          </View>
        ))}
      </View>
    </Animatable.View>
  );

  const renderEditModal = () => (
    <Modal
      visible={isEditing}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsEditing(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={() => setIsEditing(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScroll}>
            {Object.entries(profile).map(([key, value]) => (
              <View key={key} style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Text>
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={(text) => setProfile({ ...profile, [key]: text })}
                  placeholder={`Enter your ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  const renderAdminButton = () => {
    if (isAdmin()) {
      return (
        <TouchableOpacity
          style={styles.adminButton}
          onPress={() => navigation.navigate('AdminAccess')}
        >
          <MaterialCommunityIcons name="shield-account" size={24} color="#fff" />
          <Text style={styles.adminButtonText}>Admin Dashboard</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a2a6c" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderProfileHeader()}
        {renderBMICard()}
        
        {renderProfileSection('Personal Information', {
          Age: profile.age,
          Gender: profile.gender,
          'Blood Type': profile.bloodType,
          Weight: `${profile.weight} kg`,
          Height: `${profile.height} cm`
        })}

        {renderProfileSection('Health & Fitness', {
          'Health Goal': profile.healthGoal,
          'Activity Level': profile.activityLevel,
          'Dietary Preference': profile.dietaryPreference
        })}

        {renderProfileSection('Medical Information', {
          'Dietary Restrictions': profile.dietaryRestrictions,
          'Food Allergies': profile.foodAllergies,
          'Medical History': profile.medicalHistory,
          'Current Medications': profile.currentMedications
        })}

        <View style={styles.buttonContainer}>
          {renderAdminButton()}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <MaterialCommunityIcons name="account-edit" size={24} color="#fff" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <MaterialCommunityIcons name="logout" size={24} color="#fff" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {renderEditModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    height: 200,
    marginBottom: 20,
  },
  headerGradient: {
    flex: 1,
  },
  profileContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  profileImageContainer: {
    marginBottom: 10,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  bmiCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  bmiGradient: {
    padding: 20,
  },
  bmiContent: {
    alignItems: 'center',
  },
  bmiLabel: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 5,
  },
  bmiValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  bmiCategory: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a2a6c',
    marginBottom: 15,
  },
  sectionContent: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#1a2a6c',
    fontWeight: '500',
  },
  buttonContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
    gap: 10,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#1a2a6c',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalScroll: {
    maxHeight: '80%',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 10,
    color: '#fff',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C3E50',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  adminButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ProfileScreen;
