export type RootStackParamList = {
  ModeSelection: undefined;
  ParentAuth: { mode: 'login' | 'signup' };
  ChildLogin: undefined;
  ChildSelection: undefined;
  ChildTabs: undefined;
  ParentTabs: undefined;
  CreateQuest: undefined;
  QuestDetails: { questId: string };
  Quests: undefined;
  Rewards: undefined;
  ParentProfile: undefined;
  ChildProfile: undefined;
};

// This helps with type checking and auto-completion for navigation props
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
