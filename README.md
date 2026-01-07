# Rocket League Tournament Notifier

A React Native mobile app that displays real-time Rocket League tournament schedules. No more tabbing out of the game to check when the next tournament starts.

## What This Does

This mobile app connects to a live tournament data source and shows you all of today's Rocket League tournaments in one clean interface. You can see:

- Tournament times
- Game modes (Soccar, Heatseeker, Rumble, Hoops, etc.)
- Team sizes (2v2, 3v3)
- Live updates synced from the game

## The Problem

If you play Rocket League tournaments, you know the frustration of constantly checking the in-game carousel to see the schedule. This app solves that by putting all tournament info on your phone, so you can check without interrupting your gameplay.

## How It Works

This app is part of a larger system:

1. **Scanner** (separate project) - Captures tournament data from Rocket League using OCR, avaiable as a separate GitHub repo at: https://github.com/zvonabelina52/rocket-league-tracker
2. **Backend API** - Stores and serves tournament data (Express.js on Render)
3. **This App** - Displays tournaments on your phone

The scanner runs on your PC and automatically updates the backend whenever it detects new tournaments. The app fetches this data and displays it with a clean, game-inspired UI.

## Features

- Real-time tournament data from live game scans
- Game-themed dark UI with custom styling
- Color-coded game modes
- Tournament times in 12-hour format
- Connection status indicator
- Pull-to-refresh functionality

## Tech Stack

- React Native / Expo
- TypeScript
- React Native Navigation
- Custom animations and styling

## Setup

### Prerequisites

- Node.js 16+
- Expo CLI
- iOS Simulator (Mac) or Android Emulator
- Physical device for testing (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/zvonabelina52/RLTournamentApp.git
cd RLTournamentApp
```

2. Install dependencies:
```bash
npm install
```

3. Configure API endpoint:

Open `src/services/tournamentApi.ts` and update the configuration:

```typescript
const API_CONFIG = {
  development: {
    ios: 'http://localhost:3000/api',           // iOS Simulator
    android: 'http://10.0.2.2:3000/api',        // Android Emulator
    physical: 'http://192.168.X.X:3000/api',    // Replace with your IP
  },
  production: 'https://your-backend.onrender.com/api',
};

// For physical devices, set this to true and update your IP above
const USE_PHYSICAL_DEVICE = false;
```

4. Start the development server:
```bash
npx expo start
```

5. Run on a device:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go for physical device

## Project Structure

```
RLTournamentApp/
├── src/
│   ├── screens/
│   │   ├── LoadingScreen.tsx      # Animated loading screen
│   │   └── TournamentScreen.tsx   # Main tournament list
│   ├── services/
│   │   └── tournamentApi.ts       # API client
│   └── App.tsx                     # App entry point
├── assets/
│   └── images/
│       └── loading_screen_image.jpg
├── package.json
└── README.md
```

## API Configuration

The app connects to a backend API with these endpoints:

```
GET /api/tournaments/today     # Today's tournaments
GET /api/tournaments/upcoming  # Upcoming tournaments
GET /api/tournaments/next      # Next tournament
GET /health                    # Server status
```

### Environment Setup

**For local development:**
- Backend must be running on `http://localhost:3000`
- Use iOS Simulator or Android Emulator
- Set `USE_PHYSICAL_DEVICE = false`

**For physical device testing:**
- Find your computer's local IP address:
  - Windows: `ipconfig` (look for IPv4 Address)
  - Mac/Linux: `ifconfig` (look for inet)
- Update `physical` URL in `tournamentApi.ts`
- Set `USE_PHYSICAL_DEVICE = true`
- Make sure your phone and computer are on the same WiFi network

**For production:**
- The app is configured to use a Render-hosted backend
- No additional setup needed

## Development

### Running the app

```bash
# Start development server
npx expo start

# Start with cache cleared
npx expo start -c

# Run on specific platform
npx expo start --ios
npx expo start --android
```

### Building for production

```bash
# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios

# Build for both
eas build --platform all
```

## Troubleshooting

### Cannot connect to backend

**Problem:** App shows "API Disconnected" or fails to load tournaments

**Solutions:**
1. Check backend is running (visit health endpoint in browser)
2. Verify API URL in `tournamentApi.ts` matches your backend
3. For physical devices, ensure same WiFi network
4. Check device firewall isn't blocking connections
5. For Render backend, first request may take 30-60 seconds (cold start)

### App shows no tournaments

**Problem:** Connection works but no tournaments display

**Solutions:**
1. Verify backend has data: `curl YOUR_BACKEND_URL/api/tournaments/today`
2. Check scanner has run and synced data
3. Look at React Native debugger console for errors
4. Ensure date/time format matches what app expects

### iOS Simulator issues

**Problem:** App crashes or doesn't load on iOS

**Solutions:**
1. Reset simulator: Device → Erase All Content and Settings
2. Clear Expo cache: `npx expo start -c`
3. Reinstall dependencies: `rm -rf node_modules && npm install`

### Android Emulator issues

**Problem:** Slow performance or connection issues

**Solutions:**
1. Use `10.0.2.2` instead of `localhost` for API calls
2. Increase emulator RAM in AVD Manager
3. Enable hardware acceleration

## UI/UX Design

The app uses a custom dark theme inspired by Rocket League's aesthetic:

- **Primary blue** (#0087ff) for highlights and accents
- **Orange** (#ff7f00) for secondary elements
- **Dark backgrounds** (#0a0a0a, #151515) for readability
- **Animated loading screen** with pulsing glow effects
- **Color-coded game modes** for quick visual scanning

Each game mode has its own color:
- Soccar: Blue
- Heatseeker: Purple
- Rumble: Red
- Hoops: Orange
- Snow Day: Light Blue
- Pentathlon: Gold
- Dropshot: Pink

## Screenshots

(Add screenshots here showing the loading screen, tournament list, and connection status)

## Limitations & Known Issues

- App requires backend to be running and accessible
- No offline mode (yet)
- Backend on Render free tier has 30-60 second cold start delays
- No push notifications (planned for future)
- Only shows today's tournaments (no historical data)
- Manual refresh required (no auto-refresh interval)

## Future Improvements

Things I want to add:

- Push notifications 30 minutes before tournaments
- Favorite specific game modes
- Filter tournaments by team size
- Historical data view
- Auto-refresh every 5 minutes
- Offline caching
- Dark/light theme toggle
- Share tournament schedule with friends

## Related Projects

This app is part of a larger tournament tracking system:

- **Tournament Scanner** - Python OCR tool that captures data from Rocket League
- **Backend API** - Express.js REST API (this repo's backend folder or separate repo)

## Contributing

Found a bug or want to add a feature? Contributions are welcome!

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/cool-thing`)
3. Make your changes
4. Test on both iOS and Android if possible
5. Submit a pull request

## Acknowledgments

- Built with React Native and Expo
- UI inspired by Rocket League's visual style
- Backend powered by Express.js and Render

## License

MIT License - feel free to use this for your own projects.

## Contact

Questions or suggestions? Open an issue on GitHub.

---

**Note:** This is a fan-made tool and is not affiliated with Psyonix or Epic Games.
