import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

// Types
import { RootStackParamList } from '../types/navigation';

// Screens
const ModeSelectionScreen = require('../screens/ModeSelectionScreen').default;
const ParentAuthScreen = require('../screens/parent/ParentAuthScreen').default;
const ChildSelectionScreen = require('../screens/ChildSelectionScreen').default;
const ChildHomeScreen = require('../screens/child/ChildHomeScreen').default;
const ParentHomeScreen = require('../screens/parent/ParentHomeScreen').default;
const QuestsScreen = require('../screens/QuestsScreen').default;
const RewardsScreen = require('../screens/RewardsScreen').default;
const ProfileScreen = require('../screens/ProfileScreen').default;
const CreateQuestScreen = require('../screens/parent/CreateQuestScreen').default;
const QuestDetailsScreen = require('../screens/QuestDetailsScreen').default;

// Context
const useAuth = require('../context/AuthContext').useAuth;

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Child Bottom Tab Navigator
const ChildTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarActiveTintColor: '#4CAF50',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500',
      },
      tabBarIcon: ({ color, size }) => {
        let iconName = 'home';

        if (route.name === 'Home') {
          iconName = 'home';
        } else if (route.name === 'Quests') {
          iconName = 'checkbox';
        } else if (route.name === 'Rewards') {
          iconName = 'gift';
        } else if (route.name === 'Profile') {
          iconName = 'person';
        }

        return <Ionicons name={iconName as any} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={ChildHomeScreen} options={{ headerShown: false }} />
    <Tab.Screen name="Quests" component={QuestsScreen} options={{ headerShown: false }} />
    <Tab.Screen name="Rewards" component={RewardsScreen} options={{ headerShown: false }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
  </Tab.Navigator>
);

// Parent Drawer Navigator
const ParentDrawerNavigator = () => (
  <Drawer.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#4CAF50',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      drawerActiveTintColor: '#4CAF50',
      drawerInactiveTintColor: '#333',
      drawerActiveBackgroundColor: '#E8F5E9',
    }}
  >
    <Drawer.Screen 
      name="Home" 
      component={ParentHomeScreen} 
      options={{
        drawerIcon: ({ color, size }) => (
          <Ionicons name="home" size={size} color={color} />
        ),
      }}
    />
    <Drawer.Screen 
      name="Create Quest" 
      component={CreateQuestScreen} 
      options={{
        drawerIcon: ({ color, size }) => (
          <Ionicons name="add-circle" size={size} color={color} />
        ),
      }}
    />
    <Drawer.Screen 
      name="Quests" 
      component={QuestsScreen} 
      options={{
        drawerIcon: ({ color, size }) => (
          <Ionicons name="list" size={size} color={color} />
        ),
      }}
    />
    <Drawer.Screen 
      name="Rewards" 
      component={RewardsScreen} 
      options={{
        drawerIcon: ({ color, size }) => (
          <Ionicons name="gift" size={size} color={color} />
        ),
      }}
    />
    <Drawer.Screen 
      name="Profile" 
      component={ProfileScreen} 
      options={{
        drawerIcon: ({ color, size }) => (
          <Ionicons name="person" size={size} color={color} />
        ),
      }}
    />
  </Drawer.Navigator>
);

const Navigation = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // Show loading screen
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={!user ? 'ModeSelection' : user.type === 'parent' ? 'ParentTabs' : 'ChildTabs'}
      >
        {/* Auth Screens */}
        <Stack.Screen 
          name="ModeSelection" 
          component={ModeSelectionScreen} 
          options={{
            animationTypeForReplace: !user ? 'pop' : 'push',
          }}
        />
        <Stack.Screen name="ParentAuth" component={ParentAuthScreen} />
        <Stack.Screen name="ChildSelection" component={ChildSelectionScreen} />
        
        {/* Main App Screens */}
        <Stack.Screen 
          name="ParentTabs" 
          component={ParentDrawerNavigator} 
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="ChildTabs" 
          component={ChildTabNavigator} 
          options={{
            gestureEnabled: false,
          }}
        />
        
        {/* Common screens */}
        <Stack.Screen name="QuestDetails" component={QuestDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
