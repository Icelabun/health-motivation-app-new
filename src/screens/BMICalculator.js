import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Button } from 'react-native';

const BMICalculator = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState(null);
  const [suggestions, setSuggestions] = useState('');

  const handleCalculate = () => {
    const bmiResult = weight / (height * height);
    setBmi(bmiResult);

    if (bmiResult < 18.5) {
      setSuggestions('Underweight: Try to include more protein and carbs in your diet.');
    } else if (bmiResult < 24.9) {
      setSuggestions('Normal weight: Keep up the great work with a balanced diet!');
    } else {
      setSuggestions('Overweight: Focus on cardio exercises and watch your caloric intake.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Weight (kg)"
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
      />
      <TextInput
        style={styles.input}
        placeholder="Height (m)"
        keyboardType="numeric"
        value={height}
        onChangeText={setHeight}
      />

      <Button title="Calculate BMI" onPress={handleCalculate} />

      {bmi && (
        <View>
          <Text>Your BMI: {bmi}</Text>
          <Text>{suggestions}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
});

export default BMICalculator;
