import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  StatusBar,
  ActivityIndicator 
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';

type AddRewardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddReward'>;

type Props = {
  navigation: AddRewardScreenNavigationProp;
};

const AddRewardScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  
  // Temporary function until we add it to AuthContext
  const addReward = async (reward: any) => {
    // This is a placeholder - in a real app, this would be implemented in the AuthContext
    console.log('Adding reward:', reward);
    // In a real implementation, this would update the rewards in AsyncStorage
    // and update the context state
  };
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [category, setCategory] = useState('home');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddReward = async () => {
    if (!title.trim() || !cost) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (isNaN(Number(cost)) || Number(cost) <= 0) {
      Alert.alert('Error', 'Please enter a valid cost');
      return;
    }

    try {
      setIsLoading(true);
      await addReward({
        id: Date.now().toString(),
        title: title.trim(),
        description: description.trim(),
        cost: Number(cost),
        category,
        isActive: true,
        createdBy: user?.id || '',
        createdAt: new Date().toISOString(),
        icon: 'gift',
        type: 'physical'
      });
      
      Alert.alert('Success', 'Reward added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error adding reward:', error);
      Alert.alert('Error', 'Failed to add reward. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Reward</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Reward Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter reward title"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter reward description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Cost (Points) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter cost in points"
            value={cost}
            onChangeText={setCost}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Home" value="home" />
              <Picker.Item label="Entertainment" value="entertainment" />
              <Picker.Item label="Food" value="food" />
              <Picker.Item label="Other" value="other" />
            </Picker>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleAddReward}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Add Reward</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginTop: StatusBar.currentHeight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#A0C4FF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddRewardScreen;