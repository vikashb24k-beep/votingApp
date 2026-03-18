import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

function VoteCountsPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [error, setError] = useState("");

  const fetchCounts = async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const { data } = await apiClient.get("/vote/counts");
      setCandidates(data.candidates);
      setError("");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to fetch vote counts"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  useEffect(() => {
    if (!autoRefreshEnabled) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      fetchCounts({ silent: true });
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [autoRefreshEnabled]);

  const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.voteCount, 0);
  const leader = candidates[0];

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Live Counting</p>
          <h2>Current vote standings</h2>
          <p>Watch the latest standings and refresh them any time without leaving the page.</p>
        </div>
        <div className="inline-actions">
          <button className="secondary-button" onClick={() => setAutoRefreshEnabled((value) => !value)} type="button">
            {autoRefreshEnabled ? "Turn Refresh Off" : "Turn Refresh On"}
          </button>
          <button className="secondary-button" disabled={loading || refreshing} onClick={() => fetchCounts({ silent: true })} type="button">
            {refreshing ? "Refreshing..." : "Refresh Now"}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total Votes</span>
          <strong>{totalVotes}</strong>
        </div>
        <div className="stat-card">
          <span>Leader</span>
          <strong>{leader ? leader.name : "No votes yet"}</strong>
        </div>
        <div className="stat-card highlight-card">
          <span>Refresh Mode</span>
          <strong>{autoRefreshEnabled ? "4 second polling" : "Manual only"}</strong>
        </div>
      </div>

      {error ? <p className="error-text">{error}</p> : null}
      {loading ? (
        <div className="panel">Loading counts...</div>
      ) : (
        <div className="panel">
          <table className="results-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Candidate</th>
                <th>Party</th>
                <th>Votes</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate, index) => (
                <tr key={candidate._id}>
                  <td>{index + 1}</td>
                  <td>{candidate.name}</td>
                  <td>{candidate.party || "Independent"}</td>
                  <td>{candidate.voteCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default VoteCountsPage;
