

export const HOURS_PER_WEEK = 48;
// Convert to milliseconds (48 hours * 60 minutes * 60 seconds * 1000)
export const MS_PER_WEEK = HOURS_PER_WEEK * 60 * 60 * 1000;

// To calculate: When should the current week's match be played?
// If we start at T0, week 1 plays after 48h, week 2 after 96h...
export const getNextMatchTime = (campaignStartTime: number, currentWeek: number): number => {
  return campaignStartTime + (currentWeek * MS_PER_WEEK);
};

// To calculate: What week should we be in now based on real time?
export const getTargetWeek = (campaignStartTime: number): number => {
  const now = Date.now();
  const diff = now - campaignStartTime;
  // If not enough time has passed for the first week, we are in week 0 (waiting for week 1)
  // Formula: (difference / duration of a week) + 1
  return Math.floor(diff / MS_PER_WEEK) + 1;
};

// Format remaining time for countdown
export const formatTimeRemaining = (targetTime: number): string => {
  const now = Date.now();
  const diff = targetTime - now;

  if (diff <= 0) return "00:00:00";

  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const pad = (n: number) => n.toString().padStart(2, '0');
  
  // If more than 24 hours, show days too
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days > 0) {
      return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};