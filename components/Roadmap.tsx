import React from 'react';
import { Roadmap as RoadmapType } from '../types';
import StepCard from './StepCard';
// FIX: Imported the missing 'ResourceLink' component.
import ResourceLink from './ResourceLink';

interface RoadmapProps {
  roadmap: RoadmapType;
}

const Roadmap: React.FC<RoadmapProps> = ({ roadmap }) => {
  return (
    <div className="container mx-auto w-full h-full p-4 md:p-8">
      <div className="relative wrap overflow-hidden h-full">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-indigo-400 mb-2">
                {roadmap.title}
            </h1>
            <p className="text-slate-300 max-w-3xl mx-auto">{roadmap.description}</p>
        </div>
        
        {/* Vertical timeline line */}
        <div className="border-2-2 absolute border-opacity-20 border-slate-600 h-full border" style={{ left: '50%' }}></div>
        <div className="absolute border-opacity-20 border-slate-600 h-full border md:hidden" style={{ left: '26px' }}></div>


        {roadmap.steps.map((step, index) => {
           const isEven = index % 2 === 0;
           const card = <StepCard key={index} step={step} index={index} totalSteps={roadmap.steps.length} />;
           
           if (window.innerWidth < 768) { // Mobile view, single column
               return card;
           }

           // Desktop view, alternating sides
           return (
            <div key={index} className={`mb-8 flex justify-between ${isEven ? 'flex-row-reverse' : ''} items-center w-full left-timeline`}>
                 <div className="order-1 w-5/12"></div>
                 <div className="z-20 flex items-center order-1 bg-slate-800 shadow-xl w-12 h-12 rounded-full justify-center">
                    <h1 className="mx-auto font-semibold text-lg text-sky-400">{index + 1}</h1>
                 </div>
                 <div className="order-1 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-xl w-5/12 px-6 py-5 transform transition-transform duration-500 group-hover:scale-[1.02]">
                    <h3 className="font-bold text-slate-100 text-xl">{step.title}</h3>
                    <p className="text-sm leading-snug tracking-wide text-slate-300 text-opacity-100 mt-2 mb-4">
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
        })}
      </div>
    </div>
  );
};

export default Roadmap;