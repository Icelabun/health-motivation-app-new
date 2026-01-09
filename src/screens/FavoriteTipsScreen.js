import React, { useState } from 'react';
import { 
  View, Text, ScrollView, StyleSheet, TouchableOpacity 
} from 'react-native';

const FavoriteTipsScreen = ({ route }) => {
  const { favoriteTips, updateFavorites } = route.params;
  const [sortedFavorites, setSortedFavorites] = useState(favoriteTips);
  const [sortOption, setSortOption] = useState(null);

  const sortFavorites = (option) => {
    let sortedList = [...sortedFavorites];

    if (option === 'A-Z') {
      sortedList.sort((a, b) => a.title.localeCompare(b.title));
    } else if (option === 'Z-A') {
      sortedList.sort((a, b) => b.title.localeCompare(a.title));
    } else if (option === 'Low-High') {
      sortedList.sort((a, b) => a.calories - b.calories);
    } else if (option === 'High-Low') {
      sortedList.sort((a, b) => b.calories - a.calories);
    }

    setSortOption(option);
    setSortedFavorites(sortedList);
  };

  const removeFromFavorites = (index) => {
    const updatedFavorites = sortedFavorites.filter((_, i) => i !== index);
    setSortedFavorites(updatedFavorites);
    updateFavorites(updatedFavorites);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Favorite Nutrition Tips</Text>

      <View style={styles.sortButtons}>
        <TouchableOpacity style={styles.sortButton} onPress={() => sortFavorites('A-Z')}>
          <Text style={styles.buttonText}>Sort A-Z</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortButton} onPress={() => sortFavorites('Z-A')}>
          <Text style={styles.buttonText}>Sort Z-A</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortButton} onPress={() => sortFavorites('Low-High')}>
          <Text style={styles.buttonText}>Low → High Calories</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortButton} onPress={() => sortFavorites('High-Low')}>
          <Text style={styles.buttonText}>High → Low Calories</Text>
        </TouchableOpacity>
      </View>

      {sortedFavorites.length === 0 ? (
        <Text style={styles.noFavoritesText}>No favorites yet!</Text>
      ) : (
        sortedFavorites.map((tip, index) => (
          <View key={index} style={styles.tipContainer}>
            <Text style={styles.tipTitle}>{tip.title}</Text>
            <Text style={styles.tipDescription}>{tip.description}</Text>
            <Text style={styles.calories}>Calories: {tip.calories} kcal</Text>
            <TouchableOpacity 
              style={styles.removeButton} 
              onPress={() => removeFromFavorites(index)}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F0FDF4' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#065F46' },
  sortButtons: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 10 },
  sortButton: { backgroundColor: '#10B981', padding: 8, margin: 5, borderRadius: 5 },
  buttonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  tipContainer: { backgroundColor: '#FFFFFF', padding: 15, marginBottom: 10, borderRadius: 8, borderWidth: 1, borderColor: '#D1FAE5', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 3 },
  tipTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5, color: '#065F46' },
  tipDescription: { fontSize: 16, color: '#333' },
  calories: { fontSize: 14, fontWeight: 'bold', color: '#555', marginTop: 5 },
  removeButton: { backgroundColor: '#DC2626', padding: 8, marginTop: 10, borderRadius: 5 },
  removeButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  noFavoritesText: { textAlign: 'center', fontSize: 16, color: '#777', marginTop: 20 },
});

export default FavoriteTipsScreen;
