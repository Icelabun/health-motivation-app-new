import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const SavedTipsScreen = () => {
  const [savedTips, setSavedTips] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchSavedTips = async () => {
      try {
        const storedTips = await AsyncStorage.getItem('savedTips');
        if (storedTips) {
          setSavedTips(JSON.parse(storedTips));
        }
      } catch (error) {
        console.error('Error fetching saved tips:', error);
      }
    };

    fetchSavedTips();
  }, []);

  const deleteTip = async (index) => {
    try {
      const newSavedTips = [...savedTips];
      newSavedTips.splice(index, 1);
      setSavedTips(newSavedTips);
      await AsyncStorage.setItem('savedTips', JSON.stringify(newSavedTips));
      Alert.alert('Success', 'Tip deleted successfully');
    } catch (error) {
      console.error('Error deleting tip:', error);
      Alert.alert('Error', 'An error occurred while deleting the tip');
    }
  };

  const renderSavedTip = ({ item, index }) => (
    <View style={styles.tipContainer}>
      <Text style={styles.tipText}>{item}</Text>
      <TouchableOpacity onPress={() => deleteTip(index)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const handleDone = () => {
    navigation.navigate('Tabs'); // Takes the user to Home through Tabs
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Tips</Text>
      {savedTips.length === 0 ? (
        <Text style={styles.noTipsText}>No saved tips yet.</Text>
      ) : (
        <FlatList
          data={savedTips}
          renderItem={renderSavedTip}
          keyExtractor={(item, index) => index.toString()}
        />
      )}

      <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: '#eaf0f3',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2F7D4C',
  },
  noTipsText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#888',
    marginTop: 30,
  },
  tipContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d0f0c0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  doneButton: {
    marginTop: 20,
    backgroundColor: '#34D399',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SavedTipsScreen;
