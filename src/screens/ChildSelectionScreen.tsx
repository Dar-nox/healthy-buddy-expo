import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, SafeAreaView, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation';

// Mock avatars for children
const CHILD_AVATARS = [
  '👦', '👧', '👦🏽', '👧🏽', '👦🏿', '👧🏿', '👦🏻', '👧🏻', '👦🏾', '👧🏾', '👦🏼', '👧🏼'
];

type ChildSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ChildSelection'>;

type Props = {
  navigation: ChildSelectionScreenNavigationProp;
};

const ChildSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const { user, childProfile, selectChild, logout } = useAuth();
  const [children, setChildren] = useState<Array<{ id: string; name: string; avatar: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load children from user data
  useEffect(() => {
    const loadChildren = async () => {
      if (user?.children && user.children.length > 0) {
        const formattedChildren = user.children.map((child, index) => ({
          id: child.id,
          name: child.name,
          avatar: child.avatar || CHILD_AVATARS[index % CHILD_AVATARS.length],
        }));
        setChildren(formattedChildren);
      }
      setIsLoading(false);
    };

    loadChildren();
  }, [user]);

  const handleSelectChild = async (childId: string) => {
    try {
      await selectChild(childId);
      // Navigate to child home screen after selection
      navigation.replace('ChildTabs');
    } catch (error) {
      console.error('Error selecting child:', error);
      Alert.alert('Error', 'Failed to select child. Please try again.');
    }
  };

  const handleAddChild = () => {
    // In a real app, this would navigate to an "Add Child" screen
    Alert.alert('Add Child', 'This feature will be implemented soon!');
  };

  const handleParentMode = () => {
    // Navigate to parent home screen
    navigation.replace('ParentTabs');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.replace('ModeSelection');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const renderChildItem = ({ item }: { item: { id: string; name: string; avatar: string } }) => (
    <TouchableOpacity 
      style={styles.childCard}
      onPress={() => handleSelectChild(item.id)}
      disabled={isLoading}
    >
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>{item.avatar}</Text>
      </View>
      <Text style={styles.childName}>{item.name}</Text>
      <Ionicons name="chevron-forward" size={24} color="#666" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select a Profile</Text>
        <Text style={styles.subtitle}>Choose a child profile or add a new one</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading profiles...</Text>
        </View>
      ) : (
        <FlatList
          data={children}
          renderItem={renderChildItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>No children profiles found</Text>
              <Text style={styles.emptySubtext}>Add a child to get started</Text>
            </View>
          }
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, styles.addButton]} 
          onPress={handleAddChild}
          disabled={isLoading}
        >
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.buttonText}>Add Child</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.parentButton]} 
          onPress={handleParentMode}
          disabled={isLoading}
        >
          <Ionicons name="person" size={20} color="#2E7D32" />
          <Text style={[styles.buttonText, { color: '#2E7D32' }]}>Parent Mode</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          disabled={isLoading}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 24,
  },
  childName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#4CAF50',
  },
  parentButton: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  logoutButton: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#666',
    fontSize: 14,
  },
});

export default ChildSelectionScreen;
