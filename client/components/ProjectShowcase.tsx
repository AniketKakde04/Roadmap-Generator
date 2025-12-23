import React, { useState, useEffect } from 'react';
import { fetchProjects, deleteProject } from '../services/projectService';
import { StudentProject } from '../types';
import ProjectCard from './ProjectCard';
import UploadProjectModal from './UploadProjectModal';
import Loader from './Loader';
import { PlusIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import { supabase } from '../services/supabase';

const ProjectShowcase: React.FC = () => {
    const [projects, setProjects] = useState<StudentProject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [editingProject, setEditingProject] = useState<StudentProject | undefined>(undefined);

    useEffect(() => {
        const loadUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUserId(user?.id || null);
        };
        loadUser();
    }, []);

    useEffect(() => {
        const loadProjects = async () => {
            setIsLoading(true);
            try {
                const data = await fetchProjects();
                setProjects(data);
            } catch (error) {
                console.error("Failed to load projects", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadProjects();
    }, [refreshTrigger]);

    const handleDelete = async (projectId: string) => {
        if (window.confirm("Are you sure you want to delete this project?")) {
            try {
                await deleteProject(projectId);
                setRefreshTrigger(prev => prev + 1);
            } catch (error) {
                alert("Failed to delete project");
            }
        }
    };

    const handleEdit = (project: StudentProject) => {
        setEditingProject(project);
        setShowUploadModal(true);
    };

    const handleCloseModal = () => {
        setShowUploadModal(false);
        setEditingProject(undefined);
    };

    return (
        <div className="w-full max-w-7xl mx-auto py-10 animate-fadeIn px-4 md:px-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-4">
                        Student Showcase
                    </h1>
                    <p className="text-lg text-text-secondary max-w-2xl">
                        Discover amazing projects built by the community. Share your work, get feedback, and connect with fellow learners.
                    </p>
                </div>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Share Project
                </button>
            </header>

            {isLoading ? (
                <Loader />
            ) : projects.length === 0 ? (
                <div className="text-center py-20 bg-background-secondary rounded-3xl border border-border border-dashed">
                    <RocketLaunchIcon className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
                    <h3 className="text-2xl font-bold text-text-primary mb-2">No projects yet</h3>
                    <p className="text-text-secondary mb-6">Be the first to showcase your masterpiece!</p>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="px-8 py-3 rounded-xl bg-background border border-text-secondary/30 text-text-primary font-medium hover:border-primary hover:text-primary transition-all"
                    >
                        Upload Project
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            isOwner={currentUserId === project.user_id}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {showUploadModal && (
                <UploadProjectModal
                    onClose={handleCloseModal}
                    onUploadSuccess={() => {
                        setRefreshTrigger(prev => prev + 1);
                    }}
                    initialData={editingProject}
                />
            )}
        </div>
    );
};

export default ProjectShowcase;
