import { supabase } from './supabase';
import { ResumeData } from '../types';

// Get the user's resume data
export const getResumeForUser = async (): Promise<ResumeData | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
    }
    return data ? mapToCamelCase(data) : null;
};

// Create a new blank resume for the user
export const createInitialResume = async (): Promise<ResumeData> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const initialData = {
        user_id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || 'Your Name',
        education: [], experience: [], projects: [], skills: []
    };

    const { data, error } = await supabase
        .from('resumes')
        .insert(initialData)
        .select()
        .single();

    if (error) throw error;
    return mapToCamelCase(data);
};

// Update the user's resume
export const updateResume = async (resumeData: Partial<ResumeData>): Promise<ResumeData> => {
     if (!resumeData.id) throw new Error("Resume ID is required for update.");
     
     const snakeCaseData = mapToSnakeCase(resumeData);

     const { data, error } = await supabase
        .from('resumes')
        .update(snakeCaseData)
        .eq('id', resumeData.id)
        .select()
        .single();
    
    if (error) throw error;
    return mapToCamelCase(data);
}


// --- Helper functions to convert between camelCase (JS) and snake_case (DB) ---
const mapToCamelCase = (dbResume: any): ResumeData => ({
    id: dbResume.id,
    user_id: dbResume.user_id,
    fullName: dbResume.full_name,
    email: dbResume.email,
    phone: dbResume.phone,
    linkedin_url: dbResume.linkedin_url,
    github_url: dbResume.github_url,
    summary: dbResume.summary,
    education: dbResume.education || [],
    experience: dbResume.experience || [],
    projects: dbResume.projects || [],
    skills: dbResume.skills || [],
    updated_at: dbResume.updated_at,
});

const mapToSnakeCase = (resume: Partial<ResumeData>): any => ({
    full_name: resume.fullName,
    email: resume.email,
    phone: resume.phone,
    linkedin_url: resume.linkedin_url,
    github_url: resume.github_url,
    summary: resume.summary,
    education: resume.education,
    experience: resume.experience,
    projects: resume.projects,
    skills: resume.skills,
});

