import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { Reward } from '../types';

type RewardsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Rewards'>;

type Props = {
  navigation: RewardsScreenNavigationProp;
};

const RewardsScreen: React.FC<Props> = ({ navigation }) => {
  const { user, childProfile, rewards, redeemReward } = useAuth();
  
  const isParent = user?.type === 'parent';
  const userId = user?.id || '';
  
  // Get available and redeemed rewards based on user type
  const { availableRewards, redeemedRewards } = useMemo(() => {
    if (!rewards) return { availableRewards: [], redeemedRewards: [] };
    
    const allRewards = [...rewards];
    
    if (isParent) {
      // Parents see all rewards they've created
      const parentRewards = allRewards.filter(reward => reward.createdBy === userId);
      return {
        availableRewards: parentRewards.filter(r => r.isActive),
        redeemedRewards: parentRewards.filter(r => !r.isActive)
      };
    } else {
      // Children see rewards available to them
      const childId = childProfile?.id || '';
      const available = allRewards.filter(reward => 
        reward.isActive && 
        (reward.isGlobal || reward.assignedTo?.includes(childId)) &&
        (!reward.redeemedBy?.includes(childId)) &&
        (reward.maxRedemptions === undefined || 
         (reward.redeemedBy?.length || 0) < reward.maxRedemptions)
      );
      
      const redeemed = allRewards.filter(reward => 
        reward.redeemedBy?.includes(childId)
      );
      
      return { availableRewards: available, redeemedRewards: redeemed };
    }
  }, [rewards, isParent, userId, childProfile]);
  
  const handleRedeem = async (reward: Reward) => {
    if (!childProfile) {
      Alert.alert('Error', 'Child profile not found');
      return;
    }
    
    // Ensure points are treated as numbers
    const childPoints = Number(childProfile.points) || 0;
    const rewardCost = Number(reward.cost) || 0;
    
    console.log('=== REWARD REDEMPTION ATTEMPT ===');
    console.log('Child points:', childPoints);
    console.log('Reward cost:', rewardCost);
    
    // Check if child has enough points
    if (childPoints < rewardCost) {
      Alert.alert(
        'Not Enough Points', 
        `You need ${rewardCost - childPoints} more points to redeem this reward.`
      );
      return;
    }
    
    try {
      const success = await redeemReward(reward.id, childProfile.id);
      if (success) {
        Alert.alert('Success', `You've redeemed: ${reward.title} for ${reward.cost} points`);
      } else {
        Alert.alert('Error', 'Failed to redeem reward. You may not have enough points or the reward may no longer be available.');
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
      Alert.alert('Error', 'An unexpected error occurred while processing your request.');
    }
  };
  
  const userPoints = childProfile ? Number(childProfile.points) || 0 : 0;

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
            <Text style={styles.cardTitle}>
              {isParent ? 'Active Rewards' : 'Available Rewards'}
            </Text>
            {isParent && (
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => navigation.navigate('AddReward')}
              >
                <Ionicons name="add-circle" size={24} color="#4CAF50" />
              </TouchableOpacity>
            )}
          </View>
          
          {availableRewards.length > 0 ? (
            availableRewards.map(reward => (
              <TouchableOpacity 
                key={reward.id} 
                style={styles.rewardItem}
                onPress={() => isParent 
                  ? navigation.navigate('RewardDetails', { rewardId: reward.id })
                  : handleRedeem(reward)
                }
              >
                <View style={styles.rewardIcon}>
                  <Ionicons name={reward.icon as any || 'gift-outline'} size={20} color="#4CAF50" />
                </View>
                <View style={styles.rewardInfo}>
                  <Text style={styles.rewardTitle}>{reward.title}</Text>
                  <View style={styles.rewardCostContainer}>
                    <Ionicons name="star" size={14} color="#FFC107" />
                    <Text style={styles.rewardCost}>{reward.cost} points</Text>
                    {reward.maxRedemptions && (
                      <Text style={styles.maxRedemptions}>
                        • {reward.maxRedemptions - (reward.redeemedBy?.length || 0)} left
                      </Text>
                    )}
                  </View>
                </View>
                <Ionicons 
                  name={isParent ? "chevron-forward" : "download-outline"} 
                  size={20} 
                  color="#999" 
                />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="gift-outline" size={40} color="#ddd" />
              <Text style={styles.emptyStateText}>
                {isParent 
                  ? 'No active rewards. Tap + to create one!'
                  : 'No rewards available right now. Check back later!'
                }
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.card, { marginTop: 16 }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#2196F3" />
            <Text style={styles.cardTitle}>
              {isParent ? 'Inactive Rewards' : 'Redeemed Rewards'}
            </Text>
          </View>
          
          {redeemedRewards.length > 0 ? (
            redeemedRewards.map(reward => (
              <TouchableOpacity 
                key={reward.id} 
                style={[styles.rewardItem, !isParent && { opacity: 0.6 }]}
                onPress={() => isParent && navigation.navigate('RewardDetails', { rewardId: reward.id })}
              >
                <View style={[styles.rewardIcon, { backgroundColor: isParent ? '#E8F5E9' : '#E3F2FD' }]}>
                  <Ionicons 
                    name={isParent ? 'eye-outline' : 'checkmark-circle'} 
                    size={20} 
                    color={isParent ? '#4CAF50' : '#2196F3'} 
                  />
                </View>
                <View style={styles.rewardInfo}>
                  <Text style={styles.rewardTitle}>{reward.title}</Text>
                  {isParent ? (
                    <Text style={styles.redeemedText}>
                      {reward.redeemedBy?.length || 0} {reward.redeemedBy?.length === 1 ? 'redemption' : 'redemptions'}
                      {reward.maxRedemptions && ` • Max ${reward.maxRedemptions}`}
                    </Text>
                  ) : (
                    <Text style={styles.redeemedText}>
                      Redeemed on {new Date(reward.createdAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>
                {isParent && <Ionicons name="chevron-forward" size={20} color="#999" />}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="gift-outline" size={40} color="#ddd" />
              <Text style={styles.emptyStateText}>
                {isParent 
                  ? 'No inactive rewards'
                  : 'No rewards redeemed yet. Earn points by completing quests!'
                }
              </Text>
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
    marginTop: StatusBar.currentHeight,
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
  addButton: {
    marginLeft: 'auto',
    padding: 8,
  },
  maxRedemptions: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 8,
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
