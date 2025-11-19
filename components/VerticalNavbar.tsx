import React, { useState } from 'react';
import { 
  HomeIcon, 
  MapIcon, 
  DocumentTextIcon, 
  UserIcon, 
  BriefcaseIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  view: string;
  currentView: string;
  onNavigate: (view: string) => void;
  isCollapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, view, currentView, onNavigate, isCollapsed }) => {
  const isActive = currentView === view;
  return (
    <li className="w-full mb-1">
      <button
        onClick={() => onNavigate(view)}
        className={`flex items-center w-full p-3 rounded-xl transition-all duration-200 group ${
          isActive
            ? 'bg-primary text-white shadow-lg shadow-primary/20'
            : 'text-text-secondary hover:bg-background-hover hover:text-primary'
        }`}
        title={label}
      >
        <span className={`flex-shrink-0 w-6 h-6 ${isActive ? 'text-white' : 'group-hover:text-primary'}`}>
          {icon}
        </span>
        {!isCollapsed && <span className="ml-3 font-medium whitespace-nowrap transition-opacity duration-300">{label}</span>}
      </button>
    </li>
  );
};

interface VerticalNavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isLoggedIn: boolean;
  onSignInClick: () => void;
  onSignUpClick: () => void;
  onSignOut: () => void;
}

const VerticalNavbar: React.FC<VerticalNavbarProps> = ({ currentView, onNavigate, isLoggedIn, onSignOut }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { icon: <HomeIcon className="w-6 h-6" />, label: 'Dashboard', view: 'dashboard' },
    { icon: <MapIcon className="w-6 h-6" />, label: 'Roadmap Generator', view: 'roadmapGenerator' },
    { icon: <DocumentTextIcon className="w-6 h-6" />, label: 'Resume Analyzer', view: 'resume' },
    { icon: <BriefcaseIcon className="w-6 h-6" />, label: 'Resume Builder', view: 'resumeBuilder' },
    { icon: <AcademicCapIcon className="w-6 h-6" />, label: 'Aptitude Prep', view: 'aptitude' },
    { icon: <ChatBubbleLeftRightIcon className="w-6 h-6" />, label: 'Mock Interview', view: 'mockInterview' },
    { icon: <UserIcon className="w-6 h-6" />, label: 'My Profile', view: 'profile' },
  ];

  return (
    <nav className={`h-screen flex flex-col border-r border-border bg-background-secondary transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 h-20 border-b border-border">
        {!isCollapsed && (
             <div className="flex items-center gap-2 animate-fadeIn">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">AI</div>
                <span className="text-xl font-bold text-text-primary tracking-tight">EduPath</span>
            </div>
        )}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-lg hover:bg-background-hover text-text-secondary transition-colors mx-auto">
          {isCollapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
        </button>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto py-6 px-3 scrollbar-hide">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.view}
              {...item}
              currentView={currentView}
              onNavigate={onNavigate}
              isCollapsed={isCollapsed}
            />
          ))}
        </ul>
      </div>

      {/* Footer / Sign Out */}
      <div className="p-4 border-t border-border">
        <button
            onClick={onSignOut}
            className="w-full flex items-center p-3 text-text-secondary hover:bg-error/10 hover:text-error rounded-xl transition-all duration-200 group"
            title="Sign Out"
        >
            <span className="flex-shrink-0 w-6 h-6 group-hover:text-error">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
            </span>
            {!isCollapsed && <span className="ml-3 font-medium">Sign Out</span>}
        </button>
      </div>
    </nav>
  );
};

export default VerticalNavbar;