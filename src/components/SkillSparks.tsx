import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, Trophy, CheckCircle, XCircle, ChevronLeft, ChevronRight, 
  RotateCcw, Sparkles, Filter, Code, Check, HelpCircle 
} from "lucide-react";
import { SkillSparkCard } from "../types";

// Seed technical microlearning snapshots (SkillSparks)
const SEED_SNAPS: SkillSparkCard[] = [
  {
    id: "snap_event_loop",
    title: "The JS Event Loop & Task Queues",
    category: "Javascript",
    summary: "JavaScript is single-threaded, but can handle concurrent operations. It schedules microtasks (Promises, queueMicrotask) ahead of macrotasks (setTimeout, setInterval, postMessage). Microtasks run completely before the next event loop tick render phase.",
    importance: "CRITICAL for avoiding stuttering, resolving race conditions, and correctly predicting asynchronous code outputs.",
    language: "javascript",
    codeSnippet: `console.log("Start");

setTimeout(() => console.log("Timeout"), 0);

Promise.resolve()
  .then(() => console.log("Promise"));

console.log("End");

// Logs sequence:
// 1. "Start"
// 2. "End"
// 3. "Promise" (Microtask Queue)
// 4. "Timeout" (Macrotask Queue)`,
    mcqs: [
      {
        question: "Which asynchronously scheduled operation will execute first in the JS engine?",
        options: [
          "A setTimeout callback with 0ms delay",
          "A Promise.then() callback handler",
          "A setInterval callback on 1ms interval",
          "A requestAnimationFrame animation callback"
        ],
        correctAnswerIndex: 1,
        explanation: "Promise.then() creates a Microtask, which takes immediate priority and executes before any Macrotask (like setTimeout callbacks or setIntervals) in the event loop pipeline."
      },
      {
        question: "What is true about the Microtask queue?",
        options: [
          "It is executed after the current macrotask is fully finished and before rendering",
          "It runs in a separate native OS thread in parallel",
          "It gets cleared once every 1000ms",
          "It strictly processes network requests only"
        ],
        correctAnswerIndex: 0,
        explanation: "The microtask queue is continually drained until empty after every executing script block finishes, prior to returning control to the browser's render update loop."
      }
    ]
  },
  {
    id: "snap_react_closures",
    title: "React State Closures & useEffect",
    category: "React",
    summary: "React effects capture variables from their render cycle definition. If dependencies aren't correctly configured, callback operations execute referencing outdated 'stale' states because the closed scope has a reference to the snapshot of the state at that render time, not the current one.",
    importance: "Saves hours of debugging dynamic counters, event listeners, and live socket connection state caches.",
    language: "typescript",
    codeSnippet: `function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      // ❌ Stale closure alert: count is trapped at 0!
      // setCount(count + 1);
      
      // ✅ Functional update is safe and ignores closures
      setCount(prev => prev + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []); // Trapped since [] was empty!
}`,
    mcqs: [
      {
        question: "Why does count stay at 1 if setInterval calls `setCount(count + 1)` inside effect with empty dependencies?",
        options: [
          "React disables asynchronous updates inside intervals",
          "The interval callback captures the 'count' variable bound to its original value of 0",
          "React re-initializes effect hooks strictly on every tick",
          "Chrome browser blocks active memory references"
        ],
        correctAnswerIndex: 1,
        explanation: "Since the dependency array [] is empty, the useEffect is never re-run, so the callback closes over active lexical scope where 'count' is strictly 0. Every second it runs 'setCount(0 + 1)'."
      }
    ]
  },
  {
    id: "snap_sql_joins",
    title: "SQL Joins & Indexing Performance",
    category: "SQL",
    summary: "Joins combine rows using shared keys. But joining unindexed tables forces the SQL engine to run a Full Table Scan (O(N*M)). Adding foreign key indexes converts it to an Index Lookup (O(N log M) or O(N) using Hash Joins).",
    importance: "Crucial for reducing database load, API response times, and server usage costs in production.",
    language: "sql",
    codeSnippet: `-- ❌ Slow join on unindexed text matching
SELECT orders.id, customers.name
FROM orders
JOIN customers ON orders.customer_uuid = customers.uuid;

-- ✅ Optimize by declaring Index
CREATE INDEX idx_orders_customer_uuid ON orders(customer_uuid);
CREATE INDEX idx_customers_uuid ON customers(uuid);`,
    mcqs: [
      {
        question: "Which join type returns ALL rows from the left table even if there's no match in the right table?",
        options: [
          "INNER JOIN",
          "LEFT JOIN/LEFT OUTER JOIN",
          "RIGHT JOIN",
          "FULL JOIN"
        ],
        correctAnswerIndex: 1,
        explanation: "LEFT JOIN captures every entry from the left table. For unmatched rows in the right table, NULLs are inserted for the right table's columns."
      }
    ]
  },
  {
    id: "snap_python_generators",
    title: "Python Generators vs Lists",
    category: "Python",
    summary: "Python lists load all elements into standard RAM. Generators use lazy-evaluation with 'yield' to compute values on-demand. This maintains constant O(1) memory overhead regardless of sequence size.",
    importance: "Increases processing capabilities for multi-gigabit datasets, CSV parses, and log analytical feeds.",
    language: "python",
    codeSnippet: `# ❌ Memory Heavy List (Loads 10,000,000 floats!)
big_list = [i ** 0.5 for i in range(10000000)]

# ✅ Constant Memory Generator (Lazy Evaluation)
big_gen = (i ** 0.5 for i in range(10000000))

# Custom generator function
def read_log_generator(path):
    with open(path) as f:
        for line in f:
            yield line.strip() # Yields line on iteration`,
    mcqs: [
      {
        question: "What is the primary benefit of generators over list comprehensions in Python?",
        options: [
          "They support index-lookup brackets directly",
          "They execute much faster on single item operations",
          "They have extremely low, constant memory utilization",
          "They preserve variables inside deep file headers"
        ],
        correctAnswerIndex: 2,
        explanation: "Generators evaluate stream components lazily, which allows them to bypass building full collections in system RAM, utilizing constant memory."
      }
    ]
  },
  {
    id: "snap_css_layout",
    title: "CSS Grid vs Flexbox",
    category: "CSS",
    summary: "Flexbox rules are primarily 1-dimensional (content flows either along a row OR a column), adapting content items naturally. CSS Grid is 2-dimensional (controls both rows AND columns simultaneously), creating rigid standard structures.",
    importance: "Ensures flawless responsive alignment without hacking margin gaps or relative offsets.",
    language: "css",
    codeSnippet: `/* ✅ Flexbox: Dynamic inline flow */
.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* ✅ Grid: Rigid 2D layout */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  grid-template-rows: auto;
  gap: 16px;
}`,
    mcqs: [
      {
        question: "Which display mode is ideal for building asymmetrical page grid layouts with differing row weights?",
        options: [
          "flex with absolute wrap",
          "grid with grid-template-areas",
          "inline-block with negative margins",
          "table-cell layouts"
        ],
        correctAnswerIndex: 1,
        explanation: "CSS Grid provides explicit properties for defining multi-dimensional tracks and coordinate boxes, making grid-template-areas perfect for asymmetrical grid grids."
      }
    ]
  }
];

