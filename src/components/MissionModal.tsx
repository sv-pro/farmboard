import React, { useState } from 'react';
import type { Mission, MissionSubmission, MissionProgress } from '../types';
import './MissionModal.css';

interface MissionModalProps {
  mission: Mission;
  networkLabel: string;
  networkExplorer?: string;
  onClose: () => void;
  onSubmit?: (submission: MissionSubmission) => void;
  onSaveProgress?: (missionId: string, progress: MissionProgress) => Promise<void>;
  currentProgress?: MissionProgress;
}

export const MissionModal: React.FC<MissionModalProps> = ({
  mission,
  networkLabel,
  networkExplorer,
  onClose,
  onSubmit,
  onSaveProgress,
  currentProgress,
}) => {
  const [txHash, setTxHash] = useState(currentProgress?.txHash || '');
  const [explorerUrl, setExplorerUrl] = useState(currentProgress?.explorerUrl || '');
  const [notes, setNotes] = useState(currentProgress?.notes || '');
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const submission: MissionSubmission = {
      missionId: mission.id,
      txHash,
      explorerUrl,
      notes,
      timestamp: new Date().toISOString(),
    };

    // Create progress object
    const progress: MissionProgress = {
      missionId: mission.id,
      status: 'completed',
      txHash,
      explorerUrl,
      notes,
      completedAt: new Date().toISOString(),
      submissions: currentProgress?.submissions
        ? [...currentProgress.submissions, submission]
        : [submission],
    };

    // Call legacy onSubmit if provided
    if (onSubmit) {
      onSubmit(submission);
    }

    // Save progress using new system
    if (onSaveProgress) {
      await onSaveProgress(mission.id, progress);
    }

    // Log to console for demo purposes
    console.log('Mission Submission:', submission);

    setIsSaving(false);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const requireTxHash = mission.logging?.requireTxHash !== false;
  const requireExplorerUrl = mission.logging?.requireExplorerUrl !== false;
  const allowMultipleTxs = mission.logging?.allowMultipleTxs === true;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h2>{mission.label}</h2>
            <p className="modal-subtitle">
              {networkLabel}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Mission Details */}
          <section className="modal-section">
            <h3>Details</h3>
            {mission.description && (
              <p className="mission-description">{mission.description}</p>
            )}
            <div className="mission-meta">
              {mission.difficulty && (
                <span className={`meta-badge difficulty-${mission.difficulty.toLowerCase()}`}>
                  ⭐ {mission.difficulty}
                </span>
              )}
              {mission.meta?.recommendedFrequency && (
                <span className="meta-badge frequency">
                  📅 {mission.meta.recommendedFrequency}
                </span>
              )}
            </div>
          </section>

          {/* Goal */}
          {mission.goal && (
            <section className="modal-section">
              <h3>Goal</h3>
              <div className="mission-goal-box">
                {mission.goal}
              </div>
            </section>
          )}

          {/* Suggested Protocols */}
          {mission.suggestedProtocols && mission.suggestedProtocols.length > 0 && (
            <section className="modal-section">
              <h3>Suggested Protocols</h3>
              <div className="protocols-list">
                {mission.suggestedProtocols.map((protocol, idx) => (
                  <div key={idx} className="protocol-badge">
                    {protocol}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Steps */}
          {mission.steps && mission.steps.length > 0 && (
            <section className="modal-section">
              <h3>Steps</h3>
              <ol className="steps-list">
                {mission.steps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </section>
          )}

          {/* Network Explorer */}
          {networkExplorer && (
            <section className="modal-section">
              <h3>Network Explorer</h3>
              <a 
                href={networkExplorer} 
                target="_blank" 
                rel="noopener noreferrer"
                className="explorer-link"
              >
                {networkExplorer} →
              </a>
            </section>
          )}

          {/* Submission Form */}
          <section className="modal-section submission-form">
            <h3>Log Completion</h3>
            {allowMultipleTxs && (
              <p className="form-note">
                ℹ️ This mission may require multiple transactions
              </p>
            )}
            {!submitted ? (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="txHash">
                    Transaction Hash {requireTxHash && '*'}
                  </label>
                  <input
                    type="text"
                    id="txHash"
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    placeholder="0x... or transaction signature"
                    required={requireTxHash}
                  />
                  {allowMultipleTxs && (
                    <small className="field-hint">
                      For multiple transactions, separate with commas
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="explorerUrl">
                    Explorer URL {requireExplorerUrl && '*'}
                  </label>
                  <input
                    type="url"
                    id="explorerUrl"
                    value={explorerUrl}
                    onChange={(e) => setExplorerUrl(e.target.value)}
                    placeholder="https://..."
                    required={requireExplorerUrl}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Notes (Optional)</label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes..."
                    rows={3}
                  />
                </div>

                <button type="submit" className="submit-button" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Submit Completion'}
                </button>
              </form>
            ) : (
              <div className="success-message">
                ✅ Submission recorded! Check console for details.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
