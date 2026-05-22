import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  Cpu, 
  Layers, 
  BarChart3, 
  Terminal, 
  Settings, 
  ChevronDown, 
  ChevronUp, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search, 
  Sparkles, 
  GitMerge, 
  CheckCircle2, 
  AlertCircle, 
  Pause, 
  Play, 
  RefreshCw, 
  Command, 
  Volume2, 
  VolumeX, 
  PlusCircle, 
  ArrowUpRight, 
  Activity, 
  SlidersHorizontal, 
  ExternalLink, 
  Sliders, 
  HelpCircle,
  Database,
  Lock,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, LineChart, Line } from 'recharts';

// Global Themes & Visual Variables as described:
// Background: #0B0F17
// Panels: rgba(255,255,255,0.04)
// Borders: rgba(255,255,255,0.08)
// Primary accent: #6C5CE7
// Success: #2ED573
// Warning: #FFA502
// Error: #FF4757

interface BotItem {
  id: string;
  name: string;
  category: 'Arbitrage' | 'AI & NLP' | 'Social' | 'Utility';
  description: string;
  status: 'Active' | 'Standby' | 'Error';
  successRate: number;
  executions: number;
  uptime: number;
  latency: number;
  chain: 'TON' | 'Solana' | 'Ethereum' | 'BSC';
  lastRun: string;
  sparkline: { val: number }[];
}

const DEFAULT_BOTS: BotItem[] = [
  {
    id: 'bot-1',
    name: 'TON-Arbitrage Sniper X',
    category: 'Arbitrage',
    description: 'Deploys high-speed pathfinding algorithms to exploit DEX spreads across DeDust and STON.fi.',
    status: 'Active',
    successRate: 99.6,
    executions: 18450,
    uptime: 99.8,
    latency: 14,
    chain: 'TON',
    lastRun: '1s ago',
    sparkline: [{val: 45}, {val: 48}, {val: 52}, {val: 49}, {val: 60}, {val: 58}, {val: 64}, {val: 70}]
  },
  {
    id: 'bot-2',
    name: 'Solana Meme Liquidity Sentry',
    category: 'Arbitrage',
    description: 'Tracks LP creations on Raydium & Pump.fun and analyzes social triggers for token scalps.',
    status: 'Active',
    successRate: 98.4,
    executions: 9342,
    uptime: 99.2,
    latency: 28,
    chain: 'Solana',
    lastRun: '4s ago',
    sparkline: [{val: 20}, {val: 25}, {val: 38}, {val: 50}, {val: 42}, {val: 48}, {val: 55}, {val: 68}]
  },
  {
    id: 'bot-3',
    name: 'LLM Sentiment Trading Oracle',
    category: 'AI & NLP',
    description: 'Analyzes crypto Twitter (X) and Telegram feeds parsing intent signals for automated scalping.',
    status: 'Standby',
    successRate: 96.8,
    executions: 3204,
    uptime: 98.1,
    latency: 120,
    chain: 'Ethereum',
    lastRun: '2m ago',
    sparkline: [{val: 30}, {val: 22}, {val: 25}, {val: 21}, {val: 24}, {val: 32}, {val: 28}, {val: 31}]
  },
  {
    id: 'bot-4',
    name: 'Telegram Group Auto-Mod AI',
    category: 'Utility',
    description: 'Context-aware conversational moderating bot with AI spam filtering & customizable admin commands.',
    status: 'Active',
    successRate: 99.9,
    executions: 84912,
    uptime: 100,
    latency: 42,
    chain: 'TON',
    lastRun: '12s ago',
    sparkline: [{val: 80}, {val: 82}, {val: 84}, {val: 81}, {val: 83}, {val: 85}, {val: 84}, {val: 86}]
  },
  {
    id: 'bot-5',
    name: 'Starknet Bridge Arbitrage',
    category: 'Arbitrage',
    description: 'Watches state updates and gas discrepancies on bridged vaults for low-fee path settlement.',
    status: 'Error',
    successRate: 84.2,
    executions: 1240,
    uptime: 88.5,
    latency: 350,
    chain: 'Ethereum',
    lastRun: '1h ago',
    sparkline: [{val: 70}, {val: 65}, {val: 50}, {val: 42}, {val: 30}, {val: 24}, {val: 18}, {val: 10}]
  },
  {
    id: 'bot-6',
    name: 'BSC Liquid Staking Rebalancer',
    category: 'Utility',
    description: 'Automatically shifts deposits across high-yielding BNB liquidity pools and vaults daily.',
    status: 'Standby',
    successRate: 99.1,
    executions: 2841,
    uptime: 99.5,
    latency: 180,
    chain: 'BSC',
    lastRun: '15m ago',
    sparkline: [{val: 50}, {val: 52}, {val: 51}, {val: 53}, {val: 52}, {val: 55}, {val: 54}, {val: 55}]
  }
];

interface LogItem {
  id: string;
  timestamp: string;
  botId: string;
  botName: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

const INITIAL_LOGS: LogItem[] = [
  { id: 'log-1', timestamp: '22:27:01', botId: 'bot-1', botName: 'TON-Arbitrage Sniper X', type: 'success', message: 'Spread detected STON.fi -> DeDust (+0.42 TON / 1.5%). Route cleared in 14ms.' },
  { id: 'log-2', timestamp: '22:27:04', botId: 'bot-2', botName: 'Solana Meme Liquidity Sentry', type: 'info', message: 'Tracking new pool: $PUMP/SOL. Social score verified: 8.5/10.' },
  { id: 'log-3', timestamp: '22:27:12', botId: 'bot-4', botName: 'Telegram Group Auto-Mod AI', type: 'info', message: 'Sanitized 2 spam campaigns under pattern match: #MemeLaunchInvite.' },
  { id: 'log-4', timestamp: '22:27:18', botId: 'bot-5', botName: 'Starknet Bridge Arbitrage', type: 'error', message: 'Gas limit exceeded on L2 settlement. Transaction rejected. Status: INSUFFICIENT_FEE.' },
  { id: 'log-5', timestamp: '22:27:26', botId: 'bot-1', botName: 'TON-Arbitrage Sniper X', type: 'success', message: 'Executed path STON.fi -> DeDust (spread 2.2%). Net profit +0.84 TON.' },
  { id: 'log-6', timestamp: '22:27:30', botId: 'bot-3', botName: 'LLM Sentiment Trading Oracle', type: 'warning', message: 'X API throttle rate reached. Reverting sentiment ingestion to fallback RPC.' },
];

export default function Home() {
  // Navigation active state
  // Dashboard, Bots, Workflows, Analytics, Logs, Settings
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Sidebar expanded / collapsed (PC)
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(true);
  
  // Accordion menus for Bots inside Sidebar (TON style submenus)
  const [botsSubMenuOpen, setBotsSubMenuOpen] = useState<boolean>(true);
  
  // Tablet floating drawer toggle
  const [tabletDrawerOpen, setTabletDrawerOpen] = useState<boolean>(false);
  
  // Mobile full screen slide-over menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [mobileMenuHistory, setMobileMenuHistory] = useState<string[]>([]); // To handle "back navigation inside menu hierarchy"
  const [mobileSubMenu, setMobileSubMenu] = useState<string | null>(null);

  // States for interactive components
  const [bots, setBots] = useState<BotItem[]>(DEFAULT_BOTS);
  const [logs, setLogs] = useState<LogItem[]>(INITIAL_LOGS);
  const [simulationActive, setSimulationActive] = useState<boolean>(true);
  
  // Filtration and Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  
  // Bottom-sheet modals / Panels
  const [createBotOpen, setCreateBotOpen] = useState<boolean>(false);
  const [consoleOpen, setConsoleOpen] = useState<boolean>(false);
  const [expandedBotId, setExpandedBotId] = useState<string | null>(null);

  // Bot creation form hook states
  const [newBotName, setNewBotName] = useState('');
  const [newBotCategory, setNewBotCategory] = useState<'Arbitrage' | 'AI & NLP' | 'Social' | 'Utility'>('Arbitrage');
  const [newBotChain, setNewBotChain] = useState<'TON' | 'Solana' | 'Ethereum' | 'BSC'>('TON');
  const [newBotDesc, setNewBotDesc] = useState('');

  // Terminal state
  const [terminalCommand, setTerminalCommand] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    'Welcome to AI Studio BotlyHub V3 Monospace Terminal.',
    'Type "help" to list available control-panel triggers.',
    ''
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Cumulative simulations
  const [totalExecutions, setTotalExecutions] = useState<number>(168450);
  const [audioFeedback, setAudioFeedback] = useState<boolean>(false);

  // Simulated background execution interval (running every 5 seconds)
  useEffect(() => {
    if (!simulationActive) return;

    const interval = setInterval(() => {
      // 1. Pick a random active bot
      const activeBots = bots.filter(b => b.status === 'Active');
      if (activeBots.length === 0) return;
      const pickedBot = activeBots[Math.floor(Math.random() * activeBots.length)];

      // 2. Determine spread/log message depending on category
      let logType: 'info' | 'success' | 'warning' = 'info';
      let message = '';
      const coin = pickedBot.chain;

      if (pickedBot.category === 'Arbitrage') {
        const spread = (Math.random() * 2 + 0.1).toFixed(2);
        const profit = (Math.random() * 1.5 + 0.1).toFixed(2);
        logType = Math.random() > 0.15 ? 'success' : 'info';
        message = logType === 'success' 
          ? `Discovered arbitrage pathway! Profit: +${profit} ${coin}. Spread: ${spread}%.`
          : `Scanning liquidity pools on Raydium/DEX. Current spreads are below threshold (fee optimization).`;
      } else if (pickedBot.category === 'AI & NLP') {
        const sentiment = Math.random() > 0.5 ? 'Bullish' : 'Slightly Bearish';
        message = `Analyzed 40 social feeds for ${coin}. General aggregate sentiment rating: ${sentiment}.`;
      } else if (pickedBot.category === 'Utility') {
        message = `Cleaned and validated transactional records. Average sync speed: ${pickedBot.latency}ms. All routes active.`;
      }

      // Generate timestamp
      const now = new Date();
      const timestamp = now.toTimeString().split(' ')[0];

      // 3. Append log
      const newLog: LogItem = {
        id: `log-${Date.now()}`,
        timestamp,
        botId: pickedBot.id,
        botName: pickedBot.name,
        type: logType,
        message
      };

      setLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep up to 50 logs

      // 4. Update executions counter
      setTotalExecutions(prev => prev + 1);
      setBots(prev => prev.map(b => {
        if (b.id === pickedBot.id) {
          const newVal = Math.min(100, Math.max(0, b.sparkline[b.sparkline.length - 1].val + Math.floor(Math.random() * 15 - 7)));
          const updatedSparkline = [...b.sparkline.slice(1), { val: newVal }];
          return {
            ...b,
            executions: b.executions + 1,
            lastRun: 'Just now',
            sparkline: updatedSparkline
          };
        }
        return b;
      }));

    }, 4500);

    return () => clearInterval(interval);
  }, [bots, simulationActive]);

  // Terminal command handler
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalCommand.trim()) return;

