import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  FlatList
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';

type ParentHomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ParentTabs'>;

type Props = {
  navigation: ParentHomeScreenNavigationProp;
};

// Mock data for children
const children = [
  { id: '1', name: 'Alex Johnson', avatar: 'https://randomuser.me/api/portraits/lego/1.jpg', points: 245, level: 3 },
  { id: '2', name: 'Sam Johnson', avatar: 'https://randomuser.me/api/portraits/lego/2.jpg', points: 180, level: 2 },
];

// Mock data for recent activities
const recentActivities = [
  { id: '1', childName: 'Alex', action: 'completed the quest', quest: 'Eat a Rainbow', points: 30, time: '2 hours ago' },
  { id: '2', childName: 'Sam', action: 'redeemed a reward', reward: 'Extra Screen Time', points: -50, time: '5 hours ago' },
  { id: '3', childName: 'Alex', action: 'earned a badge', badge: 'Healthy Eater', time: '1 day ago' },
  { id: '4', childName: 'Sam', action: 'completed the quest', quest: 'Drink Water', points: 20, time: '2 days ago' },
];

const ParentHomeScreen: React.FC<Props> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderChildCard = ({ item }: { item: typeof children[0] }) => (
    <TouchableOpacity 
      style={styles.childCard}
      onPress={() => navigation.navigate('ChildSelection')}
    >
      <Image source={{ uri: item.avatar }} style={styles.childAvatar} />
      <Text style={styles.childName}>{item.name}</Text>
      <View style={styles.childStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.points}</Text>
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

  const renderActivityItem = ({ item }: { item: typeof recentActivities[0] }) => (
    <View style={styles.activityItem}>
      <View style={styles.activityIcon}>
        {item.action.includes('completed') && (
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
        )}
        {item.action.includes('redeemed') && (
          <Ionicons name="gift" size={20} color="#9C27B0" />
        )}
        {item.action.includes('earned') && (
          <Ionicons name="ribbon" size={20} color="#FF9800" />
        )}
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityText}>
          <Text style={styles.bold}>{item.childName}</Text> {item.action} 
          {item.quest && <Text style={styles.highlight}>"{item.quest}"</Text>}
          {item.reward && <Text style={styles.highlight}>"{item.reward}"</Text>}
          {item.badge && <Text style={styles.highlight}>"{item.badge}"</Text>}
          {item.points && (
            <Text style={item.points > 0 ? styles.positivePoints : styles.negativePoints}>
              {' '}{item.points > 0 ? '+' : ''}{item.points} XP
            </Text>
          )}
        </Text>
        <Text style={styles.activityTime}>{item.time}</Text>
      </View>
    </View>
  );

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
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="gift" size={24} color="#9C27B0" />
            </View>
            <Text style={styles.actionText}>Add Reward</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="stats-chart" size={24} color="#2196F3" />
            </View>
            <Text style={styles.actionText}>Progress</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={recentActivities}
            renderItem={renderActivityItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
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
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E8F5E9',
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
  activityItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  bold: {
    fontWeight: '600',
    color: '#333',
  },
  highlight: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  positivePoints: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  negativePoints: {
    color: '#F44336',
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});

export default ParentHomeScreen;
