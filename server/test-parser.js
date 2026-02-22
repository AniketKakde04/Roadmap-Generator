function mockParser(content) {
    // --- STAGE 1: Try JSON Parsing ---
    const startIdx = content.indexOf('{');
    const endIdx = content.lastIndexOf('}');

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        try {
            const jsonString = content.substring(startIdx, endIdx + 1);
            const parsed = JSON.parse(jsonString);
            return {
                overall_feedback: parsed.overall_feedback || parsed.overall || "Analysis complete.",
                strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
                areas_for_improvement: Array.isArray(parsed.areas_for_improvement) ? parsed.areas_for_improvement : (Array.isArray(parsed.areas) ? parsed.areas : [])
            };
        } catch (e) {
            console.log("JSON parse failed, falling back to text parsing...");
        }
    }

    // --- STAGE 2: Text-based Extraction (Markers) ---
    const sections = {
        overall_feedback: "",
        strengths: [],
        areas_for_improvement: []
    };

    const lines = content.split('\n');
    let currentSection = "";

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        const upperLine = trimmedLine.toUpperCase();
        if (upperLine.startsWith("OVERALL:")) {
            currentSection = "overall";
            sections.overall_feedback = trimmedLine.replace(/OVERALL:/i, "").trim();
        } else if (upperLine.startsWith("STRENGTHS:")) {
            currentSection = "strengths";
        } else if (upperLine.startsWith("IMPROVEMENTS:") || upperLine.startsWith("AREAS:")) {
            currentSection = "improvements";
        } else if (currentSection === "overall") {
            sections.overall_feedback += " " + trimmedLine;
        } else if (currentSection === "strengths" && (trimmedLine.startsWith("-") || trimmedLine.startsWith("*") || /^\d\./.test(trimmedLine))) {
            sections.strengths.push(trimmedLine.replace(/^[-*]|\d\./, "").trim());
        } else if (currentSection === "improvements" && (trimmedLine.startsWith("-") || trimmedLine.startsWith("*") || /^\d\./.test(trimmedLine))) {
            sections.areas_for_improvement.push(trimmedLine.replace(/^[-*]|\d\./, "").trim());
        }
    }

    // --- STAGE 3: Final Fallback ---
    if (!sections.overall_feedback && sections.strengths.length === 0 && sections.areas_for_improvement.length === 0) {
        return {
            overall_feedback: content.substring(0, 500),
            strengths: ["Review transcript for strengths"],
            areas_for_improvement: ["Review transcript for areas of improvement"]
        };
    }

    return {
        overall_feedback: sections.overall_feedback.trim() || "Thank you for completing the interview.",
        strengths: sections.strengths.length > 0 ? sections.strengths : ["Communication", "Professionalism"],
        areas_for_improvement: sections.areas_for_improvement.length > 0 ? sections.areas_for_improvement : ["Discuss specific examples", "Technical depth"]
    };
}

// Test cases
const testCase1 = `OVERALL:
Great performance today. You showed strong React skills.
STRENGTHS:
- Solid hooks knowledge
- Good communication
IMPROVEMENTS:
- Need more unit testing examples
- Elaborate on CSS modules`;

const testCase2 = `Here is your feedback:
{
  "overall_feedback": "Excellent work.",
  "strengths": ["JS", "React"],
  "areas_for_improvement": ["Node"]
}`;

const testCase3 = `You did okay but need more practice. Just keep trying your best.`;

console.log("Test Case 1 (Markers):", JSON.stringify(mockParser(testCase1), null, 2));
console.log("\nTest Case 2 (JSON):", JSON.stringify(mockParser(testCase2), null, 2));
console.log("\nTest Case 3 (Conversational Fallback):", JSON.stringify(mockParser(testCase3), null, 2));
