import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock avatars for selection
const CHILD_AVATARS = [
  '👦', '👧', '👦🏽', '👧🏽', '👦🏿', '👧🏿', '👦🏻', '👧🏻', '👦🏾', '👧🏾', '👦🏼', '👧🏼'
];

type ChildLoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ChildLogin'>;

type Props = {
  navigation: ChildLoginScreenNavigationProp;
};

const ChildLoginScreen: React.FC<Props> = ({ navigation }) => {
  const [accessCode, setAccessCode] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');
  const { loginAsChild, user } = useAuth();

  // Check if parent user is loaded on component mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        // Check if we have a user in AsyncStorage
        const userJson = await AsyncStorage.getItem('@healthy_buddy_user');
        if (!userJson) {
          // If no user in AsyncStorage, try to find one in MOCK_USERS
          const mockUsers = [
            {
              name: "Conrad Arman Vergara",
              email: "vconradarman@gmail.com",
              password: "Budderbutter",
              type: "parent",
              id: "user_1747831898057",
              children: [
                {
                  id: "child-1747831908533",
                  name: "Con",
                  avatar: "👦🏻",
                  level: 1,
                  xp: 0,
                  points: 10,
                  accessCode: "P6WH-57H4",
                  completedQuests: [],
                  inventory: [],
                  parentId: "user_1747831898057",
                  createdAt: "2025-05-21T12:51:48.533Z"
                }
              ],
              createdAt: "2025-05-21T12:51:38.057Z"
            }
          ];
          
          if (mockUsers.length > 0) {
            // Save the first mock user to AsyncStorage
            await AsyncStorage.setItem('@healthy_buddy_user', JSON.stringify(mockUsers[0]));
            console.log('Saved mock user to AsyncStorage');
          }
        }
      } catch (error) {
        console.error('Error checking user:', error);
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  const handleLogin = async () => {
    if (!accessCode.trim()) {
      Alert.alert('Error', 'Please enter an access code');
      return;
    }

    if (!selectedAvatar) {
      Alert.alert('Error', 'Please select an avatar');
      return;
    }

    setIsLoggingIn(true);
    setError('');
    
    try {
      console.log('Attempting to log in with access code:', accessCode.trim().toUpperCase());
      const success = await loginAsChild(accessCode.trim().toUpperCase(), selectedAvatar);
      
      if (success) {
        console.log('Login successful, preparing navigation to child tabs...');
        
        // Small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Reset the navigation stack completely
        navigation.reset({
          index: 0,
          routes: [{ 
            name: 'ChildTabs',
            params: { 
              screen: 'Home',
              params: { refresh: true } 
            } 
          }],
        });
      } else {
        console.log('Login failed: Invalid access code');
        Alert.alert('Error', 'Invalid access code. Please check and try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to log in. Please try again.');
      Alert.alert('Error', 'Failed to log in. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading user data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Child Login</Text>
            <Text style={styles.subtitle}>Enter your access code and choose an avatar</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Access Code</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your access code"
                value={accessCode}
                onChangeText={setAccessCode}
                autoCapitalize="characters"
                editable={!isLoggingIn}
                placeholderTextColor="#999"
                autoCorrect={false}
                autoComplete="off"
              />
              <Ionicons name="key-outline" size={20} color="#666" style={styles.inputIcon} />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Select Avatar</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.avatarContainer}
              keyboardShouldPersistTaps="handled"
            >
              {CHILD_AVATARS.map((avatar) => (
                <TouchableOpacity
                  key={avatar}
                  style={[
                    styles.avatarButton,
                    selectedAvatar === avatar && styles.avatarButtonSelected,
                  ]}
                  onPress={() => setSelectedAvatar(avatar)}
                  disabled={isLoggingIn}
                >
                  <Text style={styles.avatarText}>{avatar}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoggingIn && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoggingIn}
            activeOpacity={0.8}
          >
            {isLoggingIn ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Enter as Child</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={isLoggingIn}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#4A90E2" />
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: '#d32f2f',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  inputIcon: {
    marginLeft: 10,
  },
  avatarContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    flexWrap: 'wrap',
  },
  avatarButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarButtonSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
    transform: [{ scale: 1.1 }],
  },
  avatarText: {
    fontSize: 30,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  backButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  backButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default ChildLoginScreen;
