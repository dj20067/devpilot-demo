import React, { useState, useEffect, useRef } from 'react';
import SessionList from './components/SessionList';
import ChatArea from './components/ChatArea';
import RightSidebar from './components/RightSidebar';
import NavRail from './components/NavRail';
import TicketList from './components/TicketList';
import TicketDetail from './components/TicketDetail';
import TicketGrid from './components/TicketGrid'; 
import OutboundCallPanel from './components/OutboundCallPanel';
import { getMockData } from './constants';
import { UserRole, Message, Ticket, User, Customer } from './types';
import { Settings, Bell, Globe, X, Archive, Phone, Mic, MicOff, ChevronDown, Check, Shield, AlertTriangle, Info, Menu, ArrowLeft } from 'lucide-react';
import { I18nProvider, useI18n } from './i18n';
import { ProfileModal } from './components/ProfileModal';

// --- System Toast Component ---
interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
}

const SystemToast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgClass = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-500' : 'bg-blue-600';
    const Icon = type === 'success' ? Check : type === 'error' ? AlertTriangle : Info;

    return (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-white ${bgClass} animate-in slide-in-from-top-2 fade-in duration-300`}>
            <Icon size={18} />
            <span className="text-sm font-medium">{message}</span>
            <button onClick={onClose} className="ml-2 hover:bg-white/20 rounded p-0.5"><X size={14}/></button>
        </div>
    );
};

// Standalone Page Layout for heavy interactions
const StandaloneTicketPage: React.FC<{ 
    ticket: Ticket; 
    currentUser: User; 
    onSave: (d: Partial<Ticket>) => void;
    onOutboundCall: (number: string, customer?: Customer) => void;
}> = ({ ticket, currentUser, onSave, onOutboundCall }) => {
    return (
        <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
            {/* Simple Top Bar */}
            <div className="h-14 bg-slate-900 flex items-center px-6 flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded flex items-center justify-center mr-3">
                    <span className="font-bold text-white text-sm">D</span>
                </div>
                <h1 className="text-white font-medium text-sm">DevPilot Console <span className="text-slate-500 mx-2">/</span> <span className="text-slate-300">{ticket.id}</span></h1>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Ticket Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-white border-r border-slate-200">
                    <div className="flex-1 overflow-hidden relative">
                         <TicketDetail 
                            ticket={ticket}
                            isCreating={false}
                            currentUser={currentUser}
                            onSave={onSave}
                            onCancel={() => {}}
                            onOutboundCall={onOutboundCall}
                        />
                    </div>
                </div>

                {/* Context Sidebar (Simplified RightSidebar) */}
                <div className="w-80 bg-white flex flex-col border-l border-slate-200">
                    <div className="p-4 border-b border-slate-200 bg-slate-50">
                        <h3 className="text-xs font-bold text-slate-400 uppercase">Context</h3>
                    </div>
                    <div className="p-4 space-y-6 overflow-y-auto">
                        <div>
                             <h4 className="text-sm font-bold text-slate-800 mb-2">Customer Info</h4>
                             <div className="flex items-center gap-3 mb-3">
                                <img src={ticket.customer.avatar} className="w-10 h-10 rounded-full" />
                                <div>
                                    <div className="text-sm font-medium">{ticket.customer.name}</div>
                                    <div className="text-xs text-slate-500">{ticket.customer.company}</div>
                                </div>
                             </div>
                             <div className="space-y-2 text-sm">
                                 <div className="flex justify-between"><span className="text-slate-500">Tier</span> <span>{ticket.customer.tier}</span></div>
                                 <div className="flex justify-between"><span className="text-slate-500">Region</span> <span>{ticket.customer.region || 'N/A'}</span></div>
                             </div>
                        </div>
                        
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 mb-2">SLA Status</h4>
                            <div className="bg-green-50 border border-green-100 p-3 rounded text-green-800 text-sm">
                                <Shield size={16} className="inline mr-1"/> Within SLA
                            </div>
                        </div>

                         <div>
                            <h4 className="text-sm font-bold text-slate-800 mb-2">Linked Assets</h4>
                            <div className="text-sm text-slate-500 italic">No assets linked</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Inner App component to use the context
const DevPilotApp: React.FC = () => {
  const { language, setLanguage, t } = useI18n();
  
  // State for data
  const [data, setData] = useState(getMockData(language));
  const { MOCK_SESSIONS, MOCK_MESSAGES, CURRENT_USER, MOCK_HISTORY, MOCK_TICKETS } = data;

  // View State
  const [activeView, setActiveView] = useState<'chat' | 'my_tickets' | 'all_tickets'>('chat');
  
  // Responsive States
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileContextOpen, setIsMobileContextOpen] = useState(false);
  const [showMobileDetail, setShowMobileDetail] = useState(false); // Controls List vs Detail on mobile

  // Chat State
  const [activeSessionId, setActiveSessionId] = useState<string | null>(MOCK_SESSIONS[0].id);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [currentUser, setCurrentUser] = useState(CURRENT_USER);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Global Status State
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [chatStatus, setChatStatus] = useState<'online' | 'away' | 'offline'>('online');
  const [acceptTickets, setAcceptTickets] = useState(true);
  
  // Audio State
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // UI State - Call Panel
  const [callPanelState, setCallPanelState] = useState<{isOpen: boolean, number?: string, customer?: Customer}>({
      isOpen: false
  });
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error' | 'info'} | null>(null);

  // Ticket State
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(MOCK_TICKETS[0].id);
  
  // Drawer State
  const [isTicketDrawerOpen, setIsTicketDrawerOpen] = useState(false);

  // Standalone Mode
  const [standaloneTicketId, setStandaloneTicketId] = useState<string | null>(null);

  const handleOpenCallPanel = (number?: string, customer?: Customer) => {
      setCallPanelState({
          isOpen: true,
          number: number,
          customer: customer
      });
  };

  const handleCloseCallPanel = () => {
      setCallPanelState({ ...callPanelState, isOpen: false });
  };

  // Audio System: Verify and Play Success Tone
  const verifyAndEnableAudio = async (silentMode: boolean = false) => {
    try {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        const ctx = audioContextRef.current;

        // Try to resume context (Browser Autoplay Policy often keeps it suspended)
        if (ctx.state === 'suspended') {
            await ctx.resume();
        }

        if (ctx.state === 'running') {
            setAudioEnabled(true);
            
            // Only play success tone if explicitly requested (not silent check)
            if (!silentMode) {
                // Create a pleasant "Success" chord (C5 + E5)
                const now = ctx.currentTime;
                
                const osc1 = ctx.createOscillator();
                osc1.type = 'sine';
                osc1.frequency.value = 523.25; // C5

                const osc2 = ctx.createOscillator();
                osc2.type = 'sine';
                osc2.frequency.value = 659.25; // E5

                const gain = ctx.createGain();
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

                osc1.connect(gain);
                osc2.connect(gain);
                gain.connect(ctx.destination);

                osc1.start(now);
                osc2.start(now);
                osc1.stop(now + 0.5);
                osc2.stop(now + 0.5);

                setToast({ msg: t('toast_audio_success'), type: 'success' });
            }
        } else {
            // Still suspended or closed
            throw new Error("Context suspended");
        }
    } catch (e) {
        console.error("Audio Verification Failed", e);
        setAudioEnabled(false);
        if (!silentMode) {
            setToast({ msg: t('toast_audio_failed'), type: 'error' });
        }
    }
  };

  // Passive Audio Check (On Interaction)
  useEffect(() => {
    const handlePassiveUnlock = () => {
        if (!audioEnabled) {
            // Attempt silent unlock on first click
            verifyAndEnableAudio(true);
        }
    };
    
    window.addEventListener('click', handlePassiveUnlock, { once: true });
    return () => window.removeEventListener('click', handlePassiveUnlock);
  }, [audioEnabled]);

  // Handle Explicit Audio Toggle
  const handleAudioToggle = () => {
      if (audioEnabled) {
          // Allow muting/disabling visually
          setAudioEnabled(false);
          audioContextRef.current?.suspend();
      } else {
          // Explicitly verify with feedback
          setToast({ msg: t('toast_audio_verifying'), type: 'info' });
          verifyAndEnableAudio(false);
      }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tid = params.get('ticketId');
    if (tid) setStandaloneTicketId(tid);
  }, []);

  useEffect(() => {
    const newData = getMockData(language);
    setData(newData);
    setMessages(newData.MOCK_MESSAGES); 
    setTickets(newData.MOCK_TICKETS);
    const currentActive = standaloneTicketId || activeTicketId;
    if (currentActive && newData.MOCK_TICKETS.some(t => t.id === currentActive)) {
        // keep active
    } else {
        setActiveTicketId(newData.MOCK_TICKETS[0].id);
    }
    setCurrentUser(prev => ({...prev, role: newData.CURRENT_USER.role, name: prev.name === newData.CURRENT_USER.name ? newData.CURRENT_USER.name : prev.name })); 
  }, [language]);

  const activeSession = MOCK_SESSIONS.find(s => s.id === activeSessionId) || MOCK_SESSIONS[0];
  
  const isCreatingTicket = activeTicketId === 'new';
  const activeTicket = isCreatingTicket ? undefined : tickets.find(t => t.id === activeTicketId);

  // Determine current context customer for the dialer
  const currentContextCustomer = activeView === 'chat' 
      ? activeSession?.customer 
      : (activeTicket ? activeTicket.customer : undefined);

  const getVisibleTickets = () => {
      if (activeView === 'all_tickets') {
          return tickets;
      }
      if (activeView === 'my_tickets') {
          return tickets.filter(t => 
              t.assignee?.id === currentUser.id ||
              t.cc?.some(u => u.id === currentUser.id) ||
              t.collaborators?.some(u => u.id === currentUser.id)
          );
      }
      return [];
  };

  const visibleTickets = getVisibleTickets();
  const ticketListTitle = activeView === 'my_tickets' ? t('nav_my_tickets') : t('nav_all_tickets');

  // --- Handlers ---
  const handleSessionSelect = (sessionId: string) => {
      setActiveSessionId(sessionId);
      setShowMobileDetail(true);
  };

  const handleTicketSelect = (ticketId: string) => {
      setActiveTicketId(ticketId);
      setShowMobileDetail(true);
      if (activeView === 'all_tickets') {
          setIsTicketDrawerOpen(true);
      }
  };

  const handleBackToMobileList = () => {
      setShowMobileDetail(false);
      setIsMobileContextOpen(false);
  };

  const handleViewChange = (view: 'chat' | 'my_tickets' | 'all_tickets') => {
      setActiveView(view);
      setIsMobileNavOpen(false);
      setShowMobileDetail(false);
  };

  const handleSendMessage = (text: string, type: Message['type'] = 'text', metadata: any = {}) => {
    if (!activeSessionId) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sessionId: activeSessionId,
      senderId: currentUser.id,
      content: text,
      timestamp: new Date(),
      type: type,
      ...metadata
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleDeleteMessage = (msgId: string) => {
    setMessages(messages.map(m => m.id === msgId ? { ...m, isDeleted: true } : m));
  };

  const handleUpdateMessage = (msgId: string, updates: Partial<Message>) => {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, ...updates } : m));
  };

  const toggleRole = () => {
    setCurrentUser(prev => ({
        ...prev,
        role: prev.role === UserRole.ADMIN ? UserRole.ENGINEER : UserRole.ADMIN
    }));
  };

  const toggleLanguage = () => {
      setLanguage(language === 'zh' ? 'en' : 'zh');
      setIsSettingsOpen(false);
  }

  const handleUpdateProfile = (updates: Partial<User>) => {
      setCurrentUser(prev => ({ ...prev, ...updates }));
  };

  const handleSaveTicket = (ticketData: Partial<Ticket>) => {
      if (isCreatingTicket) {
          const newTicket: Ticket = {
              id: `TIC-${Math.floor(Math.random() * 10000)}`,
              subject: ticketData.subject || 'Untitled',
              description: ticketData.description || '',
              status: ticketData.status || 'open',
              priority: ticketData.priority || 'medium',
              customer: MOCK_SESSIONS[0].customer,
              assignee: ticketData.assignee,
              cc: [],
              collaborators: [],
              tags: ticketData.tags || [],
              createdAt: new Date(),
              updatedAt: new Date(),
              timeline: []
          } as Ticket;
          setTickets([newTicket, ...tickets]);
          setActiveTicketId(newTicket.id);
      } else if (activeTicket || standaloneTicketId) {
          const targetId = activeTicket?.id || standaloneTicketId;
          setTickets(tickets.map(t => t.id === targetId ? { ...t, ...ticketData, updatedAt: new Date() } : t));
      }
  };

  const openTicketInNewTab = (ticketId: string) => {
      window.open(`?ticketId=${ticketId}`, '_blank');
  };

  // Helper for status color
  const getStatusColor = () => {
      if (chatStatus === 'online') return 'bg-green-500';
      if (chatStatus === 'away') return 'bg-orange-500';
      return 'bg-slate-400';
  };

  // --- RENDER STANDALONE MODE ---
  if (standaloneTicketId) {
      const ticket = tickets.find(t => t.id === standaloneTicketId);
      if (!ticket) {
          return (
              <div className="flex items-center justify-center h-screen bg-slate-50 text-slate-500">
                  <div className="text-center">
                      <Archive size={48} className="mx-auto mb-4 opacity-20"/>
                      <h2 className="text-xl font-bold mb-2">Ticket Not Found</h2>
                      <p>The ticket ID {standaloneTicketId} does not exist.</p>
                      <button onClick={() => window.location.href = '/'} className="mt-4 text-blue-600 hover:underline">Go Home</button>
                  </div>
              </div>
          );
      }
      return <StandaloneTicketPage ticket={ticket} currentUser={currentUser} onSave={handleSaveTicket} onOutboundCall={handleOpenCallPanel} />;
  }

  // --- RENDER NORMAL APP ---
  return (
    <div className="flex h-screen bg-white overflow-hidden" onClick={() => { setIsSettingsOpen(false); setIsStatusMenuOpen(false); }}>
      
      {/* System Toast */}
      {toast && (
          <SystemToast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* 1. Navigation (Desktop: Rail, Mobile: Drawer) */}
      <div className={`fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden ${isMobileNavOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileNavOpen(false)}></div>
      <div className={`fixed md:relative z-50 h-full transition-transform duration-300 md:translate-x-0 ${isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <NavRail activeView={activeView} onChangeView={handleViewChange} />
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        
        {/* Top Header */}
        <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-20 shadow-sm relative">
            <div className="flex items-center gap-3">
                {/* Mobile Menu Toggle */}
                <button className="md:hidden text-slate-500" onClick={() => setIsMobileNavOpen(true)}>
                    <Menu size={24} />
                </button>
                <h1 className="text-lg font-bold text-slate-800 truncate max-w-[150px] md:max-w-none">
                    {activeView === 'chat' ? t('nav_chat') : ticketListTitle}
                </h1>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
                
                {/* Outbound Call Trigger */}
                <button 
                    onClick={() => handleOpenCallPanel()}
                    className={`p-2 rounded-lg transition-colors border ${callPanelState.isOpen ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'}`}
                    title={t('btn_outbound_call')}
                >
                    <Phone size={16} className={callPanelState.isOpen ? 'fill-current' : ''} />
                </button>

                <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block"></div>

                {/* Combined Status Menu */}
                <div className="relative">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsStatusMenuOpen(!isStatusMenuOpen); }}
                        className="flex items-center gap-2 pl-2 pr-1 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors bg-white shadow-sm"
                    >
                        <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor()}`}></span>
                        <span className="text-xs font-bold text-slate-700 min-w-[3rem] text-left hidden md:inline">{t(`status_${chatStatus}` as any)}</span>
                        <ChevronDown size={14} className="text-slate-400" />
                    </button>

                    {isStatusMenuOpen && (
                        <div 
                            className="absolute top-10 right-0 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* ... Status Menu Content (Same as before) ... */}
                            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chat Status</div>
                            {['online', 'away', 'offline'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => { setChatStatus(s as any); setIsStatusMenuOpen(false); }}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
                                >
                                    <span className={`w-2 h-2 rounded-full ${
                                        s === 'online' ? 'bg-green-500' : s === 'away' ? 'bg-orange-500' : 'bg-slate-400'
                                    }`}></span>
                                    <span className={`${chatStatus === s ? 'font-bold text-slate-800' : 'text-slate-600'}`}>{t(`status_${s}` as any)}</span>
                                    {chatStatus === s && <Check size={14} className="ml-auto text-blue-600" />}
                                </button>
                            ))}
                            <div className="h-px bg-slate-100 my-1"></div>
                            <div className="px-3 py-2 flex items-center justify-between">
                                <span className="text-sm text-slate-700">{t('lbl_accept_tickets')}</span>
                                <button 
                                    onClick={() => setAcceptTickets(!acceptTickets)}
                                    className={`w-9 h-5 rounded-full relative transition-colors ${acceptTickets ? 'bg-green-500' : 'bg-slate-300'}`}
                                >
                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${acceptTickets ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Audio Status (Click to Verify) */}
                <div 
                    onClick={handleAudioToggle}
                    className={`flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-colors ${audioEnabled ? 'hover:bg-green-50' : 'hover:bg-red-50'}`}
                    title={audioEnabled ? t('lbl_audio_enabled') : t('lbl_audio_disabled')}
                >
                    {audioEnabled ? (
                        <Mic size={18} className="text-green-600" />
                    ) : (
                        <div className="relative">
                            <MicOff size={18} className="text-red-400" />
                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                        </div>
                    )}
                </div>

                {/* Role Switcher (Hidden on mobile to save space) */}
                <button 
                    onClick={(e) => { e.stopPropagation(); toggleRole(); }} 
                    className="hidden md:block text-xs px-2 py-1 bg-slate-100 rounded border border-slate-200 hover:bg-slate-200 transition-colors"
                    title="Click to switch role for demo"
                >
                    {t('role_label')}: <span className={`${currentUser.role === UserRole.ADMIN ? 'text-blue-600' : 'text-green-600'} font-bold`}>{t(`role_${currentUser.role}` as any)}</span>
                </button>
                
                <div className="h-4 w-px bg-slate-200 hidden md:block"></div>
                
                <button className="relative hidden md:block">
                    <Bell size={18} className="text-slate-400 hover:text-slate-600 cursor-pointer" />
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                <div className="relative hidden md:block">
                    <Settings 
                        size={18} 
                        className={`text-slate-400 hover:text-slate-600 cursor-pointer transition-transform ${isSettingsOpen ? 'rotate-90 text-blue-500' : ''}`} 
                        onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(!isSettingsOpen); }}
                    />
                    {isSettingsOpen && (
                        <div className="absolute right-0 top-8 bg-white text-slate-800 shadow-xl border border-slate-100 rounded-lg py-1 w-32 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleLanguage(); }}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 w-full text-left text-xs font-medium"
                            >
                                <Globe size={14} className="text-slate-400" />
                                {language === 'zh' ? 'English' : '中文'}
                            </button>
                        </div>
                    )}
                </div>

                <div 
                    className="flex items-center gap-2 cursor-pointer group pl-2"
                    onClick={() => setIsProfileModalOpen(true)}
                >
                    <img src={currentUser.avatar} alt="Me" className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
                    <span className="text-xs font-medium text-slate-700 group-hover:text-blue-600 transition-colors hidden md:inline">{currentUser.name}</span>
                </div>
            </div>
        </div>

        {/* Workspace Content - Responsive Layout */}
        <div className="flex-1 overflow-hidden relative flex flex-row">
            
            {/* VIEW: CHAT */}
            {activeView === 'chat' && (
                <>
                    {/* List Panel */}
                    <div className={`w-full md:w-80 border-r border-slate-200 bg-white flex flex-col transition-all duration-300 ${showMobileDetail ? 'hidden md:flex' : 'flex'}`}>
                        <SessionList 
                            sessions={MOCK_SESSIONS} 
                            activeSessionId={activeSessionId} 
                            onSelectSession={handleSessionSelect} 
                        />
                    </div>
                    
                    {/* Main Chat Area */}
                    <div className={`flex-1 flex flex-col bg-slate-50 transition-all duration-300 ${showMobileDetail ? 'flex' : 'hidden md:flex'}`}>
                        <ChatArea 
                            session={activeSession}
                            messages={messages.filter(m => m.sessionId === activeSessionId)}
                            currentUser={currentUser}
                            onSendMessage={handleSendMessage}
                            onDeleteMessage={handleDeleteMessage}
                            onUpdateMessage={handleUpdateMessage}
                            onBack={handleBackToMobileList}
                            onToggleContext={() => setIsMobileContextOpen(true)}
                            onOutboundCall={handleOpenCallPanel}
                        />
                    </div>

                    {/* Context Sidebar (Desktop: Fixed, Mobile: Drawer) */}
                    <div className={`
                        fixed inset-y-0 right-0 z-50 w-80 bg-white shadow-2xl transform transition-transform duration-300 md:relative md:transform-none md:shadow-none md:border-l md:border-slate-200
                        ${isMobileContextOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
                    `}>
                        {/* Mobile Header for Context */}
                        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-slate-800">Context</h3>
                            <button onClick={() => setIsMobileContextOpen(false)}><X size={20} className="text-slate-400"/></button>
                        </div>
                        <RightSidebar 
                            session={activeSession}
                            currentUser={currentUser}
                            history={MOCK_HISTORY}
                            onOutboundCall={handleOpenCallPanel}
                        />
                    </div>
                    {/* Mobile Backdrop for Context */}
                    {isMobileContextOpen && (
                        <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setIsMobileContextOpen(false)}></div>
                    )}
                </>
            )}

            {/* VIEW: MY TICKETS */}
            {activeView === 'my_tickets' && (
                <>
                    <div className={`w-full md:w-80 border-r border-slate-200 bg-white flex flex-col ${showMobileDetail ? 'hidden md:flex' : 'flex'}`}>
                         <TicketList 
                            title={ticketListTitle}
                            tickets={visibleTickets}
                            activeTicketId={activeTicketId}
                            onSelectTicket={handleTicketSelect}
                            onCreateClick={() => handleTicketSelect('new')}
                         />
                     </div>
                     <div className={`flex-1 flex flex-col bg-slate-50 ${showMobileDetail ? 'flex' : 'hidden md:flex'}`}>
                         {/* Mobile Back Button for Ticket Detail */}
                         <div className="md:hidden h-12 flex items-center px-4 bg-white border-b border-slate-200">
                             <button onClick={handleBackToMobileList} className="flex items-center gap-2 text-slate-600 font-medium">
                                 <ArrowLeft size={18}/> Back to List
                             </button>
                         </div>
                         <TicketDetail 
                            ticket={activeTicket}
                            isCreating={isCreatingTicket}
                            currentUser={currentUser}
                            onSave={handleSaveTicket}
                            onCancel={() => {
                                if (isCreatingTicket) setActiveTicketId(visibleTickets[0]?.id || null);
                                setShowMobileDetail(false);
                            }}
                            onOpenInNewTab={() => activeTicket && openTicketInNewTab(activeTicket.id)}
                            onOutboundCall={handleOpenCallPanel}
                         />
                     </div>
                </>
            )}

            {/* VIEW: ALL TICKETS */}
            {activeView === 'all_tickets' && (
                <div className="h-full w-full relative">
                    <TicketGrid 
                        tickets={visibleTickets} 
                        onSelectTicket={handleTicketSelect} 
                    />

                    {/* Drawer Backdrop */}
                    {isTicketDrawerOpen && (
                        <div 
                            className="absolute inset-0 bg-black/20 z-40 backdrop-blur-sm transition-opacity"
                            onClick={() => setIsTicketDrawerOpen(false)}
                        ></div>
                    )}
                    
                    {/* Drawer Content */}
                    <div 
                        className={`absolute top-0 right-0 h-full w-full md:w-[650px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-slate-200 ${
                            isTicketDrawerOpen ? 'translate-x-0' : 'translate-x-full'
                        }`}
                    >
                         {/* Drawer Close Button */}
                         <button 
                            onClick={() => setIsTicketDrawerOpen(false)}
                            className="absolute top-4 right-4 z-[60] p-1.5 bg-white rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-sm"
                        >
                            <X size={18} />
                        </button>

                         <div className="h-full pt-10">
                            <TicketDetail 
                                ticket={activeTicket}
                                isCreating={false} 
                                currentUser={currentUser}
                                onSave={handleSaveTicket}
                                onCancel={() => setIsTicketDrawerOpen(false)}
                                onOpenInNewTab={() => activeTicket && openTicketInNewTab(activeTicket.id)}
                                onOutboundCall={handleOpenCallPanel}
                            />
                         </div>
                    </div>
                </div>
            )}

        </div>

        {/* Global Floating Panels */}
        {callPanelState.isOpen && (
            <OutboundCallPanel 
                onClose={handleCloseCallPanel} 
                contextCustomer={callPanelState.customer || currentContextCustomer}
                initialNumber={callPanelState.number}
            />
        )}

        {/* Profile Modal */}
        {isProfileModalOpen && (
            <ProfileModal 
                user={currentUser} 
                onClose={() => setIsProfileModalOpen(false)} 
                onSave={handleUpdateProfile}
            />
        )}
      </div>
    </div>
  );
};

// Root App Wrapper
const App: React.FC = () => {
    return (
        <I18nProvider>
            <DevPilotApp />
        </I18nProvider>
    )
}

export default App;