import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../database/databaseConfig'; 
import { signOut, deleteUser } from 'firebase/auth'; 
import { useNavigation } from '@react-navigation/native'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteDoc, doc } from 'firebase/firestore';

const ProfileScreen = () => {
  const navigation = useNavigation(); 

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('isRegistered');
      await AsyncStorage.removeItem('userName');
      await signOut(FIREBASE_AUTH); 
      navigation.navigate('RegisterLogin'); 
    } catch (error) {
      console.error("Logout error: ", error.message);
    }
  };

  const handleDeleteAccount = async () => {
    const user = FIREBASE_AUTH.currentUser;

    if (!user) {
      Alert.alert('Error', 'No user is logged in.');
      return;
    }

    try {
      const confirmation = await new Promise((resolve) => {
        Alert.alert(
          'Delete Account',
          'Are you sure you want to delete your account? This action cannot be undone.',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
          ]
        );
      });

      if (!confirmation) return;

      const userDocRef = doc(FIRESTORE_DB, 'users', user.uid);
      const userSettingsDocRef = doc(FIRESTORE_DB, 'user_settings', user.uid);
      await deleteDoc(userDocRef);
      await deleteDoc(userSettingsDocRef);

      await AsyncStorage.removeItem('isRegistered');
      await AsyncStorage.removeItem('userName');

      await deleteUser(user);

      Alert.alert('Account Deleted', 'Your account and data have been successfully deleted.');

      navigation.navigate('RegisterLogin');
    } catch (error) {
      console.error('Account deletion error: ', error.message);

      if (error.code === 'auth/requires-recent-login') {
        Alert.alert(
          'Reauthentication Required',
          'Please log in again to confirm account deletion.',
          [{text: 'OK', onPress: () => navigation.navigate('RegisterLogin')}]
        );
      } else {
        Alert.alert('Error', 'Failed to delete account. Please try again later.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to Profile Screen</Text>
      <Button title="Logout" onPress={handleLogout} color="#FF6347" />
      <Button title="Delete Account" onPress={handleDeleteAccount} color="#FF6347" />
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
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default ProfileScreen;
