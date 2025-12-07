// ... existing imports
import { Player, Position, Team, Sponsor, NewsItem, PlayerAttributes, PlayerTraits, Formation, SponsorObjective, Scout, DrillType, ScoutReport, TacticStyle, SetPieceTakers, PlayerAward } from '../types.ts';

const FIRST_NAMES_EN = [
  'John', 'Michael', 'David', 'Chris', 'James', 'Robert', 'Daniel', 'Paul', 'Mark', 'Kevin',
  'Steven', 'George', 'Brian', 'Edward', 'Ronald', 'Anthony', 'Jason', 'Matthew', 'Gary', 'Timothy',
  'Peter', 'Ryan', 'Eric', 'Scott', 'Andrew'
];
const LAST_NAMES_EN = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
];

const NATIONS = [
  { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', type: 'EN' }, 
  { name: 'Spain', flag: '🇪🇸', type: 'EN' },
  { name: 'Germany', flag: '🇩🇪', type: 'EN' },
  { name: 'France', flag: '🇫🇷', type: 'EN' },
  { name: 'Italy', flag: '🇮🇹', type: 'EN' },
  { name: 'Brazil', flag: '🇧🇷', type: 'EN' },
  { name: 'Argentina', flag: '🇦🇷', type: 'EN' },
  { name: 'Portugal', flag: '🇵🇹', type: 'EN' },
  { name: 'Netherlands', flag: '🇳🇱', type: 'EN' },
  { name: 'Belgium', flag: '🇧🇪', type: 'EN' },
  { name: 'Saudi Arabia', flag: '🇸🇦', type: 'AR' },
  { name: 'Egypt', flag: '🇪🇬', type: 'AR' },
  { name: 'Morocco', flag: '🇲🇦', type: 'AR' }
];

const TEAM_NAMES = [
  'Capital Falcons', 'United Glory', 'Kingdom Knights', 'Unity FC', 
  'Riyadh Elite', 'Desert Storm', 'Jeddah Heat', 'Eastern Waves',
  'Abha Summit', 'Dammam Gold', 'Challenge FC', 'Southern Victory',
  'Coastal Crescent', 'Future Youth', 'Mountain Hawks', 'Northern Eagles'
];

const COLORS = [
  'bg-blue-600', 'bg-yellow-500', 'bg-yellow-400', 'bg-green-600', 
  'bg-slate-900', 'bg-yellow-600', 'bg-red-600', 'bg-emerald-500',
  'bg-orange-500', 'bg-red-500', 'bg-red-700', 'bg-blue-400',
  'bg-slate-500', 'bg-yellow-300', 'bg-red-800', 'bg-red-400'
];

// Helper Random
const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateName = () => {
  return `${pick(FIRST_NAMES_EN)} ${pick(LAST_NAMES_EN)}`;
};

const getRealisticSecondaryPositions = (pos: Position): Position[] => {
    switch (pos) {
        case Position.GK: return []; 
        case Position.LB: return [Position.RB, Position.LM];
        case Position.RB: return [Position.LB, Position.RM];
        case Position.CB: return [Position.CDM, Position.RB, Position.LB]; 
        case Position.CDM: return [Position.CM, Position.CB];
        case Position.CM: return [Position.CDM, Position.CAM, Position.LM, Position.RM]; 
        case Position.CAM: return [Position.CM, Position.CF, Position.LW, Position.RW]; 
        case Position.LM: return [Position.LW, Position.RM, Position.CM, Position.LB]; 
        case Position.RM: return [Position.RW, Position.LM, Position.CM, Position.RB];
        case Position.LW: return [Position.RW, Position.LM, Position.CAM, Position.CF]; 
        case Position.RW: return [Position.LW, Position.RM, Position.CAM, Position.CF];
        case Position.CF: return [Position.ST, Position.CAM, Position.LW, Position.RW]; 
        case Position.ST: return [Position.CF, Position.LW, Position.RW]; 
        default: return [];
    }
};

const calculateRealisticWage = (rating: number, age: number, potential: number, position: Position) => {
    let wage = Math.pow(1.8, (rating - 50) / 2.5);
    if ([Position.ST, Position.CF].includes(position)) wage *= 1.4;
    if ([Position.GK, Position.CB].includes(position)) wage *= 1.2;
    if (age < 24 && potential > rating + 10) wage *= 1.3; 
    if (age > 30) wage *= 0.85; 
    if (rating >= 85) wage = Math.max(wage, 100); 
    wage = Math.max(0.5, wage);
    return parseFloat(wage.toFixed(1));
};

export const generatePlayer = (position: Position, age: number, baseRating: number, academyLevel: number = 1, isYouthSpawn: boolean = false, forcedNation?: {name: string, flag: string, type: string}): Player => {
  const nation = forcedNation || pick(NATIONS); 
  
  const isGK = position === Position.GK;
  
  let spawnAge = age;
  if (isYouthSpawn) spawnAge = random(14, 17);

  let isWonderkid = false;
  if(academyLevel >= 8 && spawnAge <= 17) {
      isWonderkid = Math.random() < 0.10; 
  } else if (academyLevel >= 5 && spawnAge <= 17) {
      isWonderkid = Math.random() < 0.02; 
  }

  let potential = baseRating + random(5, 15);
  if (spawnAge < 21) potential += random(10, 20);
  if (isWonderkid) potential = Math.max(potential, random(90, 99));
  potential = Math.min(99, potential);

  const attr = (base: number) => Math.min(99, Math.max(1, base + random(-5, 5)));
  
  const attributes: PlayerAttributes = {
    acceleration: attr(isGK ? 40 : baseRating),
    sprintSpeed: attr(isGK ? 40 : baseRating),
    agility: attr(isGK ? 50 : baseRating),
    balance: attr(isGK ? 50 : baseRating),
    strength: attr(baseRating),
    stamina: attr(isGK ? 40 : baseRating),
    jumping: attr(isGK ? 60 : baseRating),
    ballControl: attr(isGK ? 20 : baseRating),
    dribbling: attr(isGK ? 20 : baseRating),
    shortPassing: attr(isGK ? 30 : baseRating),
    longPassing: attr(isGK ? 40 : baseRating),
    finishing: attr(isGK ? 10 : baseRating),
    longShots: attr(isGK ? 10 : baseRating),
    shotPower: attr(baseRating),
    headingAccuracy: attr(isGK ? 10 : baseRating),
    standingTackle: attr(isGK ? 10 : baseRating),
    slidingTackle: attr(isGK ? 10 : baseRating),
    freeKickAccuracy: attr(isGK ? 10 : baseRating),
    penalties: attr(isGK ? 10 : baseRating),
    interceptions: attr(isGK ? 10 : baseRating),
    defensiveAwareness: attr(isGK ? 10 : baseRating),
    reactions: attr(baseRating),
    vision: attr(isGK ? 30 : baseRating),
    gkReflexes: attr(isGK ? baseRating : 10),
    gkPositioning: attr(isGK ? baseRating : 10),
    gkHandling: attr(isGK ? baseRating : 10),
    gkKicking: attr(isGK ? baseRating : 10)
  };

  const traits: PlayerTraits = {
    leadership: Math.random() < 0.1,
    flair: Math.random() < 0.2,
    visionPlus: Math.random() < 0.1,
    clinical: Math.random() < 0.15,
    clutch: Math.random() < 0.05,
    decisionMaking: Math.random() < 0.2,
    positioning: Math.random() < 0.15
  };

  const rating = Math.round(Object.values(attributes).reduce((a, b) => a + b) / Object.keys(attributes).length);
  const wage = calculateRealisticWage(rating, spawnAge, potential, position);
  
  return {
    id: `${Date.now()}-${Math.random()}`,
    name: generateName(),
    age: spawnAge,
    height: random(165, 200),
    weight: random(60, 95),
    position,
    secondaryPositions: getRealisticSecondaryPositions(position),
    nationality: `${nation.flag} ${nation.name}`,
    rating,
    potential,
    isWonderkid,
    injuryWeeks: 0,
    isScouted: isYouthSpawn ? false : true,
    estimatedPotential: isYouthSpawn ? `${potential - 10}-${potential + 5}` : potential.toString(),
    reports: [],
    attributes,
    traits,
    value: parseFloat((Math.pow(1.9, (rating - 40) / 3.5)).toFixed(1)),
    wage: wage,
    morale: random(60, 90),
    matchesPlayed: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    averageRating: 0,
    careerMatches: spawnAge > 18 ? (spawnAge - 18) * 30 : 0,
    careerGoals: 0,
    careerAssists: 0,
    awards: []
  };
};

// ... (rest of the file remains the same)
export const generateTeam = (name: string, color: string, isUser: boolean = false): Team => {
  const players: Player[] = [
    generatePlayer(Position.GK, random(18, 32), random(60, 75)),
    generatePlayer(Position.LB, random(18, 32), random(60, 75)),
    generatePlayer(Position.RB, random(18, 32), random(60, 75)),
    generatePlayer(Position.CB, random(18, 32), random(60, 75)),
    generatePlayer(Position.CB, random(18, 32), random(60, 75)),
    generatePlayer(Position.CDM, random(18, 32), random(60, 75)),
    generatePlayer(Position.CM, random(18, 32), random(60, 75)),
    generatePlayer(Position.CAM, random(18, 32), random(60, 75)),
    generatePlayer(Position.LW, random(18, 32), random(60, 75)),
    generatePlayer(Position.RW, random(18, 32), random(60, 75)),
    generatePlayer(Position.ST, random(18, 32), random(60, 75)),
    // Subs
    generatePlayer(Position.GK, random(18, 32), random(50, 65)),
    generatePlayer(Position.CB, random(18, 32), random(50, 65)),
    generatePlayer(Position.CM, random(18, 32), random(50, 65)),
    generatePlayer(Position.ST, random(18, 32), random(50, 65)),
  ];

  const sortedPlayers = players.sort((a,b) => b.rating - a.rating);

  return {
    id: `team-${Date.now()}-${name}`,
    name: name,
    managerName: isUser ? "You" : "CPU",
    color: color,
    logoCode: name.slice(0, 2).toUpperCase(),
    players: sortedPlayers,
    youthPlayers: [],
    
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
    form: [],

    budget: 50,
    consecutiveNegativeSeasons: 0,
    weeklyIncome: 1.5,
    weeklyExpenses: 1.2,
    facilities: {
        stadium: { seatsLevel: 1, parkingLevel: 1, lightingLevel: 1, pitchLevel: 1, toiletsLevel: 1 },
        store: { shirtSalesLevel: 1, souvenirsLevel: 1 },
        hospitality: { restaurantLevel: 1, foodTrucksLevel: 1, coffeeShopLevel: 1 },
        academyLevel: 1,
        scoutingNetworkLevel: 1,
    },
    lastAcademySpawnWeek: -1,
    
    trainingAssignments: {},
    unlockedDrills: ['GK', 'DEFENDING', 'ATTACKING'], 

    scouts: [],
    sponsor: null,

    formation: '4-3-3',
    tacticStyle: 'Balanced',
    attackFocus: 'MIXED',
    passingStyle: 'MIXED',

    setPieceTakers: { penalty: [], freeKick: [], leftCorner: [], rightCorner: [] },

    lineup: sortedPlayers.slice(0, 11).map(p => p.id),
    valueHistory: [sortedPlayers.reduce((a, b) => a + b.value, 0)]
  };
};

export const initializeLeague = (count: number = 16): Team[] => {
  const teams: Team[] = [];
  for (let i = 0; i < count; i++) {
    teams.push(generateTeam(TEAM_NAMES[i], COLORS[i], i === 0));
  }
  return teams;
};

export const generateSponsors = (): Sponsor[] => {
  return [
      { id: 'sp-1', name: 'Global Oil Co', type: 'Main Sponsor', weeklyIncome: 1.8, signingBonus: 10, description: 'A massive energy corporation with global reach, demanding consistent top-tier performance.', objective: 'WIN_LEAGUE', endSeasonBonus: 25, requirements: {minSeatsLevel: 8, minParkingLevel: 7, minToiletsLevel: 6, minStoreLevel: 8, minHospitalityLevel: 7} },
      { id: 'sp-2', name: 'Royal Bank', type: 'Financial Partner', weeklyIncome: 1.2, signingBonus: 5, description: 'A prestigious financial institution that values stability and a place among the elite.', objective: 'TOP_4', endSeasonBonus: 15, requirements: {minSeatsLevel: 5, minParkingLevel: 4, minToiletsLevel: 4, minStoreLevel: 5, minHospitalityLevel: 5} },
      { id: 'sp-3', name: 'Sky Airlines', type: 'Official Carrier', weeklyIncome: 0.8, signingBonus: 2, description: 'A fast-growing airline looking to associate with a respectable and competitive team.', objective: 'TOP_8', endSeasonBonus: 8, requirements: {minSeatsLevel: 3, minParkingLevel: 2, minToiletsLevel: 2, minStoreLevel: 3, minHospitalityLevel: 2} },
      { id: 'sp-4', name: 'Build It Construction', type: 'Local Partner', weeklyIncome: 0.5, signingBonus: 1, description: 'A local construction firm that prides itself on stability and community, supporting teams that avoid relegation.', objective: 'AVOID_RELEGATION', endSeasonBonus: 3, requirements: {minSeatsLevel: 1, minParkingLevel: 1, minToiletsLevel: 1, minStoreLevel: 1, minHospitalityLevel: 1} },
  ];
};

export const generateRandomNews = (week: number, teams: Team[]): NewsItem => {
  const team1 = pick(teams);
  const team2 = pick(teams.filter(t => t.id !== team1.id));
  const player = pick(team1.players);
  
  const templates = [
      `Rumors are swirling about a potential transfer of ${player.name} to ${team2.name}.`,
      `${team1.managerName} expressed confidence in his team ahead of their clash with ${team2.name}.`,
      `${player.name} picked up a minor knock in training and is a doubt for the next game.`,
      `Pundits are praising ${team1.name}'s recent form, calling them title contenders.`,
      `Sources say ${team2.name} are looking to strengthen their defense in the transfer window.`
  ];
  
  return {
    id: Date.now().toString(),
    week,
    message: pick(templates),
    type: 'rumor'
  };
};

export const generateAcademySpawns = (academyLevel: number) => {
    let numToSpawn = 1;
    if (academyLevel >= 5) numToSpawn = 2;
    if (academyLevel >= 8) numToSpawn = 3;
    if (academyLevel >= 10) numToSpawn = 5;

    const positions: Position[] = [Position.GK, Position.CB, Position.RB, Position.LB, Position.CDM, Position.CM, Position.CAM, Position.RW, Position.LW, Position.ST];
    const players: Player[] = [];

    for(let i=0; i<numToSpawn; i++) {
        let baseRating = 40 + (academyLevel * 2) + random(-5, 5);
        players.push(generatePlayer(pick(positions), random(14, 17), baseRating, academyLevel, true));
    }

    return players;
};

export const generateScouts = (count: number, avgStars: number): Scout[] => {
    const scouts: Scout[] = [];
    for(let i=0; i<count; i++) {
        const stars = Math.min(5, Math.max(1, avgStars + random(-1, 1)));
        scouts.push({
            id: `scout-${Date.now()}-${i}`,
            name: `${pick(FIRST_NAMES_EN)} ${pick(LAST_NAMES_EN)}`,
            age: random(40, 65),
            stars,
            cost: (stars * 1.5) + random(-0.5, 0.5),
            salary: (stars * 5) + random(-2, 2),
            speciality: pick(['GENERAL', 'ATTACK', 'DEFENSE', 'YOUTH']),
            isBusy: false
        });
    }
    return scouts;
};

export const generateRichScoutReport = (player: Player, scout: Scout): ScoutReport => {
    // Scout specialty bonus
    let accuracyBonus = 0;
    const isAttacker = [Position.ST, Position.CF, Position.LW, Position.RW].includes(player.position);
    const isDefender = [Position.CB, Position.LB, Position.RB].includes(player.position);

    if (scout.speciality === 'ATTACK' && isAttacker) accuracyBonus = 5;
    if (scout.speciality === 'DEFENSE' && isDefender) accuracyBonus = 5;
    if (scout.speciality === 'YOUTH' && player.age <= 18) accuracyBonus = 5;

    // Determine accuracy based on stars + bonus
    const baseInaccuracy = 12 - (scout.stars * 2); // 5 stars = 2, 1 star = 10
    const finalInaccuracy = Math.max(1, baseInaccuracy - accuracyBonus);

    const potentialMin = Math.max(player.rating, player.potential - random(0, finalInaccuracy));
    const potentialMax = Math.min(99, player.potential + random(0, finalInaccuracy));
    
    let recommendation: 'SIGN' | 'WATCH' | 'PASS' = 'WATCH';
    if (potentialMax >= 85) recommendation = 'SIGN';
    if (potentialMax < 70) recommendation = 'PASS';
    
    // Generate text
    const intros = ["After observing the player, I believe", "My analysis indicates that", "The player shows promise, and my report suggests"];
    const strengths = ["excellent physical attributes", "great technical skill on the ball", "a high football IQ and vision", "solid defensive fundamentals"];
    const weaknesses = ["needs to improve their decision-making under pressure", "lacks the top-end speed required at the highest level", "could work on their weaker foot", "sometimes loses focus defensively"];
    const potentialAdjectives = ["world-class", "a solid first-team", "a decent squad player", "a future star"];
    const conclusions = ["I recommend signing him immediately.", "We should keep a close eye on his development.", "I don't believe he has what it takes for our club."];
    
    let text = `${pick(intros)} he has ${pick(strengths)}. However, he ${pick(weaknesses)}. His potential is to become ${pick(potentialAdjectives)}. ${conclusions[recommendation === 'SIGN' ? 0 : recommendation === 'WATCH' ? 1 : 2]}`;

    return {
        date: Date.now(),
        scoutName: scout.name,
        text: text,
        ratingGiven: Math.min(10, Math.max(1, (scout.stars * 2) + random(-1,1))), // 1-10 rating
        potentialRange: `${potentialMin}-${potentialMax}`,
        recommendation: recommendation
    };
};
