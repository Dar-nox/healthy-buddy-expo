import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import Logo from '../components/Logo';

const logo = require('../../assets/logo.png');

type ModeSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ModeSelection'>;

type Props = {
  navigation: ModeSelectionScreenNavigationProp;
};

const ModeSelectionScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.content}>
        <Logo size="lg" />
        <Text style={styles.subtitle}>Choose your mode to get started!</Text>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.parentButton]} 
            onPress={() => navigation.navigate('ParentAuth', { mode: 'login' })}
          >
            <Text style={styles.buttonText}>Parent Mode</Text>
            <Text style={styles.buttonSubtext}>Manage your family's health journey</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.childButton]}
            onPress={() => navigation.navigate('ChildLogin')}
          >
            <Text style={styles.buttonText}>Child Mode</Text>
            <Text style={styles.buttonSubtext}>Start your adventure!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
    fontFamily: 'ArialRoundedMTBold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    marginBottom: 40,
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  parentButton: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  childButton: {
    backgroundColor: '#F1F8E9',
    borderColor: '#8BC34A',
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
    fontFamily: 'ArialRoundedMTBold',
  },
  buttonSubtext: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'ArialMT',
  },
});

export default ModeSelectionScreen;
