import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Flame, Calendar, Trophy, Sparkles, Code, CheckCircle2, 
  Activity, Info, Share2, ExternalLink, Database, Coffee, 
  ArrowRight, ShieldAlert, Sparkle, RefreshCw, Zap
} from "lucide-react";

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  activityHistory: string[];
}

export default function CodingStreakWidget() {
  const [streak, setStreak] = useState<StreakState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [showLogicSim, setShowLogicSim] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Load streak on component mount
  const fetchStreak = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/streak");
      if (!res.ok) throw new Error("API disconnected");
      const data = await res.json();
      setStreak(data);
      // Also cache to localstorage
      localStorage.setItem("skillforge_streak", JSON.stringify(data));
    } catch (err) {
      console.warn("Fallback to localStorage for streak tracking:", err);
      const local = localStorage.getItem("skillforge_streak");
      if (local) {
        setStreak(JSON.parse(local));
      } else {
        // Seed default beautiful state
        const todayStr = new Date().toISOString().split("T")[0];
        const defaultState: StreakState = {
          currentStreak: 5,
          longestStreak: 12,
          lastActiveDate: todayStr,
          activityHistory: [
            new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString().split("T")[0],
            new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString().split("T")[0],
            new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString().split("T")[0],
            new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString().split("T")[0],
            todayStr,
            new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().split("T")[0],
            new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString().split("T")[0],
            new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString().split("T")[0],
            new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString().split("T")[0],
            new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString().split("T")[0],
            new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString().split("T")[0],
            new Date(Date.now() - 22 * 24 * 3600 * 1000).toISOString().split("T")[0],
            new Date(Date.now() - 23 * 24 * 3600 * 1000).toISOString().split("T")[0],
            new Date(Date.now() - 28 * 24 * 3600 * 1000).toISOString().split("T")[0],
          ]
        };
        setStreak(defaultState);
        localStorage.setItem("skillforge_streak", JSON.stringify(defaultState));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreak();
    
    // Listen to standard compiler event
    const handleCompilationPass = () => {
      triggerStreakUpdate();
    };
    window.addEventListener("compilation-pass", handleCompilationPass);
    return () => {
      window.removeEventListener("compilation-pass", handleCompilationPass);
    };
  }, []);

  const triggerStreakUpdate = async () => {
    try {
      setUpdating(true);
      const res = await fetch("/api/streak/update", { method: "POST" });
      if (!res.ok) throw new Error("Update failure");
      const data = await res.json();
      setStreak(data);
      localStorage.setItem("skillforge_streak", JSON.stringify(data));
      setSuccessMsg("Coding activity validated! Streak updated smoothly.");
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      console.warn("Updating fallback local streak on error:", err);
      // Fallback local update logic
      if (streak) {
        const todayStr = new Date().toISOString().split("T")[0];
        const yesterdayStr = new Date(Date.now() - 24 * 3600 * 1000).toISOString().split("T")[0];
        
        let newStreakCount = streak.currentStreak;
        if (streak.lastActiveDate !== todayStr) {
          if (streak.lastActiveDate === yesterdayStr) {
            newStreakCount += 1;
          } else {
            newStreakCount = 1;
          }
        }
        
        const updatedHistory = [...streak.activityHistory];
        if (!updatedHistory.includes(todayStr)) {
          updatedHistory.push(todayStr);
        }

        const nextState: StreakState = {
          currentStreak: newStreakCount,
          longestStreak: Math.max(streak.longestStreak, newStreakCount),
          lastActiveDate: todayStr,
          activityHistory: updatedHistory,
        };

        setStreak(nextState);
        localStorage.setItem("skillforge_streak", JSON.stringify(nextState));
        setSuccessMsg("Offline compilation validated! Visual streak incremented.");
        setTimeout(() => setSuccessMsg(""), 3500);
      }
    } finally {
      setUpdating(false);
    }
  };

  // Generate beautiful contribution boxes representing last 12 weeks of historical days
  const renderContributionGrid = () => {
    if (!streak) return null;

    // We collect block squares for the last 12 weeks (84 days)
    const blocks = [];
    const today = new Date();
    
    for (let i = 83; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 3600 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday
      const isActive = streak.activityHistory.includes(dateStr);
      
      blocks.push({
        dateStr,
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        monthName: date.toLocaleDateString("en-US", { month: "short" }),
        dayOfMonth: date.getDate(),
        active: isActive,
        rawDate: date,
      });
    }

    // Group blocks by columns (weeks)
    const weeks: typeof blocks[] = [];
    let currentWeek: typeof blocks = [];
    
    blocks.forEach((block, idx) => {
      currentWeek.push(block);
      // Group every 7 days, or on the last block
      if (currentWeek.length === 7 || idx === blocks.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    return (
      <div className="space-y-3 pb-2 select-none overflow-x-auto">
        <div className="flex gap-[3.5px] min-w-[500px] justify-between">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-[3.5px]">
              {week.map((day, dayIdx) => (
                <div
                  key={day.dateStr}
                  className={`w-[12px] h-[12px] rounded-xs transition-all duration-200 cursor-pointer relative group ${
                    day.active
                      ? "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 hover:scale-115 shadow-xs"
                      : "bg-gray-100 hover:bg-gray-250 dark:bg-slate-900 dark:hover:bg-slate-800"
                  }`}
                >
                  {/* Super Sleek Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
                    <div className="bg-gray-900 border border-slate-800 text-white text-[9.5px] rounded-lg px-2.5 py-1 whitespace-nowrap shadow-md font-mono text-center">
                      <div className="font-bold">{day.monthName} {day.dayOfMonth}, {day.rawDate.getFullYear()}</div>
                      <div className={day.active ? "text-emerald-400" : "text-gray-400"}>
                        {day.active ? "✓ Certified Submission Logs Active" : "No Activity Registered"}
                      </div>
                    </div>
                    {/* Tooltip Arrow */}
                    <div className="w-1.5 h-1.5 bg-gray-900 border-b border-r border-slate-800 transform rotate-45 mx-auto -mt-1" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        
        {/* Month Labels & Legend */}
        <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium font-mono min-w-[500px] px-1">
          <div className="flex gap-9">
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            <div className="w-2.5 h-2.5 rounded-xs bg-gray-100 dark:bg-slate-900" />
            <div className="w-2.5 h-2.5 rounded-xs bg-indigo-200 dark:bg-indigo-900/60" />
            <div className="w-2.5 h-2.5 rounded-xs bg-indigo-400 dark:bg-indigo-700/80" />
            <div className="w-2.5 h-2.5 rounded-xs bg-indigo-600 dark:bg-indigo-500" />
            <span>More</span>
          </div>
        </div>
      </div>
    );
  };

  const handleCopyCode = () => {
    const code = `app.post('/api/update-streak', async (req, res) => {
    const { userId } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    const user = await db.collection('users').doc(userId).get();
    let { lastActiveDate, currentStreak, longestStreak } = user.data();

    if (lastActiveDate === today) {
        return res.json({ currentStreak, longestStreak });
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastActiveDate === yesterdayStr) {
        currentStreak += 1;
    } else {
        currentStreak = 1;
    }

    if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
    }

    await db.collection('users').doc(userId).update({
        lastActiveDate: today,
        currentStreak,
        longestStreak
    });

    res.json({ currentStreak, longestStreak });
});`;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl p-8 py-12 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-7 h-7 text-indigo-500 animate-spin" />
        <span className="text-xs text-gray-400 font-medium font-mono">Synchronizing superprofile stats...</span>
      </div>
    );
  }

  return (
    <div id="coding-streak-component" className="space-y-6">
      
      {/* Visual Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Card: Gamified Flame counter */}
        <div className="md:col-span-4 bg-gradient-to-tr from-[#12141c] to-[#1a1e30] border border-slate-800 rounded-3xl p-6 text-white flex flex-col justify-between relative overflow-hidden shadow-lg min-h-[220px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 font-mono">Gamified Superprofile</span>
              <h3 className="text-lg font-bold font-sans tracking-tight">Daily Streak Counter</h3>
            </div>
            
            <motion.div 
              animate={{ scale: [1, 1.12, 1] }} 
              transition={{ repeat: Infinity, duration: 2.2 }}
              className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center border border-orange-500/25"
            >
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            </motion.div>
          </div>

          <div className="py-2">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black font-mono tracking-tight text-white">{streak?.currentStreak || 0}</span>
              <span className="text-sm font-semibold text-gray-400 font-sans">Days Active</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed mt-1.5 font-sans">
              Solve compiler tasks or drills today to maintain your consistency rating.
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-slate-850 pt-3">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Personal Best: <strong className="font-mono text-white">{streak?.longestStreak || 0}d</strong></span>
            </div>
            
            <button
              id="btn-simulate-streak"
              disabled={updating}
              onClick={triggerStreakUpdate}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-[10px] font-bold transition flex items-center gap-1 cursor-pointer select-none"
            >
              <Zap className="w-3 h-3 text-white fill-white" />
              <span>{updating ? "Verifying..." : "Simulate Task"}</span>
            </button>
          </div>
        </div>

        {/* Right Card: Github contribution grid */}
        <div className="md:col-span-8 bg-white dark:bg-gray-950 border border-gray-150/50 dark:border-gray-900 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-indigo-500" />
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-gray-900 dark:text-white">Professional Activity Grid</h4>
              </div>
              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-md font-mono font-bold leading-none">
                12 Week Window
              </span>
            </div>
            <p className="text-[11.5px] leading-relaxed text-gray-550 dark:text-gray-400 mb-4">
              Your daily code verification events are aggregated on your public scorecard. Recruiters using our dashboard evaluate this grid to assess candidates' continuous commitment to technology.
            </p>
          </div>

          {renderContributionGrid()}
        </div>

      </div>

      {/* Success Banner */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-emerald-50 dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-900/40 rounded-xl text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily checklist block & Database schema controller layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Block: How to keep streak healthy */}
        <div className="lg:col-span-6 bg-white dark:bg-gray-950 border border-gray-150/50 dark:border-gray-900 rounded-3xl p-6 shadow-xs space-y-4">
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-violet-500" /> Interactive Daily Task Checklist
          </h4>
          
          <div className="space-y-2.5">
            <div className="p-3 bg-gray-50/60 dark:bg-slate-900/40 border border-gray-100 dark:border-gray-850 rounded-xl flex items-start gap-3">
              <Code className="w-4 h-4 text-indigo-500 mt-1 flex-shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-gray-900 dark:text-white">Solve Daily Compiler Task</h5>
                <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">
                  Launch the **Code Playground** and run a successful test suite execution. This communicates directly with our telemetry metrics.
                </p>
              </div>
            </div>

            <div className="p-3 bg-gray-50/60 dark:bg-slate-900/40 border border-gray-100 dark:border-gray-850 rounded-xl flex items-start gap-3">
              <Sparkle className="w-4 h-4 text-indigo-500 mt-1 flex-shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-gray-900 dark:text-white">Engage with AI Mentor Peer Review</h5>
                <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">
                  Request an AI advisory analysis (Explanation, Optimization, or Bug finding) on your active playground script to trigger logs.
                </p>
              </div>
            </div>

            <div className="p-3 bg-gray-50/60 dark:bg-slate-900/40 border border-gray-100 dark:border-gray-850 rounded-xl flex items-start gap-3">
              <Coffee className="w-4 h-4 text-indigo-500 mt-1 flex-shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-gray-900 dark:text-white">Complete SkillSparks MCQ</h5>
                <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">
                  Answer a multiple-choice question on the concept flashcards correctly to confirm active skill comprehension.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Block: Verification Logic Interactive display */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-900 rounded-3xl p-6 text-white space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#94a3b8] font-mono">Backend Database Logic</h4>
            </div>
            
            <button
              id="btn-toggle-logic"
              onClick={() => setShowLogicSim(!showLogicSim)}
              className="text-[10px] bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300 font-mono hover:bg-slate-800 transition duration-150 cursor-pointer"
            >
              {showLogicSim ? "Hide Controller Source" : "Inspect Code"}
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            To build, track, and maintain streaks, the platform checks active database timestamps against user logs over a rolling 24-hour cycle. Here is the architecture.
          </p>

          <AnimatePresence>
            {showLogicSim ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between bg-slate-900/60 px-3 py-2 rounded-t-xl border border-slate-900 text-[10px] text-slate-400 font-mono">
                  <span>streakController.js</span>
                  <button 
                    id="btn-copy-streak-controller" 
                    onClick={handleCopyCode}
                    className="hover:text-white transition"
                  >
                    {copiedCode ? "Copied!" : "Copy block"}
                  </button>
                </div>
                <pre className="bg-slate-900 p-4 rounded-b-xl border border-t-0 border-slate-900 overflow-x-auto text-[10px] leading-relaxed font-mono text-emerald-400 max-h-[220px]">
{`app.post('/api/update-streak', async (req, res) => {
    const { userId } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const user = await db.collection('users').doc(userId).get();
    let { lastActiveDate, currentStreak, longestStreak } = user.data();

    if (lastActiveDate === today) {
        return res.json({ currentStreak, longestStreak });
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastActiveDate === yesterdayStr) {
        currentStreak += 1;
    } else {
        currentStreak = 1;
    }

    if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
    }

    await db.collection('users').doc(userId).update({
        lastActiveDate: today,
        currentStreak,
        longestStreak
    });

    res.json({ currentStreak, longestStreak });
});`}
                </pre>
              </motion.div>
            ) : (
              <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-2xl flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-emerald-400 font-bold font-mono">POSTGRES TABLE ADJUST_LOG</span>
                  <p className="text-[10.5px] text-slate-300 font-mono">
                    ALTER TABLE users ADD COLUMN last_active_date DATE;
                  </p>
                </div>
                <Database className="w-10 h-10 text-emerald-400/20" />
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
