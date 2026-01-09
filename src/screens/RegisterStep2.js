import React from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, 
  KeyboardAvoidingView, Platform, ScrollView, SafeAreaView,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Picker } from '@react-native-picker/picker';

const { width, height } = Dimensions.get('window');

const RegisterStep2 = ({ navigation, formData, updateFormData, onNext, onBack }) => {
  const validateStep2 = () => {
    if (!formData.age || isNaN(formData.age) || formData.age < 1 || formData.age > 120) {
      Alert.alert('Error', 'Please enter a valid age');
      return false;
    }
    if (!formData.weight || isNaN(formData.weight) || formData.weight < 1) {
      Alert.alert('Error', 'Please enter a valid weight');
      return false;
    }
    if (!formData.height || isNaN(formData.height) || formData.height < 1) {
      Alert.alert('Error', 'Please enter a valid height');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep2()) {
      onNext();
    }
  };

  const renderInputField = (label, field, options = {}) => (
    <Animatable.View 
      animation="fadeInUp" 
      duration={500}
      style={styles.inputContainer}
    >
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        {options.icon && (
          <MaterialCommunityIcons
            name={options.icon}
            size={24}
            color="rgba(255,255,255,0.7)"
            style={styles.inputIcon}
          />
        )}
        <TextInput
          style={styles.input}
          value={formData[field]}
          onChangeText={(text) => updateFormData(field, text)}
          placeholder={`Enter your ${label.toLowerCase()}`}
          placeholderTextColor="rgba(255,255,255,0.5)"
          keyboardType={options.keyboardType}
        />
      </View>
    </Animatable.View>
  );

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
              <Text style={styles.title}>Personal Details</Text>
              <Text style={styles.subtitle}>Step 2: Physical Information</Text>
            </Animatable.View>

            <View style={styles.form}>
              {renderInputField('Age', 'age', {
                icon: 'calendar',
                keyboardType: 'numeric'
              })}
              {renderPicker('Gender', 'gender', [
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
                { label: 'Other', value: 'other' }
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  input: {
    flex: 1,
    height: 40,
    color: '#fff',
    fontSize: 14,
    paddingHorizontal: 8,
  },
  inputIcon: {
    marginRight: 8,
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

export default RegisterStep2; 