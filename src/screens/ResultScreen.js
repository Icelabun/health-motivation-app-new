import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const ResultScreen = ({ route }) => {
  const { bmi, bmiCategory } = route.params;
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const saveTip = async (tip) => {
    setLoading(true);
    try {
      const savedTips = await AsyncStorage.getItem('savedTips');
      const tipsArray = savedTips ? JSON.parse(savedTips) : [];
      tipsArray.push(tip);
      await AsyncStorage.setItem('savedTips', JSON.stringify(tipsArray));
      Alert.alert('Success', 'Tip saved successfully!');
    } catch (error) {
      console.error('Error saving tip:', error);
      Alert.alert('Error', 'An error occurred while saving the tip.');
    } finally {
      setLoading(false);
    }
  };

  const getHealthTip = () => {
    switch (bmiCategory) {
      case 'Underweight':
        return 'Consider gaining weight and building muscle.';
      case 'Normal weight':
        return 'Keep up the good work!';
      case 'Overweight':
        return 'Consider adjusting your diet and exercise routine.';
      case 'Obese':
        return 'Consult a health professional for a weight loss plan.';
      default:
        return 'No tips available.';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your BMI: {bmi}</Text>
      <Text style={styles.subtitle}>{bmiCategory}</Text>

      {/* Save the health tip */}
      <Button
        title={loading ? 'Saving...' : 'Save Health Tip'}
        onPress={() => saveTip(getHealthTip())}
        disabled={loading}
      />

      {/* Navigate to Saved Tips Screen */}
      <Button
        title="View Saved Tips"
        onPress={() => navigation.navigate('SavedTips')}
      />
      
      {/* Display loading spinner if saving */}
      {loading && <ActivityIndicator size="large" color="#2F7D4C" style={styles.loader} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  loader: {
    marginTop: 20,
  },
});

export default ResultScreen;
