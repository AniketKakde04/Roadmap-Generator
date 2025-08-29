
import React from 'react';
import { Step } from '../types';
import ResourceLink from './ResourceLink';

interface StepCardProps {
  step: Step;
  index: number;
  className?: string;
  style?: React.CSSProperties;
  isCompleted?: boolean;
  onToggleComplete?: () => void;
}

const StepCard: React.FC<StepCardProps> = ({ step, index, className = '', style, isCompleted = false, onToggleComplete }) => {
  const canToggle = onToggleComplete !== undefined;

  return (
    <div className={`mb-8 flex justify-between items-center w-full group ${className}`} style={style}>
      {/* Timeline connector and dot for larger screens */}
      <div className="hidden md:flex order-1 w-5/12"></div>
      <div className="z-20 hidden md:flex items-center order-1 bg-slate-800 shadow-xl w-12 h-12 rounded-full justify-center">
        <h1 className="mx-auto font-semibold text-lg text-sky-400">{index + 1}</h1>
      </div>

      {/* Card Content */}
      <div className={`order-1 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-xl w-full md:w-5/12 px-6 py-5 transform transition-transform duration-500 group-hover:scale-[1.02] ${isCompleted ? 'opacity-60' : ''}`}>
         <div className="flex items-center mb-3">
            {canToggle && (
                <input
                    type="checkbox"
                    id={`step-toggle-${index}`}
                    checked={isCompleted}
                    onChange={onToggleComplete}
                    className="h-5 w-5 rounded bg-slate-700 border-slate-600 text-sky-500 focus:ring-sky-600 focus:ring-2 cursor-pointer flex-shrink-0 mr-4"
                    aria-label={`Mark step ${index + 1} as complete`}
                />
            )}
            <div className="z-20 flex md:hidden items-center justify-center mr-4 bg-slate-700 shadow-xl w-10 h-10 rounded-full flex-shrink-0">
                <h1 className="mx-auto font-semibold text-lg text-sky-400">{index + 1}</h1>
            </div>
            <h3 className={`font-bold text-slate-100 text-xl ${isCompleted ? 'line-through' : ''}`}>{step.title}</h3>
        </div>
        <p className="text-sm leading-snug tracking-wide text-slate-300 text-opacity-100 mb-4">
          {step.description}
        </p>
        <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-2 border-b border-slate-700 pb-1">Free Resources:</h4>
            <div className="space-y-1">
            {step.resources.map((resource, i) => (
                <ResourceLink key={i} resource={resource} />
            ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default StepCard;
