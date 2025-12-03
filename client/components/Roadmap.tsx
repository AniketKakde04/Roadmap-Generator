import React from 'react';
import { Roadmap as RoadmapType } from '../types';
import StepCard from './StepCard';

interface RoadmapProps {
  roadmap: RoadmapType;
}

const Roadmap: React.FC<RoadmapProps> = ({ roadmap }) => {
  return (
    <div className="container mx-auto w-full h-full p-4 md:p-8">
      <div className="relative wrap overflow-hidden h-full">
        <div className="text-center mb-12 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-indigo-400 mb-2">
                {roadmap.title}
            </h1>
            <p className="text-slate-300 max-w-3xl mx-auto">{roadmap.description}</p>
        </div>
        
        {/* Vertical timeline line */}
        <div className="border-2-2 absolute border-opacity-20 border-slate-600 h-full border hidden md:block" style={{ left: '50%' }}></div>
        <div className="absolute border-opacity-20 border-slate-600 h-full border md:hidden" style={{ left: '26px' }}></div>


        {roadmap.steps.map((step, index) => {
           const isEven = index % 2 === 0;
           return (
            <StepCard 
                key={index} 
                step={step} 
                index={index} 
                className={`animate-fadeInUp ${isEven ? 'md:flex-row-reverse' : ''}`}
                style={{ animationDelay: `${200 + index * 150}ms` }}
            />
           );
        })}
      </div>
    </div>
  );
};

export default Roadmap;