import React, { useMemo, useState } from 'react';
import { StatusBar } from 'react-native';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  RefreshControl,
  Alert,
  ActivityIndicator
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../types/navigation';

type ChildHomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ChildTabs'>;

type Props = {
  navigation: ChildHomeScreenNavigationProp;
};

const ChildHomeScreen: React.FC<Props> = ({ navigation }) => {
  const { childProfile, quests, completeQuest, isLoading, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Filter and sort quests for the child
  const dailyQuests = useMemo(() => {
    if (!quests || !Array.isArray(quests)) return [];
    
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    return quests
      .filter(quest => {
        // Only show quests from parent assigned to this child
        const isFromParent = quest.createdBy === childProfile?.parentId;
        const isAssignedToMe = !quest.assignedTo || 
                             quest.assignedTo.length === 0 || 
                             (childProfile && quest.assignedTo.includes(childProfile.id));
        
        // Only show quests created today
        const createdAt = new Date(quest.createdAt);
        const isToday = createdAt >= today;
        
        return isFromParent && isAssignedToMe && isToday && !quest.isCompleted;
      })
      .sort((a, b) => (a.isCompleted ? 1 : 0) - (b.isCompleted ? 1 : 0));
  }, [quests, childProfile]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleCompleteQuest = async (questId: string) => {
    try {
      const success = await completeQuest(questId);
      if (success) {
        Alert.alert('Quest Complete!', `You earned XP and points!`);
      } else {
        Alert.alert('Error', 'Failed to complete quest. Please try again.');
      }
    } catch (error) {
      console.error('Error completing quest:', error);
      Alert.alert('Error', 'An error occurred while completing the quest.');
    }
  };

  // Remove handleLogout function as it's not needed here

  if (isLoading || !childProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header with Profile Info */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{childProfile.name.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.greeting}>Hello, {childProfile.name}!</Text>
              <Text style={styles.levelText}>Level {childProfile.level}</Text>
            </View>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Number(childProfile.xp || 0)}</Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Number(childProfile.points || 0)}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(childProfile.xp % 100) || 10}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {childProfile.xp % 100}/100 XP to next level
          </Text>
        </View>

        {/* Quests Section */}
        <View style={styles.questsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Quests</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => navigation.navigate('Quests')}
            >
              <Text style={styles.seeAllText}>See All</Text>
              <Ionicons name="chevron-forward" size={16} color="#4CAF50" />
            </TouchableOpacity>
          </View>
          
          {dailyQuests.length > 0 ? (
            dailyQuests.map((quest) => (
              <View 
                key={quest.id} 
                style={[
                  styles.questCard,
                  quest.isCompleted && styles.questCardCompleted
                ]}
              >
                <View style={styles.questInfo}>
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
                  <View style={{ flex: 1 }}>
                    <Text style={[
                      styles.questTitle,
                      quest.isCompleted && styles.questTitleCompleted
                    ]}>
                      {quest.title}
                    </Text>
                    {quest.description && (
                      <Text style={styles.questDescription} numberOfLines={1}>
                        {quest.description}
                      </Text>
                    )}
                  </View>
                </View>
                
                <View style={styles.questXpContainer}>
                  <Text style={styles.questXpText}>+{quest.xpReward || 10} XP</Text>
                  {quest.coinReward && quest.coinReward > 0 && (
                    <View style={styles.coinRewardContainer}>
                      <Ionicons name="logo-bitcoin" size={16} color="#FFD700" />
                      <Text style={styles.coinRewardText}>{quest.coinReward}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-done-circle-outline" size={48} color="#ddd" />
              <Text style={styles.emptyStateText}>No quests for today!</Text>
              <Text style={styles.emptyStateSubtext}>Check back later for new quests.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  questCardCompleted: {
    opacity: 0.7,
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginTop: 10,
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80, // Space for bottom navigation
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  levelText: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#eee',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#E8F5E9',
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  questsContainer: {
    marginBottom: 20,
  },
  questCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  questCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questTitle: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  questTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  questDescription: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  questCheckboxCompleted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  questXpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinRewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  coinRewardText: {
    marginLeft: 2,
    color: '#D4AF37',
    fontWeight: '600',
    fontSize: 12,
  },
  questXpText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  questButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  questButtonCompleted: {
    backgroundColor: '#E0E0E0',
  },
  questButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  questButtonTextCompleted: {
    color: '#9E9E9E',
  },
  rewardsContainer: {
    marginBottom: 20,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rewardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  rewardCostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardCost: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 8,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navButtonText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  navButtonTextActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
});

export default ChildHomeScreen;
