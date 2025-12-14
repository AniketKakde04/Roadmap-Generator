import React from 'react';
import { createRoot } from 'react-dom/client';
import { ResumeData } from '../types';
import ResumePreview from '../components/ResumePreview';

export const printResume = (resumeData: ResumeData) => {
    // 1. Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    // 2. Get the iframe's document
    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    // 3. Write the HTML content
    doc.open();
    doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${resumeData.full_name || 'Resume'}</title>
            <style>
                /* RESET & BASE STYLES */
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
                
                body {
                    font-family: 'Inter', sans-serif;
                    margin: 0;
                    padding: 0;
                    background: white;
                    color: #1f2937; /* text-gray-800 */
                }

                /* TAILWIND-LIKE UTILITIES (Simplified for Print) */
                .text-center { text-align: center; }
                .font-bold { font-weight: 700; }
                .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
                .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
                .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
                .text-xs { font-size: 0.75rem; line-height: 1rem; }
                .mb-2 { margin-bottom: 0.5rem; }
                .mb-6 { margin-bottom: 1.5rem; }
                .p-8 { padding: 2rem; }
                .flex { display: flex; }
                .justify-center { justify-content: center; }
                .gap-4 { gap: 1rem; }
                .border-b-2 { border-bottom-width: 2px; }
                .border-gray-200 { border-color: #e5e7eb; }
                .text-sky-700 { color: #0369a1; }
                .text-purple-700 { color: #7e22ce; }
                .bg-gray-50 { background-color: #f9fafb; }
                .list-disc { list-style-type: disc; }
                .pl-5 { padding-left: 1.25rem; }
                .w-full { width: 100%; }
                .h-full { height: 100%; }

                /* PRINT SPECIFIC OVERRIDES */
                @media print {
                    @page {
                        margin: 0;
                        size: auto;
                    }
                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            </style>
            <!-- Inject Tailwind CSS CDN for full compatibility if needed -->
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body>
            <div id="print-root"></div>
        </body>
        </html>
    `);
    doc.close();

    // 4. Render the React Component into the iframe
    // We wait for the iframe to load (scripts/styles) before printing
    iframe.onload = () => {
        const printRoot = doc.getElementById('print-root');
        if (printRoot) {
            const root = createRoot(printRoot);
            // We wrap it in a div that mimics the 'preview' container style to ensure 1:1 look
            root.render(
                <div className="w-full h-full bg-white text-gray-800">
                    <ResumePreview resumeData={resumeData} />
                </div>
            );

            // Small delay to allow React to render the DOM, then print
            setTimeout(() => {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();

                // Cleanup after print dialog closes (or immediately, browser handles the queue)
                // setTimeout(() => document.body.removeChild(iframe), 1000);
            }, 500);
        }
    };
};
