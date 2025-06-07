import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  User, 
  ChildProfile, 
  Quest, 
  Reward, 
  normalizeCompletedQuest, 
  normalizeRedeemedReward 
} from '../types';

interface AuthContextType {
  user: User | null;
  childProfile: ChildProfile | null;
  quests: Quest[];
  rewards: Reward[];
  children: ChildProfile[];
  login: (email: string, password: string) => Promise<boolean>;
  loginAsChild: (accessCode: string, avatar: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt' | 'children'>) => Promise<boolean>;
  logout: () => Promise<void>;
  selectChild: (childId: string) => Promise<void>;
  updateUser: (updatedUser: User) => Promise<void>;
  createQuest: (quest: Omit<Quest, 'id' | 'createdAt' | 'isCompleted' | 'isVerified' | 'verifiedAt' | 'completedAt'>) => Promise<boolean>;
  completeQuest: (questId: string) => Promise<boolean>;
  removeQuest: (questId: string) => Promise<boolean>;
  createReward: (reward: Omit<Reward, 'id' | 'createdAt' | 'redeemedBy' | 'isActive'>) => Promise<boolean>;
  redeemReward: (rewardId: string, childId: string) => Promise<boolean>;
  getAvailableRewards: (childId: string) => Reward[];
  cleanupTestData: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = '@healthy_buddy_user';
const CHILD_PROFILE_STORAGE_KEY = '@healthy_buddy_child_profile';
const REWARDS_STORAGE_KEY = '@healthy_buddy_rewards';

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
        email: 'child1@example.com',
        password: 'password123',
        type: 'child',
        level: 1,
        xp: 0,
        points: 10,
        avatar: '👦',
        accessCode: 'CHILD1-CODE',
        completedQuests: [],
        redeemedRewards: [],
        parentId: 'parent1',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'child2',
        name: 'Child Two',
        email: 'child2@example.com',
        password: 'password123',
        type: 'child',
        level: 2,
        xp: 150,
        points: 25,
        avatar: '👧',
        accessCode: 'CHILD2-CODE',
        completedQuests: [],
        redeemedRewards: [],
        parentId: 'parent1',
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children: childrenProp }) => {
  const [user, setUser] = useState<User | null>(null);
  const [childProfile, setChildProfile] = useState<ChildProfile | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Get user's children or empty array if no user or user has no children
  const userChildren = user?.children || [];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [userJson, childJson, questsJson, rewardsJson] = await Promise.all([
          AsyncStorage.getItem(USER_STORAGE_KEY),
          AsyncStorage.getItem(CHILD_PROFILE_STORAGE_KEY),
          AsyncStorage.getItem('@healthy_buddy_quests'),
          AsyncStorage.getItem(REWARDS_STORAGE_KEY)
        ]);
        
        if (userJson) {
          const parsedUser = JSON.parse(userJson);
          setUser(parsedUser);
          
          if (childJson) {
            setChildProfile(JSON.parse(childJson));
          }
        }
        
        if (questsJson) {
          let parsedQuests = JSON.parse(questsJson);
          if (Array.isArray(parsedQuests)) {
            // Clean up any orphaned quests during load
            parsedQuests = await cleanupOrphanedQuests(parsedQuests);
            setQuests(parsedQuests);
          } else {
            setQuests([]);
          }
        } else {
          setQuests([]);
        }
        
        if (rewardsJson) {
          const parsedRewards = JSON.parse(rewardsJson);
          setRewards(Array.isArray(parsedRewards) ? parsedRewards : []);
        } else {
          setRewards([]);
        }
      } catch (error) {
        console.error('Failed to load data', error);
        setQuests([]);
        setRewards([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Function to clean up orphaned quests
  const cleanupOrphanedQuests = async (allQuests: Quest[]) => {
    try {
      // Get all users to check for valid creators
      const usersJson = await AsyncStorage.getItem('@healthy_buddy_users');
      const users: User[] = usersJson ? JSON.parse(usersJson) : [];
      
      // Get current user to check for parent-child relationships
      const currentUserJson = await AsyncStorage.getItem(USER_STORAGE_KEY);
      const currentUser = currentUserJson ? JSON.parse(currentUserJson) : null;
      
      // Filter out quests where the creator doesn't exist or isn't the current user/parent
      const validQuests = allQuests.filter(quest => {
        // Keep quests created by the current user
        if (quest.createdBy === currentUser?.id) return true;
        
        // Keep quests created by the current user's parent (for child accounts)
        if (currentUser?.parentId && quest.createdBy === currentUser.parentId) return true;
        
        // Keep quests created by known users (for admin views)
        if (users.some(u => u.id === quest.createdBy)) return true;
        
        console.log('Removing orphaned quest:', quest.id, 'created by', quest.createdBy);
        return false;
      });
      
      // Only update if we removed some quests
      if (validQuests.length !== allQuests.length) {
        console.log(`Cleaned up ${allQuests.length - validQuests.length} orphaned quests`);
        await AsyncStorage.setItem('@healthy_buddy_quests', JSON.stringify(validQuests));
        return validQuests;
      }
      
      return allQuests;
    } catch (error) {
      console.error('Error cleaning up orphaned quests:', error);
      return allQuests;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsChild = async (accessCode: string, avatar: string): Promise<boolean> => {
    console.log('Attempting child login with access code:', accessCode);
    setIsLoading(true);
    try {
      
      // Search for a child with this access code in MOCK_USERS
      console.log('Searching for child with access code...');
      let foundChild: ChildProfile | null = null;
      let parentUser: User | null = null;
      
      // Check MOCK_USERS first
      for (const user of MOCK_USERS) {
        if (user.children) {
          const child = user.children.find((c: ChildProfile) =>
            c.accessCode && c.accessCode.toUpperCase() === accessCode.toUpperCase().trim()
          );
          
          if (child) {
            console.log('Found matching child in MOCK_USERS');
            foundChild = { ...child }; // Create a copy to avoid reference issues
            parentUser = { ...user }; // Create a copy of parent user
            break;
          }
        }
      }
      
      // If not found in MOCK_USERS, check AsyncStorage
      if (!foundChild) {
        console.log('Access code not found in MOCK_USERS, checking AsyncStorage...');
        const userJson = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (userJson) {
          const storedUser = JSON.parse(userJson) as User;
          
          if (storedUser.children) {
            const child = storedUser.children.find((c: ChildProfile) =>
              c.accessCode && c.accessCode.toUpperCase() === accessCode.toUpperCase().trim()
            );
            
            if (child) {
              console.log('Found matching child in AsyncStorage');
              foundChild = { ...child };
              parentUser = { ...storedUser };
            }
          }
        }
      }

      if (!foundChild || !parentUser) {
        console.log('No child found with access code:', accessCode);
        Alert.alert('Error', 'Invalid access code. Please try again.');
        setIsLoading(false);
        return false;
      }

      // Update child's avatar if provided
      const updatedChild: ChildProfile = { 
        ...foundChild,
        ...(avatar ? { avatar } : {}) 
      };

      // Update the parent's children array with the updated child
      const updatedChildren = (parentUser.children || []).map((c: ChildProfile) =>
        c.id === updatedChild.id ? updatedChild : c
      );

      // Create updated parent user
      const updatedUser: User = {
        ...parentUser,
        children: updatedChildren
      };

      // Save updated user to AsyncStorage
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

      // Get all quests and update them if needed
      const questsJson = await AsyncStorage.getItem('@healthy_buddy_quests');
      const currentQuests = questsJson ? JSON.parse(questsJson) as Quest[] : [];
      
      if (Array.isArray(currentQuests)) {
        let needsUpdate = false;
        const updatedQuests = currentQuests.map((quest: Quest) => {
          // If this quest was created by the parent and the child isn't already assigned
          if (quest.createdBy === updatedUser.id && 
              (!quest.assignedTo || 
               (Array.isArray(quest.assignedTo) && !quest.assignedTo.includes(updatedChild.id)))) {
            needsUpdate = true;
            return {
              ...quest,
              assignedTo: [...(quest.assignedTo || []), updatedChild.id]
            };
          }
          return quest;
        });

        // Save updated quests if any changes were made
        if (needsUpdate) {
          console.log('Updating quests with new child assignments');
          await AsyncStorage.setItem('@healthy_buddy_quests', JSON.stringify(updatedQuests));
          setQuests(updatedQuests);
        }
      }
      
      // Store the child profile in AsyncStorage
      await AsyncStorage.setItem(CHILD_PROFILE_STORAGE_KEY, JSON.stringify(updatedChild));
      
      // For child login, we don't set the parent user as the current user
      // Instead, we create a complete user object representing the child with all necessary fields
      // First, get the existing child user data to preserve all fields
      const existingChildUserJson = await AsyncStorage.getItem(USER_STORAGE_KEY);
      let existingChildUser = null;
      
      if (existingChildUserJson) {
        try {
          const parsed = JSON.parse(existingChildUserJson);
          if (parsed && parsed.id === updatedChild.id) {
            existingChildUser = parsed;
          }
        } catch (e) {
          console.error('Error parsing existing child user:', e);
        }
      }
      
      // Create the child user object, preserving all existing data
      const childUser: User = {
        ...(existingChildUser || {}), // Preserve all existing data if available
        id: updatedChild.id,
        name: updatedChild.name,
        email: updatedChild.email || `${updatedChild.id}@child.healthybuddy`,
        password: updatedChild.password || 'child-account-no-password',
        type: 'child' as const,
        children: [],
        // Only set points to 0 if it's a new child, otherwise preserve existing points
        points: existingChildUser?.points !== undefined ? existingChildUser.points : (updatedChild.points || 0),
        level: existingChildUser?.level || updatedChild.level || 1,
        xp: existingChildUser?.xp || updatedChild.xp || 0,
        accessCode: updatedChild.accessCode || '',
        completedQuests: existingChildUser?.completedQuests || updatedChild.completedQuests || [],
        redeemedRewards: existingChildUser?.redeemedRewards || updatedChild.redeemedRewards || [],
        parentId: parentUser.id,
        avatar: updatedChild.avatar || '👦',
        // Preserve the original creation date if it exists
        createdAt: existingChildUser?.createdAt || updatedChild.createdAt || new Date().toISOString()
      };

      // Set the child user and profile in state
      setUser(childUser);
      setChildProfile(updatedChild);
      
      // Save the child user to AsyncStorage
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(childUser));
      
      console.log('Child login successful - Child user:', JSON.stringify(childUser, null, 2));
      console.log('Child profile set to:', JSON.stringify(updatedChild, null, 2));
      
      // Ensure we have the latest state before proceeding
      await new Promise(resolve => setTimeout(resolve, 100));
      return true;
    } catch (error) {
      console.error('Error in loginAsChild:', error);
      Alert.alert('Error', 'Failed to log in as child');
      return false;
    } finally {
      setIsLoading(false);
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

  // Helper function to sync child data back to parent
  const syncChildToParent = async (childData: ChildProfile) => {
    try {
      console.log('[syncChildToParent] Starting sync for child:', childData.id, childData.name);
      console.log('[syncChildToParent] Child data to sync:', JSON.stringify(childData, null, 2));
      
      // First, try to get the current parent user from backup
      let parentUserJson = await AsyncStorage.getItem('parent_user_backup');
      
      // If no backup exists, try to get the current user as parent
      if (!parentUserJson) {
        console.log('[syncChildToParent] No parent user backup found, trying to get current user');
        parentUserJson = await AsyncStorage.getItem(USER_STORAGE_KEY);
        
        if (!parentUserJson) {
          console.error('[syncChildToParent] No user data found in AsyncStorage');
          return false;
        }
      }

      let parentUser;
      try {
        parentUser = JSON.parse(parentUserJson);
        console.log('[syncChildToParent] Loaded parent user:', parentUser?.id, parentUser?.name);
      } catch (e) {
        console.error('[syncChildToParent] Error parsing parent user JSON:', e);
        return false;
      }
      
      // Ensure parent has children array, initialize if it doesn't exist
      if (!parentUser.children || !Array.isArray(parentUser.children)) {
        console.log('[syncChildToParent] Initializing empty children array for parent');
        parentUser.children = [];
      }
      
      // Find the index of the child to update
      const childIndex = parentUser.children.findIndex((c: ChildProfile) => c.id === childData.id);
      
      // If child not found, add them to the children array
      if (childIndex === -1) {
        console.log(`[syncChildToParent] Child ${childData.id} not found in parent's children, adding new child`);
        parentUser.children.push(childData);
      } else {
        // Create a deep copy of the parent's children array
        const updatedChildren = [...parentUser.children];
        
        // Get the existing child data to preserve any fields not in childData
        const existingChild = updatedChildren[childIndex];
        
        console.log('[syncChildToParent] Existing child data:', JSON.stringify(existingChild, null, 2));
        
        // Normalize the quest and reward data
        const normalizedCompletedQuests = [
          ...(childData.completedQuests || []),
          ...(existingChild?.completedQuests || [])
        ].map(normalizeCompletedQuest);
        
        const normalizedRedeemedRewards = [
          ...(childData.redeemedRewards || []),
          ...(existingChild?.redeemedRewards || [])
        ].map(normalizeRedeemedReward);
        
        // Update the child data, preserving any existing fields not in childData
        updatedChildren[childIndex] = {
          ...(existingChild || {}), // Keep all existing fields if they exist
          ...childData,    // Apply updates from childData
          // Ensure these critical fields are always preserved from the latest data
          points: childData.points !== undefined ? childData.points : (existingChild?.points || 0),
          xp: childData.xp !== undefined ? childData.xp : (existingChild?.xp || 0),
          level: childData.level !== undefined ? childData.level : (existingChild?.level || 1),
          completedQuests: normalizedCompletedQuests,
          redeemedRewards: normalizedRedeemedRewards
        };
        
        parentUser.children = updatedChildren;
      }

      // Ensure we have all required fields for the parent user
      const updatedParentUser = { 
        ...parentUser,
        children: parentUser.children.map((child: ChildProfile) => {
          // Normalize quest and reward data for each child
          const normalizedCompletedQuests = (child.completedQuests || []).map(normalizeCompletedQuest);
          const normalizedRedeemedRewards = (child.redeemedRewards || []).map(normalizeRedeemedReward);
          
          return {
            ...child,
            points: child.points || 0,
            xp: child.xp || 0,
            level: child.level || 1,
            completedQuests: normalizedCompletedQuests,
            redeemedRewards: normalizedRedeemedRewards
          };
        })
      };
      
      console.log('[syncChildToParent] Updated parent user:', JSON.stringify(updatedParentUser, null, 2));
      
      try {
        // Save the updated parent user to both storage locations
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedParentUser));
        await AsyncStorage.setItem('parent_user_backup', JSON.stringify(updatedParentUser));
        console.log('[syncChildToParent] Successfully saved updated parent data');
      } catch (e) {
        console.error('[syncChildToParent] Error saving parent data:', e);
        return false;
      }
      
      console.log('[syncChildToParent] Successfully synced child data to parent');
      return true;
    } catch (error) {
      console.error('Failed to sync child data to parent:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // If logging out as a child, sync data back to parent first
      if (user?.type === 'child' && childProfile) {
        console.log('Syncing child data before logout...');
        
        // Get the current child data from state to ensure we have the latest
        const currentChildData: ChildProfile = {
          ...childProfile,
          points: user.points !== undefined ? user.points : childProfile.points,
          xp: user.xp !== undefined ? user.xp : childProfile.xp,
          level: user.level !== undefined ? user.level : childProfile.level,
          completedQuests: [
            ...(Array.isArray(user.completedQuests) ? user.completedQuests.map(normalizeCompletedQuest) : []),
            ...(Array.isArray(childProfile.completedQuests) ? childProfile.completedQuests.map(normalizeCompletedQuest) : [])
          ],
          redeemedRewards: [
            ...(Array.isArray(user.redeemedRewards) ? user.redeemedRewards.map(normalizeRedeemedReward) : []),
            ...(Array.isArray(childProfile.redeemedRewards) ? childProfile.redeemedRewards.map(normalizeRedeemedReward) : [])
          ]
        };
        
        console.log('Current child data before sync:', JSON.stringify(currentChildData, null, 2));
        
        // Sync the latest child data back to parent
        const syncSuccess = await syncChildToParent(currentChildData);
        
        if (!syncSuccess) {
          console.error('Failed to sync child data to parent before logout');
          // Continue with logout even if sync fails to prevent getting stuck
        }
        
        // Get the original parent user from backup
        const parentUserJson = await AsyncStorage.getItem('parent_user_backup');
        
        if (parentUserJson) {
          try {
            const parentUser = JSON.parse(parentUserJson);
            
            // Ensure we have the latest parent data by reloading it
            const updatedParentUserJson = await AsyncStorage.getItem(USER_STORAGE_KEY);
            const updatedParentUser = updatedParentUserJson ? JSON.parse(updatedParentUserJson) : parentUser;
            
            console.log('Restoring parent user after child logout:', 
              JSON.stringify(updatedParentUser, null, 2));
            
            // Update the parent user in state and storage
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedParentUser));
            setUser(updatedParentUser);
          } catch (e) {
            console.error('Error restoring parent user:', e);
            // If there's an error, do a full logout to prevent data corruption
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
            setUser(null);
          }
        } else {
          console.log('No parent user backup found, performing full logout');
          // If no parent backup is found, do a full logout
          await AsyncStorage.removeItem(USER_STORAGE_KEY);
          setUser(null);
        }
      } else {
        // Regular logout for parent users
        console.log('Performing parent user logout');
        await AsyncStorage.removeItem(USER_STORAGE_KEY);
        setUser(null);
      }
      
      // Always clear the child profile on logout
      console.log('Clearing child profile from state and storage');
      await AsyncStorage.removeItem(CHILD_PROFILE_STORAGE_KEY);
      setChildProfile(null);
      
      // Clear the parent backup when fully logging out
      if (user?.type !== 'child') {
        console.log('Clearing parent user backup');
        await AsyncStorage.removeItem('parent_user_backup');
      }
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const selectChild = async (childId: string): Promise<void> => {
    if (!user?.children) return;
    
    const child = user.children.find((c: ChildProfile) => c.id === childId);
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

  const createQuest = async (questData: Omit<Quest, 'id' | 'createdAt' | 'isCompleted' | 'isVerified' | 'verifiedAt' | 'completedAt'>): Promise<boolean> => {
    try {
      console.log('Creating new quest with data:', JSON.stringify(questData, null, 2));
      
      const newQuest: Quest = {
        ...questData,
        id: `quest-${Date.now()}`,
        isCompleted: false,
        isVerified: false,
        completedAt: undefined,
        verifiedAt: undefined,
        createdAt: new Date().toISOString(),
      };
      
      console.log('New quest created:', JSON.stringify(newQuest, null, 2));
      
      const updatedQuests = [...(quests || []), newQuest];
      console.log('Updated quests array:', JSON.stringify(updatedQuests, null, 2));
      
      await AsyncStorage.setItem('@healthy_buddy_quests', JSON.stringify(updatedQuests));
      setQuests(updatedQuests);
      
      console.log('Quest successfully saved to AsyncStorage');
      return true;
    } catch (error) {
      console.error('Failed to create quest:', error);
      return false;
    }
  };

  const completeQuest = async (questId: string): Promise<boolean> => {
    try {
      const quest = quests.find(q => q.id === questId);
      if (!quest) return false;

      // Mark quest as completed
      const updatedQuests = quests.map(q => 
        q.id === questId 
          ? { ...q, isCompleted: true, completedAt: new Date().toISOString() }
          : q
      );
      
      setQuests(updatedQuests);
      await AsyncStorage.setItem('@healthy_buddy_quests', JSON.stringify(updatedQuests));

      // If user is a child, award XP and points
      if (user?.type === 'child' && childProfile) {
        const xpReward = quest.xpReward || 0;
        const pointReward = quest.coinReward || 0;
        
        // Update child's XP and points with proper type normalization
        const updatedChild: ChildProfile = {
          ...childProfile,
          xp: (childProfile.xp || 0) + xpReward,
          points: (childProfile.points || 0) + pointReward,
          completedQuests: [
            ...(childProfile.completedQuests || []).map(normalizeCompletedQuest),
            {
              id: questId,
              title: quest.title,
              completedAt: new Date().toISOString(),
              pointsEarned: pointReward,
              category: quest.category || 'general'
            }
          ]
        };

        // Update child profile in state and storage first
        setChildProfile(updatedChild);
        await AsyncStorage.setItem(CHILD_PROFILE_STORAGE_KEY, JSON.stringify(updatedChild));
        
        // Sync the updated child data back to the parent
        await syncChildToParent(updatedChild);
        
        // If we have a parent user in state, update it to reflect the changes
        const parentUserJson = await AsyncStorage.getItem('parent_user_backup');
        if (parentUserJson) {
          const parentUser = JSON.parse(parentUserJson);
          if (parentUser.children) {
            const updatedChildren = parentUser.children.map((child: ChildProfile) => 
              child.id === updatedChild.id ? updatedChild : child
            );
            
            const updatedParentUser = {
              ...parentUser,
              children: updatedChildren
            };
            
            await AsyncStorage.setItem('parent_user_backup', JSON.stringify(updatedParentUser));
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to complete quest', error);
      return false;
    }
  };

  const removeQuest = async (questId: string): Promise<boolean> => {
    try {
      const updatedQuests = quests.filter(quest => quest.id !== questId);
      setQuests(updatedQuests);
      await AsyncStorage.setItem('@healthy_buddy_quests', JSON.stringify(updatedQuests));
      return true;
    } catch (error) {
      console.error('Failed to remove quest', error);
      return false;
    }
  };

  // Clean up old test data and ensure quests are properly assigned
  const cleanupTestData = async (): Promise<void> => {
    try {
      console.log('Starting test data cleanup...');
      const questsJson = await AsyncStorage.getItem('@healthy_buddy_quests');
      if (!questsJson) return;
      
      const allQuests: Quest[] = JSON.parse(questsJson);
      if (!Array.isArray(allQuests)) return;
      
      // Get current user data
      const userJson = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (!userJson) return;
      
      const currentUser: User = JSON.parse(userJson);
      
      // Filter out quests that don't belong to the current user or their children
      const validQuests = allQuests.filter(quest => {
        // Keep quests created by the current user
        if (quest.createdBy === currentUser.id) return true;
        
        // For parent users, keep quests created by their children
        if (currentUser.type === 'parent' && currentUser.children) {
          return currentUser.children.some(child => child.id === quest.createdBy);
        }
        
        // For child users, keep quests created by their parent
        if (currentUser.type === 'child' && currentUser.parentId) {
          return quest.createdBy === currentUser.parentId;
        }
        
        console.log('Removing orphaned quest during cleanup:', quest.id);
        return false;
      });
      
      // Only update if we made changes
      if (validQuests.length !== allQuests.length) {
        console.log(`Cleaned up ${allQuests.length - validQuests.length} orphaned quests`);
        await AsyncStorage.setItem('@healthy_buddy_quests', JSON.stringify(validQuests));
        setQuests(validQuests);
      }
      
      // Ensure all quests have required fields
      const updatedQuests = validQuests.map(quest => ({
        ...quest,
        assignedTo: Array.isArray(quest.assignedTo) ? quest.assignedTo : [],
        isCompleted: quest.isCompleted || false,
        isVerified: quest.isVerified || false
      }));
      
      if (JSON.stringify(updatedQuests) !== JSON.stringify(validQuests)) {
        await AsyncStorage.setItem('@healthy_buddy_quests', JSON.stringify(updatedQuests));
        setQuests(updatedQuests);
      }
      
      console.log('Test data cleanup completed');
    } catch (error) {
      console.error('Error during test data cleanup:', error);
    }
  };

  // Create a new reward
  const createReward = async (rewardData: Omit<Reward, 'id' | 'createdAt' | 'redeemedBy' | 'isActive'>): Promise<boolean> => {
    try {
      const newReward: Reward = {
        ...rewardData,
        id: `reward_${Date.now()}`,
        createdAt: new Date().toISOString(),
        redeemedBy: [],
        isActive: true,
      };
      
      const updatedRewards = [...rewards, newReward];
      setRewards(updatedRewards);
      await AsyncStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(updatedRewards));
      return true;
    } catch (error) {
      console.error('Error creating reward:', error);
      return false;
    }
  };

  // Redeem a reward
  const redeemReward = async (rewardId: string, childId: string): Promise<boolean> => {
    try {
      console.log('Attempting to redeem reward:', { rewardId, childId });
      
      const rewardIndex = rewards.findIndex(r => r.id === rewardId);
      if (rewardIndex === -1) {
        console.log('Reward not found');
        return false;
      }
      
      const reward = rewards[rewardIndex];
      const rewardCost = Number(reward.cost) || 0;
      
      // Get the current user (either parent or child)
      const currentUser = user;
      if (!currentUser) {
        console.log('No user logged in');
        return false;
      }
      
      // Handle both parent and child user scenarios
      let childData: ChildProfile | undefined;
      
      if (currentUser.type === 'parent') {
        // If parent, find the child in their children array
        childData = currentUser.children?.find(c => c.id === childId);
      } else if (currentUser.type === 'child' && currentUser.id === childId) {
        // If child, use their own data
        childData = { ...currentUser } as ChildProfile;
      }
      
      if (!childData) {
        console.log('Child not found');
        return false;
      }
      
      // Ensure points are treated as numbers and handle undefined/NaN cases
      const childPoints = Number(childData.points) || 0;
      
      console.log('=== DEBUG POINTS ===');
      console.log('Child object:', JSON.stringify(childData, null, 2));
      console.log('Child points (raw):', childData.points);
      console.log('Child points (parsed):', childPoints);
      console.log('Reward cost:', rewardCost);
      
      // Check if child has enough points
      if (childPoints < rewardCost) {
        console.log('Not enough points. Needed:', rewardCost, 'Has:', childPoints);
        return false;
      }
      
      // Update points and mark reward as redeemed
      const updatedPoints = Math.max(0, childPoints - rewardCost);
      
      const rewardData = {
        id: rewardId,
        name: reward.title,
        cost: rewardCost,
        redeemedAt: new Date().toISOString(),
        category: reward.category || 'other'
      };

      if (currentUser.type === 'parent') {
        // Update parent's child data with proper type normalization
        const updatedChildren = (currentUser.children || []).map(child => {
          if (child.id === childId) {
            const existingRewards = (child.redeemedRewards || []).map(normalizeRedeemedReward);
            return { 
              ...child, 
              points: updatedPoints,
              redeemedRewards: [...existingRewards, rewardData]
            };
          }
          return child;
        });
        
        const updatedUser: User = {
          ...currentUser,
          children: updatedChildren
        };
        
        setUser(updatedUser);
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      } else {
        // For child users, update their own points and childProfile state
        const existingRewards = (currentUser.redeemedRewards || []).map(normalizeRedeemedReward);
        const updatedChild = { 
          ...currentUser, 
          points: updatedPoints,
          redeemedRewards: [...existingRewards, rewardData],
        } as User;
        
        // Also update the childProfile state if it exists
        if (childProfile) {
          const childExistingRewards = (childProfile.redeemedRewards || []).map(normalizeRedeemedReward);
          const updatedProfile: ChildProfile = {
            ...childProfile,
            points: updatedPoints,
            redeemedRewards: [...childExistingRewards, rewardData]
          };
          
          setChildProfile(updatedProfile);
          await AsyncStorage.setItem(CHILD_PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
          
          // Sync the updated child data back to the parent
          await syncChildToParent(updatedProfile);
          
          // Also update the parent_user_backup if it exists
          const parentUserJson = await AsyncStorage.getItem('parent_user_backup');
          if (parentUserJson) {
            const parentUser = JSON.parse(parentUserJson);
            if (parentUser.children) {
              const updatedChildren = parentUser.children.map((child: ChildProfile) => 
                child.id === updatedProfile.id ? updatedProfile : child
              );
              
              const updatedParentUser = {
                ...parentUser,
                children: updatedChildren
              };
              
              await AsyncStorage.setItem('parent_user_backup', JSON.stringify(updatedParentUser));
            }
          }
        }
        
        setUser(updatedChild);
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedChild));
      }
      
      // Update reward with new redemption
      const updatedRewards = rewards.map(r => 
        r.id === rewardId
          ? {
              ...r,
              redeemedBy: [...(r.redeemedBy || []), childId]
            }
          : r
      );
      
      setRewards(updatedRewards);
      await AsyncStorage.setItem('@healthy_buddy_rewards', JSON.stringify(updatedRewards));
      
      console.log('Reward redeemed successfully');
      return true;
    } catch (error) {
      console.error('Error redeeming reward:', error);
      return false;
    }
  };

  // Get available rewards for a specific child
  const getAvailableRewards = (childId: string): Reward[] => {
    return rewards.filter(reward => {
      // Check if reward is active
      if (!reward.isActive) return false;
      
      // Check if reward is global or assigned to this child
      const isAssigned = reward.isGlobal || 
                       (reward.assignedTo && reward.assignedTo.includes(childId));
      
      if (!isAssigned) return false;
      
      // Check if reward has reached max redemptions
      if (reward.maxRedemptions && (reward.redeemedBy?.length || 0) >= reward.maxRedemptions) {
        return false;
      }
      
      // Check if child has already redeemed this reward (if it's not repeatable)
      if (reward.redeemedBy?.includes(childId) && !reward.maxRedemptions) {
        return false;
      }
    });
  };



  const contextValue: AuthContextType = {
    user,
    childProfile,
    quests,
    rewards,
    children: userChildren,
    login,
    loginAsChild,
    register,
    logout,
    selectChild,
    updateUser,
    createQuest,
    completeQuest,
    removeQuest,
    createReward,
    redeemReward,
    getAvailableRewards: (childId: string) => {
      return rewards.filter(reward => {
        const isAssigned = reward.isGlobal || reward.assignedTo?.includes(childId);
        const canRedeem = !reward.redeemedBy?.includes(childId) &&
          (!reward.maxRedemptions || (reward.redeemedBy?.length || 0) < reward.maxRedemptions);
        return isAssigned && canRedeem;
      });
    },
    cleanupTestData: async () => {
      try {
        // Clean up orphaned quests
        const updatedQuests = quests.filter(quest => {
          // Keep quests that are assigned to valid children or have no assignments
          return quest.assignedTo.every(childId =>
            userChildren.some((child: ChildProfile) => child.id === childId)
          ) || quest.assignedTo.length === 0;
        });

        // Clean up rewards
        const updatedRewards = rewards.filter(reward => {
          // Keep rewards that are assigned to valid children or are global
          return (reward.assignedTo || []).every(childId =>
            userChildren.some((child: ChildProfile) => child.id === childId)
          ) || reward.isGlobal;
        });

        setQuests(updatedQuests);
        setRewards(updatedRewards);

        // Save to storage
        await AsyncStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(updatedRewards));

        Alert.alert('Success', 'Orphaned data has been cleaned up');
      } catch (error) {
        console.error('Error cleaning up data:', error);
        Alert.alert('Error', 'Failed to clean up data');
      }
    },
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {childrenProp}
    </AuthContext.Provider>
  );
};

const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the AuthContext as default
export { useAuth };
export default AuthContext;
