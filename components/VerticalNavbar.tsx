// components/VerticalNavbar.tsx
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

const NavItem: React.FC<NavItemProps> = ({ 
  icon, 
  label, 
  view, 
  currentView, 
  onNavigate,
  isCollapsed 
}) => {
  const isActive = currentView === view;
  
  return (
    <li className="w-full">
      <button
        onClick={() => onNavigate(view)}
        className={`flex items-center w-full p-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-slate-700 text-white'
            : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
        }`}
        title={label}
      >
        <span className="flex items-center justify-center w-6 h-6">
          {icon}
        </span>
        {!isCollapsed && <span className="ml-3">{label}</span>}
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

const VerticalNavbar: React.FC<VerticalNavbarProps> = ({ 
  currentView, 
  onNavigate, 
  isLoggedIn, 
  onSignInClick, 
  onSignUpClick, 
  onSignOut 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { icon: <HomeIcon className="w-5 h-5" />, label: 'Home', view: 'home' },
    { icon: <MapIcon className="w-5 h-5" />, label: 'Roadmap', view: 'roadmapGenerator' },
    { icon: <DocumentTextIcon className="w-5 h-5" />, label: 'Resume', view: 'resume' },
    { icon: <BriefcaseIcon className="w-5 h-5" />, label: 'Resume Builder', view: 'resumeBuilder' },
    { icon: <AcademicCapIcon className="w-5 h-5" />, label: 'Aptitude', view: 'aptitude' },
    { icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />, label: 'Mock Interview', view: 'mockInterview' },
    { icon: <UserIcon className="w-5 h-5" />, label: 'Profile', view: 'profile' },
  ];

  return (
    <nav className={`h-screen flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } bg-slate-800 text-white`}>
      {/* Header with logo and collapse button */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!isCollapsed && <h1 className="text-xl font-bold text-white">EduPath</h1>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-full hover:bg-slate-700"
          aria-label={isCollapsed ? 'Expand menu' : 'Collapse menu'}
        >
          {isCollapsed ? (
            <ChevronRightIcon className="w-5 h-5 text-slate-300" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5 text-slate-300" />
          )}
        </button>
      </div>

      {/* Navigation items */}
      <div className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.view}
              icon={item.icon}
              label={item.label}
              view={item.view}
              currentView={currentView}
              onNavigate={onNavigate}
              isCollapsed={isCollapsed}
            />
          ))}
        </ul>
      </div>

      {/* Bottom section - Auth Buttons */}
      <div className="p-4 border-t border-slate-700">
        {isLoggedIn ? (
          <button
            onClick={onSignOut}
            className="w-full flex items-center p-2 text-red-400 hover:bg-red-900/30 rounded-lg text-sm font-medium transition-colors"
          >
            <span className="flex items-center justify-center w-6 h-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </span>
            {!isCollapsed && <span className="ml-3">Sign Out</span>}
          </button>
        ) : (
          <div className="space-y-2">
            <button
              onClick={onSignInClick}
              className="w-full flex items-center p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg text-sm font-medium transition-colors"
            >
              <span className="flex items-center justify-center w-6 h-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </span>
              {!isCollapsed && <span className="ml-3">Sign In</span>}
            </button>
            <button
              onClick={onSignUpClick}
              className="w-full flex items-center p-2 text-green-400 hover:bg-green-900/30 rounded-lg text-sm font-medium transition-colors"
            >
              <span className="flex items-center justify-center w-6 h-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </span>
              {!isCollapsed && <span className="ml-3">Sign Up</span>}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default VerticalNavbar;