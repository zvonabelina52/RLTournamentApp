import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';
import tournamentAPI, { Tournament } from '../services/tournamentApi';

const TournamentScreen: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [showTournaments, setShowTournaments] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  const [weekTracking, setWeekTracking] = useState<{
    currentWeek: string;
    lastUpdate: string;
    nextUpdate: string;
  } | null>(null);

  // Test connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const isConnected = await tournamentAPI.testConnection();
    setConnectionStatus(isConnected ? 'connected' : 'disconnected');
    if (!isConnected) {
      Alert.alert(
        'Connection Error',
        'Cannot connect to the tournament server. Make sure the API is running on http://localhost:3000',
        [{ text: 'OK' }]
      );
    }
  };

  const formatTime = (timeString: string): string => {
    // timeString is in format "13:00"
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  const getModeColor = (mode: string): string => {
    const modeColors: { [key: string]: string } = {
      'Soccar': '#0087ff',           // Blue
      'Pentathlon': '#FFD700',       // Yellowish Gold
      'Heatseeker': '#9d4edd',       // Purple
      'Hoops': '#ff7f00',            // Orange
      'Snow Day': '#48cae4',         // Light Blue
      'Rumble': '#ff006e',           // Red
      'Dropshot': '#d946ef',         // Reddish Purple
    };
    return modeColors[mode] || '#0087ff';
  };

  const handleGetTournaments = async () => {
    setLoading(true);
    
    try {
      // Fetch today's tournaments from the API
      const result = await tournamentAPI.getTodayTournaments();
      
      if (result.success && result.data) {
        setTournaments(result.data.tournaments);
        setShowTournaments(true);
        
        // Store week tracking info if available
        if (result.data.weekTracking) {
          setWeekTracking(result.data.weekTracking);
        }
        
        console.log(`📊 Loaded ${result.data.count} tournaments for ${result.data.day}`);
      } else {
        Alert.alert(
          'Error',
          result.error || 'Failed to fetch tournaments',
          [
            { text: 'Retry', onPress: handleGetTournaments },
            { text: 'Cancel' }
          ]
        );
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderConnectionStatus = () => {
    if (connectionStatus === 'unknown') return null;
    
    return (
      <View style={styles.connectionStatus}>
        <View style={[
          styles.statusDot,
          { backgroundColor: connectionStatus === 'connected' ? '#06ffa5' : '#ff006e' }
        ]} />
        <Text style={styles.statusText}>
          {connectionStatus === 'connected' ? 'API Connected' : 'API Disconnected'}
        </Text>
        {weekTracking && connectionStatus === 'connected' && (
          <>
            <View style={styles.statusDivider} />
            <Text style={styles.weekText}>Week {weekTracking.currentWeek}</Text>
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Background gradient effects */}
        <View style={styles.gradientContainer}>
          <View style={[styles.gradientCircle, { backgroundColor: '#0087ff15' }]} />
          <View style={[styles.gradientCircle2, { backgroundColor: '#ff7f0015' }]} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLine} />
          <Text style={styles.headerTitle}>ROCKET LEAGUE</Text>
          <Text style={styles.headerSubtitle}>Tourney Notifier</Text>
          <View style={styles.headerLine} />
          {renderConnectionStatus()}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>TOURNAMENTS</Text>
          </View>

          <TouchableOpacity 
            style={styles.button}
            onPress={handleGetTournaments}
            activeOpacity={0.8}
            disabled={loading}
          >
            <View style={styles.buttonGlow} />
            <Text style={styles.buttonText}>
              {loading ? 'LOADING...' : 'Get Today\'s Tournaments'}
            </Text>
            <View style={[styles.buttonCorner, styles.buttonCornerTL]} />
            <View style={[styles.buttonCorner, styles.buttonCornerTR]} />
            <View style={[styles.buttonCorner, styles.buttonCornerBL]} />
            <View style={[styles.buttonCorner, styles.buttonCornerBR]} />
          </TouchableOpacity>

          {/* Tournament List */}
          {showTournaments && (
            <ScrollView 
              style={styles.tournamentList}
              showsVerticalScrollIndicator={false}
            >
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
                        <View style={styles.cardValueContainer}>
                          <Text style={[
                            styles.cardValue, 
                            { color: getModeColor(tournament.mode) }
                          ]}>
                            {formatTime(tournament.time)}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.cardDivider} />

                      <View style={styles.cardRow}>
                        <Text style={styles.cardLabel}>TEAM SIZE</Text>
                        <View style={styles.cardValueContainer}>
                          <Text style={[
                            styles.cardValue, 
                            { color: getModeColor(tournament.mode) }
                          ]}>
                            {tournament.teamSize}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.cardDivider} />

                      <View style={styles.cardRow}>
                        <Text style={styles.cardLabel}>MODE</Text>
                        <View style={[
                          styles.modeBadge, 
                          { borderColor: getModeColor(tournament.mode) }
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

                    {/* Card corners */}
                    <View style={[styles.cardCorner, styles.cardCornerTL]} />
                    <View style={[styles.cardCorner, styles.cardCornerTR]} />
                    <View style={[styles.cardCorner, styles.cardCornerBL]} />
                    <View style={[styles.cardCorner, styles.cardCornerBR]} />
                  </View>
                ))
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TournamentScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
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
    width: 250,
    height: 250,
    borderRadius: 125,
    top: 50,
    right: -80,
    opacity: 0.4,
  },
  gradientCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    bottom: 200,
    left: -60,
    opacity: 0.4,
  },
  header: {
    padding: 25,
    paddingTop: 20,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#0087ff50',
  },
  headerLine: {
    width: 60,
    height: 3,
    backgroundColor: '#0087ff',
    marginBottom: 15,
    shadowColor: '#0087ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
    textShadowColor: '#0087ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ff7f00',
    letterSpacing: 2,
    marginTop: 5,
    textShadowColor: '#ff7f00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999999',
  },
  statusDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#333333',
    marginHorizontal: 10,
  },
  weekText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  sectionAccent: {
    width: 4,
    height: 24,
    backgroundColor: '#0087ff',
    marginRight: 12,
    shadowColor: '#0087ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  button: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#0087ff',
    paddingVertical: 18,
    paddingHorizontal: 30,
    marginBottom: 25,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#0087ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
  },
  buttonGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#0087ff20',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    zIndex: 1,
  },
  buttonCorner: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderColor: '#00d9ff',
  },
  buttonCornerTL: {
    top: -2,
    left: -2,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  buttonCornerTR: {
    top: -2,
    right: -2,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  buttonCornerBL: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  buttonCornerBR: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  tournamentList: {
    flex: 1,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '600',
  },
  tournamentCard: {
    backgroundColor: '#151515',
    borderWidth: 2,
    borderColor: '#333333',
    marginBottom: 15,
    padding: 18,
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    shadowColor: '#0087ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  cardContent: {
    marginLeft: 10,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#999999',
    letterSpacing: 1.5,
  },
  cardValueContainer: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 4,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: '#0087ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  modeBadge: {
    borderWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 3,
  },
  modeText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#06ffa5',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#2a2a2a',
    marginVertical: 4,
  },
  cardCorner: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderColor: '#555555',
  },
  cardCornerTL: {
    top: -1,
    left: -1,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cardCornerTR: {
    top: -1,
    right: -1,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  cardCornerBL: {
    bottom: -1,
    left: -1,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  cardCornerBR: {
    bottom: -1,
    right: -1,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
});