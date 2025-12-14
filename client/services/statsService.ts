import { supabase } from './supabase';

export interface PlatformStats {
    users: number;
    roadmaps: number;
    resumes: number;
}

export const getPlatformStats = async (): Promise<PlatformStats> => {
    try {
        // Run these in parallel for better performance
        const [usersCount, roadmapsCount, resumesCount] = await Promise.all([
            // 1. Count Users (using the public 'users' table which mirrors auth.users usually, or just check 'roadmaps' unique user_ids if access is restricted, but let's try 'users' table first as defined in types)
            supabase.from('users').select('*', { count: 'exact', head: true }),

            // 2. Count Roadmaps
            supabase.from('roadmaps').select('*', { count: 'exact', head: true }),

            // 3. Count Resumes
            supabase.from('resumes').select('*', { count: 'exact', head: true })
        ]);

        return {
            users: usersCount.count || 0,
            roadmaps: roadmapsCount.count || 0,
            resumes: resumesCount.count || 0
        };
    } catch (error) {
        console.error("Error fetching platform stats:", error);
        // Return 0s if fetch fails
        return {
            users: 0,
            roadmaps: 0,
            resumes: 0
        };
    }
};
