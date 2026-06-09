import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini to prevent startup crashes if key is missing
let aiInstance: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not defined in Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// Health check endpoint
app.get("/api/health", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({ status: "ok", geminiConfigured: hasKey });
});

// 1. Roadmap generator
app.post("/api/gemini/roadmap", async (req, res) => {
  try {
    const { role, focus, currentLevel } = req.body;
    const ai = getGemini();

    const prompt = `Generate a structured, professional learning roadmap for a student aspiring to become a "${role}" with focus on "${focus}". 
The student's current skill level is "${currentLevel}".
Provide a sequential list of milestones representing a cohesive, modern learning pathway.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite, highly experienced technical architect and tech career path counselor. Provide actual coding challenges, detailed concepts, and helpful resources.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["role", "focus", "milestones"],
          properties: {
            role: { type: Type.STRING },
            focus: { type: Type.STRING },
            milestones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["id", "title", "duration", "description", "concepts", "challenge"],
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  description: { type: Type.STRING },
                  concepts: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  challenge: {
                    type: Type.OBJECT,
                    required: ["taskTitle", "taskObjective", "starterCode", "expectedOutput"],
                    properties: {
                      taskTitle: { type: Type.STRING },
                      taskObjective: { type: Type.STRING },
                      starterCode: { type: Type.STRING },
                      expectedOutput: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const roadmapData = JSON.parse(response.text?.trim() || "{}");
    res.json(roadmapData);
  } catch (error: any) {
    console.error("Roadmap generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate roadmap" });
  }
});

// 2. Pair Programmer & Explainer
app.post("/api/gemini/code/explain", async (req, res) => {
  try {
    const { code, language, mode } = req.body; // mode: "explain" | "optimize" | "debug"
    const ai = getGemini();

    let instruction = "";
    if (mode === "explain") {
      instruction = `Line-by-line explanation of the code, identifying its high-level design, underlying data-structures, and algorithms. Make it detailed, clear, and structured.`;
    } else if (mode === "optimize") {
      instruction = `Identify performance bottlenecks, memory concerns, and stylistic anti-patterns. Provide optimized replacement code and explain exactly why the refactored code is superior.`;
    } else {
      instruction = `Scan the code for logic errors, runtime bugs, security gaps, and boundary case flaws. Highlight the precise issues and provide a corrected, robust code solution.`;
    }

    const prompt = `Code written in: ${language}\n\nCode Block:\n\`\`\`${language}\n${code}\n\`\`\`\n\nTask: ${instruction}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a world-class senior staff software engineer and principal compiler architect. Respond in fully formatted, beautiful Markdown, providing code blocks and visual tables where relevant.",
      }
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error("Code advisor error:", error);
    res.status(500).json({ error: error.message || "Failed to request code insights" });
  }
});

// 3. AI Interview: Initiate Session
app.post("/api/gemini/interview/init", async (req, res) => {
  try {
    const { role, difficulty, resumeSummary } = req.body;
    const ai = getGemini();

    const prompt = `Initiate a professional technical role-play chat interview for the position of "${role}" at a high-growth tech startup.
Difficulty tier: ${difficulty}.
${resumeSummary ? `Candidate Profile/Resume: ${resumeSummary}` : ""}

Act strictly as the Interviewer. Introduce yourself and ask the FIRST, challenging technical question. Return the response as JSON containing the introduction, first question, and initial tips.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a friendly but highly technical, analytical Lead Architect doing a coding & systems design interview. Welcome the candidate briefly, and start with ONE direct conceptual/coding question.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["interviewerName", "welcomeMessage", "question", "hints"],
          properties: {
            interviewerName: { type: Type.STRING },
            welcomeMessage: { type: Type.STRING },
            question: { type: Type.STRING },
            hints: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const initData = JSON.parse(response.text?.trim() || "{}");
    res.json(initData);
  } catch (error: any) {
    console.error("Interview init error:", error);
    res.status(500).json({ error: error.message || "Failed to initiate interview" });
  }
});

// 4. AI Interview: Next Turn Chat
app.post("/api/gemini/interview/chat", async (req, res) => {
  try {
    const { history, userMessage } = req.body; // history: Array of { role: "user" | "interviewer", content: string }
    const ai = getGemini();

    const chatMessages = history.map((h: any) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.content }]
    }));

    // Append the current message
    chatMessages.push({
      role: "user",
      parts: [{ text: userMessage }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatMessages,
      config: {
        systemInstruction: `You are the lead interviewer. Analyze the candidate's last answer. 
Briefly acknowledge it (be constructively critical: if it's correct but partial, state what was missing; if wrong, politely set the record straight).
Then, proceed with your NEXT question (total interview should aim for 4-5 high-value questions, escalating in difficulty depending on their previous performance).
Return your response in a JSON containing feedback, the next question, and interactive follow-ups.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["feedbackOnLastAnswer", "nextQuestion", "difficultyRating"],
          properties: {
            feedbackOnLastAnswer: { type: Type.STRING },
            nextQuestion: { type: Type.STRING },
            difficultyRating: { type: Type.STRING, description: "Scale of 1-10" }
          }
        }
      }
    });

    const turnData = JSON.parse(response.text?.trim() || "{}");
    res.json(turnData);
  } catch (error: any) {
    console.error("Interview turn error:", error);
    res.status(500).json({ error: error.message || "Failed to continue interview conversation" });
  }
});

// 5. AI Interview: Evaluate Results
app.post("/api/gemini/interview/evaluate", async (req, res) => {
  try {
    const { role, history } = req.body;
    const ai = getGemini();

    const prompt = `Review the complete technical interview log for the role of "${role}".
Evaluate the candidate's core coding logic, communication style, technical accuracy, and design system awareness.
Provide an objective scoring scorecard, lists of strengths, improvement areas, and a final feedback report.

Full Interview Transcript:
${JSON.stringify(history, null, 2)}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the head of the hiring committee. Assess the technical accuracy and engineering competence shown. Return a detailed JSON evaluation report.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["scoreSkills", "overallScore", "hiringRecommendation", "strengths", "improvements", "detailedReview"],
          properties: {
            scoreSkills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["skillName", "scoreMaxTen", "justification"],
                properties: {
                  skillName: { type: Type.STRING },
                  scoreMaxTen: { type: Type.INTEGER },
                  justification: { type: Type.STRING }
                }
              }
            },
            overallScore: { type: Type.INTEGER, description: "Maximum of 100" },
            hiringRecommendation: { type: Type.STRING, description: "Strong Hire, Hire, Leaning Hire, No Hire" },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            improvements: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            detailedReview: { type: Type.STRING, description: "Full report overview in markdown layout" }
          }
        }
      }
    });

    const evalData = JSON.parse(response.text?.trim() || "{}");
    res.json(evalData);
  } catch (error: any) {
    console.error("Interview evaluation error:", error);
    res.status(500).json({ error: error.message || "Failed to finalize interview assessment" });
  }
});

