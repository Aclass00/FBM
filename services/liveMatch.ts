import { Team, Player, MatchEvent, MatchEventType, Match, LiveMatchStats, Position } from '../types.ts';
import { autoFixLineup } from './engine.ts';

// Helper to get lineup
const getTeamLineup = (team: Team): Player[] => {
    let lineupPlayers: Player[] = [];
    if (team.lineup && team.lineup.length === 11) {
        lineupPlayers = team.lineup.map(id => team.players.find(p => p.id === id)!).filter(p => !!p);
    }
    if (lineupPlayers.length !== 11) {
        lineupPlayers = [...team.players].sort((a, b) => b.rating - a.rating).slice(0, 11);
    }
    return lineupPlayers;
};

// Calculate basic team strength
const calculateTeamStrength = (team: Team) => {
    const lineup = getTeamLineup(team);
    const avgRating = lineup.reduce((sum, p) => sum + p.rating, 0) / 11;
    
    // Add tactical bonuses
    let attackBonus = 0;
    let defenseBonus = 0;
    
    if (team.tacticStyle === 'Attacking') attackBonus += 5;
    if (team.tacticStyle === 'High Press') attackBonus += 3;
    if (team.tacticStyle === 'Defensive') defenseBonus += 5;
    if (team.tacticStyle === 'Possession') attackBonus += 2;
    if (team.tacticStyle === 'Counter Attack') attackBonus += 4;

    // Instructions Bonuses
    if (team.attackFocus === 'WINGS') attackBonus += 2;
    if (team.passingStyle === 'SHORT') defenseBonus += 2; // Control
    if (team.passingStyle === 'LONG') attackBonus += 3; // Direct

    return {
        avgRating,
        attack: avgRating + attackBonus,
        defense: avgRating + defenseBonus,
        players: lineup
    };
};

export interface MatchSimulationResult {
    timeline: MatchEvent[];
    finalHomeScore: number;
    finalAwayScore: number;
    stats: LiveMatchStats;
    scorers: {player: Player, time: number}[];
}

