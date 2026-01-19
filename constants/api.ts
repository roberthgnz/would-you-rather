import Constants from "expo-constants";

const getApiUrl = () => {
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }
    
    // In development, use the Expo host URI
    const debuggerHost = Constants.expoConfig?.hostUri;
    if (debuggerHost) {
        const localhost = debuggerHost.split(":")[0];
        return `http://${localhost}:8081`;
    }

    // Fallback for web or production
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }

    return "https://manzanita.site";
};

export const API_URL = getApiUrl();

export const PUSHER_CONFIG = {
    key: process.env.EXPO_PUBLIC_PUSHER_KEY!,
    cluster: process.env.EXPO_PUBLIC_PUSHER_CLUSTER!,
};
