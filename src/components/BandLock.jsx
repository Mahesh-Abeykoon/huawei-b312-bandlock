
import React, { useState } from 'react';

const COMMON_BANDS = [
    { id: 1, name: 'B1', freq: '2100 MHz' },
    { id: 3, name: 'B3', freq: '1800 MHz' },
    { id: 5, name: 'B5', freq: '850 MHz' },
    { id: 7, name: 'B7', freq: '2600 MHz' },
    { id: 8, name: 'B8', freq: '900 MHz' },
    { id: 20, name: 'B20', freq: '800 MHz' },
    { id: 28, name: 'B28', freq: '700 MHz' },
    { id: 38, name: 'B38', freq: '2600 TDD' },
    { id: 40, name: 'B40', freq: '2300 TDD' },
    { id: 41, name: 'B41', freq: '2500 TDD' },
];

import { routerManager } from '../services/routerApi';

const BandLock = ({ metrics }) => {
    const [selectedBands, setSelectedBands] = useState([]);
    const [isAuto, setIsAuto] = useState(true);
    const [isApplying, setIsApplying] = useState(false);
    const [initLoaded, setInitLoaded] = useState(false);

    // Initial Load
    React.useEffect(() => {
        const loadBands = async () => {
            const current = await routerManager.getBands();
            if (current && current.length > 0) {
                setSelectedBands(current);
                setIsAuto(false);
            } else {
                setIsAuto(true);
                setSelectedBands([]);
            }
            setInitLoaded(true);
        };
        // Only load once we are connected - simple check if routerManager is ready
        if (routerManager.isConnected) loadBands();
    }, []);

    const toggleBand = (id) => {
        if (isAuto) setIsAuto(false); // Switch to manual if clicking bands

        if (selectedBands.includes(id)) {
            setSelectedBands(selectedBands.filter(b => b !== id));
        } else {
            setSelectedBands([...selectedBands, id]);
        }
    };

    const handleSetAuto = () => {
        // Auto selects the current best band (active band)
        const currentBand = metrics?.band;
        if (currentBand && typeof currentBand === 'number') {
            setSelectedBands([currentBand]);
        } else {
            setSelectedBands([]);
        }
        setIsAuto(true);
    };

    const handleApply = async () => {
        setIsApplying(true);

        const bandsToSend = selectedBands;
        const success = await routerManager.setBands(bandsToSend);

        if (success) {
            // Reflect the applied configuration in the UI immediately
            setIsAuto(bandsToSend.length === 0);
            setSelectedBands(bandsToSend);
        } else {
            // Silent fail or log
        }
        setIsApplying(false);
    };

    if (!initLoaded) return <div className="p-4 text-center text-xs text-muted">Loading Band Config...</div>;

    return (
        <div className="card mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-sm font-semibold text-slate-800">Band Locking</h2>
                    <p className="text-xs text-muted">
                        {isAuto ? 'Automatic Selection (Best Signal)' : 'Manual Frequency Lock'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleSetAuto}
                        className={`text-xs px-3 py-1.5 rounded border transition-colors font-medium border-slate-200 ${isAuto ? 'bg-green-500 border-green-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-white'}`}
                    >
                        Auto
                    </button>
                    <button
                        onClick={() => setSelectedBands([])}
                        disabled={isAuto}
                        className="text-xs text-slate-400 hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none px-2 flex items-center h-full disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        Clear
                    </button>
                </div>
            </div>

            <div className={`grid grid-cols-4 mb-4 transition-all duration-300 ${isAuto ? 'opacity-60 grayscale-[0.5]' : 'opacity-100'}`}>
                {COMMON_BANDS.map((band) => {
                    const isSelected = selectedBands.includes(band.id);
                    return (
                        <button
                            key={band.id}
                            onClick={() => toggleBand(band.id)}
                            className={`
                relative p-2 rounded-lg text-center transition-all duration-200 border shadow-sm
                ${isSelected
                                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md ring-1 ring-blue-500/20'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md'}
              `}
                        >
                            <div className="font-bold text-sm">{band.name}</div>
                            <div className="text-[9px] opacity-70 scale-90">{band.freq.split(' ')[0]}</div>

                            {isSelected && (
                                <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-white"></div>
                            )}
                        </button>
                    );
                })}
            </div>

            <button
                className={`w-full btn shadow-lg hover:shadow-xl ${isApplying ? 'opacity-80 cursor-wait' : ''}`}
                onClick={handleApply}
                disabled={isApplying}
            >
                {isApplying ? (
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin"></span>
                        <span>Configuring...</span>
                    </div>
                ) : (
                    isAuto ? 'Apply Automatic Selection' : `Apply Lock (${selectedBands.length} Bands)`
                )}
            </button>
        </div >
    );
};

export default BandLock;
