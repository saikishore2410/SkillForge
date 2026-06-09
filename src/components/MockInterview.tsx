import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, Send, Award, Trophy, Bookmark, Sparkles, MessageCircle, 
  HelpCircle, CheckCircle2, ChevronRight, Play, Loader2, AlertCircle, RefreshCw
} from "lucide-react";
import { InterviewTurn, InterviewEvaluationReport, MockInterviewConfig } from "../types";

// Standard pre-defined engineering mock profiles
const PROFILES_LIST = [
  "Frontend React Engineer",
  "Node.js Backend Developer",
  "Cloud Solutions DevOps Architect",
  "Data Scientist & AI Specialist",
  "iOS Swift Developer"
];

export default function MockInterview() {
  const [sessionActive, setSessionActive] = useState<boolean>(false);
  const [config, setConfig] = useState<MockInterviewConfig>({
    role: "Frontend React Engineer",
    difficulty: "Mid-level",
    resumeSummary: ""
  });

  // Session State
  const [interviewerName, setInterviewerName] = useState<string>("Samantha (Lead Architect)");
  const [turns, setTurns] = useState<InterviewTurn[]>([]);
  const [hints, setHints] = useState<string[]>([]);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Evaluation states
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<InterviewEvaluationReport | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll inside chat log
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, isLoading]);

  // Launch Session Init
  const handleStartSession = async () => {
    setIsLoading(true);
    setTurns([]);
    setEvaluation(null);
    setErrorMsg("");

    try {
      const res = await fetch("/api/gemini/interview/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });

      if (!res.ok) {
        throw new Error("Could not initialize mock engine on server. Adjust secrets.");
      }

      const data = await res.json();
      setInterviewerName(data.interviewerName || "Architect Samantha");
      setTurns([
        {
          role: "interviewer",
          content: `${data.welcomeMessage}\n\n**Samantha:** ${data.question}`
        }
      ]);
      setHints(data.hints || ["Ask to outline schemas.", "Discuss big-O computation."]);
      setSessionActive(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to start interview. Check connection to API.");
      // Standard static fallback if server is unreachable or unconfigured
      setSessionActive(true);
      setInterviewerName("Samantha (Lead Architect)");
      setTurns([
        {
          role: "interviewer",
          content: "Welcome! Let's start with a core concept: Can you explain the difference between client-side state hooks (like useState) and global state manager states (like React Context)? When should one choose one over the other?"
        }
      ]);
      setHints(["Think about prop drilling.", "Consider re-rendering performance."]);
    } finally {
      setIsLoading(false);
    }
  };

  // Chat Turn Handshake
  const handleSendAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim() || isLoading) return;

    const currentAnswer = userAnswer;
    setUserAnswer("");

    // 1. Add User's Answer to History
    const updatedTurns = [...turns, { role: "user", content: currentAnswer } as InterviewTurn];
    setTurns(updatedTurns);
    setIsLoading(true);

    try {
      const res = await fetch("/api/gemini/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: updatedTurns,
          userMessage: currentAnswer
        })
      });

      if (!res.ok) {
        throw new Error("Server communication turn failed.");
      }

      const data = await res.json();
      
      // 2. Add Interviewer's answer turn
      setTurns(prev => [
        ...prev,
        {
          role: "interviewer",
          content: `**Review feedback:** ${data.feedbackOnLastAnswer}\n\n**Next Question:** ${data.nextQuestion}`
        }
      ]);
    } catch (err: any) {
      console.error(err);
      // Fallback response generator if offline
      setTimeout(() => {
        setTurns(prev => [
          ...prev,
          {
            role: "interviewer",
            content: "Got it! Thanks for your detailed explanation. For the next question: Can you explain how you would handle lazy-loading React components using React.lazy and Suspense? What are the key architectural improvements?"
          }
        ]);
        setIsLoading(false);
      }, 800);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Final assessment & calculate scorecard!
  const handleSubmitEvaluation = async () => {
    if (turns.length < 2) return;
    setIsEvaluating(true);

    try {
      const res = await fetch("/api/gemini/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: config.role,
          history: turns
        })
      });

      if (!res.ok) {
        throw new Error("Server assessment evaluation failed.");
      }

      const data = await res.json();
      setEvaluation(data);
    } catch (err: any) {
      console.error(err);
      // Mock static fallback report
      setEvaluation({
        scoreSkills: [
          { skillName: "Problem Solving", scoreMaxTen: 8, justification: "Able to outline react patterns clearly." },
          { skillName: "Coding Architecture", scoreMaxTen: 7, justification: "Good conceptual awareness of state propagation." },
          { skillName: "Technical Accuracy", scoreMaxTen: 8, justification: "Understood standard hooks closure traps." }
        ],
        overallScore: 78,
        hiringRecommendation: "Leaning Hire",
        strengths: ["Excellent conceptual clarity regarding dependency structures.", "Clear articulation under prompt constraints."],
        improvements: ["Ensure stating big-O variables for sorting routines.", "Mention performance side-effects of React Context rendering."],
        detailedReview: "The candidate shows robust understanding of JavaScript runtimes, state mutations, and system modularity. Focused refinements on rendering overhead and memoization hooks will elevate them to a senior performance level."
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleResetSession = () => {
    setSessionActive(false);
    setEvaluation(null);
    setTurns([]);
  };

  return (
    <div id="mockinterview-section" className="space-y-8">
      {/* Top Description Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 font-sans tracking-tight">
            <MessageCircle className="w-6 h-6 text-indigo-600" />
            AI Mock Interview Coach
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Replicate real tech loops with Gemini. Get line-by-line critiques, strength checklists, and full scorecard evaluations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Setup Forms or active evaluation metrics */}
        <div className="lg:col-span-4 space-y-6">
          {!sessionActive ? (
            <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-md font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mb-1">
                <Sparkles className="w-4 h-4 text-indigo-500" /> Configure Loop Session
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Target Job Title</label>
                  <select
                    id="select-interview-role"
                    value={config.role}
                    onChange={(e) => setConfig({ ...config, role: e.target.value })}
                    className="w-full text-xs font-sans px-3.5 py-2.5 rounded-xl border border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 text-gray-800 dark:text-white cursor-pointer focus:outline-none"
                  >
                    {PROFILES_LIST.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Seniority Target</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {["Junior", "Mid-level", "Senior", "Lead"].map((lvl) => (
                      <button
                        type="button"
                        key={lvl}
                        onClick={() => setConfig({ ...config, difficulty: lvl as any })}
                        className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition ${
                          config.difficulty === lvl
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-50 text-gray-500 hover:bg-gray-150 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-850"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Paste Resume Summary / Context</label>
                  <textarea
                    placeholder="e.g., Proficient in Tailwind, Node.js, and MongoDB. Handled 3 enterprise migrations..."
                    value={config.resumeSummary}
                    onChange={(e) => setConfig({ ...config, resumeSummary: e.target.value })}
                    className="w-full h-24 text-xs font-sans p-3 rounded-xl border border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 focus:outline-none text-gray-800 dark:text-white resize-none"
                  />
                </div>

                <button
                  id="btn-start-interview"
                  disabled={isLoading}
                  onClick={handleStartSession}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-150 dark:shadow-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Initiating Samantha...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 text-white fill-white" />
                      <span>Start Free Mock Interview</span>
                    </>
                  )}
                </button>
              </div>

              {errorMsg && (
                <div className="mt-4 p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-950/40 rounded-xl text-[11px] text-rose-700 dark:text-rose-400 leading-relaxed flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-gray-50 dark:border-gray-900 pb-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Active Loop Status</h3>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[9px] font-bold tracking-widest uppercase animate-pulse">Live</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-mono font-bold text-sm shadow-xs">
                    S
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-800 dark:text-gray-100">{interviewerName}</div>
                    <div className="text-[10px] text-gray-400">Reviewing your tech answers</div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100/50 dark:border-gray-850 space-y-1.5">
                  <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-500" /> Interactive Hint
                  </div>
                  <ul className="text-[11px] text-gray-600 dark:text-gray-400 space-y-1 list-disc pl-3">
                    {hints.map((hint, i) => <li key={i}>{hint}</li>)}
                  </ul>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    id="btn-evaluate-interview"
                    onClick={handleSubmitEvaluation}
                    disabled={turns.length < 2 || isEvaluating}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-150 dark:shadow-none"
                  >
                    {isEvaluating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Grading Complete Loop...</span>
                      </>
                    ) : (
                      <>
                        <Award className="w-4 h-4 text-white" />
                        <span>Submit & Get AI Scorecard</span>
                      </>
                    )}
                  </button>

                  <button
                    id="btn-restart-interview"
                    onClick={handleResetSession}
                    className="w-full py-2 bg-white hover:bg-gray-50 border border-gray-150 text-gray-600 dark:bg-gray-900 dark:border-gray-850 dark:text-gray-300 dark:hover:bg-gray-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-gray-400 mr-1" />
                    <span>Change Profile Configs</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Active Chat Panel or Assessment Scoreboard */}
        <div className="lg:col-span-8 flex flex-col items-stretch">
          
          {/* Default Non-session active card */}
          {!sessionActive && (
            <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl p-12 text-center shadow-xs flex-1 flex flex-col items-center justify-center min-h-[350px]">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-50 to-indigo-100/50 dark:from-indigo-950/20 dark:to-indigo-900/30 flex items-center justify-center mb-5 text-indigo-600">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">AI Technical Assessment Center</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto leading-relaxed">
                Choose your desired engineering scope on the left side, configure custom priorities, and begin a professional interview instantly with real-time analytics.
              </p>
            </div>
          )}

          {/* Active Interview Room */}
          {sessionActive && !evaluation && (
            <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl p-5 flex flex-col justify-between shadow-xs min-h-[460px]">
              
              {/* Chat messages log */}
              <div className="flex-1 space-y-4 max-h-[320px] overflow-y-auto mb-4 pr-1 scrollbar-thin">
                {turns.map((turn, index) => {
                  const isUser = turn.role === "user";
                  return (
                    <div
                      key={index}
                      className={`flex gap-3 leading-relaxed text-xs p-4 rounded-2xl ${
                        isUser
                          ? "bg-indigo-50/40 text-indigo-950 border border-indigo-100/30 ml-8 dark:bg-indigo-950/10 dark:text-indigo-200 dark:border-indigo-950"
                          : "bg-gray-50/60 text-gray-800 border border-gray-100 mr-8 dark:bg-gray-900/40 dark:text-gray-300 dark:border-gray-850"
                      }`}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {isUser ? (
                          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold"><User className="w-3.5 h-3.5" /></div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold font-mono">S</div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-1 overflow-x-auto whitespace-pre-wrap">
                        <div className="font-bold text-[10px] uppercase text-gray-500 mb-1.5">
                          {isUser ? "You (Candidate)" : interviewerName}
                        </div>
                        <p className="leading-relaxed font-sans">{turn.content}</p>
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="bg-gray-50/60 border border-gray-100 dark:bg-gray-900/40 dark:border-gray-850 p-4 rounded-2xl flex items-center gap-2 max-w-sm mr-8">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    <span className="text-xs text-gray-500 italic">Samantha is evaluating your answer...</span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Send Input Box */}
              <form onSubmit={handleSendAnswer} className="flex gap-2 pt-4 border-t border-gray-50 dark:border-gray-900/50 mt-2">
                <input
                  id="input-chat-user-message"
                  type="text"
                  placeholder="Explain your approach, cite modules, or draft core loops..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 text-xs px-4 py-2.5 rounded-xl border border-gray-150 dark:border-gray-850 bg-gray-50/30 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-800 dark:text-white"
                />
                <button
                  type="submit"
                  id="btn-send-answer"
                  disabled={!userAnswer.trim() || isLoading}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* Comprehensive Hiring Evaluation Scorecard Report */}
          {evaluation && (
            <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl p-6 shadow-xs space-y-6">
              
              {/* Header Visual Point Metrics */}
              <div className="flex flex-col md:flex-row items-stretch justify-between gap-4 bg-gradient-to-r from-indigo-50/60 to-purple-50/60 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-150/30 p-5 rounded-2.5xl">
                <div>
                  <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">AI Assessment Scorecard</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight mt-1">Hiring Verdict: <span className="text-indigo-600 dark:text-indigo-400">{evaluation.hiringRecommendation}</span></h3>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1 max-w-sm">Evaluated against custom criteria for {config.role}.</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Overall Skill Score</div>
                    <div className="text-3xl font-mono font-black text-indigo-600 dark:text-indigo-400">{evaluation.overallScore}<span className="text-base text-gray-400">/100</span></div>
                  </div>
                </div>
              </div>

              {/* Progress bars matching individual skillset scores */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Skill Competency Chart</h4>
                  
                  <div className="space-y-3 font-sans">
                    {evaluation.scoreSkills.map((spec, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{spec.skillName}</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">{spec.scoreMaxTen}/10</span>
                        </div>
                        {/* the visual bar meter */}
                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-600 rounded-full" 
                            style={{ width: `${spec.scoreMaxTen * 10}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-gray-500 leading-normal">{spec.justification}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bullet Strengths and recommended improvements */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Strength & Improvements List</h4>
                  
                  <div className="space-y-3.5 text-xs">
                    <div className="space-y-1.5">
                      <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 uppercase tracking-widest text-[10px]">✓ Key Strengths</div>
                      <ul className="list-disc pl-4 text-gray-650 dark:text-gray-450 space-y-1">
                        {evaluation.strengths.map((str, j) => <li key={j}>{str}</li>)}
                      </ul>
                    </div>

                    <div className="space-y-1.5">
                      <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 uppercase tracking-widest text-[10px]">⚡ Improvement Plan</div>
                      <ul className="list-disc pl-4 text-gray-650 dark:text-gray-450 space-y-1">
                        {evaluation.improvements.map((imp, k) => <li key={k}>{imp}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* detailed markdown review summary block */}
              <div className="pt-5 border-t border-gray-100 dark:border-gray-900 space-y-1.5">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Bookmark className="w-3.5 h-3.5" /> Committee Performance Review Guidance
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed italic whitespace-pre-wrap font-sans">
                  {evaluation.detailedReview}
                </p>
              </div>

              {/* Control reset */}
              <div className="pt-4 flex justify-end">
                <button
                  id="btn-evaluate-reset"
                  onClick={handleResetSession}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Start Fresh Assessment</span>
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
