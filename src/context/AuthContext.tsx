import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, ChildProfile } from '../types';

interface AuthContextType {
  user: User | null;
  childProfile: ChildProfile | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt' | 'children'>) => Promise<boolean>;
  logout: () => Promise<void>;
  selectChild: (childId: string) => Promise<void>;
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
      // In a real app, this would be an API call
      const foundUser = MOCK_USERS.find(
        (u) => u.email === email && u.password === password
      );

      if (foundUser) {
        // Clone the user to avoid reference issues
        const userToSave = { ...foundUser };
        
        // Don't store children in the user object in AsyncStorage to keep it small
        const { children, ...userWithoutChildren } = userToSave;
        
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userWithoutChildren));
        
        // If user has children, store the first child as selected
        if (children && children.length > 0) {
          await AsyncStorage.setItem(CHILD_PROFILE_STORAGE_KEY, JSON.stringify(children[0]));
          setChildProfile(children[0]);
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
      
      // Don't store children in the user object in AsyncStorage to keep it small
      const { children, ...userWithoutChildren } = newUser;
      
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userWithoutChildren));
      
      setUser(newUser);
      return true;
    } catch (error) {
      console.error('Registration failed', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      await AsyncStorage.removeItem(CHILD_PROFILE_STORAGE_KEY);
      setUser(null);
      setChildProfile(null);
    } catch (error) {
      console.error('Logout failed', error);
      throw error; // Re-throw to allow components to handle the error if needed
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

  return (
    <AuthContext.Provider
      value={{
        user,
        childProfile,
        login,
        register,
        logout,
        selectChild,
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
