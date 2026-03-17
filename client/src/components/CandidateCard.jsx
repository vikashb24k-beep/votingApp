function CandidateCard({ candidate, onVote, canVote, isSubmitting, totalVotes, isLeader }) {
  const voteShare = totalVotes > 0 ? Math.round((candidate.voteCount / totalVotes) * 100) : 0;
  const progressWidth = Math.max(voteShare, candidate.voteCount > 0 ? 12 : 4);

  return (
    <article className={`candidate-card ${isLeader ? "leader-card" : ""}`}>
      <div className="candidate-card-top">
        <div className="candidate-badge">{candidate.name?.slice(0, 1)?.toUpperCase() || "C"}</div>
        <div className="candidate-meta">
          <p className="candidate-party">{candidate.party || "Independent"}</p>
          <h3>{candidate.name}</h3>
        </div>
        <div className="candidate-rank-pill">{isLeader ? "Leader" : `${voteShare}%`}</div>
      </div>

      <div className="candidate-score-row">
        <div>
          <span className="count-label">Votes</span>
          <strong>{candidate.voteCount}</strong>
        </div>
        <div>
          <span className="count-label">Share</span>
          <strong>{voteShare}%</strong>
        </div>
      </div>

      <div className="candidate-progress">
        <div className="candidate-progress-bar" style={{ width: `${Math.min(progressWidth, 100)}%` }} />
      </div>

      <div className="candidate-footer">
        <span className="candidate-live-note">{isLeader ? "Setting the pace" : "Still in the race"}</span>
        <button disabled={!canVote || isSubmitting} onClick={() => onVote(candidate._id)} type="button">
          {isSubmitting ? "Submitting..." : canVote ? "Vote Now" : "Voting Locked"}
        </button>
      </div>
    </article>
  );
}

export default CandidateCard;
