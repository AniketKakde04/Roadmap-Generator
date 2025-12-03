import { supabase } from './supabase';
import { Roadmap, SavedRoadmap } from '../types';

// A helper function to safely parse roadmap data from Supabase
const parseRoadmap = (r: any): SavedRoadmap => ({
    id: r.id,
    title: r.title,
    description: r.description,
    steps: r.steps || [],
    completedSteps: r.completed_steps || [],
    savedAt: r.created_at,
});

// Update an existing roadmap
export const updateRoadmap = async (roadmap: SavedRoadmap): Promise<SavedRoadmap> => {
    const { data, error } = await supabase
        .from('roadmaps')
        .update({
            title: roadmap.title,
            description: roadmap.description,
            steps: roadmap.steps,
        })
        .eq('id', roadmap.id)
        .select()
        .single();
    
    if (error || !data) {
        console.error("Error updating roadmap:", error);
        throw new Error("Failed to update the roadmap.");
    }

    return parseRoadmap(data);
};

// --- (Keep all your other functions: getSavedRoadmaps, saveRoadmap, etc.) ---

// Fetch all saved roadmaps for the current user
export const getSavedRoadmaps = async (): Promise<SavedRoadmap[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('roadmaps')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching roadmaps:", error);
        throw error;
    }
    
    return data.map(parseRoadmap);
};

// Save a new roadmap to the database
export const saveRoadmap = async (roadmap: Roadmap): Promise<SavedRoadmap> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const newRoadmap = {
        user_id: user.id,
        title: roadmap.title,
        description: roadmap.description,
        steps: roadmap.steps,
        completed_steps: [],
    };

    const { data, error } = await supabase
        .from('roadmaps')
        .insert(newRoadmap)
        .select()
        .single();

    if (error || !data) {
        console.error("Error saving roadmap:", error);
        throw new Error("Failed to save the roadmap.");
    }

    return parseRoadmap(data);
};

// Delete a roadmap by its ID
export const deleteRoadmap = async (roadmapId: string): Promise<void> => {
    const { error } = await supabase
        .from('roadmaps')
        .delete()
        .eq('id', roadmapId);
    
    if (error) {
        console.error("Error deleting roadmap:", error);
        throw error;
    }
};

// Update the progress of a roadmap
export const updateRoadmapProgress = async (roadmapId: string, completedSteps: number[]): Promise<void> => {
    const { error } = await supabase
        .from('roadmaps')
        .update({ completed_steps: completedSteps })
        .eq('id', roadmapId);
        
    if (error) {
        console.error("Error updating progress:", error);
        throw error;
    }
};

