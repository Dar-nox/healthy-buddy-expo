import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';

type ParentProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ParentProfile'>;

type Props = {
  navigation: ParentProfileScreenNavigationProp;
};

const ParentProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout, cleanupTestData } = useAuth();
  
  const menuItems = [
    { icon: 'person-outline', label: 'Edit Profile', screen: 'EditProfile' },
    { icon: 'people-outline', label: 'Manage Children', screen: 'ChildSelection' },
    { icon: 'notifications-outline', label: 'Notifications', screen: 'Notifications' },
    { icon: 'settings-outline', label: 'Settings', screen: 'Settings' },
    { icon: 'help-circle-outline', label: 'Help & Support', screen: 'Help' },
    { icon: 'information-circle-outline', label: 'About', screen: 'About' },
    { 
      icon: 'trash-outline', 
      label: 'Clean Up Data', 
      screen: 'CleanupData',
      isWarning: true // Flag for special styling
    },
    { 
      icon: 'log-out-outline', 
      label: 'Logout', 
      screen: 'Logout',
      isWarning: true // Flag for special styling
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'ModeSelection' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={60} color="#4CAF50" />
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.children?.length || 0}</Text>
              <Text style={styles.statLabel}>Children</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity 
              key={item.screen}
              style={styles.menuItem}
              onPress={() => {
                if (item.screen === 'Logout') {
                  Alert.alert(
                    'Logout',
                    'Are you sure you want to log out?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Logout', onPress: handleLogout, style: 'destructive' },
                    ]
                  );
                } else if (item.screen === 'ChildSelection') {
                  navigation.navigate('ChildSelection');
                } else if (item.screen === 'CleanupData') {
                  Alert.alert(
                    'Clean Up Data',
                    'This will remove any orphaned quests and fix data issues. Continue?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Clean Up', 
                        onPress: async () => {
                          try {
                            await cleanupTestData();
                            Alert.alert('Success', 'Data cleanup completed successfully!');
                          } catch (error) {
                            console.error('Cleanup error:', error);
                            Alert.alert('Error', 'Failed to clean up data. Please try again.');
                          }
                        },
                        style: 'destructive' 
                      },
                    ]
                  );
                }
                // Add other navigation handlers as needed
              }}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons 
                  name={item.icon as any} 
                  size={22} 
                  color={item.isWarning ? '#e74c3c' : '#555'} 
                />
                <Text style={[
                  styles.menuItemText,
                  item.isWarning && styles.warningText
                ]}>
                  {item.label}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
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
  scrollView: {
    flex: 1,
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
  profileContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
  },
  warningText: {
    color: '#e74c3c',
    fontWeight: '500',
  },
});

export default ParentProfileScreen;
