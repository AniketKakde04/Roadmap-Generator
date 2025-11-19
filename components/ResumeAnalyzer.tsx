import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { suggestProjectsFromResume } from '../services/geminiService';
import { AnalysisReport } from '../types';
import Loader from './Loader';
import ArrowUpTrayIcon from './icons/ArrowUpTrayIcon';
import LightBulbIcon from './icons/LightBulbIcon';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@^4.5.136/build/pdf.worker.mjs`;

const MatchScoreGauge = ({ score }: { score: number }) => {
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center w-40 h-40">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                    className="text-background-accent"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                />
                <circle
                    className="text-primary"
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
            <span className="absolute text-3xl font-bold text-text-primary">{score}%</span>
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
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2">
                    Resume Analyzer
                </h1>
                <p className="mt-4 text-lg text-text-secondary">
                    Get an instant, AI-powered analysis of your resume against your target job.
                </p>
            </header>

            <div className="bg-background-secondary border border-border rounded-xl p-6 md:p-8 shadow-sm">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="resume-upload" className="block text-sm font-medium text-text-primary mb-2">
                           1. Upload your resume (PDF only)
                        </label>
                        <div className="mt-2 flex justify-center rounded-lg border-2 border-dashed border-border px-6 py-10 bg-background hover:bg-background-hover transition-colors">
                            <div className="text-center">
                                <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-text-secondary" />
                                <div className="mt-4 flex text-sm leading-6 text-text-secondary">
                                    <label
                                        htmlFor="resume-upload"
                                        className="relative cursor-pointer rounded-md bg-transparent font-semibold text-primary focus-within:outline-none hover:text-secondary p-1 -m-1"
                                    >
                                        <span>Upload a file</span>
                                        <input id="resume-upload" name="resume-upload" type="file" className="sr-only" accept=".pdf" onChange={handleFileChange} disabled={isLoading} />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                {selectedFile ? (
                                    <p className="text-sm text-success mt-2 font-medium">{selectedFile.name}</p>
                                ) : (
                                    <p className="text-xs leading-5 text-text-secondary/70">PDF up to 10MB</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="block text-sm font-medium text-text-primary mb-2">
                           2. Add a target job for tailored suggestions (Optional)
                        </h3>
                        <div className="space-y-4 rounded-lg border border-border bg-background p-4">
                             <div>
                                <label htmlFor="job-title" className="block text-sm font-medium text-text-secondary mb-1">
                                    Target Job Title
                                </label>
                                <input
                                    id="job-title"
                                    type="text"
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    placeholder="e.g., 'Senior Frontend Developer'"
                                    className="w-full bg-background-accent border border-transparent text-text-primary placeholder-text-secondary rounded-md py-2 px-3 focus:bg-background focus:ring-2 focus:ring-primary focus:outline-none transition"
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label htmlFor="job-description" className="block text-sm font-medium text-text-secondary mb-1">
                                    Job Description
                                </label>
                                <textarea
                                    id="job-description"
                                    rows={6}
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="Paste the job description here for more tailored project suggestions..."
                                    className="w-full bg-background-accent border border-transparent text-text-primary placeholder-text-secondary rounded-md py-2 px-3 focus:bg-background focus:ring-2 focus:ring-primary focus:outline-none transition"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>
                     <div>
                        <button
                            onClick={handleAnalyze}
                            disabled={isLoading || !selectedFile}
                            className="w-full sm:w-auto bg-primary text-white font-semibold py-3 px-8 rounded-md hover:bg-secondary disabled:bg-background-accent disabled:text-text-secondary disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-md shadow-primary/20"
                        >
                             {isLoading ? 'Analyzing...' : 'Analyze & Suggest Projects'}
                        </button>
                    </div>
                </div>
                 {error && <p className="text-error mt-4 text-center bg-error/10 p-2 rounded-lg" role="alert">{error}</p>}
            </div>

            {isLoading && <div className="mt-8"><Loader /></div>}

            {analysisReport && (
                <div className="mt-12 animate-fadeInUp">
                     <h2 className="text-3xl font-bold text-center text-text-primary mb-4">
                        Your Analysis Report
                     </h2>
                     <div className="bg-background-secondary border border-border rounded-xl p-8 shadow-sm">
                        {/* Match Score */}
                        <div className="flex flex-col items-center mb-8">
                            <h3 className="text-xl font-semibold text-text-primary mb-2">Resume Match Score</h3>
                            <MatchScoreGauge score={analysisReport.matchScore} />
                            <p className="text-text-secondary mt-2 text-center max-w-md">This score represents the alignment between your resume and the target job description.</p>
                        </div>
                        
                        {/* Strengths vs. Gaps */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="bg-background border border-border p-4 rounded-lg shadow-sm">
                                <h4 className="font-semibold text-success mb-3 text-lg">✅ Your Strengths</h4>
                                <ul className="space-y-2">
                                    {analysisReport.strengths.map((item, i) => <li key={i} className="text-text-secondary">{item}</li>)}
                                </ul>
                            </div>
                             <div className="bg-background border border-border p-4 rounded-lg shadow-sm">
                                <h4 className="font-semibold text-warning mb-3 text-lg">🎯 Key Gaps & Opportunities</h4>
                                <ul className="space-y-2">
                                    {analysisReport.gaps.map((item, i) => <li key={i} className="text-text-secondary">{item}</li>)}
                                </ul>
                            </div>
                        </div>

                        {/* AI Feedback */}
                         <div className="bg-background border border-border p-4 rounded-lg mb-12 shadow-sm">
                            <h4 className="font-semibold text-info mb-3 text-lg">📝 AI Resume Feedback</h4>
                            <ul className="space-y-2 list-disc list-inside">
                                {analysisReport.feedback.map((item, i) => <li key={i} className="text-text-secondary">{item}</li>)}
                            </ul>
                        </div>
                        
                        {/* Project Suggestions */}
                        <div>
                             <h3 className="text-2xl font-bold text-center text-text-primary mb-8">
                                Recommended Projects to Fill Your Gaps
                             </h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {analysisReport.projectSuggestions.map((project, index) => (
                                     <button
                                        key={index}
                                        onClick={() => onProjectSelect(project.title)}
                                        className="bg-background border border-border rounded-xl p-6 text-left hover:border-primary transition-all duration-300 transform hover:-translate-y-1 group flex flex-col shadow-sm hover:shadow-md"
                                        aria-label={`Select project: ${project.title}`}
                                     >
                                        <div className="flex-grow">
                                             <h4 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">{project.title}</h4>
                                             <p className="text-sm text-text-secondary mt-2">{project.description}</p>
                                             <div className="mt-4 pt-4 border-t border-border">
                                                <h5 className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center">
                                                    <LightBulbIcon className="w-4 h-4 mr-2 text-warning" />
                                                    Why this project?
                                                </h5>
                                                <p className="text-sm text-text-secondary mt-1">{project.reasoning}</p>
                                             </div>
                                        </div>
                                         <span className="block mt-4 text-sm font-semibold text-primary group-hover:underline self-start">
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