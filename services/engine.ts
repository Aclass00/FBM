

import { Team, Match, Player, Position, Formation, TacticStyle, DrillType, AttackFocus, PassingStyle, SeasonHistory, PlayerAward, WeatherType, Facilities, SetPieceTakers } from '../types.ts';

// Helpers
const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const getWeather = (week: number): WeatherType => {
    const r = Math.random();
    if (r < 0.6) return 'SUNNY';
    if (r < 0.8) return 'HEAT';
    if (r < 0.9) return 'RAIN';
    return 'SNOW';
};

export const FORMATION_ROLES: Record<Formation, string[]> = {
    '4-4-2': ['GK', 'LB', 'CB', 'CB', 'RB', 'LM', 'CM', 'CM', 'RM', 'ST', 'ST'],
    '4-3-3': ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'CM', 'CM', 'LW', 'ST', 'RW'],
    '4-2-3-1': ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'CDM', 'CAM', 'LM', 'RM', 'ST'],
    '3-5-2': ['GK', 'CB', 'CB', 'CB', 'CDM', 'CDM', 'LM', 'RM', 'CAM', 'ST', 'ST'],
    '5-3-2': ['GK', 'LB', 'CB', 'CB', 'CB', 'RB', 'CM', 'CM', 'CM', 'ST', 'ST'],
    '3-4-3': ['GK', 'CB', 'CB', 'CB', 'LM', 'CM', 'CM', 'RM', 'LW', 'ST', 'RW'],
    '4-1-4-1': ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'LM', 'CM', 'CM', 'RM', 'ST'],
    '4-5-1': ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'LM', 'CM', 'RM', 'CM', 'ST'],
    '5-4-1': ['GK', 'LB', 'CB', 'CB', 'CB', 'RB', 'LM', 'CM', 'CM', 'RM', 'ST'],
    '4-2-2-2': ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'CDM', 'CAM', 'CAM', 'ST', 'ST'],
};

export const generateFixtures = (teams: Team[]): Match[] => {
    const teamIds = teams.map(t => t.id);
    const n = teamIds.length;
    const matches: Match[] = [];
    
    // Round Robin Logic
    const dummyTeams = [...teamIds];
    if (n % 2 !== 0) dummyTeams.push('bye');
    const numTeams = dummyTeams.length;
    const numRounds = numTeams - 1;

    for (let round = 0; round < numRounds; round++) {
        for (let i = 0; i < numTeams / 2; i++) {
            const t1 = dummyTeams[i];
            const t2 = dummyTeams[numTeams - 1 - i];
            if (t1 !== 'bye' && t2 !== 'bye') {
                const home = round % 2 === 0 ? t1 : t2;
                const away = round % 2 === 0 ? t2 : t1;
                matches.push({
                    id: `match-${round + 1}-${home}-${away}`,
                    week: round + 1,
                    homeTeamId: home,
                    awayTeamId: away,
                    homeScore: null,
                    awayScore: null,
                    played: false,
                    weather: getWeather(round + 1)
                });
            }
        }
        // Rotate
        dummyTeams.splice(1, 0, dummyTeams.pop()!);
    }
    
    // Second Half Season
    const secondHalf = matches.map(m => ({
        ...m,
        id: m.id + '-rev',
        week: m.week + numRounds,
        homeTeamId: m.awayTeamId,
        awayTeamId: m.homeTeamId,
        weather: getWeather(m.week + numRounds)
    }));

    return [...matches, ...secondHalf].sort((a,b) => a.week - b.week);
};

export const autoFixLineup = (team: Team): Team => {
    const currentLineup = team.lineup.filter(id => team.players.find(p => p.id === id));
    const needed = 11 - currentLineup.length;
    
    if (needed > 0) {
        const available = team.players
            .filter(p => !currentLineup.includes(p.id))
            .sort((a,b) => b.rating - a.rating)
            .slice(0, needed);
        return {
            ...team,
            lineup: [...currentLineup, ...available.map(p => p.id)]
        };
    }
    return team;
};

const getTeamAttack = (team: Team) => {
    const lineup = team.lineup.map(id => team.players.find(p => p.id === id)).filter(p => !!p) as Player[];
    if (lineup.length === 0) return 50;
    let score = lineup.reduce((acc, p) => acc + p.rating, 0) / lineup.length;
    if (team.tacticStyle === 'Attacking') score += 5;
    return score;
};

const getTeamDefense = (team: Team) => {
    const lineup = team.lineup.map(id => team.players.find(p => p.id === id)).filter(p => !!p) as Player[];
    if (lineup.length === 0) return 50;
    let score = lineup.reduce((acc, p) => acc + p.rating, 0) / lineup.length;
    if (team.tacticStyle === 'Defensive') score += 5;
    return score;
};

