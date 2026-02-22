// Using native fetch supported in Node 18+

async function testConsolidatedFeedback() {
    console.log("Sending test request for consolidated feedback...");
    try {
        const response = await fetch('http://localhost:3000/api/interview/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                conversationHistory: [
                    { role: 'model', text: "Hello! I'm Alex. Let's start. Tell me about your experience with Python." },
                    { role: 'user', text: "I have 3 years of experience with Python, mostly in GenAI and LLM projects." },
                    { role: 'model', text: "That's great. Can you explain how you handle long context windows in LLMs?" },
                    { role: 'user', text: "I use techniques like RAG and sliding windows to manage context effectively." }
                ],
                jobTitle: "Python Developer (GenAI/LLM)",
                resumeText: "Python Expert. LLM Enthusiast. Worked on RAG systems."
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Server Error: ${errText}`);
        }

        const data = await response.json();
        console.log("Response received:");
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Test failed:", error);
    }
}

testConsolidatedFeedback();
