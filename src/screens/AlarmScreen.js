import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const AlarmScreen = () => {
  const [alarmMessage, setAlarmMessage] = useState('Time to get moving!');

  useEffect(() => {
    const timer = setTimeout(() => {
      setAlarmMessage('It\'s time to focus on your health!');
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.alarmText}>{alarmMessage}</Text>
      <Button title="Go to Home" onPress={() => alert('Going Home')} style={styles.button} />
      <Button title="Snooze" onPress={() => alert('Alarm snoozed!')} style={styles.snoozeButton} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alarmText: {
    fontSize: 22,
    color: '#ff5722',
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
  },
  snoozeButton: {
    marginTop: 10,
  },
});

export default AlarmScreen;
