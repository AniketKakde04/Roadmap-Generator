import React from 'react';
import { useState } from 'react';
import { ResumeData } from '../types';

interface TemplateData extends Partial<ResumeData> {
  templateType?: 'single-column' | 'two-column' | 'minimalist' | 'creative' | 'right-sidebar';
}

const template1: TemplateData = {
  templateType: 'single-column',
  full_name: 'Alex Johnson',
  job_title: 'Senior Software Engineer',
  email: 'alex.johnson@example.com',
  phone: '(555) 123-4567',
  linkedin_url: 'linkedin.com/in/alexjohnson',
  github_url: 'github.com/alexjohnson',
  summary: 'Experienced software engineer with 5+ years of expertise in full-stack development. Specialized in React, Node.js, and cloud technologies. Passionate about creating efficient, scalable, and user-friendly applications.',
  skills: [
    { id: '1', name: 'JavaScript/TypeScript' },
    { id: '2', name: 'React' },
    { id: '3', name: 'Node.js' },
    { id: '4', name: 'AWS' },
    { id: '5', name: 'Docker' },
  ],
  experience: [
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'Tech Innovations Inc.',
      startDate: '2020',
      endDate: 'Present',
      description: 'Led a team of 5 developers in building scalable web applications.\n- Reduced API response time by 40% through optimization\n- Implemented CI/CD pipeline reducing deployment time by 60%',
    },
  ],
  education: [
    {
      id: '1',
      university: 'Stanford University',
      degree: 'M.S. in Computer Science',
      startDate: '2015',
      endDate: '2017',
    },
  ],
};

const template2: TemplateData = {
  templateType: 'two-column',
  full_name: 'Sarah Williams',
  job_title: 'UX/UI Designer',
  email: 'sarah.w@example.com',
  phone: '(555) 987-6543',
  linkedin_url: 'linkedin.com/in/sarahwilliams',
  github_url: 'github.com/sarahdesigns',
  summary: 'Creative UX/UI designer with a passion for creating intuitive and beautiful user experiences. 4+ years of experience in product design and user research.',
  skills: [
    { id: '1', name: 'Figma' },
    { id: '2', name: 'Sketch' },
    { id: '3', name: 'Adobe XD' },
    { id: '4', name: 'User Research' },
    { id: '5', name: 'Prototyping' },
  ],
  experience: [
    {
      id: '1',
      title: 'Lead UX Designer',
      company: 'DesignHub',
      startDate: '2019',
      endDate: 'Present',
      description: 'Lead designer for enterprise applications.\n- Increased user engagement by 35%\n- Redesigned core workflows reducing user drop-off by 25%',
    },
  ],
  education: [
    {
      id: '1',
      university: 'Rhode Island School of Design',
      degree: 'B.F.A. in Graphic Design',
      startDate: '2015',
      endDate: '2019',
    },
  ],
};

const template3: TemplateData = {
  templateType: 'minimalist',
  full_name: 'Michael Chen',
  job_title: 'Data Scientist',
  email: 'michael.chen@example.com',
  phone: '(555) 456-7890',
  linkedin_url: 'linkedin.com/in/michaelchen',
  github_url: 'github.com/michaelchen',
  summary: 'Data scientist with expertise in machine learning and statistical analysis. Specialized in Python, TensorFlow, and big data technologies.',
  skills: [
    { id: '1', name: 'Python' },
    { id: '2', name: 'TensorFlow' },
    { id: '3', name: 'SQL' },
    { id: '4', name: 'Data Visualization' },
    { id: '5', name: 'Big Data' },
  ],
  experience: [
    {
      id: '1',
      title: 'Senior Data Scientist',
      company: 'DataInsights Corp',
      startDate: '2018',
      endDate: 'Present',
      description: 'Developed ML models for predictive analytics.\n- Improved model accuracy by 30%\n- Automated data pipelines saving 20 hours/week',
    },
  ],
  education: [
    {
      id: '1',
      university: 'MIT',
      degree: 'Ph.D. in Computer Science',
      startDate: '2013',
      endDate: '2018',
    },
  ],
};

const template4: TemplateData = {
  templateType: 'creative',
  full_name: 'Emily Rodriguez',
  job_title: 'Product Manager',
  email: 'emily.r@example.com',
  phone: '(555) 234-5678',
  linkedin_url: 'linkedin.com/in/emilyrodriguez',
  github_url: 'github.com/emilypm',
  summary: 'Product Manager with 6+ years of experience in agile product development. Skilled in market research, product strategy, and cross-functional team leadership.',
  skills: [
    { id: '1', name: 'Product Strategy' },
    { id: '2', name: 'Agile/Scrum' },
    { id: '3', name: 'Market Research' },
    { id: '4', name: 'JIRA' },
    { id: '5', name: 'SQL' },
  ],
  experience: [
    {
      id: '1',
      title: 'Senior Product Manager',
      company: 'ProductLabs',
      startDate: '2018',
      endDate: 'Present',
      description: 'Led product development for SaaS platform.\n- Grew user base by 200% in 2 years\n- Launched 3 major features with 90%+ user satisfaction',
    },
  ],
  education: [
    {
      id: '1',
      university: 'University of California, Berkeley',
      degree: 'MBA',
      startDate: '2016',
      endDate: '2018',
    },
  ],
};



