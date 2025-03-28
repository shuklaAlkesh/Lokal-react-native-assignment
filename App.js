import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase } from './src/database/database';

export default function App() {
  useEffect(() => {
    const initStorage = async () => {
      try {
        await initDatabase();
        console.log('Storage initialized');
      } catch (error) {
        console.error('Error initializing storage:', error);
      }
    };
    
    initStorage();
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <AppNavigator />
    </>
  );
}
