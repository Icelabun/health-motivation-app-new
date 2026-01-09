import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { CommonActions } from '@react-navigation/native';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [navigation, setNavigation] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    // Check if user is logged in on app start
    checkUser();
  }, []);

  const validateUserData = (data) => {
    if (!data || typeof data !== 'object') return false;
    
    const requiredFields = ['name', 'email'];
    const isValid = requiredFields.every(field => data[field] && typeof data[field] === 'string');
    console.log('User data validation:', { data, isValid, requiredFields });
    return isValid;
  };

  const validateProfileData = (data) => {
    if (!data || typeof data !== 'object') return false;
    
    const requiredFields = [
      'username', 'email', 'age', 'gender', 'weight', 'height',
      'bloodType', 'healthGoal', 'activityLevel', 'dietaryPreference',
      'medicalHistory', 'currentMedications'
    ];
    
    return requiredFields.every(field => data[field] !== undefined && data[field] !== null);
  };

  const checkUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      const userProfile = await AsyncStorage.getItem('userProfile');
      
      console.log('CheckUser - Token:', !!token);
      console.log('CheckUser - UserData:', userData);
      console.log('CheckUser - UserProfile:', userProfile);
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        console.log('CheckUser - Parsed user:', parsedUser);
        
        // Auto-clear if stored user is the demo user "Ali Nur"
        if (
          parsedUser?.name === 'Ali Nur' ||
          parsedUser?.username === 'Ali Nur'
        ) {
          console.log('CheckUser - Found demo user "Ali Nur". Clearing stored credentials.');
          await clearUserData();
          return;
        }

        if (!validateUserData(parsedUser)) {
          console.log('CheckUser - User data validation failed');
          throw new Error('Invalid user data');
        }

        // Ensure user has proper ID field
        const userWithId = {
          ...parsedUser,
          _id: parsedUser._id || parsedUser.id || Date.now().toString()
        };

        // If we have a profile, merge it with user data
        if (userProfile) {
          const parsedProfile = JSON.parse(userProfile);
          console.log('CheckUser - Parsed profile:', parsedProfile);
          
          if (
            parsedProfile?.username === 'Ali Nur' ||
            parsedProfile?.name === 'Ali Nur'
          ) {
            console.log('CheckUser - Found demo profile "Ali Nur". Clearing stored credentials.');
            await clearUserData();
            return;
          }

          // Be lenient: merge whatever fields exist in stored profile without clearing
          const mergedUser = { ...userWithId, ...parsedProfile };
          console.log('CheckUser - Setting merged user:', mergedUser);
          setUser(mergedUser);
        } else {
          console.log('CheckUser - Setting user without profile:', userWithId);
          setUser(userWithId);
        }
      } else {
        console.log('CheckUser - No token or user data found');
      }
    } catch (error) {
      console.error('Error checking user:', error);
      // Clear potentially corrupted data
      await clearUserData();
    } finally {
      setLoading(false);
    }
  };

  const clearUserData = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('userProfile');
      await AsyncStorage.removeItem('userData');
      setUser(null);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  };

  const login = async (username, password) => {
    try {
      setLoading(true);
      console.log('AuthContext: Starting login process for:', username);
      const response = await api.login(username, password);
      console.log('AuthContext: Login API response:', response);
      
      if (response.success) {
        const { token, user } = response.data;
        console.log('AuthContext: Login successful, processing user data:', user);
        
        // Ensure user has proper ID field
        const userWithId = {
          ...user,
          _id: user._id || user.id || Date.now().toString()
        };
        console.log('AuthContext: User with ID:', userWithId);
        
        await AsyncStorage.setItem('token', token);
        
        // Check if there's existing detailed profile data
        let existingProfile = await AsyncStorage.getItem('userProfile');
        if (!existingProfile) {
          // Attempt to locate any per-user profile keys and pick the best match
          try {
            const allKeys = await AsyncStorage.getAllKeys();
            const profileKeys = allKeys.filter(k => k.startsWith('userProfile_'));
            const candidates = [
              userWithId.email,
              userWithId.username,
              userWithId.username ? userWithId.username.replace(/\s+/g, '.').toLowerCase() : undefined,
              userWithId.username ? userWithId.username.replace(/\s+/g, '_').toLowerCase() : undefined,
            ].filter(Boolean);
            for (const key of profileKeys) {
              const profRaw = await AsyncStorage.getItem(key);
              if (!profRaw) continue;
              const prof = JSON.parse(profRaw);
              const profUser = (prof?.username || '').toString();
              const profEmail = (prof?.email || '').toString();
              const profUserDot = profUser.replace(/\s+/g, '.').toLowerCase();
              const profUserUnd = profUser.replace(/\s+/g, '_').toLowerCase();
              const profCandidates = [profUser, profEmail, profUserDot, profUserUnd];
              const match = profCandidates.some(val => candidates.includes(val));
              if (match) {
                existingProfile = profRaw;
                break;
              }
            }
          } catch {}
        }

        if (existingProfile) {
          const parsedProfile = typeof existingProfile === 'string' ? JSON.parse(existingProfile) : existingProfile;
          // Persist also under a per-user key for future lookups
          try {
            const perUserKey = `userProfile_${userWithId.email || userWithId.username || userWithId._id}`;
            await AsyncStorage.setItem(perUserKey, JSON.stringify(parsedProfile));
          } catch {}
          // Prefer detailed profile values; only override with defined fields from userWithId
          const mergedProfile = {
            ...userWithId,           // base
            ...parsedProfile,        // keep detailed values
            _id: userWithId._id,     // ensure correct id
            lastLogin: new Date().toISOString()
          };
          await AsyncStorage.setItem('userProfile', JSON.stringify(mergedProfile));
          setUser(mergedProfile);
        } else {
          // No existing profile found anywhere; keep basic but persistent profile
          await AsyncStorage.setItem('userProfile', JSON.stringify(userWithId));
          try {
            const perUserKey = `userProfile_${userWithId.email || userWithId.username || userWithId._id}`;
            await AsyncStorage.setItem(perUserKey, JSON.stringify(userWithId));
          } catch {}
          setUser(userWithId);
        }
        
        await AsyncStorage.setItem('user', JSON.stringify(userWithId));
        
        console.log('AuthContext: Data saved to AsyncStorage');
        console.log('AuthContext: User state updated');
        
        // Force a re-render of the navigation
        setForceUpdate(prev => prev + 1);
        console.log('AuthContext: Force update triggered');
        
        return { success: true };
      }
      console.log('AuthContext: Login failed:', response.error || response.message);
      return { success: false, error: response.error || response.message };
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
      console.log('AuthContext: Login process completed');
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      console.log('Starting registration process...');
      const response = await api.register(userData);
      console.log('Registration response:', response);
      
      // Check if response has success property (mock response) or direct token/user (real API)
      if (response.success || (response.token && response.user)) {
        const { token, user } = response.success ? response.data : response;
        console.log('Registration successful, storing data...');
        
        // Ensure user has proper ID field
        const userWithId = {
          ...user,
          _id: user._id || user.id || Date.now().toString()
        };
        
        await AsyncStorage.setItem('token', token);
        
        // Check if there's existing detailed profile data
        const existingProfile = await AsyncStorage.getItem('userProfile');
        if (existingProfile) {
          const parsedProfile = JSON.parse(existingProfile);
          // Merge basic user data with existing detailed profile
          const mergedProfile = {
            ...parsedProfile,
            ...userWithId,
            _id: userWithId._id,
            registeredAt: new Date().toISOString()
          };
          await AsyncStorage.setItem('userProfile', JSON.stringify(mergedProfile));
          setUser(mergedProfile);
        } else {
          // No existing profile, save basic user data
          await AsyncStorage.setItem('userProfile', JSON.stringify(userWithId));
          setUser(userWithId);
        }
        console.log('User state updated:', userWithId);
        
        // Force navigation update
        setForceUpdate(prev => prev + 1);
        
        // Force a small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return { success: true, data: { token, user } };
      }
      console.log('Registration failed:', response.message);
      return { success: false, error: response.message };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('AuthContext logout called');
      setLoading(true);
      // Preserve userProfile so profile details persist across sessions
      await AsyncStorage.multiRemove(['token', 'user', 'userData']);
      console.log('AsyncStorage cleared');
      setUser(null);
      console.log('User state cleared');
      
      if (navigation) {
        console.log('Navigation available, resetting to Welcome');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
      } else {
        console.log('Navigation not available');
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await api.updateProfile(profileData);
      
      if (response.success) {
        const updatedUser = { ...user, ...response.data };
        await AsyncStorage.setItem('userProfile', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true };
      }
      return { success: false, error: response.message };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = () => {
    return user?.isAdmin === true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUserProfile,
        isAdmin,
        setNavigation,
        forceUpdate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 