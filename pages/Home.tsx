import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../TranslationContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  GitBranch, 
  Cpu, 
  Workflow, 
  Bot, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Zap, 
  Layers, 
  Play, 
  Code, 
  ArrowRight, 
  ExternalLink, 
  ShieldCheck, 
  Activity, 
  RefreshCw, 
  Copy, 
  Check, 
  Search, 
  ChevronDown, 
  Plus, 
  Settings, 
  Trash2, 
  Sliders, 
  BarChart, 
  Radio, 
  Sparkles, 
  Globe, 
  Database, 
  BookOpen, 
  Share2, 
  Eye, 
  MessageSquare, 
  User, 
  Lock, 
  Server, 
  ChevronRight, 
  Filter, 
  Star,
  Coins
} from 'lucide-react';
import { categories, mockBots } from '../data';
import { DatabaseService } from '../services/DatabaseService';

// Standard dark theme: #0B0F17
// Panels: rgba(255,255,255,0.04)
// Borders: rgba(255,255,255,0.08)
// Accent: #6C5CE7
// Success: #2ED573
// Error: #FF4757

interface CloudBot {
  id: string;
  name: string;
  type: 'Support' | 'Automation' | 'QA' | 'Assistant';
  status: 'Active' | 'Idle' | 'Error';
  lastRun: string;
  successRate: number;
  runCount: number;
  systemPrompt: string;
  testInput: string;
  memory: { key: string; value: string }[];
  apiKey: string;
  trigger: 'Manual' | 'Webhook' | 'Schedule';
}

