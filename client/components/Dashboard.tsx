import React from 'react';
import {
  MapIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

interface DashboardProps {
  userName: string;
  onNavigate: (view: string) => void;
  stats: {
    roadmaps: number;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ userName, onNavigate, stats }) => {
  const tools = [
    {
      id: 'roadmapGenerator',
      tourId: 'tour-roadmap-card',
      title: 'Roadmap Generator',
      description: 'Create personalized learning paths for any topic or job role.',
      icon: <MapIcon className="w-8 h-8" />,
      color: 'bg-blue-500',
      hover: 'hover:bg-blue-600',
      hover: 'hover:bg-blue-600'
    },
    {
      id: 'resume',
      tourId: 'tour-resume-card',
      title: 'Resume Analyzer',
      description: 'Analyze your resume against job descriptions to find gaps.',
      icon: <DocumentTextIcon className="w-8 h-8" />,
      color: 'bg-indigo-500',
      hover: 'hover:bg-indigo-600'
    },
    {
      id: 'resumeBuilder',
      tourId: 'tour-builder-card',
      title: 'Resume Builder',
      description: 'Build a professional, ATS-friendly resume from scratch.',
      icon: <BriefcaseIcon className="w-8 h-8" />,
      color: 'bg-purple-500',
      hover: 'hover:bg-purple-600'
    },
    {
      id: 'mockInterview',
      tourId: 'tour-interview-card',
      title: 'AI Mock Interview',
      description: 'Practice voice-based technical interviews with AI feedback.',
      icon: <ChatBubbleLeftRightIcon className="w-8 h-8" />,
      color: 'bg-pink-500',
      hover: 'hover:bg-pink-600',
      disabled: true // Coming Soon
    },
    {
      id: 'aptitude',
      tourId: 'tour-aptitude-card',
      title: 'Aptitude Prep',
      description: 'Practice quizzes for quantitative and logical reasoning.',
      icon: <AcademicCapIcon className="w-8 h-8" />,
      color: 'bg-emerald-500',
      hover: 'hover:bg-emerald-600',
      // disabled: true // Enabled now
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto py-10 px-6 animate-fadeIn">
      {/* Welcome Header */}
      <div className="mb-12" id="tour-welcome-header">
        <h1 className="text-4xl font-extrabold text-text-primary mb-3">
          Welcome back, <span className="text-primary">{userName}</span>
        </h1>
        <p className="text-text-secondary text-lg">
          You have <span className="font-semibold text-text-primary">{stats.roadmaps}</span> active learning roadmaps. Ready to level up?
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <button
            key={tool.id}
            id={tool.tourId}
            onClick={() => !tool.disabled && onNavigate(tool.id)}
            disabled={tool.disabled}
            className={`flex flex-col items-start p-6 rounded-2xl border transition-all duration-300 group shadow-lg relative overflow-hidden ${tool.disabled
              ? 'bg-background-secondary/50 border-border opacity-70 cursor-not-allowed'
              : 'bg-background-secondary border-border hover:border-primary/50 hover:-translate-y-1 hover:shadow-primary/10'
              }`}
          >
            {/* Coming Soon Badge */}
            {tool.disabled && (
              <div className="absolute top-4 right-4 bg-background-accent text-text-secondary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Coming Soon
              </div>
            )}

            <div className={`p-3 rounded-xl ${tool.disabled ? 'bg-gray-400/20 text-gray-400' : tool.color + ' text-white shadow-lg group-hover:scale-110'} mb-4 transition-transform duration-300`}>
              {tool.icon}
            </div>
            <h3 className={`text-xl font-bold mb-2 transition-colors ${tool.disabled ? 'text-text-secondary' : 'text-text-primary group-hover:text-primary'}`}>
              {tool.title}
            </h3>
            <p className="text-text-secondary text-left text-sm leading-relaxed">{tool.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;