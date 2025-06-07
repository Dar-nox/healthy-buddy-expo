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
import CreateQuestScreen from '../screens/parent/CreateQuestScreen';
import AddRewardScreen from '../screens/parent/AddRewardScreen';
const QuestDetailsScreen = require('../screens/QuestDetailsScreen').default;

// Context
import { useAuth } from '../context/AuthContext';

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
    console.log('Getting initial route for user:', user?.id, 'type:', user?.type);
    console.log('Child profile exists:', !!childProfile);
    
    if (!user) {
      console.log('No user, going to ModeSelection');
      return 'ModeSelection';
    }
    
    if (user.type === 'parent') {
      console.log('Parent user, going to ParentTabs');
      return 'ParentTabs';
    }
    
    if (user.type === 'child') {
      console.log('Child user, going to ChildTabs');
      return 'ChildTabs';
    }
    
    console.log('Default case, going to ModeSelection');
    return 'ModeSelection';
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
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="ParentAuth" 
          component={ParentAuthScreen} 
          options={{
            gestureEnabled: !user,
          }}
        />
        <Stack.Screen 
          name="ChildLogin" 
          component={ChildLoginScreen}
          options={{
            gestureEnabled: false,
            headerLeft: () => null,
          }}
        />
        <Stack.Screen 
          name="ChildSelection" 
          component={ChildSelectionScreen}
          options={{
            gestureEnabled: false,
          }}
        />
        
        {/* Parent Flow */}
        <Stack.Screen 
          name="ParentTabs" 
          component={ParentDrawerNavigator}
          options={{
            gestureEnabled: false,
          }}
        />
        
        {/* Child Flow */}
        <Stack.Screen 
          name="ChildTabs" 
          component={ChildTabNavigator}
          options={{
            gestureEnabled: false,
          }}
        />
        
        {/* Common Screens */}
        <Stack.Screen 
          name="CreateQuest" 
          component={CreateQuestScreen}
          options={{
            gestureEnabled: true,
          }}
        />
        <Stack.Screen 
          name="AddReward" 
          component={AddRewardScreen}
          options={{
            gestureEnabled: true,
            title: 'Create Reward',
          }}
        />
        <Stack.Screen 
          name="QuestDetails" 
          component={QuestDetailsScreen}
          options={{
            gestureEnabled: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
