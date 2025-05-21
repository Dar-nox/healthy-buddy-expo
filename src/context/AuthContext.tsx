import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, ChildProfile } from '../types';

interface AuthContextType {
  user: User | null;
  childProfile: ChildProfile | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginAsChild: (accessCode: string, avatar: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt' | 'children'>) => Promise<boolean>;
  logout: () => Promise<void>;
  selectChild: (childId: string) => Promise<void>;
  updateUser: (updatedUser: User) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = '@healthy_buddy_user';
const CHILD_PROFILE_STORAGE_KEY = '@healthy_buddy_child_profile';

// Mock user data - in a real app, this would be replaced with API calls
const MOCK_USERS: User[] = [
  {
    id: 'parent1',
    name: 'Parent User',
    email: 'parent@example.com',
    password: 'password123',
    type: 'parent',
    children: [
      {
        id: 'child1',
        name: 'Child One',
        level: 1,
        xp: 0,
        coins: 10,
        avatar: '👦',
        accessCode: 'CHILD1-CODE',
        completedQuests: [],
        inventory: [],
        parentId: 'parent1',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'child2',
        name: 'Child Two',
        level: 2,
        xp: 150,
        coins: 25,
        avatar: '👧',
        accessCode: 'CHILD2-CODE',
        completedQuests: [],
        inventory: [],
        parentId: 'parent1',
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [childProfile, setChildProfile] = useState<ChildProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem(USER_STORAGE_KEY);
        const childJson = await AsyncStorage.getItem(CHILD_PROFILE_STORAGE_KEY);
        
        if (userJson) {
          const parsedUser = JSON.parse(userJson);
          setUser(parsedUser);
          
          if (childJson) {
            setChildProfile(JSON.parse(childJson));
          }
        }
      } catch (error) {
        console.error('Failed to load user data', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // First check mock users (for development)
      let foundUser = MOCK_USERS.find(
        (u) => u.email === email && u.password === password
      );

      // If not found in mock users, check AsyncStorage (for registered users)
      if (!foundUser) {
        const storedUserJson = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (storedUserJson) {
          const storedUser = JSON.parse(storedUserJson);
          if (storedUser.email === email && storedUser.password === password) {
            foundUser = storedUser;
          }
        }
      }

      if (foundUser) {
        // Clone the user to avoid reference issues
        const userToSave = { ...foundUser };
        
        // Ensure children array exists
        if (!userToSave.children) {
          userToSave.children = [];
        }
        
        // Save the full user object to AsyncStorage to preserve children
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userToSave));
        
        // If user has children, store the first child as selected
        if (userToSave.children && userToSave.children.length > 0) {
          await AsyncStorage.setItem(CHILD_PROFILE_STORAGE_KEY, JSON.stringify(userToSave.children[0]));
          setChildProfile(userToSave.children[0]);
        } else {
          // Clear any existing child profile if user has no children
          await AsyncStorage.removeItem(CHILD_PROFILE_STORAGE_KEY);
          setChildProfile(null);
        }
        
        setUser(userToSave);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed', error);
      return false;
    }
  };

  const loginAsChild = async (accessCode: string, avatar: string): Promise<boolean> => {
    try {
      console.log('Attempting child login with access code:', accessCode);
      
      // Search through all users in MOCK_USERS for a child with this access code
      console.log('Searching all users for access code...');
      let foundChild: any = null;
      let parentUser: any = null;
      
      // First check AsyncStorage for the user data
      console.log('Checking AsyncStorage for user data...');
      const userJson = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (userJson) {
        const storedUser = JSON.parse(userJson);
        console.log('Found user in AsyncStorage:', storedUser.email);
        
        // Check if this user has children with the matching access code
        if (storedUser.children) {
          console.log('Checking user\'s children for access code...');
          const child = storedUser.children.find((c: any) => 
            c.accessCode && c.accessCode.toUpperCase() === accessCode.toUpperCase().trim()
          );
          
          if (child) {
            console.log('Found matching child in AsyncStorage user');
            foundChild = child;
            parentUser = storedUser;
          }
        }
      }
      
      // If not found in AsyncStorage, check MOCK_USERS
      if (!foundChild) {
        console.log('Access code not found in AsyncStorage, checking MOCK_USERS...');
        
        for (const user of MOCK_USERS) {
          if (user.children) {
            const child = user.children.find((c: any) => 
              c.accessCode && c.accessCode.toUpperCase() === accessCode.toUpperCase().trim()
            );
            
            if (child) {
              console.log('Found matching child in MOCK_USERS');
              foundChild = child;
              parentUser = user;
              
              // Save this user to AsyncStorage for future logins
              await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
              break;
            }
          }
        }
      }
      
      if (!foundChild || !parentUser) {
        console.log('No child found with access code:', accessCode);
        return false;
      }
      
      console.log('Found matching child:', foundChild);
      
      // Update the child's avatar if a new one is selected
      const updatedChild = { ...foundChild, avatar };
      
      // Update the parent's children array
      const updatedChildren = parentUser.children.map((c: any) => 
        c.id === foundChild.id ? updatedChild : c
      );
      
      // Create the updated parent user
      const updatedUser = {
        ...parentUser,
        children: updatedChildren
      };
      
      // Save the updated user to MOCK_USERS
      const userIndex = MOCK_USERS.findIndex(u => u.id === parentUser.id);
      if (userIndex !== -1) {
        MOCK_USERS[userIndex] = updatedUser;
      }
      
      // Backup the parent user before switching to child
      await AsyncStorage.setItem('parent_user_backup', JSON.stringify(updatedUser));
      
      // Create a child user object with the necessary properties
      const childUser = {
        ...updatedUser,
        id: `child-${foundChild.id}`, // Ensure unique ID for child session
        type: 'child' as const,
        currentChildId: foundChild.id,
        children: undefined, // Remove children array from child user
        name: foundChild.name, // Use child's name for the session
        email: `${foundChild.id}@child.healthybuddy` // Use a dummy email for the child
      };
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(childUser));
      await AsyncStorage.setItem(CHILD_PROFILE_STORAGE_KEY, JSON.stringify(updatedChild));
      
      // Update state
      setUser(childUser);
      setChildProfile(updatedChild);
      
      console.log('Child login successful');
      return true;
    } catch (error) {
      console.error('Child login failed', error);
      return false;
    }
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt' | 'children'>): Promise<boolean> => {
    try {
      // In a real app, this would be an API call
      const newUser: User = {
        ...userData,
        id: `user_${Date.now()}`,
        children: [],
        createdAt: new Date().toISOString(),
      };

      // Add to mock users (in a real app, this would be an API call)
      MOCK_USERS.push(newUser);
      
      // Save the full user object to AsyncStorage to preserve children
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      
      setUser(newUser);
      return true;
    } catch (error) {
      console.error('Registration failed', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // If logging out as a child, we need to restore the parent user
      if (user?.type === 'child') {
        // Get the original parent user from AsyncStorage
        const parentUserJson = await AsyncStorage.getItem('parent_user_backup');
        
        if (parentUserJson) {
          const parentUser = JSON.parse(parentUserJson);
          // Restore the parent user
          await AsyncStorage.setItem(USER_STORAGE_KEY, parentUserJson);
          await AsyncStorage.removeItem('parent_user_backup');
          setUser(parentUser);
        } else {
          // If no parent backup is found, do a full logout
          await AsyncStorage.removeItem(USER_STORAGE_KEY);
          setUser(null);
        }
      } else {
        // Regular logout for parent users
        await AsyncStorage.removeItem(USER_STORAGE_KEY);
        setUser(null);
      }
      
      // Always clear the child profile on logout
      await AsyncStorage.removeItem(CHILD_PROFILE_STORAGE_KEY);
      setChildProfile(null);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const selectChild = async (childId: string): Promise<void> => {
    if (!user || !user.children) return;
    
    const child = user.children.find(c => c.id === childId);
    if (child) {
      await AsyncStorage.setItem(CHILD_PROFILE_STORAGE_KEY, JSON.stringify(child));
      setChildProfile(child);
    }
  };

  const updateUser = async (updatedUser: User): Promise<void> => {
    try {
      console.log('updateUser called with:', JSON.stringify(updatedUser, null, 2));
      
      // In a real app, this would be an API call
      const userIndex = MOCK_USERS.findIndex(u => u.id === updatedUser.id);
      if (userIndex !== -1) {
        MOCK_USERS[userIndex] = updatedUser;
        console.log('Updated user in MOCK_USERS');
      } else {
        MOCK_USERS.push(updatedUser);
        console.log('Added new user to MOCK_USERS');
      }
      
      // Store the full user object in AsyncStorage to preserve children
      console.log('Saving to AsyncStorage:', JSON.stringify(updatedUser, null, 2));
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      
      // Verify the data was saved correctly
      const savedData = await AsyncStorage.getItem(USER_STORAGE_KEY);
      console.log('Data retrieved from AsyncStorage after save:', savedData);
      
      setUser(updatedUser);
      console.log('User state updated');
    } catch (error) {
      console.error('Failed to update user', error);
      throw new Error('Failed to update user. Please try again.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        childProfile,
        login,
        loginAsChild,
        register,
        logout,
        selectChild,
        updateUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
