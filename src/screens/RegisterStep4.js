import React from 'react';
import { 
  View, Text, TouchableOpacity, Alert, StyleSheet, 
  KeyboardAvoidingView, Platform, ScrollView, SafeAreaView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Picker } from '@react-native-picker/picker';

const { width, height } = Dimensions.get('window');

const RegisterStep4 = ({ navigation, formData, updateFormData, onNext, onBack }) => {
  const validateStep4 = () => {
    if (!formData.activityLevel) {
      Alert.alert('Error', 'Please select your activity level');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep4()) {
      onNext();
    }
  };

  const renderPicker = (label, field, items) => (
    <Animatable.View 
      animation="fadeInUp" 
      duration={500}
      style={styles.inputContainer}
    >
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={formData[field]}
          onValueChange={(value) => updateFormData(field, value)}
          style={styles.picker}
          dropdownIconColor="rgba(255,255,255,0.7)"
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
        colors={['#00d2b2', '#00b894', '#00a884']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
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
              <Text style={styles.title}>Activity Level</Text>
              <Text style={styles.subtitle}>Step 4: How active are you?</Text>
            </Animatable.View>

            <View style={styles.form}>
              {renderPicker('Activity Level', 'activityLevel', [
                { 
                  label: 'Sedentary (little or no exercise)', 
                  value: 'sedentary' 
                },
                { 
                  label: 'Lightly Active (light exercise 1-3 days/week)', 
                  value: 'lightly_active' 
                },
                { 
                  label: 'Moderately Active (moderate exercise 3-5 days/week)', 
                  value: 'moderately_active' 
                },
                { 
                  label: 'Very Active (hard exercise 6-7 days/week)', 
                  value: 'very_active' 
                },
                { 
                  label: 'Extra Active (very hard exercise & physical job)', 
                  value: 'extra_active' 
                }
              ])}
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
                  onPress={handleNext}
                  activeOpacity={0.8}
                >
                  <Text style={styles.nextButtonText}>Next</Text>
                  <Ionicons name="arrow-forward" size={24} color="#3b5998" />
                </TouchableOpacity>
              </Animatable.View>
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
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    color: '#fff',
    marginBottom: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  pickerContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  picker: {
    height: 50,
    color: '#fff',
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

export default RegisterStep4; 