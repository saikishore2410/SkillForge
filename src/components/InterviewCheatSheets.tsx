import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, Search, Filter, HelpCircle, ChevronRight, CheckCircle, 
  Sparkles, Code, Clipboard, Check, Library 
} from "lucide-react";
import { CheatSheetCategory } from "../types";

// Seed structural technical assessment cheatsheets
const PRESET_SHEETS: CheatSheetCategory[] = [
  {
    id: "js_web",
    name: "JavaScript & Engine Core",
    iconName: "javascript",
    items: [
      {
        question: "What is JS Prototypal Inheritance vs Class inheritance?",
        answer: "Class-based systems copy structures down from static blueprints (classes) to objects. JavaScript uses prototypal inheritance: instances inherit properties directly from other live object wrappers (Prototypes) dynamically via a standard prototype lookup chain.",
        code: `const parent = { greet: () => "Hello!" };
const child = Object.create(parent); // Prototypes hook!

console.log(child.greet()); // "Hello!"`,
        language: "javascript"
      },
      {
        question: "Explain the difference between call(), apply(), and bind()",
        answer: "All three override the 'this' context of a function. 'call()' executes the function immediately passing parameters comma-separated; 'apply()' executes immediately passing parameters inside an Array; 'bind()' returns a fresh function pre-configured with the new 'this' scope without executing immediately.",
        code: `function introduce(city) {
  return \`\${this.name} from \${city}\`;
}

const user = { name: "Saul" };
introduce.call(user, "Chicago"); // Executes immediately
introduce.apply(user, ["Chicago"]); // Array arguments
const bound = introduce.bind(user); // Returns executable fn`,
        language: "javascript"
      },
      {
        question: "What is a Closure in modern engines?",
        answer: "A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment). In other words, a closure gives an inner function access to the outer function's scope even after the outer function has returned.",
        code: `function createAdder(x) {
  return function(y) {
    return x + y; // holds reference to x!
  };
}`,
        language: "javascript"
      }
    ]
  },
  {
    id: "react_hooks",
    name: "React 19 & Architecture",
    iconName: "react",
    items: [
      {
        question: "Why should we not call Hooks inside conditional scopes?",
        answer: "React relies on the absolute order in which Hooks are called across renders to map states correctly to their internal Fiber nodes. Placing Hooks inside code branches or loops disrupts this sequence, leading to severe misaligned state synchronization, or crash loops.",
        code: `// ❌ Prohibited Loop pattern
if (isPremium) {
  useEffect(() => { ... }, []);
}

// ✅ Correct Pattern
useEffect(() => {
  if (isPremium) {
    // conditional logic safely inside hook
  }
}, [isPremium]);`
      },
      {
        question: "What is the React Fiber Reconciliation Engine?",
        answer: "Fiber is the current core reconciliation algorithm. It allows React to split rendering work into incremental chunks, pause work, restart, or discard frames dynamically. Fiber organizes trees into doubly-linked lists of nodes representing virtual frames, yielding execution to browser task managers.",
        code: `// React 19 concurrent features like action transitions:
const [isPending, startTransition] = useTransition();`
      }
    ]
  },
  {
    id: "sql_dbs",
    name: "Databases & Performance",
    iconName: "database",
    items: [
      {
        question: "What are ACID guidelines in relational transactions?",
        answer: "ACID represents properties guaranteeing reliable database transaction updates: Atomicity (all changes commit or all roll back), Consistency (rules/constraints are strictly preserved), Isolation (concurrent transactions execute without cross-contamination), and Durability (committed changes survive system power crashes).",
        code: `BEGIN TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT; -- All block or none!`
      },
      {
        question: "Compare NoSQL column families (Firestore) vs SQL tables (Postgres)",
        answer: "SQL structures data inside rigid grids demanding normalized relations mapped via keys. NoSQL uses flexible dynamic JSON-like document nodes designed for swift denormalized access. Use SQL for highly structured relational transactions (ACID finance). Use NoSQL for rapid scale, nested layouts, and low-latency document models.",
        code: `// Postgres: strict columns
SELECT * FROM users JOIN profiles ON users.id = profiles.user_id;

// Firestore: nested document fetch
const snap = await db.collection("users").doc("id").get();`
      }
    ]
  }
];

