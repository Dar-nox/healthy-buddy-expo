import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView, 
  Alert, 
  Modal, 
  TextInput, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Clipboard
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation';
import { generateAccessCode } from '../utils/authUtils';

// Mock avatars for children
const CHILD_AVATARS = [
  '👦', '👧', '👦🏽', '👧🏽', '👦🏿', '👧🏿', '👦🏻', '👧🏻', '👦🏾', '👧🏾', '👦🏼', '👧🏼'
];

type ChildSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ChildSelection'>;

type Props = {
  navigation: ChildSelectionScreenNavigationProp;
};

interface NewChildForm {
  name: string;
  avatar: string;
  accessCode?: string;
  isGeneratingCode?: boolean;
}

const ChildSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const { user, childProfile, selectChild, logout, updateUser } = useAuth();
  const [children, setChildren] = useState<Array<{ id: string; name: string; avatar: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isManageModalVisible, setIsManageModalVisible] = useState(false);
  const [selectedChild, setSelectedChild] = useState<{id: string; name: string; avatar: string; accessCode: string} | null>(null);
  const [newChild, setNewChild] = useState<NewChildForm>({
    name: '',
    avatar: CHILD_AVATARS[Math.floor(Math.random() * CHILD_AVATARS.length)],
    isGeneratingCode: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

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

  const handleSelectChild = (child: {id: string; name: string; avatar: string; accessCode: string}) => {
    // Ensure accessCode is always a string
    const childWithAccessCode = {
      ...child,
      accessCode: child.accessCode || ''
    };
    setSelectedChild(childWithAccessCode);
    setEditName(child.name);
    setIsEditing(false);
    setIsManageModalVisible(true);
  };

  const generateChildCode = () => {
    if (!newChild.name.trim()) {
      Alert.alert('Error', 'Please enter a name for your child');
      return;
    }
    
    setNewChild(prev => ({
      ...prev,
      accessCode: generateAccessCode(),
      isGeneratingCode: true
    }));
  };

  const handleAddChild = async () => {
    if (!newChild.accessCode) {
      generateChildCode();
      return;
    }

    setIsSubmitting(true);
    try {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Creating new child profile with access code:', newChild.accessCode);
      
      const newChildProfile = {
        id: `child-${Date.now()}`,
        name: newChild.name.trim(),
        avatar: newChild.avatar,
        level: 1,
        xp: 0,
        coins: 10,
        accessCode: newChild.accessCode,
        completedQuests: [],
        inventory: [],
        parentId: user.id,
        createdAt: new Date().toISOString()
      };

      console.log('New child profile created:', JSON.stringify(newChildProfile, null, 2));

      // Update the user's children array
      const updatedUser = {
        ...user,
        children: [...(user.children || []), newChildProfile]
      };

      console.log('Updating user with new child:', JSON.stringify(updatedUser, null, 2));
      await updateUser(updatedUser);
      console.log('User updated successfully');
      
      // Update local state
      setChildren(prev => [...prev, {
        id: newChildProfile.id,
        name: newChildProfile.name,
        avatar: newChildProfile.avatar
      }]);
      
      // Reset form and close modal
      setNewChild({
        name: '',
        avatar: CHILD_AVATARS[Math.floor(Math.random() * CHILD_AVATARS.length)],
        isGeneratingCode: false
      });
      setIsAddModalVisible(false);
      
      Alert.alert('Success', `${newChildProfile.name} has been added successfully!`);
    } catch (error) {
      console.error('Error adding child:', error);
      Alert.alert('Error', 'Failed to add child. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCloseModal = () => {
    setNewChild({
      name: '',
      avatar: CHILD_AVATARS[Math.floor(Math.random() * CHILD_AVATARS.length)],
      isGeneratingCode: false
    });
    setIsAddModalVisible(false);
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

  const renderChildItem = ({ item }: { item: { id: string; name: string; avatar: string } }) => {
    // Find the full child data including access code
    const fullChild = user?.children?.find(child => child.id === item.id);
    
    return (
      <TouchableOpacity 
        style={styles.childCard}
        onPress={() => handleSelectChild({
          ...item,
          accessCode: fullChild?.accessCode || ''
        })}
        disabled={isLoading}
      >
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{item.avatar}</Text>
        </View>
        <Text style={styles.childName}>{item.name}</Text>
        <Ionicons name="options" size={24} color="#666" />
      </TouchableOpacity>
    );
  };

  const selectAvatar = (avatar: string) => {
    setNewChild(prev => ({ ...prev, avatar }));
  };

  const renderAvatarOption = (avatar: string, index: number) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.avatarOption,
        newChild.avatar === avatar && styles.selectedAvatar
      ]}
      onPress={() => selectAvatar(avatar)}
    >
      <Text style={styles.avatarText}>{avatar}</Text>
    </TouchableOpacity>
  );

  const handleUpdateChild = async () => {
    if (!selectedChild || !user) return;

    setIsEditing(false);
    try {
      const updatedUser = {
        ...user,
        children: user.children?.map(child => {
          if (child.id === selectedChild.id) {
            return { ...child, name: editName };
          }
          return child;
        }) || []
      };
      
      if (user.id) {
        await updateUser(updatedUser);
        setChildren(prev => prev.map(child => {
          if (child.id === selectedChild.id) {
            return { ...child, name: editName };
          }
          return child;
        }));
      }
    } catch (error) {
      console.error('Error updating child:', error);
      Alert.alert('Error', 'Failed to update child. Please try again.');
    }
  };

  const handleDeleteChild = async () => {
    if (!selectedChild || !user) return;

    try {
      const updatedUser = {
        ...user,
        children: user.children?.filter(child => child.id !== selectedChild.id) || []
      };
      
      if (user.id) {
        await updateUser(updatedUser);
        setChildren(prev => prev.filter(child => child.id !== selectedChild.id));
        setIsManageModalVisible(false);
      }
    } catch (error) {
      console.error('Error deleting child:', error);
      Alert.alert('Error', 'Failed to delete child. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isManageModalVisible}
        onRequestClose={() => setIsManageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage Child</Text>
              <TouchableOpacity onPress={() => setIsManageModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.manageChildContainer}>
              <View style={styles.avatarContainerLarge}>
                <Text style={styles.avatarTextLarge}>{selectedChild?.avatar}</Text>
              </View>
              
              {isEditing ? (
                <View style={styles.editNameContainer}>
                  <TextInput
                    style={styles.editNameInput}
                    value={editName}
                    onChangeText={setEditName}
                    autoFocus
                  />
                  <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={handleUpdateChild}
                    disabled={!editName.trim()}
                  >
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.childNameLarge}>{selectedChild?.name}</Text>
              )}
              
              <View style={styles.accessCodeContainer}>
                <Text style={styles.accessCodeLabel}>Access Code:</Text>
                <View style={styles.accessCodeBox}>
                  <Text style={styles.accessCodeText}>
                    {selectedChild?.accessCode || 'N/A'}
                  </Text>
                  <TouchableOpacity 
                    style={styles.copyButton}
                    onPress={() => {
                      if (selectedChild?.accessCode) {
                        Clipboard.setString(selectedChild.accessCode);
                        Alert.alert('Copied!', 'Access code copied to clipboard');
                      }
                    }}
                  >
                    <Ionicons name="copy" size={18} color="#4CAF50" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => setIsEditing(true)}
                >
                  <Ionicons name="pencil" size={16} color="#fff" />
                  <Text style={styles.actionButtonText}>Edit Name</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={handleDeleteChild}
                >
                  <Ionicons name="trash" size={16} color="#fff" />
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddModalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Child</Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.label}>Child's Name</Text>
            <TextInput
              style={styles.input}
              value={newChild.name}
              onChangeText={(text) => setNewChild(prev => ({ ...prev, name: text }))}
              placeholder="Enter child's name"
              placeholderTextColor="#999"
              editable={!isSubmitting}
            />
            
            <Text style={[styles.label, { marginTop: 20 }]}>Select Avatar</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.avatarContainer}
            >
              {CHILD_AVATARS.map((avatar, index) => renderAvatarOption(avatar, index))}
            </ScrollView>
            
            {newChild.accessCode && (
              <View style={styles.accessCodeContainer}>
                <Text style={styles.accessCodeLabel}>Access Code (save this!):</Text>
                <View style={styles.accessCodeBox}>
                  <Text style={styles.accessCodeText}>{newChild.accessCode}</Text>
                  <TouchableOpacity 
                    style={styles.copyButton}
                    onPress={async () => {
                      try {
                        await Clipboard.setString(newChild.accessCode || '');
                        Alert.alert('Copied!', 'The access code has been copied to your clipboard.');
                      } catch (error) {
                        console.error('Failed to copy access code:', error);
                        Alert.alert('Error', 'Failed to copy access code. Please try again.');
                      }
                    }}
                  >
                    <Ionicons name="copy-outline" size={20} color="#4CAF50" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.accessCodeHelp}>
                  Your child will need this code to log in. Make sure to save it!
                </Text>
              </View>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCloseModal}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>
                  {newChild.accessCode ? 'Cancel' : 'Close'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  styles.addButton, 
                  (!newChild.name.trim() || isSubmitting) && styles.disabledButton
                ]}
                onPress={handleAddChild}
                disabled={!newChild.name.trim() || isSubmitting}
              >
                <Text style={styles.addButtonText}>
                  {isSubmitting 
                    ? 'Saving...' 
                    : newChild.accessCode 
                      ? 'Save Child' 
                      : 'Generate Code'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
          onPress={() => setIsAddModalVisible(true)}
          disabled={isLoading}
        >
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.buttonText}>Add Child</Text>
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
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    paddingVertical: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  
  // Manage Child Modal
  manageChildContainer: {
    alignItems: 'center',
    padding: 10,
  },
  avatarContainerLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarTextLarge: {
    fontSize: 50,
  },
  childNameLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  editNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  editNameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    fontSize: 18,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    minWidth: 120,
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: '500',
  },
  accessCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginTop: 5,
  },
  // Access Code styles
  accessCodeContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f0f9f0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#c8e6c9',
    marginBottom: 15,
  },
  accessCodeLabel: {
    fontSize: 14,
    color: '#2e7d32',
    marginBottom: 8,
    fontWeight: '500',
  },
  accessCodeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#c8e6c9',
    marginBottom: 8,
    minWidth: '100%',
  },
  accessCodeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    letterSpacing: 2,
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    includeFontPadding: false,
    textAlign: 'left',
    paddingRight: 10,
  },
  accessCodeHelp: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  copyButton: {
    padding: 5,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  keyboardAvoidingView: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  avatarContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  avatarOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAvatar: {
    borderColor: '#4CAF50',
    backgroundColor: '#C8E6C9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
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
