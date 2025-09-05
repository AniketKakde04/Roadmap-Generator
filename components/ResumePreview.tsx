import React from 'react';
import { ResumeData } from '../types';

interface ResumePreviewProps {
  resumeData: ResumeData;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData }) => {
  return (
    <div id="resume-preview" className="w-full h-full p-8 bg-white text-gray-800 rounded-lg shadow-lg overflow-y-auto font-sans">
      <div className="text-center border-b-2 border-gray-200 pb-4 mb-6">
        <h1 className="text-4xl font-bold tracking-tight">{resumeData.full_name || 'Your Name'}</h1>
        <p className="text-xl text-sky-700 font-semibold">{resumeData.job_title || 'Target Job Title'}</p>
        <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-600">
          {resumeData.email && <span>{resumeData.email}</span>}
          {resumeData.phone && <><span>&bull;</span><span>{resumeData.phone}</span></>}
          {resumeData.linkedin_url && <><span>&bull;</span><a href={resumeData.linkedin_url} className="text-sky-700 hover:underline">LinkedIn</a></>}
          {resumeData.github_url && <><span>&bull;</span><a href={resumeData.github_url} className="text-sky-700 hover:underline">GitHub</a></>}
        </div>
      </div>

      {resumeData.summary && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase tracking-wider text-sky-800 border-b-2 border-gray-200 pb-1 mb-2">Summary</h2>
          <p className="text-sm text-gray-700">{resumeData.summary}</p>
        </div>
      )}

       {resumeData.experience.length > 0 && (
            <div className="mb-6">
                <h2 className="text-lg font-bold uppercase tracking-wider text-sky-800 border-b-2 border-gray-200 pb-1 mb-2">Experience</h2>
                {resumeData.experience.map(exp => (
                    <div key={exp.id} className="mb-3">
                        <div className="flex justify-between items-baseline">
                        <h3 className="text-md font-bold">{exp.title}</h3>
                        <p className="text-xs font-medium text-gray-600">{exp.startDate} - {exp.endDate}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-800">{exp.company}</p>
                        <ul className="list-disc pl-5 mt-1 text-sm text-gray-700">
                           {exp.description.split('\n').map((line, i) => line.trim() && <li key={i}>{line.replace(/^- /, '')}</li>)}
                        </ul>
                    </div>
                ))}
            </div>
        )}

      {resumeData.projects.length > 0 && (
         <div className="mb-6">
            <h2 className="text-lg font-bold uppercase tracking-wider text-sky-800 border-b-2 border-gray-200 pb-1 mb-2">Projects</h2>
            {resumeData.projects.map(proj => (
            <div key={proj.id} className="mb-3">
                <h3 className="text-md font-bold">{proj.name}</h3>
                <ul className="list-disc pl-5 mt-1 text-sm text-gray-700">
                    {proj.description.split('\n').map((line, i) => line.trim() && <li key={i}>{line.replace(/^- /, '')}</li>)}
                </ul>
            </div>
            ))}
        </div>
      )}
      
       {resumeData.education.length > 0 && (
            <div>
                <h2 className="text-lg font-bold uppercase tracking-wider text-sky-800 border-b-2 border-gray-200 pb-1 mb-2">Education</h2>
                {resumeData.education.map(edu => (
                <div key={edu.id} className="mb-3">
                    <div className="flex justify-between items-baseline">
                    <h3 className="text-md font-bold">{edu.university}</h3>
                    <p className="text-xs font-medium text-gray-600">{edu.startDate} - {edu.endDate}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{edu.degree}</p>
                </div>
                ))}
            </div>
        )}

       {resumeData.skills.length > 0 && (
            <div className="mt-6">
                <h2 className="text-lg font-bold uppercase tracking-wider text-sky-800 border-b-2 border-gray-200 pb-1 mb-2">Skills</h2>
                <p className="text-sm text-gray-700">
                 {resumeData.skills.map(s => s.name).join(' | ')}
                </p>
            </div>
        )}
    </div>
  );
};

export default ResumePreview;

