
import { parseXmlResponse, fetchWithTimeout } from '../utils/helpers';

// Simple Event Logger
export const apiLogs = [];
const log = (msg, type = 'info') => {
    const entry = `[${new Date().toLocaleTimeString()}] ${type.toUpperCase()}: ${msg}`;
    console.log(entry);
    apiLogs.unshift(entry);
    if (apiLogs.length > 50) apiLogs.pop();
};

// Huawei HiLink API Implementation
class HuaweiService {
    constructor() {
        this.baseUrl = 'http://192.168.8.1';
        this.token = null;
        this.sessionInfo = null;
    }

    setBaseUrl(url) {
        this.baseUrl = url;
    }

    async getSession() {
        try {
            log(`Checking session at ${this.baseUrl}...`);
            const res = await fetchWithTimeout(`${this.baseUrl}/api/webserver/SesTokInfo`, {
                credentials: 'include'
            });
            const text = await res.text();
            log(`Session response len: ${text.length}`);

            const data = parseXmlResponse(text);
            if (data && data.TokInfo && data.SesInfo) {
                this.token = data.TokInfo;
                this.sessionInfo = data.SesInfo;
                log("Session Data Acquired", "success");
                return true;
            }
            log("Session Data Missing keys", "warn");
            return false;
        } catch (e) {
            log(`Session failed: ${e.message}`, "error");
            return false;
        }
    }

    async getHeaders() {
        // Always refresh token before writing
        await this.getSession();
        return {
            '__RequestVerificationToken': this.token || '',
            // Note: Cookie header is attached automatically by browser via credentials: 'include'
        };
    }

    async getSignalStats() {
        try {
            // 1. Try Detailed Signal
            let headers = await this.getHeaders();
            let res = await fetchWithTimeout(`${this.baseUrl}/api/device/signal`, { headers, credentials: 'include' });

            if (res.ok) {
                const text = await res.text();
                const data = parseXmlResponse(text);
                if (data && (data.rsrp || data.pci || data.cell_id)) {
                    return this.parseSignal(data);
                }
            }

            // 2. Fallback to Monitoring Status (Most common for B310/B312 if 'device/signal' is hidden)
            log("Detailed signal failed, trying monitoring/status...", "info");
            res = await fetchWithTimeout(`${this.baseUrl}/api/monitoring/status`, { headers, credentials: 'include' });
            const text = await res.text();
            const statusData = parseXmlResponse(text);

            if (statusData) {
                return {
                    rsrp: parseFloat(statusData.SignalIcon) ? (parseFloat(statusData.SignalIcon) * -10) : -100, // Crude estimate
                    rsrq: 0,
                    sinr: 0,
                    rssi: parseFloat(statusData.SignalStrength) || 0,
                    cellId: parseInt(statusData.CellId) || 0,
                    band: 'Auto',
                    connected: statusData.ConnectionStatus !== '901'
                };
            }
            return null;

        } catch (e) {
            log(`Signal fetch error: ${e.message}`, "error");
            return null;
        }
    }

    parseSignal(data) {
        return {
            rsrp: parseFloat(data.rsrp) || parseFloat(data.Rsrp) || 0,
            rsrq: parseFloat(data.rsrq) || parseFloat(data.Rsrq) || 0,
            sinr: parseFloat(data.sinr) || parseFloat(data.Sinr) || 0,
            rssi: parseFloat(data.rssi) || parseFloat(data.Rssi) || 0,
            cellId: parseInt(data.cell_id) || parseInt(data.CellId) || 0,
            band: data.band || data.Band || data.lte_band || 'Unknown',
            connected: true
        };
    }

    async getDeviceInfo() {
        try {
            const res = await fetchWithTimeout(`${this.baseUrl}/api/device/information`, {
                credentials: 'include'
            });
            const text = await res.text();
            const data = parseXmlResponse(text);

            return {
                model: data.DeviceName || 'Huawei Device',
                wanIp: data.WanIPAddress || 'Calculating...',
                status: 'Connected'
            };
        } catch (e) {
            return null;
        }
    }

