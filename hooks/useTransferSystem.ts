import React from 'react';
import { Team, Player, NewsItem, Toast } from '../types.ts';

export type NegotiationResult = 
  | { status: 'ACCEPTED' }
  | { status: 'REJECTED'; reason: string }
  | { status: 'COUNTER_OFFER'; counterPrice: number };

interface TransferSystemProps {
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  setNews: React.Dispatch<React.SetStateAction<NewsItem[]>>;
  userTeamId: string;
  currentWeek: number;
  isGodMode: boolean;
  addToast: (message: string, type: Toast['type']) => void;
}

export const useTransferSystem = ({
  teams, setTeams, setNews, userTeamId, currentWeek, isGodMode, addToast
}: TransferSystemProps) => {

  // Internal function to execute the transfer after an agreement
  const executeTransfer = (player: Player, fromTeamId: string, agreedPrice: number) => {
      setTeams(prev => {
          const buyer = prev.find(t => t.id === userTeamId)!;
          const seller = prev.find(t => t.id === fromTeamId)!;

          // 5% Tax deducted from seller
          const tax = agreedPrice * 0.05;
          const sellerReceipt = agreedPrice - tax;

          // Find fresh player object from state
          const playerObj = seller.players.find(p => p.id === player.id)!;
          
          // Remove from Seller
          const newSellerPlayers = seller.players.filter(p => p.id !== player.id);
          // Add to Buyer
          const newBuyerPlayers = [...buyer.players, { ...playerObj, isTransferListed: false }];

          // Generate News
          const newNewsItem: NewsItem = {
              id: Date.now().toString(),
              week: currentWeek,
              message: `Official: ${player.name} has transferred from ${seller.name} to ${buyer.name} for ${agreedPrice}M`,
              type: 'transfer'
          };
          setNews(n => [newNewsItem, ...n]);
          
          addToast(`Player ${player.name} signed successfully!`, "success");

          return prev.map(t => {
              if (t.id === userTeamId) return { ...t, players: newBuyerPlayers, budget: t.budget - (isGodMode ? 0 : agreedPrice) };
              if (t.id === fromTeamId) return { ...t, players: newSellerPlayers, budget: t.budget + sellerReceipt };
              return t;
          });
      });
  };

  // Negotiation function (called by the UI)
  const negotiateTransfer = (player: Player, fromTeamId: string, offerAmount: number): Promise<NegotiationResult> => {
    return new Promise((resolve) => {
        // Simulate network delay/thinking
        setTimeout(() => {
            const team = teams.find(t => t.id === userTeamId);
            if (!team) return;

            if (team.budget < offerAmount && !isGodMode) {
                resolve({ status: 'REJECTED', reason: 'Your budget is insufficient to make this offer.' });
                return;
            }

            // Check Seller Squad Size Rule (New Logic)
            const sellerTeam = teams.find(t => t.id === fromTeamId);
            if (sellerTeam && sellerTeam.players.length <= 15) {
                resolve({ 
                    status: 'REJECTED', 
                    reason: 'The club\'s board refuses to sell any player as the squad has reached the minimum size (15 players).' 
                });
                return;
            }

            // AI LOGIC FOR NEGOTIATION
            // True market value
            const baseValue = player.value;
            // Price the club hopes for (usually +20% to +40%)
            const askingPrice = Math.floor(baseValue * 1.3); 
            // Minimum acceptable price (e.g., +10%)
            const minAcceptable = Math.floor(baseValue * 1.1);

            // 1. Very low offer (insulting)
            if (offerAmount < baseValue * 0.8) {
                resolve({ status: 'REJECTED', reason: 'The selling club considered the offer too low and has closed negotiations.' });
            }
            // 2. Offer is immediately acceptable
            else if (offerAmount >= minAcceptable) {
                executeTransfer(player, fromTeamId, offerAmount);
                resolve({ status: 'ACCEPTED' });
            }
            // 3. Offer is close but needs a bump (negotiation)
            else {
                let counter = Math.floor((askingPrice + offerAmount) / 2);
                if (counter <= offerAmount) counter = offerAmount + 1; // Small increase

                resolve({ status: 'COUNTER_OFFER', counterPrice: counter });
            }
        }, 1500);
    });
  };

  return { negotiateTransfer };
};