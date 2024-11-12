import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, Pressable, Modal, ActivityIndicator } from 'react-native';
import PieChart from 'react-native-pie-chart';
import { BarChart } from 'react-native-gifted-charts';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../database/databaseConfig'; 
import { getDoc, doc } from 'firebase/firestore'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const HomeScreen = () => {
  const [calories, setCalories] = useState('');
  const [username, setUsername] = useState('User'); 
  const [loading, setLoading] = useState(true); 

  const widthAndHeight = 200;
  const series = [123, 321, 123, 789, 537];
  const sliceColor = ['#fbd203', '#ffb300', '#ff9100', '#ff6c00', '#ff3c00'];

  useEffect(() => {
    const fetchUsername = async () => {
      const user = FIREBASE_AUTH.currentUser; 
      if (user) {
        try {
          const userRef = doc(FIRESTORE_DB, 'users', user.uid);  
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setUsername(userData.username); 
            await AsyncStorage.setItem('userName', userData.username); 
          } else {
            setUsername('User'); 
          }
        } catch (error) {
          console.error("Error getting user data: ", error);
          setUsername('User');
        } finally {
          setLoading(false);
        }
      } else {
        const storedUsername = await AsyncStorage.getItem('userName');
        if (storedUsername) {
          setUsername(storedUsername);
        }
        setLoading(false);
      }
    };

    fetchUsername();
  }, []); 

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {username}!</Text>
      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          <PieChart
            widthAndHeight={widthAndHeight}
            series={series}
            sliceColor={sliceColor}
            coverFill={'#FFF'}
          />
          <Text style={styles.caloriesText}>
            {calories} calories {'\n'} remaining
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 30,
    textAlign: 'center',
    marginVertical: 10,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  chart: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  caloriesText: {
    position: 'absolute',
    textAlign: 'center',
    fontSize: 18,
    color: '#000',
    top: '40%',
  },
  meals: {
    flexDirection: 'row',
    marginTop: 20,
    padding: 10,
    justifyContent:'space-between',
  },
  waterButton: {
    backgroundColor: 'grey',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row', 
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default HomeScreen;