// 6. Resume Optimization Analyzer
app.post("/api/gemini/resume/optimize", async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    const ai = getGemini();

    const prompt = `Analyze the candidate's resume for keyword alignment, style formatting, grammar errors, and ATS optimization guidelines when targeted against the specified Job Description.
    
Candidate Resume:
${resumeText || "No resume summary provided."}

Target Job Description:
${jobDescription || "Standard Full-Stack Software Engineer."}

Perform a rigorous evaluation. Return the results in structured JSON according to the responseSchema provided.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional hiring director, senior ATS database designer, and technical recruiter. Give constructive, actionable advice on keyword alignment and formatting guidelines. Be thorough.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "matchScore", 
            "formatRating", 
            "foundKeywords", 
            "missingKeywords", 
            "alignmentAnalysis", 
            "recommendedChanges", 
            "atsOptimizationTips"
          ],
          properties: {
            matchScore: { type: Type.INTEGER, description: "Scale of 0 to 100 on how well it fits" },
            formatRating: { type: Type.STRING, description: "Good, Average, Needs Work" },
            foundKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            missingKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            alignmentAnalysis: { type: Type.STRING, description: "Markdown text describing alignment" },
            recommendedChanges: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["section", "currentText", "recommendedText", "explanation"],
                properties: {
                  section: { type: Type.STRING, description: "e.g., Work Experience, Skills" },
                  currentText: { type: Type.STRING, description: "Original phrasing in resume" },
                  recommendedText: { type: Type.STRING, description: "Better phrased text for ATS" },
                  explanation: { type: Type.STRING, description: "Why change this" }
                }
              }
            },
            atsOptimizationTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const reportData = JSON.parse(response.text?.trim() || "{}");
    res.json(reportData);
  } catch (error: any) {
    console.error("Resume optimizer error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze resume" });
  }
});

// Simple in-memory storage for coding streaks with beautiful starter history
let userStreakState = {
  currentStreak: 5,
  longestStreak: 12,
  lastActiveDate: new Date(Date.now()).toISOString().split('T')[0],
  activityHistory: [
    new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString().split('T')[0],
    new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
    new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
    new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString().split('T')[0],
    new Date(Date.now()).toISOString().split('T')[0],
    new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
    new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString().split('T')[0],
    new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString().split('T')[0],
    new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
    new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString().split('T')[0],
    new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString().split('T')[0],
    new Date(Date.now() - 22 * 24 * 3600 * 1000).toISOString().split('T')[0],
    new Date(Date.now() - 23 * 24 * 3600 * 1000).toISOString().split('T')[0],
    new Date(Date.now() - 28 * 24 * 3600 * 1000).toISOString().split('T')[0],
  ]
};

// 7. ManageForge University SaaS Placement Planner
app.get("/api/streak", (req, res) => {
  res.json(userStreakState);
});

app.post("/api/streak/update", (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 3600 * 1000).toISOString().split('T')[0];

    // Check if yesterday or older
    if (userStreakState.lastActiveDate === today) {
      // Already active today, just ensure today is in the history
      if (!userStreakState.activityHistory.includes(today)) {
        userStreakState.activityHistory.push(today);
      }
      return res.json({ message: "Streak already active today", ...userStreakState });
    }

    if (userStreakState.lastActiveDate === yesterday) {
      // Consecutive active day
      userStreakState.currentStreak += 1;
    } else {
      // Streak broken, reset to 1
      userStreakState.currentStreak = 1;
    }

    if (userStreakState.currentStreak > userStreakState.longestStreak) {
      userStreakState.longestStreak = userStreakState.currentStreak;
    }

    userStreakState.lastActiveDate = today;
    if (!userStreakState.activityHistory.includes(today)) {
      userStreakState.activityHistory.push(today);
    }

    res.json({ message: "Streak updated successfully!", ...userStreakState });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/gemini/manageforge/plan", async (req, res) => {
  try {
    const { name, semester, track, codeQuality, submissions, mockScore, recentAssessment } = req.body;
    const ai = getGemini();

    const prompt = `Synthesize a highly customized Engineering Placement Preparation Strategy and Milestone analysis report for continuous student placement readiness evaluation.

Student Demographics & Progress Metrics:
- Name: ${name || "Candidate Name"}
- Target Academic Phase: Semester ${semester || 5} (Tier-2/3 Engineering College student)
- Designated Tech Track: ${track || "Full-Stack React Engineer"}
- Sandbox Compiler Code Quality: ${codeQuality || 65}%
- Total Playground Submissions: ${submissions || 42} execution runs
- AI Mock Recruiter Practice Score: ${mockScore || 60}%
- Recent Automated assessment: ${recentAssessment || "Basic JS syntax check"}

Perform a robust, recruiter-aligned assessment. Predict offer conversion statistics, current preparation gaps in this track, and concrete action strategies for semesters. Output strictly valid structured JSON complying with responseSchema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the head administrator of ManageForge B2B SaaS, an elite campus recruitment partner, and a hiring operations officer. Evaluate Tier-2 and Tier-3 technical student profiles objectively to generate highly tactical milestone plans.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "confidenceScore",
            "focusAreas",
            "currentGaps",
            "semesterStrategy",
            "placementReadinessAnalysis"
          ],
          properties: {
            confidenceScore: { type: Type.INTEGER, description: "Scale of 0 to 100 on probability of converting a full-time engineering offer" },
            focusAreas: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of tech topics to master (e.g., TS interfaces, Redux performance)"
            },
            currentGaps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Weaknesses or missing components e.g., low code submissions, low voice mock scores"
            },
            semesterStrategy: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["semNumber", "specificMilestone", "studyHoursRecommended"],
                properties: {
                  semNumber: { type: Type.STRING, description: "e.g., Semester 5, Semester 6" },
                  specificMilestone: { type: Type.STRING, description: "Concrete target action to address gaps" },
                  studyHoursRecommended: { type: Type.INTEGER, description: "Recommended preparation hours per week" }
                }
              }
            },
            placementReadinessAnalysis: { type: Type.STRING, description: "Compact human summary recommendation analysis" }
          }
        }
      }
    });

    const reportData = JSON.parse(response.text?.trim() || "{}");
    res.json(reportData);
  } catch (error: any) {
    console.error("ManageForge planner error:", error);
    res.status(500).json({ error: error.message || "Failed to generate ManageForge strategy plan" });
  }
});



// -------------------------------------------------------------
// Serve static client assets / Vite setup
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully started on http://localhost:${PORT}`);
  });
}

startServer();
