import { Scenario, ScenarioResult, Team, Player, NewsItem } from '../types.ts';

// Random Helper
const chance = (percentage: number) => Math.random() * 100 < percentage;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const SCENARIOS: Scenario[] = [
    {
        id: 'MEDIA_INTERVIEW',
        category: 'MEDIA',
        title: 'Heated Press Conference',
        description: 'A famous journalist has requested an exclusive interview with you before the upcoming derby. The fans are waiting for your statements.',
        options: [
            { id: 'CALM', label: 'Give a calm, diplomatic statement', riskLevel: 'LOW', description: 'Respect the opponent and ask for the fans\' support.' },
            { id: 'ARROGANT', label: 'Promise a crushing victory', riskLevel: 'HIGH', description: 'Fire up the fans and promise to defeat the opponent.' }
        ]
    },
    {
        id: 'PLAYER_PARTY',
        category: 'DISCIPLINE',
        title: 'Late Night Party',
        description: 'You\'ve received photos of one of your key players partying late just two days before a crucial match.',
        options: [
            { id: 'FINE', label: 'Issue a fine and a warning', riskLevel: 'MEDIUM', description: 'Enforce discipline strictly.' },
            { id: 'IGNORE', label: 'Ignore it and talk to the player privately', riskLevel: 'LOW', description: 'Maintain a good relationship with him.' }
        ]
    },
    {
        id: 'SPONSOR_DEAL',
        category: 'FINANCE',
        title: 'Risky Investment Opportunity',
        description: 'A new cryptocurrency company has offered a huge sum to sponsor the training kits, but their reputation is unstable.',
        options: [
            { id: 'ACCEPT', label: 'Accept the offer', riskLevel: 'HIGH', description: 'Risk the club\'s reputation for the money.' },
            { id: 'REJECT', label: 'Reject the offer', riskLevel: 'LOW', description: 'Protect the club\'s image.' }
        ]
    },
    {
        id: 'FAN_PROTEST',
        category: 'FANS',
        title: 'Fan Outrage',
        description: 'The fan association is angry about ticket prices and is demanding a reduction for the next match.',
        options: [
            { id: 'DISCOUNT', label: 'Reduce prices by 50%', riskLevel: 'LOW', description: 'Lose money but win over the fans.' },
            { id: 'IGNORE', label: 'Keep the prices as they are', riskLevel: 'MEDIUM', description: 'Maintain income and ignore the demands.' }
        ]
    },
    {
        id: 'MEDICAL_RISK',
        category: 'MEDICAL',
        title: 'Return of the Injured Star',
        description: 'Your star player wants to play in the next match even though he is not 100% fit. The doctor has warned against it.',
        options: [
            { id: 'PLAY', label: 'Take the risk and play him', riskLevel: 'HIGH', description: 'He might shine or his injury could worsen.' },
            { id: 'REST', label: 'Rest him completely', riskLevel: 'LOW', description: 'Play without him to ensure his safety.' }
        ]
    },
    {
        id: 'YOUTH_DEMAND',
        category: 'DISCIPLINE',
        title: 'Youth Talent Rebellion',
        description: 'One of your promising academy players is threatening to leave for a rival club if he is not promoted to the first team immediately.',
        options: [
            { id: 'PROMOTE', label: 'Promote him immediately', riskLevel: 'MEDIUM', description: 'He might not be technically ready.' },
            { id: 'REJECT', label: 'Refuse and ask him to wait', riskLevel: 'HIGH', description: 'We might lose the player forever.' }
        ]
    },
    {
        id: 'TACTICAL_LEAK',
        category: 'TACTICAL',
        title: 'Tactics Leaked',
        description: 'It seems the plan for the next match has been leaked to the press. Do you change tactics at the last minute?',
        options: [
            { id: 'CHANGE', label: 'Change the plan completely', riskLevel: 'MEDIUM', description: 'Confuse the opponent, but the players are not used to it.' },
            { id: 'KEEP', label: 'Stick to the plan', riskLevel: 'HIGH', description: 'The opponent knows how we will play.' }
        ]
    },
    {
        id: 'CHARITY_EVENT',
        category: 'MEDIA',
        title: 'Charity Match',
        description: 'An invitation to participate in a charity exhibition match mid-week.',
        options: [
            { id: 'ACCEPT', label: 'Participate', riskLevel: 'MEDIUM', description: 'Improve reputation but fatigue the players.' },
            { id: 'REJECT', label: 'Decline', riskLevel: 'LOW', description: 'Focus on the league.' }
        ]
    },
    {
        id: 'FACILITY_ISSUE',
        category: 'FINANCE',
        title: 'Stadium Malfunction',
        description: 'The stadium\'s irrigation system has broken down and needs immediate, costly maintenance.',
        options: [
            { id: 'FIX_NOW', label: 'Fix immediately (high cost)', riskLevel: 'LOW', description: 'Pay a large sum to maintain pitch quality.' },
            { id: 'DELAY', label: 'Postpone the fix', riskLevel: 'HIGH', description: 'Save money but risk more injuries.' }
        ]
    },
    {
        id: 'SCOUT_TIP',
        category: 'TACTICAL',
        title: 'Scout\'s Tip',
        description: 'The chief scout insists he has found a flaw in the next opponent\'s defense and recommends an all-out attack.',
        options: [
            { id: 'TRUST', label: 'Change tactics to attacking', riskLevel: 'MEDIUM', description: 'Trust the report.' },
            { id: 'IGNORE', label: 'Stick to your balanced plan', riskLevel: 'LOW', description: 'Don\'t take the risk.' }
        ]
    }
];