    const cmd = terminalCommand.trim().toLowerCase();
    let reply = '';
    
    if (cmd === 'help') {
      reply = 'AVAILABLE COMMANDS:\n' +
              '  help        - Display general console layout\n' +
              '  status      - Display running bots and cluster health\n' +
              '  start-all   - Set all passive / standby bots to active state\n' +
              '  reboot [id] - Force restart a crashed routing bot\n' +
              '  metrics     - Print live JSON statistics data feed\n' +
              '  clear       - Wipe terminal log outputs';
    } else if (cmd === 'status') {
      const activeCount = bots.filter(b => b.status === 'Active').length;
      const totalCount = bots.length;
      reply = `SYSTEM CLUSTER CONSOLE STATUS:\n` +
              `  Cluster Health : ${((activeCount / totalCount) * 100).toFixed(1)}%\n` +
              `  Active Nodes   : ${activeCount} / ${totalCount} bots\n` +
              `  Active Chain   : TON Gateway Protocol V3\n` +
              `  Network Latency: 14.5ms avg`;
    } else if (cmd === 'start-all') {
      setBots(prev => prev.map(b => ({ ...b, status: 'Active' })));
      reply = 'SUCCESS: Broadcasted spin-up command. All standby bots set to ACTIVE.';
    } else if (cmd.startsWith('reboot ')) {
      const targetId = cmd.replace('reboot ', '').trim();
      let found = false;
      setBots(prev => prev.map(b => {
        if (b.id === targetId || b.name.toLowerCase().includes(targetId)) {
          found = true;
          return { ...b, status: 'Active', uptime: 100, latency: 15 };
        }
        return b;
      }));
      reply = found 
        ? `SUCCESS: Cleared Stark-bridge RPC lockouts. Bot ${targetId} restarted successfully.`
        : `ERROR: No bot payload found with ID/Name "${targetId}". Check listings.`;
    } else if (cmd === 'metrics') {
      const summary = {
        totalExecutions,
        activeBots: bots.filter(b => b.status === 'Active').length,
        systemHealth: '99.94%',
        activeChains: Array.from(new Set(bots.map(b => b.chain))),
        timestamp: new Date().toISOString()
      };
      reply = `METRICS PAYLOAD FEED:\n` + JSON.stringify(summary, null, 2);
    } else if (cmd === 'clear') {
      setTerminalHistory([]);
      setTerminalCommand('');
      return;
    } else {
      reply = `ERROR: Command "${cmd}" not recognized. Type "help" for a list of control signals.`;
    }

    setTerminalHistory(prev => [...prev, `> ${terminalCommand}`, reply, '']);
    setTerminalCommand('');
    
