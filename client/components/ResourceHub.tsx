import React from 'react';
import { SavedRoadmap, Resource } from '../types';

// Helper function to get the YouTube video ID from a URL
const getYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// --- Reusable Resource Components ---
const ResourceItem: React.FC<{ resource: Resource }> = ({ resource }) => (
    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="block bg-slate-800/50 border border-slate-700/50 p-4 rounded-lg hover:border-sky-500/50 hover:bg-slate-800 transition-all">
        <p className="font-semibold text-slate-200">{resource.title}</p>
        <p className="text-xs text-sky-400 mt-1 truncate capitalize">{resource.type}</p>
    </a>
);

const VideoItem: React.FC<{ resource: Resource }> = ({ resource }) => {
    const videoId = getYouTubeId(resource.url);
    if (!videoId) return null; // Don't render if it's not a valid YouTube URL

    return (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden shadow-lg">
            <div className="aspect-w-16 aspect-h-9 bg-black">
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={resource.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                ></iframe>
            </div>
            <div className="p-4">
                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-slate-200 hover:text-sky-400 transition-colors line-clamp-2">
                    {resource.title}
                </a>
            </div>
        </div>
    );
};


const ResourceHub: React.FC<{ roadmap: SavedRoadmap }> = ({ roadmap }) => {
  return (
    <div className="space-y-12 animate-fadeIn">
      {roadmap.steps.map((step, index) => {
        // Separate videos from other resources for special rendering
        const videos = step.resources.filter(r => r.type === 'video' && getYouTubeId(r.url));
        const otherResources = step.resources.filter(r => r.type !== 'video' || !getYouTubeId(r.url));

        return (
          <section key={index}>
            {/* Step Header */}
            <div className="flex items-center text-slate-200 border-b border-slate-700 pb-3 mb-6">
              <span className="flex-shrink-0 flex items-center justify-center bg-slate-700 text-sky-400 font-bold w-10 h-10 rounded-full">
                {index + 1}
              </span>
              <h2 className="text-2xl font-bold ml-4">{step.title}</h2>
            </div>
            
            {/* Embedded Videos for this step */}
            {videos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                    {videos.map((video, videoIndex) => (
                        <VideoItem key={videoIndex} resource={video} />
                    ))}
                </div>
            )}
            
            {/* Other resources for this step */}
            {otherResources.length > 0 && (
                <div className="space-y-3">
                    {otherResources.map((resource, resourceIndex) => (
                        <ResourceItem key={resourceIndex} resource={resource} />
                    ))}
                </div>
            )}

             {/* If a step has no resources */}
             {step.resources.length === 0 && (
                <p className="text-slate-500 italic">No resources listed for this step.</p>
             )}
          </section>
        );
      })}
    </div>
  );
};

export default ResourceHub;

