import { useEffect, useState } from "react";
import apiClient from "../api/client";
import CandidateCard from "../components/CandidateCard";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

function CandidatesPage() {
  const { user, refreshProfile, setUser } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingCandidateId, setSubmittingCandidateId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const { data } = await apiClient.get("/candidates");
        setCandidates(data.candidates);
        setError("");
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, "Unable to load candidates"));
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();

    const intervalId = window.setInterval(fetchCandidates, 5000);
    return () => window.clearInterval(intervalId);
  }, []);

  const handleVote = async (candidateId) => {
    setSubmittingCandidateId(candidateId);
    setError("");
    setMessage("");

    try {
      await apiClient.post(`/vote/${candidateId}`);
      const nextUser = await refreshProfile();
      setUser(nextUser);
      setMessage("Your vote has been recorded.");
      setError("");

      const { data } = await apiClient.get("/candidates");
      setCandidates(data.candidates);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to cast vote"));
    } finally {
      setSubmittingCandidateId("");
    }
  };

  const canVote = user?.role === "user" && !user?.hasVoted;
  const leadingCandidate = candidates[0];
  const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.voteCount, 0);

  return (
    <section className="page-shell">
      <div className="page-header ballot-header">
        <div>
          <p className="eyebrow">Candidate Ballot</p>
          <h2>Choose one candidate</h2>
          <p>Voting is allowed only once. Your button locks as soon as your vote is saved.</p>
        </div>
        <div className="status-chip">{user?.hasVoted ? "Vote submitted" : "Vote pending"}</div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total Candidates</span>
          <strong>{candidates.length}</strong>
        </div>
        <div className="stat-card">
          <span>Your Access</span>
          <strong>{user?.role === "admin" ? "Admin" : "Voter"}</strong>
        </div>
        <div className="stat-card">
          <span>Total Ballots</span>
          <strong>{totalVotes}</strong>
        </div>
        <div className="stat-card highlight-card">
          <span>Current Leader</span>
          <strong>{leadingCandidate ? leadingCandidate.name : "Waiting for data"}</strong>
        </div>
      </div>

      {message ? <p className="success-text">{message}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      {loading ? (
        <div className="panel">Loading candidates...</div>
      ) : (
        <div className="card-grid">
          {candidates.map((candidate) => (
            <CandidateCard
              canVote={canVote}
              candidate={candidate}
              isLeader={candidate._id === leadingCandidate?._id}
              isSubmitting={submittingCandidateId === candidate._id}
              key={candidate._id}
              onVote={handleVote}
              totalVotes={totalVotes}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default CandidatesPage;
