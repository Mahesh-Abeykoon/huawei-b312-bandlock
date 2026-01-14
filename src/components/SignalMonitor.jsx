
import React from 'react';

const getQualityColor = (type, value) => {
    // Excellent (Dark Green) -> Good (Green) -> Fair (Orange) -> Poor (Red)
    if (type === 'SINR') {
        if (value >= 25) return 'text-green-700';
        if (value >= 15) return 'text-success';
        if (value >= 5) return 'text-orange-500';
        return 'text-danger';
    }
    if (type === 'RSRP') {
        if (value >= -80) return 'text-green-700';
        if (value >= -95) return 'text-success';
        if (value >= -110) return 'text-orange-500';
        return 'text-danger';
    }
    if (type === 'RSRQ') {
        if (value >= -10) return 'text-green-700';
        if (value >= -15) return 'text-success';
        if (value >= -20) return 'text-orange-500';
        return 'text-danger';
    }
    if (type === 'RSSI') {
        if (value >= -65) return 'text-green-700';
        if (value >= -75) return 'text-success';
        if (value >= -85) return 'text-orange-500';
        return 'text-danger';
    }
    return 'text-slate-700';
};

const SignalCard = ({ label, value, unit, description }) => {
    const numValue = parseFloat(value);
    const colorClass = getQualityColor(label, numValue);

    return (
        <div className="bg-white rounded-lg p-2 border border-slate-200 relative overflow-hidden group hover:bg-slate-50 transition-all shadow-sm text-center">
            <div className="text-[10px] text-muted uppercase tracking-wider font-bold mb-1">{label}</div>
            <div className={`text-lg font-bold font-mono leading-none mb-1 ${colorClass}`}>{value}</div>
            <div className="text-[9px] text-muted opacity-80">{unit}</div>
        </div>
    );
};

const ColorBar = ({ value, min, max, label, unit }) => {
    const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
    const numValue = parseFloat(value);
    let color = 'bg-red-500';

    // Dynamic color based on value, reusing logic
    const textColor = getQualityColor(label, numValue);
    if (textColor.includes('green-700')) color = 'bg-green-600';
    else if (textColor.includes('success')) color = 'bg-green-400';
    else if (textColor.includes('orange')) color = 'bg-orange-500';

    return (
        <div className="mb-2.5">
            <div className="flex justify-between text-[11px] mb-1 font-medium text-slate-600">
                <span>{label}</span>
                <span className="font-mono">{value} {unit}</span>
            </div>
            <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                <div
                    className={`h-full ${color} transition-all duration-700 ease-out shadow-inner`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

const SignalMonitor = ({ metrics }) => {
    return (
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex justify-between items-end mb-4 px-1">
                <div>
                    <div className="text-xs text-muted font-medium mb-1">Current Connection</div>
                    <div className="flex items-baseline gap-2">
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none">
                            {metrics.band ? `BAND ${metrics.band}` : 'NO BAND'}
                        </h1>
                        <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-200 font-bold animate-pulse">
                            LIVE
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
                <SignalCard label="RSRP" value={metrics.rsrp} unit="dBm" description="Power" />
                <SignalCard label="SINR" value={metrics.sinr} unit="dB" description="Noise" />
                <SignalCard label="RSRQ" value={metrics.rsrq} unit="dB" description="Quality" />
                <SignalCard label="RSSI" value={metrics.rssi} unit="dBm" description="Strength" />
            </div>

            {/* Visual Signal Bars */}
            <div className="card border-none shadow-sm bg-white p-4">
                <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wide opacity-80 border-b border-slate-100 pb-2">
                    Detailed Signal Analysis
                </h3>

                <ColorBar label="RSRP" value={metrics.rsrp} min={-125} max={-60} unit="dBm" />
                <ColorBar label="SINR" value={metrics.sinr} min={-10} max={30} unit="dB" />
                <ColorBar label="RSRQ" value={metrics.rsrq} min={-25} max={-5} unit="dB" />
                <ColorBar label="RSSI" value={metrics.rssi} min={-105} max={-55} unit="dBm" />
            </div>
        </div>
    );
};

export default SignalMonitor;
