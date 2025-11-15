import React from 'react';
import { ResumeData } from '../types';

interface ResumePreviewProps {
  resumeData: ResumeData;
}

const HeaderSection = ({ resumeData, templateType }: { resumeData: ResumeData, templateType?: string }) => {
  if (templateType === 'two-column') {
    return (
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="md:w-1/3 bg-sky-800 text-white p-6 rounded-lg">
          <h1 className="text-2xl font-bold mb-2">{resumeData.full_name || 'Your Name'}</h1>
          <p className="text-sky-200">{resumeData.job_title || 'Target Job Title'}</p>
          
          <div className="mt-6 space-y-2">
            {resumeData.email && <div className="flex items-center">
              <span className="text-sky-300">✉️</span>
              <span className="ml-2 text-sm">{resumeData.email}</span>
            </div>}
            {resumeData.phone && <div className="flex items-center">
              <span className="text-sky-300">📱</span>
              <span className="ml-2 text-sm">{resumeData.phone}</span>
            </div>}
            {resumeData.linkedin_url && <div className="flex items-center">
              <span className="text-sky-300">🔗</span>
              <a href={resumeData.linkedin_url} className="ml-2 text-sm text-sky-200 hover:underline">LinkedIn</a>
            </div>}
          </div>
        </div>
        
        <div className="md:w-2/3">
          {resumeData.summary && (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-lg font-bold text-sky-800 mb-2">About Me</h2>
              <p className="text-gray-700">{resumeData.summary}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  if (templateType === 'minimalist') {
    return (
      <div className="text-center mb-8">
        <h1 className="text-3xl font-light tracking-wider">{resumeData.full_name || 'Your Name'}</h1>
        <div className="w-20 h-0.5 bg-gray-400 mx-auto my-3"></div>
        <p className="text-gray-600">{resumeData.job_title || 'Target Job Title'}</p>
        
        <div className="flex justify-center space-x-4 mt-3 text-sm text-gray-500">
          {resumeData.email && <span>{resumeData.email}</span>}
          {resumeData.phone && <span>• {resumeData.phone}</span>}
        </div>
      </div>
    );
  }
  
  if (templateType === 'creative') {
    return (
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-500 text-white p-8 rounded-t-lg mb-6">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">{resumeData.full_name || 'Your Name'}</h1>
          <p className="text-xl text-purple-100">{resumeData.job_title || 'Target Job Title'}</p>
          
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            {resumeData.email && <span className="bg-white/20 px-3 py-1 rounded-full">{resumeData.email}</span>}
            {resumeData.phone && <span className="bg-white/20 px-3 py-1 rounded-full">{resumeData.phone}</span>}
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-white/10 rounded-full"></div>
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full"></div>
      </div>
    );
  }
  
  // Default template (professional)
  return (
    <div className="text-center border-b-2 border-gray-200 pb-4 mb-6">
      <h1 className="text-4xl font-bold tracking-tight">{resumeData.full_name || 'Your Name'}</h1>
      <p className="text-xl text-sky-700 font-semibold">{resumeData.job_title || 'Target Job Title'}</p>
      <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-600">
        {resumeData.email && <span>{resumeData.email}</span>}
        {resumeData.phone && <><span>•</span><span>{resumeData.phone}</span></>}
        {resumeData.linkedin_url && <><span>•</span><a href={resumeData.linkedin_url} className="text-sky-700 hover:underline">LinkedIn</a></>}
      </div>
    </div>
  );
};

const SectionTitle = ({ children, templateType }: { children: React.ReactNode, templateType?: string }) => {
  if (templateType === 'minimalist') {
    return (
      <h2 className="text-lg font-light tracking-wider border-b border-gray-300 pb-1 mb-3">
        {children}
      </h2>
    );
  }
  
  if (templateType === 'creative') {
    return (
      <h2 className="text-xl font-bold text-purple-700 mb-3 flex items-center">
        <span className="w-2 h-6 bg-purple-600 mr-2"></span>
        {children}
      </h2>
    );
  }
  
  // Default style
  return (
    <h2 className="text-lg font-bold uppercase tracking-wider text-sky-800 border-b-2 border-gray-200 pb-1 mb-2">
      {children}
    </h2>
  );
};

const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData }) => {
  // Ensure resumeData and its arrays are not null/undefined
  const data = {
    ...resumeData,
    experience: resumeData.experience || [],
    projects: resumeData.projects || [],
    education: resumeData.education || [],
    skills: resumeData.skills || [],
    achievements: resumeData.achievements || [],
    certifications: resumeData.certifications || [],
  };

  const templateType = (data as any).templateType || 'single-column';

  return (
    <div 
      id="resume-preview" 
      className={`w-full h-full p-8 bg-white text-gray-800 rounded-lg shadow-lg overflow-y-auto font-sans ${
        templateType === 'minimalist' ? 'bg-gray-50' : ''
      }`}
    >
      <HeaderSection resumeData={data} templateType={templateType} />

      {data.summary && (
        <div className="mb-6">
          <SectionTitle templateType={templateType}>Summary</SectionTitle>
          <p className="text-sm text-gray-700">{data.summary}</p>
        </div>
      )}

       {data.experience.length > 0 && (
            <div className="mb-6">
                <SectionTitle templateType={templateType}>Experience</SectionTitle>
                {data.experience.map(exp => (
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

      {data.projects.length > 0 && (
         <div className="mb-6">
            <SectionTitle templateType={templateType}>Projects</SectionTitle>
            {data.projects.map(proj => (
            <div key={proj.id} className="mb-3">
                <h3 className="text-md font-bold">{proj.name}</h3>
                <ul className="list-disc pl-5 mt-1 text-sm text-gray-700">
                    {proj.description.split('\n').map((line, i) => line.trim() && <li key={i}>{line.replace(/^- /, '')}</li>)}
                </ul>
            </div>
            ))}
        </div>
      )}
      
       {data.education.length > 0 && (
            <div className="mb-6">
                <SectionTitle templateType={templateType}>Education</SectionTitle>
                {data.education.map(edu => (
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

       {data.skills.length > 0 && (
            <div className="mb-6">
                <SectionTitle templateType={templateType}>Skills</SectionTitle>
                <p className="text-sm text-gray-700">
                 {data.skills.map(s => s.name).join(' | ')}
                </p>
            </div>
        )}

        {/* --- NEWLY ADDED CERTIFICATIONS --- */}
        {data.certifications.length > 0 && (
            <div className="mb-6">
                <SectionTitle templateType={templateType}>Certifications</SectionTitle>
                {data.certifications.map(cert => (
                <div key={cert.id} className="mb-3">
                    <div className="flex justify-between items-baseline">
                    <h3 className="text-md font-bold">{cert.name}</h3>
                    <p className="text-xs font-medium text-gray-600">{cert.date}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{cert.issuer}</p>
                </div>
                ))}
            </div>
        )}

        {/* --- NEWLY ADDED ACHIEVEMENTS --- */}
        {data.achievements.length > 0 && (
            <div className="mb-6">
                <SectionTitle templateType={templateType}>Achievements</SectionTitle>
                <ul className="list-disc pl-5 mt-1 text-sm text-gray-700">
                    {data.achievements.map(ach => (
                        <li key={ach.id}>{ach.description}</li>
                    ))}
                </ul>
            </div>
        )}
    </div>
  );
};

export default ResumePreview;