

export enum Position {
  GK = 'GK',
  RB = 'RB',
  LB = 'LB',
  CB = 'CB',
  CDM = 'CDM',
  CM = 'CM',
  CAM = 'CAM',
  RM = 'RM',
  LM = 'LM',
  RW = 'RW',
  LW = 'LW',
  CF = 'CF',
  ST = 'ST'
}

export interface PlayerAttributes {
  // Physical
  acceleration: number;
  sprintSpeed: number;
  agility: number;
  balance: number;
  strength: number;
  stamina: number;
  jumping: number;
  
  // Technical
  ballControl: number;
  dribbling: number;
  shortPassing: number;
  longPassing: number;
  finishing: number;
  longShots: number;
  shotPower: number;
  headingAccuracy: number;
  standingTackle: number;
  slidingTackle: number;
  freeKickAccuracy: number;
  penalties: number;
  
  // Mental / Defensive
  interceptions: number;
  defensiveAwareness: number;
  reactions: number;
  vision: number;
  
  // GK Specific (Optional or 0 for outfield)
  gkReflexes: number;
  gkPositioning: number; // Saving Positioning
  gkHandling: number;
  gkKicking: number;
}

export interface PlayerTraits {
  leadership: boolean;
  flair: boolean;
  visionPlus: boolean;
  clinical: boolean; // High finishing
  clutch: boolean; // Scores late goals
  decisionMaking: boolean;
  positioning: boolean; // Off-ball movement
}

export interface ScoutReport {
    date: number; // timestamp
    scoutName: string;
    text: string;
    ratingGiven: number; // 1-10 estimation
    potentialRange: string; // The predicted potential e.g. "85-92"
    recommendation: 'SIGN' | 'WATCH' | 'PASS';
}

// --- NEW: AWARDS ---
export interface PlayerAward {
    id: string;
    season: number;
    type: 'GOLD' | 'SILVER' | 'BRONZE';
    category: 'SCORER' | 'ASSIST' | 'RATING' | 'YOUTH';
    title: string; // e.g. "هداف الدوري"
}

export interface Player {
  id: string;
  name: string;
  age: number;
  height: number; // cm
  weight: number; // kg
  position: Position; // Primary Position
  secondaryPositions: Position[]; // Compatible positions
  nationality: string;
  rating: number; // Overall 0-99
  potential: number; // Max potential rating
  isWonderkid?: boolean; // New flag for rare talents
  isTransferListed?: boolean; // Is the player available on the market?
  injuryWeeks: number; // 0 = fit, >0 = injured
  
  // Scouting & Fog of War
  isScouted: boolean; // If false, potential is hidden/vague
  estimatedPotential: string; // e.g., "70-90" or "??"
  scoutedBy?: string; // ID of the scout currently working on this player
  reports: ScoutReport[]; // History of reports
  
  // Detailed Attributes Container
  attributes: PlayerAttributes;
  traits: PlayerTraits;
  
  // Market
  value: number; // In millions
  wage: number; // Weekly wage in k

  // Morale System
  morale: number; // 0-100

  // Current Season Stats
  matchesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  averageRating: number; // 0.0 to 10.0
  growthProgress?: number; // Tracks partial growth points
  isSuspended?: boolean; 

  // Historical Career Stats (Simulated)
  careerMatches: number;
  careerGoals: number;
  careerAssists: number;
  
  // Awards History
  awards: PlayerAward[];
}

export interface StadiumDetails {
    seatsLevel: number; 
    parkingLevel: number; 
    lightingLevel: number; 
    pitchLevel: number; 
    toiletsLevel: number; 
}

export interface StoreDetails {
    shirtSalesLevel: number; 
    souvenirsLevel: number;
}

export interface HospitalityDetails {
    restaurantLevel: number;
    foodTrucksLevel: number;
    coffeeShopLevel: number;
}

export interface Facilities {
  stadium: StadiumDetails;
  store: StoreDetails;
  hospitality: HospitalityDetails;
  academyLevel: number; 
  scoutingNetworkLevel: number; 
}

export interface Scout {
    id: string;
    name: string;
    age: number;
    stars: number; // 1 to 5
    cost: number; // Hiring cost
    salary: number; // Weekly salary
    speciality: 'GENERAL' | 'ATTACK' | 'DEFENSE' | 'YOUTH';
    isBusy: boolean;
    busyUntilWeek?: number; 
}

export type SponsorObjective = 'WIN_LEAGUE' | 'TOP_4' | 'TOP_8' | 'AVOID_RELEGATION';

export interface SponsorRequirements {
    minSeatsLevel: number;
    minParkingLevel: number;
    minToiletsLevel: number;
    minStoreLevel: number; 
    minHospitalityLevel: number; 
}

export interface Sponsor {
  id: string;
  name: string;
  type: string; 
  weeklyIncome: number; 
  signingBonus: number; 
  description: string;
  objective: SponsorObjective; 
  endSeasonBonus: number; 
  requirements: SponsorRequirements;
  status?: 'AVAILABLE' | 'CLOSE' | 'LOCKED';
}

