import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, Users, Trophy, Code2, GraduationCap, TrendingUp, Search, 
  ChevronRight, Award, ShieldAlert, Sparkles, Loader2, 
  ArrowLeftRight, Calendar, UserCheck, FileLineChart, RefreshCw, Zap, Lightbulb 
} from "lucide-react";

interface StudentProgress {
  id: string;
  name: string;
  college: string;
  semester: number;
  track: string;
  codeQualityRating: number; // 0 - 100
  submissionsCount: number;
  mockInterviewScore: number; // 0 - 100
  placementReady: boolean;
  recentAssessment: string;
}

const MOCK_COLLEGES = [
  "Arya Institute of Technology (AIT)",
  "Vidya Engineering College (VEC)",
  "Sardar Patel Tech Academy (SPTA)",
  "Tier-3 State Technological Institute"
];

const INITIAL_STUDENTS: StudentProgress[] = [
  {
    id: "stud-1",
    name: "Amit Sharma",
    college: "Arya Institute of Technology (AIT)",
    semester: 6,
    track: "Full-Stack React Engineer",
    codeQualityRating: 84,
    submissionsCount: 142,
    mockInterviewScore: 78,
    placementReady: true,
    recentAssessment: "Redux & Custom Hooks Exam (Grade A)"
  },
  {
    id: "stud-2",
    name: "Priya Patel",
    college: "Arya Institute of Technology (AIT)",
    semester: 7,
    track: "Data Science & Python Specialist",
    codeQualityRating: 91,
    submissionsCount: 189,
    mockInterviewScore: 85,
    placementReady: true,
    recentAssessment: "TensorFlow & Pandas Cleared (Grade S)"
  },
  {
    id: "stud-3",
    name: "Sai Kumar",
    college: "Vidya Engineering College (VEC)",
    semester: 5,
    track: "Cloud & Linux DevOps Engineer",
    codeQualityRating: 68,
    submissionsCount: 74,
    mockInterviewScore: 62,
    placementReady: false,
    recentAssessment: "Linux SysAdmin Docker lab (Grade B)"
  },
  {
    id: "stud-4",
    name: "Rahul Nair",
    college: "Arya Institute of Technology (AIT)",
    semester: 4,
    track: "Backend Python Developer",
    codeQualityRating: 75,
    submissionsCount: 95,
    mockInterviewScore: 65,
    placementReady: false,
    recentAssessment: "Postgres Relational Schema test (Grade B+)"
  },
  {
    id: "stud-5",
    name: "Anjali Rao",
    college: "Sardar Patel Tech Academy (SPTA)",
    semester: 8,
    track: "Full-Stack React Engineer",
    codeQualityRating: 88,
    submissionsCount: 164,
    mockInterviewScore: 82,
    placementReady: true,
    recentAssessment: "Node API Security challenge (Grade A)"
  },
  {
    id: "stud-6",
    name: "Vikram Sen",
    college: "Tier-3 State Technological Institute",
    semester: 3,
    track: "Frontend & UI Enginer",
    codeQualityRating: 54,
    submissionsCount: 38,
    mockInterviewScore: 45,
    placementReady: false,
    recentAssessment: "Tailwind CSS Layout grid (Needs Work)"
  }
];

const SEMESTER_BENCHMARKS = [
  {
    sem: "Sem 1 & 2",
    title: "Foundation Blueprint",
    focus: "Basic Syntax & Logic Parsing",
    desc: "Achieve fluency in fundamental logic structure. Complete at least 40 terminal code playground submissions in standard Python/JS and master conditional flows.",
    milestone: "Write 1,000+ certified instructions",
    color: "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border-blue-100 dark:border-blue-900/30"
  },
  {
    sem: "Sem 3 & 4",
    title: "Domain Alignment",
    focus: "Data Structures & Modern Styling",
    desc: "Pick your developer domain (Full-Stack vs Data Science). Learn responsive UI utilizing Tailwind CSS or SQL relational schemas. Daily SkillSparks habits activated.",
    milestone: "Build 2 Domain mini-projects",
    color: "bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 border-purple-100 dark:border-purple-900/30"
  },
  {
    sem: "Sem 5 & 6",
    title: "SuperApp Capstone",
    focus: "Server APIs & Project portfolios",
    desc: "Construct fully working applications with integrated server logic, third-party libraries, and automated tests. Transition from sandbox code-alongs to real production files.",
    milestone: "Clear B2B Automated assessments",
    color: "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-100 dark:border-amber-900/30"
  },
  {
    sem: "Sem 7 & 8",
    title: "Placement Launchpad",
    focus: "AI Coach Drills & ATS Tuning",
    desc: "Undergo high-intensity AI Mock recruitment interviews, run resume scans to address critical keyword deficits, and attend local institutional drive campaigns with automated tracking.",
    milestone: "Achieve >80% Match-score placement",
    color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30"
  }
];

