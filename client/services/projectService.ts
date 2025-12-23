
import { supabase } from './supabase';
import { StudentProject } from '../types';

export const fetchProjects = async (): Promise<StudentProject[]> => {
    // 1. Fetch Projects
    const { data: projects, error } = await supabase
        .from('student_projects')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching projects:", error);
        throw error;
    }

    if (!projects || projects.length === 0) return [];

    // 2. Fetch Users corresponding to these projects
    const userIds = Array.from(new Set(projects.map((p: any) => p.user_id)));

    // We try to fetch from 'users' table (public profile)
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, name')
        .in('id', userIds);

    if (userError) {
        console.warn("Could not fetch user details, displaying anonymous names.", userError);
    }

    // 3. Map user names to projects
    const userMap = new Map(users?.map((u: any) => [u.id, u.name]) || []);

    return projects.map((item: any) => ({
        ...item,
        user_name: userMap.get(item.user_id) || 'Student'
    }));
};

export const uploadProject = async (project: Omit<StudentProject, 'id' | 'created_at' | 'user_name'>): Promise<StudentProject | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from('student_projects')
        .insert({
            user_id: user.id,
            title: project.title,
            description: project.description,
            project_link: project.project_link,
            github_link: project.github_link,
            linkedin_profile: project.linkedin_profile,
            email: project.email
        } as any)
        .select()
        .single();

    if (error) {
        console.error("Error uploading project:", error);
        throw error;
    }

    return data;
};

export const deleteProject = async (projectId: string): Promise<void> => {
    const { error } = await supabase
        .from('student_projects')
        .delete()
        .eq('id', projectId);

    if (error) {
        console.error("Error deleting project:", error);
        throw error;
    }
};

export const updateProject = async (projectId: string, updates: Partial<StudentProject>): Promise<StudentProject | null> => {
    const { data, error } = await supabase
        .from('student_projects')
        .update({
            title: updates.title,
            description: updates.description,
            project_link: updates.project_link,
            github_link: updates.github_link,
            linkedin_profile: updates.linkedin_profile,
            email: updates.email
        } as any)
        .eq('id', projectId)
        .select()
        .single();

    if (error) {
        console.error("Error updating project:", error);
        throw error;
    }

    return data;
};
