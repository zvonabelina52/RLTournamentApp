import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import LoadingScreen from './screens/LoadingScreen';
import TournamentScreen from './screens/TournamentScreen';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading/Firebase initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // 3 seconds loading screen

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {isLoading ? <LoadingScreen /> : <TournamentScreen />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
});
