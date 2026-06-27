import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import './LiveScoresWidget.css';

const LEAGUES = {
  EPL: 'eng.1', // English Premier League
  LALIGA: 'esp.1', // La Liga
  UCL: 'uefa.champions', // UEFA Champions League
  WORLDCUP: 'fifa.world', // FIFA World Cup
};

export default function LiveScoresWidget() {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function fetchLeagueScores(leagueId, leagueName) {
    try {
      const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${leagueId}/scoreboard`;
      const res = await fetch(url);
      const data = await res.json();
      
      const leagueMatches = [];
      if (data && data.events) {
        // Get today's local date string in format "MM/DD/YYYY"
        const todayStr = new Date().toLocaleDateString('en-US');

        data.events.forEach(event => {
          const comp = event.competitions?.[0];
          if (comp) {
            // STRICT DATE FILTER: Only include matches scheduled/played TODAY
            const eventDate = new Date(event.date);
            const eventDateStr = eventDate.toLocaleDateString('en-US');
            
            if (eventDateStr !== todayStr) {
              return;
            }

            const teamA = comp.competitors?.[0]; // Home / Away
            const teamB = comp.competitors?.[1];
            leagueMatches.push({
              id: `${leagueId}-${event.id}`,
              league: leagueName,
              teamA: teamA?.team?.displayName || 'TBD',
              teamAColor: teamA?.team?.color ? `#${teamA.team.color}` : '#1E293B',
              teamAShort: teamA?.team?.abbreviation || 'TBD',
              teamALogo: teamA?.team?.logo || null,
              teamB: teamB?.team?.displayName || 'TBD',
              teamBColor: teamB?.team?.color ? `#${teamB.team.color}` : '#475569',
              teamBShort: teamB?.team?.abbreviation || 'TBD',
              teamBLogo: teamB?.team?.logo || null,
              scoreA: teamA?.score || '0',
              scoreB: teamB?.score || '0',
              minute: event.status?.type?.detail || event.status?.type?.shortDetail || 'FT',
              status: event.status?.type?.state || 'scheduled',
            });
          }
        });
      }
      return leagueMatches;
    } catch (err) {
      console.error(`Failed to fetch ${leagueName} scores:`, err);
      return [];
    }
  }

  async function fetchScores(isInitial = false) {
    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    try {
      const [epl, laliga, ucl, wc] = await Promise.all([
        fetchLeagueScores(LEAGUES.EPL, 'Premier League'),
        fetchLeagueScores(LEAGUES.LALIGA, 'La Liga'),
        fetchLeagueScores(LEAGUES.UCL, 'Champions League'),
        fetchLeagueScores(LEAGUES.WORLDCUP, 'World Cup')
      ]);
      // Combine matches and show top 6 matches
      setMatches([...epl, ...laliga, ...ucl, ...wc].slice(0, 6));
    } catch (err) {
      console.error("Failed to compile soccer scores:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    fetchScores(true); // Initial load shows spinner
    const interval = setInterval(() => {
      fetchScores(false); // Background update runs silently
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    fetchScores(false); // Manual click runs silently (spinning icon only)
  };

  return (
    <div className="live-scores-widget">
      <div className="scores-header">
        <div className="header-title-group">
          <span className="live-indicator">
            TODAY'S MATCHES
          </span>
        </div>
        <button 
          className={`refresh-btn ${isRefreshing ? 'spinning' : ''}`}
          onClick={handleManualRefresh}
          aria-label="Refresh Scores"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="matches-list">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>
            <div className="refresh-btn spinning" style={{ display: 'inline-block', marginBottom: '8px' }}>
              <RefreshCw size={18} />
            </div>
            <div>Loading matches...</div>
          </div>
        ) : matches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>
            No matches scheduled for today.
          </div>
        ) : (
          matches.map((match) => (
            <div key={match.id} className="match-card">
              <div className="match-meta">
                <span className={`match-time ${match.status === 'in' || match.status === 'live' || match.status === 'in-progress' ? 'active-live' : ''}`}>
                  {match.minute}
                </span>
              </div>
              <div className="teams-score-container">
                <div className="team-row">
                  <div className="team-brand">
                    {match.teamALogo ? (
                      <img 
                        src={match.teamALogo} 
                        alt={match.teamA} 
                        className="team-logo-img" 
                      />
                    ) : (
                      <div 
                        className="team-badge"
                        style={{ backgroundColor: match.teamAColor }}
                      >
                        {match.teamAShort}
                      </div>
                    )}
                    <span className="team-name">{match.teamA}</span>
                  </div>
                  <span className="team-score">{match.scoreA}</span>
                </div>
                <div className="team-row">
                  <div className="team-brand">
                    {match.teamBLogo ? (
                      <img 
                        src={match.teamBLogo} 
                        alt={match.teamB} 
                        className="team-logo-img" 
                      />
                    ) : (
                      <div 
                        className="team-badge"
                        style={{ backgroundColor: match.teamBColor }}
                      >
                        {match.teamBShort}
                      </div>
                    )}
                    <span className="team-name">{match.teamB}</span>
                  </div>
                  <span className="team-score">{match.scoreB}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
