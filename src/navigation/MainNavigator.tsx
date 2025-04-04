import React, { useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AccountScreen from '../screens/AccountScreen';
import DirectMessagesScreen from '../screens/DirectMessagesScreen';
import ChatScreen from '../screens/ChatScreen';
import LiveScreen from '../screens/LiveScreen';
import MusicScreen from '../screens/MusicScreen';
import MiningScreen from '../screens/MiningScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ShopScreen from '../screens/ShopScreen';

// Import components
import CustomTabBar from '../components/CustomTabBar';
import SidebarMenu from '../components/SidebarMenu';
import { MenuPositionProvider } from '../components/SidebarMenu';

// Define types for the navigation
export type MainTabParamList = {
  Home: undefined;
  Notifications: undefined;
  Profile: undefined;
};

// Define stack navigation params
export type RootStackParamList = {
  Main: undefined;
  Home: undefined;
  Notifications: undefined;
  DirectMessages: undefined;
  Live: undefined;
  Music: undefined;
  Mining: undefined;
  Leaderboard: undefined;
  Shop: undefined;
  Account: undefined;
  Profile: undefined;
  Chat: {
    userId: string;
    name: string;
    avatar: string;
  };
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// Main tab navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1C1D23',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
          height: 61,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
        tabBarStyle: {
          backgroundColor: 'transparent',
          elevation: 10,
          borderTopWidth: 0,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 91,
          zIndex: 999,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          headerTitle: 'Messages',
        }}
      />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={{
          tabBarBadge: 9,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarBadge: 3,
        }}
      />
    </Tab.Navigator>
  );
};

// Root navigator that contains both tab and stack navigation
const MainNavigator = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const handleSidebarStateChange = (expanded: boolean) => {
    setIsSidebarExpanded(expanded);
  };

  return (
    <View style={styles.container}>
      {/* Main content container */}
      <View style={styles.contentContainer}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="DirectMessages" component={DirectMessagesScreen} />
          <Stack.Screen name="Live" component={LiveScreen} />
          <Stack.Screen name="Music" component={MusicScreen} />
          <Stack.Screen name="Mining" component={MiningScreen} />
          <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
          <Stack.Screen name="Shop" component={ShopScreen} />
          <Stack.Screen name="Account" component={AccountScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
      </View>
      
      {/* Sidebar menu overlay */}
      <SidebarMenu onMenuStateChange={handleSidebarStateChange} />
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131318',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#131318',
    overflow: 'hidden',
    width: '100%',
  },
});

export default MainNavigator; 