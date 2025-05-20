import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', withText = true }) => {
  const getSize = () => {
    switch (size) {
      case 'sm':
        return 30;
      case 'lg':
        return 100;
      case 'md':
      default:
        return 60;
    }
  };

  const containerSize = getSize();
  const textSize = size === 'lg' ? 32 : size === 'sm' ? 14 : 24;

  return (
    <View style={styles.container}>
      <View style={[styles.logoContainer, { width: containerSize, height: containerSize }]}>
        <Text style={[styles.logoText, { fontSize: containerSize * 0.6 }]}>🥑</Text>
      </View>
      {withText && (
        <Text style={[styles.logoTitle, { fontSize: textSize }]}>
          Healthy Buddy
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoText: {
    textAlign: 'center',
  },
  logoTitle: {
    color: '#2E7D32',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Logo;