export interface NewsItem {
  id: string;
  week: number;
  message: string;
  type: 'transfer' | 'injury' | 'match' | 'general' | 'rumor';
}

export type Formation = '4-4-2' | '4-3-3' | '3-5-2' | '5-3-2' | '4-2-3-1' | '3-4-3' | '4-1-4-1' | '4-5-1' | '5-4-1' | '4-2-2-2';
export type TacticStyle = 'Balanced' | 'Attacking' | 'Defensive' | 'Possession' | 'Counter Attack' | 'High Press';

// INSTRUCTIONS
export type AttackFocus = 'MIXED' | 'CENTER' | 'WINGS';
export type PassingStyle = 'MIXED' | 'SHORT' | 'LONG';

// SET PIECES
export interface SetPieceTakers {
    penalty: string[]; // Array of player IDs in priority order (1, 2, 3)
    freeKick: string[];
    leftCorner: string[];
    rightCorner: string[];
}

export type DrillType = 
  | 'FITNESS_POWER' | 'FITNESS_MOVEMENT' | 'TECHNICAL_CONTROL' | 'TECHNICAL_PASSING' | 'DEFENDING' | 'ATTACKING' | 'SET_PIECES' | 'GK'
  | 'COMBO_OFFENSIVE_UNIT' | 'COMBO_DEFENSIVE_UNIT' | 'COMBO_WING_PLAY' | 'COMBO_MIDFIELD_CONTROL' | 'COMBO_HIGH_PRESS' | 'COMBO_COUNTER_ATTACK' | 'COMBO_AERIAL' | 'COMBO_TOTAL_FOOTBALL';

export interface Team {
  id: string;
  name: string;
  managerName?: string; 
  color: string;
  logoCode: string; 
  customLogoUrl?: string; 
  players: Player[];
  youthPlayers: Player[]; 
  
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  form: string[]; 

  budget: number; 
  consecutiveNegativeSeasons: number; // NEW: Track for game over logic
  weeklyIncome: number; 
  weeklyExpenses: number; 
  facilities: Facilities;
  lastAcademySpawnWeek: number; 
  
  trainingAssignments: Record<string, DrillType>; 
  unlockedDrills: DrillType[]; 
  
  scouts: Scout[];
  sponsor: Sponsor | null;

  formation: Formation;
  tacticStyle: TacticStyle;
  attackFocus: AttackFocus; 
  passingStyle: PassingStyle; 
  
  setPieceTakers: SetPieceTakers; // NEW

  lineup: string[]; 
  valueHistory: number[]; 
}

// WEATHER
export type WeatherType = 'SUNNY' | 'RAIN' | 'HEAT' | 'SNOW';

export interface Match {
  id: string;
  week: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  played: boolean;
  scheduledTime?: number;
  weather?: WeatherType; // NEW
}

export type ViewState = 'dashboard' | 'squad' | 'league' | 'fixtures' | 'academy' | 'transfers' | 'facilities' | 'finances' | 'training' | 'tactics' | 'match' | 'options' | 'team_detail';

// HISTORY
export interface SeasonHistory {
    seasonNumber: number;
    championName: string;
    runnerUpName: string;
    topScorer: { name: string, goals: number, teamName: string };
    topAssister: { name: string, assists: number, teamName: string };
    bestPlayer: { name: string, rating: number, teamName: string };
}

// AUTH USER
export interface User {
    email: string;
    passwordHash: string; // Simple mock hash
    deletionScheduledAt?: number; // Timestamp if scheduled for deletion
}

export type LeagueType = 'SAUDI' | 'SPANISH' | 'ENGLISH' | 'GENERIC';

// --- SCENARIO SYSTEM TYPES ---
export interface ScenarioOption {
    id: string;
    label: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    description?: string;
}

export interface Scenario {
    id: string;
    title: string;
    description: string;
    category: 'MEDIA' | 'DISCIPLINE' | 'FINANCE' | 'MEDICAL' | 'FANS' | 'TACTICAL';
    options: ScenarioOption[];
}

export interface ScenarioResult {
    success: boolean;
    message: string;
    changes: Partial<Team>; // What changes in the team (budget, morale etc)
    newsItem?: NewsItem;
}

export interface GameSaveState {
  campaignStartTime: number; 
  teams: Team[];
  matches: Match[];
  currentWeek: number;
  userTeamId: string;
  availableSponsors: Sponsor[];
  availableScouts: Scout[];
  news: NewsItem[];
  theme: 'light' | 'dark';
  season: number; 
  history: SeasonHistory[]; 
  user?: User; // Auth info
  isGodMode?: boolean;
}

export type MatchEventType = 'KICKOFF' | 'GOAL' | 'MISS' | 'SAVE' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION' | 'HALF_TIME' | 'FULL_TIME' | 'NORMAL' | 'INJURY';

export interface MatchEvent {
    minute: number;
    type: MatchEventType;
    text: string;
    teamId?: string; 
    playerId?: string; 
}

export interface LiveMatchStats {
    homePossession: number; 
    awayPossession: number;
    homeShots: number;
    awayShots: number;
    homeOnTarget: number;
    awayOnTarget: number;
    homeCorners: number;
    awayCorners: number;
}

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}
