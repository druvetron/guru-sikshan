import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Image, Easing } from 'react-native';

export default function LoginScreen({ navigation }: any) {
  const [teacherId, setTeacherId] = useState('');
  const [cluster, setCluster] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [animatedValue] = useState(new Animated.Value(0));
  const [iconScale] = useState(new Animated.Value(1));
  const [iconRotation] = useState(new Animated.Value(0));

  const handleLogin = () => {
    if (teacherId && cluster) {
      //TO DO: Add JWT
      navigation.navigate('IssueSubmit', { teacherId, cluster });
    }
  };

  const toggleTheme = () => {
    // Icon animation - bounce effect
    Animated.sequence([
      Animated.parallel([
        Animated.timing(iconScale, {
          toValue: 0.8,
          duration: 150,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.timing(iconRotation, {
          toValue: 1,
          duration: 150,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(iconScale, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(iconRotation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Theme color animation - smooth easing
    Animated.timing(animatedValue, {
      toValue: isDarkMode ? 1 : 0,
      duration: 2000,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1), // Material Design ease curve
      useNativeDriver: false,
    }).start();

    setIsDarkMode(!isDarkMode);
  };

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#1a1a1a', '#f5f5f5'],
  });

  const buttonColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#BF77F6', '#023E8A'],
  });

  const textColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ffffff', '#000000'],
  });

  const subtitleColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#cccccc', '#666666'],
  });

  const inputBg = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#333333', '#ffffff'],
  });

  const rotation = iconRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme} activeOpacity={0.8}>
        <Animated.View style={{ transform: [{ scale: iconScale }, { rotate: rotation }] }}>
          <Image
            source={isDarkMode ? require('../../assets/2.png') : require('../../assets/1.png')}
            style={styles.themeIcon}
            resizeMode="contain"
          />
        </Animated.View>
      </TouchableOpacity>

      <Animated.Text style={[styles.title, { color: textColor, fontFamily: 'Baskerville' }]}>
        Guru Sikshan
      </Animated.Text>
      <Animated.Text style={[styles.subtitle, { color: subtitleColor, fontFamily: 'Baskerville' }]}>
        Teacher Training Platform
      </Animated.Text>

      <Animated.View style={[styles.inputWrapper, { backgroundColor: inputBg }]}>
        <TextInput
          style={[styles.input, { fontFamily: 'Baskerville' }]}
          placeholder="Teacher ID"
          placeholderTextColor="#999"
          value={teacherId}
          onChangeText={setTeacherId}
        />
      </Animated.View>

      <Animated.View style={[styles.inputWrapper, { backgroundColor: inputBg }]}>
        <TextInput
          style={[styles.input, { fontFamily: 'Baskerville' }]}
          placeholder="Cluster"
          placeholderTextColor="#999"
          value={cluster}
          onChangeText={setCluster}
        />
      </Animated.View>

      <Animated.View style={[styles.button, { backgroundColor: buttonColor }]}>
        <TouchableOpacity onPress={handleLogin}>
          <Text style={[styles.buttonText, { fontFamily: 'Baskerville' }]}>Login</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  themeToggle: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
    zIndex: 10,
  },
  themeIcon: {
    width: 44,
    height: 44,
  },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 40 },
  inputWrapper: { borderRadius: 8, marginBottom: 15 },
  input: { padding: 15, fontSize: 16, color: '#000' },
  button: { padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
