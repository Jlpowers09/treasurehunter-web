import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';

export const trpc = createTRPCReact<any>();

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.50.59:3000';

export function createTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${API_URL}/trpc`,
      }),
    ],
  });
}