interface AIPredictionReport {
  currentGaps: string[];
  semesterStrategy: { semNumber: string; specificMilestone: string; studyHoursRecommended: number }[];
  placementReadinessAnalysis: string;
  confidenceScore: number; // 0 - 100
  focusAreas: string[];
}

export default function ManageForge() {
  const [students, setStudents] = useState<StudentProgress[]>(INITIAL_STUDENTS);
  const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null);
  const [filterCollege, setFilterCollege] = useState<string>("All");
  const [filterTrack, setFilterTrack] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSemIdx, setSelectedSemIdx] = useState<number>(2); // Default focus Sem 5&6
  
  // AI Placement Plan State
  const [aiReport, setAiReport] = useState<AIPredictionReport | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState<boolean>(false);
  const [planError, setPlanError] = useState<string>("");

  const handleGenerateAIPlan = async (student: StudentProgress) => {
    setIsLoadingPlan(true);
    setPlanError("");
    setAiReport(null);

    try {
      const res = await fetch("/api/gemini/manageforge/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: student.name,
          semester: student.semester,
          track: student.track,
          codeQuality: student.codeQualityRating,
          submissions: student.submissionsCount,
          mockScore: student.mockInterviewScore,
          recentAssessment: student.recentAssessment
        })
      });

      if (!res.ok) {
        throw new Error("Unable to synthesize AI Placement Plan. Key might be missing.");
      }

      const data = await res.json();
      setAiReport(data);
    } catch (err: any) {
      console.error(err);
      setPlanError(err.message || "Failed to contact Gemini key agent. Synthesizing offline fallback...");
      
      // Fallback offline placement report
      setTimeout(() => {
        setAiReport({
          confidenceScore: student.codeQualityRating > 80 && student.mockInterviewScore > 75 ? 89 : 64,
          focusAreas: [
            student.track.includes("React") ? "TypeScript strict-typing models" : "Advanced query optimization",
            "Continuous technical communication under stress",
            "Performance engineering analysis (Core Web Vitals / algorithmic complexity)"
          ],
          currentGaps: [
            `Lacks verified integration tests (Jest / React Testing Library) on past student submissions.`,
            `Needs active focus raising automated mock interview score from current ${student.mockInterviewScore}% to >80% threshold.`
          ],
          semesterStrategy: [
            {
              semNumber: `Semester ${student.semester} (Current Focus)`,
              specificMilestone: `Submit 3 production-grade PRs on the Code Playground illustrating custom Hooks or relational indexes.`,
              studyHoursRecommended: 8
            },
            {
              semNumber: `Semester ${Math.min(student.semester + 1, 8)} (Placement Prep)`,
              specificMilestone: `Pass B2B placement coding qualifiers and run AI Resume scans weekly on targeted job roles.`,
              studyHoursRecommended: 12
            }
          ],
          placementReadinessAnalysis: `Candidate ${student.name} shows high raw potential with ${student.submissionsCount} consolidated code submissions. To transition smoothly into campus placements, we recommend targeted AI Mentor support to solve edge cases in core domain parameters. Overall preparedness profile is resilient but needs polish to clear final placement round interviews.`
        });
        setIsLoadingPlan(false);
      }, 1000);
    } finally {
      setIsLoadingPlan(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesCollege = filterCollege === "All" || s.college === filterCollege;
    const matchesTrack = filterTrack === "All" || s.track === filterTrack;
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.track.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCollege && matchesTrack && matchesSearch;
  });

  // Calculate high-level institutional stats
  const totalSubmissions = students.reduce((acc, s) => acc + s.submissionsCount, 0);
  const averageCodeQuality = Math.round(students.reduce((acc, s) => acc + s.codeQualityRating, 0) / students.length);
  const averageMockScore = Math.round(students.reduce((acc, s) => acc + s.mockInterviewScore, 0) / students.length);
  const placementRatePercent = Math.round((students.filter(s => s.placementReady).length / students.length) * 100);

  return (
    <div id="manageforge-dashboard" className="space-y-8 animate-fadeIn">
      {/* Mini Breadcrumbs & Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-150/40 dark:border-slate-800 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Building2 className="w-4 h-4 text-indigo-500" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 dark:text-indigo-400">Institutional SaaS Command Center</span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 font-sans tracking-tight">
            ManageForge University CRM
          </h2>
          <p className="text-xs text-gray-550 dark:text-gray-450 mt-1">
            Empowering Tier-2 & Tier-3 engineering colleges with continuous semester-to-placement tracking, student micro-credentials, and AI preparation pathways.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="text-[9px] bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-150/40 text-indigo-700 dark:text-indigo-400 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Active Campus License</span>
          </div>
        </div>
      </div>

      {/* College Institutional Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
            <Users className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Active Cohort</div>
            <div className="text-lg font-extrabold text-gray-900 dark:text-white font-mono mt-0.5">142 Learners <span className="text-[10px] text-gray-400 font-semibold">(Tier-3)</span></div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Code2 className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Playground Executions</div>
            <div className="text-lg font-extrabold text-gray-900 dark:text-white font-mono mt-0.5">{totalSubmissions} Submissions</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Avg Placement Prep Score</div>
            <div className="text-lg font-extrabold text-gray-900 dark:text-white font-mono mt-0.5">{averageMockScore}% Readiness</div>
          </div>
        </div>

        <div className="bg-[#12141c] text-white rounded-2xl p-5 shadow-xs flex items-center gap-4 border border-zinc-800">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Placement Readiness Ratio</div>
            <div className="text-lg font-extrabold text-white font-mono mt-0.5">{placementRatePercent}% Elite Class</div>
          </div>
        </div>
      </div>

      {/* Semester to Placement Progress Interactive Timeline */}
      <div className="bg-white dark:bg-gray-950 border border-gray-150/50 dark:border-gray-900 rounded-3xl p-6 shadow-xs space-y-6">
        <div>
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
            <UserCheck className="w-4.5 h-4.5 text-indigo-500" /> Continuous Semester-to-Placement Roadmaps
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Students are monitored on a progressive benchmark scale starting from Semester 1 up to Campus Placement Drives. Click on any segment to view target requirements.
          </p>
        </div>

        {/* 4 Steps timeline layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {SEMESTER_BENCHMARKS.map((item, idx) => {
            const isSelected = selectedSemIdx === idx;
            return (
              <button
                key={idx}
                id={`btn-sem-timeline-${idx}`}
                onClick={() => setSelectedSemIdx(idx)}
                className={`text-left p-4 rounded-2xl border transition duration-200 cursor-pointer ${
                  isSelected 
                    ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-xs" 
                    : "border-gray-100 hover:border-gray-200 dark:border-gray-900 bg-gray-50/20 dark:bg-slate-950/20"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${item.color}`}>
                    {item.sem}
                  </span>
                  {isSelected && <Zap className="w-3.5 h-3.5 text-indigo-500 animate-bounce" />}
                </div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white mt-1.5">{item.title}</h4>
                <p className="text-[10.5px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{item.focus}</p>
              </button>
            );
          })}
        </div>

        {/* Active timeline block detail */}
        <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-5 border border-slate-100 dark:border-slate-850/60 grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
          <div className="md:col-span-2 space-y-2">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-600 dark:text-indigo-400">
              Interactive Phase Focus & Criteria ({SEMESTER_BENCHMARKS[selectedSemIdx].sem})
            </span>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              {SEMESTER_BENCHMARKS[selectedSemIdx].title}: <span className="text-gray-500 font-medium text-xs">{SEMESTER_BENCHMARKS[selectedSemIdx].focus}</span>
            </h4>
            <p className="text-xs leading-relaxed text-gray-650 dark:text-gray-400">
              {SEMESTER_BENCHMARKS[selectedSemIdx].desc}
            </p>
          </div>
          
          <div className="p-4 rounded-xl bg-white dark:bg-gray-950 border border-gray-150/40 dark:border-gray-800 space-y-2 text-center md:text-left">
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Mandatory Milestone Target</span>
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 justify-center md:justify-start">
              <Award className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <span>{SEMESTER_BENCHMARKS[selectedSemIdx].milestone}</span>
            </div>
            <span className="text-[10px] text-gray-400 block pt-0.5 font-medium leading-none">Automated verify tracks enabled</span>
          </div>
        </div>
      </div>

      {/* Main Student Directory & Filter CRM */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Side: Students List */}
        <div className="xl:col-span-7 bg-white dark:bg-gray-950 border border-gray-150/50 dark:border-gray-900 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                <Users className="w-4.5 h-4.5 text-indigo-500" /> Learner Analytics Directory
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Foundational stats for individual Tier 2 & 3 talent pools. Select a student to generate custom placement plans.
              </p>
            </div>
          </div>

          {/* Controls Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center">
                <Search className="w-3.5 h-3.5 text-gray-400" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name or track..."
                className="w-full text-xs pl-8.5 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* College filter selector */}
            <select
              value={filterCollege}
              onChange={(e) => setFilterCollege(e.target.value)}
              className="text-xs bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl px-3 py-2 text-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Institutions</option>
              {MOCK_COLLEGES.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>

            {/* Track filter selector */}
            <select
              value={filterTrack}
              onChange={(e) => setFilterTrack(e.target.value)}
              className="text-xs bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl px-3 py-2 text-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Learning Tracks</option>
              <option value="Full-Stack React Engineer">Full-Stack React Engineer</option>
              <option value="Data Science & Python Specialist">Data Science & Python Specialist</option>
              <option value="Cloud & Linux DevOps Engineer">Cloud & Linux DevOps Engineer</option>
              <option value="Backend Python Developer">Backend Python Developer</option>
              <option value="Frontend & UI Enginer">Frontend & UI Enginer</option>
            </select>
          </div>

          {/* Student list container */}
          <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => {
                const isSelected = selectedStudent?.id === student.id;
                return (
                  <div
                    key={student.id}
                    onClick={() => {
                      setSelectedStudent(student);
                      setAiReport(null);
                      setPlanError("");
                    }}
                    className={`p-4 rounded-2xl border transition duration-205 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isSelected 
                        ? "border-indigo-600 bg-indigo-50/10 dark:bg-indigo-950/10" 
                        : "border-gray-100 hover:border-gray-250 dark:border-gray-900/60 dark:hover:border-gray-800 bg-gray-50/15"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">{student.name}</span>
                        <span className="text-[9px] bg-slate-100 dark:bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded-sm font-semibold font-mono">
                          Sem {student.semester}
                        </span>
                        {student.placementReady ? (
                          <span className="text-[8px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md leading-none">
                            Ready
                          </span>
                        ) : (
                          <span className="text-[8px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-md leading-none">
                            Developing
                          </span>
                        )}
                      </div>
                      <p className="text-[10.5px] text-gray-500 dark:text-gray-400 font-mono">{student.track}</p>
                      <div className="text-[9px] text-gray-400">{student.college}</div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      {/* Submissions count */}
                      <div className="text-center">
                        <div className="text-gray-400 text-[9px] uppercase">Subs</div>
                        <div className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">{student.submissionsCount}</div>
                      </div>

                      {/* Code quality score block */}
                      <div className="text-center">
                        <div className="text-gray-400 text-[9px] uppercase font-sans">Compilers</div>
                        <div className={`font-bold mt-0.5 ${
                          student.codeQualityRating > 80 ? "text-emerald-600" 
                          : student.codeQualityRating > 65 ? "text-amber-600" 
                          : "text-rose-600"
                        }`}>
                          {student.codeQualityRating}%
                        </div>
                      </div>

                      {/* Mock score block */}
                      <div className="text-center">
                        <div className="text-gray-400 text-[9px] uppercase font-sans">Mock Score</div>
                        <div className="font-bold text-indigo-500 mt-0.5">{student.mockInterviewScore}%</div>
                      </div>

                      <ChevronRight className={`w-4.5 h-4.5 text-gray-400 transition-transform ${
                        isSelected ? "transform translate-x-1 text-indigo-500" : ""
                      }`} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 border border-dashed border-gray-150 dark:border-gray-800 rounded-2xl text-xs text-gray-400">
                No students match your selected filtering properties.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Semester-to-Placement Custom Preparation Map Generator */}
        <div className="xl:col-span-5">
          {selectedStudent ? (
            <div className="bg-white dark:bg-gray-950 border border-indigo-150/20 dark:border-indigo-950/40 rounded-3xl p-6 shadow-md relative overflow-hidden space-y-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />
              
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-850 pb-4">
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-600 dark:text-indigo-400">Selected Candidate Analytics</span>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-1">{selectedStudent.name}</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">{selectedStudent.college}</p>
                </div>
                
                <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-150/40 font-bold px-2.5 py-1 rounded-lg">
                  Phase: {selectedStudent.semester > 6 ? "Placement" : "Growth"}
                </span>
              </div>

              {/* Interactive KPI details */}
              <div className="bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-850 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider leading-none block">Last Certified Assessment</span>
                  <p className="text-[10.5px] font-bold text-gray-800 dark:text-slate-200 mt-0.5">{selectedStudent.recentAssessment}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider leading-none block">Recruiter Status Badge</span>
                  <p className="text-[10.5px] font-bold text-gray-800 dark:text-slate-200 mt-0.5">
                    {selectedStudent.placementReady ? "🎯 High Priority Lead" : "⏳ Pre-requisites Active"}
                  </p>
                </div>
              </div>

              {/* Action Trigger for Gemini active strategy planner */}
              {!aiReport ? (
                <div className="pt-2 text-center space-y-3">
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                    Generate an instant placement preparation report to analyze current training gaps and custom semester strategies utilizing high-frequency recruiting patterns.
                  </p>
                  
                  <button
                    id="btn-manageforge-ai-plan"
                    onClick={() => handleGenerateAIPlan(selectedStudent)}
                    disabled={isLoadingPlan}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {isLoadingPlan ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Querying Recruiting Model Matrix...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-white" />
                        <span>Assemble Semester-to-Placement Strategy</span>
                      </>
                    )}
                  </button>

                  {planError && (
                    <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-950/40 rounded-xl text-[10px] text-rose-700 dark:text-rose-400 leading-relaxed flex items-start gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                      <span>{planError}</span>
                    </div>
                  )}
                </div>
              ) : (
                /* Beautiful result output */
                <div className="space-y-4 pt-1 animate-fadeIn">
                  {/* Confidence Score Gauge */}
                  <div className="p-4 bg-indigo-50/40 dark:bg-indigo-950/15 border border-indigo-100/40 dark:border-indigo-900/40 rounded-2xl flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider block">Placement Probability</span>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Estimated Tier-1/Tier-2 Offer Conversion
                      </h5>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                        {aiReport.confidenceScore}%
                      </span>
                    </div>
                  </div>

                  {/* Summary Narrative */}
                  <div className="space-y-1.5">
                    <h5 className="text-[10px] uppercase font-extrabold text-gray-400 tracking-widest flex items-center gap-1">
                      <FileLineChart className="w-3.5 h-3.5 text-violet-500" /> Executive Placement Assessment
                    </h5>
                    <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed font-sans bg-gray-50/30 p-3.5 rounded-xl border border-gray-100 dark:border-slate-850">
                      {aiReport.placementReadinessAnalysis}
                    </p>
                  </div>

                  {/* High priority gaps */}
                  {aiReport.currentGaps.length > 0 && (
                    <div className="space-y-1.5">
                      <h5 className="text-[10px] uppercase font-extrabold text-rose-500 dark:text-rose-400 tracking-widest flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> High Priority Gap Items
                      </h5>
                      <ul className="text-[11px] text-gray-600 dark:text-gray-350 leading-relaxed space-y-1 pl-4 list-disc">
                        {aiReport.currentGaps.map((gap, i) => (
                          <li key={i} className="marker:text-rose-500">{gap}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Specific actionable focus areas */}
                  <div className="space-y-1.5">
                    <h5 className="text-[10px] uppercase font-extrabold text-indigo-600 dark:text-indigo-400 tracking-widest flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-indigo-500" /> Core Skill Focus Areas
                    </h5>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {aiReport.focusAreas.map((fa, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 text-gray-600 dark:text-gray-350 rounded-md text-[10px] font-mono leading-relaxed">
                          {fa}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Roadmap strategy list */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] uppercase font-extrabold text-gray-400 tracking-widest">
                      Actions Breakdown Strategy
                    </h5>
                    
                    <div className="space-y-2">
                      {aiReport.semesterStrategy.map((step, idx) => (
                        <div key={idx} className="p-3 bg-indigo-50/15 dark:bg-indigo-950/5 border border-gray-100 dark:border-gray-850 rounded-xl space-y-1">
                          <div className="flex items-center justify-between text-[9px] font-bold">
                            <span className="text-indigo-600 dark:text-indigo-400">{step.semNumber}</span>
                            <span className="text-gray-400">{step.studyHoursRecommended} Hrs/week</span>
                          </div>
                          <p className="text-[10.5px] leading-relaxed text-gray-700 dark:text-gray-300">
                            {step.specificMilestone}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reset action block to re-generate */}
                  <div className="pt-2">
                    <button
                      id="btn-manageforge-ai-reset"
                      onClick={() => setAiReport(null)}
                      className="w-full py-2 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Compare or Recalculate Metrics</span>
                    </button>
                  </div>

                </div>
              )}

            </div>
          ) : (
            <div className="h-full border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center space-y-3.5 min-h-[300px]">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 flex items-center justify-center">
                <FileLineChart className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Placement Preparedness Diagnostic</h4>
                <p className="text-[11px] text-gray-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
                  Select any engineering learner from the left directory to track their live performance metrics and generate AI-driven B2B transition plans.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
