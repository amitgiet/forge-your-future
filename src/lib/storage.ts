/**
 * AsyncStorage adapter with same key names as web localStorage.
 * Use getItemSync for sync contexts (api interceptor) by reading from in-memory cache after initial load.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'token';

// In-memory cache so api interceptor can read token synchronously after first async load
let tokenCache: string | null = null;

export const storage = {
  async getItem(key: string): Promise<string | null> {
    const value = await AsyncStorage.getItem(key);
    if (key === TOKEN_KEY) tokenCache = value;
    return value;
  },

  getItemSync(key: string): string | null {
    if (key === TOKEN_KEY) return tokenCache;
    return null;
  },

  async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
    if (key === TOKEN_KEY) tokenCache = value;
  },

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
    if (key === TOKEN_KEY) tokenCache = null;
  },
};

export async function loadTokenIntoCache(): Promise<void> {
  tokenCache = await AsyncStorage.getItem(TOKEN_KEY);
}

/** Call on 401 so next request sees no token immediately. */
export function clearTokenCache(): void {
  tokenCache = null;
}
