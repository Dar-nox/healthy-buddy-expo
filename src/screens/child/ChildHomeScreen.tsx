import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  RefreshControl,
  Alert,
  Image
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../types/navigation';

// Mock data
const DAILY_QUESTS = [
  { id: '1', title: 'Eat a fruit', xp: 10, completed: false },
  { id: '2', title: 'Drink water', xp: 5, completed: true },
  { id: '3', title: 'Play outside', xp: 15, completed: false },
];

const REWARDS = [
  { id: '1', name: 'Sticker Pack', cost: 20, icon: 'star' },
  { id: '2', name: 'Game Time', cost: 30, icon: 'game-controller' },
  { id: '3', name: 'Choose Dinner', cost: 50, icon: 'restaurant' },
];

type ChildHomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ChildTabs'>;

type Props = {
  navigation: ChildHomeScreenNavigationProp;
};

const ChildHomeScreen: React.FC<Props> = ({ navigation }) => {
  const { childProfile, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('quests');

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleCompleteQuest = (questId: string) => {
    // In a real app, this would mark the quest as complete in the backend
    Alert.alert('Quest Complete!', 'Your parent will verify your completion.');
  };

  const handleRedeemReward = (rewardId: string) => {
    // In a real app, this would deduct coins and grant the reward
    Alert.alert('Reward Claimed!', 'Show this to your parent to redeem your reward.');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.replace('ModeSelection');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!childProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading profile...</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutButtonText}>Back to Mode Selection</Text>
          </TouchableOpacity>
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
              <Text style={styles.statValue}>{childProfile.xp}</Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{childProfile.coins}</Text>
              <Text style={styles.statLabel}>Coins</Text>
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

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'quests' && styles.activeTab
            ]}
            onPress={() => setActiveTab('quests')}
          >
            <Ionicons 
              name="checkbox" 
              size={20} 
              color={activeTab === 'quests' ? '#4CAF50' : '#666'} 
            />
            <Text 
              style={[
                styles.tabText,
                activeTab === 'quests' && styles.activeTabText
              ]}
            >
              Quests
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'rewards' && styles.activeTab
            ]}
            onPress={() => setActiveTab('rewards')}
          >
            <Ionicons 
              name="gift" 
              size={20} 
              color={activeTab === 'rewards' ? '#4CAF50' : '#666'} 
            />
            <Text 
              style={[
                styles.tabText,
                activeTab === 'rewards' && styles.activeTabText
              ]}
            >
              Rewards
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content based on active tab */}
        {activeTab === 'quests' ? (
          <View style={styles.questsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Daily Quests</Text>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>See All</Text>
                <Ionicons name="chevron-forward" size={16} color="#4CAF50" />
              </TouchableOpacity>
            </View>
            
            {DAILY_QUESTS.map((quest) => (
              <View key={quest.id} style={styles.questCard}>
                <View style={styles.questInfo}>
                  <View style={[
                    styles.questCheckbox,
                    quest.completed && styles.questCheckboxCompleted
                  ]}>
                    {quest.completed && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.questTitle}>{quest.title}</Text>
                </View>
                
                <View style={styles.questXpContainer}>
                  <Text style={styles.questXpText}>+{quest.xp} XP</Text>
                </View>
                
                <TouchableOpacity 
                  style={[
                    styles.questButton,
                    quest.completed && styles.questButtonCompleted
                  ]}
                  onPress={() => handleCompleteQuest(quest.id)}
                  disabled={quest.completed}
                >
                  <Text 
                    style={[
                      styles.questButtonText,
                      quest.completed && styles.questButtonTextCompleted
                    ]}
                  >
                    {quest.completed ? 'Completed' : 'Complete'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.rewardsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Available Rewards</Text>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>See All</Text>
                <Ionicons name="chevron-forward" size={16} color="#4CAF50" />
              </TouchableOpacity>
            </View>
            
            {REWARDS.map((reward) => (
              <View key={reward.id} style={styles.rewardCard}>
                <View style={styles.rewardIconContainer}>
                  <Ionicons name={reward.icon as any} size={24} color="#4CAF50" />
                </View>
                <View style={styles.rewardInfo}>
                  <Text style={styles.rewardName}>{reward.name}</Text>
                  <View style={styles.rewardCostContainer}>
                    <Ionicons name="star" size={16} color="#FFC107" />
                    <Text style={styles.rewardCost}>{reward.cost}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.redeemButton}
                  onPress={() => handleRedeemReward(reward.id)}
                >
                  <Text style={styles.redeemButtonText}>Redeem</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('ChildTabs', { screen: 'Home' })}
        >
          <Ionicons 
            name="home" 
            size={24} 
            color={activeTab === 'quests' ? '#4CAF50' : '#666'} 
          />
          <Text style={[
            styles.navButtonText,
            activeTab === 'quests' && styles.navButtonTextActive
          ]}>
            Home
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('ChildTabs', { screen: 'Quests' })}
        >
          <Ionicons 
            name="checkbox" 
            size={24} 
            color={activeTab === 'quests' ? '#4CAF50' : '#666'} 
          />
          <Text style={[
            styles.navButtonText,
            activeTab === 'quests' && styles.navButtonTextActive
          ]}>
            Quests
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('ChildTabs', { screen: 'Rewards' })}
        >
          <Ionicons 
            name="gift" 
            size={24} 
            color={activeTab === 'rewards' ? '#4CAF50' : '#666'} 
          />
          <Text style={[
            styles.navButtonText,
            activeTab === 'rewards' && styles.navButtonTextActive
          ]}>
            Rewards
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('ChildTabs', { screen: 'Profile' })}
        >
          <Ionicons 
            name="person" 
            size={24} 
            color="#666" 
          />
          <Text style={styles.navButtonText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  logoutButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
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
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  questXpContainer: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
  },
  questXpText: {
    fontSize: 12,
    color: '#2E7D32',
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
    fontSize: 14,
    color: '#F57C00',
    fontWeight: '600',
    marginLeft: 4,
  },
  redeemButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  redeemButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
