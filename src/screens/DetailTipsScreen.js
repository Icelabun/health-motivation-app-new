import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DetailTipsScreen = ({ route }) => {
  const { tip } = route.params;
  const navigation = useNavigation();

  const saveTip = async () => {
    try {
      const existingTips = await AsyncStorage.getItem('savedTips');
      const tips = existingTips ? JSON.parse(existingTips) : [];

      // Avoid duplicates
      const isDuplicate = tips.some(saved => saved.id === tip.id);
      if (!isDuplicate) {
        tips.push(tip);
        await AsyncStorage.setItem('savedTips', JSON.stringify(tips));
        Alert.alert('Success', 'Tip saved successfully!');
      } else {
        Alert.alert('Info', 'Tip already saved.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save the tip.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{tip.title}</Text>
      <Text style={styles.description}>{tip.description}</Text>
      <Text style={styles.calories}>🔥 Calories: {tip.calories} kcal</Text>

      <Text style={styles.sectionTitle}>🥗 Ingredients:</Text>
      {tip.ingredients.map((item, index) => (
        <Text key={index} style={styles.listItem}>• {item}</Text>
      ))}

      <Text style={styles.sectionTitle}>📝 Steps:</Text>
      {tip.steps.map((step, index) => (
        <Text key={index} style={styles.listItem}>{index + 1}. {step}</Text>
      ))}

      <WebView source={{ uri: tip.videoUrl }} style={styles.video} />

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={saveTip}>
        <Text style={styles.backButtonText}>💾 Save Tip</Text>
      </TouchableOpacity>

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>⬅ Back to Tips</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#ECF8F6' },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#05676E' },
  description: { fontSize: 16, color: '#333', marginBottom: 10, textAlign: 'center' },
  calories: { fontSize: 18, fontWeight: 'bold', color: '#34D399', textAlign: 'center', marginTop: 10 },
  sectionTitle: {
    fontSize: 20, fontWeight: 'bold', marginTop: 15, marginBottom: 5,
    color: '#05676E', borderBottomWidth: 2, borderBottomColor: '#34D399',
    paddingBottom: 5
  },
  listItem: { fontSize: 16, color: '#444', marginLeft: 10, marginVertical: 2 },
  video: { height: 200, marginTop: 15, borderRadius: 10, overflow: 'hidden' },
  saveButton: {
    marginTop: 20, padding: 12, backgroundColor: '#3B82F6',
    borderRadius: 8, alignItems: 'center', shadowColor: '#000',
    shadowOpacity: 0.2, shadowRadius: 3, elevation: 3
  },
  backButton: {
    marginTop: 10, padding: 12, backgroundColor: '#34D399',
    borderRadius: 8, alignItems: 'center', shadowColor: '#000',
    shadowOpacity: 0.2, shadowRadius: 3, elevation: 3
  },
  backButtonText: {
    color: '#fff', fontSize: 16, fontWeight: 'bold'
  }
});

export default DetailTipsScreen;
