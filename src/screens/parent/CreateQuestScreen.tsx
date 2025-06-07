import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../types/navigation';

type CreateQuestScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateQuest'>;

type Props = {
  navigation: CreateQuestScreenNavigationProp;
};

const CreateQuestScreen: React.FC<Props> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Nutrition');
  const [difficulty, setDifficulty] = useState('Easy');
  const [xp, setXp] = useState('10');
  const [dueDate, setDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    'Nutrition',
    'Exercise',
    'Hygiene',
    'Learning',
    'Chores',
    'Other'
  ];

  const difficulties = [
    { label: 'Easy', value: 'Easy' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Hard', value: 'Hard' },
  ];

  const { createQuest, user } = useAuth();

  const handleCreateQuest = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the quest');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description for the quest');
      return;
    }

    setIsLoading(true);
    
    try {
      const xpValue = parseInt(xp) || 10;
      const coinValue = Math.floor(xpValue / 2);
      
      // Get all children IDs if this is a parent
      const assignedTo = user?.type === 'parent' && user.children 
        ? user.children.map(child => child.id) 
        : [];
      
      console.log('Creating quest with values:', {
        title: title.trim(),
        description: description.trim(),
        xpReward: xpValue,
        coinReward: coinValue,
        category: category.toLowerCase(),
        assignedTo,
        createdBy: user?.id || 'parent',
        isCustom: true,
        proofRequired: false,
        proofType: 'none',
      });
      
      const success = await createQuest({
        title: title.trim(),
        description: description.trim(),
        xpReward: xpValue,
        coinReward: coinValue,
        category: category.toLowerCase() as any,
        assignedTo, // Assign to all children by default
        createdBy: user?.id || 'parent',
        isCustom: true,
        proofRequired: false,
        proofType: 'none',
      });

      if (success) {
        Alert.alert(
          'Quest Created',
          'Your quest has been created successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        throw new Error('Failed to create quest');
      }
    } catch (error) {
      console.error('Error creating quest:', error);
      Alert.alert('Error', 'Failed to create quest. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create New Quest</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Quest Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter quest title"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter quest description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholderTextColor="#999"
          />

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={category}
                  onValueChange={(itemValue) => setCategory(itemValue)}
                  style={styles.picker}
                  dropdownIconColor="#666"
                >
                  {categories.map((cat) => (
                    <Picker.Item key={cat} label={cat} value={cat} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Difficulty</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={difficulty}
                  onValueChange={(itemValue) => setDifficulty(itemValue)}
                  style={styles.picker}
                  dropdownIconColor="#666"
                >
                  {difficulties.map((diff) => (
                    <Picker.Item key={diff.value} label={diff.label} value={diff.value} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>XP Reward</Text>
              <View style={styles.xpInputContainer}>
                <TextInput
                  style={[styles.input, { textAlign: 'center' }]}
                  value={xp}
                  onChangeText={setXp}
                  keyboardType="numeric"
                  placeholder="10"
                  placeholderTextColor="#999"
                />
                <Text style={styles.xpLabel}>XP</Text>
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Due Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={dueDate}
                onChangeText={setDueDate}
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </View>

        <View style={styles.tipBox}>
          <Ionicons name="bulb-outline" size={20} color="#FFC107" />
          <Text style={styles.tipText}>
            Tip: Be specific with your quest details to help your child understand what's expected.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, (isLoading && styles.buttonDisabled)]}
          onPress={handleCreateQuest}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.buttonText}>Creating...</Text>
          ) : (
            <Text style={styles.buttonText}>Create Quest</Text>
          )}
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
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -8,
  },
  inputGroup: {
    flex: 1,
  },
  pickerContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#333',
  },
  xpInputContainer: {
    position: 'relative',
  },
  xpLabel: {
    position: 'absolute',
    right: 12,
    top: 12,
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  tipBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  tipText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#5D4037',
    lineHeight: 18,
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
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateQuestScreen;