    setTimeout(() => {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  // Bot creation submit
  const handleCreateBot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBotName.trim()) return;

    const newBot: BotItem = {
      id: `bot-${Date.now()}`,
      name: newBotName,
      category: newBotCategory,
      description: newBotDesc || 'Automated execution template with modular TON.app API hooks and state controls.',
      status: 'Active',
      successRate: 100.0,
      executions: 0,
      uptime: 100.0,
      latency: Math.floor(Math.random() * 80 + 12),
      chain: newBotChain,
      lastRun: 'Never',
      sparkline: [{val: 40}, {val: 40}, {val: 40}, {val: 40}, {val: 40}, {val: 40}, {val: 40}, {val: 40}]
    };

    setBots(prev => [newBot, ...prev]);
    setLogs(prev => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toTimeString().split(' ')[0],
        botId: newBot.id,
        botName: newBot.name,
        type: 'success',
        message: `Registered system node [${newBot.name}] on ${newBot.chain}. Initiating pipeline sync...`
      },
      ...prev
    ]);

    setCreateBotOpen(false);
    setNewBotName('');
    setNewBotDesc('');
  };

  const toggleBotStatus = (botId: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setBots(prev => prev.map(b => {
      if (b.id === botId) {
        let nextStatus: 'Active' | 'Standby' | 'Error' = 'Active';
        if (b.status === 'Active') nextStatus = 'Standby';
        else if (b.status === 'Standby') nextStatus = 'Active';
        else nextStatus = 'Active'; // If error, turn on

        // Append log corresponding to action
        const now = new Date();
        const timestamp = now.toTimeString().split(' ')[0];
        setLogs(l => [{
          id: `log-${Date.now()}`,
          timestamp,
          botId,
          botName: b.name,
          type: nextStatus === 'Active' ? 'success' : 'warning',
          message: `User triggered status state override to: [${nextStatus}]`
        }, ...l]);

        return { ...b, status: nextStatus };
      }
      return b;
    }));
  };

  const deleteBot = (botId: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setBots(prev => prev.filter(b => b.id !== botId));
    setLogs(prev => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toTimeString().split(' ')[0],
        botId: 'system',
        botName: 'System Core',
        type: 'warning',
        message: `De-registered bot node ID: [${botId}] from orchestrator gateway.`
      },
      ...prev
    ]);
  };

  // Helper filters
  const filteredBots = bots.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || b.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const activeBotsCount = bots.filter(b => b.status === 'Active').length;
  const systemStatusMsg = activeBotsCount === bots.length 
    ? { text: 'Nodes Optimal', color: '#2ED573', label: 'Healthy' }
    : activeBotsCount > 0 
      ? { text: 'Degraded State', color: '#FFA502', label: 'Warning' }
      : { text: 'All Nodes Offline', color: '#FF4757', label: 'Offline' };

  // Spacing helper standard
  // 4px base: padding-1 (~4px), p-2 (~8px), p-4 (~16px), p-6 (~24px), p-12 (~48px)

  return (
    <div className="min-h-screen bg-[#0B0F17] text-[#F8FAFC] font-sans overflow-x-hidden antialiased flex flex-col xl:flex-row">
      
      {/* 🧭 GLOBAL NAVIGATION SYSTEM (TON.APP STYLE) */}
      
      {/* Desktop left sidebar */}
      <aside className={`hidden xl:flex flex-col border-r border-[rgba(255,255,255,0.08)] bg-[#0B0F17] sticky top-0 h-screen transition-all duration-300 z-50 shrink-0 ${sidebarExpanded ? 'w-[260px] p-6' : 'w-[80px] p-4 items-center'}`}>
        
        {/* Header/Logo */}
        <div className={`flex items-center gap-3 mb-10 ${sidebarExpanded ? 'justify-start' : 'justify-center'}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6C5CE7] to-[#8C7CFF] flex items-center justify-center text-white font-extrabold shadow-[0_4px_14px_rgba(108,92,231,0.3)]">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          {sidebarExpanded && (
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight leading-none text-[#F8FAFC]">API.STUDIO</span>
              <span className="text-[10px] uppercase font-bold text-[#6C5CE7] leading-tight tracking-widest mt-0.5">Control Center</span>
            </div>
          )}
        </div>

        {/* Menu-driven Navigation (TON.app style) */}
        <nav className="flex-1 flex flex-col gap-2 w-full">
          {/* Dashboard Tab */}
          <button 
            id="sidemenu-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 rounded-lg py-3 px-3.5 transition-all text-left ${activeTab === 'dashboard' ? 'bg-[rgba(108,92,231,0.15)] text-[#6C5CE7] font-semibold border border-[rgba(108,92,231,0.2)]' : 'hover:bg-[rgba(255,255,255,0.04)] text-[#94A3B8] border border-transparent'}`}
          >
            <LayoutDashboard className="w-[18px] h-[18px] shrink-0" />
            {sidebarExpanded && <span>Dashboard</span>}
          </button>

          {/* Bots Accordion (Smooth Expandable) */}
          <div className="flex flex-col w-full">
            <button 
              id="sidemenu-bots-parent"
              onClick={() => {
                if (!sidebarExpanded) {
                  setSidebarExpanded(true);
                  setActiveTab('bots');
                  return;
                }
                setBotsSubMenuOpen(!botsSubMenuOpen);
              }}
              className={`w-full flex items-center justify-between rounded-lg py-3 px-3.5 transition-all text-left ${activeTab === 'bots' || activeTab === 'all-bots' || activeTab === 'create-bot' || activeTab === 'templates' ? 'bg-[rgba(255,255,255,0.02)] text-white font-semibold' : 'hover:bg-[rgba(255,255,255,0.04)] text-[#94A3B8]'}`}
            >
              <div className="flex items-center gap-3 mr-2">
                <Bot className="w-[18px] h-[18px] shrink-0" />
                {sidebarExpanded && <span>Bots</span>}
              </div>
              {sidebarExpanded && (
                botsSubMenuOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Nested Submenu support (Accordion style) */}
            {sidebarExpanded && botsSubMenuOpen && (
              <div className="pl-8 flex flex-col gap-1 mt-1 border-l border-[rgba(255,255,255,0.05)] ml-5">
                <button 
                  id="sidemenu-sub-all"
                  onClick={() => { setActiveTab('dashboard'); setSearchQuery(''); setStatusFilter('All'); }}
                  className="py-2 text-xs text-[#94A3B8] hover:text-[#6C5CE7] transition-all text-left"
                >
                  All Bots
                </button>
                <button
                  id="sidemenu-sub-create"
                  onClick={() => setCreateBotOpen(true)}
                  className="py-2 text-xs text-[#94A3B8] hover:text-[#6C5CE7] transition-all text-[#2ED573] text-left flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Create Bot
                </button>
                <button 
                  id="sidemenu-sub-templates"
                  onClick={() => { setActiveTab('bots'); setCategoryFilter('Arbitrage'); }}
                  className="py-2 text-xs text-[#94A3B8] hover:text-[#6C5CE7] transition-all text-left"
                >
                  Bot Templates
                </button>
              </div>
            )}
          </div>

          {/* Workflows Tab */}
          <button 
            id="sidemenu-workflows"
            onClick={() => setActiveTab('workflows')}
            className={`w-full flex items-center gap-3 rounded-lg py-3 px-3.5 transition-all text-left ${activeTab === 'workflows' ? 'bg-[rgba(108,92,231,0.15)] text-[#6C5CE7] font-semibold border border-[rgba(108,92,231,0.2)]' : 'hover:bg-[rgba(255,255,255,0.04)] text-[#94A3B8] border border-transparent'}`}
          >
            <GitMerge className="w-[18px] h-[18px] shrink-0" />
            {sidebarExpanded && <span>Workflows</span>}
          </button>

          {/* Analytics Tab */}
          <button 
            id="sidemenu-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 rounded-lg py-3 px-3.5 transition-all text-left ${activeTab === 'analytics' ? 'bg-[rgba(108,92,231,0.15)] text-[#6C5CE7] font-semibold border border-[rgba(108,92,231,0.2)]' : 'hover:bg-[rgba(255,255,255,0.04)] text-[#94A3B8] border border-transparent'}`}
          >
            <BarChart3 className="w-[18px] h-[18px] shrink-0" />
            {sidebarExpanded && <span>Analytics</span>}
          </button>

          {/* Logs Tab */}
          <button 
            id="sidemenu-logs"
            onClick={() => { setActiveTab('logs'); setConsoleOpen(true); }}
            className={`w-full flex items-center gap-3 rounded-lg py-3 px-3.5 transition-all text-left ${activeTab === 'logs' ? 'bg-[rgba(108,92,231,0.15)] text-[#6C5CE7] font-semibold border border-[rgba(108,92,231,0.2)]' : 'hover:bg-[rgba(255,255,255,0.04)] text-[#94A3B8] border border-transparent'}`}
          >
            <Terminal className="w-[18px] h-[18px] shrink-0" />
            {sidebarExpanded && <span>Terminal Logs</span>}
          </button>

          {/* Settings Tab */}
          <button 
            id="sidemenu-settings"
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 rounded-lg py-3 px-3.5 transition-all text-left ${activeTab === 'settings' ? 'bg-[rgba(108,92,231,0.15)] text-[#6C5CE7] font-semibold border border-[rgba(108,92,231,0.2)]' : 'hover:bg-[rgba(255,255,255,0.04)] text-[#94A3B8] border border-transparent'}`}
          >
            <Settings className="w-[18px] h-[18px] shrink-0" />
            {sidebarExpanded && <span>Settings</span>}
          </button>
        </nav>

        {/* Sidebar Footer and Collapse Toggle */}
        <div className="mt-auto pt-6 border-t border-[rgba(255,255,255,0.05)] w-full flex flex-col gap-4">
          <div className={`flex items-center gap-3 ${sidebarExpanded ? 'px-1' : 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-mono text-xs font-bold text-[#6C5CE7]">
              AI
            </div>
            {sidebarExpanded && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">Administrator</span>
                <span className="text-[10px] text-slate-500 font-mono truncate">ID: 0f7329ee-2b</span>
              </div>
            )}
          </div>

          <button 
            id="sidebar-collapse-trigger"
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="w-full h-8 hover:bg-[rgba(255,255,255,0.04)] rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-[#6C5CE7] transition-all cursor-pointer border border-transparent"
            title={sidebarExpanded ? 'Collapse Menu' : 'Expand Menu'}
          >
            {sidebarExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Tablet floating vertical drawer header / layout (iPad Mode) */}
      <header className="xl:hidden flex items-center justify-between px-6 py-4 bg-[#0B0F17] border-b border-[rgba(255,255,255,0.08)] z-40 sticky top-0 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button 
            id="tablet-hamburger-btn"
            onClick={() => setTabletDrawerOpen(true)}
            className="p-2 hover:bg-[rgba(255,255,255,0.04)] rounded-lg text-slate-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6C5CE7] to-[#8C7CFF] flex items-center justify-center text-white font-extrabold shadow-md">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-[#F8FAFC]">API.STUDIO</span>
          </div>
        </div>

        {/* Tab state identifier */}
        <span className="text-[10px] uppercase font-mono font-bold px-2 px-1 rounded bg-[rgba(108,92,231,0.15)] border border-[rgba(108,92,231,0.2)] text-[#6C5CE7]">
          {activeTab}
        </span>
      </header>

      {/* Tablet Drawer overlays and content */}
      <AnimatePresence>
        {tabletDrawerOpen && (
          <>
            {/* Dark glass backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTabletDrawerOpen(false)}
              className="xl:hidden fixed inset-0 bg-[#000]/65 backdrop-blur-sm z-50 pointer-events-auto"
            />

            {/* Floating content drawer */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 150 }}
              className="xl:hidden fixed left-0 top-0 bottom-0 w-[300px] bg-[#0B0F17] border-r border-[rgba(255,255,255,0.08)] p-6 z-50 flex flex-col pointer-events-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6C5CE7] to-[#8C7CFF] flex items-center justify-center text-white font-extrabold">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-[#F8FAFC]">API.STUDIO</span>
                    <span className="text-[9px] uppercase font-bold text-[#6C5CE7] tracking-wider leading-none">Tablet Engine</span>
                  </div>
                </div>
                <button 
                  onClick={() => setTabletDrawerOpen(false)}
                  className="p-1.5 hover:bg-[rgba(255,255,255,0.04)] rounded-full text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer nested systems */}
              <nav className="flex-1 flex flex-col gap-2">
                <button 
                  onClick={() => { setActiveTab('dashboard'); setTabletDrawerOpen(false); }}
                  className={`w-full flex items-center gap-3 rounded-lg py-3 px-3.5 transition-all text-left ${activeTab === 'dashboard' ? 'bg-[rgba(108,92,231,0.15)] text-[#6C5CE7] font-semibold' : 'hover:bg-[rgba(255,255,255,0.04)] text-[#94A3B8]'}`}
                >
                  <LayoutDashboard className="w-[18px] h-[18px]" />
                  <span>Dashboard</span>
                </button>

                <div className="flex flex-col w-full">
                  <button 
                    onClick={() => setBotsSubMenuOpen(!botsSubMenuOpen)}
                    className={`w-full flex items-center justify-between rounded-lg py-3 px-3.5 transition-all text-left ${activeTab === 'bots' ? 'bg-[rgba(255,255,255,0.02)] text-white' : 'hover:bg-[rgba(255,255,255,0.04)] text-[#94A3B8]'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Bot className="w-[18px] h-[18px]" />
                      <span>Bots Panel</span>
                    </div>
                    {botsSubMenuOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </button>

                  {botsSubMenuOpen && (
                    <div className="pl-8 flex flex-col gap-1 mt-1 border-l border-[rgba(255,255,255,0.05)] ml-5">
                      <button 
                        onClick={() => { setActiveTab('dashboard'); setSearchQuery(''); setTabletDrawerOpen(false); }}
                        className="py-2.5 text-xs text-[#94A3B8] hover:text-[#6C5CE7] text-left"
                      >
                        All Active Bots
                      </button>
                      <button 
                        onClick={() => { setCreateBotOpen(true); setTabletDrawerOpen(false); }}
                        className="py-2.5 text-xs text-[#2ED573] text-left flex items-center gap-1.5"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Create New Bot
                      </button>
                      <button 
                        onClick={() => { setActiveTab('bots'); setCategoryFilter('Arbitrage'); setTabletDrawerOpen(false); }}
                        className="py-2.5 text-xs text-[#94A3B8] hover:text-[#6C5CE7] text-left"
                      >
                        Arbitrage Templates
                      </button>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => { setActiveTab('workflows'); setTabletDrawerOpen(false); }}
                  className={`w-full flex items-center gap-3 rounded-lg py-3 px-3.5 transition-all text-left ${activeTab === 'workflows' ? 'bg-[rgba(108,92,231,0.15)] text-[#6C5CE7] font-semibold' : 'hover:bg-[rgba(255,255,255,0.04)] text-[#94A3B8]'}`}
                >
                  <GitMerge className="w-[18px] h-[18px]" />
                  <span>Workflows</span>
                </button>

                <button 
                  onClick={() => { setActiveTab('analytics'); setTabletDrawerOpen(false); }}
                  className={`w-full flex items-center gap-3 rounded-lg py-3 px-3.5 transition-all text-left ${activeTab === 'analytics' ? 'bg-[rgba(108,92,231,0.15)] text-[#6C5CE7] font-semibold' : 'hover:bg-[rgba(255,255,255,0.04)] text-[#94A3B8]'}`}
                >
                  <BarChart3 className="w-[18px] h-[18px]" />
                  <span>Analytics Console</span>
                </button>

                <button 
                  onClick={() => { setActiveTab('logs'); setConsoleOpen(true); setTabletDrawerOpen(false); }}
                  className={`w-full flex items-center gap-3 rounded-lg py-3 px-3.5 transition-all text-left ${activeTab === 'logs' ? 'bg-[rgba(108,92,231,0.15)] text-[#6C5CE7] font-semibold' : 'hover:bg-[rgba(255,255,255,0.04)] text-[#94A3B8]'}`}
                >
                  <Terminal className="w-[18px] h-[18px]" />
                  <span>Live Terminal Logs</span>
                </button>

                <button 
                  onClick={() => { setActiveTab('settings'); setTabletDrawerOpen(false); }}
                  className={`w-full flex items-center gap-3 rounded-lg py-3 px-3.5 transition-all text-left ${activeTab === 'settings' ? 'bg-[rgba(108,92,231,0.15)] text-[#6C5CE7] font-semibold' : 'hover:bg-[rgba(255,255,255,0.04)] text-[#94A3B8]'}`}
                >
                  <Settings className="w-[18px] h-[18px]" />
                  <span>Core Settings</span>
                </button>
              </nav>

              <div className="pt-4 border-t border-[rgba(255,255,255,0.05)] text-center flex flex-col items-center gap-2">
                <span className="text-[10px] text-slate-550 font-mono">Gateway Ping: 14ms (OPTIMAL)</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>


      {/* Main Container Right */}
      <main className="flex-1 w-full min-w-0 flex flex-col xl:h-screen xl:overflow-y-auto custom-scrollbar bg-[#0B0F17] p-4 sm:p-6 lg:p-10">
        
        {/* Real-time Ticker Simulation Banner trigger */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] gap-3 bg-gradient-to-r from-[rgba(108,92,231,0.03)] to-transparent">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${simulationActive ? 'bg-[#2ED573] animate-pulse' : 'bg-[#FFA502]'}`} />
            <div className="flex flex-col">
              <span className="text-xs font-bold font-mono tracking-tight flex items-center gap-1.5 text-[#F8FAFC]">
                AUTOMATED SIMULATOR SERVICE
                {simulationActive ? (
                  <span className="text-[9px] bg-emerald-500/15 border border-emerald-500/30 text-[#2ED573] px-1.5 py-0.2 rounded font-mono">Running</span>
                ) : (
                  <span className="text-[9px] bg-amber-500/15 border border-amber-500/30 text-[#FFA502] px-1.5 py-0.2 rounded font-mono">Paused</span>
                )}
              </span>
              <span className="text-xs text-[#94A3B8] font-mono">Increments executions and injects dynamic log activities to the log stream periodically.</span>
            </div>
          </div>
          <button 
            id="simulation-toggle-btn"
            onClick={() => setSimulationActive(!simulationActive)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 border ${
              simulationActive 
                ? 'bg-amber-500/10 border-amber-500/30 text-[#FFA502] hover:bg-amber-500/20' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-[#2ED573] hover:bg-emerald-500/20'
            }`}
          >
            {simulationActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {simulationActive ? 'Pause Sim' : 'Resume Sim'}
          </button>
        </div>

        {/* Dynamic Content loaded through active tabs */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6"
          >
            {activeTab === 'dashboard' && (
              <>
                {/* 🏠 HOMEPAGE LAYOUT (DYOR STYLE) */}
                
                {/* 1. Top Summary Section */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Active Bots */}
                  <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] flex items-center justify-between hover:border-[rgba(108,92,231,0.25)] transition-all">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold">Active Bots</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black font-mono tracking-tight text-[#F8FAFC]">
                          {activeBotsCount}
                        </span>
                        <span className="text-xs text-slate-550 font-mono">/ {bots.length} total</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Registered node instances</span>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-[rgba(108,92,231,0.08)] border border-[rgba(108,92,231,0.2)] flex items-center justify-center text-[#6C5CE7]">
                      <Bot className="w-5 h-5 animate-pulse" />
                    </div>
                  </div>

                  {/* Card 2: Total Executions */}
                  <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] flex items-center justify-between hover:border-[rgba(108,92,231,0.25)] transition-all">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold">Total Executions</span>
                      <span className="text-2xl font-black font-mono tracking-tight text-[#F8FAFC]">
                        {totalExecutions.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[#2ED573] font-mono flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2ED573] animate-ping" />
                        Dynamic log increments live
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-[rgba(46,213,115,0.08)] border border-[rgba(46,213,115,0.2)] flex items-center justify-center text-[#2ED573]">
                      <Activity className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Card 3: Success Rate */}
                  <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] flex items-center justify-between hover:border-[rgba(108,92,231,0.25)] transition-all">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold">Avg Success Rate</span>
                      <span className="text-2xl font-black font-mono tracking-tight text-[#F8FAFC]">
                        {bots.length > 0 
                          ? (bots.reduce((acc, b) => acc + b.successRate, 0) / bots.length).toFixed(2) 
                          : '100'}%
                      </span>
                      <div className="w-24 bg-slate-800 rounded-full h-1 overflow-hidden mt-1">
                        <div className="bg-[#6C5CE7] h-full" style={{ width: '96.4%' }} />
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-[rgba(108,92,231,0.08)] border border-[rgba(108,92,231,0.2)] flex items-center justify-center text-[#6C5CE7]">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Card 4: System Status */}
                  <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] flex items-center justify-between hover:border-[rgba(108,92,231,0.25)] transition-all">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold">System Gateway</span>
                      <span className="text-2xl font-black font-mono tracking-tight text-[#F8FAFC] flex items-center gap-2">
                        {systemStatusMsg.text}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Gateway Node: 14ms (Optimal)</span>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-[rgba(46,213,115,0.08)] border border-[rgba(46,213,115,0.2)] flex items-center justify-center" style={{ color: systemStatusMsg.color }}>
                      <CheckCircle2 className="w-5 h-5 animate-pulse" />
                    </div>
                  </div>
                </section>

                {/* Main section: Bento Grid for Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: 2. Main Data Grid (DYOR STYLE CORE) */}
                  <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)]">
                      
                      {/* Grid Header & Filters */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
                        <div className="flex flex-col">
                          <h2 className="text-base font-bold text-white tracking-tight">Active API Gateway Clusters</h2>
                          <p className="text-xs text-[#94A3B8] font-mono">Structured analytics terminals and manual execution override controls.</p>
                        </div>

                        {/* Search & Custom filters */}
                        <div className="flex items-center gap-2 min-w-0 flex-1 sm:max-w-xs justify-end">
                          <div className="relative w-full flex items-center">
                            <Search className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                            <input 
                              type="text" 
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Search bot names..."
                              className="w-full bg-[rgba(20,20,20,0.55)] border border-[rgba(255,255,255,0.08)] text-white text-xs rounded-lg py-2 pl-9 pr-3 outline-none focus:border-[#6C5CE7] transition-all"
                            />
                            {searchQuery && (
                              <button onClick={() => setSearchQuery('')} className="absolute right-3 text-slate-500 hover:text-white">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Filter Badges Row */}
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="text-xs text-[#94A3B8] font-semibold mr-1">Status:</span>
                        {['All', 'Active', 'Standby', 'Error'].map((status) => (
                          <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider transition-all border ${
                              statusFilter === status 
                                ? 'bg-[rgba(108,92,231,0.15)] border-[#6C5CE7] text-[#6C5CE7]' 
                                : 'bg-[rgba(255,255,255,0.02)] border-transparent text-[#94A3B8] hover:text-white'
                            }`}
                          >
                            {status}
                          </button>
                        ))}

                        <div className="h-4 w-px bg-slate-800 mx-2" />

                        <span className="text-xs text-[#94A3B8] font-semibold mr-1">Category:</span>
                        {['All', 'Arbitrage', 'AI & NLP', 'Social', 'Utility'].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider transition-all border ${
                              categoryFilter === cat 
                                ? 'bg-[rgba(108,92,231,0.15)] border-[#6C5CE7] text-[#6C5CE7]' 
                                : 'bg-[rgba(255,255,255,0.02)] border-transparent text-[#94A3B8] hover:text-white'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {/* Main Data Table DYOR STYLE CORE */}
                      <div className="w-full overflow-x-auto no-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[600px] font-mono text-xs">
                          <thead>
                            <tr className="border-b border-[rgba(255,255,255,0.08)] text-[#94A3B8]">
                              <th className="pb-3 pt-1 font-semibold">BOT IDENTIFIER</th>
                              <th className="pb-3 pt-1 font-semibold text-center">CHAIN</th>
                              <th className="pb-3 pt-1 font-semibold">STATUS</th>
                              <th className="pb-3 pt-1 font-semibold text-right">METRIC EXEC</th>
                              <th className="pb-3 pt-1 font-semibold text-right">SUCCESS %</th>
                              <th className="pb-3 pt-1 font-semibold text-center">SPARK GLANCE</th>
                              <th className="pb-3 pt-1 font-semibold text-center">CONTROL</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                            {filteredBots.map((bot) => {
                              const isExpanded = expandedBotId === bot.id;
                              return (
                                <React.Fragment key={bot.id}>
                                  <tr 
                                    onClick={() => setExpandedBotId(isExpanded ? null : bot.id)}
                                    className="hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-pointer group"
                                  >
                                    <td className="py-3.5 pr-3 min-w-[200px]">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#6C5CE7] shrink-0">
                                          {bot.category === 'Arbitrage' && <GitMerge className="w-4 h-4 text-[#6C5CE7]" />}
                                          {bot.category === 'AI & NLP' && <Sparkles className="w-4 h-4 text-[#FFA502]" />}
                                          {bot.category === 'Utility' && <Sliders className="w-4 h-4 text-[#2ED573]" />}
                                          {bot.category === 'Social' && <Bot className="w-4 h-4 text-sky-450" />}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                          <span className="font-bold text-[#F8FAFC] flex items-center gap-1.5 group-hover:text-[#6C5CE7] transition-all">
                                            {bot.name}
                                          </span>
                                          <span className="text-[10px] text-slate-500 truncate mt-0.5">{bot.category}</span>
                                        </div>
                                      </div>
                                    </td>
                                    
                                    <td className="py-3.5 px-2 text-center">
                                      <span className="text-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] px-1.5 py-0.5 rounded uppercase font-bold text-[#F8FAFC]">
                                        {bot.chain}
                                      </span>
                                    </td>

                                    <td className="py-3.5 px-2">
                                      <div className="flex items-center gap-2">
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                          bot.status === 'Active' ? 'bg-[#2ED573] animate-pulse' : 
                                          bot.status === 'Standby' ? 'bg-[#FFA502]' : 'bg-[#FF4757]'
                                        }`} />
                                        <span className={`text-[10px] font-bold ${
                                          bot.status === 'Active' ? 'text-[#2ED573]' : 
                                          bot.status === 'Standby' ? 'text-[#FFA502]' : 'text-[#FF4757]'
                                        }`}>
                                          {bot.status}
                                        </span>
                                      </div>
                                    </td>

                                    <td className="py-3.5 px-2 text-right text-slate-350">
                                      {bot.executions.toLocaleString()}
                                    </td>

                                    <td className="py-3.5 px-2 text-right font-bold text-white">
                                      {bot.successRate}%
                                    </td>

                                    {/* Mini inline Sparkline visual design */}
                                    <td className="py-3.5 px-4 min-w-[100px] text-center">
                                      <div className="h-6 flex items-end justify-center gap-[2px]">
                                        {bot.sparkline.map((s, idx) => (
                                          <div 
                                            key={idx}
                                            className="w-1.5 rounded-sm"
                                            style={{ 
                                              height: `${s.val}%`, 
                                              backgroundColor: bot.status === 'Active' ? '#6C5CE7' : bot.status === 'Error' ? '#FF4757' : '#94A3B8',
                                              opacity: 0.3 + (idx / 8) * 0.7 
                                            }}
                                          />
                                        ))}
                                      </div>
                                    </td>

                                    {/* Control buttons */}
                                    <td className="py-3.5 pr-1 pl-3 text-center" onClick={(e) => e.stopPropagation()}>
                                      <div className="flex items-center gap-1.5 justify-center">
                                        <button 
                                          onClick={(ev) => toggleBotStatus(bot.id, ev)}
                                          className={`p-1.5 rounded hover:bg-[rgba(255,255,255,0.08)] transition-all ${bot.status === 'Active' ? 'text-[#FFA502]' : 'text-[#2ED573]'}`}
                                          title={bot.status === 'Active' ? 'Pause Bot' : 'Start Bot'}
                                        >
                                          {bot.status === 'Active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                        </button>
                                        <button 
                                          onClick={(ev) => deleteBot(bot.id, ev)}
                                          className="p-1.5 rounded hover:bg-[rgba(255,255,255,0.08)] text-[#FF4757] transition-all"
                                          title="Delete Node"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>

                                  {/* Row Expansion details */}
                                  <AnimatePresence>
                                    {isExpanded && (
                                      <tr>
                                        <td colSpan={7} className="p-0 bg-[rgba(255,255,255,0.01)] border-b border-[rgba(255,255,255,0.05)]">
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                          >
                                            <div className="p-5 flex flex-col sm:flex-row gap-6">
                                              {/* Left Column stats */}
                                              <div className="flex-1 flex flex-col gap-4">
                                                <div className="flex flex-col">
                                                  <span className="text-xs text-[#94A3B8] font-semibold font-sans mb-1">Functional Description</span>
                                                  <p className="text-xs text-slate-350 leading-relaxed font-sans">{bot.description}</p>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 mt-2">
                                                  <div className="p-2.5 rounded bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] flex flex-col">
                                                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Uptime Ratio</span>
                                                    <span className="text-xs text-[#F8FAFC] font-bold font-mono mt-0.5">{bot.uptime}%</span>
                                                  </div>
                                                  <div className="p-2.5 rounded bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] flex flex-col">
                                                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Latency Avg</span>
                                                    <span className="text-xs text-[#F8FAFC] font-bold font-mono mt-0.5">{bot.latency}ms</span>
                                                  </div>
                                                  <div className="p-2.5 rounded bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] flex flex-col">
                                                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Platform Fee Node</span>
                                                    <span className="text-xs text-[#6C5CE7] font-bold font-mono mt-0.5">0.15 TON</span>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Right Column: Mini simulated stream data output */}
                                              <div className="w-full sm:w-[280px] rounded bg-[#03060E] border border-[rgba(255,255,255,0.05)] p-4 flex flex-col gap-2">
                                                <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-1.5 mb-1">
                                                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                    <Terminal className="w-3 h-3 text-[#6C5CE7]" />
                                                    Payload Output Feed
                                                  </span>
                                                  <span className="text-[9px] text-[#2ED573] font-mono leading-none flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#2ED573] animate-ping" />
                                                    LIVE
                                                  </span>
                                                </div>
                                                <div className="font-mono text-[10px] text-slate-400 max-h-[100px] overflow-y-auto no-scrollbar flex flex-col gap-1.5 select-all">
                                                  <span>{`{`}</span>
                                                  <span className="pl-3.5 text-[#2ED573]">{`  "node_id": "${bot.id}",`}</span>
                                                  <span className="pl-3.5 text-[#2ED573]">{`  "latency": ${bot.latency},`}</span>
                                                  <span className="pl-3.5 text-[#2ED573]">{`  "last_response": "RESOLVED_OK",`}</span>
                                                  <span className="pl-3.5 text-[#FFA502]">{`  "hash": "0x${(Math.random()*1000000).toFixed(0)}e${bot.id.split('-')[1]}a"`}</span>
                                                  <span>{`}`}</span>
                                                </div>
                                              </div>
                                            </div>
                                          </motion.div>
                                        </td>
                                      </tr>
                                    )}
                                  </AnimatePresence>
                                </React.Fragment>
                              );
                            })}
                            {filteredBots.length === 0 && (
                              <tr>
                                <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                                  No active bot matching the filters was found.<br />
                                  <button onClick={() => { setSearchQuery(''); setStatusFilter('All'); setCategoryFilter('All'); }} className="mt-3 text-xs text-[#6C5CE7] underline font-sans">Clear Filters</button>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Bento Grid for 3. Activity Stream & 4. Quick Actions */}
                  <div className="flex flex-col gap-6">
                    
                    {/* Activity Stream Feed Panel */}
                    <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] flex-1 flex flex-col gap-3 max-h-[450px] overflow-hidden">
                      <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] pb-3">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4.5 h-4.5 text-[#6C5CE7] animate-pulse" />
                          <h2 className="text-sm font-bold text-white tracking-tight">Activity Stream (Execution Pings)</h2>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">Live ticker</span>
                      </div>

                      {/* Log feed stack */}
                      <div className="flex-1 overflow-y-auto pr-1 no-scrollbar flex flex-col gap-2">
                        {logs.slice(0, 10).map((log) => (
                          <div 
                            key={log.id} 
                            className="p-3 rounded-lg border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] transition-all flex flex-col gap-1 text-[11px] font-mono leading-relaxed"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[#6C5CE7] font-bold text-[10px] uppercase truncate max-w-[140px]">{log.botName}</span>
                              <span className="text-slate-500 text-[9px] shrink-0 font-semibold">{log.timestamp}</span>
                            </div>
                            
                            <p className="text-slate-350 text-[10.5px] pl-0.5">{log.message}</p>
                            
                            <div className="flex items-center gap-2 mt-1">
                              {log.type === 'success' && (
                                <span className="bg-emerald-500/10 border border-emerald-500/20 text-[#2ED573] text-[8px] font-bold px-1 rounded-sm leading-tight">SUCCESS</span>
                              )}
                              {log.type === 'info' && (
                                <span className="bg-blue-500/10 border border-blue-500/20 text-[#2F88FF] text-[8px] font-bold px-1 rounded-sm leading-tight">INFO</span>
                              )}
                              {log.type === 'error' && (
                                <span className="bg-red-500/10 border border-red-500/20 text-[#FF4757] text-[8px] font-bold px-1 rounded-sm leading-tight">CRITICAL_FAIL</span>
                              )}
                              {log.type === 'warning' && (
                                <span className="bg-amber-500/10 border border-amber-500/20 text-[#FFA502] text-[8px] font-bold px-1 rounded-sm leading-tight">WARN</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 4. Quick Actions Panel */}
                    <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] flex flex-col gap-3">
                      <h2 className="text-sm font-bold text-white tracking-tight pb-2 border-b border-[rgba(255,255,255,0.05)]">Quick Execution Triggers</h2>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {/* Trigger 1: Create Bot */}
                        <button 
                          onClick={() => setCreateBotOpen(true)}
                          className="p-3.5 rounded-lg border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(108,92,231,0.08)] hover:border-[#6C5CE7] transition-all flex flex-col items-start gap-1.5 text-left group"
                        >
                          <Plus className="w-5 h-5 text-[#6C5CE7]" />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white group-hover:text-[#6C5CE7] transition-colors">Create Bot</span>
                            <span className="text-[9px] text-slate-500 font-mono">Register new node</span>
                          </div>
                        </button>

                        {/* Trigger 2: Simulation trigger */}
                        <button 
                          onClick={() => {
                            // Run a quick batch run simulation
                            setTotalExecutions(p => p + 10);
                            setLogs(prev => [
                              {
                                id: `log-quick-${Date.now()}`,
                                timestamp: new Date().toTimeString().split(' ')[0],
                                botId: 'system',
                                botName: 'Batch Orchestrator',
                                type: 'success',
                                message: 'Triggered batch pipeline. Executed sandbox run triggers across 10 active pools concurrently.'
                              },
                              ...prev
                            ]);
                          }}
                          className="p-3.5 rounded-lg border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(46,213,115,0.08)] hover:border-[#2ED573] transition-all flex flex-col items-start gap-1.5 text-left group"
                        >
                          <RefreshCw className="w-5 h-5 text-[#2ED573] group-hover:rotate-180 transition-all duration-500" />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white group-hover:text-[#2ED573] transition-colors">Run Batch Trace</span>
                            <span className="text-[9px] text-slate-500 font-mono">Execute bulk nodes</span>
                          </div>
                        </button>

                        {/* Trigger 3: Open Terminal Console */}
                        <button 
                          onClick={() => setConsoleOpen(true)}
                          className="p-3.5 rounded-lg border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.06)] hover:border-slate-500 transition-all flex flex-col items-start gap-1.5 text-left group"
                        >
                          <Command className="w-5 h-5 text-slate-400" />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white group-hover:text-slate-200 transition-colors">Interactive Terminal</span>
                            <span className="text-[9px] text-slate-500 font-mono">Manual CMD system</span>
                          </div>
                        </button>

                        {/* Trigger 4: Clear Cluster Errors */}
                        <button 
                          onClick={() => {
                            // Fix Starknet model bridge
                            setBots(prev => prev.map(b => b.status === 'Error' ? { ...b, status: 'Active', uptime: 100, latency: 45 } : b));
                            setLogs(prev => [
                              {
                                id: `log-${Date.now()}`,
                                timestamp: new Date().toTimeString().split(' ')[0],
                                botId: 'system',
                                botName: 'System Core',
                                type: 'success',
                                message: 'Automatic repair cycle completed. Cleared network timeouts. All node channels healthy.'
                              },
                              ...prev
                            ]);
                          }}
                          className="p-3.5 rounded-lg border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,165,0,0.08)] hover:border-[#FFA502] transition-all flex flex-col items-start gap-1.5 text-left group"
                        >
                          <SlidersHorizontal className="w-5 h-5 text-[#FFA502]" />
                          <div className="flex flex-col key">
                            <span className="text-xs font-bold text-white group-hover:text-[#FFA502] transition-colors">Hotfix Nodes</span>
                            <span className="text-[9px] text-slate-500 font-mono">Reset crashed nodes</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Subpages / Other tabs representation to show production readiness of the UI */}

            {/* Bots / Template View */}
            {activeTab === 'bots' && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-white">Bot Configurations & Templates</h1>
                    <p className="text-xs text-[#94A3B8] font-mono">Spawn, debug, or deploy a pre-configured smart agent routing program.</p>
                  </div>
                  <button 
                    onClick={() => setCreateBotOpen(true)}
                    className="bg-[#6C5CE7] hover:bg-[#5B4BCB] text-white text-xs px-4 py-2 rounded-lg font-semibold flex items-center gap-1.5 shadow-[0_4px_14px_rgba(108,92,231,0.25)] transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Deploy Custom Bot
                  </button>
                </div>

                {/* Templates Grid Column */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bots.map((bot) => (
                    <div 
                      key={bot.id} 
                      className="p-5 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] flex flex-col justify-between gap-4 hover:border-[rgba(108,92,231,0.25)] transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#6C5CE7] to-transparent opacity-[0.03] select-none pointer-events-none" />
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-mono border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-2 py-0.5 rounded font-bold text-slate-350">
                            {bot.chain} Network
                          </span>
                          <span className={`w-2.5 h-2.5 rounded-full ${bot.status === 'Active' ? 'bg-[#2ED573]' : bot.status === 'Standby' ? 'bg-[#FFA502]' : 'bg-[#FF4757]'}`} />
                        </div>

                        <h3 className="font-bold text-sm text-white group-hover:text-[#6C5CE7] transition-all truncate mt-1">{bot.name}</h3>
                        <p className="text-[11.5px] text-[#94A3B8] line-clamp-3 leading-relaxed font-sans mt-0.5">{bot.description}</p>
                      </div>

                      <div className="flex flex-col gap-3.5 border-t border-[rgba(255,255,255,0.05)] pt-4 mt-1 font-mono text-[11px]">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[9px] text-slate-500 uppercase">Avg Success</span>
                            <span className="font-bold text-white">{bot.successRate}%</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] text-slate-500 uppercase">Executed runs</span>
                            <span className="font-bold text-white">{bot.executions.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          <button 
                            onClick={() => toggleBotStatus(bot.id)}
                            className={`flex-1 text-center py-2 rounded text-xs font-bold transition-all border ${
                              bot.status === 'Active' 
                                ? 'bg-amber-500/10 border-amber-500/20 text-[#FFA502] hover:bg-amber-500/20' 
                                : 'bg-[#2ED573]/10 border-[#2ED573]/20 text-[#2ED573] hover:bg-[#2ED573]/20'
                            }`}
                          >
                            {bot.status === 'Active' ? 'Toggle Standby' : 'Toggle Active'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Workflows View */}
            {activeTab === 'workflows' && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-white">Dynamic Workflow Pipelines</h1>
                    <p className="text-xs text-[#94A3B8] font-mono">Create reactive trigger-action rules connecting Web3 blockchain pings directly to Telegram outputs.</p>
                  </div>
                </div>

                <div className="p-6 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] flex flex-col gap-6">
                  {/* Step visual design */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.04)] relative">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6C5CE7] to-[#8C7CFF] flex items-center justify-center font-bold text-xs">1</div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-350">TRIGGER NODE</span>
                        <span className="text-xs font-bold text-white font-mono">TON Mempool Block Discovered</span>
                      </div>
                    </div>
                    <div className="text-slate-550 border border-[rgba(255,255,255,0.08)] px-2.5 py-1 rounded bg-[rgba(255,255,255,0.02)] font-mono text-[10px]">Filter: Liquidity &gt; 10K USD</div>
                    
                    <div className="hidden md:block absolute left-1/2 -translate-x-1/2 h-8 w-px bg-slate-700 pointer-events-none" />

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-500/20 text-[#FF4757] border border-rose-500/30 flex items-center justify-center font-bold text-xs">2</div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-350">ACTION AGENT</span>
                        <span className="text-xs font-bold text-[#FFA502] font-mono">Raydium Price Arbitrage Sniper</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 text-center text-slate-500 flex flex-col items-center gap-3">
                    <HelpCircle className="w-10 h-10 text-[#6C5CE7]" />
                    <span className="text-xs font-sans">Pipeline Sandbox in dev stage. Deploy triggers to link live blockchain websockets.</span>
                    <button 
                      onClick={() => {
                        setLogs(prev => [
                          {
                            id: `log-wf-${Date.now()}`,
                            timestamp: new Date().toTimeString().split(' ')[0],
                            botId: 'system',
                            botName: 'Workflow Agent',
                            type: 'info',
                            message: 'Simulated dry-run trace for workflow channel: [Trigger TON block create -> execute RAY sniper] successful. latency: 40ms.'
                          },
                          ...prev
                        ]);
                      }}
                      className="mt-2 bg-[rgba(108,92,231,0.15)] border border-[rgba(108,92,231,0.2)] text-[#6C5CE7] hover:bg-[rgba(108,92,231,0.25)] text-xs px-4 py-2 rounded-lg font-bold"
                    >
                      Dry-Run Pipeline
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics View */}
            {activeTab === 'analytics' && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-white">Advanced System Analytics</h1>
                    <p className="text-xs text-[#94A3B8] font-mono">Detailed metric visualizations and dynamic aggregate pipeline throughput logs.</p>
                  </div>
                </div>

                {/* Grid charts with Recharts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Chart 1: Cumulative executions over time */}
                  <div className="p-5 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Cluster Executions (Last 7 Days)</span>
                      <span className="text-[10px] text-[#2ED573] font-mono border border-emerald-500/10 bg-emerald-500/5 px-2 py-0.5 rounded">Optimal</span>
                    </div>

                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { name: 'Monday', runs: 24000 },
                          { name: 'Tuesday', runs: 28000 },
                          { name: 'Wednesday', runs: 32000 },
                          { name: 'Thursday', runs: 29000 },
                          { name: 'Friday', runs: 39000 },
                          { name: 'Saturday', runs: 42000 },
                          { name: 'Sunday', runs: 45000 },
                        ]}>
                          <defs>
                            <linearGradient id="colorRuns" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6C5CE7" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#6C5CE7" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} />
                          <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0B0F17', borderColor: 'rgba(255,255,255,0.08)' }} labelClassName="text-white" />
                          <Area type="monotone" dataKey="runs" stroke="#6C5CE7" strokeWidth={2} fillOpacity={1} fill="url(#colorRuns)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 2: Comparative Uptime metric */}
                  <div className="p-5 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Bot Cluster Latencies (ms)</span>
                      <span className="text-[10px] text-slate-500 font-mono">Lower is optimal</span>
                    </div>

                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={bots.map(b => ({ name: b.name.substring(0, 10) + '...', latency: b.latency }))}>
                          <XAxis dataKey="name" stroke="#94A3B8" fontSize={8} tickLine={false} />
                          <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0B0F17', borderColor: 'rgba(255,255,255,0.08)' }} />
                          <Bar dataKey="latency" fill="#6C5CE7" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings View */}
            {activeTab === 'settings' && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-white">Configuration Panel</h1>
                    <p className="text-xs text-[#94A3B8] font-mono">Control blockchain nodes, key secrets, and aggregate alert limits.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Block 1: Custom Slippage adjustments */}
                  <div className="p-5 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] flex flex-col gap-4">
                    <h3 className="font-bold text-sm text-white">DeFi Spread Thresholds</h3>
                    <div className="flex flex-col gap-3 font-mono text-xs">
                      <div className="flex flex-col gap-1.5Packed font-semibold text-slate-350">
                        <label className="text-xs text-slate-350">Minimum Profit Spread</label>
                        <input type="range" min="0.1" max="5" step="0.1" defaultValue="0.5" className="w-full accent-[#6C5CE7] bg-slate-800" />
                        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                          <span>0.1%</span>
                          <span>Target: 0.5% (Default)</span>
                          <span>5.0%</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 mt-2">
                        <label className="text-xs text-slate-350">Max Slip Tolerance</label>
                        <input type="range" min="0.05" max="1" step="0.05" defaultValue="0.15" className="w-full accent-[#6C5CE7] bg-slate-800" />
                        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                          <span>0.05%</span>
                          <span>Selected: 0.15%</span>
                          <span>1.0%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Block 2: RPC Node Management */}
                  <div className="p-5 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] flex flex-col gap-4">
                    <h3 className="font-bold text-sm text-white">Active Blockchain Gateways (RPCS)</h3>
                    <div className="flex flex-col gap-2 font-mono text-xs">
                      <div className="p-2.5 rounded border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)] flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#F8FAFC]">TON dApp RPC Protocol</span>
                          <span className="text-[10px] text-slate-500">https://ton.access.api.studio</span>
                        </div>
                        <span className="text-[10px] font-bold text-[#2ED573] border border-emerald-500/10 bg-emerald-500/5 px-2 py-0.5 rounded">CONNECTED</span>
                      </div>

                      <div className="p-2.5 rounded border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)] flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#F8FAFC]">Solana Mainet RPC</span>
                          <span className="text-[10px] text-slate-500">https://api.mainnet-beta.solana.com</span>
                        </div>
                        <span className="text-[10px] font-bold text-[#2ED573] border border-emerald-500/10 bg-emerald-500/5 px-2 py-0.5 rounded">CONNECTED</span>
                      </div>

                      <div className="p-2.5 rounded border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)] flex items-center justify-between">
                        <div className="flex flex-col opacity-65">
                          <span className="font-bold text-[#F8FAFC]">Ethereum Node Core</span>
                          <span className="text-[10px] text-slate-500">Unconfigured (Offline)</span>
                        </div>
                        <span className="text-[10px] font-bold text-[#FFA502] border border-amber-500/10 bg-amber-500/5 px-2 py-0.5 rounded">PENDING</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </main>

      {/* 🧭 BOTTOM SATE NAVIGATION (MOBILE ONLY CONSTRAINTS) */}
      <BottomNavigationElementAndSlideOverMenu 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        setCreateBotOpen={setCreateBotOpen}
        setConsoleOpen={setConsoleOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        mobileMenuHistory={mobileMenuHistory}
        setMobileMenuHistory={setMobileMenuHistory}
        mobileSubMenu={mobileSubMenu}
        setMobileSubMenu={setMobileSubMenu}
        bots={bots}
      />

      {/* 🔮 MODAL SLIDE-OVERS & BOTTOM SHEET BOXES */}

      {/* Box 1: Draw-over Slide configuration to Create a Bot Node */}
      <AnimatePresence>
        {createBotOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCreateBotOpen(false)}
              className="fixed inset-0 bg-[#000]/70 backdrop-blur-sm z-50 pointer-events-auto"
            />
            
            <motion.div 
              initial={{ y: '100%', scale: 1 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: '100%', scale: 1 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="fixed bottom-0 left-0 right-0 xl:top-12 xl:left-auto xl:bottom-12 xl:right-12 xl:w-[420px] bg-[#0B0F17] border-t xl:border border-[rgba(255,255,255,0.08)] xl:rounded-xl p-6 z-50 flex flex-col gap-6 font-sans overflow-y-auto max-h-[90vh] xl:max-h-screen no-scrollbar pointer-events-auto shadow-[0_12px_48px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] pb-3">
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-[#6C5CE7]" />
                  <h3 className="font-bold text-white tracking-tight">Register New Bot Gateway</h3>
                </div>
                <button 
                  onClick={() => setCreateBotOpen(false)}
                  className="p-1.5 hover:bg-[rgba(255,255,255,0.04)] rounded-full text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateBot} className="flex flex-col gap-4 text-xs font-mono">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-bold uppercase">BOT UNIQUE NAME</label>
                  <input 
                    type="text" 
                    required 
                    value={newBotName}
                    onChange={(e) => setNewBotName(e.target.value)}
                    placeholder="e.g. My Arbitrage Sniper V3" 
                    className="w-full bg-[rgba(20,20,20,0.6)] border border-[rgba(255,255,255,0.08)] text-white text-xs rounded-lg p-3 outline-none focus:border-[#6C5CE7]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-400 font-bold uppercase">CATEGORY CLUST</label>
                    <select 
                      value={newBotCategory}
                      onChange={(e) => setNewBotCategory(e.target.value as any)}
                      className="w-full bg-[rgba(20,20,20,0.6)] border border-[rgba(255,255,255,0.08)] text-white text-xs rounded-lg p-3 outline-none focus:border-[#6C5CE7]"
                    >
                      <option value="Arbitrage">Arbitrage Model</option>
                      <option value="AI & NLP">AI Sentiment Core</option>
                      <option value="Social">Social Broadcaster</option>
                      <option value="Utility">Utility Router</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-400 font-bold uppercase">GAS FEE CHAIN</label>
                    <select 
                      value={newBotChain}
                      onChange={(e) => setNewBotChain(e.target.value as any)}
                      className="w-full bg-[rgba(20,20,20,0.6)] border border-[rgba(255,255,255,0.08)] text-white text-xs rounded-lg p-3 outline-none focus:border-[#6C5CE7]"
                    >
                      <option value="TON">TON Ecosystem</option>
                      <option value="Solana">Solana protocol</option>
                      <option value="Ethereum">Ethereum (L1/L2)</option>
                      <option value="BSC">Binance Chain</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-bold uppercase">DESCRIPTION FUNCTIONAL</label>
                  <textarea 
                    value={newBotDesc}
                    onChange={(e) => setNewBotDesc(e.target.value)}
                    rows={3}
                    placeholder="Brief outline of how this routing node behaves..."
                    className="w-full bg-[rgba(20,20,20,0.6)] border border-[rgba(255,255,255,0.08)] text-white text-xs rounded-lg p-3 outline-none focus:border-[#6C5CE7] resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 border-t border-[rgba(255,255,255,0.05)] pt-4 mt-2">
                  <button 
                    type="button" 
                    onClick={() => setCreateBotOpen(false)}
                    className="flex-1 py-3 text-center rounded-lg border border-[rgba(255,255,255,0.08)] text-[#94A3B8] font-bold hover:bg-[rgba(255,255,255,0.02)]"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3 text-center rounded-lg bg-[#6C5CE7] text-white hover:bg-[#5B4BCB] font-bold"
                  >
                    Deploy Node
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>


      {/* Box 2: Developer Interactive CLI Console Terminal */}
      <AnimatePresence>
        {consoleOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConsoleOpen(false)}
              className="fixed inset-0 bg-[#000]/70 backdrop-blur-sm z-50 pointer-events-auto"
            />
            
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="fixed bottom-0 left-0 right-0 xl:top-12 xl:bottom-12 xl:left-12 xl:right-12 bg-[#040810] border-t xl:border border-[rgba(255,255,255,0.08)] xl:rounded-xl p-6 z-50 flex flex-col gap-4 font-mono pointer-events-auto h-[85vh] xl:h-auto overflow-hidden shadow-[0_12px_48px_rgba(0,0,0,0.65)]"
            >
              <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="text-[#6C5CE7] w-5 h-5 animate-pulse" />
                  <h3 className="font-bold text-white tracking-tight">BotlyHub Interactive CLI Terminal Controller</h3>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-slate-500 font-mono">Gateway Ping: 14ms (Optimal)</span>
                  <button 
                    onClick={() => setConsoleOpen(false)}
                    className="p-1.5 hover:bg-[rgba(255,255,255,0.04)] rounded-full text-slate-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Terminal Logs Window */}
              <div className="flex-1 bg-[#010307] border border-[rgba(255,255,255,0.03)] rounded-lg p-4 overflow-y-auto no-scrollbar flex flex-col gap-1.5 text-xs text-slate-350 select-all">
                {terminalHistory.map((text, idx) => (
                  <div key={idx} className="whitespace-pre-wrap leading-relaxed select-all">
                    {text.startsWith('>') ? (
                      <span className="text-[#6C5CE7] font-bold select-none">{text}</span>
                    ) : text.startsWith('SUCCESS') ? (
                      <span className="text-[#2ED573] font-bold">{text}</span>
                    ) : text.startsWith('ERROR') ? (
                      <span className="text-[#FF4757] font-bold">{text}</span>
                    ) : text.startsWith('METRICS') || text.startsWith('SYSTEM') ? (
                      <span className="text-[#FFA502] font-semibold">{text}</span>
                    ) : (
                      <span>{text}</span>
                    )}
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>

              {/* Terminal input form */}
              <form onSubmit={handleTerminalSubmit} className="flex gap-2">
                <div className="h-10 w-10 shrink-0 bg-[#010307] border border-[rgba(255,255,255,0.05)] rounded-lg flex items-center justify-center text-[#6C5CE7] select-none">
                  &gt;_
                </div>
                <input 
                  type="text"
                  value={terminalCommand}
                  onChange={(e) => setTerminalCommand(e.target.value)}
                  placeholder="Type 'help' to audit commands / trigger live nodes..."
                  className="flex-1 bg-[#010307] border border-[rgba(255,255,255,0.05)] rounded-lg px-4 text-xs font-mono text-white outline-none focus:border-[#6C5CE7]"
                  autoFocus
                />
                <button 
                  type="submit"
                  className="px-6 bg-[#6C5CE7] hover:bg-[#5B4BCB] font-extrabold text-[#F8FAFC] rounded-lg transition-all text-xs uppercase cursor-pointer"
                >
                  Send
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

// 🧭 BOTTOM NAVIGATION ELEMENT AND SLIDEOVER PANEL (MOBILES SPECIFIC CONSTRS)
interface BottomNavigationElementAndSlideOverMenuProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setCreateBotOpen: (open: boolean) => void;
  setConsoleOpen: (open: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  mobileMenuHistory: string[];
  setMobileMenuHistory: (history: string[]) => void;
  mobileSubMenu: string | null;
  setMobileSubMenu: (submenu: string | null) => void;
  bots: BotItem[];
}

function BottomNavigationElementAndSlideOverMenu({
  activeTab,
  setActiveTab,
  setCreateBotOpen,
  setConsoleOpen,
  mobileMenuOpen,
  setMobileMenuOpen,
  mobileMenuHistory,
  setMobileMenuHistory,
  mobileSubMenu,
  setMobileSubMenu,
  bots
}: BottomNavigationElementAndSlideOverMenuProps) {

  const navigateToMenu = (submenu: string) => {
    setMobileMenuHistory([...mobileMenuHistory, submenu]);
    setMobileSubMenu(submenu);
  };

  const navigateBackMenu = () => {
    const nextHistory = [...mobileMenuHistory];
    nextHistory.pop();
    setMobileMenuHistory(nextHistory);
    setMobileSubMenu(nextHistory[nextHistory.length - 1] || null);
  };

  const selectTab = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setMobileSubMenu(null);
    setMobileMenuHistory([]);
  };

  return (
    <>
      {/* 🧭 BOTTOM SATE BAR */}
      <nav className="xl:hidden fixed bottom-0 left-0 right-0 bg-[#0B0F17]/95 border-t border-[rgba(255,255,255,0.08)] backdrop-blur-md px-4 py-2 flex items-center justify-around z-40 h-[64px]">
        {/* Nav tabs */}
        <button 
          onClick={() => selectTab('dashboard')}
          className={`flex flex-col items-center justify-center p-1.5 transition-all text-xs ${activeTab === 'dashboard' && !mobileMenuOpen ? 'text-[#6C5CE7]' : 'text-slate-400'}`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold">Home</span>
        </button>

        <button 
          onClick={() => selectTab('bots')}
          className={`flex flex-col items-center justify-center p-1.5 transition-all text-xs ${activeTab === 'bots' ? 'text-[#6C5CE7]' : 'text-slate-400'}`}
        >
          <Bot className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold">Bots</span>
        </button>

        <button 
          onClick={() => selectTab('workflows')}
          className={`flex flex-col items-center justify-center p-1.5 transition-all text-xs ${activeTab === 'workflows' ? 'text-[#6C5CE7]' : 'text-slate-400'}`}
        >
          <GitMerge className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold">Workflows</span>
        </button>

        <button 
          onClick={() => selectTab('analytics')}
          className={`flex flex-col items-center justify-center p-1.5 transition-all text-xs ${activeTab === 'analytics' ? 'text-[#6C5CE7]' : 'text-slate-400'}`}
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold">Charts</span>
        </button>

        {/* Hamburger Menu slideover trigger */}
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center p-1.5 transition-all text-xs ${mobileMenuOpen ? 'text-[#6C5CE7]' : 'text-slate-400'}`}
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold">Menu</span>
        </button>
      </nav>

      {/* Slide-over FULL FRAME PANEL constraint (Mobile specific layout) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 24, stiffness: 170 }}
            className="xl:hidden fixed inset-0 bg-[#0B0F17] z-50 pointer-events-auto flex flex-col p-6 overflow-y-auto pb-24"
          >
            {/* Header / Back navigations indicator */}
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] pb-4 mb-6">
              <div className="flex items-center gap-2">
                {mobileSubMenu ? (
                  <button onClick={navigateBackMenu} className="p-1 px-[7px] bg-[rgba(255,255,255,0.04)] hover:bg-[#111] rounded mr-1.5 flex items-center justify-center">
                    <ChevronLeft className="w-4 h-4 text-[#6C5CE7]" />
                  </button>
                ) : null}
                <div className="flex-col">
                  <h3 className="font-bold text-[#F8FAFC]">
                    {mobileSubMenu === 'bots' ? 'Bot Subcategories' : 'Main Control Menu'}
                  </h3>
                  <p className="text-[10px] text-slate-550 font-mono tracking-tight uppercase leading-none mt-0.5">TON.app interface design</p>
                </div>
              </div>
              
              <button onClick={() => { setMobileMenuOpen(false); setMobileSubMenu(null); setMobileMenuHistory([]); }} className="p-2 bg-[rgba(255,255,255,0.03)] rounded-full text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Flat items context nested inside slide menu */}
            <AnimatePresence mode="wait">
              {!mobileSubMenu ? (
                <motion.div 
                  key="main-links"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex flex-col gap-2 w-full font-sans text-sm"
                >
                  <button onClick={() => selectTab('dashboard')} className="w-full flex items-center justify-between rounded-lg py-3 px-4 bg-[rgba(255,255,255,0.02)] text-white hover:bg-[rgba(255,255,255,0.04)] text-left">
                    <div className="flex items-center gap-3">
                      <LayoutDashboard className="w-[18px] h-[18px] text-[#6C5CE7]" />
                      <span>Dashboard Hub</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>

                  <button onClick={() => navigateToMenu('bots')} className="w-full flex items-center justify-between rounded-lg py-3 px-4 bg-[rgba(255,255,255,0.02)] text-white hover:bg-[rgba(255,255,255,0.04)] text-left">
                    <div className="flex items-center gap-3">
                      <Bot className="w-[18px] h-[18px] text-[#FFA502]" />
                      <div className="flex flex-col">
                        <span>Bots Orchestrator</span>
                        <span className="text-[9px] text-slate-500 font-mono">Expand templates & config list</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>

                  <button onClick={() => selectTab('workflows')} className="w-full flex items-center justify-between rounded-lg py-3 px-4 bg-[rgba(255,255,255,0.02)] text-white hover:bg-[rgba(255,255,255,0.04)] text-left">
                    <div className="flex items-center gap-3">
                      <GitMerge className="w-[18px] h-[18px] text-[#2ED573]" />
                      <span>Workflows Pipeline</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>

                  <button onClick={() => selectTab('analytics')} className="w-full flex items-center justify-between rounded-lg py-3 px-4 bg-[rgba(255,255,255,0.02)] text-white hover:bg-[rgba(255,255,255,0.04)] text-left">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-[18px] h-[18px] text-[#6C5CE7]" />
                      <span>Charts & Analytics</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>

                  <button onClick={() => { setMobileMenuOpen(false); setConsoleOpen(true); }} className="w-full flex items-center justify-between rounded-lg py-3 px-4 bg-[rgba(255,255,255,0.02)] text-white hover:bg-[rgba(255,255,255,0.04)] text-left font-mono">
                    <div className="flex items-center gap-3">
                      <Terminal className="w-[18px] h-[18px] text-[#FF4757]" />
                      <span>_terminal CLI</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>

                  <button onClick={() => selectTab('settings')} className="w-full flex items-center justify-between rounded-lg py-3 px-4 bg-[rgba(255,255,255,0.02)] text-white hover:bg-[rgba(255,255,255,0.04)] text-left">
                    <div className="flex items-center gap-3">
                      <Settings className="w-[18px] h-[18px] text-slate-400" />
                      <span>System Settings</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </motion.div>
              ) : mobileSubMenu === 'bots' ? (
                <motion.div 
                  key="bots-links"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col gap-2 w-full font-sans text-sm"
                >
                  <button onClick={() => selectTab('bots')} className="w-full flex items-center justify-between rounded-lg py-3 px-4 bg-[rgba(255,255,255,0.02)] text-white hover:bg-[rgba(255,255,255,0.04)] text-left">
                    <div className="flex items-center gap-3">
                      <Bot className="w-4.5 h-4.5 text-[#6C5CE7]" />
                      <div className="flex flex-col">
                        <span>All Configuration Nodes</span>
                        <span className="text-[9px] text-slate-500 font-mono">Show bots layout</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded shrink-0">{bots.length}</span>
                  </button>

                  <button onClick={() => { setCreateBotOpen(true); setMobileMenuOpen(false); }} className="w-full flex items-center justify-between rounded-lg py-3 px-4 bg-[rgba(46,213,115,0.05)] border border-[rgba(46,213,115,0.15)] text-[#2ED573] text-left">
                    <div className="flex items-center gap-3">
                      <Plus className="w-4.5 h-4.5" />
                      <span>Register New Bot</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
