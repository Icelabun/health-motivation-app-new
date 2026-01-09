import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FavoritePlansScreen = () => {
  const [favoritePlans, setFavoritePlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavoritePlans();
  }, []);

  const fetchFavoritePlans = async () => {
    try {
      const savedPlans = await AsyncStorage.getItem('favoritePlans');
      setFavoritePlans(savedPlans ? JSON.parse(savedPlans) : []);
    } catch (error) {
      console.error('Error loading favorite plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavoritePlan = async (planTitle) => {
    try {
      const updatedPlans = favoritePlans.filter(plan => plan.title !== planTitle);
      await AsyncStorage.setItem('favoritePlans', JSON.stringify(updatedPlans));
      setFavoritePlans(updatedPlans);
    } catch (error) {
      console.error('Error removing plan from favorites:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your favorite plans...</Text>
      </View>
    );
  }

  if (favoritePlans.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>You have no favorite plans yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Favorite Exercise Plans</Text>
      {favoritePlans.map((plan, index) => (
        <View key={index} style={styles.planContainer}>
          <Text style={styles.planTitle}>{plan.title}</Text>
          <Text style={styles.planDescription}>{plan.description}</Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeFavoritePlan(plan.title)}
          >
            <Text style={styles.removeButtonText}>Remove from Favorites</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#E3F2FD', // Light Blue Background for a Clean Health Look
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#01579B', // Dark Blue Title for Contrast
    textAlign: 'center',
    marginBottom: 20,
  },
  planContainer: {
    backgroundColor: '#FFFFFF', // White Card for a Clean UI
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#B0BEC5', // Light Gray Border for Subtle Separation
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0277BD', // Medium Blue Title for Readability
    marginBottom: 5,
  },
  planDescription: {
    fontSize: 16,
    color: '#546E7A', // Grayish Blue for Subtext
  },
  removeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#D32F2F', // Red Button for Removing Plans
    borderRadius: 5,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#01579B', // Dark Blue for Readability
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#546E7A', // Grayish Blue for Readability
  },
});

export default FavoritePlansScreen;
