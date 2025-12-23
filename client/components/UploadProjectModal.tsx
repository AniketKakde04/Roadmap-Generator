import React, { useState, useEffect } from 'react';
import { uploadProject, updateProject } from '../services/projectService';
import { StudentProject } from '../types';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface UploadProjectModalProps {
    onClose: () => void;
    onUploadSuccess: () => void;
    initialData?: StudentProject; // Added for edit mode
}

const UploadProjectModal: React.FC<UploadProjectModalProps> = ({ onClose, onUploadSuccess, initialData }) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [projectLink, setProjectLink] = useState(initialData?.project_link || '');
    const [githubLink, setGithubLink] = useState(initialData?.github_link || '');
    const [linkedinProfile, setLinkedinProfile] = useState(initialData?.linkedin_profile || '');
    const [email, setEmail] = useState(initialData?.email || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditing = !!initialData;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            if (isEditing && initialData) {
                await updateProject(initialData.id, {
                    title,
                    description,
                    project_link: projectLink || undefined,
                    github_link: githubLink || undefined,
                    linkedin_profile: linkedinProfile || undefined,
                    email: email || undefined
                });
            } else {
                await uploadProject({
                    user_id: '',
                    title,
                    description,
                    project_link: projectLink || undefined,
                    github_link: githubLink || undefined,
                    linkedin_profile: linkedinProfile || undefined,
                    email: email || undefined
                });
            }
            onUploadSuccess();
            onClose();
        } catch (err) {
            setError(`Failed to ${isEditing ? 'update' : 'upload'} project. Please try again.`);
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-background border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn">
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="text-2xl font-bold text-text-primary">{isEditing ? 'Edit Project' : 'Share Your Project'}</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">Project Title *</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-background-secondary border border-border text-text-primary rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                            placeholder="e.g., AI Resume Optimiser"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">Description *</label>
                        <textarea
                            required
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-background-secondary border border-border text-text-primary rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                            placeholder="Describe your project's features, tech stack, and what makes it unique..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Project Link (Demo)</label>
                            <input
                                type="url"
                                value={projectLink}
                                onChange={(e) => setProjectLink(e.target.value)}
                                className="w-full bg-background-secondary border border-border text-text-primary rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                                placeholder="https://..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">GitHub Repository</label>
                            <input
                                type="url"
                                value={githubLink}
                                onChange={(e) => setGithubLink(e.target.value)}
                                className="w-full bg-background-secondary border border-border text-text-primary rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                                placeholder="https://github.com/..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">LinkedIn Profile</label>
                            <input
                                type="url"
                                value={linkedinProfile}
                                onChange={(e) => setLinkedinProfile(e.target.value)}
                                className="w-full bg-background-secondary border border-border text-text-primary rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                                placeholder="https://linkedin.com/in/..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Email (Optional)</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-background-secondary border border-border text-text-primary rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    {error && <p className="text-error text-sm text-center bg-error/10 p-2 rounded-lg">{error}</p>}

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl font-medium text-text-secondary hover:bg-background-hover transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Publish Project')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadProjectModal;
