/**
 * 24-Hour Continuous Background Scheduler
 * Runs locally or on any machine. Executes AI news curation immediately, 
 * then automatically repeats every 24 hours (86,400,000 ms).
 * 
 * USAGE:
 *   node scripts/auto-loop-24h.cjs
 */

const { execSync } = require('child_process');

const INTERVAL_24H = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

function runCuration() {
  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  console.log(`\n============================================================`);
  console.log(`🚀 [${now}] Starting Automated 24-Hour AI News Fetch...`);
  console.log(`============================================================\n`);

  try {
    execSync('node scripts/curate-news.cjs', { stdio: 'inherit' });
    console.log(`\n✅ Curation completed successfully.`);
  } catch (error) {
    console.error(`❌ Curation failed:`, error.message);
  }

  const nextRun = new Date(Date.now() + INTERVAL_24H).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  console.log(`\n⏰ Next automated update scheduled for: ${nextRun}`);
  console.log(`============================================================\n`);
}

// Execute immediately on startup
runCuration();

// Repeat every 24 hours
setInterval(runCuration, INTERVAL_24H);