export const simulateMatch = (match: Match, homeTeam: Team, awayTeam: Team) => {
    const homeAtt = getTeamAttack(homeTeam);
    const homeDef = getTeamDefense(homeTeam);
    const awayAtt = getTeamAttack(awayTeam);
    const awayDef = getTeamDefense(awayTeam);

    const homeScore = Math.floor(Math.max(0, (homeAtt - awayDef + random(0, 20)) / 15));
    const awayScore = Math.floor(Math.max(0, (awayAtt - homeDef + random(0, 20)) / 15));

    const homeUpdates: Partial<Team> = {
        goalsFor: homeTeam.goalsFor + homeScore,
        goalsAgainst: homeTeam.goalsAgainst + awayScore,
        wins: homeTeam.wins + (homeScore > awayScore ? 1 : 0),
        draws: homeTeam.draws + (homeScore === awayScore ? 1 : 0),
        losses: homeTeam.losses + (homeScore < awayScore ? 1 : 0),
        points: homeTeam.points + (homeScore > awayScore ? 3 : (homeScore === awayScore ? 1 : 0)),
        form: [...homeTeam.form, homeScore > awayScore ? 'W' : (homeScore === awayScore ? 'D' : 'L')].slice(-5)
    };

    const awayUpdates: Partial<Team> = {
        goalsFor: awayTeam.goalsFor + awayScore,
        goalsAgainst: awayTeam.goalsAgainst + homeScore,
        wins: awayTeam.wins + (awayScore > homeScore ? 1 : 0),
        draws: awayTeam.draws + (awayScore === homeScore ? 1 : 0),
        losses: awayTeam.losses + (awayScore < homeScore ? 1 : 0),
        points: awayTeam.points + (awayScore > homeScore ? 3 : (awayScore === homeScore ? 1 : 0)),
        form: [...awayTeam.form, awayScore > homeScore ? 'W' : (awayScore === homeScore ? 'D' : 'L')].slice(-5)
    };

    return {
        match: { ...match, homeScore, awayScore, played: true },
        homeUpdates,
        awayUpdates
    };
};

export const calculateWeeklyFinances = (team: Team, matchContext?: { isHome: boolean, result: 'W' | 'D' | 'L' }) => {
    const sponsorIncome = team.sponsor ? team.sponsor.weeklyIncome : 0;
    
    let stadiumIncome = 0;
    let hospitalityIncome = 0;
    let storeIncome = 0;
    
    const baseTicketPrice = 15;
    const facilitiesBoost = (team.facilities.stadium.seatsLevel + team.facilities.stadium.toiletsLevel + team.facilities.stadium.parkingLevel) * 2;
    const ticketPrice = baseTicketPrice + facilitiesBoost;

    const baseAttendance = 5000;
    const fanBase = team.wins * 500 + (team.players.reduce((a, b) => a + b.rating, 0) / 2);
    const stadiumCap = team.facilities.stadium.seatsLevel * 10000;
    const attendance = Math.min(stadiumCap, Math.floor(baseAttendance + fanBase + random(-1000, 1000)));

    if (matchContext && matchContext.isHome) {
        stadiumIncome = (attendance * ticketPrice) / 1000000;
        hospitalityIncome = (team.facilities.hospitality.restaurantLevel * 0.1) + (team.facilities.hospitality.foodTrucksLevel * 0.05);
    }

    storeIncome = (team.facilities.store.shirtSalesLevel * 0.05) + (team.facilities.store.souvenirsLevel * 0.02);

    let matchBonus = 0;
    if (matchContext) {
        if (matchContext.result === 'W') matchBonus = 0.35;
        if (matchContext.result === 'D') matchBonus = 0.10;
    }

    const totalIncome = sponsorIncome + stadiumIncome + hospitalityIncome + storeIncome + matchBonus;

    const wages = team.players.reduce((sum, p) => sum + p.wage, 0) / 1000;
    const maintenance = (
        team.facilities.stadium.pitchLevel * 0.05 + 
        team.facilities.stadium.lightingLevel * 0.02 + 
        team.facilities.academyLevel * 0.1 + 
        team.facilities.scoutingNetworkLevel * 0.05
    );
    const staff = 0.2;

    const totalExpenses = wages + maintenance + staff;

    return {
        income: { total: totalIncome, sponsor: sponsorIncome, stadium: stadiumIncome, hospitality: hospitalityIncome, store: storeIncome, matchBonus },
        expenses: { total: totalExpenses, wages, maintenance, staff },
        netProfit: totalIncome - totalExpenses,
        meta: { attendance, capacity: stadiumCap, ticketPrice }
    };
};

export const processWeeklyUpdates = (team: Team): Team => {
    const players = team.players.map(p => ({
        ...p,
        injuryWeeks: Math.max(0, p.injuryWeeks - 1),
        rating: p.age < 24 && p.potential > p.rating && Math.random() < 0.1 ? p.rating + 1 : p.rating
    }));
    
    return { ...team, players };
};

