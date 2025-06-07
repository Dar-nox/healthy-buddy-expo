export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  type: 'parent' | 'child';
  children?: ChildProfile[];
  avatar?: string;
  points?: number;
  level?: number;
  xp?: number;
  accessCode?: string;
  completedQuests?: (CompletedQuest | string)[]; // Support both old (string) and new (object) types during migration
  redeemedRewards?: (RedeemedReward | string)[]; // Support both old (string) and new (object) types during migration
  parentId?: string; // Only present for child users, references the parent's user ID
  createdAt: string;
};

// Helper type to normalize quest/reward data
type NormalizedArray<T extends object> = (T | string)[];

export interface CompletedQuest {
  id: string;
  title: string;
  completedAt: string;
  pointsEarned: number;
  category: string;
}

export interface RedeemedReward {
  id: string;
  name: string;
  cost: number;
  redeemedAt: string;
  category: string;
}

// Helper function type to normalize quest/reward data
type NormalizeFunction<T extends object> = (item: T | string) => T;

export interface ChildProfile extends Omit<User, 'completedQuests' | 'redeemedRewards'> {
  parentId: string;
  points: number;
  level: number;
  xp: number;
  avatar: string;
  accessCode: string;
  completedQuests: CompletedQuest[];
  redeemedRewards: RedeemedReward[];
  inventory?: string[]; // Optional for backward compatibility
}

// Helper function to normalize quest data
export const normalizeCompletedQuest = (quest: CompletedQuest | string): CompletedQuest => {
  if (typeof quest === 'string') {
    // If it's just a string ID, create a minimal CompletedQuest object
    return {
      id: quest,
      title: 'Completed Quest',
      completedAt: new Date().toISOString(),
      pointsEarned: 0,
      category: 'general'
    };
  }
  return quest;
};

// Helper function to normalize reward data
export const normalizeRedeemedReward = (reward: RedeemedReward | string): RedeemedReward => {
  if (typeof reward === 'string') {
    // If it's just a string ID, create a minimal RedeemedReward object
    return {
      id: reward,
      name: 'Redeemed Reward',
      cost: 0,
      redeemedAt: new Date().toISOString(),
      category: 'other'
    };
  }
  return reward;
};

export type InventoryItem = {
  id: string;
  name: string;
  type: 'avatar' | 'background' | 'item' | 'badge';
  image: string;
  unlocked: boolean;
  unlockedAt?: string;
};

export type Quest = {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  coinReward: number;
  category: 'eating' | 'activity' | 'hygiene' | 'sleep' | 'custom';
  isCustom: boolean;
  isCompleted: boolean;
  isVerified: boolean;
  proofRequired: boolean;
  proofType?: 'text' | 'image' | 'none';
  proofContent?: string;
  assignedTo: string[];
  createdBy: string;
  createdAt: string;
  completedAt?: string;
  verifiedAt?: string;
};

export type Meal = {
  id: string;
  name: string;
  description: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ingredients: string[];
  estimatedPrepTime: number; // in minutes
  estimatedCost?: number;
  image?: string;
  createdBy: string;
  createdAt: string;
};

export type LeaderboardEntry = {
  userId: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  rank: number;
};

export type Reward = {
  id: string;
  title: string;
  description: string;
  cost: number;
  type: 'physical' | 'privilege' | 'virtual';
  icon: string;
  isActive: boolean;
  createdBy: string; // Parent user ID who created the reward
  createdAt: string;
  redeemedBy?: string[]; // Array of child user IDs who have redeemed this reward
  maxRedemptions?: number; // Maximum number of times this reward can be redeemed (optional)
  category: 'home' | 'entertainment' | 'food' | 'other';
  isGlobal: boolean; // If true, available to all children; if false, assigned to specific children
  assignedTo?: string[]; // Array of child user IDs this reward is assigned to (if not global)
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'quest_completed' | 'quest_verified' | 'level_up' | 'reward_unlocked' | 'system';
  isRead: boolean;
  createdAt: string;
  data?: any;
};
