import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Compass, MapPin, CheckCircle2, Circle, AlertCircle, Play, 
  Map, Sparkles, BookOpen, Clock, Code, Library, Loader2, ArrowRight, Check
} from "lucide-react";
import { LearningRoadmap, Milestone } from "../types";

// Built-in Seed Preset Roadmaps (Instant activation if offline/unconfigured)
const PRESET_MUSTER: LearningRoadmap[] = [
  {
    role: "Fullstack React & Node.js Engineer",
    focus: "MERN Stack & Scalability",
    milestones: [
      {
        id: "m1",
        title: "Advanced JavaScript Engine & ESM",
        duration: "Week 1",
        description: "Master modern async behaviors, execution scopes, event loops, and module specifications.",
        concepts: ["Prototypal Inheritance", "Closures & Scope Traps", "Microtasks & Coroutines", "ES Modules (import/export)"],
        challenge: {
          taskTitle: "JS Async Pipeline Mapper",
          taskObjective: "Write a high-order function to execute an array of asynchronous tasks sequentially and collect results in an object map.",
          starterCode: `/**
 * Sequential async mapper.
 * Runs promises sequentially.
 */
async function runAsyncSequence(tasks) {
  const results = [];
  // Write your execution sequence loop here
  
  return results;
}`,
          expectedOutput: "Array of completed promise results mapped sequentially."
        }
      },
      {
        id: "m2",
        title: "Frontend Rendering & State Architectures",
        duration: "Week 2-3",
        description: "Develop structural web architectures using React 19, virtual DOM diffing, and state propagation.",
        concepts: ["Virtual DOM Reconciliation", "React Fiber Arch", "React Context vs Redux/Zustand", "Custom Hooks & Memoization"],
        challenge: {
          taskTitle: "Custom State Engine hook",
          taskObjective: "Implement a simulated state hook that allows subscribing to parts of a global nested state object.",
          starterCode: `function createSlice(initialState) {
  let state = initialState;
  const listeners = [];
  
  return {
    getState: () => state,
    update: (fn) => {
      // Complete state update and trigger callbacks
    },
    subscribe: (listener) => {
      // Add standard listener
    }
  };
}`,
          expectedOutput: "A functional reactive store slice."
        }
      },
      {
        id: "m3",
        title: "Backend API Layer & Middleware Patterns",
        duration: "Week 4-5",
        description: "Build robust, secure, and performant backend services using Node.js and Express.",
        concepts: ["Express Middleware Routing", "JWT Authentication Flow", "Rate Limiting & CORS", "Security Parsers (Helmet)"],
        challenge: {
          taskTitle: "Auth Guard Middleware",
          taskObjective: "Write an Express-style middleware function that validates bearer authorization tokens.",
          starterCode: `function authGuard(req, res, next) {
  const authHeader = req.headers.authorization;
  // Parse, validate, call next() or send 401
}`,
          expectedOutput: "Successfully decoded JWT context or 401 response status."
        }
      }
    ]
  },
  {
    role: "AI & Data Engineer",
    focus: "Gemini Integration & Model Training",
    milestones: [
      {
        id: "m1_ai",
        title: "Generative AI SDK & Prompt Structure",
        duration: "Week 1",
        description: "Connect to foundational LLM models, orchestrate temperature, custom tokens, and system instructions.",
        concepts: ["Google Gen AI SDK", "System Prompt Guardrails", "Token Size Management", "JSON Response Schema Mapping"],
        challenge: {
          taskTitle: "JSON Guardrail Request",
          taskObjective: "Construct a robust system instruction requesting formatted JSON containing precise recipe measurements.",
          starterCode: `const promptInstructions = "Act as culinary bot...";
// Target: JSON response Schema template config.`,
          expectedOutput: "Valid JSON schema parameters conforming to Type.OBJECT."
        }
      },
      {
        id: "m2_ai",
        title: "Vector Databases & Dense Semantic Retrieval",
        duration: "Week 2",
        description: "Generate mathematical sentence embeddings and index them inside vector query structures.",
        concepts: ["Cosine Similarity Vectors", "FAISS / Pinecone Indexing", "Retrieval Augmented Generation (RAG)", "Document Chunk Parsers"],
        challenge: {
          taskTitle: "Vector Cosine Score Matcher",
          taskObjective: "Write a high-performance function to compute math cosine similarity between two float vectors.",
          starterCode: `function cosineSimilarity(vecA, vecB) {
  // Compute Dot Product / Magnitudes
  return 0; // Return rating
}`,
          expectedOutput: "A precise float value representing overlap (0.0 to 1.0)."
        }
      }
    ]
  }
];

