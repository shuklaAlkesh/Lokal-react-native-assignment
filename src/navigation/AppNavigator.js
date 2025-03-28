import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import JobsScreen from '../screens/JobsScreen';
import BookmarksScreen from '../screens/BookmarksScreen';
import JobDetailScreen from '../screens/JobDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const LogoTitle = () => (
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Text style={{ 
      fontSize: 20, 
      fontWeight: 'bold',
      color: '#0984E3'
    }}>
      Lokal
    </Text>
    <Text style={{ 
      fontSize: 20, 
      fontWeight: 'bold',
      color: '#2D3436'
    }}>
      App
    </Text>
  </View>
);

const JobsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#FAFAFA',
      },
      headerShadowVisible: false,
    }}
  >
    <Stack.Screen 
      name="JobsList" 
      component={JobsScreen} 
      options={{ 
        headerTitle: () => <LogoTitle />,
      }} 
    />
    <Stack.Screen 
      name="JobDetail" 
      component={JobDetailScreen} 
      options={{ 
        title: 'Job Details',
        headerTintColor: '#0984E3',
      }} 
    />
  </Stack.Navigator>
);

const BookmarksStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#FAFAFA',
      },
      headerShadowVisible: false,
    }}
  >
    <Stack.Screen 
      name="BookmarksList" 
      component={BookmarksScreen} 
      options={{ 
        title: 'Bookmarks',
        headerTintColor: '#0984E3',
      }} 
    />
    <Stack.Screen 
      name="BookmarkDetail" 
      component={JobDetailScreen} 
      options={{ 
        title: 'Job Details',
        headerTintColor: '#0984E3',
      }} 
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Jobs') {
              iconName = focused ? 'briefcase' : 'briefcase-outline';
            } else if (route.name === 'Bookmarks') {
              iconName = focused ? 'bookmark' : 'bookmark-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#0984E3',
          tabBarInactiveTintColor: '#666',
          tabBarStyle: {
            borderTopWidth: 0,
            elevation: 0,
            backgroundColor: '#FAFAFA',
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        })}
      >
        <Tab.Screen 
          name="Jobs" 
          component={JobsStack}
          options={{ headerShown: false }}
        />
        <Tab.Screen 
          name="Bookmarks" 
          component={BookmarksStack}
          options={{ headerShown: false }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 