import React, { useState } from 'react';
import { suggestProjectsFromResume } from '../services/geminiService';
import { AnalysisReport } from '../types';
import Loader from './Loader';
import {
    BriefcaseIcon,
    ArrowUpTrayIcon,
    SparklesIcon,
    CheckCircleIcon,
    XCircleIcon,
    LightBulbIcon,
    ChartBarIcon,
    ArrowPathIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import * as pdfjsLib from 'pdfjs-dist';

// Configure worker locally for this component as well to ensure it works standalone if needed
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs`;

interface ResumeAnalyzerProps {
    onProjectSelect: (projectTitle: string) => void;
}

const ResumeAnalyzer: React.FC<ResumeAnalyzerProps> = ({ onProjectSelect }) => {
    const [step, setStep] = useState<'input' | 'analyzing' | 'results'>('input');
    const [resumeText, setResumeText] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [analysis, setAnalysis] = useState<AnalysisReport | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [isParsing, setIsParsing] = useState(false);

    React.useEffect(() => {
        window.alert("ResumeAnalyzer Mounted - Diagnostic v2");
        console.log("ResumeAnalyzer version 2 active");
    }, []);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        window.alert("handleFileChange event triggered in ResumeAnalyzer!");
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            window.alert(`File selected: ${file.name}, type: ${file.type}`);
            const isPdfMime = file.type === 'application/pdf';
            const isPdfExt = file.name.toLowerCase().endsWith('.pdf');

            if (!isPdfMime && !isPdfExt) {
                setError('Please upload a PDF file.');
                return;
            }

            setFileName(file.name);
            setIsParsing(true);
            setError(null);

            try {
                const arrayBuffer = await file.arrayBuffer();
                console.log("ArrayBuffer created, loading PDF...");
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                console.log(`PDF loaded, pages: ${pdf.numPages}`);
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item: any) => ('str' in item ? item.str : '')).join(' ');
                    fullText += pageText + '\n';
                }

                // --- NEW VALIDATION ---
                const cleanedText = fullText.trim();
                if (cleanedText.length < 50) {
                    // Threshold of 50 chars is arbitrary but safe for a resume. 
                    // Empty or very short text implies parsing failed or it's an image PDF.
                    const msg = 'Could not extract text from this PDF. It might be a scanned image. Please upload a text-based PDF.';
                    setError(msg);
                    window.alert(`Error: ${msg}`);
                    setResumeText(''); // Clear it so they can't proceed with bad data
                    setFileName(null);
                } else {
                    setResumeText(cleanedText);
                    console.log(`Successfully extracted ${cleanedText.length} characters from custom PDF parser.`);
                    window.alert("Resume uploaded and parsed successfully!");
                }
            } catch (err) {
                console.error("PDF Parsing Error:", err);
                const msg = 'Failed to parse PDF. Please try again.';
                setError(msg);
                window.alert(`Error: ${msg}`);
                setFileName(null);
            } finally {
                setIsParsing(false);
            }
        }
    };

    const handleAnalyze = async () => {
        if (!resumeText.trim() || !jobDescription.trim()) {
            setError('Please provide both your resume (PDF) and the job description.');
            return;
        }

        setStep('analyzing');
        setError(null);

        try {
            const result = await suggestProjectsFromResume(resumeText, jobTitle, jobDescription);
            setAnalysis(result);
            setStep('results');
        } catch (err: any) {
            setError(err.message || 'Failed to analyze resume. Please try again.');
            setStep('input');
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-500 border-emerald-500';
        if (score >= 60) return 'text-yellow-500 border-yellow-500';
        return 'text-red-500 border-red-500';
    };

    return (
        <div className="w-full max-w-7xl mx-auto animate-fadeIn pb-12">

            {/* Header */}
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 mb-4">
                    AI Resume Architect
                </h1>
                <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                    Don't let the ATS bot reject you. Optimize your resume against specific job descriptions and get project ideas to fill your gaps.
                </p>
            </div>

            {/* MAIN CONTENT AREA */}
            {step === 'analyzing' ? (
                <div className="flex flex-col items-center justify-center h-96 bg-white/50 backdrop-blur-sm rounded-3xl border border-border">
                    <Loader />
                    <p className="mt-8 text-lg font-medium text-text-primary animate-pulse">
                        Analyzing keyword matches & identifying skill gaps...
                    </p>
                </div>
            ) : step === 'results' && analysis ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeInUp">

                    {/* LEFT COLUMN: SCORE & SUMMARY */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Score Card */}
                        <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                            <h3 className="text-gray-500 font-medium uppercase tracking-wider text-sm mb-6">Match Score</h3>
                            <div className={`relative w-40 h-40 mx-auto rounded-full border-8 flex items-center justify-center mb-4 ${getScoreColor(analysis.matchScore)}`}>
                                <span className="text-5xl font-bold text-slate-800">{analysis.matchScore}%</span>
                            </div>
                            <p className="text-sm text-slate-500">
                                {analysis.matchScore > 80 ? "Excellent match! You're ready to apply." :
                                    analysis.matchScore > 50 ? "Good base, but needs tailoring." :
                                        "Significant gaps found. See recommendations."}
                            </p>
                        </div>

                        {/* Key Stats / Quick Actions */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <ChartBarIcon className="w-5 h-5 text-indigo-500" />
                                Analysis Summary
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                                    <span className="text-slate-500">Strong Skills</span>
                                    <span className="font-bold text-emerald-600">{analysis.strengths.length} found</span>
                                </div>
                                <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                                    <span className="text-slate-500">Missing Skills</span>
                                    <span className="font-bold text-red-500">{analysis.gaps.length} identified</span>
                                </div>
                            </div>
                            <button
                                onClick={() => { setStep('input'); setAnalysis(null); setResumeText(''); setFileName(null); }}
                                className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                            >
                                <ArrowPathIcon className="w-4 h-4" />
                                New Analysis
                            </button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: DETAILED BREAKDOWN */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* 1. Strengths & Gaps Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-2xl">
                                <h3 className="text-lg font-bold text-emerald-800 mb-4 flex items-center gap-2">
                                    <CheckCircleIcon className="w-6 h-6" />
                                    Your Strengths
                                </h3>
                                <ul className="space-y-2">
                                    {analysis.strengths.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-emerald-700">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-red-50/50 border border-red-100 p-6 rounded-2xl">
                                <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                                    <XCircleIcon className="w-6 h-6" />
                                    Missing Skills
                                </h3>
                                <ul className="space-y-2">
                                    {analysis.gaps.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* 2. Detailed Feedback */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <DocumentTextIcon className="w-6 h-6 text-blue-500" />
                                Specific Resume Feedback
                            </h3>
                            <ul className="space-y-4">
                                {analysis.feedback.map((point, i) => (
                                    <li key={i} className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0 text-sm">
                                            {i + 1}
                                        </div>
                                        <p className="text-slate-700 text-sm leading-relaxed">{point}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* 3. Project Suggestions */}
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <LightBulbIcon className="w-6 h-6 text-yellow-500" />
                                Suggested Projects to Fill Gaps
                            </h3>
                            <div className="grid gap-6">
                                {analysis.projectSuggestions.map((project, i) => (
                                    <div key={i} className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group">
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                {project.title}
                                            </h4>
                                            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full uppercase">
                                                Project Idea
                                            </span>
                                        </div>
                                        <p className="text-slate-600 text-sm mb-4">{project.description}</p>
                                        <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-lg mb-4">
                                            <p className="text-xs text-yellow-800 font-medium">
                                                <span className="font-bold">Why this works:</span> {project.reasoning}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => onProjectSelect(project.title)}
                                            className="w-full py-2 bg-white border border-indigo-200 text-indigo-600 rounded-lg font-bold text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <SparklesIcon className="w-4 h-4" />
                                            Generate Roadmap for this Project
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            ) : (
                // --- INPUT FORM STEP ---
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeInUp">

                    {/* Left Column: Job Details */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3 mb-6 text-indigo-600">
                                <div className="p-2 bg-indigo-50 rounded-lg">
                                    <BriefcaseIcon className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">Target Role</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Job Title (Optional)</label>
                                    <input
                                        type="text"
                                        value={jobTitle}
                                        onChange={(e) => setJobTitle(e.target.value)}
                                        placeholder="e.g. Senior React Developer"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Job Description <span className="text-red-500">*</span></label>
                                    <textarea
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        placeholder="Paste the full JD here. The more details, the better the analysis..."
                                        rows={12}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-sm leading-relaxed"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Resume Input */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 h-full flex flex-col justify-center">
                            <div className="flex items-center gap-3 mb-6 text-purple-600">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <DocumentTextIcon className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">Your Resume</h2>
                            </div>

                            <div className="flex-1 flex flex-col justify-center space-y-6">
                                {/* File Upload - Main and Only Input */}
                                <label
                                    className={`relative border-2 border-dashed border-purple-300 rounded-3xl p-12 text-center hover:bg-purple-50 hover:border-purple-500 transition-all cursor-pointer group ${isParsing ? 'opacity-50 cursor-wait' : ''}`}
                                >
                                    <input
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                                        accept=".pdf"
                                        onInput={handleFileChange}
                                        onClick={() => window.alert("Input clicked!")}
                                        disabled={isParsing}
                                    />
                                    <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                        <ArrowUpTrayIcon className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                                        {fileName ? `Selected: ${fileName}` : "Upload Resume PDF"}
                                    </h3>
                                    <p className="text-slate-500 max-w-xs mx-auto">
                                        {isParsing
                                            ? "Extracting text from your document..."
                                            : "Click to browse or drag and drop your file here"}
                                    </p>
                                </label>

                                {fileName && !isParsing && (
                                    <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-center gap-3 text-green-700 animate-fadeIn">
                                        <CheckCircleIcon className="w-5 h-5" />
                                        <span className="font-medium">Resume parsed successfully!</span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleAnalyze}
                                disabled={!resumeText || !jobDescription || isParsing}
                                className="w-full mt-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                            >
                                <SparklesIcon className="w-6 h-6" />
                                {isParsing ? 'Parsing PDF...' : 'Analyze My Chances'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center animate-fadeIn">
                    {error}
                </div>
            )}
        </div>
    );
};

export default ResumeAnalyzer;