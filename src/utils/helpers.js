
// Basic XML parser for router responses
export const parseXmlResponse = (xmlText) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    const error = xmlDoc.getElementsByTagName("parsererror");
    if (error.length > 0) return null;

    const result = {};

    if (xmlDoc.documentElement) {
        // Simple flat parser for common Hilink responses
        const root = xmlDoc.documentElement;
        for (let i = 0; i < root.childNodes.length; i++) {
            const node = root.childNodes[i];
            if (node.nodeType === 1) { // Element
                result[node.nodeName] = node.textContent;
            }
        }
    }

    return result;
};

// Generic helper for fetching with timeout
export const fetchWithTimeout = async (url, options = {}, timeout = 3000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
};
