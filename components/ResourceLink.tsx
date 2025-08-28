
import React from 'react';
import { Resource } from '../types';
import BookOpenIcon from './icons/BookOpenIcon';
import LinkIcon from './icons/LinkIcon';
import PlayCircleIcon from './icons/PlayCircleIcon';
import WrenchScrewdriverIcon from './icons/WrenchScrewdriverIcon';

interface ResourceLinkProps {
  resource: Resource;
}

const ResourceIcon: React.FC<{ type: Resource['type']; className?: string }> = ({ type, className }) => {
  switch (type) {
    case 'video':
      return <PlayCircleIcon className={className} />;
    case 'article':
    case 'documentation':
    case 'course':
      return <BookOpenIcon className={className} />;
    case 'tool':
      return <WrenchScrewdriverIcon className={className} />;
    case 'other':
    default:
      return <LinkIcon className={className} />;
  }
};

const ResourceLink: React.FC<ResourceLinkProps> = ({ resource }) => {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center space-x-3 p-2 -ml-2 rounded-lg transition-all duration-200 hover:bg-slate-700/50 group"
    >
      <div className="flex-shrink-0 text-slate-400 group-hover:text-sky-400">
        <ResourceIcon type={resource.type} className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-slate-300 group-hover:text-sky-300 transition-colors duration-200 line-clamp-1">
          {resource.title}
        </p>
        <p className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors duration-200 capitalize">{resource.type}</p>
      </div>
    </a>
  );
};

export default ResourceLink;
