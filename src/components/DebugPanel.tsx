import React, { useState } from 'react';
import { useProgress } from '../hooks/useProgress';
import './DebugPanel.css';

export const DebugPanel: React.FC = () => {
  const { progress, userId, pendingSyncs, isSyncing } = useProgress();
  const [isOpen, setIsOpen] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  const testSupabaseConnection = async () => {
    setTestResult('Testing...');
    try {
      const response = await fetch('/api/progress?userId=test_connection');
      const data = await response.json();
      setTestResult(`✅ API works! Status: ${response.status}\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setTestResult(`❌ API failed: ${error}`);
    }
  };

  const testSync = async () => {
    setTestResult('Testing sync...');
    try {
      const testProgress = {
        missionId: 'test_mission',
        status: 'completed' as const,
        txHash: '0xTEST123',
        explorerUrl: 'https://test.com',
        notes: 'Debug test',
        completedAt: new Date().toISOString(),
        submissions: [{
          missionId: 'test_mission',
          txHash: '0xTEST123',
          explorerUrl: 'https://test.com',
          notes: 'Test submission',
          timestamp: new Date().toISOString(),
        }],
      };

      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          missionId: 'test_mission',
          progress: testProgress,
        }),
      });

      const data = await response.json();
      setTestResult(`✅ Sync test complete! Status: ${response.status}\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setTestResult(`❌ Sync failed: ${error}`);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="debug-toggle"
        title="Open Debug Panel"
      >
        🐛 Debug
      </button>
    );
  }

  return (
    <div className="debug-panel">
      <div className="debug-header">
        <h3>🐛 Debug Panel</h3>
        <button onClick={() => setIsOpen(false)} className="debug-close">✕</button>
      </div>

      <div className="debug-section">
        <h4>User Info</h4>
        <div className="debug-info">
          <strong>User ID:</strong>
          <code className="selectable">{userId}</code>
          <button
            onClick={() => navigator.clipboard.writeText(userId)}
            className="copy-btn"
          >
            Copy
          </button>
        </div>
      </div>

      <div className="debug-section">
        <h4>Sync Status</h4>
        <div className="debug-info">
          <div>Syncing: {isSyncing ? '🔄 Yes' : '✅ No'}</div>
          <div>Pending Syncs: {pendingSyncs}</div>
        </div>
      </div>

      <div className="debug-section">
        <h4>Local Progress</h4>
        <div className="debug-info">
          <div>Total Missions: {Object.keys(progress.missions).length}</div>
          <div>Last Updated: {new Date(progress.lastUpdated).toLocaleString()}</div>
        </div>
      </div>

      <div className="debug-section">
        <h4>Missions Data</h4>
        <pre className="debug-json">
          {JSON.stringify(progress.missions, null, 2)}
        </pre>
      </div>

      <div className="debug-section">
        <h4>Connection Tests</h4>
        <div className="debug-buttons">
          <button onClick={testSupabaseConnection} className="debug-btn">
            Test API Connection
          </button>
          <button onClick={testSync} className="debug-btn">
            Test Sync to Supabase
          </button>
        </div>
        {testResult && (
          <pre className="test-result">{testResult}</pre>
        )}
      </div>

      <div className="debug-section">
        <h4>Environment Check</h4>
        <div className="debug-info">
          <div>API URL: {window.location.origin}/api/progress</div>
          <div>Hostname: {window.location.hostname}</div>
        </div>
      </div>
    </div>
  );
};
