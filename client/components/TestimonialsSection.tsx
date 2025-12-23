import React, { useEffect, useState } from 'react';
import { fetchFeaturedFeedbacks } from '../services/feedbackService';
import { Feedback } from '../types';
import { StarIcon } from '@heroicons/react/24/solid';

const TestimonialsSection: React.FC = () => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadFeedbacks = async () => {
            try {
                const data = await fetchFeaturedFeedbacks();
                setFeedbacks(data);
            } catch (error) {
                console.error("Failed to load featured feedbacks");
            } finally {
                setIsLoading(false);
            }
        };
        loadFeedbacks();
    }, []);

    if (isLoading || feedbacks.length === 0) return null; // Don't show if empty or loading

    return (
        <section className="py-20 animate-fadeIn">
            <div className="max-w-7xl mx-auto px-6 text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                    Loved by <span className="text-primary">Learners</span>
                </h2>
                <p className="text-text-secondary max-w-2xl mx-auto">
                    See what students and developers are saying about their journey.
                </p>
            </div>

            {/* Scrolling Grid/Row */}
            <div className="max-w-7xl mx-auto px-6 overflow-x-auto pb-8 scrollbar-hide flex gap-6 snap-x">
                {feedbacks.map((feedback) => (
                    <div
                        key={feedback.id}
                        className="min-w-[300px] md:min-w-[350px] bg-background-secondary border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all snap-center flex flex-col"
                    >
                        {/* Rating */}
                        <div className="flex gap-1 mb-4 text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                                <StarIcon key={i} className={`w-5 h-5 ${i < feedback.rating ? 'fill-current' : 'text-gray-300 dark:text-gray-700'}`} />
                            ))}
                        </div>

                        {/* Message */}
                        <p className="text-text-primary leading-relaxed mb-6 flex-grow italic">
                            "{feedback.message}"
                        </p>

                        {/* Author */}
                        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                                {feedback.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-left">
                                <h4 className="font-bold text-text-primary text-sm">{feedback.name}</h4>
                                <p className="text-text-secondary text-xs">{feedback.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default TestimonialsSection;
