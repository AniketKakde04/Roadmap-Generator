import { StudentProject } from '../types';
import { PencilIcon, TrashIcon, LinkIcon } from '@heroicons/react/24/outline';

// You might need to add GitHub and LinkedIn icons if they don't exist, 
// or use generic ones. For now, using text/generic.
// Let's assume you have or can mock these icons easily.

interface ProjectCardProps {
    project: StudentProject;
    isOwner: boolean;
    onEdit: (project: StudentProject) => void;
    onDelete: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, isOwner, onEdit, onDelete }) => {
    return (
        <div className="bg-background-secondary border border-border rounded-xl p-6 flex flex-col h-full hover:shadow-lg transition-all duration-300 relative group">
            {isOwner && (
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 bg-background-secondary/80 backdrop-blur-sm p-1 rounded-lg">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(project); }}
                        className="p-1.5 rounded-md text-text-secondary hover:text-white hover:bg-primary transition-colors"
                        title="Edit Project"
                    >
                        <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
                        className="p-1.5 rounded-md text-text-secondary hover:text-white hover:bg-error transition-colors"
                        title="Delete Project"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            )}
            <div className="flex justify-between items-start mb-4 pr-10">
                <div>
                    <h3 className="text-xl font-bold text-text-primary mb-1">{project.title}</h3>
                    <p className="text-sm text-text-secondary">by <span className="font-semibold text-primary">{project.user_name || 'Student'}</span></p>
                </div>

            </div>

            <p className="text-text-secondary mb-6 line-clamp-3 leading-relaxed flex-grow">
                {project.description}
            </p>

            <div className="flex flex-wrap gap-3 mt-auto pt-4 border-t border-border">
                {project.project_link && (
                    <a
                        href={project.project_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                        <LinkIcon className="w-4 h-4 mr-1.5" />
                        Live Demo
                    </a>
                )}
                {project.github_link && (
                    <a
                        href={project.github_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                    >
                        {/* Simple GitHub Icon SVG */}
                        <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                        Code
                    </a>
                )}
                {project.linkedin_profile && (
                    <a
                        href={project.linkedin_profile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors ml-auto"
                    >
                        {/* Simple LinkedIn Icon SVG */}
                        <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 21.227.792 22 1.771 22h20.451C23.2 22 24 21.227 24 20.542V1.729C24 .774 23.2 0 22.224 0z" />
                        </svg>
                        Connect
                    </a>
                )}
            </div>
        </div>
    );
};

export default ProjectCard;
