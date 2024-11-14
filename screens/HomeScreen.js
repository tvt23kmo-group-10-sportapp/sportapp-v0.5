import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import PieChart from 'react-native-pie-chart';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../database/databaseConfig'; 
import { getDoc, doc } from 'firebase/firestore'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { onAuthStateChanged } from 'firebase/auth';

const HomeScreen = () => {
  const [calories, setCalories] = useState(0);
  const [username, setUsername] = useState(''); 
  const [loading, setLoading] = useState(true); 

  const widthAndHeight = 200;
  const series = [123, 321, 123, 789, 537];
  const sliceColor = ['#fbd203', '#ffb300', '#ff9100', '#ff6c00', '#ff3c00'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (user) => {  
      console.log("User state changed:", user);

      const fetchUsername = async () => {
        if (user) {
          try {
            const userRef = doc(FIRESTORE_DB, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              const userData = userSnap.data();
              setUsername(userData.username);
              await AsyncStorage.setItem('userName', userData.username);
              console.log('Username fetched and stored:', userData.username);
            } else {
              setUsername('User');
              console.log('User document not found, setting default username');
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            setUsername('User');
          } finally {
            setLoading(false);
          }
        } else {
          const storedUsername = await AsyncStorage.getItem('userName');
          if (storedUsername) {
            setUsername(storedUsername);
            console.log('Username fetched from AsyncStorage:', storedUsername);
          } else {
            setUsername('User');
            console.log('No stored username found, setting default username');
          }
          setLoading(false);
        }
      };
      fetchUsername();
    });
    return () => unsubscribe();
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
});

export default HomeScreen;