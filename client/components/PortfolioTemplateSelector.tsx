import React from 'react';

type PortfolioTemplateType = 'modern-minimalist' | 'dev-card' | 'clean' | 'gradient';

interface PortfolioTemplateSelectorProps {
    selectedTemplate: PortfolioTemplateType;
    onSelectTemplate: (template: PortfolioTemplateType) => void;
}

const templates: { id: PortfolioTemplateType; name: string; description: string; previewColors: string; accentColor: string }[] = [
    {
        id: 'modern-minimalist',
        name: 'Modern Minimalist',
        description: 'Clean and professional with indigo accents',
        previewColors: 'from-slate-100 to-indigo-50',
        accentColor: 'ring-indigo-500 border-indigo-300',
    },
    {
        id: 'dev-card',
        name: 'Dev Card',
        description: 'Modern dark theme with cyan accents',
        previewColors: 'from-[#0a0a0f] to-[#111118]',
        accentColor: 'ring-cyan-500 border-cyan-400',
    },
    {
        id: 'clean',
        name: 'Clean',
        description: 'Minimalist white with purple accents',
        previewColors: 'from-white to-purple-50',
        accentColor: 'ring-purple-500 border-purple-400',
    },
    {
        id: 'gradient',
        name: 'Gradient',
        description: 'Vibrant gradients with glassmorphism',
        previewColors: 'from-purple-900 to-pink-800',
        accentColor: 'ring-purple-500 border-purple-400',
    },
];

const PortfolioTemplateSelector: React.FC<PortfolioTemplateSelectorProps> = ({ selectedTemplate, onSelectTemplate }) => {
    return (
        <div className="mb-6">
            <h3 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wider">Choose Template</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {templates.map((template) => {
                    const isSelected = selectedTemplate === template.id;
                    return (
                        <button
                            key={template.id}
                            onClick={() => onSelectTemplate(template.id)}
                            className={`group relative rounded-xl overflow-hidden border-2 transition-all duration-300 text-left ${isSelected
                                ? `${template.accentColor} ring-2 ring-offset-2 ring-offset-background shadow-lg scale-[1.02]`
                                : 'border-border hover:border-primary/40 hover:shadow-md hover:scale-[1.01]'
                                }`}
                        >
                            {/* Color preview */}
                            <div className={`h-20 bg-gradient-to-br ${template.previewColors} relative`}>
                                {/* Mini mockup elements */}
                                <div className="absolute inset-3 flex flex-col gap-1.5">
                                    <div className={`h-2 w-8 rounded-full ${template.id === 'dev-card' || template.id === 'gradient' ? 'bg-white/20' : 'bg-gray-400/20'}`} />
                                    <div className={`h-1.5 w-16 rounded-full ${template.id === 'dev-card' || template.id === 'gradient' ? 'bg-white/10' : 'bg-gray-300/20'}`} />
                                    <div className={`h-1.5 w-12 rounded-full ${template.id === 'dev-card' || template.id === 'gradient' ? 'bg-white/10' : 'bg-gray-300/20'}`} />
                                    <div className="flex gap-1 mt-auto">
                                        <div className={`h-6 w-6 rounded ${template.id === 'dev-card' || template.id === 'gradient' ? 'bg-white/10' : 'bg-gray-300/15'}`} />
                                        <div className={`h-6 w-6 rounded ${template.id === 'dev-card' || template.id === 'gradient' ? 'bg-white/10' : 'bg-gray-300/15'}`} />
                                    </div>
                                </div>

                                {/* Selected checkmark */}
                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                                        <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Label */}
                            <div className="p-3 bg-background-secondary">
                                <p className="text-xs font-bold text-text-primary truncate">{template.name}</p>
                                <p className="text-[10px] text-text-secondary truncate mt-0.5">{template.description}</p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default PortfolioTemplateSelector;
