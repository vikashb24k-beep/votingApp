import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

function VoteCountsPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const { data } = await apiClient.get("/vote/counts");
        setCandidates(data.candidates);
        setError("");
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, "Unable to fetch vote counts"));
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
    const intervalId = window.setInterval(fetchCounts, 4000);

    return () => window.clearInterval(intervalId);
  }, []);

  const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.voteCount, 0);
  const leader = candidates[0];

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Live Counting</p>
          <h2>Current vote standings</h2>
          <p>This screen refreshes automatically every few seconds for near real-time results.</p>
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
          <strong>4 second polling</strong>
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