const template5: TemplateData = {
  templateType: 'ivy-league',
  full_name: 'James Wilson',
  job_title: 'Investment Banking Analyst',
  email: 'james.wilson@example.com',
  phone: '(555) 789-0123',
  linkedin_url: 'linkedin.com/in/jwilson',
  summary: 'Analytical finance professional with a strong foundation in financial modeling and valuation. Proven track record in deal execution and client relationship management.',
  skills: [
    { id: '1', name: 'Financial Modeling' },
    { id: '2', name: 'Valuation' },
    { id: '3', name: 'M&A' },
    { id: '4', name: 'Excel (Advanced)' },
    { id: '5', name: 'Bloomberg Terminal' },
  ],
  experience: [
    {
      id: '1',
      title: 'Investment Banking Analyst',
      company: 'Goldman Sachs',
      startDate: '2021',
      endDate: 'Present',
      description: 'Performed extensive financial analysis for M&A transactions worth over $500M.\n- Built complex financial models including LBO and DCF analysis\n- Prepared pitch decks and presentation materials for senior management',
    },
  ],
  education: [
    {
      id: '1',
      university: 'Harvard University',
      degree: 'B.A. in Economics',
      startDate: '2017',
      endDate: '2021',
    },
  ],
};


const template6: TemplateData = {
  templateType: 'right-sidebar',
  full_name: 'Aniket Kakde',
  job_title: 'Computer Science Engineering Student',
  email: 'aniketkakde509@gmail.com',
  phone: '8766806290',
  linkedin_url: 'linkedin.com/in/aniket',
  summary: 'I am a Computer Science Engineering student passionate about leveraging technology for innovative solutions. My experience includes developing a WhatsApp-based AI-powered loan recovery assistant.',
  skills: [
    { id: '1', name: 'Java' },
    { id: '2', name: 'Python' },
    { id: '3', name: 'React' },
    { id: '4', name: 'Node.js' },
    { id: '5', name: 'SQL' },
  ],
  experience: [
    {
      id: '1',
      title: 'Intern',
      company: 'EbixCash Financial Technologies',
      startDate: '06/2025',
      endDate: '08/2025',
      description: 'Developed a WhatsApp-based AI-Powered Loan Recovery Assistant using Python, Flask, and Twilio.',
    },
  ],
  education: [
    {
      id: '1',
      university: 'Sant Gadge Baba Amravati University',
      degree: 'Bachelor of Engineering (B.E.)',
      startDate: '11/2022',
      endDate: '05/2026',
    },
  ],
  achievements: [
    { id: '1', description: 'Received multiple awards for excellence in engineering and innovation.' },
    { id: '2', description: 'Best Engineering Student Award.' }
  ],
};



interface TemplatePreviewProps {
  template: {
    id: number;
    name: string;
    data: TemplateData;
    color: string;
    description: string;
  };
  isSelected: boolean;
  onClick: () => void;
  onSelectTemplate: (template: TemplateData) => void;
}

