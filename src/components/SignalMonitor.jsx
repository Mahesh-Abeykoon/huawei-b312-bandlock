
import React from 'react';

const getQualityColor = (type, value) => {
    // Excellent (Dark Green) -> Good (Green) -> Fair (Orange) -> Poor (Red)
    if (type === 'SINR') {
        if (value >= 20) return 'text-green-700';
        if (value >= 13) return 'text-success';
        if (value >= 5) return 'text-orange-500';
        return 'text-danger';
    }
    if (type === 'RSRP') {
        if (value >= -80) return 'text-green-700';
        if (value >= -90) return 'text-success';
        if (value >= -100) return 'text-orange-500';
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

const getQualityLabel = (type, value) => {
    const numValue = parseFloat(value);
    // Provide a short textual label - CORRECTED RANGES
    if (type === 'SINR') {
        if (numValue >= 20) return 'Excellent';
        if (numValue >= 13) return 'Good';
        if (numValue >= 0) return 'Fair';
        return 'Poor';
    }
    if (type === 'RSRP') {
        if (numValue >= -80) return 'Excellent';
        if (numValue >= -90) return 'Good';
        if (numValue >= -100) return 'Fair';
        return 'Poor';
    }
    if (type === 'RSRQ') {
        if (numValue >= -10) return 'Excellent';
        if (numValue >= -15) return 'Good';
        if (numValue >= -20) return 'Fair';
        return 'Poor';
    }
    if (type === 'RSSI') {
        if (numValue >= -65) return 'Excellent';
        if (numValue >= -75) return 'Good';
        if (numValue >= -85) return 'Fair';
        return 'Poor';
    }
    return '';
};

const SignalCard = ({ label, value, unit }) => {
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

    // Dynamic color based on quality for the bars
    const textColor = getQualityColor(label, numValue);
    let barColor = 'bg-red-500'; // Poor

    if (textColor.includes('orange')) barColor = 'bg-orange-500'; // Fair
    else if (textColor.includes('success')) barColor = 'bg-green-400'; // Good
    else if (textColor.includes('green-700')) barColor = 'bg-green-300'; // Excellent

    const centerLabel = getQualityLabel(label, numValue);

    // Number of bars to light up (out of 4)
    const barsLit = Math.ceil((percentage / 100) * 4);

    return (
        <div className="mb-3">
            <div className="flex justify-start gap-2 text-[10px] mb-1.5 font-medium text-slate-600">
                <span>{label}</span>
                <span className="font-mono">{value} {unit}</span>
            </div>

            <div className="flex items-center gap-3">
                {/* Signal strength bars */}
                <div className="flex items-end gap-0.5 h-5 pr-2">
                    {[1, 2, 3, 4].map((bar) => (
                        <div
                            key={bar}
                            className={`w-3 transition-all duration-700 ease-out rounded-sm ${
                                bar <= barsLit ? barColor : 'bg-gray-300'
                            }`}
                            style={{ height: `${bar * 5}px` }}
                        ></div>
                    ))}
                </div>

                {/* Quality label */}
                <span className="text-[10px] font-semibold text-slate-700">{centerLabel}</span>
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
                                <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                                    {metrics.band ? `BAND ${metrics.band}` : 'NO BAND'}
                                </h1>
                                {/* Show LIVE with blinking green dot */}
                                {metrics.connected ? (
                                    <span className="flex items-center gap-1 text-[10px] text-green-600 font-bold">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        LIVE
                                    </span>
                                ) : (
                                    <span className="text-xs text-muted bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                                        OFFLINE
                                    </span>
                                )}
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
