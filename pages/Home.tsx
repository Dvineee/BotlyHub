import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../TranslationContext';
import { 
  motion, 
  AnimatePresence 
} from 'motion/react';
import { 
  Terminal, 
  GitBranch, 
  Cpu, 
  Workflow, 
  Bot, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  GitPullRequest, 
  Zap, 
  Layers, 
  Play, 
  Code, 
  ArrowRight, 
  ExternalLink, 
  ShieldCheck, 
  Activity,
  Maximize2,
  RefreshCw,
  Copy,
  Check,
  Search,
  ChevronDown,
  Lock,
  MessageSquare
} from 'lucide-react';
import { categories } from '../data';

const Github = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Gitlab = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 13.29-1.93-5.94a1.35 1.35 0 0 0-.58-.69 1.41 1.41 0 0 0-.91-.12 1.39 1.39 0 0 0-.69.46 1.35 1.35 0 0 0-.25.8l-.29 3a7.33 7.33 0 0 1-1.07 3 .75.75 0 0 1-.84.29 11.2 11.2 0 0 0-7.08 0 .75.75 0 0 1-.84-.29 7.36 7.36 0 0 1-1.07-3l-.29-3a1.34 1.34 0 0 0-.25-.8 1.37 1.37 0 0 0-.69-.46 1.41 1.41 0 0 0-.91.12 1.36 1.36 0 0 0-.58.69L2 13.29a1.72 1.72 0 0 0 .58 1.8l7.65 5.52a1.71 1.71 0 0 0 2 0l7.65-5.52a1.72 1.72 0 0 0 .62-1.8z" />
  </svg>
);

