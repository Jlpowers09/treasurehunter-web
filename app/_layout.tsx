import { Stack } from 'expo-router';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { trpc, createTRPCClient } from '../lib/trpc';

const tokenCache = {
  async getToken(key: string) {
    try {
      if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
      return await SecureStore.getItemAsync(key);
    } catch { return null; }
  },
  async saveToken(key: string, value: string) {
    try {
      if (typeof localStorage !== 'undefined') { localStorage.setItem(key, value); return; }
      await SecureStore.setItemAsync(key, value);
    } catch {}
  },
};

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => createTRPCClient());
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <QueryClientProvider client={queryClient}>
          <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <Stack screenOptions={{ headerShown: false }} />
          </trpc.Provider>
        </QueryClientProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
