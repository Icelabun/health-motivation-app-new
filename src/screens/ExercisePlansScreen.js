import React, { useEffect, useState } from 'react';
import { 
  View, Text, Alert, TouchableOpacity, StyleSheet, Linking, 
  ScrollView, Dimensions, Platform, SafeAreaView, ActivityIndicator,
  TextInput, KeyboardAvoidingView
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;
const isDesktop = width >= 1024;

const ExercisePlansScreen = () => {
  const { user } = useAuth();
  const [bmi, setBmi] = useState(null);
  const [bmiMessage, setBmiMessage] = useState('');
  const [exercisePlan, setExercisePlan] = useState([]);
  const [bmiCategory, setBmiCategory] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [showInputs, setShowInputs] = useState(true);

  // Get user-specific storage key
  const getExerciseDataKey = () => {
    if (!user) return null;
    const userId = user._id || user.id || user.email || user.username || 'anonymous';
    return `exerciseData_${userId}`;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Always reset state when component mounts or user changes
        setBmi(null);
        setBmiMessage('');
        setExercisePlan([]);
        setBmiCategory('');
        setWeight('');
        setHeight('');
        setShowInputs(true);

        // If no user is logged in, show empty inputs
        if (!user) {
          setShowInputs(true);
          return;
        }

        const exerciseDataKey = getExerciseDataKey();
        if (!exerciseDataKey) {
          setShowInputs(true);
          return;
        }

        // Try to load user-specific exercise data
        const savedData = await AsyncStorage.getItem(exerciseDataKey);
        
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            const savedWeight = parsedData.weight;
            const savedHeight = parsedData.height;

            // Validate that we have valid data
            if (savedWeight && savedHeight) {
              setWeight(savedWeight.toString());
              setHeight(savedHeight.toString());
              calculateBMI(parseFloat(savedWeight), parseFloat(savedHeight));
              setShowInputs(false);
            } else {
              // Invalid or incomplete data - show inputs
              setShowInputs(true);
            }
          } catch (parseError) {
            console.error('Error parsing exercise data:', parseError);
            // Corrupted data - show inputs
            setShowInputs(true);
          }
        } else {
          // No data for this user - show empty inputs
          setShowInputs(true);
        }
      } catch (error) {
        console.error('Error fetching user exercise data:', error);
        // On error, show inputs so user can enter data
        setShowInputs(true);
      }
    };

    fetchUserData();
  }, [user]); // Re-run when user changes

  const handleCalculateBMI = () => {
    if (!weight || !height) {
      Alert.alert('Error', 'Please enter both weight and height');
      return;
    }

    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (isNaN(weightNum) || isNaN(heightNum)) {
      Alert.alert('Error', 'Please enter valid numbers');
      return;
    }

    if (weightNum <= 0 || heightNum <= 0) {
      Alert.alert('Error', 'Weight and height must be greater than 0');
      return;
    }

    // Calculate and display BMI
    calculateBMI(weightNum, heightNum);
    
    // Save data if user is logged in
    if (user) {
      saveUserData(weightNum, heightNum);
    }
    
    setShowInputs(false);
  };

  const saveUserData = async (weight, height) => {
    try {
      // Ensure user is logged in before saving
      if (!user) {
        console.error('Cannot save exercise data: No user logged in');
        return;
      }

      const exerciseDataKey = getExerciseDataKey();
      if (!exerciseDataKey) {
        console.error('Cannot save exercise data: Invalid user ID');
        return;
      }

      // Save user-specific exercise data
      const exerciseData = {
        weight: weight,
        height: height,
        savedAt: new Date().toISOString()
      };

      await AsyncStorage.setItem(exerciseDataKey, JSON.stringify(exerciseData));
    } catch (error) {
      console.error('Error saving user exercise data:', error);
      Alert.alert('Error', 'Failed to save your exercise data. Please try again.');
    }
  };

  const calculateBMI = (weight, height) => {
    const heightInMeters = height / 100;
    const calculatedBmi = weight / (heightInMeters * heightInMeters);
    setBmi(calculatedBmi.toFixed(2));

    let message = '';
    let category = '';
    if (calculatedBmi < 18.5) {
      message = 'Underweight: Focus on muscle-building exercises!';
      category = 'underweight';
    } else if (calculatedBmi < 24.9) {
      message = 'Healthy Weight! Maintain a balanced routine.';
      category = 'healthy';
    } else if (calculatedBmi < 29.9) {
      message = 'Overweight: Cardio and fat-burning workouts recommended!';
      category = 'overweight';
    } else {
      message = 'Obese: Low-impact workouts & a proper diet suggested!';
      category = 'obese';
    }
    setBmiMessage(message);
    setBmiCategory(category);
    generateExercisePlan(category);
  };

  const generateExercisePlan = (category) => {
    const plans = {
      underweight: [
        { 
          name: 'Weight Training', 
          icon: 'dumbbell', 
          videoUrl: 'https://youtu.be/6gKaoPofs6k', 
          description: 'Build muscle mass safely with proper form and technique'
        },
        { 
          name: 'Squats', 
          icon: 'human-handsup', 
          videoUrl: 'https://youtu.be/DGhHgiCfAb0', 
          description: 'Strengthen your legs and core with proper squat form'
        },
        { 
          name: 'Deadlifts', 
          icon: 'weight-lifter', 
          videoUrl: 'https://youtu.be/XxWcirHIwVo', 
          description: 'Full-body strength exercise for overall muscle development'
        },
      ],
      healthy: [
        { 
          name: 'Pilates', 
          icon: 'spa', 
          videoUrl: 'https://youtu.be/G16eeqO2U7g', 
          description: 'Improve flexibility and core strength with Pilates'
        },
        { 
          name: 'Cycling', 
          icon: 'bike', 
          videoUrl: 'https://youtu.be/ewrf_rCHUdA', 
          description: 'Great cardio workout for legs and endurance'
        },
        { 
          name: 'HIIT Workout', 
          icon: 'run-fast', 
          videoUrl: 'https://youtu.be/M0uO8X3_tEA', 
          description: 'High-intensity interval training for maximum results'
        },
      ],
      overweight: [
        { 
          name: 'Jump Rope', 
          icon: 'jump-rope', 
          videoUrl: 'https://youtu.be/DTdaiqR9now', 
          description: 'Effective cardio exercise for burning calories'
        },
        { 
          name: 'Swimming', 
          icon: 'swim', 
          videoUrl: 'https://youtu.be/ey6QwWAkA0A', 
          description: 'Low-impact, full-body workout in water'
        },
      ],
      obese: [
        { 
          name: 'Walking', 
          icon: 'walk', 
          videoUrl: 'https://youtu.be/enYITYwvPAQ', 
          description: 'Gentle, effective movement for beginners'
        },
        { 
          name: 'Water Aerobics', 
          icon: 'waves', 
          videoUrl: 'https://youtu.be/bAaREL8vC4I', 
          description: 'Low-impact, joint-friendly water exercises'
        },
      ],
    };
    setExercisePlan(plans[category]);
  };

  const openVideo = (url) => {
    Linking.openURL(url);
  };

  const getBmiColor = (category) => {
    switch (category) {
      case 'underweight':
        return '#FFA726';
      case 'healthy':
        return '#4CAF50';
      case 'overweight':
        return '#FF7043';
      case 'obese':
        return '#F44336';
      default:
        return '#2E7D32';
    }
  };

  const renderInputFields = () => (
    <Animatable.View 
      animation="fadeInUp"
      style={styles.inputContainer}
    >
      <Text style={styles.inputTitle}>Welcome! Let's Get Started</Text>
      <Text style={styles.inputSubtitle}>
        Enter your weight and height to get personalized exercise plans
      </Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Weight (kg)</Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          placeholder="Enter weight in kg"
          placeholderTextColor="rgba(255,255,255,0.5)"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Height (cm)</Text>
        <TextInput
          style={styles.input}
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
          placeholder="Enter height in cm"
          placeholderTextColor="rgba(255,255,255,0.5)"
        />
      </View>

      <TouchableOpacity 
        style={styles.calculateButton}
        onPress={handleCalculateBMI}
      >
        <Text style={styles.calculateButtonText}>Get My Exercise Plan</Text>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#2E7D32', '#1B5E20', '#003300']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            <Animatable.View 
              animation="fadeIn"
              style={styles.headerContainer}
            >
              <MaterialCommunityIcons 
                name="dumbbell" 
                size={isTablet ? 50 : 40} 
                color="#fff" 
                style={styles.headerIcon}
              />
              <Text style={styles.header}>Your Personalized Exercise Plan</Text>
            </Animatable.View>

            {showInputs ? (
              renderInputFields()
            ) : (
              <View style={styles.contentContainer}>
                {bmi && (
                  <Animatable.View 
                    animation="fadeInUp"
                    duration={1000}
                    style={[
                      styles.bmiContainer,
                      { backgroundColor: getBmiColor(bmiCategory) }
                    ]}
                  >
                    <View style={styles.bmiContent}>
                      <Text style={styles.bmiLabel}>Your BMI</Text>
                      <Text style={styles.bmiValue}>{bmi}</Text>
                      <Text style={styles.bmiMessage}>{bmiMessage}</Text>
                    </View>
                  </Animatable.View>
                )}

                {exercisePlan.length > 0 && (
                  <Animatable.View 
                    animation="fadeInUp"
                    delay={400}
                    style={styles.exerciseContainer}
                  >
                    <Text style={styles.exTitle}>Recommended Exercises</Text>
                    <View style={styles.exerciseGrid}>
                      {exercisePlan.map((exercise, index) => (
                        <Animatable.View
                          key={index}
                          animation="zoomIn"
                          delay={index * 200}
                          style={styles.card}
                        >
                          <LinearGradient
                            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                            style={styles.cardGradient}
                          >
                            <View style={styles.cardIconContainer}>
                              <MaterialCommunityIcons 
                                name={exercise.icon} 
                                size={isTablet ? 40 : 30} 
                                color="#fff" 
                              />
                            </View>
                            <View style={styles.cardContent}>
                              <Text style={styles.exerciseText}>{exercise.name}</Text>
                              <Text style={styles.exerciseDesc}>{exercise.description}</Text>
                            </View>
                            <TouchableOpacity 
                              style={styles.cardButton}
                              onPress={() => openVideo(exercise.videoUrl)}
                            >
                              <Ionicons name="play-circle" size={isTablet ? 32 : 24} color="#fff" />
                              <Text style={styles.cardButtonText}>Watch</Text>
                            </TouchableOpacity>
                          </LinearGradient>
                        </Animatable.View>
                      ))}
                    </View>
                  </Animatable.View>
                )}

                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => {
                    // Reset all calculation results
                    setBmi(null);
                    setBmiMessage('');
                    setExercisePlan([]);
                    setBmiCategory('');
                    // Show input form (keep weight/height values so user can edit them)
                    setShowInputs(true);
                  }}
                >
                  <Text style={styles.editButtonText}>Edit Measurements</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    minHeight: Dimensions.get('window').height,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: isTablet ? 30 : 20,
    paddingBottom: isTablet ? 40 : 20,
    maxWidth: isDesktop ? 1200 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    maxWidth: isDesktop ? 1200 : '100%',
    alignSelf: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isTablet ? 30 : 20,
    justifyContent: 'center',
    width: '100%',
  },
  headerIcon: {
    marginRight: 10,
  },
  header: {
    fontSize: isTablet ? 32 : 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  inputContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: isTablet ? 30 : 20,
    marginBottom: 20,
    maxWidth: isDesktop ? 600 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  inputTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  inputSubtitle: {
    fontSize: isTablet ? 18 : 16,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    opacity: 0.9,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: isTablet ? 18 : 16,
    color: '#fff',
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    padding: isTablet ? 20 : 15,
    color: '#fff',
    fontSize: isTablet ? 18 : 16,
  },
  calculateButton: {
    backgroundColor: '#4CAF50',
    padding: isTablet ? 20 : 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
  },
  bmiContainer: {
    borderRadius: 20,
    padding: isTablet ? 30 : 20,
    marginBottom: 20,
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  bmiContent: {
    alignItems: 'center',
  },
  bmiLabel: {
    fontSize: isTablet ? 18 : 16,
    color: '#fff',
    opacity: 0.8,
  },
  bmiValue: {
    fontSize: isTablet ? 48 : 36,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 5,
  },
  bmiMessage: {
    fontSize: isTablet ? 18 : 16,
    color: '#fff',
    textAlign: 'center',
  },
  exerciseContainer: {
    marginTop: 20,
  },
  exTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  exerciseGrid: {
    flexDirection: isDesktop ? 'row' : 'column',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
    width: '100%',
  },
  card: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    width: isDesktop ? 'calc(50% - 15px)' : '100%',
    maxWidth: isDesktop ? 600 : '100%',
  },
  cardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: isTablet ? 20 : 15,
  },
  cardIconContainer: {
    width: isTablet ? 60 : 50,
    height: isTablet ? 60 : 50,
    borderRadius: isTablet ? 30 : 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
  },
  exerciseText: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  exerciseDesc: {
    fontSize: isTablet ? 16 : 14,
    color: '#fff',
    opacity: 0.8,
  },
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: isTablet ? 12 : 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  cardButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: isTablet ? 20 : 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    maxWidth: isDesktop ? 300 : '100%',
    alignSelf: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
  },
});

export default ExercisePlansScreen;
