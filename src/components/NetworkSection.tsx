import React, { useState } from 'react';
import type { Network, Mission } from '../types';
import { MissionCard } from './MissionCard';
import './NetworkSection.css';

interface NetworkSectionProps {
  network: Network;
  onMissionClick: (mission: Mission, networkLabel: string, networkExplorer?: string) => void;
  defaultExpanded?: boolean;
}

export const NetworkSection: React.FC<NetworkSectionProps> = ({
  network,
  onMissionClick,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Get network-specific styling
  const getNetworkColor = () => {
    switch (network.key) {
      case 'scroll':
        return '#FFA726';
      case 'zksync':
        return '#8C7CFF';
      case 'base':
        return '#0052FF';
      case 'solana':
        return '#14F195';
      default:
        return '#3b82f6';
    }
  };

  const getNetworkIcon = () => {
    switch (network.key) {
      case 'scroll':
        return '🌀';
      case 'zksync':
        return '⚡';
      case 'base':
        return '🔵';
      case 'solana':
        return '◎';
      default:
        return '🔗';
    }
  };

  return (
    <div className="network-section">
      <button
        className="network-header"
        onClick={toggleExpanded}
        style={{ 
          borderLeftColor: getNetworkColor(),
        }}
      >
        <div className="network-header-content">
          <div className="network-title">
            <span className="network-icon">{getNetworkIcon()}</span>
            <h2 className="network-name">{network.label}</h2>
            {network.priority && (
              <span className="network-priority">Priority {network.priority}</span>
            )}
          </div>
          {network.explorer && (
            <p className="network-explorer">
              Explorer: <a href={network.explorer} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                {network.explorer}
              </a>
            </p>
          )}
          <div className="network-stats">
            <span className="network-stat">
              {network.missions.length} {network.missions.length === 1 ? 'Mission' : 'Missions'}
            </span>
          </div>
        </div>
        <span className={`network-toggle ${isExpanded ? 'expanded' : ''}`}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="network-content">
          {network.missions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onMissionClick={() => 
                onMissionClick(mission, network.label, network.explorer)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};
