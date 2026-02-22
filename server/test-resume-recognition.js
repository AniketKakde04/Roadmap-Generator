// Using native fetch supported in Node 18+

async function testContinueInterview() {
    console.log("Sending test continueInterview request with specific resume context...");
    try {
        const response = await fetch('http://localhost:3000/api/interview/continue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                conversationHistory: [
                    { role: 'model', text: "Hello! I'm Alex. Let's start. Tell me about yourself." },
                    { role: 'user', text: "I am a software engineer." }
                ],
                resumeText: "EXPERIENCE: Senior React Dev at TechCorp. Built a custom WebGL engine for 3D data visualization. PROJECTS: 'QuickScan' - an OCR tool for medical records using Python and OpenCV.",
                jobTitle: "Senior Frontend Developer"
            })
        });

        const text = await response.text();
        console.log("AI Response:");
        console.log(text);

        if (text.toLowerCase().includes('webgl') || text.toLowerCase().includes('3d') || text.toLowerCase().includes('quickscan') || text.toLowerCase().includes('opencv')) {
            console.log("\n✅ SUCCESS: AI recognized the resume context!");
        } else {
            console.log("\n❌ FAILURE: AI did not mention anything from the specific resume context.");
        }
    } catch (error) {
        console.error("Test failed:", error);
    }
}

testContinueInterview();
