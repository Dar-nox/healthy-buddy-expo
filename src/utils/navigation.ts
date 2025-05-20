import { NavigationContainerRef } from '@react-navigation/native';

type RootStackParamList = {
  ModeSelection: undefined;
  ParentAuth: { mode: 'login' | 'signup' };
  ChildSelection: undefined;
  ChildTabs: undefined;
  ParentTabs: undefined;
  CreateQuest: undefined;
  QuestDetails: { questId: string };
  Quests: undefined;
  Rewards: undefined;
  Profile: undefined;
};

// This file is now used for type definitions only
// Navigation logic is handled through React Navigation's built-in methods
