import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, 
  KeyboardAvoidingView, Platform, ScrollView, SafeAreaView,
  ActivityIndicator, Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
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
  });
  const { register } = useAuth();

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep1 = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.username || formData.username.trim() === '') {
      Alert.alert('Error', 'Please enter a username');
      return false;
    }
    if (!formData.email || !emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    if (!formData.confirmPassword || formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.age || !formData.gender || !formData.weight || !formData.height) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }
    if (isNaN(formData.age) || formData.age < 1 || formData.age > 120) {
      Alert.alert('Error', 'Please enter a valid age between 1 and 120');
      return false;
    }
    if (isNaN(formData.weight) || formData.weight < 1 || formData.weight > 500) {
      Alert.alert('Error', 'Please enter a valid weight between 1 and 500 kg');
      return false;
    }
    if (isNaN(formData.height) || formData.height < 1 || formData.height > 300) {
      Alert.alert('Error', 'Please enter a valid height between 1 and 300 cm');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.bloodType) {
      Alert.alert('Error', 'Please select your blood type');
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    if (!formData.healthGoal) {
      Alert.alert('Error', 'Please select your health goal');
      return false;
    }
    return true;
  };

  const validateStep5 = () => {
    if (!formData.activityLevel) {
      Alert.alert('Error', 'Please select your activity level');
      return false;
    }
    return true;
  };

  const validateStep6 = () => {
    if (!formData.dietaryPreference) {
      Alert.alert('Error', 'Please select your dietary preference');
      return false;
    }
    return true;
  };

  const validateStep7 = () => {
    if (!formData.medicalHistory) {
      Alert.alert('Error', 'Please provide your medical history');
      return false;
    }
    return true;
  };

  const validateStep8 = () => {
    if (!formData.currentMedications) {
      Alert.alert('Error', 'Please provide information about your current medications');
      return false;
    }
    return true;
  };

  const validateProfile = () => {
    const requiredFields = {
      username: 'Username',
      email: 'Email',
      age: 'Age',
      gender: 'Gender',
      weight: 'Weight',
      height: 'Height',
      bloodType: 'Blood Type',
      healthGoal: 'Health Goal',
      activityLevel: 'Activity Level',
      dietaryPreference: 'Dietary Preference',
      medicalHistory: 'Medical History',
      currentMedications: 'Current Medications'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field] || formData[field].trim() === '') {
        Alert.alert('Error', `Please fill in your ${label}`);
        return false;
      }
    }

    // Validate numeric fields
    if (isNaN(formData.age) || formData.age < 1 || formData.age > 120) {
      Alert.alert('Error', 'Please enter a valid age between 1 and 120');
      return false;
    }
    if (isNaN(formData.weight) || formData.weight < 1 || formData.weight > 500) {
      Alert.alert('Error', 'Please enter a valid weight between 1 and 500 kg');
      return false;
    }
    if (isNaN(formData.height) || formData.height < 1 || formData.height > 300) {
      Alert.alert('Error', 'Please enter a valid height between 1 and 300 cm');
      return false;
    }

    return true;
  };

  const handleNext = async () => {
    try {
      setLoading(true);
      let isValid = false;
      
      switch (currentStep) {
        case 1:
          isValid = validateStep1();
          break;
        case 2:
          isValid = validateStep2();
          break;
        case 3:
          isValid = validateStep3();
          break;
        case 4:
          isValid = validateStep4();
          break;
        case 5:
          isValid = validateStep5();
          break;
        case 6:
          isValid = validateStep6();
          break;
        case 7:
          isValid = validateStep7();
          break;
        case 8:
          isValid = validateStep8();
          break;
      }

      if (isValid) {
        if (currentStep < 8) {
          setCurrentStep(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleRegister = async () => {
    if (!validateStep8() || !validateProfile()) {
      return;
    }

    try {
      setLoading(true);
      
      // Clear any existing user data
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('userProfile');
      
      // Register the user
      const result = await register({
        name: formData.username,
        email: formData.email,
        password: formData.password
      });

      if (!result.success) {
        Alert.alert('Error', result.error || 'Failed to register');
        return;
      }

      // Create user profile with all form data
      const userProfile = {
        username: formData.username,
        email: formData.email,
        age: parseInt(formData.age),
        gender: formData.gender,
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        bloodType: formData.bloodType,
        healthGoal: formData.healthGoal,
        activityLevel: formData.activityLevel,
        dietaryPreference: formData.dietaryPreference,
        dietaryRestrictions: formData.dietaryRestrictions || '',
        foodAllergies: formData.foodAllergies || '',
        medicalHistory: formData.medicalHistory,
        currentMedications: formData.currentMedications,
        registeredAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      // Store the profile data and user data
      await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
      await AsyncStorage.setItem('user', JSON.stringify({
        _id: result.data.user._id,
        name: formData.username,
        email: formData.email,
        isAdmin: result.data.user.isAdmin || false
      }));
      
      // Show success message and navigate
      Alert.alert(
        'Success',
        'Registration completed successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('Navigating to Main screen...');
              // Navigate to Main screen (which contains the HomeScreen)
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error during registration:', error);
      Alert.alert(
        'Registration Failed',
        'There was an error during registration. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Animatable.View animation="fadeIn" style={styles.stepContainer}>
            {renderInputField('Username', 'username', { icon: 'account' })}
            {renderInputField('Email', 'email', { 
              icon: 'email',
              keyboardType: 'email-address',
              autoCapitalize: 'none'
            })}
            {renderInputField('Password', 'password', { 
              icon: 'lock',
              secureTextEntry: !showPassword
            })}
            {renderInputField('Confirm Password', 'confirmPassword', { 
              icon: 'lock-check',
              secureTextEntry: !showPassword
            })}
            <TouchableOpacity 
              style={styles.showPasswordButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.showPasswordText}>
                {showPassword ? 'Hide Password' : 'Show Password'}
              </Text>
            </TouchableOpacity>
          </Animatable.View>
        );

      case 2:
        return (
          <Animatable.View animation="fadeIn" style={styles.stepContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Personal Details</Text>
              <Text style={styles.subtitle}>Step 2: Physical Information</Text>
            </View>

            <View style={styles.form}>
              {renderInputField('Age', 'age', {
                icon: 'calendar',
                keyboardType: 'numeric'
              })}
              {renderPicker('Gender', 'gender', [
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' }
              ])}
              {renderInputField('Weight (kg)', 'weight', {
                icon: 'scale',
                keyboardType: 'numeric'
              })}
              {renderInputField('Height (cm)', 'height', {
                icon: 'human-male-height',
                keyboardType: 'numeric'
              })}
            </View>
          </Animatable.View>
        );

      case 3:
        return (
          <Animatable.View animation="fadeIn" style={styles.stepContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Health Information</Text>
              <Text style={styles.subtitle}>Step 3: Blood Type</Text>
            </View>

            <View style={styles.form}>
              {renderPicker('Blood Type', 'bloodType', [
                { label: 'A+', value: 'A+' },
                { label: 'A-', value: 'A-' },
                { label: 'B+', value: 'B+' },
                { label: 'B-', value: 'B-' },
                { label: 'AB+', value: 'AB+' },
                { label: 'AB-', value: 'AB-' },
                { label: 'O+', value: 'O+' },
                { label: 'O-', value: 'O-' }
              ])}
            </View>
          </Animatable.View>
        );

      case 4:
        return (
          <Animatable.View animation="fadeIn" style={styles.stepContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Health Goals</Text>
              <Text style={styles.subtitle}>Step 4: Select Your Goal</Text>
            </View>

            <View style={styles.form}>
              {renderPicker('Health Goal', 'healthGoal', [
                { label: 'Weight Loss', value: 'weight_loss' },
                { label: 'Muscle Gain', value: 'muscle_gain' },
                { label: 'Maintenance', value: 'maintenance' },
                { label: 'General Health', value: 'general_health' },
                { label: 'Sports Performance', value: 'sports_performance' }
              ])}
            </View>
          </Animatable.View>
        );

      case 5:
        return (
          <Animatable.View animation="fadeIn" style={styles.stepContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Activity Level</Text>
              <Text style={styles.subtitle}>Step 5: How Active Are You?</Text>
            </View>

            <View style={styles.form}>
              {renderPicker('Activity Level', 'activityLevel', [
                { label: 'Sedentary', value: 'sedentary' },
                { label: 'Lightly Active', value: 'lightly_active' },
                { label: 'Moderately Active', value: 'moderately_active' },
                { label: 'Very Active', value: 'very_active' },
                { label: 'Extremely Active', value: 'extremely_active' }
              ])}
            </View>
          </Animatable.View>
        );

      case 6:
        return (
          <Animatable.View animation="fadeIn" style={styles.stepContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Dietary Preferences</Text>
              <Text style={styles.subtitle}>Step 6: Food Preferences</Text>
            </View>

            <View style={styles.form}>
              {renderPicker('Dietary Preference', 'dietaryPreference', [
                { label: 'Vegetarian', value: 'vegetarian' },
                { label: 'Vegan', value: 'vegan' },
                { label: 'Pescatarian', value: 'pescatarian' },
                { label: 'Omnivore', value: 'omnivore' },
                { label: 'Keto', value: 'keto' },
                { label: 'Paleo', value: 'paleo' }
              ])}
              {renderInputField('Dietary Restrictions', 'dietaryRestrictions', {
                multiline: true,
                numberOfLines: 3
              })}
            </View>
          </Animatable.View>
        );

      case 7:
        return (
          <Animatable.View animation="fadeIn" style={styles.stepContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Medical History</Text>
              <Text style={styles.subtitle}>Step 7: Health Background</Text>
            </View>

            <View style={styles.form}>
              {renderInputField('Medical History', 'medicalHistory', {
                multiline: true,
                numberOfLines: 3
              })}
              {renderInputField('Food Allergies', 'foodAllergies', {
                multiline: true,
                numberOfLines: 3
              })}
            </View>
          </Animatable.View>
        );

      case 8:
        return (
          <Animatable.View animation="fadeIn" style={styles.stepContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Current Medications</Text>
              <Text style={styles.subtitle}>Step 8: Final Information</Text>
            </View>

            <View style={styles.form}>
              {renderInputField('Current Medications', 'currentMedications', {
                multiline: true,
                numberOfLines: 3
              })}
            </View>
          </Animatable.View>
        );

      default:
        return null;
    }
  };

  const renderInputField = (label, field, options = {}) => (
    <Animatable.View 
      animation="fadeInUp" 
      duration={500}
      style={styles.inputContainer}
    >
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        {options.icon && (
          <MaterialCommunityIcons
            name={options.icon}
            size={24}
            color="#4CAF50"
            style={styles.inputIcon}
          />
        )}
        <TextInput
          style={styles.input}
          value={formData[field]}
          onChangeText={(text) => updateFormData(field, text)}
          placeholder={`Enter your ${label.toLowerCase()}`}
          placeholderTextColor="rgba(26, 26, 46, 0.5)"
          secureTextEntry={options.secureTextEntry}
          keyboardType={options.keyboardType}
          autoCapitalize={options.autoCapitalize}
          multiline={options.multiline}
          numberOfLines={options.numberOfLines}
        />
        {field === 'password' && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color="#4CAF50"
            />
          </TouchableOpacity>
        )}
      </View>
    </Animatable.View>
  );

  const renderPicker = (label, field, items) => (
    <Animatable.View 
      animation="fadeInUp" 
      duration={500}
      style={styles.pickerContainer}
    >
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={formData[field]}
          onValueChange={(value) => updateFormData(field, value)}
          style={styles.picker}
          dropdownIconColor="rgba(44, 62, 80, 0.7)"
        >
          <Picker.Item label={`Select ${label}`} value="" />
          {items.map((item) => (
            <Picker.Item
              key={item.value}
              label={item.label}
              value={item.value}
            />
          ))}
        </Picker>
      </View>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#A8E6CF', '#81C784', '#66BB6A']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <TouchableOpacity
                style={[styles.backButton, { pointerEvents: 'auto' }]}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Registration</Text>
              <TouchableOpacity
                style={[styles.backButton, { pointerEvents: 'auto' }]}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Login</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(currentStep / 8) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>Step {currentStep} of 8</Text>
            </View>

            <View style={styles.stepContentWrapper}>
              {renderStep()}
            </View>

            <View style={styles.buttonContainer}>
              {currentStep > 1 && (
                <TouchableOpacity
                  style={[styles.button, styles.backButton, { pointerEvents: 'auto' }]}
                  onPress={handleBack}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.button, styles.nextButton, { pointerEvents: 'auto' }]}
                onPress={currentStep === 8 ? handleRegister : handleNext}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {currentStep === 8 ? 'Register' : 'Next'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#81C784',
  },
  gradient: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 24,
    height: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    marginHorizontal: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  progressText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  stepContainer: {
    flex: 1,
  },
  stepContentWrapper: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textShadow: '1px 1px 3px rgba(0, 0, 0, 0.3)',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 5,
  },
  form: {
    gap: 12,
    paddingHorizontal: 15,
  },
  inputContainer: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  inputLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    flex: 1,
    minHeight: 40,
    color: '#1a1a2e',
    fontSize: 16,
    paddingHorizontal: 8,
    fontWeight: '500',
    textAlignVertical: 'top',
  },
  inputIcon: {
    marginRight: 12,
    color: '#4CAF50',
  },
  eyeIcon: {
    padding: 8,
  },
  pickerContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  pickerWrapper: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  picker: {
    height: 50,
    color: '#1a1a2e',
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 45,
    borderRadius: 10,
    gap: 8,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  showPasswordButton: {
    alignItems: 'center',
  },
  showPasswordText: {
    color: '#fff',
    fontSize: 12,
  }
});

export default RegisterScreen; 