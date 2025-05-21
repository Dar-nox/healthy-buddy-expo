export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  type: 'parent' | 'child';
  children?: ChildProfile[];
  avatar?: string;
  createdAt: string;
};

export type ChildProfile = {
  id: string;
  name: string;
  level: number;
  xp: number;
  coins: number;
  avatar: string;
  accessCode: string;
  completedQuests: string[];
  inventory: InventoryItem[];
  parentId: string;
  createdAt: string;
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
  name: string;
  description: string;
  cost: number;
  type: 'avatar' | 'background' | 'item' | 'badge';
  image: string;
  unlocked: boolean;
  category: 'common' | 'rare' | 'epic' | 'legendary';
  requiredLevel: number;
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
