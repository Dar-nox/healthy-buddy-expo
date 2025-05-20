import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';

type QuestDetailsScreenRouteProp = RouteProp<RootStackParamList, 'QuestDetails'>;
type QuestDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'QuestDetails'>;

type Props = {
  route: QuestDetailsScreenRouteProp;
  navigation: QuestDetailsScreenNavigationProp;
};

const QuestDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  // In a real app, we would fetch the quest details using the questId from route.params
  const { questId } = route.params;
  
  // Mock quest data - in a real app, this would come from an API or state management
  const quest = {
    id: questId,
    title: 'Eat a Rainbow of Fruits and Vegetables',
    description: 'Eat at least one serving of fruits or vegetables from each color of the rainbow (red, orange, yellow, green, blue/purple, white) in a single day.',
    category: 'Nutrition',
    difficulty: 'Medium',
    xp: 50,
    rewards: [
      { type: 'xp', amount: 50 },
      { type: 'badge', name: 'Rainbow Eater' },
    ],
    tips: [
      'Try making a colorful salad with different colored vegetables',
      'Add fruits to your breakfast or as a snack',
      'Use the "Healthy Buddy" app to track your daily intake'
    ],
    isCompleted: false,
    progress: 0.4, // 40% complete
    dueDate: '2023-12-31',
  };

  const handleCompleteQuest = () => {
    Alert.alert(
      'Complete Quest',
      'Are you sure you want to mark this quest as complete?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Complete',
          onPress: () => {
            // In a real app, we would update the quest status in the backend
            Alert.alert('Success', 'Quest completed! You earned 50 XP!');
            navigation.goBack();
          },
        },
      ]
    );
  };

  const renderRewardItem = (reward: { type: string; amount?: number; name?: string }, index: number) => (
    <View key={index} style={styles.rewardItem}>
      <View style={styles.rewardIcon}>
        {reward.type === 'xp' ? (
          <Ionicons name="star" size={20} color="#FFC107" />
        ) : (
          <Ionicons name="ribbon" size={20} color="#9C27B0" />
        )}
      </View>
      <Text style={styles.rewardText}>
        {reward.type === 'xp' 
          ? `+${reward.amount} XP` 
          : `Unlock: ${reward.name} Badge`}
      </Text>
    </View>
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
        <Text style={styles.headerTitle}>Quest Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.questHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(quest.category) }]}>
              <Text style={styles.categoryText}>{quest.category}</Text>
            </View>
            <Text style={styles.difficulty}>
              Difficulty: {quest.difficulty}
            </Text>
          </View>
          
          <Text style={styles.title}>{quest.title}</Text>
          <Text style={styles.description}>{quest.description}</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressLabels}>
              <Text style={styles.progressText}>Progress</Text>
              <Text style={styles.progressPercent}>{Math.round(quest.progress * 100)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${quest.progress * 100}%` }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rewards</Text>
            <View style={styles.rewardsContainer}>
              {quest.rewards.map(renderRewardItem)}
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tips</Text>
            {quest.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Ionicons name="bulb-outline" size={18} color="#FFC107" style={styles.tipIcon} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.dueDateContainer}>
            <Ionicons name="calendar-outline" size={16} color="#757575" />
            <Text style={styles.dueDateText}>
              Due: {new Date(quest.dueDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </ScrollView>
      
      {!quest.isCompleted && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.completeButton}
            onPress={handleCompleteQuest}
          >
            <Text style={styles.completeButtonText}>Mark as Complete</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

// Helper function to get color based on category
const getCategoryColor = (category: string): string => {
  const colors: { [key: string]: string } = {
    'Nutrition': '#4CAF50',
    'Exercise': '#2196F3',
    'Hygiene': '#9C27B0',
    'Learning': '#FF9800',
    'Other': '#607D8B',
  };
  return colors[category] || '#607D8B';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  difficulty: {
    fontSize: 12,
    color: '#757575',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  rewardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    margin: 4,
  },
  rewardIcon: {
    marginRight: 6,
  },
  rewardText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  dueDateText: {
    fontSize: 13,
    color: '#757575',
    marginLeft: 6,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QuestDetailsScreen;
