import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import tournamentAPI, { Tournament } from '../services/tournamentApi';

const TournamentScreenContent: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');

  useEffect(() => {
    const initializeScreen = async () => {
      // Check connection and fetch tournaments automatically
      const isConnected = await tournamentAPI.testConnection();
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
      
      if (!isConnected) {
        setLoading(false);
        Alert.alert(
          'Connection Error',
          'Cannot connect to the tournament server. Make sure the API is running on http://localhost:3000',
          [{ text: 'OK' }]
        );
        return;
      }

      // Auto-fetch tournaments
      setLoading(true);
      try {
        const result = await tournamentAPI.getTodayTournaments();
        
        if (result.success && result.data) {
          const tournamentList = result.data.tournaments || [];
          setTournaments(tournamentList);
          console.log(`📊 Loaded ${tournamentList.length} tournaments from live scan`);
        } else {
          Alert.alert(
            'Error',
            result.error || 'Failed to fetch tournaments',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Error fetching tournaments:', error);
        Alert.alert('Error', 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    initializeScreen();
  }, []);

  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  const getModeColor = (mode: string): string => {
    const modeColors: { [key: string]: string } = {
      'Soccar': '#0087ff',
      'Pentathlon': '#FFD700',
      'Heatseeker': '#9d4edd',
      'Hoops': '#ff7f00',
      'Snow Day': '#48cae4',
      'Rumble': '#ff006e',
      'Dropshot': '#d946ef',
    };
    return modeColors[mode] || '#0087ff';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      
      {/* Background gradient effects */}
      <View style={styles.gradientContainer}>
        <View style={[styles.gradientCircle, { backgroundColor: '#0087ff10' }]} />
        <View style={[styles.gradientCircle2, { backgroundColor: '#ff7f0010' }]} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ROCKET LEAGUE</Text>
        <Text style={styles.headerSubtitle}>Tourney Notifier</Text>
        
        {connectionStatus !== 'unknown' && (
          <View style={styles.connectionStatus}>
            <View style={[
              styles.statusDot,
              { backgroundColor: connectionStatus === 'connected' ? '#06ffa5' : '#ff006e' }
            ]} />
            <Text style={styles.statusText}>
              {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 20 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>TOURNAMENTS</Text>
        </View>

        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0087ff" />
            <Text style={styles.loadingText}>Loading tournaments...</Text>
          </View>
        ) : (
          /* Tournament List */
          <View style={styles.tournamentList}>
            {tournaments.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No tournaments available</Text>
              </View>
            ) : (
              tournaments.map((tournament, index) => (
                <View key={index} style={styles.tournamentCard}>
                  <View style={[
                    styles.cardAccent, 
                    { backgroundColor: getModeColor(tournament.mode) }
                  ]} />
                  
                  <View style={styles.cardContent}>
                    <View style={styles.cardRow}>
                      <Text style={styles.cardLabel}>TIME</Text>
                      <Text style={[
                        styles.cardValue, 
                        { color: getModeColor(tournament.mode) }
                      ]}>
                        {formatTime(tournament.time)}
                      </Text>
                    </View>

                    <View style={styles.cardDivider} />

                    <View style={styles.cardRow}>
                      <Text style={styles.cardLabel}>TEAM SIZE</Text>
                      <Text style={[
                        styles.cardValue, 
                        { color: getModeColor(tournament.mode) }
                      ]}>
                        {tournament.teamSize}
                      </Text>
                    </View>

                    <View style={styles.cardDivider} />

                    <View style={styles.cardRow}>
                      <Text style={styles.cardLabel}>MODE</Text>
                      <View style={[
                        styles.modeBadge, 
                        { 
                          backgroundColor: `${getModeColor(tournament.mode)}20`,
                          borderColor: getModeColor(tournament.mode)
                        }
                      ]}>
                        <Text style={[
                          styles.modeText, 
                          { color: getModeColor(tournament.mode) }
                        ]}>
                          {tournament.mode.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const TournamentScreen: React.FC = () => {
  return (
    <SafeAreaProvider>
      <TournamentScreenContent />
    </SafeAreaProvider>
  );
};

export default TournamentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
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
    top: -50,
    right: -100,
    opacity: 0.5,
  },
  gradientCircle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    bottom: 100,
    left: -80,
    opacity: 0.5,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: '#0087ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff7f00',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#151515',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888888',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionAccent: {
    width: 3,
    height: 20,
    backgroundColor: '#0087ff',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#888888',
    fontWeight: '600',
  },
  tournamentList: {
    flex: 1,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#666666',
    fontWeight: '500',
  },
  tournamentCard: {
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: '#252525',
    borderRadius: 12,
    marginBottom: 16,
    padding: 20,
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  cardContent: {
    marginLeft: 8,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888888',
    letterSpacing: 1,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modeBadge: {
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  modeText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#252525',
    marginVertical: 2,
  },
});