interface ResumeTemplatesProps {
  onSelectTemplate: (template: TemplateData) => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, isSelected, onClick, onSelectTemplate }) => {
  return (
    <div
      onClick={onClick}
      className={`${template.color} p-6 rounded-lg cursor-pointer transform transition-all duration-300 ${isSelected ? 'ring-4 ring-offset-2 ring-sky-400 scale-105' : 'hover:scale-105 hover:shadow-lg'
        }`}
    >
      <div className="bg-white/20 backdrop-blur-sm p-4 rounded h-48 overflow-hidden">
        <div className="font-bold text-white mb-2">{template.name}</div>
        {template.id === 1 && (
          <div className="text-xs text-white/80 space-y-1">
            <div className="h-4 bg-white/30 rounded w-full"></div>
            <div className="h-4 bg-white/30 rounded w-3/4"></div>
            <div className="h-2 bg-white/20 rounded w-1/2 mt-2"></div>
            <div className="h-2 bg-white/20 rounded w-5/6"></div>
            <div className="h-2 bg-white/20 rounded w-2/3"></div>
          </div>
        )}
        {template.id === 2 && (
          <div className="grid grid-cols-2 gap-2 h-full">
            <div className="space-y-1">
              <div className="h-4 bg-white/30 rounded w-full"></div>
              <div className="h-2 bg-white/20 rounded w-3/4"></div>
              <div className="h-2 bg-white/20 rounded w-5/6 mt-2"></div>
            </div>
            <div className="space-y-1">
              <div className="h-3 bg-white/20 rounded w-full"></div>
              <div className="h-2 bg-white/10 rounded w-5/6"></div>
              <div className="h-2 bg-white/10 rounded w-3/4 mt-2"></div>
            </div>
          </div>
        )}
        {template.id === 3 && (
          <div className="space-y-2">
            <div className="h-5 bg-white/30 rounded-full w-3/4 mx-auto"></div>
            <div className="h-2 bg-white/20 rounded-full w-5/6 mx-auto"></div>
            <div className="h-2 bg-white/20 rounded-full w-4/5 mx-auto"></div>
            <div className="h-2 bg-white/20 rounded-full w-3/4 mx-auto"></div>
          </div>
        )}
        {template.id === 4 && (
          <div className="space-y-2">
            <div className="h-3 bg-white/30 rounded w-full"></div>
            <div className="h-2 bg-white/20 rounded w-5/6"></div>
            <div className="h-2 bg-white/20 rounded w-4/5"></div>
            <div className="h-2 bg-white/20 rounded w-3/4"></div>
          </div>
        )}
        {template.id === 5 && (
          <div className="space-y-2 text-center">
            <div className="h-4 bg-white/30 rounded w-1/2 mx-auto"></div>
            <div className="h-px bg-white/30 w-full my-1"></div>
            <div className="h-2 bg-white/20 rounded w-3/4 mx-auto"></div>
            <div className="h-px bg-white/30 w-full my-1"></div>
            <div className="space-y-1 text-left">
              <div className="h-3 bg-white/20 rounded w-1/4"></div>
              <div className="h-px bg-white/20 w-full"></div>
              <div className="h-2 bg-white/10 rounded w-full"></div>
            </div>
          </div>
        )}

        {template.id === 6 && (
          <div className="flex h-full gap-2">
            <div className="w-2/3 space-y-1">
              <div className="h-4 bg-white/30 rounded w-full"></div>
              <div className="h-2 bg-white/20 rounded w-5/6"></div>
              <div className="h-2 bg-white/20 rounded w-3/4"></div>
            </div>
            <div className="w-1/3 border-l border-white/20 space-y-1 pl-1">
              <div className="h-3 bg-white/30 rounded w-full"></div>
              <div className="h-2 bg-white/20 rounded w-3/4"></div>
            </div>
          </div>
        )}

        {template.id === 7 && (
          <div className="space-y-2">
            <div className="text-center space-y-1">
              <div className="h-4 bg-white/30 rounded w-2/3 mx-auto"></div>
              <div className="h-2 bg-white/20 rounded w-1/3 mx-auto"></div>
              <div className="h-px bg-white/30 w-full my-1"></div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-1 space-y-1">
                <div className="h-2 bg-white/20 rounded w-full"></div>
                <div className="h-2 bg-white/20 rounded w-3/4"></div>
              </div>
              <div className="col-span-3 space-y-1">
                <div className="h-2 bg-white/30 rounded w-full"></div>
                <div className="h-2 bg-white/20 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        )}
      </div>
      <button
        className="mt-3 w-full bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded transition-colors text-sm"
        onClick={(e) => {
          e.stopPropagation();
          // Create a deep copy of the template data to avoid reference issues
          const templateCopy = JSON.parse(JSON.stringify(template.data));
          onSelectTemplate(templateCopy);
          onClick();
        }}
      >
        Use Template
      </button>
    </div>
  );
};

const ResumeTemplates: React.FC<ResumeTemplatesProps> = ({ onSelectTemplate }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(1); // Default to first template

  const templates = [
    {
      id: 5,
      name: 'Ivy League',
      data: template5,
      color: 'bg-slate-700',
      description: 'Classic, ATS-friendly serif design'
    },
    {
      id: 1,
      name: 'Professional',
      data: template1,
      color: 'bg-blue-600',
      description: 'Clean and professional single-column layout'
    },
    {
      id: 2,
      name: 'Modern',
      data: template2,
      color: 'bg-purple-600',
      description: 'Two-column modern design with sidebar'
    },
    {
      id: 4,
      name: 'Creative',
      data: template4,
      color: 'bg-amber-600',
      description: 'Bold and creative layout with color accents'
    },
    {
      id: 3,
      name: 'Minimalist',
      data: template3,
      color: 'bg-emerald-600',
      description: 'Simple and clean with ample white space'
    },
    {
      id: 6,
      name: 'Compact',
      data: template6,
      color: 'bg-indigo-600',
      description: 'Modern right-sidebar layout with blue accents'
    },
  ];

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4 text-white">Choose a Template</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="space-y-2">
            <div onClick={() => setSelectedTemplate(template.id)}>
              <TemplatePreview
                template={template}
                isSelected={selectedTemplate === template.id}
                onClick={() => setSelectedTemplate(template.id)}
                onSelectTemplate={onSelectTemplate}
              />
            </div>
            <p className="text-sm text-slate-400 text-center">{template.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResumeTemplates;
