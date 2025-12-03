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
      tourId: 'tour-roadmap-card', // Added specialized ID
      title: 'Roadmap Generator',
      description: 'Create personalized learning paths for any topic or job role.',
      icon: <MapIcon className="w-8 h-8" />,
      color: 'bg-blue-500',
      hover: 'hover:bg-blue-600'
    },
    {
      id: 'resume',
      tourId: 'tour-resume-card', // Added specialized ID
      title: 'Resume Analyzer',
      description: 'Analyze your resume against job descriptions to find gaps.',
      icon: <DocumentTextIcon className="w-8 h-8" />,
      color: 'bg-indigo-500',
      hover: 'hover:bg-indigo-600'
    },
    {
      id: 'resumeBuilder',
      tourId: 'tour-builder-card', // Added specialized ID
      title: 'Resume Builder',
      description: 'Build a professional, ATS-friendly resume from scratch.',
      icon: <BriefcaseIcon className="w-8 h-8" />,
      color: 'bg-purple-500',
      hover: 'hover:bg-purple-600'
    },
    {
      id: 'mockInterview',
      tourId: 'tour-interview-card', // Added specialized ID
      title: 'AI Mock Interview',
      description: 'Practice voice-based technical interviews with AI feedback.',
      icon: <ChatBubbleLeftRightIcon className="w-8 h-8" />,
      color: 'bg-pink-500',
      hover: 'hover:bg-pink-600'
    },
    {
      id: 'aptitude',
      tourId: 'tour-aptitude-card', // Added specialized ID
      title: 'Aptitude Prep',
      description: 'Practice quizzes for quantitative and logical reasoning.',
      icon: <AcademicCapIcon className="w-8 h-8" />,
      color: 'bg-emerald-500',
      hover: 'hover:bg-emerald-600'
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto py-10 px-6 animate-fadeIn">
      {/* Welcome Header */}
      <div className="mb-12" id="tour-welcome-header"> {/* Added ID */}
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
            id={tool.tourId} // Applied ID here
            onClick={() => onNavigate(tool.id)}
            className="flex flex-col items-start p-6 rounded-2xl bg-background-secondary border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 group shadow-lg hover:shadow-primary/10"
          >
            <div className={`p-3 rounded-xl ${tool.color} text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              {tool.icon}
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-primary transition-colors">{tool.title}</h3>
            <p className="text-text-secondary text-left text-sm leading-relaxed">{tool.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;