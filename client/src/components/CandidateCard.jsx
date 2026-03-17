function CandidateCard({ candidate, onVote, canVote, isSubmitting }) {
  return (
    <article className="candidate-card">
      <div className="candidate-card-top">
        <div className="candidate-badge">{candidate.name?.slice(0, 1)?.toUpperCase() || "C"}</div>
        <div className="candidate-meta">
          <p className="candidate-party">{candidate.party || "Independent"}</p>
          <h3>{candidate.name}</h3>
        </div>
      </div>

      <div className="candidate-progress">
        <div className="candidate-progress-bar" style={{ width: `${Math.min(candidate.voteCount * 10, 100)}%` }} />
      </div>

      <div className="candidate-footer">
        <div>
          <span className="count-label">Votes</span>
          <strong>{candidate.voteCount}</strong>
        </div>
        <button disabled={!canVote || isSubmitting} onClick={() => onVote(candidate._id)} type="button">
          {isSubmitting ? "Submitting..." : canVote ? "Vote Now" : "Voting Locked"}
        </button>
      </div>
    </article>
  );
}

export default CandidateCard;
