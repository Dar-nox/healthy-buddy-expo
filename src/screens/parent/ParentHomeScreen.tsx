import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { ChildProfile, Quest } from '../../types';

type ParentHomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ParentTabs'> & {
  navigate: (screen: 'ParentTabs' | 'Profile' | 'ChildProfile' | 'CreateQuest' | 'ChildSelection', params?: any) => void;
};

type Props = {
  navigation: ParentHomeScreenNavigationProp;
};

interface Activity {
  id: string;
  childName: string;
  childAvatar?: string;
  action: string;
  quest?: string;
  reward?: string;
  badge?: string;
  points?: number;
  time: string;
  timestamp?: number;
  type?: 'quest' | 'reward' | 'badge';
}

const ParentHomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);

  // Function to fetch quests created by the parent
  const fetchQuests = async () => {
    try {
      const response = await AsyncStorage.getItem('@healthy_buddy_quests');
      console.log('Quests from storage:', response);
      if (response) {
        const allQuests: Quest[] = JSON.parse(response);
        console.log('Parsed quests:', allQuests);
        // Filter quests created by the current user
        const parentQuests = allQuests.filter(quest => quest.createdBy === user?.id);
        console.log('Filtered quests:', parentQuests);
        setQuests(parentQuests);
      } else {
        console.log('No quests found in storage');
        setQuests([]);
      }
    } catch (error) {
      console.error('Error fetching quests:', error);
      setQuests([]);
    }
  };

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      if (user) {
        if (user.children) {
          setChildren(user.children);
        }
        await fetchQuests();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh quests when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const renderChildCard = ({ item }: { item: ChildProfile }) => (
    <TouchableOpacity 
      style={styles.childCard}
      onPress={() => {
        // Navigate to child details or handle the press as needed
        // For now, we'll just log the child ID
        console.log('Selected child:', item.id);
      }}
    >
      <View style={styles.childAvatarPlaceholder}>
        <Text style={styles.avatarPlaceholderText}>{item.avatar || '👦'}</Text>
      </View>
      <Text style={styles.childName} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
      <View style={styles.childStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.points || 0}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>Lv. {item.level}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderQuestItem = ({ item }: { item: Quest }) => {
    const isCompleted = item.isCompleted;
    
    return (
      <View style={[
        styles.questItem,
        isCompleted && styles.questItemCompleted
      ]}>
        <View style={styles.questContent}>
          <View style={styles.questHeader}>
            <Text 
              style={[
                styles.questTitle, 
                isCompleted && styles.questTitleCompleted
              ]} 
              numberOfLines={1} 
              ellipsizeMode="tail"
            >
              {item.title || 'Untitled Quest'}
            </Text>
            {isCompleted && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.completedText}>Completed</Text>
              </View>
            )}
          </View>
          <Text 
            style={[
              styles.questDescription,
              isCompleted && styles.questDescriptionCompleted
            ]} 
            numberOfLines={2}
          >
            {item.description || 'No description'}
          </Text>
          <View style={styles.questFooter}>
            <Text style={styles.questReward}>
              🎯 {item.xpReward || 0} XP • {item.coinReward || 0} coins
            </Text>
            <Text style={styles.questCategory}>
              {item.category || 'general'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, Parent!</Text>
          <Text style={styles.subtitle}>Track your children's progress</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-circle" size={32} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Children</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ChildSelection')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={children}
            renderItem={renderChildCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.childrenList}
          />
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('CreateQuest')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="add-circle" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.actionText}>Create Quest</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddReward')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="gift" size={24} color="#9C27B0" />
            </View>
            <Text style={styles.actionText}>Add Reward</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Rewards')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="gift-outline" size={24} color="#9C27B0" />
            </View>
            <Text style={styles.actionText}>Rewards</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Quests</Text>
          </View>
          {isLoading ? (
            <ActivityIndicator size="small" color="#4A90E2" />
          ) : quests.length > 0 ? (
            <FlatList
              data={quests}
              renderItem={renderQuestItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={true}
              contentContainerStyle={styles.questsList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={40} color="#ccc" />
              <Text style={styles.emptyStateText}>No quests created yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  profileButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  childrenList: {
    paddingVertical: 8,
  },
  childCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  childAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  childAvatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarPlaceholderText: {
    fontSize: 40,
  },
  childName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  childStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
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
    height: 30,
    backgroundColor: '#f0f0f0',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },
  questItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  questItemCompleted: {
    backgroundColor: '#f8f9fa',
    borderLeftColor: '#4CAF50',
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    color: '#4CAF50',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  questContent: {
    flex: 1,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
    marginRight: 8,
  },
  questTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#95a5a6',
  },
  questDescriptionCompleted: {
    color: '#bdc3c7',
  },
  questDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 12,
    lineHeight: 20,
  },
  questFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questReward: {
    fontSize: 13,
    color: '#2ecc71',
    fontWeight: '500',
  },
  questCategory: {
    fontSize: 12,
    color: '#95a5a6',
    backgroundColor: '#f5f6f7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  questsList: {
    paddingVertical: 8,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  createButton: {
    marginTop: 16,
    backgroundColor: '#4A90E2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ParentHomeScreen;