// Support Partial Simulation (from minute X to 90)
export const generateMatchTimeline = (
    homeTeam: Team, 
    awayTeam: Team, 
    startMinute: number = 0, 
    initialHomeScore: number = 0, 
    initialAwayScore: number = 0
): MatchSimulationResult => {
    const timeline: MatchEvent[] = [];
    
    const home = calculateTeamStrength(homeTeam);
    const away = calculateTeamStrength(awayTeam);

    // Initial Stats
    let homeScore = initialHomeScore;
    let awayScore = initialAwayScore;
    let homeShots = 0;
    let awayShots = 0;
    let homeOnTarget = 0;
    let awayOnTarget = 0;
    let homeCorners = 0;
    let awayCorners = 0;

    const scorers: {player: Player, time: number}[] = [];

    // Possession based on Midfield/Rating
    const totalStrength = home.avgRating + away.avgRating;
    const homePossessionBase = (home.avgRating / totalStrength) * 100;
    // Add randomness
    let finalHomePossession = Math.min(80, Math.max(20, Math.round(homePossessionBase + (Math.random() * 10 - 5))));
    
    // Adjust possession based on tactics
    if (homeTeam.tacticStyle === 'Possession') finalHomePossession += 5;
    if (awayTeam.tacticStyle === 'Possession') finalHomePossession -= 5;
    if (homeTeam.passingStyle === 'SHORT') finalHomePossession += 3;
    
    // Clamp
    finalHomePossession = Math.min(80, Math.max(20, finalHomePossession));
    const finalAwayPossession = 100 - finalHomePossession;

    // Start Event if beginning
    if (startMinute === 0) {
        timeline.push({ minute: 0, type: 'KICKOFF', text: 'Kick-off! The referee blows the whistle.', teamId: homeTeam.id });
    } else {
        timeline.push({ minute: startMinute, type: 'NORMAL', text: 'Play resumes after the tactical changes.' });
    }

    // Helper to find set piece taker
    const getSetPieceTaker = (team: Team, type: 'penalty' | 'freeKick' | 'leftCorner' | 'rightCorner'): Player | undefined => {
        if (!team.setPieceTakers) return undefined;
        const takers = team.setPieceTakers[type];
        // Try to find first available taker who is in the current lineup
        for (const id of takers) {
            if (team.lineup.includes(id)) {
                return team.players.find(p => p.id === id);
            }
        }
        return undefined; // Fallback to random
    };

    // Loop through remaining minutes
    for (let minute = startMinute + 1; minute <= 90; minute++) {
        const rand = Math.random();
        
        // Event Probability (higher = less events)
        if (rand > 0.08) { // 8% chance of significant event per minute
             if (minute === 45) timeline.push({ minute, type: 'HALF_TIME', text: 'Half Time.' });
             continue;
        }

        const isHomeEvent = Math.random() < (finalHomePossession / 100);
        const attackingTeam = isHomeEvent ? homeTeam : awayTeam;
        const defendingTeam = isHomeEvent ? awayTeam : homeTeam;
        const attackerStats = isHomeEvent ? home : away;
        const defenderStats = isHomeEvent ? away : home;

        // Determine Event Type
        const eventRoll = Math.random();

        if (eventRoll < 0.25) {
            // General Commentary
            const texts = [
                `${attackingTeam.name} are building an attack.`,
                `Patient passing in the midfield from ${attackingTeam.name}.`,
                `${defendingTeam.name} are closing down the spaces well.`,
                `Throw-in for ${attackingTeam.name}.`,
                `The ball is with ${attackingTeam.name}'s defense.`
            ];
            timeline.push({ minute, type: 'NORMAL', text: texts[Math.floor(Math.random() * texts.length)], teamId: attackingTeam.id });
        } else if (eventRoll < 0.55) {
            // Dangerous Attack / Chance
            const player = attackerStats.players[Math.floor(Math.random() * 6) + 5]; // Midfielder or Attacker
            
            // Check for Goal
            const shotQuality = (player.attributes.finishing + player.attributes.shotPower) / 2;
            const defenseQuality = defenderStats.avgRating; // Simplified
            
            // Goal Chance formula (Boosted slightly by tactics)
            let goalChance = (shotQuality / (shotQuality + defenseQuality)) * 0.4; 
            
            if (attackingTeam.tacticStyle === 'Attacking') goalChance *= 1.2;
            if (defendingTeam.tacticStyle === 'Defensive') goalChance *= 0.8;

            if (isHomeEvent) homeShots++; else awayShots++;

            if (Math.random() < goalChance) {
                // GOAL
                if (isHomeEvent) { homeScore++; homeOnTarget++; } else { awayScore++; awayOnTarget++; }
                
                const goalTexts = [
                    `GOOOOAL! ${player.name} scores a fantastic goal!`,
                    `Goal! ${player.name} puts the ball in the back of the net!`,
                    `What a finish! ${player.name} finds the net.`
                ];

                timeline.push({ 
                    minute, 
                    type: 'GOAL', 
                    text: goalTexts[Math.floor(Math.random() * goalTexts.length)], 
                    teamId: attackingTeam.id,
                    playerId: player.id 
                });
                scorers.push({ player, time: minute });

            } else if (Math.random() < 0.5) {
                // SAVE / On Target
                if (isHomeEvent) homeOnTarget++; else awayOnTarget++;
                timeline.push({ minute, type: 'SAVE', text: `A powerful shot from ${player.name} but the keeper makes the save!`, teamId: attackingTeam.id });
            } else {
                // MISS
                timeline.push({ minute, type: 'MISS', text: `${player.name} shoots but the ball goes just wide of the post.`, teamId: attackingTeam.id });
            }

        } else if (eventRoll < 0.65) {
            // Corner
            if (isHomeEvent) homeCorners++; else awayCorners++;
            // Logic for Corner Taker
            const taker = getSetPieceTaker(attackingTeam, Math.random() > 0.5 ? 'leftCorner' : 'rightCorner');
            const takerName = taker ? taker.name : 'A player';
            
            timeline.push({ minute, type: 'NORMAL', text: `Corner kick for ${attackingTeam.name}, taken by ${takerName}.`, teamId: attackingTeam.id });
        } else if (eventRoll < 0.70) {
            // Foul / Card / Free Kick
            const defPlayer = defenderStats.players[Math.floor(Math.random() * 5)]; // Defender
            let cardChance = 0.2;
            if (defendingTeam.tacticStyle === 'High Press') cardChance = 0.35;

            if (Math.random() < cardChance) {
                timeline.push({ minute, type: 'YELLOW_CARD', text: `Yellow card for ${defPlayer.name} after a hard tackle.`, teamId: defendingTeam.id, playerId: defPlayer.id });
            } else {
                 // Free Kick Opportunity
                 const taker = getSetPieceTaker(attackingTeam, 'freeKick');
                 if (taker && Math.random() < 0.1) { // 10% chance free kick is dangerous/scored
                     if (isHomeEvent) { homeScore++; homeOnTarget++; } else { awayScore++; awayOnTarget++; }
                     timeline.push({ minute, type: 'GOAL', text: `Unbelievable! ${taker.name} scores from a direct free kick!`, teamId: attackingTeam.id, playerId: taker.id });
                     scorers.push({ player: taker, time: minute });
                 } else {
                     timeline.push({ minute, type: 'NORMAL', text: `Foul for ${attackingTeam.name} in the midfield.`, teamId: attackingTeam.id });
                 }
            }
        } else if (eventRoll < 0.72) {
             // INJURY EVENT
             const player = defenderStats.players[Math.floor(Math.random() * 11)];
             timeline.push({ 
                 minute, 
                 type: 'INJURY', 
                 text: `Injury for ${player.name}! He seems to be in pain but signals to the coach that he wants to continue.`, 
                 teamId: defendingTeam.id, 
                 playerId: player.id 
             });
        }
        
        if (minute === 45) timeline.push({ minute, type: 'HALF_TIME', text: 'Half Time.' });
    }

    timeline.push({ minute: 90, type: 'FULL_TIME', text: 'Full Time!', teamId: null });

    return {
        timeline,
        finalHomeScore: homeScore,
        finalAwayScore: awayScore,
        stats: {
            homePossession: finalHomePossession,
            awayPossession: finalAwayPossession,
            homeShots, awayShots,
            homeOnTarget, awayOnTarget,
            homeCorners, awayCorners
        },
        scorers
    };
};