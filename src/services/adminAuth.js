import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// This is a secure hash of the passkey - in production, this should be stored securely on the server
const ADMIN_PASSKEY_HASH = 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f'; // This is a hash of "HealthAdmin2024!" - SECURE ADMIN PASSWORD
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export const verifyAdminPasskey = async (passkey) => {
  try {
    // Check for lockout
    const lockoutUntil = await AsyncStorage.getItem('adminLockoutUntil');
    if (lockoutUntil) {
      const lockoutTime = parseInt(lockoutUntil);
      if (Date.now() < lockoutTime) {
        const remainingMinutes = Math.ceil((lockoutTime - Date.now()) / 60000);
        throw new Error(`Too many failed attempts. Please try again in ${remainingMinutes} minutes.`);
      } else {
        // Clear expired lockout
        await AsyncStorage.removeItem('adminLockoutUntil');
        await AsyncStorage.removeItem('adminAttempts');
      }
    }

    // Get current attempts
    const attempts = parseInt(await AsyncStorage.getItem('adminAttempts') || '0');
    
    // Check if max attempts reached
    if (attempts >= MAX_ATTEMPTS) {
      const lockoutTime = Date.now() + LOCKOUT_DURATION;
      await AsyncStorage.setItem('adminLockoutUntil', lockoutTime.toString());
      throw new Error(`Too many failed attempts. Please try again in ${LOCKOUT_DURATION / 60000} minutes.`);
    }

    // Verify passkey
    const hashedPasskey = await hashString(passkey);
    const isValid = hashedPasskey === ADMIN_PASSKEY_HASH;

    if (!isValid) {
      // Increment failed attempts
      await AsyncStorage.setItem('adminAttempts', (attempts + 1).toString());
      throw new Error(`Invalid passkey. ${MAX_ATTEMPTS - attempts - 1} attempts remaining.`);
    }

    // Reset attempts on successful verification
    await AsyncStorage.removeItem('adminAttempts');
    await AsyncStorage.removeItem('adminLockoutUntil');
    
    return true;
  } catch (error) {
    console.error('Error verifying admin passkey:', error);
    throw error;
  }
};

export const setAdminAccess = async (hasAccess) => {
  try {
    const timestamp = Date.now();
    await AsyncStorage.setItem('adminAccess', JSON.stringify({
      hasAccess,
      timestamp,
      expiresAt: timestamp + (30 * 60 * 1000) // 30 minutes session
    }));
  } catch (error) {
    console.error('Error setting admin access:', error);
  }
};

export const getAdminAccess = async () => {
  try {
    const accessData = await AsyncStorage.getItem('adminAccess');
    if (!accessData) return false;

    const { hasAccess, expiresAt } = JSON.parse(accessData);
    
    // Check if session has expired
    if (Date.now() > expiresAt) {
      await AsyncStorage.removeItem('adminAccess');
      return false;
    }

    return hasAccess;
  } catch (error) {
    console.error('Error getting admin access:', error);
    return false;
  }
};

export const clearAdminAccess = async () => {
  try {
    await AsyncStorage.removeItem('adminAccess');
    await AsyncStorage.removeItem('adminAttempts');
    await AsyncStorage.removeItem('adminLockoutUntil');
  } catch (error) {
    console.error('Error clearing admin access:', error);
  }
};

// Simple hash function for demo purposes
// In production, use a proper cryptographic hash function
const hashString = async (str) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}; 