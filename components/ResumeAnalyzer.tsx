import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { suggestProjectsFromResume } from '../services/geminiService';
import { ProjectSuggestion } from '../types';
import Loader from './Loader';
import ArrowUpTrayIcon from './icons/ArrowUpTrayIcon';
import LightBulbIcon from './icons/LightBulbIcon';

// Configure the worker for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@^4.5.136/build/pdf.worker.mjs`;

interface ResumeAnalyzerProps {
    onProjectSelect: (projectTitle: string) => void;
}

const ResumeAnalyzer: React.FC<ResumeAnalyzerProps> = ({ onProjectSelect }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [jobTitle, setJobTitle] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [suggestions, setSuggestions] = useState<ProjectSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            if (file.type !== 'application/pdf') {
                setError('Please upload a PDF file.');
                setSelectedFile(null);
            } else {
                setSelectedFile(file);
                if (error) setError(null);
            }
        }
    };

    const handleAnalyze = async () => {
        if (!selectedFile) {
            setError('Please select a resume PDF file before analyzing.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setSuggestions([]);

        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                // Check if 'str' property exists before accessing it
                const pageText = textContent.items.map(item => 'str' in item ? item.str : '').join(' ');
                fullText += pageText + '\n';
            }
            
            if (!fullText.trim()) {
                throw new Error("Could not extract text from the PDF. The file might be image-based or empty.");
            }

            const result = await suggestProjectsFromResume(fullText, jobTitle, jobDescription);
            setSuggestions(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred while processing the PDF.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="w-full max-w-5xl mx-auto py-8">
            <header className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-indigo-400 mb-2">
                    Resume Analyzer
                </h1>
                <p className="mt-4 text-lg text-slate-400">
                    Upload your resume and let AI suggest personalized projects to boost your portfolio.
                </p>
            </header>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 md:p-8">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="resume-upload" className="block text-sm font-medium text-slate-300 mb-2">
                           1. Upload your resume (PDF only)
                        </label>
                        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-slate-600 px-6 py-10">
                            <div className="text-center">
                                <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-slate-500" />
                                <div className="mt-4 flex text-sm leading-6 text-slate-400">
                                    <label
                                        htmlFor="resume-upload"
                                        className="relative cursor-pointer rounded-md bg-transparent font-semibold text-sky-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-sky-600 focus-within:ring-offset-2 focus-within:ring-offset-slate-900 hover:text-sky-300 p-1 -m-1"
                                    >
                                        <span>Upload a file</span>
                                        <input id="resume-upload" name="resume-upload" type="file" className="sr-only" accept=".pdf" onChange={handleFileChange} disabled={isLoading} />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                {selectedFile ? (
                                    <p className="text-sm text-slate-300 mt-2">{selectedFile.name}</p>
                                ) : (
                                    <p className="text-xs leading-5 text-slate-500">PDF up to 10MB</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="block text-sm font-medium text-slate-300 mb-2">
                           2. Add a target job for tailored suggestions (Optional)
                        </h3>
                        <div className="space-y-4 rounded-lg border border-slate-600 p-4">
                             <div>
                                <label htmlFor="job-title" className="block text-sm font-medium text-slate-400 mb-1">
                                    Target Job Title
                                </label>
                                <input
                                    id="job-title"
                                    type="text"
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    placeholder="e.g., 'Senior Frontend Developer'"
                                    className="w-full bg-slate-700/50 border border-slate-600 text-slate-200 placeholder-slate-500 rounded-md py-2 px-3 focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label htmlFor="job-description" className="block text-sm font-medium text-slate-400 mb-1">
                                    Job Description
                                </label>
                                <textarea
                                    id="job-description"
                                    rows={6}
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="Paste the job description here for more tailored project suggestions..."
                                    className="w-full bg-slate-700/50 border border-slate-600 text-slate-200 placeholder-slate-500 rounded-md py-2 px-3 focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            onClick={handleAnalyze}
                            disabled={isLoading || !selectedFile}
                            className="w-full sm:w-auto bg-sky-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                        >
                             {isLoading ? 'Analyzing...' : 'Analyze & Suggest Projects'}
                        </button>
                    </div>
                </div>
                 {error && <p className="text-red-400 mt-4 text-center" role="alert">{error}</p>}
            </div>

            {isLoading && <div className="mt-8"><Loader /></div>}

            {suggestions.length > 0 && (
                <div className="mt-12">
                     <h2 className="text-2xl font-bold text-center text-slate-200 mb-8 animate-fadeInUp">
                        Recommended Projects
                     </h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {suggestions.map((project, index) => (
                             <button
                                key={index}
                                onClick={() => onProjectSelect(project.title)}
                                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-left hover:bg-slate-800 hover:border-sky-500/50 transition-all duration-300 transform hover:-translate-y-1 group flex flex-col animate-fadeInUp"
                                style={{ animationDelay: `${index * 150}ms` }}
                                aria-label={`Select project: ${project.title}`}
                             >
                                <div className="flex-grow">
                                     <h3 className="text-lg font-bold text-slate-100 group-hover:text-sky-400 transition-colors">{project.title}</h3>
                                     <p className="text-sm text-slate-400 mt-2">{project.description}</p>
                                     <div className="mt-4 pt-4 border-t border-slate-700/50">
                                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center">
                                            <LightBulbIcon className="w-4 h-4 mr-2 text-yellow-400" />
                                            Why this project?
                                        </h4>
                                        <p className="text-sm text-slate-400 mt-1">{project.reasoning}</p>
                                     </div>
                                </div>
                                 <span className="block mt-4 text-sm font-semibold text-sky-400 group-hover:underline self-start">
                                    Generate Roadmap &rarr;
                                 </span>
                             </button>
                        ))}
                     </div>
                </div>
            )}
        </div>
    );
};

export default ResumeAnalyzer;