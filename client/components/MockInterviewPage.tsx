import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import ArrowUpTrayIcon from './icons/ArrowUpTrayIcon';
import MicrophoneIcon from './icons/MicrophoneIcon';
import StopIcon from './icons/StopIcon';
import UserIcon from './icons/UserIcon';
import InterviewerLogo from './icons/InterviewerLogo';
import Loader from './Loader';
import { ChatMessage, InterviewFeedback } from '../types';
import {
  startInterview,
  continueInterview,
  getInterviewFeedback,
  getAIAudio,
} from '../services/geminiService';
import ArrowPathIcon from './icons/ArrowPathIcon';
import HandThumbUpIcon from './icons/HandThumbUpIcon';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';
import FeedbackModal from './FeedbackModal';
import { checkTrialUsed, recordTrialUsage } from '../services/trialService';
import { User } from '../types';

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs`;

type InterviewStage = 'setup' | 'interviewing' | 'feedback';

// @ts-ignore
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
let recognition: SpeechRecognition | null = null;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
}

interface MockInterviewPageProps {
  user: User | null;
}

const MockInterviewPage: React.FC<MockInterviewPageProps> = ({ user }) => {
  const [stage, setStage] = useState<InterviewStage>('setup');
  const [jobTitle, setJobTitle] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAILoading, setIsAILoading] = useState<boolean>(false);
  const [isUserListening, setIsUserListening] = useState<boolean>(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [recordingStart, setRecordingStart] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState<string>('00:00');
  const timerRef = useRef<number | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isTrialUsed, setIsTrialUsed] = useState(false);
  const [isCheckingTrial, setIsCheckingTrial] = useState(true);

  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        URL.revokeObjectURL(currentAudio.src);
      }
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [currentAudio]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    const fetchTrialStatus = async () => {
      if (user) {
        setIsCheckingTrial(true);
        const used = await checkTrialUsed(user.id, 'mock_interview');
        setIsTrialUsed(used);
        setIsCheckingTrial(false);
      } else {
        setIsCheckingTrial(false);
      }
    };
    fetchTrialStatus();
  }, [user]);

  const startTimer = () => {
    setRecordingStart(Date.now());
    setElapsed('00:00');
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      if (!recordingStart) return;
      const diff = Date.now() - recordingStart;
      const secs = Math.floor(diff / 1000);
      const mm = String(Math.floor(secs / 60)).padStart(2, '0');
      const ss = String(secs % 60).padStart(2, '0');
      setElapsed(`${mm}:${ss}`);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecordingStart(null);
    setElapsed('00:00');
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const isPdfMime = file.type === 'application/pdf';
      const isPdfExt = file.name.toLowerCase().endsWith('.pdf');

      if (!isPdfMime && !isPdfExt) {
        setError('Please upload a PDF file.');
        setResumeFile(null);
        setResumeText('');
      } else {
        setResumeFile(file);
        setError(null);
        setIsParsing(true);
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
          if (!fullText.trim()) throw new Error('Could not extract text from PDF.');
          setResumeText(fullText);
          console.log("PDF parsed successfully");
          window.alert("Resume uploaded and parsed successfully!");
        } catch (err) {
          console.error("PDF Parsing Error:", err);
          const msg = err instanceof Error ? err.message : 'Failed to parse PDF.';
          setError(msg);
          window.alert(`Error: ${msg}`);
          setResumeText('');
          setResumeFile(null);
        } finally {
          setIsParsing(false);
        }
      }
    }
  };

  const playAIAudio = async (text: string) => {
    if (currentAudio) {
      currentAudio.pause();
      URL.revokeObjectURL(currentAudio.src);
      setCurrentAudio(null);
    }

    try {
      const audioUrl = await getAIAudio(text);
      const audio = new Audio(audioUrl);
      audio.muted = isMuted;
      setCurrentAudio(audio);
      setIsAILoading(true);
      await audio.play();
      audio.onended = () => {
        setIsAILoading(false);
      };
    } catch (err) {
      setError('Failed to play AI audio.');
      setIsAILoading(false);
    }
  };

  const handleUserResponse = async (userText: string) => {
    if (!userText.trim()) return;
    setIsAILoading(true);
    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', text: userText }];
    setChatHistory(newHistory);

    try {
      const aiResponseText = await continueInterview(newHistory, resumeText, jobTitle);
      setChatHistory(prev => [...prev, { role: 'model', text: aiResponseText }]);
      await playAIAudio(aiResponseText);

      // Automatic transition to feedback if AI says it's done
      if (aiResponseText.toLowerCase().includes('compiling your feedback')) {
        setTimeout(() => {
          handleGetFeedback();
        }, 2000); // Give user a moment to hear/read the end message
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI failed to respond.');
      setIsAILoading(false);
    }
  };

  const startListening = () => {
    if (!recognition || isAILoading || isUserListening) return;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleUserResponse(transcript);
    };
    recognition.onstart = () => {
      setIsUserListening(true);
      startTimer();
    };
    recognition.onend = () => {
      setIsUserListening(false);
      stopTimer();
    };
    recognition.onerror = (event: any) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsUserListening(false);
      stopTimer();
    };
    recognition.start();
  };

  const stopListening = () => {
    if (!recognition || !isUserListening) return;
    recognition.stop();
    setIsUserListening(false);
    stopTimer();
  };

  const handleStartInterview = async () => {
    if (!resumeText) {
      setError('Please upload your resume first.');
      return;
    }
    if (!jobTitle) {
      setError('Please enter a job title.');
      return;
    }

    setError(null);
    if (isTrialUsed) {
      setError("You have already used your one-time mock interview trial.");
      return;
    }

    setIsStarting(true);

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!recognition) throw new Error('Speech recognition is not supported by your browser.');

      const firstQuestion = await startInterview(resumeText, jobTitle, jobDescription);
      setChatHistory([{ role: 'model', text: firstQuestion }]);
      setStage('interviewing');
      await playAIAudio(firstQuestion);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('Microphone permission is required to start the interview.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to start interview.');
      }
    } finally {
      setIsStarting(false);
    }
  };

  const handleGetFeedback = async () => {
    setIsAILoading(true);
    setError(null);
    try {
      const feedbackReport = await getInterviewFeedback(chatHistory, jobTitle, resumeText);
      setFeedback(feedbackReport);
      setStage('feedback');

      // Record trial usage when feedback is generated
      if (user) {
        await recordTrialUsage(user.id, 'mock_interview');
        setIsTrialUsed(true);
      }

      // Show feedback modal after a short delay
      setTimeout(() => setShowFeedbackModal(true), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate feedback.');
    } finally {
      setIsAILoading(false);
    }
  };

  const handleManualEnd = () => {
    if (currentAudio) {
      currentAudio.pause();
      URL.revokeObjectURL(currentAudio.src);
      setCurrentAudio(null);
    }
    if (recognition && isUserListening) {
      recognition.stop();
      setIsUserListening(false);
    }
    stopTimer();
    setIsAILoading(false);
    handleGetFeedback();
  };

  const handleRestart = () => {
    setChatHistory([]);
    setFeedback(null);
    setError(null);
    setJobTitle('');
    setJobDescription('');
    setResumeFile(null);
    setResumeText('');
    setStage('setup');
    stopTimer();
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(m => {
      const next = !m;
      if (currentAudio) currentAudio.muted = next;
      return next;
    });
  };

  const renderContent = () => {
    if (isCheckingTrial) {
      return (
        <div className="w-full min-h-[400px] flex flex-col items-center justify-center space-y-4">
          <Loader />
          <p className="text-text-secondary animate-pulse">Checking your trial status...</p>
        </div>
      );
    }

    if (isTrialUsed && stage === 'setup') {
      return (
        <div className="w-full max-w-2xl mx-auto mt-12 p-8 bg-background-secondary rounded-2xl border border-border text-center shadow-xl animate-fadeIn">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-text-primary mb-4">Trial Limit Reached</h2>
          <p className="text-text-secondary text-lg mb-8">
            You have already used your one-time mock interview trial.
            Right now we are testing this feature
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">

            <button
              onClick={() => (window as any).location.href = '/profile'}
              className="px-8 py-3 bg-background-accent text-text-primary font-bold rounded-xl border border-border hover:bg-background-hover transition-all"
            >
              Go to My Profile
            </button>
          </div>
        </div>
      );
    }

    if (isStarting) return <Loader />;

    const canStart = !isParsing && !!resumeFile && jobTitle.trim().length > 0;

    switch (stage) {
      case 'setup':
        return (
          <div className="w-full max-w-2xl mx-auto p-8 bg-background-secondary border border-border rounded-xl shadow-lg animate-fadeIn">
            <div className="flex items-center mb-6">
              <InterviewerLogo className="w-10 h-10 text-primary mr-3" />
              <h1 className="text-3xl font-bold text-text-primary">AI Mock Interview</h1>
            </div>
            <p className="text-text-secondary mb-6">
              Upload resume, set role, and run a live mock interview — speak using your mic and receive AI feedback.
            </p>
            <div className="space-y-6">
              <div>
                <label htmlFor="resume-upload" className="block text-sm font-medium text-text-secondary mb-2">
                  1. Upload Your Resume (PDF)
                </label>
                <label
                  htmlFor="resume-upload"
                  className={`relative cursor-pointer flex justify-center w-full rounded-lg border-2 border-dashed ${error ? 'border-error' : 'border-border'
                    } px-6 py-10 hover:border-primary transition-colors bg-background`}
                >
                  <div className="text-center">
                    <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-text-secondary" />
                    <span className={`mt-2 block text-sm font-semibold ${resumeFile ? 'text-success' : 'text-primary'}`}>
                      {resumeFile ? `✓ ${resumeFile.name} (Uploaded)` : 'Click to upload a file'}
                    </span>
                    <span className="block text-xs text-text-secondary">{isParsing ? 'Parsing PDF...' : '(PDF only)'}</span>
                    <input
                      id="resume-upload"
                      name="resume-upload"
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept=".pdf"
                      onChange={handleFileChange}
                      disabled={isParsing}
                    />
                  </div>
                </label>
              </div>
              <div>
                <label htmlFor="job-title" className="block text-sm font-medium text-text-secondary mb-2">
                  2. Job Title You're Interviewing For
                </label>
                <input
                  id="job-title"
                  type="text"
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  placeholder="e.g., 'Senior Frontend Developer'"
                  className="w-full bg-background border border-border text-text-primary placeholder-text-secondary rounded-md py-3 px-4 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label htmlFor="job-description" className="block text-sm font-medium text-text-secondary mb-2">
                  3. Job Description (Optional)
                </label>
                <textarea
                  id="job-description"
                  rows={5}
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  placeholder="Paste job description..."
                  className="w-full bg-background border border-border text-text-primary placeholder-text-secondary rounded-md py-3 px-4 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              {error && <p className="text-error text-center">{error}</p>}
              <button
                onClick={handleStartInterview}
                disabled={!canStart}
                className="w-full bg-primary text-white font-semibold py-3 px-6 rounded-md hover:bg-secondary transition-all shadow-lg disabled:bg-background-accent disabled:text-text-secondary"
              >
                Start Interview
              </button>
            </div>
          </div>
        );

      case 'interviewing': {
        return (
          <div
            className="w-full max-w-5xl mx-auto p-4 md:p-8 bg-background-secondary border border-border rounded-xl shadow-lg animate-fadeIn flex flex-col"
            style={{ height: 'calc(100vh - 6rem)' }}
          >
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 overflow-hidden">
              {/* Left: Interviewer */}
              <div className="flex flex-col bg-background rounded-lg border border-border p-6 items-center justify-center shadow-sm">
                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 drop-shadow-lg">
                  <InterviewerLogo className="w-20 h-20 text-white" />
                </div>
                <div className="text-text-primary font-semibold">Interviewer</div>
                <div className="text-text-secondary text-sm mt-1">AI Hiring Manager</div>
                <div className="mt-4 text-center text-text-secondary text-sm max-w-xs">The AI will ask role-focused questions. Speak when the mic is active.</div>
              </div>

              {/* Right: Student / Chat */}
              <div className="flex flex-col bg-background rounded-lg border border-border p-4 overflow-hidden shadow-sm">
                <div className="flex items-center gap-3 mb-3 border-b border-border pb-2">
                  <div className="w-10 h-10 rounded-full bg-background-accent flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-text-primary" />
                  </div>
                  <div>
                    <div className="text-text-primary font-semibold">You</div>
                    <div className="text-text-secondary text-xs">{jobTitle || 'Candidate'}</div>
                  </div>
                </div>

                <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 p-2">
                  {chatHistory.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role !== 'user' && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-3 shadow-sm">
                          <InterviewerLogo className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className={`p-3 rounded-lg max-w-[70%] shadow-sm ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-background-accent text-text-primary'}`}>
                        <p className="text-sm">{msg.text}</p>
                      </div>
                      {msg.role === 'user' && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-background-accent flex items-center justify-center ml-3 shadow-sm">
                          <UserIcon className="w-4 h-4 text-text-primary" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isAILoading && (
                    <div className="flex justify-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-3 shadow-sm">
                        <InterviewerLogo className="w-5 h-5 text-white" />
                      </div>
                      <div className="p-3 rounded-lg bg-background-accent text-text-primary">
                        <Loader />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* status & small hint */}
            <div className="text-text-secondary text-sm mb-2 text-center">Tip: Press the mic to speak. Use the floating toolbar for controls.</div>
            {error && <div className="text-error text-center mt-3 bg-error/10 p-2 rounded">{error}</div>}
          </div>
        );
      }

      case 'feedback':
        if (isAILoading || !feedback) {
          return (
            <div className="w-full max-w-2xl mx-auto p-8 bg-background-secondary border border-border rounded-xl shadow-lg animate-fadeIn flex flex-col items-center">
              <h2 className="text-2xl font-bold text-text-primary mb-4">Analyzing your interview...</h2>
              <p className="text-text-secondary mb-6">Your AI coach is compiling your feedback report.</p>
              <Loader />
            </div>
          );
        }

        return (
          <div className="w-full max-w-3xl mx-auto p-8 bg-background-secondary border border-border rounded-xl shadow-lg animate-fadeIn">
            <h1 className="text-3xl font-bold text-text-primary mb-4">Interview Feedback Report</h1>
            <p className="text-text-secondary mb-6">Here's the analysis of your performance for the "{jobTitle}" role.</p>

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-info mb-3">Overall Feedback</h2>
                <div className="p-4 bg-background border border-border rounded-lg shadow-sm">
                  <p className="text-text-secondary leading-relaxed">{feedback.overall_feedback}</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-success mb-3">Strengths</h2>
                <ul className="space-y-2">
                  {(feedback.strengths || []).map((strength, index) => (
                    <li key={index} className="flex items-start p-3 bg-background border border-border rounded-lg shadow-sm">
                      <HandThumbUpIcon className="w-5 h-5 text-success mr-3 flex-shrink-0 mt-1" />
                      <span className="text-text-secondary">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-warning mb-3">Areas for Improvement</h2>
                <ul className="space-y-2">
                  {(feedback.areas_for_improvement || []).map((area, index) => (
                    <li key={index} className="flex items-start p-3 bg-background border border-border rounded-lg shadow-sm">
                      <ExclamationTriangleIcon className="w-5 h-5 text-warning mr-3 flex-shrink-0 mt-1" />
                      <span className="text-text-secondary">{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {error && <p className="text-error text-center mt-6 bg-error/10 p-2 rounded">{error}</p>}

            <button
              onClick={handleRestart}
              className="w-full bg-primary text-white font-semibold py-3 px-6 rounded-md hover:bg-secondary transition-all shadow-lg shadow-primary/30 mt-8 flex items-center justify-center"
            >
              <ArrowPathIcon className="w-5 h-5 mr-2" />
              Start a New Interview
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center p-4">
      {renderContent()}

      {/* Floating central toolbar (Google Meet style) */}
      {stage === 'interviewing' && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-full px-4 py-3 flex items-center gap-4 shadow-xl">
            {/* Recording indicator */}
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isUserListening ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-sm text-slate-200 font-medium">{isUserListening ? elapsed : '00:00'}</span>
            </div>

            {/* Mic button */}
            {!isUserListening ? (
              <button
                onClick={startListening}
                disabled={isAILoading || !recognition}
                className="w-12 h-12 bg-sky-600 rounded-full flex items-center justify-center shadow hover:bg-sky-500 disabled:bg-slate-600 transition-colors"
                aria-label="Start speaking"
              >
                <MicrophoneIcon className="w-6 h-6 text-white" />
              </button>
            ) : (
              <button
                onClick={stopListening}
                className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow hover:bg-red-500 transition-colors"
                aria-label="Stop speaking"
              >
                <StopIcon className="w-6 h-6 text-white" />
              </button>
            )}

            {/* Mute toggle */}
            <button
              onClick={toggleMute}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-slate-700' : 'bg-slate-800 hover:bg-slate-700'}`}
              aria-pressed={isMuted}
              aria-label="Mute AI audio"
            >
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                {isMuted ? (
                  <path d="M19 9v6a3 3 0 01-3 3H9l-4 4V5l4 4h7a3 3 0 013 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <path d="M11 5L6 9H3v6h3l5 4V5zM19 12a4 4 0 00-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                )}
              </svg>
            </button>

            {/* End & feedback */}
            <button
              onClick={handleManualEnd}
              disabled={isAILoading}
              className="ml-2 bg-red-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-red-500 disabled:bg-slate-600 transition-colors"
            >
              End & Feedback
            </button>
          </div>
        </div>
      )}
      {showFeedbackModal && (
        <FeedbackModal
          onClose={() => setShowFeedbackModal(false)}
          currentUserId={user?.id}
        />
      )}
    </div>
  );
};

export default MockInterviewPage;