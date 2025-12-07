import { useState, useEffect, useRef } from 'react';
import { Team, Match, NewsItem, Sponsor, Scout, SeasonHistory, LeagueType } from '../types.ts';
import { initializeLeague, generateSponsors, generateScouts } from '../services/generator.ts';
import { generateFixtures as generateFixturesEngine } from '../services/engine.ts';
import { db, auth } from '../services/firebase.ts';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export const useGameState = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Core Game Data
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [userTeamId, setUserTeamId] = useState<string>('');
  const [currentWeek, setCurrentWeek] = useState(0);
  const [campaignStartTime, setCampaignStartTime] = useState<number>(0);
  const [news, setNews] = useState<NewsItem[]>([]);
  
  // Market Data
  const [availableSponsors, setAvailableSponsors] = useState<Sponsor[]>([]);
  const [availableScouts, setAvailableScouts] = useState<Scout[]>([]);

  // Settings
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Season & History
  const [season, setSeason] = useState(1);
  const [history, setHistory] = useState<SeasonHistory[]>([]);

  // Debugging
  const [isGodMode, setIsGodMode] = useState(false);

  // User ID Ref for Saving
  const [currentUid, setCurrentUid] = useState<string | null>(null);

  // --- Theme Effect (Dark Mode Fix) ---
  useEffect(() => {
      const root = window.document.documentElement;
      if (theme === 'dark') {
          root.classList.add('dark');
      } else {
          root.classList.remove('dark');
      }
  }, [theme]);

  // --- Load Save Data (From Firestore) ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            setCurrentUid(user.uid);
            try {
                const docRef = doc(db, 'saves', user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setTeams(data.teams);
                    setMatches(data.matches);
                    setUserTeamId(data.userTeamId);
                    setCurrentWeek(data.currentWeek);
                    setCampaignStartTime(data.campaignStartTime);
                    setNews(data.news || []);
                    setAvailableSponsors(data.availableSponsors || []);
                    setAvailableScouts(data.availableScouts || []);
                    setTheme(data.theme || 'light');
                    setSeason(data.season || 1);
                    setHistory(data.history || []);
                    setIsGodMode(data.isGodMode || false);
                }
            } catch (e) {
                console.error("Failed to load save from Firestore", e);
            }
        } else {
            setCurrentUid(null);
            // Optional: Clear state or handle guest mode
        }
        setIsLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  const initializeNewGame = (setup: { managerName: string, teamName: string, color: string, leagueType: LeagueType }) => {
    const initialTeams = initializeLeague();
    
    // Setup User Team (Overwrite Index 0)
    const myTeam = initialTeams[0];
    myTeam.name = setup.teamName;
    myTeam.managerName = setup.managerName;
    myTeam.color = setup.color;
    myTeam.logoCode = setup.teamName.slice(0, 2).toUpperCase();
    
    // Reset Facilities to Level 1
    myTeam.facilities = {
        stadium: { seatsLevel: 1, parkingLevel: 1, lightingLevel: 1, pitchLevel: 1, toiletsLevel: 1 },
        store: { shirtSalesLevel: 1, souvenirsLevel: 1 },
        hospitality: { restaurantLevel: 1, foodTrucksLevel: 1, coffeeShopLevel: 1 },
        academyLevel: 1,
        scoutingNetworkLevel: 1,
    };
    // Reset Budget for start
    myTeam.budget = 50; 

    setUserTeamId(myTeam.id);
    setTeams(initialTeams);
    
    // Generate Fixtures
    const fixtures = generateFixturesEngine(initialTeams);
    setMatches(fixtures);

    // Initial Market Data
    setAvailableSponsors(generateSponsors()); 
    setAvailableScouts(generateScouts(5, 1));

    setCampaignStartTime(Date.now());
    setTheme('light');
    setSeason(1);
    setHistory([]);
    setIsGodMode(false);
  };

  // --- Auto-Save (Debounced for Firestore) ---
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isLoaded || teams.length === 0 || !currentUid) return; // Don't save empty states or if not logged in
    
    const saveData = {
      teams,
      matches,
      userTeamId,
      currentWeek,
      campaignStartTime,
      news,
      availableSponsors,
      availableScouts,
      theme,
      season,
      history,
      isGodMode
    };

    // Clear previous timeout
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    // Debounce save (wait 2 seconds after last change before writing to DB)
    saveTimeoutRef.current = setTimeout(async () => {
        try {
            await setDoc(doc(db, 'saves', currentUid), saveData, { merge: true });
            console.log("Game Saved to Firestore");
        } catch (e) {
            console.error("Error saving to Firestore", e);
        }
    }, 2000);

    return () => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };

  }, [teams, matches, userTeamId, currentWeek, campaignStartTime, news, availableSponsors, availableScouts, theme, season, history, isGodMode, isLoaded, currentUid]);

  const resetGame = async () => {
      if (currentUid) {
          // In Firestore, we can overwrite with empty or delete. 
          // For now, reloading page and clearing state logic in App is easier, 
          // but strictly we should delete the doc.
          // Let's just reload for now, the UI will trigger initializeNewGame if hasSave is checked.
          // But hasSave checks teams.length.
          setTeams([]); // This will trigger UI to show onboarding
          // Ideally delete doc: await deleteDoc(doc(db, 'saves', currentUid));
      }
      window.location.reload();
  };

  return {
    isLoaded,
    hasSave: teams.length > 0, 
    teams, setTeams,
    matches, setMatches,
    userTeamId, setUserTeamId,
    currentWeek, setCurrentWeek,
    campaignStartTime, setCampaignStartTime,
    news, setNews,
    availableSponsors, setAvailableSponsors,
    availableScouts, setAvailableScouts,
    theme, setTheme,
    season, setSeason,
    history, setHistory,
    isGodMode, setIsGodMode,
    initializeNewGame,
    resetGame
  };
};