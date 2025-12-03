// server.js - Place this in a new folder: RLTournamentAPI/
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const tournamentData = require('./data/tournaments.json');

// Helper function to automatically calculate current week based on date
function getCurrentWeek() {
  const referenceDate = new Date('2025-11-21');
  const referenceDateWeek = 'B';
  
  const currentDate = new Date();
  
  const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
  const timeDiff = currentDate - referenceDate;
  const weeksDiff = Math.floor(timeDiff / millisecondsPerWeek);
  
  // Alternate between A and B based on weeks passed
  // If reference was B (0), then next week (1) is A, then B, then A...
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

// Helper function to resolve rotating tournaments based on current week
function resolveRotatingTournament(tournament) {
  const weekInfo = getCurrentWeek();
  const currentWeek = weekInfo.currentWeek;
  
  // If tournament has week-based rotation, resolve it
  if (tournament.mode === 'varies' && tournament[`week${currentWeek}`]) {
    return {
      ...tournament,
      mode: tournament[`week${currentWeek}`],
      notes: `${tournament.notes} (Week ${currentWeek} - Auto-calculated)`
    };
  }
  
  return tournament;
}

// Helper function to get current day tournaments
function getTournamentsByDay(dayName) {
  const daily = tournamentData.guaranteedDailyTournaments;
  
  let daySpecific = [];
  const lowerDay = dayName.toLowerCase();
  
  if (tournamentData.stableWeekdayPatterns[lowerDay]) {
    daySpecific = tournamentData.stableWeekdayPatterns[lowerDay];
  } else if (tournamentData.weekendStablePatterns[lowerDay]) {
    daySpecific = tournamentData.weekendStablePatterns[lowerDay];
  }
  
  // Resolve rotating tournaments based on current week
  daySpecific = daySpecific.map(resolveRotatingTournament);
  
  return {
    daily,
    daySpecific,
    allTournaments: [...daily, ...daySpecific].sort((a, b) => 
      a.time.localeCompare(b.time)
    )
  };
}

// Helper to get tournaments for current time
function getUpcomingTournaments(currentTime, dayName) {
  const tournaments = getTournamentsByDay(dayName);
  return tournaments.allTournaments.filter(t => t.time >= currentTime);
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
    service: 'RL Tournament API'
  });
});

// Get all tournament data
app.get('/api/tournaments', (req, res) => {
  res.json(tournamentData);
});

// Get tournaments for today
app.get('/api/tournaments/today', (req, res) => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[new Date().getDay()];
  const tournaments = getTournamentsByDay(today);
  
  res.json({
    day: today,
    date: new Date().toISOString().split('T')[0],
    tournaments: tournaments.allTournaments,
    count: tournaments.allTournaments.length,
    weekTracking: tournamentData.weekTracking
  });
});

// Get upcoming tournaments (from current time)
app.get('/api/tournaments/upcoming', (req, res) => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const now = new Date();
  const today = days[now.getDay()];
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const upcoming = getUpcomingTournaments(currentTime, today);
  
  res.json({
    day: today,
    currentTime,
    upcoming,
    count: upcoming.length
  });
});

// Get next tournament
app.get('/api/tournaments/next', (req, res) => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const now = new Date();
  const today = days[now.getDay()];
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const upcoming = getUpcomingTournaments(currentTime, today);
  
  if (upcoming.length > 0) {
    res.json({
      tournament: upcoming[0],
      timeUntil: calculateTimeUntil(upcoming[0].time, now)
    });
  } else {
    res.json({
      message: 'No more tournaments today',
      nextDay: days[(now.getDay() + 1) % 7]
    });
  }
});

// Get tournaments for a specific day
app.get('/api/tournaments/day/:day', (req, res) => {
  const day = req.params.day;
  const tournaments = getTournamentsByDay(day);
  
  if (tournaments.allTournaments.length === 0) {
    return res.status(404).json({ error: 'Invalid day name' });
  }
  
  res.json({
    day,
    tournaments: tournaments.allTournaments,
    count: tournaments.allTournaments.length,
    weekTracking: tournamentData.weekTracking
  });
});

// Get tournaments by mode
app.get('/api/tournaments/mode/:mode', (req, res) => {
  const mode = req.params.mode;
  const allDaily = tournamentData.guaranteedDailyTournaments.filter(
    t => t.mode.toLowerCase() === mode.toLowerCase()
  );
  
  res.json({
    mode,
    tournaments: allDaily,
    count: allDaily.length
  });
});

// Get guaranteed daily tournaments only
app.get('/api/tournaments/daily', (req, res) => {
  res.json({
    tournaments: tournamentData.guaranteedDailyTournaments,
    count: tournamentData.guaranteedDailyTournaments.length,
    note: 'These tournaments occur every single day'
  });
});

// Get week tracking info
app.get('/api/week-tracking', (req, res) => {
  res.json(tournamentData.weekTracking || {
    currentWeek: 'A',
    weekRotation: 'A or B',
    lastUpdate: new Date().toISOString().split('T')[0],
    notes: 'Week tracking not configured'
  });
});

// Update current week (for manual updates)
app.post('/api/week-tracking/update', (req, res) => {
  const { week } = req.body;
  
  if (week !== 'A' && week !== 'B') {
    return res.status(400).json({ error: 'Week must be A or B' });
  }
  
  if (tournamentData.weekTracking) {
    tournamentData.weekTracking.currentWeek = week;
    tournamentData.weekTracking.lastUpdate = new Date().toISOString().split('T')[0];
  }
  
  res.json({
    message: 'Week updated successfully',
    weekTracking: tournamentData.weekTracking
  });
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
      'GET /api/tournaments/day/:day',
      'GET /api/tournaments/mode/:mode',
      'GET /api/tournaments/daily'
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
  console.log(`   GET  /api/tournaments/day/:day`);
  console.log(`   GET  /api/tournaments/mode/:mode`);
  console.log(`   GET  /api/tournaments/daily`);
  console.log(`\n✨ Ready to serve tournament data!\n`);
});

module.exports = app;