import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  BackHandler
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { verifyAdminPasskey, setAdminAccess, clearAdminAccess } from '../services/adminAuth';

const AdminAccessScreen = ({ navigation }) => {
  const [passkey, setPasskey] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(null);

  useEffect(() => {
    // Handle back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => backHandler.remove();
  }, [navigation]);

  const handleVerifyPasskey = async () => {
    if (!passkey.trim()) {
      Alert.alert('Error', 'Please enter the admin passkey');
      return;
    }

    try {
      setLoading(true);
      await verifyAdminPasskey(passkey);
      await setAdminAccess(true);
      navigation.replace('Admin');
    } catch (error) {
      console.error('Error verifying passkey:', error);
      Alert.alert('Error', error.message);
      setPasskey('');
      
      // Update attempts display
      if (error.message.includes('attempts remaining')) {
        const remaining = parseInt(error.message.match(/\d+/)[0]);
        setAttempts(3 - remaining);
      }
      
      // Update lockout display
      if (error.message.includes('try again in')) {
        const minutes = parseInt(error.message.match(/\d+/)[0]);
        setLockoutTime(minutes);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = async () => {
    await clearAdminAccess();
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#FFD700', '#FFC107', '#FFB300']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <MaterialCommunityIcons
            name="shield-lock"
            size={80}
            color="#2C3E50"
            style={styles.icon}
          />
          
          <Text style={styles.title}>Admin Access</Text>
          <Text style={styles.subtitle}>
            Please enter the admin passkey to continue
          </Text>

          {lockoutTime ? (
            <View style={styles.lockoutContainer}>
              <MaterialCommunityIcons name="timer" size={40} color="#2C3E50" />
              <Text style={styles.lockoutText}>
                Too many failed attempts.{'\n'}
                Please try again in {lockoutTime} minutes.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter passkey"
                  value={passkey}
                  onChangeText={setPasskey}
                  secureTextEntry
                  placeholderTextColor="rgba(44, 62, 80, 0.5)"
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={6}
                />
              </View>

              {attempts > 0 && (
                <Text style={styles.attemptsText}>
                  {3 - attempts} attempts remaining
                </Text>
              )}

              <TouchableOpacity
                style={styles.verifyButton}
                onPress={handleVerifyPasskey}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="check-circle" size={24} color="#fff" />
                    <Text style={styles.verifyButtonText}>Verify Passkey</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#2C3E50" />
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#34495E',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#2C3E50',
    textAlign: 'center',
    letterSpacing: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  attemptsText: {
    color: '#e74c3c',
    fontSize: 14,
    marginBottom: 15,
  },
  lockoutContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  lockoutText: {
    color: '#2C3E50',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#008080',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  backButtonText: {
    color: '#2C3E50',
    fontSize: 16,
    marginLeft: 5,
  },
});

export default AdminAccessScreen; 