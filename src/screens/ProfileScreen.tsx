import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

type Props = {
  navigation: ProfileScreenNavigationProp;
};

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user: currentUser, childProfile } = useAuth();
  
  // Use actual user data or fallback to default values
  const user = {
    name: currentUser?.name || 'User',
    email: currentUser?.email || '',
    avatar: currentUser?.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg',
    points: 0, // You can add points to your user model if needed
    level: 1,  // You can add level to your user model if needed
    completedQuests: currentUser?.children?.reduce((total, child) => 
      total + (child.completedQuests?.length || 0), 0) || 0,
  };

  const menuItems = [
    { icon: 'person-outline', label: 'Edit Profile', screen: 'EditProfile' },
    { icon: 'people-outline', label: 'Manage Children', screen: 'ChildSelection' },
    { icon: 'notifications-outline', label: 'Notifications', screen: 'Notifications' },
    { icon: 'settings-outline', label: 'Settings', screen: 'Settings' },
    { icon: 'help-circle-outline', label: 'Help & Support', screen: 'Help' },
    { icon: 'information-circle-outline', label: 'About', screen: 'About' },
    { icon: 'log-out-outline', label: 'Logout', screen: 'Logout' },
  ];

  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // Navigate to the auth screen after successful logout
      navigation.reset({
        index: 0,
        routes: [{ name: 'ParentAuth' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  const renderMenuItem = (item: { icon: string; label: string; screen: string }) => (
    <TouchableOpacity 
      key={item.screen}
      style={styles.menuItem}
      onPress={() => {
        if (item.screen === 'Logout') {
          Alert.alert(
            'Logout',
            'Are you sure you want to log out?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Logout',
                onPress: handleLogout,
                style: 'destructive',
              },
            ],
            { cancelable: true }
          );
        } else {
          // Navigate to other screens
          // navigation.navigate(item.screen as any);
        }
      }}
    >
      <View style={styles.menuItemLeft}>
        <Ionicons name={item.icon as any} size={22} color="#555" />
        <Text style={styles.menuItemText}>{item.label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
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

        {/* Profile Info */}
        <View style={styles.profileContainer}>
          <Image 
            source={{ uri: user.avatar }} 
            style={styles.avatar} 
          />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.points}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Lv. {user.level}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.completedQuests}</Text>
              <Text style={styles.statLabel}>Quests</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
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
                      {
                        text: 'Cancel',
                        style: 'cancel',
                      },
                      {
                        text: 'Logout',
                        onPress: handleLogout,
                        style: 'destructive',
                      },
                    ],
                    { cancelable: true }
                  );
                } else if (item.screen === 'ChildSelection') {
                  navigation.navigate('ChildSelection');
                } else {
                  // Handle other menu items
                  // navigation.navigate(item.screen as any);
                }
              }}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon as any} size={22} color="#555" />
                <Text style={styles.menuItemText}>{item.label}</Text>
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
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#E8F5E9',
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
  },
  menuContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
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
});

export default ProfileScreen;
