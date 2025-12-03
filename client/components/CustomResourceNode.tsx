import React from 'react';
import { Handle, Position } from 'reactflow';
import { Resource } from '../types';
import BookOpenIcon from './icons/BookOpenIcon';
import LinkIcon from './icons/LinkIcon';
import PlayCircleIcon from './icons/PlayCircleIcon';
import WrenchScrewdriverIcon from './icons/WrenchScrewdriverIcon';

const ResourceNode: React.FC<{ data: { resource: Resource } }> = ({ data }) => {
    const { resource } = data;

    const Icon = {
        video: PlayCircleIcon,
        article: BookOpenIcon,
        documentation: BookOpenIcon,
        course: BookOpenIcon,
        tool: WrenchScrewdriverIcon,
        other: LinkIcon,
    }[resource.type] || LinkIcon;

    return (
        <a 
            href={resource.url} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()} // Prevents node drag when clicking link
            className="flex items-center space-x-2 p-3 bg-slate-700/80 border border-slate-600 rounded-lg shadow-md w-60 hover:bg-slate-700 hover:border-sky-500 transition-all"
        >
            <Handle type="target" position={Position.Left} className="!bg-slate-500" />
            <Icon className="w-5 h-5 text-sky-400 flex-shrink-0" />
            <span className="text-sm text-slate-200 truncate">{resource.title}</span>
        </a>
    );
};

export default React.memo(ResourceNode);