export const startNewSeason = (teams: Team[], seasonNumber: number = 1, userTeamId?: string): { updatedTeams: Team[], history: SeasonHistory, gameOver?: boolean, retiredPlayers?: Player[] } => {
    const sortedTeams = [...teams].sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst));
    const champion = sortedTeams[0];
    const runnerUp = sortedTeams[1];

    const allPlayers = teams.flatMap(t => t.players.map(p => ({...p, teamName: t.name})));
    
    const topScorers = [...allPlayers].sort((a,b) => b.goals - a.goals).slice(0, 3);
    const topAssisters = [...allPlayers].sort((a,b) => b.assists - a.assists).slice(0, 3);
    const bestPlayers = [...allPlayers].filter(p => p.matchesPlayed > 5).sort((a,b) => b.averageRating - a.averageRating).slice(0, 3);

    const historyEntry: SeasonHistory = {
        seasonNumber: seasonNumber,
        championName: champion.name,
        runnerUpName: runnerUp.name,
        topScorer: { name: topScorers[0]?.name || '-', goals: topScorers[0]?.goals || 0, teamName: topScorers[0]?.teamName || '' },
        topAssister: { name: topAssisters[0]?.name || '-', assists: topAssisters[0]?.assists || 0, teamName: topAssisters[0]?.teamName || '' },
        bestPlayer: { name: bestPlayers[0]?.name || '-', rating: bestPlayers[0]?.averageRating || 0, teamName: bestPlayers[0]?.teamName || '' }
    };

    const addAwards = (playerList: any[], category: 'SCORER'|'ASSIST'|'RATING'|'YOUTH', titleBase: string) => {
        playerList.forEach((p: any, index: number) => {
            if(!p) return;
            const type = index === 0 ? 'GOLD' : index === 1 ? 'SILVER' : 'BRONZE';
            const award: PlayerAward = {
                id: `award-${Date.now()}-${p.id}-${category}`,
                season: seasonNumber,
                type,
                category,
                title: `${titleBase} (${type})`
            };
            
            const team = teams.find(t => t.name === p.teamName);
            const teamPlayer = team?.players.find(pl => pl.id === p.id);
            if(teamPlayer) {
                if(!teamPlayer.awards) teamPlayer.awards = [];
                teamPlayer.awards.push(award);
            }
        });
    };

    addAwards(topScorers, 'SCORER', 'Top Scorer');
    addAwards(topAssisters, 'ASSIST', 'Top Playmaker');
    addAwards(bestPlayers, 'RATING', 'Player of the Season');

    const bonuses = new Map<string, number>();
    sortedTeams.forEach((t, index) => {
        const position = index + 1;
        if (t.sponsor) {
            let achieved = false;
            if (t.sponsor.objective === 'WIN_LEAGUE' && position === 1) achieved = true;
            else if (t.sponsor.objective === 'TOP_4' && position <= 4) achieved = true;
            else if (t.sponsor.objective === 'TOP_8' && position <= 8) achieved = true;
            else if (t.sponsor.objective === 'AVOID_RELEGATION' && position <= 13) achieved = true; 

            if (achieved) {
                bonuses.set(t.id, t.sponsor.endSeasonBonus);
            }
        }
    });

    const retiredPlayers: Player[] = [];
    let isGameOver = false;

    const updatedTeams = teams.map(t => {
        let consecutiveNegative = t.consecutiveNegativeSeasons || 0;
        if (userTeamId && t.id === userTeamId) {
            if (t.budget < 0) {
                consecutiveNegative++;
            } else {
                consecutiveNegative = 0;
            }
            if (consecutiveNegative >= 3) {
                isGameOver = true;
            }
        }

        const survivingPlayers = t.players.filter(p => {
            const age = p.age + 1;
            let retirementChance = 0;
            if (age <= 33) retirementChance = 0;
            else if (age <= 35) retirementChance = 0.05;
            else if (age === 36) retirementChance = 0.30;
            else if (age <= 38) retirementChance = 0.70;
            else if (age === 39) retirementChance = 0.90;
            else retirementChance = 1.00;

            if (Math.random() < retirementChance) {
                if(userTeamId && t.id === userTeamId) {
                    retiredPlayers.push({...p, teamName: t.name} as any);
                }
                return false;
            }
            return true;
        });

        const updatedPlayers = survivingPlayers.map(p => ({
            ...p,
            age: p.age + 1,
            matchesPlayed: 0,
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            averageRating: 0
        }));

        const updatedYouth = t.youthPlayers
            .map(p => ({ ...p, age: p.age + 1 }))
            .filter(p => p.age <= 18);

        const bonus = bonuses.get(t.id) || 0;

        return {
            ...t,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            points: 0,
            form: [],
            budget: t.budget + bonus, 
            consecutiveNegativeSeasons: consecutiveNegative,
            players: updatedPlayers,
            youthPlayers: updatedYouth
        };
    });

    return { updatedTeams, history: historyEntry, gameOver: isGameOver, retiredPlayers };
};