export const getRandomScenario = (): Scenario => {
    return pick(SCENARIOS);
};

export const resolveScenario = (team: Team, scenarioId: string, optionId: string): ScenarioResult => {
    const scenario = SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) return { success: false, message: 'An error occurred', changes: {} };

    let success = false;
    let message = '';
    const changes: Partial<Team> = {};
    let newsItem: NewsItem | undefined;

    // --- LOGIC ENGINE ---
    switch (scenarioId) {
        case 'MEDIA_INTERVIEW':
            if (optionId === 'CALM') {
                success = true;
                message = 'Your balanced statements were respected by everyone and increased the players\' focus.';
                // Effect: Small Morale Boost
                changes.players = team.players.map(p => ({ ...p, morale: Math.min(100, p.morale + 5) }));
            } else { // ARROGANT
                if (chance(40)) { // 40% Success
                    success = true;
                    message = 'The mind games worked! The players are very motivated to prove you right.';
                    changes.players = team.players.map(p => ({ ...p, morale: Math.min(100, p.morale + 15) }));
                } else {
                    success = false;
                    message = 'The plan backfired. The statements put immense pressure on the team.';
                    changes.players = team.players.map(p => ({ ...p, morale: Math.max(0, p.morale - 10) }));
                }
            }
            break;

        case 'PLAYER_PARTY':
            if (optionId === 'FINE') {
                success = true;
                message = 'Strictness is necessary. The team appreciates the fairness, and the player remained silent.';
                changes.budget = team.budget + 0.5; // Fine income
                changes.players = team.players.map(p => ({ ...p, morale: Math.min(100, p.morale + 2) })); // Team likes discipline
            } else { // IGNORE
                if (chance(50)) {
                    success = true;
                    message = 'The player appreciated your stance and promised to make it up on the field.';
                    // Boost specific player morale (simulated by boosting all slightly)
                    changes.players = team.players.map(p => ({ ...p, morale: Math.min(100, p.morale + 2) }));
                } else {
                    success = false;
                    message = 'Your leniency led to chaos in the dressing room. Other players are demanding the same treatment.';
                    changes.players = team.players.map(p => ({ ...p, morale: Math.max(0, p.morale - 5) }));
                }
            }
            break;

        case 'SPONSOR_DEAL':
            if (optionId === 'ACCEPT') {
                if (chance(30)) { // High Risk
                    success = true;
                    message = 'A winning gamble! The company is legitimate and you\'ve received a huge financial boost.';
                    changes.budget = team.budget + 15;
                } else {
                    success = false;
                    message = 'Disaster! The company declared bankruptcy and didn\'t pay, and the club faced harsh criticism.';
                    changes.players = team.players.map(p => ({ ...p, morale: Math.max(0, p.morale - 5) }));
                }
            } else {
                success = true;
                message = 'A wise decision. It was later revealed that the company was facing legal issues.';
            }
            break;

        case 'FAN_PROTEST':
            if (optionId === 'DISCOUNT') {
                success = true;
                message = 'The fans are thrilled with your decision! Morale is sky-high.';
                changes.budget = team.budget - 2; // Lost revenue
                changes.players = team.players.map(p => ({ ...p, morale: Math.min(100, p.morale + 10) }));
            } else {
                success = false;
                message = 'The fans are furious and have decided to protest by staying silent for the first 15 minutes.';
                changes.players = team.players.map(p => ({ ...p, morale: Math.max(0, p.morale - 5) }));
            }
            break;

        case 'MEDICAL_RISK':
            if (optionId === 'PLAY') {
                if (chance(30)) {
                    success = true;
                    message = 'A successful gamble! The player delivered a legendary performance and boosted team morale.';
                    changes.players = team.players.map(p => ({ ...p, morale: Math.min(100, p.morale + 10) }));
                } else {
                    success = false;
                    message = 'What we feared has happened. The injury has been aggravated, and the player will be out for longer.';
                    // Find highest rated player to injure
                    const star = [...team.players].sort((a,b) => b.rating - a.rating)[0];
                    if (star) {
                        const updatedPlayers = team.players.map(p => p.id === star.id ? { ...p, injuryWeeks: p.injuryWeeks + 4 } : p);
                        changes.players = updatedPlayers;
                    }
                }
            } else {
                success = true;
                message = 'The player understood the situation. The rest will allow him to come back stronger in the upcoming matches.';
                changes.players = team.players.map(p => ({ ...p, injuryWeeks: Math.max(0, p.injuryWeeks - 1) })); // Bonus healing
            }
            break;
            
        // Default fallbacks for others (Simplified logic)
        default:
            if (optionId.includes('ACCEPT') || optionId === 'FIX_NOW' || optionId === 'DISCOUNT') {
                success = true;
                message = 'The decision has been executed successfully.';
            } else {
                if (chance(50)) {
                    success = true;
                    message = 'The decision was the right one and saved the team from potential trouble.';
                } else {
                    success = false;
                    message = 'The decision wasn\'t ideal, but the team will overcome it.';
                }
            }
            break;
    }

    return { success, message, changes, newsItem };
};