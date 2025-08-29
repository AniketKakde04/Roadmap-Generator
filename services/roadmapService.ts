import { supabase } from './supabase';
import { Roadmap, SavedRoadmap } from '../types';

// Fetch all saved roadmaps for the current user
export const getSavedRoadmaps = async (): Promise<SavedRoadmap[]> => {
    const { data, error } = await supabase
        .from('roadmaps')
        .select('*');

    if (error) throw error;
    
    // The data from Supabase needs to be mapped to our SavedRoadmap type
    return data.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        steps: r.steps || [],
        completedSteps: r.completed_steps || [],
        savedAt: r.created_at,
    }));
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
    };

    const { data, error } = await supabase
        .from('roadmaps')
        .insert(newRoadmap)
        .select()
        .single(); // .single() returns a single object instead of an array

    if (error) throw error;

    return {
        id: data.id,
        title: data.title,
        description: data.description,
        steps: data.steps || [],
        completedSteps: data.completed_steps || [],
        savedAt: data.created_at,
    };
};

// Delete a roadmap by its ID
export const deleteRoadmap = async (roadmapId: string): Promise<void> => {
    const { error } = await supabase
        .from('roadmaps')
        .delete()
        .eq('id', roadmapId);
    
    if (error) throw error;
};

// Update the progress of a roadmap
export const updateRoadmapProgress = async (roadmapId: string, completedSteps: number[]): Promise<void> => {
    const { error } = await supabase
        .from('roadmaps')
        .update({ completed_steps: completedSteps })
        .eq('id', roadmapId);
        
    if (error) throw error;
};
