
import React from 'react';

const RouterHeader = ({ model, status, wanIp }) => {
    return (
        <div className="glass p-4 rounded-xl mb-4 flex justify-between items-center animate-fade-in" style={{ animationDelay: '0s' }}>
            <div>
                <h1 className="text-xl m-0 leading-tight text-slate-900 tracking-tight"
                    style={{
                        margin: 0
                    }}>
                    {model}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                    <span className={`w-2 h-2 rounded-full ${status === 'Connected' ? 'bg-green-500 shadow-sm' : 'bg-red-500'}`}></span>
                    <span className="text-xs text-muted font-semibold tracking-wide uppercase">{status}</span>
                </div>
            </div>

            <div className="text-right">
                <div className="text-xs text-muted mb-1">WAN IP</div>
                <div className="text-sm font-mono font-semibold opacity-90">{wanIp}</div>
            </div>
        </div>
    );
};

export default RouterHeader;
