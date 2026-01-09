import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');

const SaveLogScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Auto navigate back after 3 seconds
    const timer = setTimeout(() => {
      navigation.goBack();
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#2ecc71', '#27ae60', '#219a52']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animatable.View 
          animation="fadeInDown" 
          style={styles.header}
        >
          <Text style={styles.title}>Log Saved Successfully!</Text>
        </Animatable.View>

        <Animatable.View 
          animation="fadeInUp" 
          delay={300}
          style={styles.content}
        >
          <Animatable.View 
            animation="pulse" 
            easing="ease-out" 
            iterationCount="infinite" 
            duration={2000}
            style={styles.iconContainer}
          >
            <MaterialCommunityIcons name="check-circle" size={100} color="#fff" />
          </Animatable.View>

          <Animatable.Text 
            animation="fadeIn" 
            delay={500}
            style={styles.message}
          >
            Your daily activities have been saved successfully.
          </Animatable.Text>

          <Animatable.Text 
            animation="fadeIn" 
            delay={1000}
            style={styles.subMessage}
          >
            You will be redirected back in a moment...
          </Animatable.Text>
        </Animatable.View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  message: {
    fontSize: 22,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    fontWeight: '600',
  },
  subMessage: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default SaveLogScreen; 