interface RoadmapsProps {
  onPracticeChallenge?: (challenge: any) => void;
}

export default function CareerRoadmaps({ onPracticeChallenge }: RoadmapsProps) {
  const [roleInput, setRoleInput] = useState<string>("");
  const [focusInput, setFocusInput] = useState<string>("");
  const [level, setLevel] = useState<string>("Mid-level");
  
  const [roadmap, setRoadmap] = useState<LearningRoadmap>(PRESET_MUSTER[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>("m1");

  const [completedMilestones, setCompletedMilestones] = useState<string[]>([]);

  // Trigger Preset Roadmap Loading
  const handleLoadPreset = (index: number) => {
    const preset = PRESET_MUSTER[index];
    setRoadmap(preset);
    setSelectedMilestoneId(preset.milestones[0]?.id || "");
    setErrorMsg("");
  };

  // Generate customized roadmap using Gemini backend
  const handleGenerateCustomRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleInput.trim()) {
      setErrorMsg("Please enter a target engineering role first (e.g. Backend Go Developer)");
      return;
    }

    setIsLoading(true);
    setRoadmap({ role: roleInput, focus: focusInput || "All-rounder", milestones: [] });
    setErrorMsg("");

    try {
      const res = await fetch("/api/gemini/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: roleInput,
          focus: focusInput || "Generalist Development",
          currentLevel: level
        })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed server roadmap request.");
      }

      const generated: LearningRoadmap = await res.ok ? await res.json() : null;
      if (!generated || !generated.milestones || generated.milestones.length === 0) {
        throw new Error("Gemini returned empty milestones. Please try another specific role.");
      }

      setRoadmap(generated);
      setSelectedMilestoneId(generated.milestones[0]?.id || "");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred while generating. Check if API keys are configured in Secrets.");
      // Fallback safely to a preset
      setRoadmap(PRESET_MUSTER[0]);
      setSelectedMilestoneId("m1");
    } finally {
      setIsLoading(false);
    }
  };

  const currentMilestone = roadmap.milestones.find(m => m.id === selectedMilestoneId) || roadmap.milestones[0];

  const toggleMilestoneCompletion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid altering selected active milestone
    setCompletedMilestones(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div id="roadmaps-section" className="space-y-8">
      {/* Top Details Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 tracking-tight">
            <Compass className="w-6 h-6 text-indigo-600" />
            AI Career Clarity Engine
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Build personal learning roadmaps with targeted milestones, study guides, and integrated coding challenges.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Parameters Form & Presets load */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl p-6 shadow-xs">
            <h3 className="text-md font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mb-4">
              <Sparkles className="w-4 h-4 text-purple-500" /> Model Your Custom Goal
            </h3>

            <form onSubmit={handleGenerateCustomRoadmap} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Target Developer Role</label>
                <input
                  type="text"
                  placeholder="e.g., Python Backend Engineer, Devops"
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  className="w-full text-xs font-sans px-3.5 py-2.5 rounded-xl border border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Focus Technologies / Skill targets</label>
                <input
                  type="text"
                  placeholder="e.g., FastAPI, Kubernetes, Docker"
                  value={focusInput}
                  onChange={(e) => setFocusInput(e.target.value)}
                  className="w-full text-xs font-sans px-3.5 py-2.5 rounded-xl border border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Your Experience Level</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {["Junior", "Mid-level", "Senior"].map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setLevel(lvl)}
                      className={`py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
                        level === lvl
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-50 text-gray-500 hover:bg-gray-150 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                id="btn-generate-roadmap"
                disabled={isLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-150 dark:shadow-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Synthesizing roadmap...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Generate AI Roadmap</span>
                  </>
                )}
              </button>
            </form>

            {errorMsg && (
              <div className="mt-4 p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-950/40 rounded-xl text-[11px] text-rose-700 dark:text-rose-400 leading-relaxed flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl p-6 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Preset Pathways</h4>
            <div className="space-y-2">
              <button
                id="btn-preset-fullstack"
                onClick={() => handleLoadPreset(0)}
                className="w-full text-left p-3 rounded-xl border border-gray-100 dark:border-gray-850 hover:bg-gray-50 dark:hover:bg-gray-900 flex items-center justify-between cursor-pointer transition"
              >
                <div>
                  <div className="text-xs font-semibold text-gray-800 dark:text-white">🚀 Fullstack Web Architect</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Focus: React, Fiber, APIs, JWT</div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>

              <button
                id="btn-preset-data-ai"
                onClick={() => handleLoadPreset(1)}
                className="w-full text-left p-3 rounded-xl border border-gray-100 dark:border-gray-850 hover:bg-gray-50 dark:hover:bg-gray-900 flex items-center justify-between cursor-pointer transition"
              >
                <div>
                  <div className="text-xs font-semibold text-gray-800 dark:text-white">🧠 AI & Data Engineer</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Focus: GenAI SDKs, RAG, Embeddings</div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive graphical roadmap and detailing */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Visual Vertical Roadmap Node Selector */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Map className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                {roadmap.role ? roadmap.role : "Syllabus Map"}
              </h3>
            </div>

            {isLoading && roadmap.milestones.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-900 min-h-[300px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
                <p className="text-xs text-gray-500 text-center">Consulting server-side AI architect for industry-standard pathways...</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-indigo-100 dark:border-indigo-950/80 pl-6 ml-3 space-y-6">
                {roadmap.milestones.map((milestone, idx) => {
                  const isActive = milestone.id === selectedMilestoneId;
                  const isChecked = completedMilestones.includes(milestone.id);

                  return (
                    <div
                      key={milestone.id}
                      onClick={() => setSelectedMilestoneId(milestone.id)}
                      className={`relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-indigo-50/50 border-indigo-200 shadow-xs dark:bg-indigo-950/20 dark:border-indigo-900"
                          : "bg-white border-gray-100 hover:border-gray-200 dark:bg-gray-950 dark:border-gray-900 dark:hover:border-gray-850"
                      }`}
                    >
                      {/* Node Bullet */}
                      <div className="absolute -left-[33px] top-6 bg-white dark:bg-gray-950">
                        <button
                          onClick={(e) => toggleMilestoneCompletion(milestone.id, e)}
                          className="focus:outline-none cursor-pointer"
                        >
                          {isChecked ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <Circle className={`w-5 h-5 ${isActive ? "text-indigo-600" : "text-gray-300 dark:text-gray-700"}`} />
                          )}
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 capitalize">
                            {milestone.duration}
                          </span>
                          {isChecked && (
                            <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 px-1.5 py-0.5 rounded-md uppercase">Committed</span>
                          )}
                        </div>
                        
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                          {milestone.title}
                        </h4>
                        
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Details Panel of Selected Milestone */}
          <div className="md:col-span-7">
            {currentMilestone ? (
              <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl p-6 shadow-xs space-y-6">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-mono font-semibold uppercase">
                    <Clock className="w-3.5 h-3.5" /> Actionable Target: {currentMilestone.duration}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white font-sans mt-1">
                    {currentMilestone.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                    {currentMilestone.description}
                  </p>
                </div>

                {/* Core concepts to master */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Library className="w-3.5 h-3.5" /> Core Concepts Checklist
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {currentMilestone.concepts && currentMilestone.concepts.map((concept, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50/50 dark:bg-gray-900/40 rounded-xl text-xs text-gray-700 dark:text-gray-300">
                        <Check className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                        <span>{concept}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Integration coding challenge block */}
                {currentMilestone.challenge && (
                  <div className="p-4 rounded-2xl bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                        <Code className="w-4 h-4" /> Lab Challenge
                      </h4>
                      <span className="text-[10px] font-mono text-gray-400">Sandbox Ready</span>
                    </div>

                    <div className="space-y-1">
                      <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {currentMilestone.challenge.taskTitle}
                      </h5>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                        {currentMilestone.challenge.taskObjective}
                      </p>
                    </div>

                    {onPracticeChallenge && (
                      <button
                        onClick={() => onPracticeChallenge(currentMilestone.challenge)}
                        className="flex items-center gap-1 bg-white hover:bg-gray-50 border border-gray-150 text-indigo-700 dark:bg-gray-900 dark:border-gray-800 dark:text-indigo-400 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition w-full justify-center shadow-xs"
                      >
                        <Play className="w-3 h-3 text-indigo-500 fill-indigo-500" />
                        <span>Practice Challenge in Playground</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl p-12 text-center text-gray-400">
                <Compass className="w-8 h-8 text-gray-350 mx-auto mb-2" />
                <p className="text-xs">Select any milestone bullet to expand details and launch compiler challenges.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