export default function SkillSparks() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [userScore, setUserScore] = useState<number>(0);
  const [answeredMap, setAnsweredMap] = useState<Record<string, number>>({}); // key: snapId_mcqIndex -> chosenIndex
  const [mcqShowFeedback, setMcqShowFeedback] = useState<Record<string, boolean>>({}); // key: snapId_mcqIndex -> boolean

  // Filter cards
  const categories = ["All", "React", "Javascript", "Python", "CSS", "SQL"];
  const filteredCards = SEED_SNAPS.filter(
    (card) => selectedCategory === "All" || card.category === selectedCategory
  );

  // Safe Index Reset on Filter change
  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setActiveCardIndex(0);
    setIsFlipped(false);
  };

  const currentCard = filteredCards[activeCardIndex];

  const handleNext = () => {
    if (activeCardIndex < filteredCards.length - 1) {
      setActiveCardIndex(activeCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (activeCardIndex > 0) {
      setActiveCardIndex(activeCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleOptionSelect = (mcqIndex: number, optionIndex: number) => {
    const key = `${currentCard.id}_${mcqIndex}`;
    if (answeredMap[key] !== undefined) return; // Already answered!

    setAnsweredMap(prev => ({
      ...prev,
      [key]: optionIndex
    }));
    setMcqShowFeedback(prev => ({
      ...prev,
      [key]: true
    }));

    const mcq = currentCard.mcqs[mcqIndex];
    if (optionIndex === mcq.correctAnswerIndex) {
      setUserScore(prev => prev + 100);
    }
  };

  return (
    <div id="skillsparks-section" className="space-y-8">
      {/* Top bar with stats & filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 font-sans tracking-tight">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            SkillSparks Micro-Learning
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Learn crucial coding patterns in 60 seconds with snackable concept cards and MCQs.
          </p>
        </div>
        
        {/* Streak / XP Counter */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100/50 dark:border-indigo-900/30 px-4 py-2 rounded-xl flex items-center gap-3">
          <Trophy className="w-5 h-5 text-amber-500" />
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Your Learning Score</div>
            <div className="text-lg font-mono font-bold text-gray-800 dark:text-gray-100">{userScore} XP</div>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase flex items-center gap-1 mr-2">
          <Filter className="w-3.5 h-3.5" /> Filter Theme:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            id={`btn-filter-${cat}`}
            onClick={() => handleCategorySelect(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
              selectedCategory === cat
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-100 dark:shadow-none"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800 dark:hover:bg-gray-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredCards.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-sm">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">No concept cards found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">We don't have cards for target category yet. Select another category above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Card interactive display: flips on click */}
          <div className="lg:col-span-7 flex flex-col items-center">
            
            {/* The 3D Flip Container */}
            <div 
              id="card-flip-container"
              className="w-full h-[360px] md:h-[400px] cursor-pointer perspective-[1000px]"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div 
                className={`relative w-full h-full duration-700 preserve-3d transform-style ${isFlipped ? "rotate-y-180" : ""}`}
              >
                
                {/* Front Side: Definition & Code */}
                <div className="absolute inset-0 w-full h-full backface-hidden bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xs">
                  <div className="space-y-4 overflow-y-auto max-h-[85%] pr-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/40">
                        {currentCard.category}
                      </span>
                      <span className="text-xs font-mono text-gray-400">
                        Card {activeCardIndex + 1} of {filteredCards.length}
                      </span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold font-sans tracking-tight text-gray-900 dark:text-white">
                      {currentCard.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-sans">
                      {currentCard.summary}
                    </p>

                    {currentCard.codeSnippet && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 rounded-xl font-mono text-[11px] leading-relaxed text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre">
                        <code>{currentCard.codeSnippet}</code>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-900/50 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1 italic">
                      <Code className="w-3.5 h-3.5" /> Tap card to flip and read implementation relevance
                    </span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">Flip Card</span>
                  </div>
                </div>

                {/* Back Side: Importance & Quiz Indicator */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-slate-900 dark:bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between text-white shadow-lg shadow-indigo-100/10">
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-widest">
                        Why It Matters
                      </span>
                      <span className="text-xs text-slate-400">Backside Analysis</span>
                    </div>

                    <h4 className="text-lg font-bold text-slate-100 tracking-tight">Real-World Engineering Application</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {currentCard.importance}
                    </p>

                    <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-900/40 space-y-2">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Interactive MCQ Quiz Ready
                      </h5>
                      <p className="text-[11px] text-slate-300">
                        We have prepared {currentCard.mcqs.length} high-value practice question(s) for this specific topic in the right-side evaluation panel.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
                    <span className="italic">Click to flip back to overview details</span>
                    <span className="font-bold text-amber-400">Concept Snippet</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-4 mt-6">
              <button
                id="btn-prev-snap"
                onClick={handlePrev}
                disabled={activeCardIndex === 0}
                className={`p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850 shadow-xs cursor-pointer transition ${
                  activeCardIndex === 0 ? "opacity-30 cursor-not-allowed" : ""
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium font-mono">
                {activeCardIndex + 1} / {filteredCards.length} Technical Bites
              </span>

              <button
                id="btn-next-snap"
                onClick={handleNext}
                disabled={activeCardIndex === filteredCards.length - 1}
                className={`p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850 shadow-xs cursor-pointer transition ${
                  activeCardIndex === filteredCards.length - 1 ? "opacity-30 cursor-not-allowed" : ""
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right Side: Quiz Panel for current card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl p-6 shadow-xs">
              <h4 className="text-md font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mb-2 font-sans">
                <HelpCircle className="w-4 h-4 text-indigo-500" /> Topic MCQ Verification
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                Answer correctly to earn 100 XP per question. Reinforces knowledge retainment.
              </p>

              <div className="space-y-6">
                {currentCard.mcqs.map((mcq, idx) => {
                  const key = `${currentCard.id}_${idx}`;
                  const chosenOption = answeredMap[key];
                  const showFeedback = mcqShowFeedback[key];
                  const isCorrectAnswer = chosenOption === mcq.correctAnswerIndex;

                  return (
                    <div key={idx} className="p-4 border border-gray-50 dark:border-gray-900/40 rounded-2xl bg-gray-50/50 dark:bg-gray-900/30 space-y-3">
                      <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest">
                        Assessment {idx + 1}
                      </div>
                      
                      <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-snug">
                        {mcq.question}
                      </h5>

                      <div className="space-y-2 pt-1">
                        {mcq.options.map((opt, optIdx) => {
                          const isChosen = chosenOption === optIdx;
                          const isCorrectOpt = optIdx === mcq.correctAnswerIndex;
                          
                          let btnStyle = "bg-white border-gray-100 hover:bg-gray-50 text-gray-700 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200";
                          if (showFeedback) {
                            if (isCorrectOpt) {
                              btnStyle = "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900";
                            } else if (isChosen) {
                              btnStyle = "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900";
                            } else {
                              btnStyle = "bg-white text-gray-400 border-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-600";
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              id={`btn-snap-opt-${currentCard.id}-${idx}-${optIdx}`}
                              disabled={showFeedback}
                              onClick={() => handleOptionSelect(idx, optIdx)}
                              className={`w-full text-left font-sans p-3 rounded-xl border text-xs leading-relaxed transition-all cursor-pointer flex items-start gap-2.5 ${btnStyle}`}
                            >
                              <span className="font-bold flex-shrink-0 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-md w-5 h-5 flex items-center justify-center text-[10px]">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{opt}</span>
                              {showFeedback && isCorrectOpt && <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto flex-shrink-0" />}
                              {showFeedback && isChosen && !isCorrectOpt && <XCircle className="w-4 h-4 text-rose-500 ml-auto flex-shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* feedback block */}
                      <AnimatePresence>
                        {showFeedback && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`p-3 rounded-xl text-[11px] leading-relaxed mt-2 ${
                              isCorrectAnswer 
                                ? "bg-emerald-50/50 text-emerald-800 border border-emerald-100 dark:bg-emerald-950/10 dark:text-emerald-400 dark:border-emerald-900/30" 
                                : "bg-rose-50/50 text-rose-800 border border-rose-100 dark:bg-rose-950/10 dark:text-rose-400 dark:border-rose-900/30"
                            }`}
                          >
                            <div className="font-bold mb-1 flex items-center gap-1">
                              {isCorrectAnswer ? (
                                <>
                                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                                  <span>Dynamic Correct Verification! (+100 XP)</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3.5 h-3.5 text-rose-500" />
                                  <span>Incomplete Answer</span>
                                </>
                              )}
                            </div>
                            <p>{mcq.explanation}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
