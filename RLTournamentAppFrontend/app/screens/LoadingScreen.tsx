import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, Image } from 'react-native';

const LoadingScreen: React.FC = () => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Scale up animation for logo
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Loading bar animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(barAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(barAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [scaleAnim, barAnim]);

  const barOpacity = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <View style={styles.container}>
      {/* Background gradient effects */}
      <View style={styles.gradientContainer}>
        <View style={[styles.gradientCircle, { backgroundColor: '#0087ff20' }]} />
        <View style={[styles.gradientCircle2, { backgroundColor: '#ff7f0020' }]} />
      </View>

      {/* Animated Logo with Image - NO PULSATING CIRCLE */}
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.logo}>
          <Image
            source={require('../../assets/images/loading_screen_image.jpg')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      </Animated.View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>ROCKET LEAGUE</Text>
        <Text style={styles.subtitle}>TOURNEY NOTIFIER</Text>
      </View>

      {/* Loading bar */}
      <View style={styles.loadingBarContainer}>
        <View style={styles.loadingBarBackground}>
          <Animated.View 
            style={[
              styles.loadingBarFill,
              { opacity: barOpacity }
            ]} 
          />
        </View>
      </View>
    </View>
  );
};

export default LoadingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gradientCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: 100,
    left: -100,
    opacity: 0.3,
  },
  gradientCircle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    bottom: 150,
    right: -80,
    opacity: 0.3,
  },
  logoContainer: {
    marginBottom: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 150,
    height: 150,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
    textShadowColor: '#0087ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ff7f00',
    letterSpacing: 3,
    textShadowColor: '#ff7f00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  loadingBarContainer: {
    width: '70%',
    alignItems: 'center',
  },
  loadingBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#0087ff50',
  },
  loadingBarFill: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0087ff',
    shadowColor: '#0087ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
});