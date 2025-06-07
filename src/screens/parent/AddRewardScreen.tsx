import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../context/AuthContext';
import { Reward } from '../../types';
import { RootStackParamList } from '../../types/navigation';

type AddRewardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddReward'>;

type Props = {
  navigation: AddRewardScreenNavigationProp;
};

const rewardTypes = [
  { id: 'privilege', name: 'Privilege', icon: 'star-outline' },
  { id: 'physical', name: 'Physical Item', icon: 'cube-outline' },
  { id: 'virtual', name: 'Virtual Item', icon: 'gift-outline' },
];

const rewardCategories = [
  { id: 'home', name: 'Home' },
  { id: 'entertainment', name: 'Entertainment' },
  { id: 'food', name: 'Food' },
  { id: 'other', name: 'Other' },
];

const AddRewardScreen: React.FC<Props> = ({ navigation }) => {
  const { user, children, createReward } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [type, setType] = useState<Reward['type']>('privilege');
  const [category, setCategory] = useState<Reward['category']>('home');
  const [isGlobal, setIsGlobal] = useState(true);
  const [maxRedemptions, setMaxRedemptions] = useState('');
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleChildSelection = (childId: string) => {
    if (selectedChildren.includes(childId)) {
      setSelectedChildren(selectedChildren.filter(id => id !== childId));
    } else {
      setSelectedChildren([...selectedChildren, childId]);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !cost || isNaN(Number(cost)) || Number(cost) <= 0) {
      Alert.alert('Error', 'Please fill in all required fields with valid values');
      return;
    }

    if (!isGlobal && selectedChildren.length === 0) {
      Alert.alert('Error', 'Please select at least one child or make the reward global');
      return;
    }

    setIsSubmitting(true);
    try {
      const newReward: Omit<Reward, 'id' | 'createdAt' | 'redeemedBy' | 'isActive'> = {
        title: title.trim(),
        description: description.trim(),
        cost: Number(cost),
        type,
        category,
        createdBy: user?.id || '',
        isGlobal,
        assignedTo: isGlobal ? undefined : selectedChildren,
        maxRedemptions: maxRedemptions ? Number(maxRedemptions) : undefined,
        icon: rewardTypes.find(t => t.id === type)?.icon || 'gift-outline',
      };

      const success = await createReward(newReward);
      
      if (success) {
        Alert.alert('Success', 'Reward created successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        throw new Error('Failed to create reward');
      }
    } catch (error) {
      console.error('Error creating reward:', error);
      Alert.alert('Error', 'Failed to create reward. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Reward</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Reward Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="E.g., Extra 30 minutes of screen time"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the reward in detail..."
            placeholderTextColor="#999"
            multiline
          />

          <Text style={styles.label}>Cost (points) *</Text>
          <TextInput
            style={styles.input}
            value={cost}
            onChangeText={setCost}
            placeholder="Enter coin cost"
            placeholderTextColor="#999"
            keyboardType="number-pad"
          />

          <Text style={styles.label}>Type *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={type}
              onValueChange={(value) => setType(value)}
              style={styles.picker}
            >
              {rewardTypes.map((rewardType) => (
                <Picker.Item key={rewardType.id} label={rewardType.name} value={rewardType.id} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Category *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={category}
              onValueChange={(value) => setCategory(value as Reward['category'])}
              style={styles.picker}
            >
              {rewardCategories.map((cat) => (
                <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
              ))}
            </Picker>
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Available to all children</Text>
            <TouchableOpacity
              style={[styles.switch, isGlobal ? styles.switchActive : null]}
              onPress={() => setIsGlobal(!isGlobal)}
            >
              <View style={[styles.switchToggle, isGlobal ? styles.switchToggleActive : null]} />
            </TouchableOpacity>
          </View>

          {!isGlobal && (
            <View style={styles.childrenContainer}>
              <Text style={styles.label}>Select Children</Text>
              {children.map((child) => (
                <TouchableOpacity
                  key={child.id}
                  style={styles.childItem}
                  onPress={() => toggleChildSelection(child.id)}
                >
                  <View style={styles.checkboxContainer}>
                    <View
                      style={[
                        styles.checkbox,
                        selectedChildren.includes(child.id) && styles.checkboxSelected,
                      ]}
                    >
                      {selectedChildren.includes(child.id) && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                  </View>
                  <Text style={styles.childName}>{child.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>Max Redemptions (optional)</Text>
          <TextInput
            style={styles.input}
            value={maxRedemptions}
            onChangeText={setMaxRedemptions}
            placeholder="Leave empty for unlimited"
            placeholderTextColor="#999"
            keyboardType="number-pad"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Creating...' : 'Create Reward'}
          </Text>
        </TouchableOpacity>
      </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  picker: {
    backgroundColor: '#f9f9f9',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  switchLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    padding: 2,
    justifyContent: 'center',
  },
  switchActive: {
    backgroundColor: '#4CAF50',
  },
  switchToggle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
  },
  switchToggleActive: {
    transform: [{ translateX: 20 }],
  },
  childrenContainer: {
    marginTop: 8,
  },
  childItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  childName: {
    fontSize: 16,
    color: '#333',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddRewardScreen;
