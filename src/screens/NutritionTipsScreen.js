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

const { width } = Dimensions.get('window');

const NutritionTipsScreen = () => {
  const { user } = useAuth();
  const [bmi, setBmi] = useState(null);
  const [bmiMessage, setBmiMessage] = useState('');
  const [nutritionTips, setNutritionTips] = useState([]);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmiCategory, setBmiCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInputs, setShowInputs] = useState(true);

  // Get user-specific storage key
  const getNutritionDataKey = () => {
    if (!user) return null;
    const userId = user._id || user.id || user.email || user.username || 'anonymous';
    return `nutritionData_${userId}`;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Always reset state when component mounts or user changes
        setBmi(null);
        setBmiMessage('');
        setNutritionTips([]);
        setBmiCategory('');
        setWeight('');
        setHeight('');
        setShowInputs(true);

        // If no user is logged in, show empty inputs
        if (!user) {
          setShowInputs(true);
          return;
        }

        const nutritionDataKey = getNutritionDataKey();
        if (!nutritionDataKey) {
          setShowInputs(true);
          return;
        }

        // Try to load user-specific nutrition data
        const savedData = await AsyncStorage.getItem(nutritionDataKey);
        
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
            console.error('Error parsing nutrition data:', parseError);
            // Corrupted data - show inputs
            setShowInputs(true);
          }
        } else {
          // No data for this user - show empty inputs
          setShowInputs(true);
        }
      } catch (error) {
        console.error('Error fetching user nutrition data:', error);
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
        console.error('Cannot save nutrition data: No user logged in');
        return;
      }

      const nutritionDataKey = getNutritionDataKey();
      if (!nutritionDataKey) {
        console.error('Cannot save nutrition data: Invalid user ID');
        return;
      }

      // Save user-specific nutrition data
      const nutritionData = {
        weight: weight,
        height: height,
        savedAt: new Date().toISOString()
      };

      await AsyncStorage.setItem(nutritionDataKey, JSON.stringify(nutritionData));
    } catch (error) {
      console.error('Error saving user nutrition data:', error);
      Alert.alert('Error', 'Failed to save your nutrition data. Please try again.');
    }
  };

  const calculateBMI = (weight, height) => {
    const heightInMeters = height / 100;
    const calculatedBmi = weight / (heightInMeters * heightInMeters);
    setBmi(calculatedBmi.toFixed(2));

    let message = '';
    let category = '';
    if (calculatedBmi < 18.5) {
      message = 'Underweight: Focus on healthy eating with calorie-dense foods!';
      category = 'underweight';
    } else if (calculatedBmi < 24.9) {
      message = 'Healthy Weight! Maintain a balanced diet!';
      category = 'healthy';
    } else if (calculatedBmi < 29.9) {
      message = 'Overweight: Focus on portion control and nutrient-rich foods!';
      category = 'overweight';
    } else {
      message = 'Obese: Focus on a calorie-controlled diet with healthy options!';
      category = 'obese';
    }
    setBmiMessage(message);
    setBmiCategory(category);
    generateNutritionTips(category);
  };

  const generateNutritionTips = (category) => {
    const tips = {
      underweight: [
        { 
          name: '🥑 Avocados for Healthy Fats', 
          videoUrl: 'https://youtu.be/0R5km8AQGlI?si=5RnyMRfvVbvv4a14',
          icon: 'food-apple',
          description: 'Learn how to incorporate healthy fats into your diet'
        },
        { 
          name: '🍗 Chicken Breast for Protein', 
          videoUrl: 'https://youtu.be/Wle1rLCQvuM?si=pAgdiFOmjdCzeWqn',
          icon: 'food-drumstick',
          description: 'High-protein meal ideas for muscle gain'
        },
        { 
          name: '🥙 High-Calorie Smoothies', 
          videoUrl: 'https://youtu.be/fgBlhfqxx2Y?si=LIu4G5M8QDyorC7z',
          icon: 'cup-water',
          description: 'Nutrient-dense smoothie recipes'
        },
      ],
      healthy: [
        { 
          name: '🥗 Mediterranean Diet', 
          videoUrl: 'https://youtu.be/SMsy_XuofMo?si=PW4aaPSejZ9Q6qMZ',
          icon: 'food-fork-drink',
          description: 'Balanced eating for optimal health'
        },
        { 
          name: '🍇 Fruits and Vegetables', 
          videoUrl: 'https://youtu.be/hAlH6HgeIdc?si=O7TJyUOfGCUASgFG',
          icon: 'food-apple',
          description: 'Boost your immunity naturally'
        },
        { 
          name: '🥘 Balanced Meal Plan', 
          videoUrl: 'https://youtu.be/81G22t2UHxA?si=dAvnp9E_EHFiOgD-',
          icon: 'food-variant',
          description: 'Create your perfect meal plan'
        },
      ],
      overweight: [
        { 
          name: '🍅 Low-Calorie Meals', 
          videoUrl: 'https://youtu.be/7fAfF5sf-Ok?si=VJAKOXtWBwjKI5Vl',
          icon: 'food',
          description: 'Delicious low-calorie recipes'
        },
        { 
          name: '🥒 High-Fiber Foods', 
          videoUrl: 'https://youtu.be/05YZ_9xW0i0?si=Xedr7wYfTOtJLGts',
          icon: 'food-variant',
          description: 'Fiber-rich foods for satiety'
        },
      ],
      obese: [
        { 
          name: '🍳 High-Protein Meals', 
          videoUrl: 'https://youtu.be/wDS3V65ym98?si=pDvvs6s4SuXEfFye',
          icon: 'food-steak',
          description: 'Protein-packed meal ideas'
        },
        { 
          name: '🥗 Detox and Cleanse', 
          videoUrl: 'https://youtube.com/shorts/wXaVGNumris?si=fdIUnlTaAh7NoQCD',
          icon: 'food-apple',
          description: 'Healthy detoxification methods'
        },
      ],
    };
    setNutritionTips(tips[category]);
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
        Enter your weight and height to get personalized nutrition tips
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
        <Text style={styles.calculateButtonText}>Get My Nutrition Tips</Text>
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
            showsVerticalScrollIndicator={false}
          >
            <Animatable.View 
              animation="fadeIn"
              style={styles.headerContainer}
            >
              <MaterialCommunityIcons 
                name="food-apple" 
                size={40} 
                color="#fff" 
                style={styles.headerIcon}
              />
              <Text style={styles.header}>Your Personalized Nutrition Tips</Text>
            </Animatable.View>

            {showInputs ? (
              renderInputFields()
            ) : (
              <>
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


                {nutritionTips.length > 0 && (
                  <Animatable.View 
                    animation="fadeInUp"
                    delay={400}
                    style={styles.tipsContainer}
                  >
                    <Text style={styles.tipsTitle}>Recommended Nutrition Tips</Text>
                    {nutritionTips.map((tip, index) => (
                      <Animatable.View
                        key={index}
                        animation="zoomIn"
                        delay={index * 200}
                        style={styles.tipCard}
                      >
                        <LinearGradient
                          colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                          style={styles.tipGradient}
                        >
                          <View style={styles.tipIconContainer}>
                            <MaterialCommunityIcons 
                              name={tip.icon} 
                              size={30} 
                              color="#fff" 
                            />
                          </View>
                          <View style={styles.tipContent}>
                            <Text style={styles.tipTitle}>{tip.name}</Text>
                            <Text style={styles.tipDescription}>{tip.description}</Text>
                          </View>
                          <TouchableOpacity 
                            style={styles.watchButton}
                            onPress={() => openVideo(tip.videoUrl)}
                          >
                            <Ionicons name="play-circle" size={24} color="#fff" />
                            <Text style={styles.watchButtonText}>Watch</Text>
                          </TouchableOpacity>
                        </LinearGradient>
                      </Animatable.View>
                    ))}
                  </Animatable.View>
                )}

                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => {
                    // Reset all calculation results
                    setBmi(null);
                    setBmiMessage('');
                    setNutritionTips([]);
                    setBmiCategory('');
                    // Show input form (keep weight/height values so user can edit them)
                    setShowInputs(true);
                  }}
                >
                  <Text style={styles.editButtonText}>Edit Measurements</Text>
                </TouchableOpacity>
              </>
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
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    marginRight: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  inputContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  inputTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  inputSubtitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    opacity: 0.9,
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    fontSize: 16,
  },
  calculateButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bmiContainer: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  bmiContent: {
    alignItems: 'center',
  },
  bmiLabel: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  bmiValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 5,
  },
  bmiMessage: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  tipsContainer: {
    marginTop: 20,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  tipCard: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  tipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  tipIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  tipDescription: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  watchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  watchButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NutritionTipsScreen;