interface WorkflowNode {
  id: string;
  name: string;
  type: 'Trigger' | 'AI Processing' | 'Action';
  subtype: string;
  status: 'idle' | 'running' | 'success' | 'error';
}

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Navigation state: 'dashboard' | 'directory' | 'workflows' | 'playground' | 'analytics' | 'telemetry'
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'directory' | 'workflows' | 'playground' | 'analytics' | 'telemetry'>('dashboard');

  // Operational State
  const [cloudBots, setCloudBots] = useState<CloudBot[]>([
    {
      id: 'bot_support_01',
      name: 'SupportBot Core',
      type: 'Support',
      status: 'Active',
      lastRun: '1m ago',
      successRate: 98.4,
      runCount: 1420,
      systemPrompt: 'You are a technical customer support advisor for BotlyHub. Assist users respectfully and stick strictly to technical platform documentation.',
      testInput: 'How do I bind an external Telegram channel webhook to BotlyHub?',
      memory: [
        { key: 'knowledge_base_url', value: 'https://docs.botlyhub.com/faq' },
        { key: 'supported_payment_networks', value: 'TON Space, Wallet Telegram Pay' }
      ],
      apiKey: 'sk_live_ton_4872c9a1bc',
      trigger: 'Webhook'
    },
    {
      id: 'bot_qa_02',
      name: 'QA Deployment Guard',
      type: 'QA',
      status: 'Active',
      lastRun: '5m ago',
      successRate: 99.1,
      runCount: 815,
      systemPrompt: 'You are an autonomous DevOps visual test auditor. Scan staging source variables for credential exposures, syntax malfunctions, and SSL timeouts.',
      testInput: 'Scan repository: vercel-nextjs-api-route',
      memory: [
        { key: 'staging_dns', value: 'https://staging-api.botlyhub.internal' }
      ],
      apiKey: 'sk_live_ton_ea091bc8d1',
      trigger: 'Schedule'
    },
    {
      id: 'bot_automation_03',
      name: 'Webhook Telegram Post',
      type: 'Automation',
      status: 'Idle',
      lastRun: '2h ago',
      successRate: 95.8,
      runCount: 322,
      systemPrompt: 'You are a creative text form writer. Rephrase incoming web development triggers into engaging, structured bullet points for Telegram channel bloggers.',
      testInput: 'feat: add metrics analytics capture',
      memory: [
        { key: 'target_channel_id', value: '-1003826684282' }
      ],
      apiKey: 'sk_live_ton_df8893ab00',
      trigger: 'Webhook'
    },
    {
      id: 'bot_analyst_04',
      name: 'Crypto Arbitrage Tracker',
      type: 'Assistant',
      status: 'Error',
      lastRun: '1d ago',
      successRate: 88.2,
      runCount: 104,
      systemPrompt: 'Analyze real-time price tick spreads across DEX pools on TON. Alert trigger conditions the moment deviation threshold breaches 2.4%.',
      testInput: 'Check pools: STON.fi, DeDust',
      memory: [
        { key: 'api_endpoint', value: 'https://ton-arbitrage.live/v1' }
      ],
      apiKey: 'sk_live_ton_ccc1202888',
      trigger: 'Manual'
    }
  ]);

  // Selected Bot for Detail Slide-over
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const selectedBot = cloudBots.find(b => b.id === selectedBotId);
  const [botDetailActiveTab, setBotDetailActiveTab] = useState<'overview' | 'prompt' | 'memory' | 'logs'>('overview');

  // Toast notifications State
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'info' | 'error' }[]>([]);
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  };

  // Create Bot Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newBotName, setNewBotName] = useState('');
  const [newBotType, setNewBotType] = useState<'Support' | 'Automation' | 'QA' | 'Assistant'>('Support');
  const [newBotPrompt, setNewBotPrompt] = useState('');

  const handleCreateBot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBotName.trim()) {
      showToast('Please provide a bot name', 'error');
      return;
    }
    const created: CloudBot = {
      id: `bot_custom_${Date.now()}`,
      name: newBotName,
      type: newBotType,
      status: 'Idle',
      lastRun: 'Never',
      successRate: 100,
      runCount: 0,
      systemPrompt: newBotPrompt || 'You are a helpful AI assistant.',
      testInput: 'Hello and welcome. Give me status report.',
      memory: [],
      apiKey: `sk_live_ton_${Math.random().toString(16).substring(3, 11)}`,
      trigger: 'Manual'
    };
    setCloudBots(prev => [created, ...prev]);
    setIsCreateModalOpen(false);
    setNewBotName('');
    setNewBotPrompt('');
    showToast(`Bot "${newBotName}" successfully created in ecosystem!`, 'success');
  };

  // Run Now simulation engine
  const [runningBotId, setRunningBotId] = useState<string | null>(null);
  const [terminalFeedLogs, setTerminalFeedLogs] = useState<{ time: string; botName: string; text: string; status: 'info' | 'success' | 'error' }[]>([]);

  const runBotNow = (botId: string) => {
    if (runningBotId) return;
    const targetBot = cloudBots.find(b => b.id === botId);
    if (!targetBot) return;

    setRunningBotId(botId);
    showToast(`Deploying payload & initiating ${targetBot.name}...`, 'info');
    
    // Add logs step by step
    const timeNow = () => new Date().toLocaleTimeString();
    const mockLogs = [
      { text: `⚡ Connecting secure agent session to pipeline ID: ${botId}`, status: 'info' as const },
      { text: `🔍 Syncing local system instructions prompt: "${targetBot.systemPrompt.substring(0, 45)}..."`, status: 'info' as const },
      { text: `📥 Query input registered: "${targetBot.testInput}"`, status: 'info' as const },
      { text: `📡 Running inference engine on Llama-3-70B model...`, status: 'info' as const },
      { text: `✅ Stream finished successfully in 412ms, exit code 0`, status: 'success' as const }
    ];

    let currentLogIndex = 0;
    const logInterval = setInterval(() => {
      if (currentLogIndex < mockLogs.length) {
        setTerminalFeedLogs(prev => [
          {
            time: timeNow(),
            botName: targetBot.name,
            text: mockLogs[currentLogIndex].text,
            status: mockLogs[currentLogIndex].status
          },
          ...prev
        ]);
        currentLogIndex++;
      } else {
        clearInterval(logInterval);
        setRunningBotId(null);
        // Toggle bot status to Active if it was error/idle
        setCloudBots(prev => prev.map(b => b.id === botId ? { 
          ...b, 
          status: 'Active', 
          lastRun: 'Just now', 
          runCount: b.runCount + 1,
          successRate: Math.min(100, Number((b.successRate + 0.2).toFixed(1)))
        } : b));
        showToast(`Botly session target of ${targetBot.name} executed successfully!`, 'success');
      }
    }, 400);
  };

  // Botly System log generator background tick
  useEffect(() => {
    const names = ['SupportBot Core', 'QA Deployment Guard', 'Webhook Telegram Post'];
    const textExamples = [
      'Processed incoming query from Telegram User ID: 588219192',
      'Telemetry audit: zero credential exposure detected in repo branch vercel-nextjs-api-route/main',
      'System heartbeat check... active OK',
      'Storage synchronized flawlessly across shard clusters',
      'Instant payout address checked by Telegram account hash'
    ];

    const interval = setInterval(() => {
      const idxBot = Math.floor(Math.random() * names.length);
      const idxText = Math.floor(Math.random() * textExamples.length);
      setTerminalFeedLogs(prev => [
        {
          time: new Date().toLocaleTimeString(),
          botName: names[idxBot],
          text: textExamples[idxText],
          status: 'info'
        },
        ...prev.slice(0, 120) // Limit count to avoid CPU drag
      ]);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // UI Interactive Toggle Switches helper
  const handleToggleBot = (botId: string) => {
    setCloudBots(prev => prev.map(b => {
      if (b.id === botId) {
        const nextStatus = b.status === 'Active' ? 'Idle' : 'Active';
        showToast(`Status of ${b.name} set to ${nextStatus}`, 'info');
        return { ...b, status: nextStatus };
      }
      return b;
    }));
  };

  // Dynamic values summary computations
  const totalExecutions = cloudBots.reduce((sum, b) => sum + b.runCount, 0);
  const activeBotsCount = cloudBots.filter(b => b.status === 'Active').length;

  // -- BOTS DECENTRALIZED DIRECTORY STATE (User requirement: "Where are the bots, applications, and categories?")
  const [selectedDirectoryCategory, setSelectedDirectoryCategory] = useState<string>('all');
  const [directorySearchQuery, setDirectorySearchQuery] = useState<string>('');
  const [resolvedCategoryList, setResolvedCategoryList] = useState<any[]>([]);

  useEffect(() => {
    // Custom mapping for beautiful Turkish/English fallbacks of standard categories of TON/Telegram bots
    const formatted = categories.map(cat => {
      let labelText = cat.id.toUpperCase();
      let customDesc = 'Verified ecosystem platform services.';
      switch(cat.id) {
        case 'all': labelText = 'All Categories'; customDesc = 'Explore every listed solution'; break;
        case 'ai_services': labelText = 'AI Assistants'; customDesc = 'Intelligent conversational & automation bots'; break;
        case 'games': labelText = 'Decentralized Games'; customDesc = 'Play-to-Earn and hyper-casual TMA games'; break;
        case 'finance': labelText = 'Sass & Finance'; customDesc = 'Financial ledger sync & checkout systems'; break;
        case 'moderation': labelText = 'Group Managers / Moderation'; customDesc = 'Keep custom Telegram chats clean'; break;
        case 'utilities': labelText = 'Ecosystem Utilities'; customDesc = 'API routers and developer toolsets'; break;
        case 'crypto': labelText = 'TON & Cryptography'; customDesc = 'Wallet bots and token metrics tracking'; break;
        case 'communication': labelText = 'Engagement Tech'; customDesc = 'Mass broadcast and channel manager tools'; break;
        case 'productivity': labelText = 'SaaS Productivity'; customDesc = 'Track tasks and schedules automatically'; break;
        case 'music': labelText = 'Audio & Entertainment'; customDesc = 'Media streamers and podcast feed tools'; break;
        case 'education': labelText = 'Educational Hubs'; customDesc = 'Learn Solidity, TON developer SDKs interactive'; break;
        case 'content': labelText = 'Channel Automation'; customDesc = 'Auto blog post poster and translators'; break;
        default: break;
      }
      return {
        ...cat,
        displayName: t(cat.label) || labelText,
        displayDesc: customDesc
      };
    });
    setResolvedCategoryList(formatted);
  }, [t]);

  // Fallback to static bots database if Supabase empty
  const [directoryBots, setDirectoryBots] = useState<any[]>([
    {
      id: 'tg_01',
      name: 'Task Master BOT',
      slug: 'task-master',
      description: 'The master suite for community workflow delegation, task tracking, and automatic rewards in TON.',
      price: 15.0,
      icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      category: ['productivity', 'utilities'],
      rating: 4.8,
      bot_link: 'https://t.me/task_master_bot',
      languages: ['🇺🇸 English', '🇹🇷 Türkçe', '🇪🇸 Español'],
      subscribers: '12K active users',
      developer: 'Vercel Ecosystem Labs'
    },
    {
      id: 'tg_02',
      name: 'GameBot Arcade',
      slug: 'gamebot-pro',
      description: 'Premium mini-app game engine. Run tournament brackets directly in your Telegram groups with instant payouts.',
      price: 0.0,
      icon: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=200&auto=format&fit=crop&q=80',
      category: ['games'],
      rating: 4.9,
      bot_link: 'https://t.me/game_bot_arcade',
      languages: ['🇺🇸 English', '🇷🇺 Russian'],
      subscribers: '450K players',
      developer: 'TON Games Studio'
    },
    {
      id: 'tg_03',
      name: 'Ethers Ledger Bot',
      slug: 'ethers-ledger',
      description: 'Sync ERC20 holdings, parse price alerts, and request live gas trackers directly inside your group chat interface.',
      price: 49.0,
      icon: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=200&auto=format&fit=crop&q=80',
      category: ['crypto', 'finance'],
      rating: 4.7,
      bot_link: 'https://t.me/ethers_ledger_bot',
      languages: ['🇺🇸 English', '🇩🇪 Deutsch', '🇫🇷 Français'],
      subscribers: '8.4K channels',
      developer: 'Consensys Hub Devs'
    },
    {
      id: 'tg_04',
      name: 'AI Translator Agent',
      slug: 'ai-translator-bot',
      description: 'Auto-detect chat languages and translate individual incoming messages into over 14 languages utilizing server-side Gemini AI models.',
      price: 0.0,
      icon: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=200&auto=format&fit=crop&q=80',
      category: ['ai_services', 'communication'],
      rating: 4.9,
      bot_link: 'https://t.me/ai_translation_system',
      languages: ['🇺🇸 English', '🇹🇷 Türkçe', '🇪🇸 Español', '🇸🇦 العربية'],
      subscribers: '58K active chats',
      developer: 'Gemini Agent Lab'
    },
    {
      id: 'tg_05',
      name: 'Shield Moderator Shield',
      slug: 'shield-mod-bot',
      description: 'Robust serverless spam filter. Eradicates automated clone accounts, dangerous token links, and explicit texts in 100ms.',
      price: 8.5,
      icon: 'https://images.unsplash.com/photo-1614064642639-e3f13b69b93a?w=200&auto=format&fit=crop&q=80',
      category: ['moderation', 'security'],
      rating: 4.6,
      bot_link: 'https://t.me/shield_moderator_bot',
      languages: ['🇺🇸 English', '🇹🇷 Türkçe', '🇮🇷 Persian'],
      subscribers: '14K groups',
      developer: 'Ecosystem Security Core'
    },
    {
      id: 'tg_06',
      name: 'SoundWave Styler',
      slug: 'sound-wave-music',
      description: 'Stream royalty-free high fidelity ambient beats to standard group voice channels continuously for deep-focus coding and study rooms.',
      price: 5.0,
      icon: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80',
      category: ['music'],
      rating: 4.5,
      bot_link: 'https://t.me/soundwave_styler',
      languages: ['🇺🇸 English'],
      subscribers: '3.1K voice rooms',
      developer: 'Spotify Guild'
    }
  ]);

  // Combined Search Criteria
  const filteredDirectoryBots = directoryBots.filter(bot => {
    const categoryMatch = selectedDirectoryCategory === 'all' || bot.category.includes(selectedDirectoryCategory);
    const searchMatch = bot.name.toLowerCase().includes(directorySearchQuery.toLowerCase()) || 
                        bot.description.toLowerCase().includes(directorySearchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  // -- WORKFLOWS STATE (Interactive automation design)
  const [workflowNodes, setWorkflowNodes] = useState<WorkflowNode[]>([
    { id: 'wn_01', name: 'Github Commit Event', type: 'Trigger', subtype: 'Webhook API', status: 'idle' },
    { id: 'wn_02', name: 'Gemini Text Auditor', type: 'AI Processing', subtype: 'System Prompt Parsing', status: 'idle' },
    { id: 'wn_03', name: 'Send Telegram Notification', type: 'Action', subtype: 'Post Channel Bot', status: 'idle' }
  ]);
  const [activeWorkflowRunning, setActiveWorkflowRunning] = useState(false);

  const addWorkflowNode = (type: 'Trigger' | 'AI Processing' | 'Action') => {
    let name = '';
    let subtype = '';
    if (type === 'Trigger') {
      name = 'Incoming Webhook API';
      subtype = 'Auth token verification';
    } else if (type === 'AI Processing') {
      name = 'Gemini Summary Node';
      subtype = 'Model inference';
    } else {
      name = 'SQL Database Save';
      subtype = 'Query execution';
    }
    const newNode: WorkflowNode = {
      id: `wn_custom_${Date.now()}`,
      name,
      type,
      subtype,
      status: 'idle'
    };
    setWorkflowNodes(prev => [...prev, newNode]);
    showToast(`Added workflow "${name}" connection node!`, 'success');
  };

  const deleteWorkflowNode = (id: string) => {
    setWorkflowNodes(prev => prev.filter(n => n.id !== id));
    showToast('Node removed from connection path', 'info');
  };

  const runWorkflowSimulation = () => {
    if (activeWorkflowRunning) return;
    setActiveWorkflowRunning(true);
    showToast('Starting sequential pipeline simulation...', 'info');

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < workflowNodes.length) {
        setWorkflowNodes(prev => prev.map((node, i) => i === idx ? { ...node, status: 'running' } : node));
        setTimeout(() => {
          setWorkflowNodes(prev => prev.map((node, i) => i === idx ? { ...node, status: 'success' } : node));
          idx++;
        }, 800);
      } else {
        clearInterval(interval);
        setActiveWorkflowRunning(false);
        showToast('All system workflow nodes executed smoothly!', 'success');
      }
    }, 1100);
  };

  // -- PLAYGROUND PLAY TEMPLATE ENGINE
  const [playgroundSelectedBotId, setPlaygroundSelectedBotId] = useState<string>(cloudBots[0].id);
  const playgroundBot = cloudBots.find(b => b.id === playgroundSelectedBotId) || cloudBots[0];
  const [playgroundInstruction, setPlaygroundInstruction] = useState<string>(playgroundBot.systemPrompt);
  const [playgroundPromptInput, setPlaygroundPromptInput] = useState<string>('Verify security parameters on the cloud DB pipeline.');
  const [playgroundTemp, setPlaygroundTemp] = useState<number>(0.7);
  const [playgroundOutputText, setPlaygroundOutputText] = useState<string>('');
  const [isPlaygroundInference, setIsPlaygroundInference] = useState<boolean>(false);

  const handleRunPlayground = () => {
    if (isPlaygroundInference) return;
    setIsPlaygroundInference(true);
    setPlaygroundOutputText('');

    const sentences = [
      `[AI Engine: Model Gemini-3.5-Active initialized with instructions: "${playgroundInstruction.substring(0, 35)}..."]`,
      "Analyzing inputs and parsing registered memory states...",
      `Processing payload parameters with precision settings: temp=${playgroundTemp}`,
      "Generating response tokens stream:",
      "▶ Secure environment active check OK.",
      "▶ Detected variables are bound using server-side configurations.",
      "▶ Verdict: System is green and verified. Direct connection keys remain hidden, preventing visual leak vectors."
    ];

    let currentSent = 0;
    const interval = setInterval(() => {
      if (currentSent < sentences.length) {
        setPlaygroundOutputText(prev => prev + (prev ? '\n' : '') + sentences[currentSent]);
        currentSent++;
      } else {
        clearInterval(interval);
        setIsPlaygroundInference(false);
        showToast('Playground agent inference streaming finished', 'success');
      }
    }, 600);
  };

  // Sync instruction when bot updates in playground selector
  useEffect(() => {
    setPlaygroundInstruction(playgroundBot.systemPrompt);
  }, [playgroundSelectedBotId, cloudBots]);

  // -- ANALYTICS GRAPH GENERATOR SIMULATOR
  const analyticsStats = {
    uptime: '99.99%',
    latency: '84ms',
    databaseUsage: '2.44 GB / 10 GB',
    usageHistory: [
      { date: 'May 16', requests: 120, latency: 95 },
      { date: 'May 17', requests: 140, latency: 90 },
      { date: 'May 18', requests: 185, latency: 86 },
      { date: 'May 19', requests: 290, latency: 82 },
      { date: 'May 20', requests: 310, latency: 80 },
      { date: 'May 21', requests: 460, latency: 83 },
      { date: 'May 22', requests: 512, latency: 79 }
    ]
  };

  return (
    <div className="flex bg-[#0B0F17] text-white min-h-screen font-sans overflow-x-hidden antialiased">
      
      {/* 2-5 pixel top colored stripe like Stripe/Vercel aesthetic */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#6C5CE7] via-[#4F9CF9] to-[#2ED573] z-50 pointer-events-none" />

      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-[#0E1321] border-r border-white/[0.06] flex flex-col justify-between z-40">
        
        {/* LOGO & MENU ITEMS */}
        <div className="flex flex-col flex-1">
          
          {/* Header Branding */}
          <div className="h-16 flex items-center gap-2.5 px-6 border-b border-white/[0.04]">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6C5CE7] to-[#4F9CF9] p-[1.5px] flex items-center justify-center shadow-[0_4px_12px_rgba(108,92,231,0.25)]">
              <div className="w-full h-full rounded-[7px] bg-[#0E1321] flex items-center justify-center">
                <Cpu size={15} className="text-[#6C5CE7]" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-[15.5px] tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">BotlyHub</span>
              <span className="text-[9px] block text-[#6C5CE7] font-mono tracking-widest leading-none mt-0.5 font-bold uppercase">Console V3</span>
            </div>
          </div>

          {/* Nav Categories */}
          <nav className="p-4 space-y-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase px-3 block mb-2">Workspace Nodes</span>
            
            <button
              onClick={() => { setCurrentTab('dashboard'); setSelectedBotId(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                currentTab === 'dashboard' 
                  ? 'bg-gradient-to-r from-[#6C5CE7]/15 to-transparent border-l-2 border-[#6C5CE7] text-white font-bold' 
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <Cpu size={15} className={currentTab === 'dashboard' ? 'text-[#6C5CE7]' : 'text-slate-500'} />
              <span>Dashboard Control</span>
            </button>

            <button
              onClick={() => { setCurrentTab('directory'); setSelectedBotId(null); }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                currentTab === 'directory' 
                  ? 'bg-gradient-to-r from-[#6C5CE7]/15 to-transparent border-l-2 border-[#6C5CE7] text-white font-bold' 
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Globe size={15} className={currentTab === 'directory' ? 'text-[#6C5CE7]' : 'text-slate-500'} />
                <span>Ecosystem Directory</span>
              </div>
              <span className="text-[9.5px] bg-[#6C5CE7]/15 text-[#6C5CE7] px-1.5 py-0.5 rounded font-mono font-bold">Bots</span>
            </button>

            <button
              onClick={() => { setCurrentTab('workflows'); setSelectedBotId(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                currentTab === 'workflows' 
                  ? 'bg-gradient-to-r from-[#6C5CE7]/15 to-transparent border-l-2 border-[#6C5CE7] text-white font-bold' 
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <Workflow size={15} className={currentTab === 'workflows' ? 'text-[#6C5CE7]' : 'text-slate-500'} />
              <span>Workflow Builder</span>
            </button>

            <button
              onClick={() => { setCurrentTab('playground'); setSelectedBotId(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                currentTab === 'playground' 
                  ? 'bg-gradient-to-r from-[#6C5CE7]/15 to-transparent border-l-2 border-[#6C5CE7] text-white font-bold' 
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <Code size={15} className={currentTab === 'playground' ? 'text-[#6C5CE7]' : 'text-slate-500'} />
              <span>Prompt Playground</span>
            </button>

            <div className="pt-4 pb-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase px-3 block mb-1">Diagnostics</span>
            </div>

            <button
              onClick={() => { setCurrentTab('analytics'); setSelectedBotId(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                currentTab === 'analytics' 
                  ? 'bg-gradient-to-r from-[#6C5CE7]/15 to-transparent border-l-2 border-[#6C5CE7] text-white font-bold' 
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <BarChart size={15} className={currentTab === 'analytics' ? 'text-[#6C5CE7]' : 'text-slate-500'} />
              <span>Performance Analytics</span>
            </button>

            <button
              onClick={() => { setCurrentTab('telemetry'); setSelectedBotId(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                currentTab === 'telemetry' 
                  ? 'bg-gradient-to-r from-[#6C5CE7]/15 to-transparent border-l-2 border-[#6C5CE7] text-white font-bold' 
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <Terminal size={15} className={currentTab === 'telemetry' ? 'text-[#6C5CE7]' : 'text-slate-500'} />
              <span>System Telemetry Logs</span>
            </button>
          </nav>

        </div>

        {/* BOTTOM USER PANEL STATS */}
        <div className="p-4 border-t border-white/[0.04]">
          <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl mb-3">
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="text-[#A1A1A1] font-semibold">Active Quota Balance</span>
              <span className="text-[#2ED573] font-mono font-bold">94,220 pts</span>
            </div>
            <div className="w-full bg-white/[0.06] h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-gradient-to-r from-[#6C5CE7] to-[#4F9CF9] h-full w-[84%]" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#6C5CE7] to-[#4F9CF9] p-[1.5px] flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#0E1321] flex items-center justify-center font-bold text-xs uppercase text-white">
                KE
              </div>
            </div>
            <div>
              <p className="text-[12px] font-bold text-white leading-tight">kenan_sys_admin</p>
              <p className="text-[10px] text-slate-500 font-mono">Operator ID #4829</p>
            </div>
          </div>
        </div>

      </aside>

      {/* RENDER BODY CONTAINER */}
      <main className="pl-64 flex-1 flex flex-col min-h-screen">
        
        {/* TOP BAR BAR */}
        <header className="h-16 border-b border-white/[0.06] bg-[#0E1321]/60 backdrop-blur-md sticky top-0 px-8 flex items-center justify-between z-30">
          
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-xs font-semibold uppercase font-mono">Route</span>
            <ChevronRight size={12} className="text-slate-600" />
            <h1 className="text-sm font-extrabold capitalize text-white flex items-center gap-2">
              <span>{currentTab === 'directory' ? 'Telegram Ecosystem Directory' : currentTab}</span>
              <span className="w-2 h-2 rounded-full bg-[#2ED573] animate-pulse" />
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Status Indicator */}
            <div className="hidden md:flex items-center gap-2 bg-white/[0.02] border border-white/[0.05] px-3 py-1.5 rounded-lg text-[11px] font-mono text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2ED573]" />
              <span>TON Core: Connected</span>
            </div>

            {/* Main Action CTAs */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-[#6C5CE7] text-white rounded-lg text-xs font-bold hover:bg-[#5b4ed4] active:scale-95 transition-all shadow-md"
            >
              <Plus size={14} />
              <span>Create New Bot</span>
            </button>

            {/* Back to MiniApp link */}
            <button 
              onClick={() => navigate('/search')}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors bg-white/[0.03] border border-white/[0.06] px-3 py-1.5 rounded-lg"
            >
              <ExternalLink size={12} />
              <span>App Market</span>
            </button>
          </div>

        </header>

        {/* WORKSPACE VIEW CONTROLLERS */}
        <div className="flex-1 p-8">
          
          <AnimatePresence mode="wait">
            
            {/* 1. DASHBOARD VIEW STATE */}
            {currentTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {/* METRICS ROW */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  
                  <div className="bg-[#0E1321] border border-white/[0.06] p-5 rounded-2xl flex items-center justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#6C5CE7]/5 rounded-full blur-xl group-hover:bg-[#6C5CE7]/10 transition-colors pointer-events-none" />
                    <div>
                      <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider block">Total Cloud Bots</span>
                      <span className="text-3xl font-extrabold text-white mt-1 block tracking-tight">{cloudBots.length}</span>
                      <span className="text-[10px] text-[#2ED573] font-semibold mt-1 inline-flex items-center gap-1">
                        <span>● Global state stable</span>
                      </span>
                    </div>
                    <div className="w-11 h-11 rounded-lg bg-[#6C5CE7]/15 border border-[#6C5CE7]/20 flex items-center justify-center text-[#6C5CE7]">
                      <Bot size={20} />
                    </div>
                  </div>

                  <div className="bg-[#0E1321] border border-white/[0.06] p-5 rounded-2xl flex items-center justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#2ED573]/5 rounded-full blur-xl group-hover:bg-[#2ED573]/10 transition-colors pointer-events-none" />
                    <div>
                      <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider block">Active Runtime</span>
                      <span className="text-3xl font-extrabold text-white mt-1 block tracking-tight">{activeBotsCount}</span>
                      <span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block">
                        {cloudBots.length - activeBotsCount} in hibernation
                      </span>
                    </div>
                    <div className="w-11 h-11 rounded-lg bg-[#2ED573]/15 border border-[#2ED573]/20 flex items-center justify-center text-[#2ED573]">
                      <Activity size={20} />
                    </div>
                  </div>

                  <div className="bg-[#0E1321] border border-white/[0.06] p-5 rounded-2xl flex items-center justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#4F9CF9]/5 rounded-full blur-xl group-hover:bg-[#4F9CF9]/10 transition-colors pointer-events-none" />
                    <div>
                      <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider block">Total Executions</span>
                      <span className="text-3xl font-extrabold text-white mt-1 block tracking-tight font-mono">{totalExecutions}</span>
                      <span className="text-[10px] text-[#4F9CF9] font-mono font-semibold mt-1 inline-block">
                        +22 within past hour
                      </span>
                    </div>
                    <div className="w-11 h-11 rounded-lg bg-[#4F9CF9]/15 border border-[#4F9CF9]/20 flex items-center justify-center text-[#4F9CF9]">
                      <Sliders size={20} />
                    </div>
                  </div>

                  <div className="bg-[#0E1321] border border-white/[0.06] p-5 rounded-2xl flex items-center justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#2ED573]/5 rounded-full blur-xl group-hover:bg-[#2ED573]/10 transition-colors pointer-events-none" />
                    <div>
                      <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider block">AI Inference Success</span>
                      <span className="text-3xl font-extrabold text-white mt-1 block tracking-tight font-mono">98.1%</span>
                      <span className="text-[10px] text-[#2ED573] font-semibold mt-1 inline-block">
                        Avg latency <span className="font-mono">84ms</span>
                      </span>
                    </div>
                    <div className="w-11 h-11 rounded-lg bg-[#2ED573]/15 border border-[#2ED573]/20 flex items-center justify-center text-[#2ED573]">
                      <CheckCircle2 size={20} />
                    </div>
                  </div>

                </div>

                {/* BOT GRID CONTAINER */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-white tracking-tight">Ecosystem AI Core Bots</h3>
                      <p className="text-xs text-slate-400 mt-1">Primary active automated logic controllers on BotlyHub SaaS pipeline</p>
                    </div>
                    <span className="text-[10.5px] font-mono font-bold text-[#6C5CE7] bg-[#6C5CE7]/10 border border-[#6C5CE7]/20 px-3 py-1 rounded-full uppercase">
                      Select Bot Card To Edit Instructions
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    {cloudBots.map((b) => (
                      <div
                        key={b.id}
                        className={`bg-[#0E1321] border ${
                          selectedBotId === b.id ? 'border-[#6C5CE7] ring-1 ring-[#6C5CE7]' : 'border-white/[0.06]'
                        } cursor-pointer p-5 rounded-2xl relative flex flex-col justify-between group hover:bg-[#12192c] transition-all`}
                        onClick={() => setSelectedBotId(b.id)}
                      >
                        <div>
                          {/* Banner Top elements */}
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] bg-white/[0.03] border border-white/[0.08] px-2.5 py-1 rounded-full uppercase tracking-wider font-mono text-slate-400 font-bold">
                              {b.type}
                            </span>
                            
                            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                b.status === 'Active' ? 'bg-[#2ED573]' : b.status === 'Idle' ? 'bg-[#F59E0B]' : 'bg-[#FF4757]'
                              }`} />
                              <span className="text-[10px] text-slate-400 font-bold font-mono">{b.status}</span>
                            </div>
                          </div>

                          <h4 className="font-extrabold text-[14.5px] text-white tracking-tight leading-tight group-hover:text-[#6C5CE7] transition-colors">
                            {b.name}
                          </h4>
                          <p className="text-[11.5px] text-slate-400 mt-2 line-clamp-2 h-8 min-h-[32px] leading-relaxed">
                            {b.systemPrompt}
                          </p>

                          {/* Trigger tags */}
                          <div className="flex items-center gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                            <span className="text-[9.5px] font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                              Trigger: {b.trigger}
                            </span>
                          </div>

                          {/* Sparkline analytics summaries */}
                          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/[0.04] text-[10.5px]">
                            <div>
                              <span className="text-slate-500 block">Total Runs</span>
                              <span className="font-extrabold text-white font-mono mt-0.5 block">{b.runCount}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Success Rate</span>
                              <span className="font-extrabold text-[#2ED573] font-mono mt-0.5 block">{b.successRate}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Control buttons footer */}
                        <div className="grid grid-cols-2 gap-2 mt-5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => runBotNow(b.id)}
                            disabled={runningBotId !== null}
                            className="bg-[#6C5CE7]/10 hover:bg-[#6C5CE7]/25 text-[#6C5CE7] border border-[#6C5CE7]/35 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
                          >
                            {runningBotId === b.id ? (
                              <RefreshCw size={11} className="animate-spin" />
                            ) : (
                              <Play size={11} fill="currentColor" />
                            )}
                            <span>Run now</span>
                          </button>

                          <button
                            onClick={() => handleToggleBot(b.id)}
                            className="bg-white/[0.02] hover:bg-white/[0.05] text-slate-200 border border-white/[0.06] py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Sliders size={11} />
                            <span>{b.status === 'Active' ? 'Disable' : 'Enable'}</span>
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>

                {/* BOTTOM HALF: ACTION AND FEED PANEL GRID */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
                  
                  {/* LIVE TELEMETRY LOGS ROW (8 Columns) */}
                  <div className="md:col-span-8 bg-[#0E1321] border border-white/[0.06] p-6 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4 border-b border-white/[0.04] pb-3">
                      <div className="flex items-center gap-2.5">
                        <Terminal size={16} className="text-[#6C5CE7]" />
                        <span className="font-extrabold text-sm text-white tracking-tight">Active Core Telemetry Logs Stream</span>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#2ED573] animate-ping" />
                    </div>

                    <div className="bg-[#08080A] rounded-xl p-4 font-mono text-[11.5px] leading-relaxed overflow-y-auto h-64 border border-white/[0.04]">
                      {terminalFeedLogs.length === 0 ? (
                        <div className="text-slate-500 italic h-full flex items-center justify-center">
                          Waiting for bot execution trigger outputs...
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {terminalFeedLogs.map((log, idx) => (
                            <div key={idx} className="flex flex-col md:flex-row md:items-start gap-1 md:gap-3 text-slate-300">
                              <span className="text-slate-500 shrink-0 font-medium">[{log.time}]</span>
                              <span className="text-[#6C5CE7] font-bold shrink-0">{log.botName}:</span>
                              <span className={log.status === 'success' ? 'text-[#2ED573]' : log.status === 'error' ? 'text-[#FF4757]' : 'text-slate-200'}>
                                {log.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 text-[10.5px] text-slate-400">
                      <span>Telemetry sampling rate: realtime (5-second intervals via state)</span>
                      <button 
                        onClick={() => setTerminalFeedLogs([])}
                        className="text-[#6C5CE7] cursor-pointer hover:underline font-bold"
                      >
                        Clear console buffer
                      </button>
                    </div>
                  </div>

                  {/* QUICK ACTION CONTROLLERS (4 Columns) */}
                  <div className="md:col-span-4 bg-[#0E1321] border border-white/[0.06] p-6 rounded-2xl flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-200 tracking-tight">Ecosystem Quick Controls</h3>
                      <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">Fast pipeline orchestration procedures with unified TON authorization</p>
                      
                      <div className="space-y-3">
                        <button
                          onClick={() => setIsCreateModalOpen(true)}
                          className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] transition-all text-left"
                        >
                          <div>
                            <span className="text-slate-200 font-bold text-xs block">Spin Up New Bot Agent</span>
                            <span className="text-[10px] text-slate-500">Custom System execution bounds</span>
                          </div>
                          <Plus size={16} className="text-slate-400" />
                        </button>

                        <button
                          onClick={() => {
                            const template: CloudBot = {
                              id: `template_${Date.now()}`,
                              name: 'Anti-Spam Shield Proxy',
                              type: 'QA',
                              status: 'Active',
                              lastRun: 'Never',
                              successRate: 100,
                              runCount: 0,
                              systemPrompt: 'Autonomous parser to analyze textual chat chains in Telegram spaces and exclude dangerous token web links instantly.',
                              testInput: 'Deploy Anti-Spam shield templates',
                              memory: [],
                              apiKey: 'sk_live_ton_template',
                              trigger: 'Webhook'
                            };
                            setCloudBots(prev => [template, ...prev]);
                            showToast('Successfully imported preset: "Anti-Spam Shield Proxy"!', 'success');
                          }}
                          className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] transition-all text-left"
                        >
                          <div>
                            <span className="text-slate-200 font-bold text-xs block">Import Presets</span>
                            <span className="text-[10px] text-slate-500">Load system templates</span>
                          </div>
                          <Layers size={16} className="text-slate-400" />
                        </button>

                        <button
                          onClick={() => showToast('Refreshed TON Wallet endpoint configurations.', 'info')}
                          className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] transition-all text-left"
                        >
                          <div>
                            <span className="text-slate-200 font-bold text-xs block">Connect Webhook Router</span>
                            <span className="text-[10px] text-slate-500">Fast external API sync channels</span>
                          </div>
                          <Zap size={15} className="text-slate-400" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Server status: HEALTHY</span>
                      <span className="text-[#2ED573]">API v3.4</span>
                    </div>
                  </div>

                </div>

                {/* BOT DETAIL SLIDE-OVER CONTROL PANEL */}
                <AnimatePresence>
                  {selectedBotId && selectedBot && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-[#070708]/80 backdrop-blur-sm z-50 flex justify-end"
                      onClick={() => setSelectedBotId(null)}
                    >
                      <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                        className="w-full max-w-xl bg-[#0E1321] border-l border-white/[0.1] h-full shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-y-auto flex flex-col justify-between"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* HEADER PART */}
                        <div>
                          <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Bot size={22} className="text-[#6C5CE7]" />
                              <div>
                                <h3 className="text-base font-extrabold tracking-tight text-white mb-0.5">{selectedBot.name}</h3>
                                <span className="text-[10.5px] font-mono text-slate-500 block uppercase font-bold">{selectedBot.id}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedBotId(null)}
                              className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition-all hover:bg-white/[0.06]"
                            >
                              X
                            </button>
                          </div>

                          {/* DETAILS INTERIOR TABS CONTROLLER */}
                          <div className="flex border-b border-white/[0.04] px-4">
                            {['overview', 'prompt', 'memory', 'logs'].map((t) => (
                              <button
                                key={t}
                                onClick={() => setBotDetailActiveTab(t as any)}
                                className={`px-4 py-3 text-xs capitalize font-bold transition-all border-b-2 ${
                                  botDetailActiveTab === t 
                                    ? 'border-[#6C5CE7] text-white' 
                                    : 'border-transparent text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>

                          {/* BODY TABS DETECTOR */}
                          <div className="p-6 space-y-6">
                            
                            {/* OVERVIEW DATA PANEL */}
                            {botDetailActiveTab === 'overview' && (
                              <div className="space-y-4">
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl font-mono text-xs">
                                    <span className="text-slate-500 block text-[10px]">API Key Endpoint Auth</span>
                                    <span className="text-slate-300 font-bold block mt-1 truncate">{selectedBot.apiKey}</span>
                                  </div>
                                  <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl">
                                    <span className="text-slate-500 block text-[10px]">Trigger Key Method</span>
                                    <select
                                      value={selectedBot.trigger}
                                      onChange={(e) => {
                                        const val = e.target.value as any;
                                        setCloudBots(prev => prev.map(b => b.id === selectedBot.id ? { ...b, trigger: val } : b));
                                        showToast('Pipeline trigger updated', 'success');
                                      }}
                                      className="bg-transparent text-white font-semibold text-xs mt-1 w-full border-0 focus:outline-none focus:ring-0 cursor-pointer p-0"
                                    >
                                      {['Manual', 'Webhook', 'Schedule'].map((tr) => (
                                        <option key={tr} value={tr} className="bg-[#0E1321] text-white">{tr}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl space-y-3">
                                  <h4 className="text-xs font-bold text-slate-300">Agent Performance Stats</h4>
                                  <div className="grid grid-cols-3 gap-3 font-mono text-xs text-center">
                                    <div className="p-2 border border-white/[0.04] rounded-lg">
                                      <span className="text-slate-500 block text-[9.5px]">Runs Count</span>
                                      <span className="text-white font-extrabold mt-1 block">{selectedBot.runCount}</span>
                                    </div>
                                    <div className="p-2 border border-white/[0.04] rounded-lg">
                                      <span className="text-slate-500 block text-[9.5px]">Success Rate</span>
                                      <span className="text-[#2ED573] font-extrabold mt-1 block">{selectedBot.successRate}%</span>
                                    </div>
                                    <div className="p-2 border border-white/[0.04] rounded-lg">
                                      <span className="text-slate-500 block text-[9.5px]">Type Category</span>
                                      <span className="text-blue-400 font-extrabold mt-1 block">{selectedBot.type}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <label className="text-[11.5px] font-bold text-slate-400">Integration system Instructions Description</label>
                                  <p className="text-xs bg-[#08080A] p-3 rounded-xl border border-white/[0.04] leading-relaxed text-slate-300">
                                    {selectedBot.systemPrompt}
                                  </p>
                                </div>

                              </div>
                            )}

                            {/* PROMPT EDITOR PANEL */}
                            {botDetailActiveTab === 'prompt' && (
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="text-[11.5px] font-bold text-slate-400 flex items-center justify-between">
                                    <span>System Prompt (Instructions)</span>
                                    <span className="text-[10px] text-slate-500 font-mono">Changes apply to next API run</span>
                                  </label>
                                  <textarea
                                    value={selectedBot.systemPrompt}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setCloudBots(prev => prev.map(b => b.id === selectedBot.id ? { ...b, systemPrompt: val } : b));
                                    }}
                                    className="w-full bg-[#08080A] rounded-xl border border-white/[0.06] text-slate-200 text-xs p-4 focus:outline-none focus:border-[#6C5CE7] transition-all min-h-[140px] leading-relaxed"
                                    placeholder="Enter system prompt for AI instructions..."
                                    rows={5}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <label className="text-[11.5px] font-bold text-slate-400">Test Mock Input Data</label>
                                  <input
                                    type="text"
                                    value={selectedBot.testInput}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setCloudBots(prev => prev.map(b => b.id === selectedBot.id ? { ...b, testInput: val } : b));
                                    }}
                                    className="w-full bg-[#08080A] rounded-xl border border-white/[0.06] text-slate-200 text-xs px-4 py-3 focus:outline-none focus:border-[#6C5CE7] transition-all"
                                  />
                                </div>

                                <button
                                  onClick={() => runBotNow(selectedBot.id)}
                                  disabled={runningBotId !== null}
                                  className="w-full py-3 rounded-xl bg-[#6C5CE7] text-white text-xs font-bold hover:bg-[#5b4ed4] transition-all flex items-center justify-center gap-2"
                                >
                                  {runningBotId === selectedBot.id ? (
                                    <RefreshCw size={13} className="animate-spin" />
                                  ) : (
                                    <Play size={13} fill="currentColor" />
                                  )}
                                  <span>Save instruction & Run bot inference</span>
                                </button>
                              </div>
                            )}

                            {/* MEMORY DATABASE PANEL */}
                            {botDetailActiveTab === 'memory' && (
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-300">Knowledge Base Memory Vectors</span>
                                  <button
                                    onClick={() => {
                                      const updatedMemory = [...selectedBot.memory, { key: 'added_resource_key', value: 'New database URL vector value limit' }];
                                      setCloudBots(prev => prev.map(b => b.id === selectedBot.id ? { ...b, memory: updatedMemory } : b));
                                      showToast('Memory key added', 'success');
                                    }}
                                    className="text-[10.5px] font-bold text-[#6C5CE7] hover:underline"
                                  >
                                    + Add New Key
                                  </button>
                                </div>

                                {selectedBot.memory.length === 0 ? (
                                  <p className="text-xs text-slate-500 italic py-4 text-center border border-dashed border-white/[0.05] rounded-xl">
                                    No custom memory keys loaded in system database.
                                  </p>
                                ) : (
                                  <div className="space-y-2.5">
                                    {selectedBot.memory.map((mem, idx) => (
                                      <div key={idx} className="flex items-center justify-between gap-3 bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl text-xs">
                                        <div className="flex flex-col min-w-0 flex-1">
                                          <input
                                            type="text"
                                            value={mem.key}
                                            onChange={(e) => {
                                              const newKey = e.target.value;
                                              const copy = [...selectedBot.memory];
                                              copy[idx].key = newKey;
                                              setCloudBots(prev => prev.map(b => b.id === selectedBot.id ? { ...b, memory: copy } : b));
                                            }}
                                            className="bg-transparent text-[#6C5CE7] font-bold border-0 p-0 focus:outline-none focus:ring-0 text-xs"
                                          />
                                          <input
                                            type="text"
                                            value={mem.value}
                                            onChange={(e) => {
                                              const newVal = e.target.value;
                                              const copy = [...selectedBot.memory];
                                              copy[idx].value = newVal;
                                              setCloudBots(prev => prev.map(b => b.id === selectedBot.id ? { ...b, memory: copy } : b));
                                            }}
                                            className="bg-transparent text-slate-300 border-0 p-0 focus:outline-none focus:ring-0 text-xs mt-1"
                                          />
                                        </div>
                                        <button
                                          onClick={() => {
                                            const copy = selectedBot.memory.filter((_, i) => i !== idx);
                                            setCloudBots(prev => prev.map(b => b.id === selectedBot.id ? { ...b, memory: copy } : b));
                                            showToast('Memory key purged', 'info');
                                          }}
                                          className="text-slate-500 hover:text-[#FF4757] transition-all p-1"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* EXECUTIONS TRACE LOGGER */}
                            {botDetailActiveTab === 'logs' && (
                              <div className="space-y-3">
                                <span className="text-xs font-bold text-slate-300 block">Console output limits (terminal mode)</span>
                                <div className="bg-[#08080A] rounded-xl p-4 font-mono text-[10.5px] border border-white/[0.04] h-[280px] overflow-y-auto space-y-2">
                                  <p className="text-slate-500">[2026-05-22 22:18:45 UTC] Initiating background telemetry agent monitor...</p>
                                  <p className="text-[#2ED573]">[2026-05-22 22:18:46 UTC] Successfully synced prompt instructions to cloud database.</p>
                                  <p className="text-slate-300">[2026-05-22 22:18:47 UTC] Model inference token stream loaded, returned 125 generated parameters.</p>
                                  <p className="text-[#F59E0B]">[2026-05-22 22:18:48 UTC] SSL Session keep-alive check... active OK</p>
                                  <p className="text-slate-500">[2026-05-22 22:18:49 UTC] Diagnostic trace finished successfully with zero leaks detected.</p>
                                </div>
                              </div>
                            )}

                          </div>
                        </div>

                        {/* SLIDE FOOTER OPTIONS */}
                        <div className="p-6 border-t border-white/[0.06] bg-[#0A0E18] flex items-center justify-between text-xs text-slate-500 font-mono">
                          <span>Developer node sandbox</span>
                          <span className="text-[#2ED573]">API Online</span>
                        </div>

                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            )}

            {/* 2. BOTS & APPLICATIONS DECENTRALIZED DIRECTORY STATE */}
            {currentTab === 'directory' && (
              <motion.div
                key="directory"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* DIRECTORY BRIEF INTRO */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.05] pb-5">
                  <div>
                    <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                      <Globe className="text-[#6C5CE7]" size={20} />
                      <span>Telegram Mini-Apps & Bot Ecosystem Directory</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Browse verified Telegram automation systems, utility toolsets, decentralized finance gateways, and AI agents
                    </p>
                  </div>

                  {/* SEARCH DECK BAR */}
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input
                      type="text"
                      value={directorySearchQuery}
                      onChange={(e) => setDirectorySearchQuery(e.target.value)}
                      placeholder="Search general directory bots..."
                      className="w-full bg-[#0E1321] border border-white/[0.07] rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#6C5CE7]"
                    />
                    {directorySearchQuery && (
                      <button 
                        onClick={() => setDirectorySearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                        X
                      </button>
                    )}
                  </div>
                </div>

                {/* CATEGORIES GRID ROWS BUTTONS */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase px-1">Filter Directory by ecosystem category</span>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
                    {resolvedCategoryList.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedDirectoryCategory(cat.id)}
                        className={`p-3.5 rounded-xl text-left border text-xs transition-all flex flex-col justify-between select-none ${
                          selectedDirectoryCategory === cat.id
                            ? 'bg-gradient-to-br from-[#6C5CE7]/15 to-transparent border-[#6C5CE7] text-white shadow-md' 
                            : 'bg-[#0E1321] border-white/[0.05] hover:border-white/[0.12] text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-extrabold text-[12.5px] truncate max-w-[120px]">{cat.displayName}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${selectedDirectoryCategory === cat.id ? 'bg-[#6C5CE7]' : 'bg-transparent'}`} />
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1.5 line-clamp-1">{cat.displayDesc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* RESULTS OUTPUT CONTAINER COLUMNGRID */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      Query matches: {filteredDirectoryBots.length} active bot applications found
                    </span>
                    <button
                      onClick={() => navigate('/search')}
                      className="text-xs text-[#6C5CE7] hover:underline flex items-center gap-1.5 font-bold"
                    >
                      <span>Interactive Advanced Search Panel</span>
                      <ArrowRight size={11} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {filteredDirectoryBots.map((bot) => (
                      <div 
                        key={bot.id}
                        className="bg-[#0E1321]/80 border border-white/[0.06] rounded-2xl p-5 hover:bg-[#12192c] transition-all flex flex-col justify-between group"
                      >
                        <div>
                          {/* Banner top details logo and price */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={bot.icon}
                                alt={bot.name}
                                className="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-white/[0.04]"
                                onError={(e) => {
                                  (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=334155&color=fff&bold=true`;
                                }}
                              />
                              <div>
                                <h4 className="font-extrabold text-sm text-white group-hover:text-[#6C5CE7] transition-all truncate max-w-[160px]">
                                  {bot.name}
                                </h4>
                                <span className="text-[10px] text-slate-500 font-mono">Dev: {bot.developer}</span>
                              </div>
                            </div>

                            {/* PRICE TAG IN TON SCALE */}
                            <div className="text-right">
                              {bot.price > 0 ? (
                                <div className="flex items-center gap-1.5 bg-[#6C5CE7]/15 border border-[#6C5CE7]/25 px-2.5 py-1 rounded-full text-[#6C5CE7] font-bold text-[10px] font-mono">
                                  <Coins size={11} />
                                  <span>{bot.price} TON</span>
                                </div>
                              ) : (
                                <span className="text-[9.5px] font-mono font-bold bg-[#2ED573]/10 text-[#2ED573] border border-[#2ED573]/20 px-2 py-0.5 rounded uppercase">
                                  Free Use
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Description text */}
                          <p className="text-xs text-slate-400 leading-relaxed min-h-[50px] line-clamp-3 mb-4">
                            {bot.description}
                          </p>

                          {/* Languages row */}
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {bot.languages.map((l: string, i: number) => (
                              <span key={i} className="text-[9px] bg-white/[0.03] text-slate-400 px-2 py-0.5 rounded font-mono">
                                {l}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Card bottom CTA launching anchors */}
                        <div className="flex items-center justify-between pt-4 border-t border-white/[0.04] mt-4 text-[11px]">
                          <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded text-yellow-500 font-bold">
                            <Star size={11} className="fill-yellow-500 text-yellow-500" />
                            <span>{bot.rating}</span>
                          </div>
                          
                          <a
                            href={bot.bot_link}
                            target="_blank"
                            referrerPolicy="no-referrer"
                            className="bg-white text-black px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-zinc-200 active:scale-95 transition-all flex items-center gap-1.5"
                          >
                            <span>Open Telegram</span>
                            <ExternalLink size={10} />
                          </a>
                        </div>

                      </div>
                    ))}
                  </div>

                  {filteredDirectoryBots.length === 0 && (
                    <div className="text-center py-12 border border-dashed border-white/[0.05] rounded-2xl">
                      <Bot size={35} className="text-slate-600 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-300">No directory matching found</p>
                      <p className="text-xs text-slate-500 mt-1">Adjust search parameters or select a clean primary category</p>
                      <button
                        onClick={() => { setSelectedDirectoryCategory('all'); setDirectorySearchQuery(''); }}
                        className="bg-[#6C5CE7]/15 text-[#6C5CE7] hover:bg-[#6C5CE7]/25 px-4 py-1.5 rounded-lg text-xs font-medium mt-4"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  )}

                </div>
              </motion.div>
            )}

            {/* 3. WORKFLOW BUILDER PAGE */}
            {currentTab === 'workflows' && (
              <motion.div
                key="workflows"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.05] pb-5">
                  <div>
                    <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                      <Workflow className="text-[#6C5CE7]" size={20} />
                      <span>Visual Automation Automation Pipeline Nodes</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Configure structured action nodes, data webhooks, and AI agent processing pipelines sequentially.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={runWorkflowSimulation}
                      disabled={activeWorkflowRunning}
                      className="px-4 py-2 rounded-xl bg-[#2ED573] text-[#0B0F17] hover:bg-[#26b15e] transition-all font-bold text-xs flex items-center gap-2 disabled:opacity-40"
                    >
                      <Play size={13} fill="currentColor" />
                      <span>Execute Sequencer Pipeline</span>
                    </button>
                  </div>
                </div>

                {/* GRAPH NODES INTERACTION ENVIRONMENT */}
                <div className="bg-[#08080A] rounded-2xl border border-white/[0.06] p-8 min-h-[400px] relative flex flex-col md:flex-row items-center justify-center gap-8 overflow-hidden">
                  
                  {/* Decorative mesh vector background elements */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6C5CE7]/3 rounded-full blur-[120px] pointer-events-none" />

                  {workflowNodes.map((node, index) => (
                    <React.Fragment key={node.id}>
                      
                      {/* CONNECTING VECTOR VECTOR DRAWING LINES */}
                      {index > 0 && (
                        <div className="hidden md:flex items-center justify-center shrink-0">
                          <div className={`h-0.5 w-12 border-t-2 border-dashed ${
                            activeWorkflowRunning ? 'border-[#2ED573]' : 'border-white/[0.08]'
                          } relative`}>
                            <ChevronRight size={14} className={`absolute -right-2 top-1/2 -translate-y-1/2 ${
                              activeWorkflowRunning ? 'text-[#2ED573] animate-pulse' : 'text-slate-600'
                            }`} />
                          </div>
                        </div>
                      )}

                      {/* WORK FLOW NODE CARD */}
                      <div className="w-64 bg-[#0E1321] border border-white/[0.07] rounded-2xl p-5 relative group hover:border-[#6C5CE7] transition-all shadow-xl">
                        
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded font-black uppercase text-xs ${
                            node.status === 'running' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' :
                            node.status === 'success' ? 'bg-[#2ED573]/10 text-[#2ED573]' :
                            'bg-white/[0.04] text-slate-400'
                          }`}>
                            {node.type}
                          </span>

                          <button
                            onClick={() => deleteWorkflowNode(node.id)}
                            className="p-1 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-[#FF4757] transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <h4 className="font-extrabold text-white text-xs tracking-tight">{node.name}</h4>
                        <span className="text-[10px] font-mono text-slate-500 block mt-1">{node.subtype}</span>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.04] text-[10px]">
                          <span className="text-slate-500 font-mono">Index Node #{index + 1}</span>
                          <span className={`flex items-center gap-1 ${
                            node.status === 'success' ? 'text-[#2ED573]' :
                            node.status === 'running' ? 'text-[#F59E0B]' :
                            'text-slate-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              node.status === 'success' ? 'bg-[#2ED573]' :
                              node.status === 'running' ? 'bg-[#F59E0B] animate-ping' :
                              'bg-slate-700'
                            }`} />
                            <span className="capitalize">{node.status}</span>
                          </span>
                        </div>

                      </div>

                    </React.Fragment>
                  ))}

                  {/* EMPTY PLACEHOLDER STYLING CONSOLE */}
                  {workflowNodes.length === 0 && (
                    <div className="text-center py-8">
                      <Workflow size={40} className="text-slate-700 mx-auto mb-4" />
                      <p className="text-sm font-bold text-slate-400">Your visual workflow pipeline is empty</p>
                      <p className="text-xs text-slate-500 mt-1">Add Trigger and Action nodes above to define automate chains</p>
                    </div>
                  )}

                </div>

                {/* BOTTOM CHASSIS TO RECONSTRUCT NODES */}
                <div className="bg-[#0E1321] border border-white/[0.06] p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="space-y-0.5 max-w-xl text-left">
                    <h4 className="font-bold text-slate-200 text-xs">Dynamic Node Constructor Builder</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Inject procedural processing blocks directly into your active runtime pipeline graph. Connect webhooks to Gemini APIs instantly.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => addWorkflowNode('Trigger')}
                      className="px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-semibold text-white hover:bg-white/[0.06] flex items-center gap-1.5"
                    >
                      <Plus size={14} className="text-[#6C5CE7]" />
                      <span>+ Add Webhook Trigger</span>
                    </button>
                    <button
                      onClick={() => addWorkflowNode('AI Processing')}
                      className="px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-semibold text-white hover:bg-white/[0.06] flex items-center gap-1.5"
                    >
                      <Plus size={14} className="text-[#6C5CE7]" />
                      <span>+ Add AI Processor</span>
                    </button>
                    <button
                      onClick={() => addWorkflowNode('Action')}
                      className="px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-semibold text-white hover:bg-white/[0.06] flex items-center gap-1.5"
                    >
                      <Plus size={14} className="text-[#6C5CE7]" />
                      <span>+ Add Action Node</span>
                    </button>
                  </div>
                </div>

              </motion.div>
            )}

            {/* 4. PROMPT PLAYGROUND VIEW STATE */}
            {currentTab === 'playground' && (
              <motion.div
                key="playground"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6"
              >
                
                {/* SETTINGS PANEL (4 columns) */}
                <div className="md:col-span-4 bg-[#0E1321] border border-white/[0.06] p-6 rounded-2xl space-y-6">
                  <div>
                    <h2 className="text-sm font-extrabold text-white tracking-tight">Agent Selection Config</h2>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Adjust inference keys and constraints to audit model outcomes</p>
                  </div>

                  <div className="space-y-4 text-left">
                    <div className="space-y-2">
                      <label className="text-[11.5px] font-bold text-slate-400">Select Sandbox Target Bot</label>
                      <select
                        value={playgroundSelectedBotId}
                        onChange={(e) => setPlaygroundSelectedBotId(e.target.value)}
                        className="w-full bg-[#08080A] rounded-xl border border-white/[0.06] p-3 text-xs text-slate-200 focus:outline-none focus:border-[#6C5CE7]"
                      >
                        {cloudBots.map((b) => (
                          <option key={b.id} value={b.id}>{b.name} ({b.type})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px]">
                        <label className="font-bold text-slate-400">Creativity Temperature</label>
                        <span className="text-[#6C5CE7] font-mono font-bold">{playgroundTemp}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1.2"
                        step="0.1"
                        value={playgroundTemp}
                        onChange={(e) => setPlaygroundTemp(parseFloat(e.target.value))}
                        className="w-full accent-[#6C5CE7] h-1.5 bg-white/[0.06] rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl font-mono text-[10px] text-slate-500 space-y-1">
                      <span className="text-[#6C5CE7] font-bold block">Inference Parameters:</span>
                      <div>Model: Llama3-70B-Chat</div>
                      <div>Timeout Limit: 12000ms</div>
                      <div>System API: Active</div>
                    </div>
                  </div>
                </div>

                {/* PLAYGROUND EDITOR MAIN FIELD (8 columns) */}
                <div className="md:col-span-8 bg-[#0E1321] border border-white/[0.06] p-6 rounded-2xl flex flex-col justify-between space-y-4">
                  
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
                      <div className="flex items-center gap-2">
                        <Code className="text-[#6C5CE7]" size={16} />
                        <span className="font-extrabold text-[#EDEDED] text-sm tracking-tight">Editable System Instructions</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#2ED573] bg-[#2ED573]/10 px-2 py-0.5 rounded font-bold uppercase">OpenAI Playground Style</span>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2 text-left animate-fadeIn">
                        <textarea
                          value={playgroundInstruction}
                          onChange={(e) => setPlaygroundInstruction(e.target.value)}
                          className="w-full bg-[#08080A] rounded-xl border border-white/[0.06] text-slate-300 font-mono text-xs p-4 focus:outline-none focus:border-[#6C5CE7] leading-relaxed min-h-[140px]"
                          placeholder="Your system instructions define the voice and behavior of the agent..."
                        />
                      </div>

                      <div className="space-y-2 text-left">
                        <label className="text-[11.5px] font-bold text-slate-400">Simulated User Input Prompt</label>
                        <input
                          type="text"
                          value={playgroundPromptInput}
                          onChange={(e) => setPlaygroundPromptInput(e.target.value)}
                          className="w-full bg-[#08080A] rounded-xl border border-white/[0.06] text-slate-200 text-xs px-4 py-3 focus:outline-none focus:border-[#6C5CE7]"
                          placeholder="Type input questions to test model reactions..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* STREAM OUTPUT OUTPUT TERMINAL */}
                  <div className="bg-[#08080A] rounded-xl border border-white/[0.04] p-4 font-mono text-xs leading-relaxed min-h-[140px]">
                    <span className="text-slate-500 block mb-2 border-b border-white/[0.03] pb-1 font-bold">// Model stream telemetry outputs:</span>
                    {playgroundOutputText ? (
                      <pre className="text-slate-200 whitespace-pre-wrap font-sans text-xs">{playgroundOutputText}</pre>
                    ) : (
                      <span className="text-slate-600 italic">No output. Press "Submit Pipeline query" below to simulate stream tokens.</span>
                    )}
                  </div>

                  <button
                    onClick={handleRunPlayground}
                    disabled={isPlaygroundInference}
                    className="w-full bg-[#6C5CE7] hover:bg-[#5b4ed4] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                  >
                    {isPlaygroundInference ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Sparkles size={14} fill="currentColor" />
                    )}
                    <span>Submit Playground Query & Trace Outputs</span>
                  </button>

                </div>

              </motion.div>
            )}

            {/* 5. PERFORMANCE ANALYTICS VIEW STATE */}
            {currentTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-[#0E1321] border border-white/[0.06] p-5 rounded-2xl">
                    <span className="text-slate-400 text-xs font-mono block">Active Platform Uptime</span>
                    <span className="text-3xl font-extrabold text-[#2ED573] mt-2 block font-mono">{analyticsStats.uptime}</span>
                    <p className="text-[10px] text-slate-500 mt-2">Aggregated across all server relay zones</p>
                  </div>
                  <div className="bg-[#0E1321] border border-white/[0.06] p-5 rounded-2xl">
                    <span className="text-slate-400 text-xs font-mono block">Average Inference Latency</span>
                    <span className="text-3xl font-extrabold text-[#4F9CF9] mt-2 block font-mono">{analyticsStats.latency}</span>
                    <p className="text-[10px] text-slate-500 mt-2">Measured at browser WebSocket ingress</p>
                  </div>
                  <div className="bg-[#0E1321] border border-white/[0.06] p-5 rounded-2xl">
                    <span className="text-slate-400 text-xs font-mono block">Platform Shard Storage Allocation</span>
                    <span className="text-3xl font-extrabold text-white mt-2 block font-mono">{analyticsStats.databaseUsage}</span>
                    <p className="text-[10px] text-slate-500 mt-2">Vector listings capacity utilization</p>
                  </div>
                </div>

                {/* GRAPH VISUAL CHART BLOCK */}
                <div className="bg-[#0E1321] border border-white/[0.06] p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-extrabold text-sm text-white tracking-tight">API Request Metrics History</h3>
                      <p className="text-xs text-slate-500 mt-1">Inference transactions and latencies logged over the past week</p>
                    </div>
                    <span className="text-[10.5px] font-mono text-[#6C5CE7] bg-[#6C5CE7]/15 px-3 py-1 rounded-full uppercase border border-[#6C5CE7]/25 font-bold">
                      Ecosystem live tracking
                    </span>
                  </div>

                  {/* SVG COMPREHENSIVE BAR CHART FOR SYSTEM */}
                  <div className="h-64 flex items-end justify-between gap-4 pt-4 border-b border-white/[0.05] relative px-4 text-center">
                    {/* Background target grid lines */}
                    <div className="absolute top-1/4 left-0 right-0 border-t border-white/[0.02]" />
                    <div className="absolute top-2/4 left-0 right-0 border-t border-white/[0.02]" />
                    <div className="absolute top-3/4 left-0 right-0 border-t border-white/[0.02]" />

                    {analyticsStats.usageHistory.map((day, idx) => {
                      const maxRequests = 550;
                      const heightPercent = `${(day.requests / maxRequests) * 100}%`;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end z-10 group relative">
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-12 bg-[#0E1321] border border-white/[0.1] px-2.5 py-1.5 rounded text-[10px] font-mono text-[#6C5CE7] transition-all whitespace-nowrap shadow-lg">
                            <span className="font-extrabold text-white">{day.requests} Req</span> / {day.latency}ms latency
                          </div>

                          <div 
                            className="bg-gradient-to-t from-[#6C5CE7] to-[#4F9CF9] w-full rounded-t-lg transition-all group-hover:from-[#6C5CE7] group-hover:to-[#2ED573]" 
                            style={{ height: heightPercent }}
                          />
                          <div className="text-[10px] font-mono text-slate-500 block shrink-0 mt-3">{day.date}</div>
                        </div>
                      );
                    })}
                  </div>

                </div>

              </motion.div>
            )}

            {/* 6. SYSTEM TELEMETRY LOGS VIEW STATE */}
            {currentTab === 'telemetry' && (
              <motion.div
                key="telemetry"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                
                <div className="bg-[#0E1321] border border-white/[0.06] p-6 rounded-2xl space-y-4">
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.04] pb-4">
                    <div className="space-y-0.5">
                      <h3 className="font-extrabold text-sm text-slate-200 tracking-tight">Ecosystem Diagnostic Console Logs</h3>
                      <p className="text-slate-500 text-xs">Filter real-time and operational status queries registered in BotlyHub telemetry</p>
                    </div>

                    <button
                      onClick={() => {
                        setTerminalFeedLogs([]);
                        showToast('Telemetry diagnostics storage reset', 'success');
                      }}
                      className="text-xs font-bold text-[#FF4757] hover:underline cursor-pointer"
                    >
                      Reset Telemetry Dump
                    </button>
                  </div>

                  <div className="bg-[#08080A] rounded-2xl border border-white/[0.05] p-5 font-mono text-[11px] leading-relaxed h-[420px] overflow-y-auto space-y-1.5">
                    <div className="text-slate-500 font-bold mb-3">// Telemetry dump initialisation sequence: UTC+0 active</div>
                    <div className="text-[#2ED573]">● SUCCESS (200) API keys decrypted. Pipeline state matched with secure gateway servers.</div>
                    
                    {terminalFeedLogs.map((log, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row md:items-start gap-1 md:gap-3 text-slate-300">
                        <span className="text-slate-500">[{log.time}]</span>
                        <span className="text-[#6C5CE7] font-bold">{log.botName}:</span>
                        <span className={log.status === 'success' ? 'text-[#2ED573]' : log.status === 'error' ? 'text-[#FF4757]' : 'text-slate-200'}>
                          {log.text}
                        </span>
                      </div>
                    ))}
                    
                    <div className="text-slate-500 pt-2">... Listening continuously for next execution transaction ...</div>
                  </div>

                </div>

              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </main>

      {/* CREATE BOT MODAL SCREEN */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-[#070708]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0E1321] border border-white/[0.1] rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
                <span className="font-extrabold text-[#EDEDED] text-sm tracking-tight flex items-center gap-2">
                  <Bot size={17} className="text-[#6C5CE7]" />
                  <span>Spin Up New Cloud Bot Agent</span>
                </span>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  X
                </button>
              </div>

              <form onSubmit={handleCreateBot} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Bot Agent Name</label>
                  <input
                    type="text"
                    required
                    value={newBotName}
                    onChange={(e) => setNewBotName(e.target.value)}
                    placeholder="e.g., TranslatorBot Master"
                    className="w-full bg-[#08080A] rounded-xl border border-white/[0.07] px-4 py-3 text-xs text-white focus:outline-none focus:border-[#6C5CE7]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Operational Category</label>
                  <select
                    value={newBotType}
                    onChange={(e) => setNewBotType(e.target.value as any)}
                    className="w-full bg-[#08080A] rounded-xl border border-white/[0.07] p-3 text-xs text-slate-300 focus:outline-none focus:border-[#6C5CE7]"
                  >
                    {['Support', 'Automation', 'QA', 'Assistant'].map((t) => (
                      <option key={t} value={t}>{t} Bot Agent</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Initial System Prompt (AI Instructions)</label>
                  <textarea
                    value={newBotPrompt}
                    onChange={(e) => setNewBotPrompt(e.target.value)}
                    placeholder="Write custom prompt commands to define AI memory..."
                    rows={4}
                    className="w-full bg-[#08080A] rounded-xl border border-white/[0.07] p-4 text-xs text-white focus:outline-none focus:border-[#6C5CE7] leading-relaxed font-mono"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.04]">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 border border-white/[0.07] hover:bg-white/[0.03] text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#6C5CE7] hover:bg-[#5b4ed4] text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    Provision Agent
                  </button>
                </div>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST NOTIFIERS LAYER */}
      <div className="fixed bottom-6 right-6 space-y-2.5 z-50 pointer-events-none">
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`w-80 p-3.5 rounded-xl border shadow-[0_4px_16px_rgba(0,0,0,0.5)] pointer-events-auto flex items-center justify-between ${
              t.type === 'error' ? 'bg-[#FF4757]/10 border-[#FF4757]/20 text-[#FF4757]' : 
              t.type === 'info' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
              'bg-[#2ED573]/10 border-[#2ED573]/20 text-[#2ED573]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-1.5 h-1.5 rounded-full ${
                t.type === 'error' ? 'bg-[#FF4757]' : t.type === 'info' ? 'bg-blue-400' : 'bg-[#2ED573]'
              }`} />
              <span className="text-[11.5px] font-semibold text-[#EDEDED]">{t.message}</span>
            </div>
            <button 
              onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
              className="text-slate-500 hover:text-white text-xs pl-2"
            >
              X
            </button>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
