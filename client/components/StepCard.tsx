
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
      <div className="z-20 hidden md:flex items-center order-1 bg-background-accent border border-primary shadow-md w-12 h-12 rounded-full justify-center">
        <h1 className="mx-auto font-bold text-lg text-primary">{index + 1}</h1>
      </div>

      {/* Card Content */}
      <div className={`order-1 bg-white dark:bg-background-secondary border border-border rounded-xl shadow-sm hover:shadow-md w-full md:w-5/12 px-6 py-5 transform transition-all duration-300 group-hover:-translate-y-1 ${isCompleted ? 'opacity-60 grayscale' : ''}`}>
        <div className="flex items-center mb-3">
          {canToggle && (
            <input
              type="checkbox"
              id={`step-toggle-${index}`}
              checked={isCompleted}
              onChange={onToggleComplete}
              className="h-5 w-5 rounded bg-background border-border text-primary focus:ring-primary focus:ring-2 cursor-pointer flex-shrink-0 mr-4"
              aria-label={`Mark step ${index + 1} as complete`}
            />
          )}
          <div className="z-20 flex md:hidden items-center justify-center mr-4 bg-background-accent border border-primary w-10 h-10 rounded-full flex-shrink-0">
            <h1 className="mx-auto font-bold text-lg text-primary">{index + 1}</h1>
          </div>
          <h3 className={`font-bold text-text-primary text-xl ${isCompleted ? 'line-through text-text-secondary' : ''}`}>{step.title}</h3>
        </div>
        <p className="text-sm leading-relaxed tracking-wide text-text-secondary mb-4">
          {step.description}
        </p>
        <div>
          <h4 className="text-sm font-semibold text-text-primary mb-2 border-b border-border pb-1">Free Resources:</h4>
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
