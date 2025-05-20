import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';

type RewardsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Rewards'>;

type Props = {
  navigation: RewardsScreenNavigationProp;
};

const RewardsScreen: React.FC<Props> = ({ navigation }) => {
  // Mock rewards data
  const availableRewards = [
    { id: '1', title: 'Extra 30 minutes of screen time', cost: 50, icon: 'tv-outline' },
    { id: '2', title: 'Choose dinner tonight', cost: 30, icon: 'restaurant-outline' },
    { id: '3', title: 'Stay up 30 minutes later', cost: 75, icon: 'moon-outline' },
  ];

  const redeemedRewards = [
    { id: '4', title: 'Ice cream after dinner', date: 'Redeemed 2 days ago' },
  ];

  const userPoints = 120;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rewards</Text>
        <View style={styles.pointsContainer}>
          <Ionicons name="star" size={16} color="#FFC107" />
          <Text style={styles.pointsText}>{userPoints}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="gift-outline" size={20} color="#4CAF50" />
            <Text style={styles.cardTitle}>Available Rewards</Text>
          </View>
          
          {availableRewards.map(reward => (
            <TouchableOpacity key={reward.id} style={styles.rewardItem}>
              <View style={styles.rewardIcon}>
                <Ionicons name={reward.icon as any} size={20} color="#4CAF50" />
              </View>
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardTitle}>{reward.title}</Text>
                <View style={styles.rewardCostContainer}>
                  <Ionicons name="star" size={14} color="#FFC107" />
                  <Text style={styles.rewardCost}>{reward.cost} points</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.card, { marginTop: 16 }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#2196F3" />
            <Text style={styles.cardTitle}>Redeemed Rewards</Text>
          </View>
          
          {redeemedRewards.length > 0 ? (
            redeemedRewards.map(reward => (
              <View key={reward.id} style={[styles.rewardItem, { opacity: 0.6 }]}>
                <View style={[styles.rewardIcon, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="checkmark-circle" size={20} color="#2196F3" />
                </View>
                <View style={styles.rewardInfo}>
                  <Text style={styles.rewardTitle}>{reward.title}</Text>
                  <Text style={styles.redeemedText}>{reward.date}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="gift-outline" size={40} color="#ddd" />
              <Text style={styles.emptyStateText}>No rewards redeemed yet</Text>
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
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  pointsText: {
    marginLeft: 4,
    fontWeight: '600',
    color: '#F57F17',
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  rewardIcon: {
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
  rewardTitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  rewardCostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardCost: {
    fontSize: 12,
    color: '#F57F17',
    marginLeft: 4,
  },
  redeemedText: {
    fontSize: 12,
    color: '#757575',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateText: {
    marginTop: 8,
    color: '#999',
    textAlign: 'center',
  },
});

export default RewardsScreen;
