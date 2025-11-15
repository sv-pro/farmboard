import { useState, useEffect } from 'react';
import type { Mission, MissionBoardConfig, MissionSubmission } from './types';
import { loadMissionsConfig } from './utils/configLoader';
import { NetworkSection } from './components/NetworkSection';
import { MissionModal } from './components/MissionModal';
import { useProgress } from './hooks/useProgress';
import './App.css';

function App() {
  const [config, setConfig] = useState<MissionBoardConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMission, setSelectedMission] = useState<{
    mission: Mission;
    networkLabel: string;
    networkExplorer?: string;
  } | null>(null);

  // Progress tracking hook
  const {
    progress,
    userId,
    isSyncing,
    pendingSyncs,
    updateProgress,
    getMissionStatus,
    manualSync,
  } = useProgress();

  // Load missions configuration from YAML
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedConfig = await loadMissionsConfig();
      setConfig(loadedConfig);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load missions');
      console.error('Error loading config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMissionClick = (mission: Mission, networkLabel: string, networkExplorer?: string) => {
    setSelectedMission({ mission, networkLabel, networkExplorer });
  };

  const handleCloseModal = () => {
    setSelectedMission(null);
  };

  const handleSubmission = (submission: MissionSubmission) => {
    console.log('Mission completed:', submission);
    // Legacy handler - actual saving happens in MissionModal via updateProgress
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading missions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="error-state">
          <h2>⚠️ Error Loading Missions</h2>
          <p>{error}</p>
          <button onClick={loadConfig} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="app-container">
        <div className="error-state">
          <h2>No Configuration Found</h2>
          <p>Please check your missions.yaml file.</p>
        </div>
      </div>
    );
  }

  // Sort networks by priority (lower number = higher priority)
  const sortedNetworks = [...config.networks].sort((a, b) => {
    const priorityA = a.priority ?? 999;
    const priorityB = b.priority ?? 999;
    return priorityA - priorityB;
  });

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>🚀 Farming Mission Board</h1>
            <p className="app-description">
              Track and complete farming missions across multiple blockchain networks
            </p>
          </div>
          <div className="sync-status">
            {isSyncing && <span className="sync-indicator">🔄 Syncing...</span>}
            {!isSyncing && pendingSyncs > 0 && (
              <button onClick={manualSync} className="sync-button">
                ⚠️ {pendingSyncs} pending sync{pendingSyncs > 1 ? 's' : ''}
              </button>
            )}
            {!isSyncing && pendingSyncs === 0 && (
              <span className="sync-indicator">✅ Synced</span>
            )}
          </div>
        </div>
        {config.version && (
          <span className="app-version">v{config.version} | User: {userId.slice(0, 12)}...</span>
        )}
      </header>

      <main className="app-main">
        {sortedNetworks.map((network) => (
          <NetworkSection
            key={network.key}
            network={network}
            onMissionClick={handleMissionClick}
            getMissionStatus={getMissionStatus}
            defaultExpanded={true}
          />
        ))}
      </main>

      <footer className="app-footer">
        <p>
          🔥 Hot reload enabled - Edit{' '}
          <code>src/data/missions.yaml</code> to update missions instantly
        </p>
      </footer>

      {selectedMission && (
        <MissionModal
          mission={selectedMission.mission}
          networkLabel={selectedMission.networkLabel}
          networkExplorer={selectedMission.networkExplorer}
          onClose={handleCloseModal}
          onSubmit={handleSubmission}
          onSaveProgress={updateProgress}
          currentProgress={progress.missions[selectedMission.mission.id]}
        />
      )}
    </div>
  );
}

export default App;
