import React, { useState, useEffect } from 'react';
import { ResumeData } from '../types';

interface EditProfileModalProps {
    initialData: Partial<ResumeData>;
    onClose: () => void;
    onSave: (updatedData: Partial<ResumeData>) => Promise<void>;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ initialData, onClose, onSave }) => {
    const [formData, setFormData] = useState(initialData);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(formData);
        setIsSaving(false);
    };

    return (
        <div 
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
            onClick={onClose}
        >
            <div 
                className="bg-slate-800 border border-slate-700/50 rounded-2xl shadow-xl w-full max-w-lg p-6 relative animate-fadeInUp"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold text-white mb-4">Edit Your Profile</h2>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="text-sm text-slate-400">Full Name</label>
                        <input name="full_name" value={formData.full_name || ''} onChange={handleChange} className="w-full bg-slate-700 p-2 rounded-md mt-1" />
                    </div>
                    <div>
                        <label className="text-sm text-slate-400">Target Job Title</label>
                        <input name="job_title" value={formData.job_title || ''} onChange={handleChange} className="w-full bg-slate-700 p-2 rounded-md mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-slate-400">Email</label>
                            <input name="email" value={formData.email || ''} onChange={handleChange} className="w-full bg-slate-700 p-2 rounded-md mt-1" />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400">Phone</label>
                            <input name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full bg-slate-700 p-2 rounded-md mt-1" />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-sm text-slate-400">LinkedIn URL</label>
                           <input name="linkedin_url" value={formData.linkedin_url || ''} onChange={handleChange} className="w-full bg-slate-700 p-2 rounded-md mt-1" />
                        </div>
                        <div>
                           <label className="text-sm text-slate-400">GitHub URL</label>
                           <input name="github_url" value={formData.github_url || ''} onChange={handleChange} className="w-full bg-slate-700 p-2 rounded-md mt-1" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="text-slate-400 hover:text-white px-4 py-2 rounded-md">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSaving} className="bg-sky-600 text-white font-semibold py-2 px-5 rounded-md hover:bg-sky-500 disabled:bg-slate-600">
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
