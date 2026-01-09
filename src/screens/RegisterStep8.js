import React from 'react';
import { 
  View, Text, TouchableOpacity, Alert, StyleSheet, 
  ScrollView, SafeAreaView, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const RegisterStep8 = ({ navigation, formData, onNext, onBack }) => {
  const validateStep8 = () => {
    return true; // All validations are done in previous steps
  };

  const handleComplete = () => {
    if (validateStep8()) {
      onNext();
    }
  };

  const renderInfoRow = (label, value) => (
    <Animatable.View 
      animation="fadeInUp" 
      duration={500}
      style={styles.infoRow}
    >
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </Animatable.View>
  );

  const renderSection = (title, data) => (
    <Animatable.View 
      animation="fadeInUp" 
      duration={500}
      style={styles.section}
    >
      <Text style={styles.sectionTitle}>{title}</Text>
      {Object.entries(data).map(([key, value]) => (
        <View key={key} style={styles.infoRow}>
          <Text style={styles.infoLabel}>{key}</Text>
          <Text style={styles.infoValue}>{value || 'Not provided'}</Text>
        </View>
      ))}
    </Animatable.View>
  );

  const handleRegister = async () => {
    try {
      // Calculate BMI and other metrics
      const heightInMeters = formData.height / 100;
      const bmi = (formData.weight / (heightInMeters * heightInMeters)).toFixed(1);
      
      // Calculate recommended calories
      let bmr;
      if (formData.gender === 'male') {
        bmr = 10 * formData.weight + 6.25 * formData.height - 5 * formData.age + 5;
      } else {
        bmr = 10 * formData.weight + 6.25 * formData.height - 5 * formData.age - 161;
      }

      const activityMultipliers = {
        'Sedentary': 1.2,
        'Lightly Active': 1.375,
        'Moderately Active': 1.55,
        'Very Active': 1.725,
        'Extremely Active': 1.9
      };

      const recommendedCalories = Math.round(bmr * activityMultipliers[formData.activityLevel]);

      // Save user data
      const userData = {
        ...formData,
        bmi: parseFloat(bmi),
        recommendedCalories,
        registeredAt: new Date().toISOString()
      };

      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      // Show success message and then navigate to HomeScreen
      Alert.alert(
        'Registration Successful!',
        'Your account has been created successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('Tabs');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Failed to register. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#00d2b2', '#00b894', '#00a884']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animatable.View 
            animation="fadeInDown" 
            duration={1000}
            style={styles.header}
          >
            <Text style={styles.title}>Review Information</Text>
            <Text style={styles.subtitle}>Step 8: Confirm Your Details</Text>
          </Animatable.View>

          <View style={styles.form}>
            {renderSection('Basic Information', {
              'Username': formData.username,
              'Email': formData.email
            })}

            {renderSection('Physical Information', {
              'Age': `${formData.age} years`,
              'Gender': formData.gender,
              'Weight': `${formData.weight} kg`,
              'Height': `${formData.height} cm`
            })}

            {renderSection('Health Information', {
              'Blood Type': formData.bloodType,
              'Activity Level': formData.activityLevel,
              'Dietary Preference': formData.dietaryPreference,
              'Food Allergies': formData.foodAllergies
            })}

            {renderSection('Medical Information', {
              'Medical History': formData.medicalHistory,
              'Current Medications': formData.currentMedications
            })}
          </View>

          <View style={styles.buttonContainer}>
            <Animatable.View
              animation="fadeInLeft"
              duration={1000}
              delay={500}
            >
              <TouchableOpacity 
                style={[styles.button, styles.backButton]} 
                onPress={onBack}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </Animatable.View>

            <Animatable.View
              animation="fadeInRight"
              duration={1000}
              delay={500}
            >
              <TouchableOpacity 
                style={[styles.button, styles.nextButton]} 
                onPress={handleComplete}
                activeOpacity={0.8}
              >
                <Text style={styles.nextButtonText}>Complete</Text>
                <Ionicons name="checkmark" size={24} color="#3b5998" />
              </TouchableOpacity>
            </Animatable.View>
          </View>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 15,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  section: {
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  infoLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    flex: 1,
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 12,
    gap: 10,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  nextButtonText: {
    color: '#00b894',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RegisterStep8; 