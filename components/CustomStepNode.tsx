import React from 'react';
import { Handle, Position } from 'reactflow';
import { Step } from '../types';

// The main custom node component
const CustomStepNode: React.FC<{ data: { step: Step, index: number } }> = ({ data }) => {
  const { step, index } = data;

  return (
    <div className="bg-slate-800 border-2 border-slate-700 rounded-xl shadow-lg w-80 p-4 cursor-pointer hover:border-sky-500 transition-colors">
        {/* Handles are the connection points for edges */}
        <Handle type="target" position={Position.Top} className="!bg-slate-500" />
        
        <div>
            <p className="text-xs text-sky-400 font-semibold">STEP {index + 1}</p>
            <h3 className="text-lg font-bold text-slate-100">{step.title}</h3>
            <p className="text-sm text-slate-400 mt-2 line-clamp-3">{step.description}</p>
        </div>
        
        <div className="text-center mt-3">
            <p className="text-xs text-slate-500 italic">Click to expand resources</p>
        </div>

        <Handle type="source" position={Position.Bottom} className="!bg-slate-500" />
    </div>
  );
};

export default React.memo(CustomStepNode);

