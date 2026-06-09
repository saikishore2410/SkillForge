import React, { useState, useEffect } from "react";
import { 
  Compass, Code, BookOpen, MessageCircle, Library, Sparkles, 
  Cpu, CheckCircle, Github, Heart, AlertCircle, MapPin, Layers,
  Menu, X, Building2, Copy, Check, Flame
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import CareerRoadmaps from "./components/CareerRoadmaps";
import CodePlayground from "./components/CodePlayground";
import SkillSparks from "./components/SkillSparks";
import MockInterview from "./components/MockInterview";
import InterviewCheatSheets from "./components/InterviewCheatSheets";
import ResumeOptimizer from "./components/ResumeOptimizer";
import ManageForge from "./components/ManageForge";
import CodingStreakWidget from "./components/CodingStreakWidget";
import { Challenge } from "./types";

const navigationItems = [
  { id: "roadmaps", name: "AI Career Roadmaps", icon: Compass, badge: "Assess" },
  { id: "playground", name: "Code Playground", icon: Code, badge: "Compile" },
  { id: "snaps", name: "SkillSparks Learning", icon: BookOpen, badge: "Snack" },
  { id: "streak", name: "Superprofile Streaks", icon: Flame, badge: "Hot" },
  { id: "interview", name: "AI Mock Coach", icon: MessageCircle, badge: "Live" },
  { id: "cheatsheets", name: "Interview Cheatsheets", icon: Library, badge: "Read" },
  { id: "resume", name: "AI Resume Scan", icon: Layers, badge: "Align" },
  { id: "manageforge", name: "ManageForge B2B", icon: Building2, badge: "SaaS" }
] as const;

export default function App() {
  const [activeTab, setActiveTab] = useState<"roadmaps" | "playground" | "snaps" | "streak" | "interview" | "cheatsheets" | "resume" | "manageforge">("roadmaps");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [importedChallenge, setImportedChallenge] = useState<Challenge | null>(null);
  const [geminiConfigured, setGeminiConfigured] = useState<boolean>(true);
  const [copiedCopyright, setCopiedCopyright] = useState<boolean>(false);

  const handleCopyCopyright = () => {
    navigator.clipboard.writeText("SkillForge Developer SuperApp Engine © 2026. All rights reserved.");
    setCopiedCopyright(true);
    setTimeout(() => setCopiedCopyright(false), 2000);
  };

  // Check backend server configuration status on startup
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setGeminiConfigured(!!data.geminiConfigured);
      })
      .catch((err) => {
        console.warn("Backend not ready or status unconfigured", err);
      });
  }, []);

  // Handler to route active challenges straight from roadmap to playgrounds
  const handlePracticeChallenge = (challenge: Challenge) => {
    setImportedChallenge(challenge);
    setActiveTab("playground");
  };

  const handleClearImported = () => {
    setImportedChallenge(null);
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] dark:bg-slate-950 text-gray-800 dark:text-gray-100 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-250">
      
      {/* Top Main Navigation Header Banner */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-150/40 dark:border-slate-800/80 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-xs">
        {/* Left Brand Area */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-150 dark:shadow-none font-bold text-lg select-none">
            S
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-sans">
              <span className="font-extrabold tracking-tight text-gray-900 dark:text-white text-sm">SkillForge</span>
              <span className="text-[9px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 font-bold px-1.5 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/40 uppercase tracking-wider">SuperApp</span>
            </div>
            <p className="text-[9px] text-gray-400 font-medium">Careers & Tech Playgrounds</p>
          </div>
        </div>

        {/* Center: Desktop horizontal Nav Bar Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`btn-navbar-desktop-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 relative cursor-pointer select-none ${
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="desktopActiveTabPill"
                    className="absolute inset-0 bg-indigo-50/75 dark:bg-indigo-950/30 rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
                {item.badge === "Live" && (
                  <span className="text-[8px] bg-rose-500 text-white font-extrabold px-1 rounded-sm uppercase tracking-wider animate-pulse">
                    Live
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Info Link & Mobile Menu Button Toggle */}
        <div className="flex items-center gap-3">
          {/* Missing API key hint */}
          {!geminiConfigured && (
            <div className="hidden xl:flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 px-3 py-1 rounded-lg text-[9px] text-amber-700 dark:text-amber-400 font-semibold shadow-xs">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>Presets operational (API Key Unset)</span>
            </div>
          )}

          {/* Core version tag */}
          <span className="hidden sm:inline-flex text-[10px] font-bold text-gray-400 uppercase tracking-widest items-center gap-1">
            <Cpu className="w-4 h-4 text-indigo-600 animate-spin" style={{ animationDuration: '4s' }} />
            V1.2 Active
          </span>

          {/* Hamburger menu button */}
          <button
            id="mobile-navigation-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -mr-1 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition lg:hidden cursor-pointer text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Swipeable category ribbon list for mobile / tablet screens */}
      <div className="lg:hidden sticky top-[69px] z-40 bg-white/95 dark:bg-slate-900/95 border-b border-gray-100 dark:border-slate-800/80 px-4 py-2 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-1.5 backdrop-blur-md">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 select-none cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-gray-100/50 hover:bg-gray-100 text-gray-600 dark:bg-slate-900 dark:border dark:border-slate-800 dark:text-gray-400 dark:hover:bg-slate-805"
              }`}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Drawer menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-b border-gray-150/50 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest pl-1">Primary Modules</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-slate-850 bg-gray-50/50 dark:bg-slate-950"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{item.name}</span>
                      </div>
                      <span className="text-[9px] font-mono opacity-80 uppercase">{item.badge}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tips block in mobile menu */}
              <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 text-white rounded-2.5xl p-4 border border-indigo-900/30">
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Mentor Career Insight
                </h5>
                <p className="text-[10px] leading-relaxed mt-1 text-slate-300">
                  "Great developers don't memorize frameworks—they master execution patterns. Spend 15 minutes checking event architectures each morning!"
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Workspace Frame container (Full horizontal space) */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        
        {/* Core Tab Workspaces Router content view */}
        <main className="w-full">
          {activeTab === "roadmaps" && (
            <CareerRoadmaps onPracticeChallenge={handlePracticeChallenge} />
          )}

          {activeTab === "playground" && (
            <CodePlayground 
              importedChallenge={importedChallenge} 
              onClearImported={handleClearImported} 
            />
          )}

          {activeTab === "snaps" && (
            <SkillSparks />
          )}

          {activeTab === "streak" && (
            <CodingStreakWidget />
          )}

          {activeTab === "interview" && (
            <MockInterview />
          )}

          {activeTab === "cheatsheets" && (
            <InterviewCheatSheets />
          )}

          {activeTab === "resume" && (
            <ResumeOptimizer />
          )}

          {activeTab === "manageforge" && (
            <ManageForge />
          )}
        </main>

      </div>

      {/* Humble Footer */}
      <footer className="border-t border-gray-100 dark:border-slate-850 mt-auto px-6 py-4 text-center text-[11px] text-gray-450 dark:text-gray-500 flex flex-col md:flex-row items-center justify-between max-w-7xl w-full mx-auto gap-2">
        <span className="flex items-center gap-1 justify-center">
          Crafted for high-performance micro-learning, mimicking platform features.
        </span>
        <button
          id="btn-copy-copyright"
          onClick={handleCopyCopyright}
          className="flex items-center gap-1.5 justify-center hover:text-indigo-600 dark:hover:text-indigo-400 bg-gray-50/50 dark:bg-slate-900/50 hover:bg-indigo-50/20 dark:hover:bg-slate-800/40 px-2.5 py-1 rounded-lg border border-gray-150/40 dark:border-slate-800 transition duration-150 cursor-pointer text-[10px] select-none text-gray-500 dark:text-gray-400 font-medium"
          title="Click to copy copyright text"
        >
          <span>{copiedCopyright ? "Copied to clipboard!" : "SkillForge Developer SuperApp Engine © 2026"}</span>
          {copiedCopyright ? (
            <Check className="w-3 h-3 text-emerald-500" />
          ) : (
            <Copy className="w-3 h-3 text-gray-400" />
          )}
        </button>
      </footer>

    </div>
  );
}
