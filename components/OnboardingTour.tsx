import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import XMarkIcon from './icons/XMarkIcon'; // Reusing your existing icon

export interface TourStep {
    targetId: string;
    title: string;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface OnboardingTourProps {
    steps: TourStep[];
    onComplete: () => void;
    onSkip: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ steps, onComplete, onSkip }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [isReady, setIsReady] = useState(false);

    const step = steps[currentStep];

    const updateTarget = useCallback(() => {
        if (step.position === 'center') {
            setTargetRect(null);
            return;
        }

        const element = document.getElementById(step.targetId);
        if (element) {
            // Add a small delay to ensure layout is stable if navigating
            requestAnimationFrame(() => {
                const rect = element.getBoundingClientRect();
                setTargetRect(rect);
            });
        } else {
            // If target not found, maybe skip or default to center? 
            // For now, we'll just center it as fallback
            setTargetRect(null); 
        }
    }, [step]);

    useEffect(() => {
        updateTarget();
        window.addEventListener('resize', updateTarget);
        window.addEventListener('scroll', updateTarget, true);
        
        // Small timeout to allow UI to settle before showing
        const timer = setTimeout(() => setIsReady(true), 500);

        return () => {
            window.removeEventListener('resize', updateTarget);
            window.removeEventListener('scroll', updateTarget, true);
            clearTimeout(timer);
        };
    }, [currentStep, updateTarget]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    if (!isReady) return null;

    // Render logic for the "Spotlight" effect
    // We use 4 divs to create a darkened area around the target
    const renderOverlay = () => {
        if (!targetRect || step.position === 'center') {
            return <div className="fixed inset-0 bg-black/70 z-[9998] transition-all duration-500" />;
        }

        const { top, left, width, height } = targetRect;
        const padding = 8; // Space around element

        return (
            <>
                {/* Top */}
                <div className="fixed bg-black/70 z-[9998] transition-all duration-300" style={{ top: 0, left: 0, right: 0, height: Math.max(0, top - padding) }} />
                {/* Bottom */}
                <div className="fixed bg-black/70 z-[9998] transition-all duration-300" style={{ top: top + height + padding, left: 0, right: 0, bottom: 0 }} />
                {/* Left */}
                <div className="fixed bg-black/70 z-[9998] transition-all duration-300" style={{ top: Math.max(0, top - padding), left: 0, width: Math.max(0, left - padding), height: height + (padding * 2) }} />
                {/* Right */}
                <div className="fixed bg-black/70 z-[9998] transition-all duration-300" style={{ top: Math.max(0, top - padding), left: left + width + padding, right: 0, height: height + (padding * 2) }} />
                
                {/* Highlight Border */}
                <div 
                    className="fixed z-[9998] border-2 border-primary rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] pointer-events-none transition-all duration-300"
                    style={{
                        top: top - padding,
                        left: left - padding,
                        width: width + (padding * 2),
                        height: height + (padding * 2),
                    }}
                />
            </>
        );
    };

    // Calculate Tooltip Position
    const getTooltipStyle = (): React.CSSProperties => {
        if (!targetRect || step.position === 'center') {
            return {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                position: 'fixed'
            };
        }

        const { top, left, width, height, bottom, right } = targetRect;
        const gap = 20;

        // Simple positioning logic (can be improved for edge detection)
        // Default to right for vertical navbar items, bottom for dashboard cards
        // But let's use the prop hint
        
        // Fallback to fixed centering if calculation fails or off-screen
        
        if (window.innerWidth < 768) {
             // On mobile, usually simpler to center bottom or center screen
             return {
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                position: 'fixed',
                width: '90%'
             };
        }

        // Desktop Logic
        // Check if it's the sidebar (on the left) -> Tooltip to the right
        if (left < 300 && width < 300) { 
             return { top: top, left: right + gap, position: 'fixed' };
        }

        // Default to center screen for clarity if no specific pos logic matches
        return {
             top: bottom + gap,
             left: left + (width / 2),
             transform: 'translateX(-50%)',
             position: 'fixed'
        };
    };

    const tooltipContent = (
        <div 
            className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-[350px] max-w-[90vw] z-[9999] animate-fadeIn"
            style={getTooltipStyle()}
        >
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                    Step {currentStep + 1} of {steps.length}
                </span>
                <button onClick={onSkip} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {step.title}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                {step.content}
            </p>

            <div className="flex justify-between items-center">
                {currentStep > 0 ? (
                    <button 
                        onClick={handleBack}
                        className="text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                    >
                        Back
                    </button>
                ) : (
                    <div></div> 
                )}
                
                <button 
                    onClick={handleNext}
                    className="px-5 py-2 bg-primary hover:bg-secondary text-white text-sm font-semibold rounded-lg shadow-lg shadow-primary/20 transition-all transform hover:scale-105"
                >
                    {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                </button>
            </div>
        </div>
    );

    return createPortal(
        <>
            {renderOverlay()}
            {tooltipContent}
        </>,
        document.body
    );
};

export default OnboardingTour;