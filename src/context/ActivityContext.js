import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

const ActivityContext = createContext();

export const ActivityProvider = ({ children }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the token from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        console.log('No authentication token found, using local storage');
        setActivities([]);
        return;
      }

      const data = await api.getActivities();
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError(error.message);
      // Clear activities if unauthorized
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        setActivities([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const addActivity = async (activityData) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        console.log('No authentication token found, storing locally');
        // Store activity locally for demo purposes
        const localActivity = {
          ...activityData,
          _id: Date.now().toString(),
          createdAt: new Date().toISOString()
        };
        setActivities(prevActivities => [...prevActivities, localActivity]);
        return localActivity;
      }

      const newActivity = await api.createActivity(activityData);
      setActivities(prevActivities => [...prevActivities, newActivity]);
      return newActivity;
    } catch (error) {
      console.error('Error adding activity:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const createActivity = async (activityData) => {
    try {
      const response = await api.createActivity(activityData);
      setActivities([response, ...activities]);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateActivity = async (id, activityData) => {
    try {
      const response = await api.updateActivity(id, activityData);
      setActivities(
        activities.map((activity) =>
          activity._id === id ? response : activity
        )
      );
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteActivity = async (id) => {
    try {
      await api.deleteActivity(id);
      setActivities(activities.filter((activity) => activity._id !== id));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getActivitiesByDateRange = async (startDate, endDate) => {
    try {
      setLoading(true);
      const response = await api.getActivitiesByDateRange(startDate, endDate);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return (
    <ActivityContext.Provider
      value={{
        activities,
        loading,
        error,
        fetchActivities,
        addActivity,
        createActivity,
        updateActivity,
        deleteActivity,
        getActivitiesByDateRange
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
}; 