// Color Palette Definition for Code Reference:
// Background: #0A0A0A
// Cards: rgba(255,255,255,0.04)
// Borders: rgba(255,255,255,0.08)
// Accent: #7C5CFF (Botly Purple) or #4F9CF9 (Dev Blue)
// Success: #10B981, Warning: #F59E0B, Failed: #EF4444

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  // Navigation active anchors
  const [activeSection, setActiveSection] = useState('hero');

  // Interactive QA Sandbox States
  const [selectedRepo, setSelectedRepo] = useState('vercel-nextjs-api');
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [currentTestStep, setCurrentTestStep] = useState(0);
  const [testOutput, setTestOutput] = useState<string[]>([]);
  const [testResultState, setTestResultState] = useState<'idle' | 'running' | 'success' | 'warning' | 'failed'>('idle');
  const [activeTab, setActiveTab] = useState<'logger' | 'scenarios' | 'visual' | 'recommendation'>('logger');
  const [isCopied, setIsCopied] = useState(false);
  const [cliCopied, setCliCopied] = useState(false);

  // Pricing Interval State
  const [pricingInterval, setPricingInterval] = useState<'monthly' | 'yearly'>('monthly');

  // FAQ toggles
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({
    0: true,
  });

  // Keep track of scroll positions for scroll-spy or nav borders
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Repository database mock structure
  const repos = {
    'vercel-nextjs-api': {
      branches: ['main', 'developer-route', 'hotfix/api-headers'],
      commits: {
        'main': { hash: 'f87a13c', msg: 'Merge branch "dev/supabase-sync"', time: '2m ago' },
        'developer-route': { hash: 'c2e5b71', msg: 'feat: add metrics analytics capture', time: '1h ago' },
        'hotfix/api-headers': { hash: 'a1b7e09', msg: 'fix: bypass caching policy on staging', time: '4h ago' }
      }
    },
    'supabase-dashboard': {
      branches: ['main', 'feature/realtime-feed', 'bugfix/auth-leak'],
      commits: {
        'main': { hash: 'e571c84', msg: 'doc: update API route guides', time: '10m ago' },
        'feature/realtime-feed': { hash: 'b9bd7e1', msg: 'feat: add websockets trigger for active row updates', time: '2h ago' },
        'bugfix/auth-leak': { hash: 'd9e075c', msg: 'security: revoke token on session expiration hook', time: '1d ago' }
      }
    },
    'linear-clone-app': {
      branches: ['main', 'feature/kanban-drag', 'refactor/optimistic-ui'],
      commits: {
        'main': { hash: '9b0c2e4', msg: 'chore: bump dev dependencies', time: '30m ago' },
        'feature/kanban-drag': { hash: '5c81de3', msg: 'feat: drag and drop with keyboard support', time: '5h ago' },
        'refactor/optimistic-ui': { hash: '1a2b3c4', msg: 'refactor: use query cache for instant board updates', time: '2d ago' }
      }
    }
  };

  // Run a interactive simulation of BotlyHub's pipeline
  const handleTriggerQAFeedback = () => {
    if (isTestRunning) return;
    
    setIsTestRunning(true);
    setTestResultState('running');
    setCurrentTestStep(0);
    setActiveTab('logger');
    
    const logs: string[] = [];
    const pushLog = (msg: string, delay: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          logs.push(msg);
          setTestOutput([...logs]);
          resolve();
        }, delay);
      });
    };

    const runLogs = async () => {
      setTestOutput([]);
      await pushLog(`⚡ [botlyhub-pipeline] initialising pipeline client for ${selectedRepo}/${selectedBranch}`, 250);
      await pushLog(`🚀 [botlyhub-pipeline] matched commit ${repos[selectedRepo as keyof typeof repos].commits[selectedBranch as 'main'].hash} (${repos[selectedRepo as keyof typeof repos].commits[selectedBranch as 'main'].msg})`, 450);
      await pushLog(`📦 [botlyhub-pipeline] scanning environment secrets... valid`, 400);
      await pushLog(`🔍 [botlyhub-ai] step 1/3: performing syntactic and pattern audit`, 500);
      
      // Syntax phase specific warnings
      if (selectedBranch === 'hotfix/api-headers') {
        await pushLog(`⚠️  [botlyhub-ai] warning: insecure staging wildcard headers detected in api/headers.ts [line 47]`, 600);
      } else if (selectedBranch === 'bugfix/auth-leak') {
        await pushLog(`🚨  [botlyhub-ai] danger: high risk session leak detected in useSession.ts [line 114]. Auth token cache not evicted upon logOut() invocation`, 650);
      } else {
        await pushLog(`✅  [botlyhub-ai] no core syntactic issues or static security leaks detected`, 500);
      }

      setCurrentTestStep(1);
      await pushLog(`🧠 [botlyhub-ai] step 2/3: dynamically generating 14 automated integration scenarios`, 600);
      await pushLog(`🧪 [botlyhub-ai] scenario gen: 4 authentication flows, 6 state transitions, 4 data mutating requests`, 400);
      
      setCurrentTestStep(2);
      await pushLog(`🌐 [botlyhub-crawler] step 3/3: spawning headless chromium cluster (E2E simulation)`, 600);
      await pushLog(`🤖 [botlyhub-crawler] running test: 'simulating standard login with delayed network latency'`, 450);
      
      if (selectedBranch === 'bugfix/auth-leak') {
        await pushLog(`❌  [botlyhub-crawler] test 'session cache purge on logout' failed: local storage token retained after exit signal dispatch`, 700);
        await pushLog(`📊  [botlyhub-pipeline] run failed: 13 passed, 0 warnings, 1 failed.`, 300);
        setTestResultState('failed');
      } else if (selectedBranch === 'hotfix/api-headers') {
        await pushLog(`⚠️  [botlyhub-crawler] test 'visual layout integrity under responsive boundaries' warning: button element overlap on 320px screen width`, 700);
        await pushLog(`📊  [botlyhub-pipeline] run completed with warning: 13 passed, 1 warning, 0 failed.`, 300);
        setTestResultState('warning');
        setActiveTab('visual');
      } else if (selectedBranch === 'feature/realtime-feed') {
        await pushLog(`ℹ️  [botlyhub-crawler] telemetry: websocket connection speed 180ms within threshold`, 500);
        await pushLog(`✅  [botlyhub-pipeline] run passed flawlessly: 14 passed, 0 warnings, 0 failed.`, 300);
        setTestResultState('success');
        setActiveTab('recommendation');
      } else {
        await pushLog(`✅  [botlyhub-pipeline] run passed flawlessly: 14 passed, 0 warnings, 0 failed.`, 600);
        setTestResultState('success');
      }
      
      setIsTestRunning(false);
    };

    runLogs();
  };

  // Reset demo block
  const resetDemoState = () => {
    setIsTestRunning(false);
    setTestOutput([]);
    setTestResultState('idle');
    setCurrentTestStep(0);
  };

  useEffect(() => {
    resetDemoState();
  }, [selectedRepo, selectedBranch]);

  // Copy CLI command utils
  const handleCopyCLI = () => {
    navigator.clipboard.writeText('npm i -g @botlyhub/cli && botlyhub init');
    setCliCopied(true);
    setTimeout(() => setCliCopied(false), 2000);
  };

  return (
    <div className="bg-[#0A0A0A] text-[#EDEDED] font-sans overflow-x-hidden min-h-screen">
      
      {/* GLOW BACKGROUND ORBITS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[10%] w-[350px] h-[350px] rounded-full bg-[#7C5CFF]/10 blur-[130px]" />
        <div className="absolute top-[25%] right-[15%] w-[450px] h-[450px] rounded-full bg-[#4F9CF9]/10 blur-[150px]" />
        <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      {/* HEADER NAVIGATION */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#0A0A0A]/85 backdrop-blur-md border-b border-white/[0.06] py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* Logo with Dev aesthetics */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C5CFF] to-[#4F9CF9] p-[1.5px] shadow-[0_0_15px_rgba(124,92,255,0.3)] group-hover:shadow-[0_0_20px_rgba(124,92,255,0.5)] transition-all duration-300">
              <div className="flex items-center justify-center w-full h-full rounded-[6px] bg-[#0A0A0A]">
                <Bot className="w-4.5 h-4.5 text-[#EDEDED] group-hover:text-white transition-colors" />
              </div>
            </div>
            <span className="text-[17px] font-bold tracking-tight text-white group-hover:text-slate-100 font-sans">
              Botly<span className="text-[#7C5CFF]">Hub</span>
            </span>
            <div className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 text-[#7C5CFF] rounded font-mono font-medium">v3.0</div>
          </a>

          {/* Nav links similar to Vercel/Linear style dropdowns / indicators */}
          <nav className="hidden md:flex items-center gap-7 text-[13.5px] text-[#A1A1A1] font-medium">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <Link to="/search" className="flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors px-2 py-1 rounded bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.12]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF]"></span>
              <span>{t('nav_market') || 'Marketplace'}</span>
            </Link>
            <Link to="/qa" className="hover:text-white transition-colors">
              {t('nav_qa') || t('footer_qa') || 'QA Forum'}
            </Link>
            <Link to="/blog" className="hover:text-white transition-colors">
              {t('footer_blog') || 'Blog'}
            </Link>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-4">
            <a href="#sandbox" className="hidden lg:flex items-center gap-1.5 text-[13px] font-mono text-zinc-400 hover:text-white px-3 py-1.5 rounded-md bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all">
              <Terminal className="w-3.5 h-3.5" />
              <span>npx run botlyhub</span>
            </a>
            <a href="#sandbox" className="px-4 py-1.5 rounded-lg bg-white text-black text-[13px] font-semibold hover:bg-[#EDEDED] active:scale-95 transition-all shadow-[0_4px_12px_rgba(255,255,255,0.15)]">
              Get Started
            </a>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative pt-32 pb-24 md:pt-40 md:pb-36 overflow-hidden z-10">
        <div className="max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
          
          {/* Announcement pill with soft background and tiny gradient indicator */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-[12px] font-medium text-zinc-300 hover:border-white/[0.12] transition-colors cursor-pointer mb-8"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7C5CFF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7C5CFF]"></span>
            </span>
            <span className="text-zinc-400">Automated QA Sandbox running live.</span>
            <span className="text-white hover:text-[#7C5CFF] flex items-center gap-0.5 font-semibold">Try simulation <ArrowRight className="w-3 h-3" /></span>
          </motion.div>

          {/* Big headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.1] font-sans"
          >
            Automated AI QA <br />
            <span className="bg-gradient-to-r from-white via-white to-zinc-500 bg-clip-text text-transparent">for every deploy</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-[15px] sm:text-[17px] md:text-[19px] text-[#A1A1A1] max-w-2xl leading-relaxed mb-10 font-medium"
          >
            BotlyHub runs intelligent tests, detects bugs, and validates your product before it reaches production. Fully integrated with your deployment timeline.
          </motion.p>

          {/* Hero CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 mb-16"
          >
            <a href="#sandbox" className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#7C5CFF] text-white hover:bg-[#6A47FF] hover:shadow-[0_0_20px_rgba(124,92,255,0.4)] active:scale-[0.98] transition-all duration-200 text-sm font-semibold text-center">
              Get Started for Free
            </a>
            <a href="#docs" className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[#EDEDED] text-sm hover:bg-white/[0.06] font-semibold text-center transition-all">
              View Docs
            </a>
          </motion.div>

          {/* PRODUCT PREVIEW PANEL (Terminal / Dashboard style) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full max-w-4xl rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.08] p-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10"
          >
            <div className="rounded-[12px] bg-[#0C0C0E] overflow-hidden">
              
              {/* Fake Window Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#111114] border-b border-white/[0.05] select-none">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/10" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/25 border border-yellow-500/10" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/10" />
                  <span className="text-[11px] text-[#71717A] ml-2 font-mono">botlyhub.yml</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-2 py-0.5 rounded bg-white/[0.03] text-[#7C5CFF] font-mono text-[10px] border border-white/[0.05] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span> Staging Validated
                  </div>
                </div>
              </div>

              {/* Inside Window (Dynamic CI pipeline mock) */}
              <div className="grid grid-cols-1 md:grid-cols-12 md:divide-x md:divide-white/[0.05] text-left">
                
                {/* Left col: File tree & parameters */}
                <div className="md:col-span-4 p-4 space-y-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#A1A1A1] block tracking-widest uppercase mb-2">Automated QA Triggers</span>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[12.5px] px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-zinc-300">
                        <span className="flex items-center gap-2"><GitBranch className="w-3.5 h-3.5 text-zinc-500" /> on.push</span>
                        <span className="text-zinc-500 font-mono text-[11px]">[main, dev]</span>
                      </div>
                      <div className="flex items-center justify-between text-[12.5px] px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-zinc-300">
                        <span className="flex items-center gap-2"><GitPullRequest className="w-3.5 h-3.5 text-zinc-500" /> on.pull_request</span>
                        <span className="text-zinc-500 font-mono text-[11px]">[opened, sync]</span>
                      </div>
                      <div className="flex items-center justify-between text-[12.5px] px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-zinc-300 text-zinc-500 line-through">
                        <span className="flex items-center gap-2"><Layers className="w-3.5 h-3.5 opacity-60" /> on.manual_deploy</span>
                        <span className="text-zinc-500 font-mono text-[11px]">[admin]</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#A1A1A1] block tracking-widest uppercase mb-2">AI QA Core Suite</span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[12px] text-zinc-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                        <span>Static code parsing with LLM</span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-zinc-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                        <span>Dynamic scenario synthesising</span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-zinc-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                        <span>E2E Chromium bot testing (live logs)</span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-zinc-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                        <span>Visual regression check screenshot diffs</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right col: Running terminal script */}
                <div className="md:col-span-8 p-4 bg-[#09090A]/95 flex flex-col justify-between font-mono text-[12px] min-h-[220px]">
                  <div className="space-y-1.5 max-h-[190px] overflow-y-auto no-scrollbar scroll-smooth">
                    <p className="text-[#A1A1A1]">$ npx run botlyhub-e2e --repo=demo-site</p>
                    <p className="text-zinc-500">Initializing workspace...</p>
                    <p className="text-emerald-400">✔ GitHub token authenticated</p>
                    <p className="text-zinc-300">✔ Read configuration botlyhub.yml</p>
                    <p className="text-purple-400">🤖 AI matching codebase dependencies: React 18, Supabase db Client</p>
                    <p className="text-[#f1f6fb]">🤖 AI generated 14 functional E2E tests targetting '/api/*' routes</p>
                    <p className="text-zinc-400">--- Running tests ---</p>
                    <p className="text-[#10B981]">✔ GET /api/health (24ms) - Status 200</p>
                    <p className="text-[#10B981]">✔ POST /api/payment/create-order (112ms) - Expected invoice output verified</p>
                    <p className="text-[#F59E0B]">⚠ Visual layout width limit exceeded on viewport width 360px (Login Modal)</p>
                    <p className="text-[#EDEDED]">Execution finished in 4.27s.</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-zinc-500 text-[11px]">
                    <span>CLI tool: @botlyhub/cli v3.0</span>
                    <span className="text-[#10B981] font-bold">13/14 tests passed</span>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>

        </div>
      </section>

      {/* 2. How it works */}
      <section id="how-it-works" className="py-20 md:py-28 relative border-t border-white/[0.03] z-10 bg-[#070708]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(124,92,255,0.02),transparent)] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
            <span className="text-[11px] font-mono font-bold tracking-widest text-[#7C5CFF]/90 uppercase bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 px-3 py-1 rounded-full">Automated Pipeline</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-4 tracking-tight leading-tight">3 simple steps to total production safety</h2>
            <p className="text-[#A1A1A1] mt-3.5 text-sm md:text-base">We automate the critical path between code push and live deployment checks instantly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            
            {/* CARD 1 */}
            <div className="relative rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 group">
              <div className="absolute top-[-1px] left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#7C5CFF]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white group-hover:bg-[#7C5CFF]/15 group-hover:border-[#7C5CFF]/30 transition-all mb-6">
                <Github className="w-5 h-5 text-zinc-300 group-hover:text-[#7C5CFF] transition-colors" />
              </div>
              <span className="text-zinc-500 font-mono text-[13px] block mb-2">01 / REPOSITORY SYNC</span>
              <h3 className="text-[18px] font-bold text-white mb-2 leading-tight group-hover:text-[#7C5CFF] transition-colors">Connect your repository</h3>
              <p className="text-[13.5px] text-[#A1A1A1] leading-relaxed">
                Connect your Github or GitLab organization with our native GitHub App. BotlyHub maps the file structures, routing mechanisms, and API models automatically within seconds.
              </p>
            </div>

            {/* CARD 2 */}
            <div className="relative rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 group">
              <div className="absolute top-[-1px] left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#4F9CF9]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white group-hover:bg-[#4F9CF9]/15 group-hover:border-[#4F9CF9]/30 transition-all mb-6">
                <Cpu className="w-5 h-5 text-zinc-300 group-hover:text-[#4F9CF9] transition-colors" />
              </div>
              <span className="text-zinc-500 font-mono text-[13px] block mb-2">02 / AI SCENARIO SYNTHESIS</span>
              <h3 className="text-[18px] font-bold text-white mb-2 leading-tight group-hover:text-[#4F9CF9] transition-colors">AI generates test scenarios</h3>
              <p className="text-[13.5px] text-[#A1A1A1] leading-relaxed">
                Our model reads your PR diff, automatically targets database triggers & forms, and designs end-to-end integration workflows with multi-user simulation scenarios dynamically. No manual scripting ever.
              </p>
            </div>

            {/* CARD 3 */}
            <div className="relative rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 group">
              <div className="absolute top-[-1px] left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#7C5CFF]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white group-hover:bg-[#7C5CFF]/15 group-hover:border-[#7C5CFF]/30 transition-all mb-6">
                <Workflow className="w-5 h-5 text-zinc-300 group-hover:text-[#7C5CFF] transition-colors" />
              </div>
              <span className="text-zinc-500 font-mono text-[13px] block mb-2">03 / CONTINUOUS STAGING CHECKS</span>
              <h3 className="text-[18px] font-bold text-white mb-2 leading-tight group-hover:text-[#7C5CFF] transition-colors">Runs QA and reports</h3>
              <p className="text-[13.5px] text-[#A1A1A1] leading-relaxed">
                Every code commit triggering a push, pull request, or stage deploy immediately kicks off BotlyHub simulation cycles. Failures block the deployment gate, and issues are commented directly inline on GitHub.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 3. Features Section (Grid Layout) */}
      <section id="features" className="py-20 md:py-28 relative border-t border-white/[0.03] z-10 bg-[#0A0A0B]">
        <div className="max-w-6xl mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
            <span className="text-[11px] font-mono font-bold tracking-widest text-[#4F9CF9]/90 uppercase bg-[#4F9CF9]/10 border border-[#4F9CF9]/20 px-3 py-1 rounded-full">Feature Capabilities</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-4 tracking-tight leading-tight">Advanced QA Engine For Dev Teams</h2>
            <p className="text-[#A1A1A1] mt-3.5 text-sm md:text-base">Comprehensive validation layers engineered and polished for modern, zero-downtime platforms.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Feature 1: AI Test Generation (Double Wide - 8cols) */}
            <div className="md:col-span-8 relative rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 hover:border-white/[0.1] transition-all duration-300 group flex flex-col justify-between overflow-hidden min-h-[280px]">
              <div className="absolute top-0 right-[-10%] w-[250px] h-[250px] bg-[#7C5CFF]/5 rounded-full blur-[80px] pointer-events-none" />
              <div className="space-y-3 max-w-md">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#7C5CFF]/10 border border-[#7C5CFF]/25 text-[#7C5CFF]">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#7C5CFF] uppercase tracking-wider">Predictive Testing</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight leading-tight">Automated AI Test Generation</h3>
                <p className="text-[13.5px] text-[#A1A1A1] leading-relaxed">
                  Our core semantic LLM parses your staging routes, code architecture, packages, and mock schemas. It automatically figures out authentication boundaries, generates 30+ edge cases, and writes readable browser E2E test files inside your repository folder.
                </p>
              </div>

              {/* Minimal UI graphic representation */}
              <div className="mt-6 p-3 rounded-lg bg-[#0C0C0F] border border-white/[0.04] font-mono text-[11px] text-zinc-400 select-none">
                <p className="text-purple-400">// AI generated case for: /api/checkout</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[#10B981]">✔</span>
                  <span>test('order state with negative volume should throw validation error 400')</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[#10B981]">✔</span>
                  <span>test('concurrent stripe session token generation under checkout overload')</span>
                </div>
              </div>
            </div>

            {/* Feature 2: CI/CD integration (4cols) */}
            <div className="md:col-span-4 relative rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 hover:border-white/[0.1] transition-all duration-300 group flex flex-col justify-between min-h-[280px]">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#4F9CF9]/10 border border-[#4F9CF9]/25 text-[#4F9CF9]">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#4F9CF9] uppercase tracking-wider">Workflow Connect</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight leading-tight">Native CI/CD Integration</h3>
                <p className="text-[13.5px] text-[#A1A1A1] leading-relaxed">
                  Plug BotlyHub directly into your release cycle. Integrates natively, securely, and seamlessly with GitHub Actions, CircleCI, Jenkins, Vercel Deployments, Netlify, and GitLab Pipelines using standard OAuth.
                </p>
              </div>

              {/* Horizontal line representation of branches */}
              <div className="mt-6 flex items-center gap-3 text-zinc-500 font-mono text-[10.5px]">
                <span className="text-[#EDEDED]">Commit</span>
                <span>---&gt;</span>
                <span className="text-[#7C5CFF]">Botly QA</span>
                <span>---&gt;</span>
                <span className="text-[#10B981]">Vercel Deploy</span>
              </div>
            </div>

            {/* Feature 3: Real-Time Bug Detection (4cols) */}
            <div className="md:col-span-4 relative rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 hover:border-white/[0.1] transition-all duration-300 group flex flex-col justify-between min-h-[280px]">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/25 text-orange-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-orange-400 uppercase tracking-wider">Live telemetry</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight leading-tight">Real-Time Bug Detection</h3>
                <p className="text-[13.5px] text-[#A1A1A1] leading-relaxed">
                  Catch accessibility flaws, server-side unhandled promise rejections, network latency overhead spikes, visual layout shifts, and visual overlaps before your customers report them.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2.5 px-3 py-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-orange-300 font-mono text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Layout break detected at screen 375px</span>
              </div>
            </div>

            {/* Feature 4: GitHub Integration (4cols) */}
            <div className="md:col-span-4 relative rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 hover:border-white/[0.1] transition-all duration-300 group flex flex-col justify-between min-h-[280px]">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#7C5CFF]/10 border border-[#7C5CFF]/25 text-[#7C5CFF]">
                    <Github className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#7C5CFF] uppercase tracking-wider">GitHub App</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight leading-tight">Inline Code Comments</h3>
                <p className="text-[13.5px] text-[#A1A1A1] leading-relaxed">
                  BotlyHub acts like a senior reviewer. When a dynamic scenario fails during check trials, it comments directly inline, on the precise line of code with rich terminal logs, code context, and suggestion fixes.
                </p>
              </div>

              <div className="mt-6 text-[10px] text-zinc-500 font-mono flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>botlyhub-bot commented on useAuth.ts</span>
              </div>
            </div>

            {/* Feature 5: Deployment Validation (4cols) */}
            <div className="md:col-span-4 relative rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 hover:border-white/[0.1] transition-all duration-300 group flex flex-col justify-between min-h-[280px]">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-[#10B981]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider">Gatekeep policy</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight leading-tight">Deployment Gates</h3>
                <p className="text-[13.5px] text-[#A1A1A1] leading-relaxed">
                  Do not let failed staging tests block your live traffic. Configure custom BotlyHub deployment block policies that intercept preview URLs directly. If test validation falls below 100%, deployment is safely halted.
                </p>
              </div>

              <div className="mt-6 text-[11px] text-[#10B981] font-mono flex items-center gap-1.5 font-bold">
                <Check className="w-3.5 h-3.5" />
                <span>Staging Deployment Purged</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. BOT & MINI-APP ECOSYSTEM MARKETPLACE DEVELOPER PREVIEW */}
      <section className="py-20 md:py-28 relative border-t border-white/[0.03] z-10 bg-[#08080A]">
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-[550px] h-[550px] rounded-full bg-[#4F9CF9]/5 blur-[125px] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl text-left">
              <span className="text-[11px] font-mono font-bold tracking-widest text-[#7C5CFF] uppercase bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 px-3 py-1 rounded-full">Global Directory</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-4 tracking-tight leading-tight">Explore the BotlyHub Telegram Ecosystem</h2>
              <p className="text-[#A1A1A1] mt-3.5 text-sm md:text-base">
                Discover, configure, and connect verified Telegram bots, automated channel tools, and decentralized Web3 Mini-Apps built by our developer community.
              </p>
            </div>
            <div className="flex shrink-0">
              <button 
                onClick={() => navigate('/search')}
                className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 active:scale-95 transition-all shadow-[0_4px_12px_rgba(255,255,255,0.1)]"
              >
                <span>Browse All {categories.length - 1}+ Categories</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories
              .filter(cat => cat.id !== 'all')
              .slice(0, 10)
              .map((cat, idx) => {
                const IconComponent = cat.icon;
                const localizedLabel = t(cat.label) || cat.id.toUpperCase();
                return (
                  <div
                    key={cat.id}
                    onClick={() => navigate(`/search?category=${cat.id}`)}
                    className="group relative rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.13] p-5 cursor-pointer hover:bg-white/[0.03] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col items-center text-center justify-between min-h-[140px] select-none active:scale-[0.98]"
                  >
                    <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#7C5CFF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] group-hover:bg-[#7C5CFF]/10 group-hover:border-[#7C5CFF]/25 text-zinc-400 group-hover:text-white transition-all duration-300 p-3 shrink-0">
                      {IconComponent ? (
                        <IconComponent size={24} className="group-hover:scale-110 transition-transform" />
                      ) : (
                        <Bot className="w-5 h-5" />
                      )}
                    </div>
                    <div className="mt-4">
                      <h4 className="text-[13px] font-bold text-slate-100 group-hover:text-white truncate">
                        {localizedLabel}
                      </h4>
                      <p className="text-[10px] text-zinc-500 mt-1 uppercase font-mono tracking-wider">
                        {cat.id} Directory
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="mt-10 rounded-2xl bg-gradient-to-r from-[#7C5CFF]/10 via-transparent to-[#4F9CF9]/10 border border-white/[0.05] p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-left space-y-2">
              <span className="text-[9.5px] font-mono font-black text-[#5BC0BE] bg-[#5BC0BE]/15 border border-[#5BC0BE]/25 px-2 py-0.5 rounded uppercase tracking-wider">Submit your app</span>
              <h3 className="text-lg font-bold text-white">Are you a Telegram developer or community creator?</h3>
              <p className="text-zinc-400 text-xs max-w-xl leading-relaxed">
                List your Telegram bot, mini-app, group, or channel to gain organic distribution, build reputation rankings, and integrate instant micro-payments.
              </p>
            </div>
            <button 
              onClick={() => navigate('/u/login')}
              className="w-full md:w-auto px-5 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[#EDEDED] text-xs hover:bg-white/[0.06] font-semibold transition-all shrink-0 flex items-center justify-center gap-2"
            >
              <span>Add Your Bot Now</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

        </div>
      </section>

      {/* 5. Product Demo Section (Interactive Dashboard Mock) */}
      <section id="sandbox" className="py-20 md:py-28 relative border-t border-white/[0.03] z-10 bg-[#070708]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#7C5CFF]/3 blur-[140px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] font-mono font-bold tracking-widest text-[#7C5CFF] uppercase bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 px-3 py-1 rounded-full">Interactive Dev Demo</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-4 tracking-tight">Try BotlyHub Pipeline Simulation</h2>
            <p className="text-[#A1A1A1] mt-3.5 text-sm md:text-base">Experience how BotlyHub executes tests on the fly. Select a repository node, switch branches, and trigger the AI QA pipeline instantly.</p>
          </div>

          <div className="rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/[0.07] p-1.5 shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
            <div className="rounded-xl bg-[#09090B] overflow-hidden grid grid-cols-1 lg:grid-cols-12 text-left min-h-[550px]">
              
              {/* Dashboard Left Sidebar Control View (3 columns) */}
              <div className="lg:col-span-3 bg-[#0D0D10] p-5 border-b lg:border-b-0 lg:border-r border-white/[0.06] flex flex-col justify-between">
                
                <div className="space-y-6">
                  {/* Repo select */}
                  <div>
                    <label className="text-[10px] font-mono font-bold text-zinc-400 block tracking-wider uppercase mb-2">Connected Repository</label>
                    <div className="space-y-1.5">
                      {Object.keys(repos).map((repoName) => (
                        <button
                          key={repoName}
                          onClick={() => {
                            setSelectedRepo(repoName);
                            setSelectedBranch('main');
                          }}
                          className={`w-full flex items-center justify-between text-[12.5px] px-3 py-2 rounded-lg transition-all text-left ${selectedRepo === repoName ? 'bg-white/[0.05] text-[#7C5CFF] border border-white/[0.08] font-bold' : 'text-zinc-400 hover:bg-white/[0.02] hover:text-white border border-transparent'}`}
                        >
                          <span className="truncate">{repoName}</span>
                          <span className="text-[10px] bg-white/[0.05] px-1.5 py-0.5 rounded text-zinc-500 font-mono">active</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Branch / Code Change Select */}
                  <div>
                    <label className="text-[10px] font-mono font-bold text-zinc-400 block tracking-wider uppercase mb-2">Select Target Branch</label>
                    <div className="relative">
                      <select 
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        disabled={isTestRunning}
                        className="w-full bg-[#121216] border border-white/[0.08] text-white text-[12.5px] rounded-lg px-3 py-2 outline-none cursor-pointer focus:border-[#7C5CFF] transition-colors appearance-none font-mono font-semibold"
                      >
                        {repos[selectedRepo as keyof typeof repos].branches.map((br) => (
                          <option key={br} value={br}>{br}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
                    </div>
                  </div>

                  {/* Commit info details */}
                  <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.04] space-y-12">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 block">COMMIT HASH</span>
                      <span className="text-[12px] font-mono font-bold text-zinc-300">{repos[selectedRepo as keyof typeof repos].commits[selectedBranch as 'main']?.hash || 'none'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 block">COMMIT MESSAGE</span>
                      <span className="text-[12.5px] text-zinc-300 line-clamp-2 leading-snug">"{repos[selectedRepo as keyof typeof repos].commits[selectedBranch as 'main']?.msg || ''}"</span>
                    </div>
                  </div>
                </div>

                {/* Automation Trigger Buttons */}
                <div className="mt-8 pt-4 border-t border-white/[0.04] space-y-2">
                  <button
                    onClick={handleTriggerQAFeedback}
                    disabled={isTestRunning}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[#7C5CFF] to-[#6A47FF] hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer font-sans disabled:opacity-40 shadow-[0_4px_15px_rgba(124,92,255,0.25)]"
                  >
                    {isTestRunning ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Evaluating...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        <span>Trigger AI QA Suite</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={resetDemoState}
                    disabled={isTestRunning || testResultState === 'idle'}
                    className="w-full py-2 text-center rounded-lg border border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.02] transition-all text-xs"
                  >
                    Clear Canvas
                  </button>
                </div>

              </div>

              {/* Central dashboard pipeline feedback panel (9 columns) */}
              <div className="lg:col-span-9 bg-[#09090C] flex flex-col justify-between overflow-hidden">
                
                {/* Status Header Area */}
                <div className="px-6 py-4 bg-[#0F0F12] border-b border-white/[0.06] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block">PIPELINE RUN FEEDBACK</span>
                    <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                      <span>job_feed_run_#381</span>
                      {testResultState === 'running' && <span className="text-[#7C5CFF] text-[11px] font-normal flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> executing checks...</span>}
                      {testResultState === 'success' && <span className="text-[#10B981] text-[11px] font-normal flex items-center gap-1 bg-[#10B981]/15 px-2 py-0.5 rounded border border-[#10B981]/30">✔ passed cleanly</span>}
                      {testResultState === 'warning' && <span className="text-[#F59E0B] text-[11px] font-normal flex items-center gap-1 bg-[#F59E0B]/15 px-2 py-0.5 rounded border border-[#F59E0B]/30">⚠ completed with alert</span>}
                      {testResultState === 'failed' && <span className="text-[#EF4444] text-[11px] font-normal flex items-center gap-1 bg-[#EF4444]/15 px-2 py-0.5 rounded border border-[#EF4444]/30">⚙ validation gate block</span>}
                    </h3>
                  </div>

                  {/* Horizontal step pipelines */}
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded-full ${currentTestStep >= 0 && testResultState !== 'idle' ? 'text-[#7C5CFF]' : 'text-zinc-600'}`}>
                      <Code className="w-4.5 h-4.5" />
                    </div>
                    <div className="w-4 h-[1px] bg-white/[0.06]" />
                    <div className={`p-1 rounded-full ${currentTestStep >= 1 ? 'text-[#7C5CFF]' : 'text-zinc-600'}`}>
                      <Cpu className="w-4.5 h-4.5" />
                    </div>
                    <div className="w-4 h-[1px] bg-white/[0.06]" />
                    <div className={`p-1 rounded-full ${currentTestStep >= 2 ? 'text-[#7C5CFF]' : 'text-zinc-600'}`}>
                      <Terminal className="w-4.5 h-4.5" />
                    </div>
                  </div>
                </div>

                {/* Navigation Tabs inner */}
                <div className="flex border-b border-white/[0.05] bg-[#0A0A0E] text-[12px] font-mono">
                  <button onClick={() => setActiveTab('logger')} className={`px-5 py-2.5 transition-all scroll-mb-[1px] border-b-2 font-bold ${activeTab === 'logger' ? 'border-[#7C5CFF] text-white bg-[#09090C]' : 'border-transparent text-zinc-500 hover:text-white'}`}>Live Output Logs</button>
                  <button onClick={() => setActiveTab('scenarios')} className={`px-5 py-2.5 transition-all scroll-mb-[1px] border-b-2 font-bold ${activeTab === 'scenarios' ? 'border-[#7C5CFF] text-white bg-[#09090C]' : 'border-transparent text-zinc-500 hover:text-white'}`}>AI Test Scenarios</button>
                  <button onClick={() => setActiveTab('visual')} className={`px-5 py-2.5 transition-all scroll-mb-[1px] border-b-2 font-bold ${activeTab === 'visual' ? 'border-[#7C5CFF] text-white bg-[#09090C]' : 'border-transparent text-zinc-500 hover:text-white'}`}>Visual Regression Diff</button>
                  <button onClick={() => setActiveTab('recommendation')} className={`px-5 py-2.5 transition-all scroll-mb-[1px] border-b-2 font-bold ${activeTab === 'recommendation' ? 'border-[#7C5CFF] text-white bg-[#09090C]' : 'border-transparent text-zinc-500 hover:text-white'}`}>AI Recommendation FIX</button>
                </div>

                {/* Dashboard Tab Content Canvas */}
                <div className="flex-1 p-6 font-mono text-[12.5px] overflow-y-auto min-h-[300px] max-h-[380px] bg-[#09090C]">
                  
                  {/* TAB 1: Live Output Logger */}
                  {activeTab === 'logger' && (
                    <div className="space-y-2">
                      {testOutput.length === 0 ? (
                        <div className="text-zinc-500 text-center py-20 font-sans">
                          <Terminal className="w-8 h-8 mx-auto mb-3 text-zinc-600 animate-pulse" />
                          <p>The console is currently awaiting execution telemetry.</p>
                          <p className="text-[12px] text-zinc-600 mt-1">Press "Trigger AI QA Suite" on the left to start checking code.</p>
                        </div>
                      ) : (
                        testOutput.map((log, index) => {
                          let textClass = 'text-zinc-300';
                          if (log.includes('✅') || log.includes('✓') || log.includes('✔')) textClass = 'text-emerald-400 font-bold';
                          if (log.includes('⚠') || log.includes('warning')) textClass = 'text-[#F59E0B] font-bold';
                          if (log.includes('❌') || log.includes('🚨') || log.includes('danger') || log.includes('failed')) textClass = 'text-red-400 font-bold';
                          if (log.includes('🤖') || log.includes('[botlyhub-ai]')) textClass = 'text-[#7C5CFF] font-semibold';
                          if (log.includes('⚡')) textClass = 'text-[#4F9CF9] font-semibold';
                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.15 }}
                              className={`leading-relaxed border-l-2 border-white/[0.04] pl-3 py-0.5 ${textClass}`}
                            >
                              {log}
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* TAB 2: AI Generated Test Scenarios */}
                  {activeTab === 'scenarios' && (
                    <div className="space-y-4 font-sans">
                      <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-3">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4.5 h-4.5 text-[#7C5CFF]" />
                          <h4 className="text-[13.5px] font-bold text-white font-mono">Synthesised Integration Routes ({selectedRepo})</h4>
                        </div>
                        <p className="text-zinc-400 text-[12.5px]">These browser user simulators are generated on the fly during branch analysis:</p>
                        
                        <div className="divide-y divide-white/[0.04] text-[12.5px]">
                          <div className="py-2.5 flex items-center justify-between">
                            <span className="font-mono text-zinc-300">01_auth_flow_recovery.spec_runner</span>
                            <span className="text-[#10B981] font-bold">Passed (0.42s)</span>
                          </div>
                          <div className="py-2.5 flex items-center justify-between">
                            <span className="font-mono text-zinc-300">02_rest_api_schema_boundary_checks</span>
                            <span className={`font-bold ${selectedBranch === 'hotfix/api-headers' ? 'text-[#F59E0B]' : 'text-[#10B981]'}`}>
                              {selectedBranch === 'hotfix/api-headers' ? 'Completed [Warning]' : 'Passed (0.58s)'}
                            </span>
                          </div>
                          <div className="py-2.5 flex items-center justify-between">
                            <span className="font-mono text-zinc-300">03_supabase_session_eviction_compliance</span>
                            <span className={`font-bold ${selectedBranch === 'bugfix/auth-leak' ? 'text-red-400' : 'text-[#10B981]'}`}>
                              {selectedBranch === 'bugfix/auth-leak' ? 'Failed [Gate Block]' : 'Passed (0.35s)'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: Visual Regression Screen Diff Layout */}
                  {activeTab === 'visual' && (
                    <div className="space-y-4 font-sans h-full flex flex-col justify-center items-center">
                      {selectedBranch === 'hotfix/api-headers' ? (
                        <div className="w-full space-y-4 text-center">
                          <div className="flex items-center justify-center gap-2 text-[#F59E0B] font-mono text-[13px] bg-[#F59E0B]/10 p-2.5 rounded-lg border border-[#F59E0B]/20 mb-4">
                            <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
                            <span>Warning: Layout Element Overlap on 320px breakpoints (Login Modal)</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
                            <div className="space-y-1.5 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                              <span className="text-[10px] text-zinc-500 font-mono block uppercase">Expected Layout</span>
                              <div className="h-32 rounded bg-zinc-800 flex flex-col items-center justify-center gap-1.5 p-3">
                                <div className="w-16 h-4 rounded bg-zinc-700" />
                                <div className="w-20 h-8 rounded bg-[#7C5CFF]/30 border border-[#7C5CFF]/25" />
                              </div>
                            </div>
                            <div className="space-y-1.5 p-3 rounded-lg bg-white/[0.02] border border-[#EF4444]/20">
                              <span className="text-[10px] text-[#EF4444] font-mono block uppercase">Actual Staging Shift</span>
                              <div className="h-32 rounded bg-zinc-800 flex flex-col items-center justify-center gap-1.5 relative overflow-hidden text-red-400">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[15deg] font-mono font-bold text-[10px] text-red-500 bg-red-950/85 border border-red-500/20 px-2 py-0.5 whitespace-nowrap z-10">OVERLAPPING BUTTONS</div>
                                <div className="w-16 h-4 rounded bg-zinc-700 select-none blur-[0.5px]" />
                                <div className="w-20 h-8 rounded bg-red-500/20 border border-red-500/30 select-none translate-y-[-8px] blur-[0.5px]" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-zinc-500 text-center py-20">
                          <Layers className="w-8 h-8 mx-auto mb-3 text-zinc-650" />
                          <p className="text-[13px]">No visual regressions detected across modern viewports.</p>
                          <p className="text-[11px] text-zinc-600 mt-1">Staging screenshot snapshot diffs match production master 100%.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: AI Code Recommendation and Fixes */}
                  {activeTab === 'recommendation' && (
                    <div className="space-y-4">
                      {selectedBranch === 'bugfix/auth-leak' ? (
                        <div className="space-y-3 font-sans">
                          <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[12.5px] font-mono flex items-center gap-2">
                            <XCircle className="w-4.5 h-4.5 shrink-0" />
                            <span>Insecure state propagation: cached JWT tokens bypass local eviction on logout.</span>
                          </div>
                          
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-mono text-zinc-500 block">AI HIGHLIGHTED FIX (useSession.ts)</span>
                            <div className="rounded-lg bg-[#0C0C0F] border border-white/[0.05] p-4 text-[11px] font-mono overflow-x-auto text-zinc-400">
                              <p className="text-zinc-500">// Old code:</p>
                              <p className="text-red-400 line-through">- function logOut() &#123; navigate("/login"); &#125;</p>
                              <p className="text-zinc-500 mt-2">// Recommended patch:</p>
                              <p className="text-emerald-400 font-bold">+ function logOut() &#123;</p>
                              <p className="text-emerald-400 font-bold">+   localStorage.removeItem("auth_token_jwt");</p>
                              <p className="text-emerald-400 font-bold">+   sessionStorage.clear();</p>
                              <p className="text-emerald-400 font-bold">+   navigate("/login");</p>
                              <p className="text-emerald-400 font-bold">+ &#125;</p>
                            </div>
                          </div>

                          <button 
                            onClick={() => {
                              alert("AI Patch applied dynamically! Triggering test automation check flow again.");
                              setSelectedBranch('main');
                              handleTriggerQAFeedback();
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-[#09090C] font-semibold text-xs rounded-lg hover:bg-emerald-400 transition-colors font-sans"
                          >
                            <Zap className="w-3.5 h-3.5 fill-current" />
                            <span>Auto Patch Repository</span>
                          </button>
                        </div>
                      ) : (
                        <div className="text-zinc-500 text-center py-20 font-sans">
                          <CheckCircle2 className="w-8 h-8 mx-auto mb-3 text-emerald-500/80" />
                          <p className="text-[13px] text-zinc-300 font-bold">Codebase exhibits pristine pattern health.</p>
                          <p className="text-[11px] text-[#A1A1A1] mt-1">No pending memory leaks, authentication bugs, or stale headers.</p>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Simulated telemetry info bar (Bottom UI) */}
                <div className="px-6 py-3.5 bg-[#0D0D10] border-t border-white/[0.06] text-zinc-500 text-[11.5px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-4">
                    <span>Repository Node: <span className="font-mono text-zinc-300 font-medium">{selectedRepo}</span></span>
                    <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-white/20" />
                    <span>Active Target Commit: <span className="font-mono text-zinc-300 font-medium">{repos[selectedRepo as keyof typeof repos].commits[selectedBranch as 'main']?.hash || ''}</span></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                    <span>Verified under SHA-256 staging parameters</span>
                  </div>
                </div>

              </div>
              
            </div>
          </div>

        </div>
      </section>

      {/* 5. Integrations Section (Logos Style Grid) */}
      <section id="integrations" className="py-20 md:py-24 relative border-t border-white/[0.03] z-10 bg-[#0A0A0B]">
        <div className="max-w-6xl mx-auto px-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 text-left space-y-4">
              <span className="text-[11px] font-mono font-bold tracking-widest text-[#7C5CFF] uppercase bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 px-3 py-1 rounded-full">Seamless Bridges</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">Integrates with your existing tech ecosystem</h2>
              <p className="text-[#A1A1A1] text-sm md:text-[14.5px] leading-relaxed">
                No complex scripting or server hosting required. Connect BotlyHub directly into your GitHub App ecosystem, Slack workspace alert loops, and Vercel preview gateways in less than five minutes.
              </p>
              
              <div className="pt-2 flex items-center gap-1.5 text-zinc-500 font-mono text-[12px]">
                <Lock className="w-3.5 h-3.5" />
                <span>Encrypted using SSH, AES-256 protocols</span>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                
                {/* Integration Card 1 */}
                <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] p-5 flex flex-col items-center justify-center text-center transition-all group cursor-pointer">
                  <Github className="w-8 h-8 text-zinc-400 group-hover:text-white group-hover:scale-105 transition-all mb-3.5" />
                  <span className="text-[13px] font-bold text-white block">GitHub</span>
                  <span className="text-[10px] text-zinc-500 font-mono mt-0.5">Push / PR Events</span>
                </div>

                {/* Integration Card 2 */}
                <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] p-5 flex flex-col items-center justify-center text-center transition-all group cursor-pointer">
                  <Gitlab className="w-8 h-8 text-zinc-400 group-hover:text-amber-500 group-hover:scale-105 transition-all mb-3.5" />
                  <span className="text-[13px] font-bold text-white block">GitLab</span>
                  <span className="text-[10px] text-zinc-500 font-mono mt-0.5">Commit Hooks</span>
                </div>

                {/* Integration Card 3 */}
                <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] p-5 flex flex-col items-center justify-center text-center transition-all group cursor-pointer">
                  <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center mb-3.5">
                    <span className="text-[13px] font-mono font-bold text-white">▲</span>
                  </div>
                  <span className="text-[13px] font-bold text-white block">Vercel</span>
                  <span className="text-[10px] text-zinc-500 font-mono mt-0.5">Preview Dep Gates</span>
                </div>

                {/* Integration Card 4 */}
                <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] p-5 flex flex-col items-center justify-center text-center transition-all group cursor-pointer">
                  <div className="w-8 h-8 bg-[#4F9CF9]/10 rounded-lg flex items-center justify-center text-[#4F9CF9] mb-3.5">
                    <Layers className="w-5 h-5 text-zinc-400 group-hover:text-[#4F9CF9] group-hover:scale-105 transition-all" />
                  </div>
                  <span className="text-[13px] font-bold text-white block">CI Platforms</span>
                  <span className="text-[10px] text-zinc-500 font-mono mt-0.5">Webhook Trigger</span>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. Pricing Section */}
      <section id="pricing" className="py-20 md:py-28 relative border-t border-white/[0.03] z-10 bg-[#070708]">
        <div className="absolute top-0 right-1/4 w-[350px] h-[350px] rounded-full bg-[#4F9CF9]/3 blur-[120px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] font-mono font-bold tracking-widest text-[#7C5CFF]/90 uppercase bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 px-3 py-1 rounded-full">Transparent Pricing</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-4 tracking-tight leading-tight">Simple billing styled for scaling teams</h2>
            <p className="text-[#A1A1A1] mt-3.5 text-sm md:text-base">Start for free, then scale boundaries dynamically as your release throughput multiplies.</p>

            {/* Interval switch */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <span className={`text-[13px] font-semibold transition-colors ${pricingInterval === 'monthly' ? 'text-white' : 'text-zinc-500'}`}>Monthly Billing</span>
              <button 
                onClick={() => setPricingInterval(pricingInterval === 'monthly' ? 'yearly' : 'monthly')}
                className="w-12 h-6.5 rounded-full bg-white/[0.06] border border-white/[0.08] p-1 flex items-center transition-all cursor-pointer select-none"
              >
                <div className={`w-4.5 h-4.5 rounded-full bg-white transition-all transform ${pricingInterval === 'yearly' ? 'translate-x-5.5' : 'translate-x-0'}`} />
              </button>
              <div className="flex items-center gap-1.5">
                <span className={`text-[13px] font-semibold transition-colors ${pricingInterval === 'yearly' ? 'text-white' : 'text-zinc-500'}`}>Annual Billing</span>
                <span className="px-1.5 py-0.5 text-[10px] bg-emerald-500/15 text-emerald-400 rounded-md border border-emerald-500/20 font-bold leading-none uppercase">Save 20%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch">
            
            {/* TIER 1: Free */}
            <div className="relative rounded-2xl bg-white/[0.02] border border-white/[0.05] p-6.5 hover:border-white/[0.1] transition-all flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h3 className="text-[17px] font-bold text-white block">Developer Free</h3>
                  <span className="text-zinc-500 text-[12px] block mt-1 leading-snug">Hobby, sandbox trials, and basic staging pipelines.</span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-[28px] font-mono font-bold text-white">$0</span>
                  <span className="text-zinc-500 text-[12px] uppercase tracking-wider font-mono">/ lifetime</span>
                </div>

                <div className="w-full h-[1px] bg-white/[0.04]" />

                <ul className="space-y-2.5 text-[13px] text-zinc-400 font-medium">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-zinc-650" />
                    <span>Up to 2 connected repositories</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-zinc-650" />
                    <span>10 automated AI QA test runs / mo</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-zinc-650" />
                    <span>Basic inline GitHub review reports</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-zinc-650" />
                    <span>Main branch tracking</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <a href="#sandbox" className="w-full block text-center py-2.5 text-xs font-semibold rounded-lg bg-white/[0.04] text-white border border-white/[0.08] hover:bg-white/[0.08] transition-all">
                  Get Started for Free
                </a>
              </div>
            </div>

            {/* TIER 2: Pro (Accent focused) */}
            <div className="relative rounded-2xl bg-white/[0.03] border-[#7C5CFF]/40 border-2 p-6.5 hover:shadow-[0_12px_40px_rgba(124,92,255,0.15)] transition-all flex flex-col justify-between">
              <div className="absolute top-[-11px] left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#7C5CFF] text-white text-[10px] rounded-full font-mono font-bold uppercase tracking-wider shadow">Most Popular</div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-[17px] font-bold text-white block">Botly Pro</h3>
                  <span className="text-zinc-400 text-[12px] block mt-1 leading-snug">Continuous delivery checks for active squads.</span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-[28px] font-mono font-bold text-white">
                    {pricingInterval === 'monthly' ? '$49' : '$39'}
                  </span>
                  <span className="text-zinc-500 text-[12px] uppercase tracking-wider font-mono">/ month</span>
                </div>

                <div className="w-full h-[1px] bg-white/[0.04]" />

                <ul className="space-y-2.5 text-[13px] text-zinc-300 font-medium">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#7C5CFF]" />
                    <span>Unlimited connected repositories</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#7C5CFF]" />
                    <span>250 automated AI QA runs / mo</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#7C5CFF]" />
                    <span>All staging / preview branch runs</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#7C5CFF]" />
                    <span>Visual layout regression snapshot diffs</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#7C5CFF]" />
                    <span>Priority email & Slack support</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <a href="#sandbox" className="w-full block text-center py-2.5 text-xs font-semibold rounded-lg bg-[#7C5CFF] text-white hover:bg-[#6A47FF] hover:shadow-[0_0_15px_rgba(124,92,255,0.3)] transition-all">
                  Trigger 14-Day Free Trial
                </a>
              </div>
            </div>

            {/* TIER 3: Enterprise */}
            <div className="relative rounded-2xl bg-white/[0.02] border border-white/[0.05] p-6.5 hover:border-white/[0.1] transition-all flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h3 className="text-[17px] font-bold text-white block">Enterprise Custom</h3>
                  <span className="text-zinc-500 text-[12px] block mt-1 leading-snug">Deep compliance, high volume security gates.</span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-[28px] font-mono font-bold text-white">Custom</span>
                  <span className="text-zinc-500 text-[12px] uppercase tracking-wider font-mono">/ volume</span>
                </div>

                <div className="w-full h-[1px] bg-white/[0.04]" />

                <ul className="space-y-2.5 text-[13px] text-zinc-400 font-medium">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-zinc-650" />
                    <span>Unlimited AI E2E scenarios</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-zinc-650" />
                    <span>Self-hosted chromium runner compatibility</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-zinc-650" />
                    <span>SSO, SAML & fine-grained team controls</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-zinc-650" />
                    <span>Dedicated engineer pairing audits</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-zinc-650" />
                    <span>99.9% uptime SLA compliance contract</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <a href="mailto:kenanekinci0@gmail.com?subject=BotlyHub Enterprise Quote Request" className="w-full block text-center py-2.5 text-xs font-semibold rounded-lg bg-white/[0.04] text-white border border-white/[0.08] hover:bg-white/[0.08] transition-all">
                  Contact Custom Sales
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-20 md:py-24 relative border-t border-white/[0.03] z-10 bg-[#0A0A0B]">
        <div className="max-w-4xl mx-auto px-6">
          
          <div className="text-center mb-16">
            <span className="text-[11px] font-mono font-bold tracking-widest text-[#4F9CF9] uppercase bg-[#4F9CF9]/10 border border-[#4F9CF9]/20 px-3 py-1 rounded-full">Dev Questions</span>
            <h2 className="text-3xl font-extrabold text-white mt-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "How does BotlyHub write QA scenarios dynamically?",
                a: "BotlyHub connects directly to your code changes. When you push, our platform parses the syntactic hierarchy of API endpoints, routing patterns, and schema files. Our proprietary LLM analyzes database queries and client request triggers to synthesize actual playwright-compatible chromium E2E scenarios on the spot."
              },
              {
                q: "Do I need to maintain test file scripts in my repository?",
                a: "No script maintenance is strictly required. While you can download our AI-generated Spec files manually and commit them as baseline integrations, BotlyHub naturally reads your repository changes, saves scripts in temporary virtual cache volumes, and validates endpoints on every deployment pipeline run."
              },
              {
                q: "Is my repository source code safely managed?",
                a: "Absolutely. BotlyHub adheres to the highest level of security hygiene. We never persist your codebase files permanently on servers. Files are read temporarily in isolated sandbox cache sandboxes, audited, and discarded immediately after E2E runs complete. All secret tokens are stored using AES-256 encryption."
              },
              {
                q: "How does the deployment gate policy feature operate?",
                a: "If you configure an integration target (like Vercel production branch deployments), BotlyHub intercepts staging build hooks. If any dynamic test pipeline audit returns critical or fatal errors, BotlyHub notifies git, blocks staging propagation gates securely, and halts premature traffic routing to production."
              }
            ].map((item, index) => {
              const isOpen = !!faqOpen[index];
              return (
                <div key={index} className="rounded-xl bg-white/[0.02] border border-white/[0.05] transition-all overflow-hidden text-left">
                  <button 
                    onClick={() => setFaqOpen({ ...faqOpen, [index]: !isOpen })}
                    className="w-full px-5 py-4 flex items-center justify-between text-[14px] font-bold text-white text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <span>{item.q}</span>
                    <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 pt-1 text-[13.5px] text-[#A1A1A1] leading-relaxed border-t border-white/[0.03]">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* CTA Bottom Banner Section */}
      <section className="py-20 md:py-28 relative border-t border-white/[0.03] z-10 bg-gradient-to-b from-[#0A0A0B] to-[#0D0D10] text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-[#7C5CFF]/5 blur-[125px] pointer-events-none" />
        
        <div className="max-w-3xl mx-auto px-6 space-y-8 relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-2 leading-tight font-sans">
            Ready to secure your deployments?
          </h2>
          <p className="text-[#A1A1A1] text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Plug BotlyHub AI QA directly into your staging pipeline flow today. 100% automated, no credit card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#sandbox" className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-200 active:scale-95 transition-all text-center">
              Sign Up for Free
            </a>
            <button 
              onClick={handleCopyCLI}
              className="w-full sm:w-auto px-4.5 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-zinc-300 hover:text-white hover:bg-white/[0.06] text-sm font-mono flex items-center justify-center gap-2 transition-all"
            >
              <span>{cliCopied ? 'Copied CLI Command!' : 'npm i @botlyhub/cli'}</span>
              {cliCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </section>

      {/* MINIMAL FOOTER */}
      <footer className="py-12 border-t border-white/[0.05] bg-[#09090A] z-10 relative">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-[#7C5CFF]/20 flex items-center justify-center border border-[#7C5CFF]/30">
              <Bot className="w-3.5 h-3.5 text-[#7C5CFF]" />
            </div>
            <span className="text-[14px] font-bold text-white tracking-tight">
              Botly<span className="text-[#7C5CFF]">Hub</span>
            </span>
            <span className="text-zinc-650 font-mono text-[11px]">© 2026 BotlyHub. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-[13px] text-zinc-500 font-medium">
            <a href="#docs" className="hover:text-white transition-colors">Documentation</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
              <Github className="w-3.5 h-3.5" /> Github
            </a>
            <a href="mailto:kenanekinci0@gmail.com" className="hover:text-white transition-colors">Contact Support</a>
            <div className="flex items-center gap-1.5 font-mono text-[10.5px] bg-[#10B981]/10 text-emerald-400 border border-[#10B981]/15 px-2 py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
              All systems online
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
