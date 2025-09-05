import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { suggestProjectsFromResume } from '../services/geminiService';
import { AnalysisReport } from '../types'; // Updated import
import Loader from './Loader';
import ArrowUpTrayIcon from './icons/ArrowUpTrayIcon';
import LightBulbIcon from './icons/LightBulbIcon';

// Configure the worker for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@^4.5.136/build/pdf.worker.mjs`;

// --- NEW: A component for the Match Score Gauge ---
const MatchScoreGauge = ({ score }: { score: number }) => {
    const circumference = 2 * Math.PI * 45; // Circle radius is 45
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center w-40 h-40">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                    className="text-slate-700"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                />
                {/* Progress circle */}
                <circle
                    className="text-sky-400"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                    transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                />
            </svg>
            <span className="absolute text-3xl font-bold text-slate-100">{score}%</span>
        </div>
    );
};


interface ResumeAnalyzerProps {
    onProjectSelect: (projectTitle: string) => void;
}

const ResumeAnalyzer: React.FC<ResumeAnalyzerProps> = ({ onProjectSelect }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [jobTitle, setJobTitle] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    // State now holds the entire analysis report, not just project suggestions
    const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null); 
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
        setAnalysisReport(null);

        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => 'str' in item ? item.str : '').join(' ');
                fullText += pageText + '\n';
            }
            
            if (!fullText.trim()) {
                throw new Error("Could not extract text from the PDF. The file might be image-based or empty.");
            }
            
            // Call the updated service function and set the entire report
            const result = await suggestProjectsFromResume(fullText, jobTitle, jobDescription);
            setAnalysisReport(result);
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
                    Get an instant, AI-powered analysis of your resume against your target job.
                </p>
            </header>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 md:p-8">
                <div className="space-y-6">
                     {/* --- (Input form remains the same) --- */}
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

            {/* --- THIS IS THE NEW UI FOR THE ANALYSIS REPORT --- */}
            {analysisReport && (
                <div className="mt-12 animate-fadeInUp">
                     <h2 className="text-3xl font-bold text-center text-slate-100 mb-4">
                        Your Analysis Report
                     </h2>
                     <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8">
                        {/* Match Score */}
                        <div className="flex flex-col items-center mb-8">
                            <h3 className="text-xl font-semibold text-slate-300 mb-2">Resume Match Score</h3>
                            <MatchScoreGauge score={analysisReport.matchScore} />
                            <p className="text-slate-400 mt-2 text-center max-w-md">This score represents the alignment between your resume and the target job description.</p>
                        </div>
                        
                        {/* Strengths vs. Gaps */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="bg-slate-700/30 p-4 rounded-lg">
                                <h4 className="font-semibold text-green-400 mb-3 text-lg">✅ Your Strengths</h4>
                                <ul className="space-y-2">
                                    {analysisReport.strengths.map((item, i) => <li key={i} className="text-slate-300">{item}</li>)}
                                </ul>
                            </div>
                             <div className="bg-slate-700/30 p-4 rounded-lg">
                                <h4 className="font-semibold text-yellow-400 mb-3 text-lg">🎯 Key Gaps & Opportunities</h4>
                                <ul className="space-y-2">
                                    {analysisReport.gaps.map((item, i) => <li key={i} className="text-slate-300">{item}</li>)}
                                </ul>
                            </div>
                        </div>

                        {/* AI Feedback */}
                         <div className="bg-slate-700/30 p-4 rounded-lg mb-12">
                            <h4 className="font-semibold text-sky-400 mb-3 text-lg">📝 AI Resume Feedback</h4>
                            <ul className="space-y-2 list-disc list-inside">
                                {analysisReport.feedback.map((item, i) => <li key={i} className="text-slate-300">{item}</li>)}
                            </ul>
                        </div>
                        
                        {/* Project Suggestions (at the end) */}
                        <div>
                             <h3 className="text-2xl font-bold text-center text-slate-200 mb-8">
                                Recommended Projects to Fill Your Gaps
                             </h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {analysisReport.projectSuggestions.map((project, index) => (
                                     <button
                                        key={index}
                                        onClick={() => onProjectSelect(project.title)}
                                        className="bg-slate-800 border border-slate-700/50 rounded-xl p-6 text-left hover:bg-slate-700 hover:border-sky-500/50 transition-all duration-300 transform hover:-translate-y-1 group flex flex-col"
                                        aria-label={`Select project: ${project.title}`}
                                     >
                                        <div className="flex-grow">
                                             <h4 className="text-lg font-bold text-slate-100 group-hover:text-sky-400 transition-colors">{project.title}</h4>
                                             <p className="text-sm text-slate-400 mt-2">{project.description}</p>
                                             <div className="mt-4 pt-4 border-t border-slate-700/50">
                                                <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center">
                                                    <LightBulbIcon className="w-4 h-4 mr-2 text-yellow-400" />
                                                    Why this project?
                                                </h5>
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
                     </div>
                </div>
            )}
        </div>
    );
};

export default ResumeAnalyzer;
