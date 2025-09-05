import { supabase } from './supabase';
import { ResumeData } from '../types';

// Default state for a new or empty resume
const initialResumeState: ResumeData = {
    full_name: '', job_title: '', email: '', phone: '', linkedin_url: '', github_url: '',
    summary: '', education: [], experience: [], projects: [], skills: []
};

// THIS IS THE NEW FUNCTION THAT WAS MISSING
// It fetches a user's resume data from the database.
export const getResume = async (userId: string): Promise<ResumeData | null> => {
    const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', userId)
        .single();

    // 'PGRST116' is the code for 'No rows found', which is not an error in this case,
    // it just means the user hasn't created a resume yet.
    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching resume:', error);
        throw error;
    }

    if (!data) {
        return null; // No resume found for this user.
    }
    
    // Ensure that array fields are always arrays, even if they are null in the database.
    return {
        ...initialResumeState,
        ...data,
        education: Array.isArray(data.education) ? data.education : [],
        experience: Array.isArray(data.experience) ? data.experience : [],
        projects: Array.isArray(data.projects) ? data.projects : [],
        skills: Array.isArray(data.skills) ? data.skills : [],
    };
};


// Function to save or update (upsert) a resume for a user
export const upsertResume = async (resumeData: Partial<ResumeData>): Promise<ResumeData> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // We use 'upsert' to either create a new resume or update an existing one.
    const { data, error } = await supabase
        .from('resumes')
        .upsert({ ...resumeData, user_id: user.id })
        .select()
        .single();

    if (error) {
        console.error('Error upserting resume:', error);
        throw error;
    }

    return {
        ...initialResumeState,
        ...data,
        education: Array.isArray(data.education) ? data.education : [],
        experience: Array.isArray(data.experience) ? data.experience : [],
        projects: Array.isArray(data.projects) ? data.projects : [],
        skills: Array.isArray(data.skills) ? data.skills : [],
    };
};

