import React from 'react';
import type { Mission, ProgressStatus } from '../types';
import './MissionCard.css';

interface MissionCardProps {
  mission: Mission;
  onMissionClick: () => void;
  status?: ProgressStatus;
}

export const MissionCard: React.FC<MissionCardProps> = ({
  mission,
  onMissionClick,
  status = 'not_started',
}) => {
  const getDifficultyClass = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'low':
        return 'difficulty-low';
      case 'medium':
        return 'difficulty-medium';
      case 'high':
        return 'difficulty-high';
      default:
        return 'difficulty-medium';
    }
  };

  const getStatusBadge = (status: ProgressStatus) => {
    switch (status) {
      case 'completed':
        return { icon: '✅', label: 'Completed', class: 'status-completed' };
      case 'in_progress':
        return { icon: '🔄', label: 'In Progress', class: 'status-in-progress' };
      default:
        return null;
    }
  };

  const statusBadge = getStatusBadge(status);

  return (
    <button className={`mission-card ${status === 'completed' ? 'completed' : ''}`} onClick={onMissionClick}>
      <div className="mission-content">
        <div className="mission-header">
          <h3 className="mission-name">
            {mission.label}
            {statusBadge && (
              <span className={`mission-status ${statusBadge.class}`}>
                {statusBadge.icon} {statusBadge.label}
              </span>
            )}
          </h3>
          {mission.difficulty && (
            <span className={`mission-difficulty ${getDifficultyClass(mission.difficulty)}`}>
              {mission.difficulty}
            </span>
          )}
        </div>
        
        {mission.description && (
          <p className="mission-description">{mission.description}</p>
        )}
        
        {mission.goal && (
          <div className="mission-goal">
            <span className="goal-label">Goal:</span> {mission.goal}
          </div>
        )}
        
        <div className="mission-meta">
          {mission.suggestedProtocols && mission.suggestedProtocols.length > 0 && (
            <div className="mission-protocols">
              <span className="protocols-label">Protocols:</span>
              <span className="protocols-list">
                {mission.suggestedProtocols.join(', ')}
              </span>
            </div>
          )}
          
          {mission.meta?.recommendedFrequency && (
            <div className="mission-frequency">
              📅 {mission.meta.recommendedFrequency}
            </div>
          )}
        </div>
      </div>
      
      <span className="mission-arrow">→</span>
    </button>
  );
};
