import React, { useEffect, useRef } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

// Types
import { RootStackParamList } from '../types/navigation';

// Screens
const ModeSelectionScreen = require('../screens/ModeSelectionScreen').default;
const ParentAuthScreen = require('../screens/parent/ParentAuthScreen').default;
const ChildLoginScreen = require('../screens/child/ChildLoginScreen').default;
const ChildSelectionScreen = require('../screens/ChildSelectionScreen').default;
const ChildHomeScreen = require('../screens/child/ChildHomeScreen').default;
const ParentHomeScreen = require('../screens/parent/ParentHomeScreen').default;
const QuestsScreen = require('../screens/QuestsScreen').default;
const RewardsScreen = require('../screens/RewardsScreen').default;
import ParentProfileScreen from '../screens/parent/ParentProfileScreen';
import ChildProfileScreen from '../screens/child/ChildProfileScreen';
const CreateQuestScreen = require('../screens/parent/CreateQuestScreen').default;
const QuestDetailsScreen = require('../screens/QuestDetailsScreen').default;

// Context
const useAuth = require('../context/AuthContext').useAuth;

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Create a navigation reference to be used for resetting the stack
export const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>();

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
    <Tab.Screen name="Profile" component={ChildProfileScreen} options={{ headerShown: false }} />
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
      component={ParentProfileScreen} 
      options={{
        drawerIcon: ({ color, size }) => (
          <Ionicons name="person" size={size} color={color} />
        ),
      }}
    />
  </Drawer.Navigator>
);

const Navigation = () => {
  const { user, childProfile, isLoading } = useAuth();

  if (isLoading) {
    // Show loading screen
    return null;
  }

  // Helper function to get initial route name based on auth state
  const getInitialRouteName = () => {
    if (!user) return 'ModeSelection';
    if (user.type === 'parent') return 'ParentTabs';
    // If we have a child profile, go directly to child tabs
    if (childProfile) return 'ChildTabs';
    // Otherwise, go to child login
    return 'ChildLogin';
  };
  
  // Set up navigation reference
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  
  // Reset the navigation stack when user logs out
  useEffect(() => {
    if (!user) {
      navigationRef.current?.reset({
        index: 0,
        routes: [{ name: 'ModeSelection' }],
      });
    }
  }, [user]);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={getInitialRouteName()}
      >
        {/* Auth Screens */}
        <Stack.Screen 
          name="ModeSelection" 
          component={ModeSelectionScreen} 
          options={{
            animationTypeForReplace: !user ? 'pop' : 'push',
            // Prevent going back if not authenticated
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="ParentAuth" 
          component={ParentAuthScreen} 
          options={{
            // Only allow going back if user is not authenticated
            gestureEnabled: !user,
          }}
        />
        <Stack.Screen 
          name="ChildLogin" 
          component={ChildLoginScreen}
          options={{
            // Only allow going back to mode selection
            gestureEnabled: false,
            // Prevent going back if already logged in as a child
            headerLeft: () => null,
          }}
        />
        <Stack.Screen 
          name="ChildSelection" 
          component={ChildSelectionScreen}
          options={{
            // Only allow going back to mode selection
            gestureEnabled: false,
          }}
        />
        
        {/* Main App Screens - Protected Routes */}
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
