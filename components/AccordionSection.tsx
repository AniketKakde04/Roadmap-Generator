import React, { useState } from 'react';

interface AccordionSectionProps {
  title: string;
  children: React.ReactNode;
  isOpenDefault?: boolean;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({ title, children, isOpenDefault = false }) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);

  return (
    <div className="border-b border-slate-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left hover:bg-slate-700/50 transition-colors"
      >
        <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
        <svg
          className={`w-5 h-5 text-slate-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-4 bg-slate-900/20 animate-fadeInUp">
          {children}
        </div>
      )}
    </div>
  );
};

export default AccordionSection;

