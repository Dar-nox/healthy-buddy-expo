import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';

type QuestsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Quests'>;

type Props = {
  navigation: QuestsScreenNavigationProp;
};

const QuestsScreen: React.FC<Props> = ({ navigation }) => {
  const { user, childProfile, quests, completeQuest, removeQuest, isLoading } = useAuth();
  
  console.log('QuestsScreen rendered with quests:', JSON.stringify(quests, null, 2));
  console.log('Current user:', user?.type);
  console.log('Child profile:', childProfile);
  
  // Ensure quests is always an array
  const safeQuests = Array.isArray(quests) ? quests : [];
  console.log('Safe quests:', safeQuests);
  
  // Show loading state while quests are being loaded
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading quests...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Filter quests based on user type
  const { dailyQuests, weeklyQuests } = useMemo(() => {
    console.log('Filtering quests...');
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    console.log('Today:', today);
    console.log('One week ago:', oneWeekAgo);
    console.log('Current user ID:', user?.id);
    console.log('Child profile ID:', childProfile?.id);
    
    const filteredQuests = safeQuests.filter(quest => {
      console.log(`Checking quest: ${quest.id}`, {
        title: quest.title,
        assignedTo: quest.assignedTo,
        createdBy: quest.createdBy,
        userType: user?.type,
        childProfileId: childProfile?.id,
        isChildOfCurrentUser: user?.type === 'child' && quest.createdBy === user.parentId
      });
      
      // For children, show all quests from their parent
      if (user?.type === 'child' && childProfile) {
        // Check if quest is from their parent and assigned to them
        const isFromParent = quest.createdBy === user.parentId;
        const isAssignedToMe = !quest.assignedTo || 
                              quest.assignedTo.length === 0 || 
                              quest.assignedTo.includes(childProfile.id);
        
        const shouldShow = isFromParent && isAssignedToMe;
        
        console.log(`Quest ${quest.id} available to child:`, shouldShow, {
          isFromParent,
          isAssignedToMe,
          assignedTo: quest.assignedTo,
          childId: childProfile.id,
          createdBy: quest.createdBy,
          parentId: user.parentId
        });
        
        return shouldShow;
      }
      
      // For parents, show all quests they created
      if (user?.type === 'parent') {
        const isCreatedByMe = quest.createdBy === user.id || 
                             (quest.createdBy === 'parent' && user.id === 'user_1747831898057'); // Fallback for old test data
        
        console.log(`Quest ${quest.id} created by current parent:`, isCreatedByMe, {
          createdBy: quest.createdBy,
          userId: user.id
        });
        
        return isCreatedByMe;
      }
      
      return false;
    });
    
    console.log('Filtered quests:', filteredQuests.map((q: any) => ({
      id: q.id,
      title: q.title,
      createdBy: q.createdBy,
      assignedTo: q.assignedTo,
      createdAt: q.createdAt
    })));
    
    // Separate into daily and weekly quests
    const daily = filteredQuests.filter((quest: any) => {
      const createdAt = new Date(quest.createdAt);
      return createdAt >= today;
    });
    
    const weekly = filteredQuests.filter((quest: any) => {
      const createdAt = new Date(quest.createdAt);
      return createdAt >= oneWeekAgo && createdAt < today;
    });
    
    console.log('Daily quests:', daily.map((q: any) => ({ id: q.id, title: q.title })));
    console.log('Weekly quests:', weekly.map((q: any) => ({ id: q.id, title: q.title })));
    
    return { 
      dailyQuests: daily, 
      weeklyQuests: weekly 
    };
  }, [safeQuests, user, childProfile]);

  const handleCompleteQuest = async (questId: string) => {
    if (user?.type === 'child') {
      const success = await completeQuest(questId);
      if (success) {
        Alert.alert('Success', 'Quest completed! You earned XP and points!');
      } else {
        Alert.alert('Error', 'Failed to complete quest. Please try again.');
      }
    }
  };

  const handleRemoveQuest = (questId: string) => {
    if (user?.type === 'parent') {
      Alert.alert(
        'Remove Quest',
        'Are you sure you want to remove this quest?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Remove', 
            style: 'destructive',
            onPress: async () => {
              const success = await removeQuest(questId);
              if (!success) {
                Alert.alert('Error', 'Failed to remove quest. Please try again.');
              }
            }
          },
        ]
      );
    }
  };

  const renderQuestItem = (quest: typeof quests[0]) => (
    <TouchableOpacity 
      key={quest.id} 
      style={[
        styles.questCard,
        quest.isCompleted && styles.questCardCompleted
      ]}
      onLongPress={() => user?.type === 'parent' && handleRemoveQuest(quest.id)}
      activeOpacity={0.7}
    >
      <View style={styles.questInfo}>
        {user?.type === 'child' && (
          <TouchableOpacity 
            style={[
              styles.questCheckbox,
              quest.isCompleted && styles.questCheckboxCompleted
            ]}
            onPress={() => !quest.isCompleted && handleCompleteQuest(quest.id)}
            disabled={quest.isCompleted}
          >
            {quest.isCompleted && (
              <Ionicons name="checkmark" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[
            styles.questTitle,
            quest.isCompleted && styles.questTitleCompleted
          ]}>
            {quest.title}
          </Text>
          {quest.description && (
            <Text style={styles.questDescription} numberOfLines={2}>
              {quest.description}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.questXpContainer}>
        <Text style={styles.questXpText}>+{quest.xpReward} XP</Text>
        {quest.coinReward > 0 && (
          <Text style={styles.questCoinText}>+{quest.coinReward} Points</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quests</Text>
        {user?.type === 'parent' && (
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateQuest')}
            style={styles.addButton}
          >
            <Ionicons name="add" size={24} color="#4CAF50" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>
          {user?.type === 'parent' ? 'Created Quests' : 'Your Quests'}
        </Text>
        
        {dailyQuests.length > 0 ? (
          dailyQuests.map(renderQuestItem)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="list" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>
              {user?.type === 'parent' 
                ? 'No quests created yet. Tap + to create one!'
                : 'No quests assigned yet.'}
            </Text>
          </View>
        )}
        
        {weeklyQuests.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
              Weekly Challenges
            </Text>
            {weeklyQuests.map(renderQuestItem)}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  addButton: {
    padding: 8,
    marginRight: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  questCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  questCardCompleted: {
    opacity: 0.7,
    backgroundColor: '#f5f5f5',
  },
  questInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  questCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questCheckboxCompleted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  questTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  questTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  questDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  questXpContainer: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  questXpText: {
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'right',
  },
  questCoinText: {
    color: '#FFC107',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 16,
  },
  emptyStateText: {
    marginTop: 16,
    color: '#888',
    textAlign: 'center',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
});

export default QuestsScreen;
