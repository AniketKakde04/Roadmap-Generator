import React, { useState } from 'react';
import { ResumeData } from '../types';
import XMarkIcon from './icons/XMarkIcon';

interface EditProfileModalProps {
    initialData: ResumeData;
    onClose: () => void;
    onSave: (updatedData: Partial<ResumeData>) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ initialData, onClose, onSave }) => {
    const [formData, setFormData] = useState(initialData);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn">
            <div className="bg-background border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden relative z-[101]">
                <div className="flex justify-between items-center p-4 border-b border-border">
                    <h3 className="text-lg font-bold text-text-primary">Edit Profile</h3>
                    <button 
                        onClick={onClose} 
                        className="text-text-secondary hover:text-text-primary p-1 rounded-full hover:bg-background-hover transition-colors"
                        type="button"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                        <input
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            className="w-full bg-background border border-border text-text-primary rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="Enter your name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Job Title</label>
                        <input
                            name="job_title"
                            value={formData.job_title}
                            onChange={handleChange}
                            className="w-full bg-background border border-border text-text-primary rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="e.g., Software Engineer"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                        <input
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-background border border-border text-text-primary rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="email@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Phone</label>
                        <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full bg-background border border-border text-text-primary rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="+1 234 567 890"
                        />
                    </div>
                    
                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-text-secondary bg-background-secondary hover:bg-background-hover rounded-md transition-colors border border-border"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-secondary rounded-md transition-colors shadow-sm"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;