// server.js - Fixed version
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for tournament data (survives until server restart)
let tournamentData = {
  date: null,
  last_updated: null,
  tournaments: [],
  count: 0
};

// Helper function to automatically calculate current week based on date
function getCurrentWeek() {
  const referenceDate = new Date('2025-11-21');
  const referenceDateWeek = 'B';
  
  const currentDate = new Date();
  
  const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
  const timeDiff = currentDate - referenceDate;
  const weeksDiff = Math.floor(timeDiff / millisecondsPerWeek);
  
  const isEvenWeek = weeksDiff % 2 === 0;
  const currentWeek = (referenceDateWeek === 'B') 
    ? (isEvenWeek ? 'B' : 'A')
    : (isEvenWeek ? 'A' : 'B');
  
  const nextMonday = new Date(currentDate);
  const daysUntilMonday = (8 - nextMonday.getDay()) % 7 || 7;
  nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
  
  return {
    currentWeek,
    lastUpdate: currentDate.toISOString().split('T')[0],
    nextUpdate: nextMonday.toISOString().split('T')[0],
    calculatedAutomatically: true,
    weekNumber: Math.abs(weeksDiff),
    referenceDate: '2025-11-21'
  };
}

// Helper function to calculate time until tournament
function calculateTimeUntil(tournamentTime, now) {
  const [hours, minutes] = tournamentTime.split(':').map(Number);
  const tournamentDate = new Date(now);
  tournamentDate.setHours(hours, minutes, 0, 0);
  
  const diff = tournamentDate - now;
  const hoursUntil = Math.floor(diff / (1000 * 60 * 60));
  const minutesUntil = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return {
    hours: hoursUntil,
    minutes: minutesUntil,
    totalMinutes: Math.floor(diff / (1000 * 60))
  };
}

// ==================== ROUTES ====================

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'RL Tournament API',
    tournamentsLoaded: tournamentData.tournaments.length
  });
});

// Get all tournament data
app.get('/api/tournaments', (req, res) => {
  res.json({
    count: tournamentData.tournaments.length,
    lastUpdated: tournamentData.last_updated || "No data yet",
    tournaments: tournamentData.tournaments
  });
});

// Get tournaments for today
app.get('/api/tournaments/today', (req, res) => {
  res.json(tournamentData);
});

// Get upcoming tournaments (from current time)
app.get('/api/tournaments/upcoming', (req, res) => {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  // Filter tournaments that haven't started yet
  const upcoming = tournamentData.tournaments.filter(t => {
    // Convert "1:00PM" to 24-hour format for comparison
    const tournamentTime = t.time;
    return tournamentTime >= currentTime;
  });
  
  res.json({
    currentTime,
    upcoming,
    count: upcoming.length
  });
});

// Get next tournament
app.get('/api/tournaments/next', (req, res) => {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const upcoming = tournamentData.tournaments.filter(t => t.time >= currentTime);
  
  if (upcoming.length > 0) {
    res.json({
      tournament: upcoming[0],
      timeUntil: calculateTimeUntil(upcoming[0].time, now)
    });
  } else {
    res.json({
      message: 'No more tournaments today',
      nextRefresh: 'Check again tomorrow'
    });
  }
});

// Get tournaments by mode
app.get('/api/tournaments/mode/:mode', (req, res) => {
  const mode = req.params.mode.toLowerCase();
  const filtered = tournamentData.tournaments.filter(
    t => t.mode.toLowerCase() === mode
  );
  
  res.json({
    mode,
    tournaments: filtered,
    count: filtered.length
  });
});

// ==================== UPDATE ENDPOINT ====================
// This is what your Python scanner calls
app.post('/api/tournaments/update', (req, res) => {
  try {
    const scannerData = req.body;

    // Validate incoming data
    if (!scannerData || !scannerData.tournaments || !Array.isArray(scannerData.tournaments)) {
      return res.status(400).json({ 
        error: 'Invalid data format. Expected { tournaments: [...] }' 
      });
    }

    // Update in-memory storage
    tournamentData = {
      date: scannerData.date || new Date().toISOString().split('T')[0],
      last_updated: scannerData.lastUpdate || new Date().toISOString(),
      tournaments: scannerData.tournaments,
      count: scannerData.tournaments.length
    };

    console.log(`✅ Data synced! Received ${scannerData.tournaments.length} tournaments`);
    console.log(`📅 Date: ${tournamentData.date}`);
    console.log(`🕐 Last updated: ${tournamentData.last_updated}`);

    res.json({ 
      message: 'Success', 
      count: tournamentData.tournaments.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Sync Error:', error);
    res.status(500).json({ 
      error: 'Failed to update tournament data',
      details: error.message 
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'GET /api/tournaments',
      'GET /api/tournaments/today',
      'GET /api/tournaments/upcoming',
      'GET /api/tournaments/next',
      'GET /api/tournaments/mode/:mode',
      'POST /api/tournaments/update'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Tournament API Server Started!`);
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`\n📊 Available Endpoints:`);
  console.log(`   GET  /health`);
  console.log(`   GET  /api/tournaments`);
  console.log(`   GET  /api/tournaments/today`);
  console.log(`   GET  /api/tournaments/upcoming`);
  console.log(`   GET  /api/tournaments/next`);
  console.log(`   GET  /api/tournaments/mode/:mode`);
  console.log(`   POST /api/tournaments/update`);
  console.log(`\n✨ Ready to serve tournament data!\n`);
});

module.exports = app;