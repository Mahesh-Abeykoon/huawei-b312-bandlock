
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
        return 'text-orange-500';
    }
    return 'text-slate-700';
};

const SignalCard = ({ label, value, unit, description }) => {
    const numValue = parseFloat(value);
    const colorClass = getQualityColor(label, numValue);

    return (
        <div className="bg-white rounded-lg p-3 border border-slate-200 relative overflow-hidden group hover:bg-slate-50 transition-all shadow-sm">
            <div className="flex justify-between items-start mb-1">
                <span className="text-xs text-muted uppercase tracking-wider font-bold">{label}</span>
                <div className={`w-1.5 h-1.5 rounded-full ${colorClass.replace('text-', 'bg-')}`}></div>
            </div>
            <div className="flex items-baseline gap-1">
                <span className={`text-lg font-bold font-mono ${colorClass}`}>{value}</span>
                <span className="text-xs text-muted font-medium">{unit}</span>
            </div>
            <div className="text-[10px] text-muted opacity-70 mt-1 truncate">{description}</div>

            {/* Background decoration - Made subtle for light mode */}
            <div className={`absolute -right-2 -bottom-4 w-12 h-12 rounded-full blur-xl opacity-5 ${colorClass.replace('text-', 'bg-')}`}></div>
        </div>
    );
};

const ColorBar = ({ value, min, max, label, unit }) => {
    // Normalize value to 0-100 range inside min/max
    const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

    // Determine color based on common LTE thresholds
    let color = 'bg-red-500';
    if (label === 'SINR') {
        if (value >= 20) color = 'bg-green-600'; // Eco/Dark Green
        else if (value >= 10) color = 'bg-green-400'; // Good
        else if (value >= 0) color = 'bg-orange-500';
    } else if (label === 'RSRP') {
        if (value >= -80) color = 'bg-green-600';
        else if (value >= -100) color = 'bg-green-400';
        else if (value >= -115) color = 'bg-orange-500';
    }

    return (
        <div className="mb-3">
            <div className="flex justify-between text-xs mb-1.5 font-medium text-slate-600">
                <span>{label}</span>
                <span className="font-mono">{value} {unit}</span>
            </div>
            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
                <div
                    className={`h-full ${color} transition-all duration-700 ease-out shadow-inner`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>

            {/* Range Indicators */}
            <div className="flex justify-between mt-1 text-[9px] text-slate-400 px-0.5 font-mono">
                <span>Poor</span>
                <span>Fair</span>
                <span>Good</span>
                <span>Excellent</span>
            </div>
        </div>
    );
};

const SignalMonitor = ({ metrics }) => {
    return (
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex justify-between items-center mb-3 px-1">
                <h2 className="text-sm font-semibold text-slate-800">Signal Metrics</h2>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {metrics.band ? `Band ${metrics.band}` : 'No Band'}
                    </span>
                    <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-sm animate-pulse">Live</span>
                </div>
            </div>

            <div className="grid-cols-2 mb-4">
                <SignalCard
                    label="RSRP"
                    value={metrics.rsrp}
                    unit="dBm"
                    description="Signal Power"
                />
                <SignalCard
                    label="SINR"
                    value={metrics.sinr}
                    unit="dB"
                    description="Noise Ratio"
                />
                <SignalCard
                    label="RSRQ"
                    value={metrics.rsrq}
                    unit="dB"
                    description="Signal Quality"
                />
                <SignalCard
                    label="RSSI"
                    value={metrics.rssi}
                    unit="dBm"
                    description="Received Strength"
                />
            </div>

            {/* Visual Signal Bars */}
            <div className="card border-none shadow-sm bg-white p-4">
                <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wide opacity-80">Signal Quality Analysis</h3>

                <ColorBar
                    label="RSRP"
                    value={metrics.rsrp}
                    min={-120}
                    max={-60}
                    unit="dBm"
                />

                <div className="h-px bg-slate-100 my-3"></div>

                <ColorBar
                    label="SINR"
                    value={metrics.sinr}
                    min={-5}
                    max={30}
                    unit="dB"
                />
            </div>
        </div>
    );
};

export default SignalMonitor;
