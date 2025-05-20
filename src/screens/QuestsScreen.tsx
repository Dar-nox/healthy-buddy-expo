import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';

type QuestsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Quests'>;

type Props = {
  navigation: QuestsScreenNavigationProp;
};

const QuestsScreen: React.FC<Props> = ({ navigation }) => {
  // Mock quests data
  const dailyQuests = [
    { id: '1', title: 'Eat a fruit', xp: 10, completed: true },
    { id: '2', title: 'Drink water', xp: 5, completed: false },
    { id: '3', title: 'Play outside', xp: 15, completed: false },
  ];

  const weeklyQuests = [
    { id: '4', title: 'Try a new vegetable', xp: 30, completed: false },
    { id: '5', title: 'Exercise 3 times', xp: 50, completed: false },
  ];

  const renderQuestItem = (quest: { id: string; title: string; xp: number; completed: boolean }) => (
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
        <Text style={styles.headerTitle}>Quests</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Daily Quests</Text>
        {dailyQuests.map(renderQuestItem)}
        
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Weekly Quests</Text>
        {weeklyQuests.map(renderQuestItem)}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
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
  },
  questXpText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
  },
});

export default QuestsScreen;
