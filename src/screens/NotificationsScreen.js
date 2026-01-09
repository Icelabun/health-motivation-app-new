import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';

const NotificationsScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const profileStr = await AsyncStorage.getItem('userProfile');
        if (!profileStr) {
          setMessages([]);
          return;
        }
        const profile = JSON.parse(profileStr);
        const emailOrName = profile.email || profile.username || profile.name;
        const messageKey = `adminMessage_${emailOrName}`;
        const existingMessages = await AsyncStorage.getItem(messageKey);
        const parsed = existingMessages ? JSON.parse(existingMessages) : [];
        // newest first
        setMessages(parsed.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)));
      } catch (e) {
        setMessages([]);
      }
    };
    loadMessages();
  }, []);

  const renderItem = ({ item }) => (
    <Animatable.View animation="fadeInUp" style={styles.card}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons name="bullhorn" size={20} color="#2C3E50" />
        <Text style={styles.cardFrom}>{item.from || 'Admin'}</Text>
        <Text style={styles.cardTime}>{new Date(item.timestamp).toLocaleString()}</Text>
      </View>
      <Text style={styles.cardText}>{item.text}</Text>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#FFD700", "#FFC107", "#FFB300"]} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
          <View style={{ width: 40, height: 40 }} />
        </View>

        {messages.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="bell-off" size={48} color="#2C3E50" />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { color: '#2C3E50', fontSize: 22, fontWeight: 'bold' },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 },
      android: { elevation: 3 },
    })
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  cardFrom: { color: '#2C3E50', fontWeight: '600', marginRight: 8 },
  cardTime: { color: '#7f8c8d', fontSize: 12, marginLeft: 'auto' },
  cardText: { color: '#2C3E50', fontSize: 16, lineHeight: 22 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 8, color: '#2C3E50' },
});

export default NotificationsScreen;


