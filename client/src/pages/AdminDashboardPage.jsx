import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

const emptyForm = { name: "", party: "" };

function AdminDashboardPage() {
  const [candidates, setCandidates] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    if (isEditMode && !editingId) {
      setError("Select a candidate before saving in edit mode");
      setSubmitting(false);
      return;
    }

    try {
      if (editingId) {
        await apiClient.put(`/candidates/${editingId}`, form);
        setMessage("Candidate updated successfully");
      } else {
        await apiClient.post("/candidates", form);
        setMessage("Candidate added successfully");
      }

      setForm(emptyForm);
      setEditingId("");
      await fetchCandidates();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to save candidate"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (candidate) => {
    if (!isEditMode) {
      setError("Turn edit mode on before editing a candidate");
      setMessage("");
      return;
    }

    setError("");
    setMessage("");
    setEditingId(candidate._id);
    setForm({ name: candidate.name, party: candidate.party || "" });
  };

  const handleEditModeToggle = () => {
    const nextEditMode = !isEditMode;
    setIsEditMode(nextEditMode);
    setError("");
    setMessage("");

    if (!nextEditMode) {
      setEditingId("");
      setForm(emptyForm);
    }
  };

  const handleDelete = async (candidateId) => {
    setError("");
    setMessage("");

    try {
      await apiClient.delete(`/candidates/${candidateId}`);
      setMessage("Candidate deleted successfully");
      await fetchCandidates();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to delete candidate"));
    }
  };

  return (
    <section className="page-shell admin-grid">
      <div className="panel">
        <p className="eyebrow">Admin Dashboard</p>
        <h2>{isEditMode ? (editingId ? "Edit candidate" : "Select a candidate to edit") : "Add candidate"}</h2>
        <div className="stats-grid compact-stats">
          <div className="stat-card">
            <span>Total Candidates</span>
            <strong>{candidates.length}</strong>
          </div>
          <div className="stat-card highlight-card">
            <span>Editing Mode</span>
            <strong>{isEditMode ? "On" : "Off"}</strong>
          </div>
        </div>
        <button className="secondary-button" onClick={handleEditModeToggle} type="button">
          {isEditMode ? "Turn Edit Mode Off" : "Turn Edit Mode On"}
        </button>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Candidate Name
            <input
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              disabled={isEditMode && !editingId}
              required
              value={form.name}
            />
          </label>

          <label>
            Party
            <input
              disabled={isEditMode && !editingId}
              onChange={(event) => setForm({ ...form, party: event.target.value })}
              value={form.party}
            />
          </label>

          {message ? <p className="success-text">{message}</p> : null}
          {error ? <p className="error-text">{error}</p> : null}

          <button disabled={submitting} type="submit">
            {submitting ? "Saving..." : isEditMode ? "Update Candidate" : "Add Candidate"}
          </button>
          {isEditMode ? (
            <button
              className="secondary-button"
              onClick={() => {
                setEditingId("");
                setForm(emptyForm);
              }}
              type="button"
            >
              Cancel Edit
            </button>
          ) : null}
        </form>
      </div>

      <div className="panel">
        <p className="eyebrow">Candidate Management</p>
        <h3>Current candidates</h3>
        {loading ? (
          <p>Loading candidates...</p>
        ) : (
          <div className="stack-list">
            {candidates.map((candidate) => (
              <div className="list-card" key={candidate._id}>
                <div>
                  <strong>{candidate.name}</strong>
                  <p>{candidate.party || "Independent"}</p>
                  <span>{candidate.voteCount} votes</span>
                </div>
                <div className="inline-actions">
                  <button className="secondary-button" onClick={() => handleEdit(candidate)} type="button">
                    Edit
                  </button>
                  <button className="danger-button" onClick={() => handleDelete(candidate._id)} type="button">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminDashboardPage;
