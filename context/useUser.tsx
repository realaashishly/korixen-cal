import { authClient } from '@/lib/auth-client'

export default function useUser() {
    const { 
        data: session, 
        isPending,
        error 
    } = authClient.useSession();

    return {
        user: session?.user ?? null,
        session: session,
        isLoading: isPending, 
        error
    };
}