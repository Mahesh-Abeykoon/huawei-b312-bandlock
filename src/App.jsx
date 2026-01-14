
import React, { useState, useEffect } from 'react';
import RouterHeader from './components/RouterHeader';
import SignalMonitor from './components/SignalMonitor';
import BandLock from './components/BandLock';
import { routerManager } from './services/routerApi';
// LoginForm is no longer needed

function App() {
  const [routerInfo, setRouterInfo] = useState({
    model: 'Detecting...',
    status: 'Disconnected',
    wanIp: '---'
  });

  const [metrics, setMetrics] = useState({
    rsrp: 0,
    rsrq: 0,
    sinr: 0,
    rssi: 0,
    band: null,
    connected: false
  });

  const [_cellId, _setCellId] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState([]);

  // Sync logs
  useEffect(() => {
    if (showLogs) {
      const i = setInterval(() => {
        import('./services/routerApi').then(m => setLogs([...m.apiLogs]));
      }, 1000);
      return () => clearInterval(i);
    }
  }, [showLogs]);

  // Auto-connect on mount using existing browser session
  useEffect(() => {
    let isMounted = true;

    const autoConnect = async () => {
      // Attempt to reach router and reuse session
      const connected = await routerManager.connect('http://192.168.8.1');

      if (isMounted) {
        if (connected) {
          setIsAuthenticated(true);
          const info = await routerManager.getInfo();
          setRouterInfo(info || { model: 'Huawei Device', status: 'Connected', wanIp: 'Unknown' });
        } else {
          setErrorMsg("Could not detect active router session. Please log in to your router (192.168.8.1) in another tab first.");
        }
      }
    };

    autoConnect();

    return () => { isMounted = false; };
  }, []);

  // Real Data Fetching Loop
  useEffect(() => {
    let isMounted = true;
    let interval;

    if (isAuthenticated) {
      interval = setInterval(async () => {
        if (routerManager.isConnected) {
          const stats = await routerManager.getStats();
          if (stats && isMounted) {
            setMetrics({
              rsrp: stats.rsrp,
              rsrq: stats.rsrq,
              sinr: stats.sinr,
              rssi: stats.rssi,
              band: stats.band, // Pass band info
              connected: stats.connected === undefined ? true : stats.connected
            });
            if (stats.cellId) _setCellId(stats.cellId);
          }
        }
      }, 1000); // 1s refresh rate
    }

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen p-4 pb-8 relative bg-slate-50">

      {!isAuthenticated ? (
        <div className="card shadow-lg bg-white p-8 rounded-xl text-center animate-fade-in mt-10 max-w-sm mx-auto">
          <h2 className="text-lg font-bold text-slate-800 mb-2">No Active Session</h2>
          <p className="text-sm text-muted mb-4 px-4 leading-relaxed">
            {errorMsg || 'Detecting router connection...'}
          </p>
          <button onClick={() => window.open('http://192.168.8.1', '_blank')} className="btn w-full">
            Open Router Login
          </button>
          <button onClick={() => window.location.reload()} className="btn btn-ghost mt-2 w-full">
            Retry Detection
          </button>
        </div>
      ) : (
        <>
          <RouterHeader
            model={routerInfo.model}
            status={routerInfo.status}
            wanIp={routerInfo.wanIp}
          />

          <SignalMonitor metrics={metrics} />

          <BandLock metrics={metrics} />
        </>
      )}

      <div className="mt-8 text-[10px] text-muted opacity-60">
        <div onClick={() => setShowLogs(!showLogs)} className="text-center cursor-pointer hover:text-slate-900 transition-colors">
          <div>Advanced Router Controller v1.0.0</div>
          <div className="mt-1">© Mahesh Abeykoon.</div>
        </div>

        {showLogs && (
          <div className="bg-slate-800 text-slate-200 p-3 rounded overflow-auto h-32 font-mono text-[9px] border border-slate-700 select-all mt-3 shadow-inner">
            {logs.map((L, i) => <div key={i} className={L.includes('ERROR') ? 'text-red-400' : 'text-slate-300'}>{L}</div>)}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