    async getCurrentBands() {
        try {
            const headers = await this.getHeaders();
            const res = await fetchWithTimeout(`${this.baseUrl}/api/net/net-mode`, { headers, credentials: 'include' });
            if (res.ok) {
                const text = await res.text();
                const data = parseXmlResponse(text);
                if (data && data.LTEBand) {
                    const raw = data.LTEBand;
                    // Try to parse Hex if it looks like Hex and no '+'
                    if (!raw.includes('+')) {
                        // Simple reverse check for UI state (basic)
                        // For now, we return empty to not confuse the UI with partial hex decoding
                        // unless we implement full Hex -> Array decoding.
                        log(`Current Band Hex: ${raw}`);
                        return [];
                    }
                    if (raw.includes('+')) {
                        return raw.split('+').map(b => parseInt(b));
                    }
                    return [];
                }
            }
            return [];
        } catch (e) {
            return [];
        }
    }

    // Helper to calculate Hex Mask
    calculateBandMask(bands) {
        let mask = 0n;
        bands.forEach(b => {
            // Huawei Bitshift: Band N corresponds to bit (N-1) usually.
            // B1 = 1 (1<<0)
            if (b > 0) {
                mask |= (1n << BigInt(b - 1));
            }
        });
        return mask.toString(16).toUpperCase();
    }

    async setBands(bands) {
        try {
            const headers = await this.getHeaders();
            let xmlBody = '';

            if (bands.length === 0) {
                // AUTO MODE logic:
                // NetworkMode 00 = Auto (allows 3G/4G/2G switching)
                // NetworkBand 3FFFFFFF = All GSM/UMTS bands
                // LTEBand 7FFFFFFFFFFFFFFF = Explicitly enable ALL LTE bands to force re-scan
                xmlBody = `<?xml version="1.0" encoding="UTF-8"?><request><NetworkMode>00</NetworkMode><NetworkBand>3FFFFFFF</NetworkBand><LTEBand>7FFFFFFFFFFFFFFF</LTEBand></request>`;
                log(`Resetting to Full Auto (Allowed 3G/4G, All Bands)`);
            } else {
                // MANUAL MODE logic:
                // NetworkMode 03 = 4G Only (Locks to LTE)
                const hexMask = this.calculateBandMask(bands);
                xmlBody = `<?xml version="1.0" encoding="UTF-8"?><request><NetworkMode>03</NetworkMode><NetworkBand>3FFFFFFF</NetworkBand><LTEBand>${hexMask}</LTEBand></request>`;
                log(`Setting 4G Lock. Bands: ${bands.join(',')} (Hex: ${hexMask})`);
            }

            const res = await fetchWithTimeout(`${this.baseUrl}/api/net/net-mode`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/xml' },
                credentials: 'include',
                body: xmlBody
            });

            const txt = await res.text();
            if (txt.includes('error') || !res.ok) {
                log(`Router Error: ${txt}`, "error");
                return false;
            }

            return true;
        } catch (e) {
            log(`Band lock exception: ${e.message}`, "error");
            return false;
        }
    }
}

// Simple Manager to handle multiple router types
class RouterManager {
    constructor() {
        this.service = new HuaweiService(); // Default to Huawei for now
        this.isConnected = false;
    }

    async connect(url) {
        if (url) this.service.setBaseUrl(url);
        this.isConnected = await this.service.getSession();
        return this.isConnected;
    }

    async getStats() {
        return await this.service.getSignalStats();
    }

    async getInfo() {
        return await this.service.getDeviceInfo();
    }

    async getBands() {
        return await this.service.getCurrentBands();
    }

    async setBands(bands) {
        return await this.service.setBands(bands);
    }
}

export const routerManager = new RouterManager();