export default function InterviewCheatSheets() {
  const [selectedCatId, setSelectedCatId] = useState<string>("js_web");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [markedQuestions, setMarkedQuestions] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const activeCategory = PRESET_SHEETS.find(c => c.id === selectedCatId) || PRESET_SHEETS[0];

  // Filter items matching search queries
  const filteredItems = activeCategory.items.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMarked = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const key = `${selectedCatId}_${idx}`;
    setMarkedQuestions(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1200);
  };

  return (
    <div id="cheatsheets-section" className="space-y-8">
      {/* Search Header layout */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 font-sans tracking-tight">
            <Library className="w-6 h-6 text-indigo-600" />
            Interview Preparation Hub
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Browse structured answers to high-frequency conceptual questions. Use indices to prepare for live tech drills.
          </p>
        </div>

        {/* Real-time search filter */}
        <div className="relative w-full md:w-[300px] flex-shrink-0">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
          <input
            id="input-cheatsheet-search"
            type="text"
            placeholder="Search answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-sans px-10 py-3 rounded-xl border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Categories select tabs */}
      <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-900 pb-1 overflow-x-auto whitespace-nowrap scrollbar-none">
        {PRESET_SHEETS.map((cat) => (
          <button
            key={cat.id}
            id={`btn-tab-sheet-${cat.id}`}
            onClick={() => {
              setSelectedCatId(cat.id);
              setSearchQuery("");
            }}
            className={`px-4 py-2 text-xs font-bold transition duration-250 cursor-pointer ${
              selectedCatId === cat.id
                ? "text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-450 dark:hover:text-gray-250"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid List items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {filteredItems.length === 0 ? (
          <div className="md:col-span-2 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl p-12 text-center text-gray-400 max-w-lg mx-auto w-full">
            <HelpCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-gray-700">No guides matching standard search query</h4>
            <p className="text-xs mt-1">Try other core terms like 'closures', 'ACID', 'Fiber', etc.</p>
          </div>
        ) : (
          filteredItems.map((item, idx) => {
            const pathKey = `${selectedCatId}_${idx}`;
            const isSaved = markedQuestions.includes(pathKey);
            const isCopied = copiedKey === pathKey;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3.5xl p-5 shadow-xs hover:border-gray-150 transition-all space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug font-sans max-w-[90%]">
                      {item.question}
                    </h3>
                  </div>
                  
                  {/* Save check button */}
                  <button
                    id={`btn-save-sheet-${selectedCatId}-${idx}`}
                    onClick={(e) => toggleMarked(idx, e)}
                    className="focus:outline-none cursor-pointer"
                  >
                    <CheckCircle className={`w-5 h-5 transition-all ${isSaved ? "text-emerald-500 fill-emerald-50/20" : "text-gray-200 dark:text-gray-800"}`} />
                  </button>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-sans">
                  {item.answer}
                </p>

                {/* Optional code snippet */}
                {item.code && (
                  <div className="relative group">
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-850 rounded-xl font-mono text-[11px] leading-relaxed text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre">
                      <code>{item.code}</code>
                    </div>

                    <button
                      id={`btn-copy-code-${selectedCatId}-${idx}`}
                      onClick={() => copyToClipboard(item.code || "", pathKey)}
                      className="absolute right-2 top-2 p-1 bg-white hover:bg-gray-50 border border-gray-150 rounded-md transition text-[10px] text-gray-500 font-semibold cursor-pointer select-none flex items-center gap-1 shadow-xs dark:bg-gray-900 dark:border-gray-850"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Clipboard className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
