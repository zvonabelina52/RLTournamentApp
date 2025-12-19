import { Platform } from 'react-native';

// Configuration
const API_CONFIG = {
  // For iOS Simulator use localhost
  // For Android Emulator use 10.0.2.2
  // For physical device use your computer's IP address (e.g., '192.168.1.100')
  development: {
    ios: 'http://localhost:3000/api',
    android: 'http://10.0.2.2:3000/api',
    // Replace with your computer's local IP if testing on physical device
    // Find it by running: ipconfig (Windows) or ifconfig (Mac/Linux)
    physical: 'http://192.168.18.147:3000/api', 
  },
  production: 'https://rltournamentapi.onrender.com/api',
};

const getBaseURL = (): string => {
  const isDev = __DEV__;
  
  if (!isDev) {
    return API_CONFIG.production;
  }
  
  // IMPORTANT: For physical devices, use your computer's IP address
  // Find it by running: ipconfig (Windows) or ifconfig (Mac/Linux)
  const USE_PHYSICAL_DEVICE = true; // Set to true when testing on physical device
  
  if (USE_PHYSICAL_DEVICE) {
    return API_CONFIG.development.physical;
  }
  
  // Development mode - Emulators
  if (Platform.OS === 'ios') {
    return API_CONFIG.development.ios;
  } else if (Platform.OS === 'android') {
    return API_CONFIG.development.android;
  }
  
  return API_CONFIG.development.ios; // fallback
};

const BASE_URL = getBaseURL();

// Types
export type Tournament = {
  time: string;
  teamSize: string;
  mode: string;
  frequency?: string;
  confidence?: number;
  notes?: string;
};

export type WeekTracking = {
  currentWeek: string;
  lastUpdate: string;
  nextUpdate: string;
  calculatedAutomatically?: boolean;
  weekNumber?: number;
  referenceDate?: string;
};

export type TournamentResponse = {
  last_updated: any;
  day?: string;
  date?: string;
  tournaments: Tournament[];
  count: number;
  weekTracking?: WeekTracking;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

class TournamentAPI {
  
  // Generic fetch wrapper with error handling
  private async fetchData<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      console.log(`🌐 Fetching: ${BASE_URL}${endpoint}`);
      
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ Success: ${endpoint}`);
      
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ API Error (${endpoint}):`, errorMessage);
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }

  // Get all tournament data
  async getAllTournaments() {
    return this.fetchData('/tournaments');
  }

  // Get today's tournaments
  async getTodayTournaments(): Promise<ApiResponse<TournamentResponse>> {
    return this.fetchData<TournamentResponse>('/tournaments/today');
  }

  // Get upcoming tournaments from now
  async getUpcomingTournaments() {
    return this.fetchData('/tournaments/upcoming');
  }

  // Get next tournament
  async getNextTournament() {
    return this.fetchData('/tournaments/next');
  }

  // Get tournaments for specific day (monday, tuesday, etc.)
  async getTournamentsByDay(day: string): Promise<ApiResponse<TournamentResponse>> {
    return this.fetchData<TournamentResponse>(`/tournaments/day/${day.toLowerCase()}`);
  }

  // Get tournaments by game mode (soccar, heatseeker, etc.)
  async getTournamentsByMode(mode: string) {
    return this.fetchData(`/tournaments/mode/${mode.toLowerCase()}`);
  }

  // Get guaranteed daily tournaments
  async getDailyTournaments(): Promise<ApiResponse<TournamentResponse>> {
    return this.fetchData<TournamentResponse>('/tournaments/daily');
  }

  // Health check (note: /health is not under /api)
  async healthCheck() {
    try {
      console.log(`🌐 Fetching health check: ${BASE_URL.replace('/api', '')}/health`);
      
      const response = await fetch(`${BASE_URL.replace('/api', '')}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ Health check success`);
      
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Health check error:`, errorMessage);
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    const result = await this.healthCheck();
    return result.success;
  }
}

// Export singleton instance
export default new TournamentAPI();