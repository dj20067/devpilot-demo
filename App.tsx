import React, { useState, useEffect } from 'react';
import SessionList from './components/SessionList';
import ChatArea from './components/ChatArea';
import RightSidebar from './components/RightSidebar';
import NavRail from './components/NavRail';
import TicketList from './components/TicketList';
import TicketDetail from './components/TicketDetail';
import TicketGrid from './components/TicketGrid'; // Import TicketGrid
import { getMockData } from './constants';
import { UserRole, Message, Ticket, User } from './types';
import { Settings, Bell, LayoutGrid, Globe, X, MessageSquare, Shield, Archive } from 'lucide-react';
import { I18nProvider, useI18n } from './i18n';

// Standalone Page Layout for heavy interactions
const StandaloneTicketPage: React.FC<{ ticket: Ticket; currentUser: User; onSave: (d: Partial<Ticket>) => void; }> = ({ ticket, currentUser, onSave }) => {
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
                        />
                    </div>
                    {/* Placeholder for Communication Area */}
                    <div className="h-1/3 border-t border-slate-200 bg-slate-50 p-6">
                        <div className="flex items-center gap-4 mb-4 border-b border-slate-200 pb-2">
                             <button className="text-sm font-bold text-blue-600 border-b-2 border-blue-600 pb-2 -mb-2.5">Customer Communication</button>
                             <button className="text-sm font-medium text-slate-500 hover:text-slate-700 pb-2">Internal Notes</button>
                        </div>
                        <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-lg text-slate-400">
                             <MessageSquare size={24} className="mb-2 opacity-50"/>
                             <span className="text-sm font-medium">Communication Area Placeholder</span>
                             <span className="text-xs">Chat with customer or leave internal comments here.</span>
                        </div>
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

  // View State - 'tickets' split into 'my_tickets' and 'all_tickets'
  const [activeView, setActiveView] = useState<'chat' | 'my_tickets' | 'all_tickets'>('chat');

  // Chat State
  const [activeSessionId, setActiveSessionId] = useState<string | null>(MOCK_SESSIONS[0].id);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [currentUser, setCurrentUser] = useState(CURRENT_USER);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Ticket State
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(MOCK_TICKETS[0].id);
  
  // Drawer State for All Tickets View
  const [isTicketDrawerOpen, setIsTicketDrawerOpen] = useState(false);

  // Standalone Mode State
  const [standaloneTicketId, setStandaloneTicketId] = useState<string | null>(null);

  // Check URL params for standalone mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tid = params.get('ticketId');
    if (tid) setStandaloneTicketId(tid);
  }, []);

  // When language changes, refresh mock data (Simulating a re-fetch)
  useEffect(() => {
    const newData = getMockData(language);
    setData(newData);
    // Important: Don't completely override messages if user added some, but for this mock we reset to show translation
    setMessages(newData.MOCK_MESSAGES); 
    setTickets(newData.MOCK_TICKETS);
    // If standalone, ensure we try to find that ticket in new data
    const currentActive = standaloneTicketId || activeTicketId;
    if (currentActive && newData.MOCK_TICKETS.some(t => t.id === currentActive)) {
        // keep active
    } else {
        setActiveTicketId(newData.MOCK_TICKETS[0].id);
    }
    
    setCurrentUser(prev => ({...newData.CURRENT_USER, role: prev.role})); 
  }, [language]);

  const activeSession = MOCK_SESSIONS.find(s => s.id === activeSessionId) || MOCK_SESSIONS[0];
  
  // Ticket Logic
  const isCreatingTicket = activeTicketId === 'new';
  const activeTicket = isCreatingTicket ? undefined : tickets.find(t => t.id === activeTicketId);

  // Filter Tickets based on View
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

  // Handle Ticket Selection logic differently based on view
  const handleTicketSelect = (ticketId: string) => {
      setActiveTicketId(ticketId);
      if (activeView === 'all_tickets') {
          setIsTicketDrawerOpen(true);
      }
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

  const handleSaveTicket = (ticketData: Partial<Ticket>) => {
      if (isCreatingTicket) {
          // Create new
          const newTicket: Ticket = {
              id: `TIC-${Math.floor(Math.random() * 10000)}`,
              subject: ticketData.subject || 'Untitled',
              description: ticketData.description || '',
              status: ticketData.status || 'open',
              priority: ticketData.priority || 'medium',
              // Use mock customer for now
              customer: MOCK_SESSIONS[0].customer,
              assignee: ticketData.assignee,
              cc: [],
              collaborators: [],
              tags: ticketData.tags || [],
              createdAt: new Date(),
              updatedAt: new Date(),
          } as Ticket;
          setTickets([newTicket, ...tickets]);
          setActiveTicketId(newTicket.id);
      } else if (activeTicket || standaloneTicketId) {
          // Update existing
          const targetId = activeTicket?.id || standaloneTicketId;
          setTickets(tickets.map(t => t.id === targetId ? { ...t, ...ticketData, updatedAt: new Date() } : t));
      }
  };

  const openTicketInNewTab = (ticketId: string) => {
      window.open(`?ticketId=${ticketId}`, '_blank');
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
      return <StandaloneTicketPage ticket={ticket} currentUser={currentUser} onSave={handleSaveTicket} />;
  }

  // --- RENDER NORMAL APP ---
  return (
    <div className="flex h-screen bg-white overflow-hidden" onClick={() => setIsSettingsOpen(false)}>
      
      {/* 1. Left Navigation Rail */}
      <NavRail activeView={activeView} onChangeView={setActiveView} />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 z-20 shadow-sm">
            <h1 className="text-lg font-bold text-slate-800">
                {activeView === 'chat' ? t('nav_chat') : ticketListTitle}
            </h1>
            
            <div className="flex items-center gap-4">
                <button 
                    onClick={(e) => { e.stopPropagation(); toggleRole(); }} 
                    className="text-xs px-2 py-1 bg-slate-100 rounded border border-slate-200 hover:bg-slate-200 transition-colors"
                    title="Click to switch role for demo"
                >
                    {t('role_label')}: <span className={`${currentUser.role === UserRole.ADMIN ? 'text-blue-600' : 'text-green-600'} font-bold`}>{t(`role_${currentUser.role}` as any)}</span>
                </button>
                <div className="h-4 w-px bg-slate-200"></div>
                <button className="relative">
                    <Bell size={18} className="text-slate-400 hover:text-slate-600 cursor-pointer" />
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                <div className="relative">
                    <Settings 
                        size={18} 
                        className={`text-slate-400 hover:text-slate-600 cursor-pointer transition-transform ${isSettingsOpen ? 'rotate-90 text-blue-500' : ''}`} 
                        onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(!isSettingsOpen); }}
                    />
                    
                    {/* Settings Dropdown */}
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

                <div className="flex items-center gap-2 cursor-pointer group pl-2">
                    <img src={currentUser.avatar} alt="Me" className="w-8 h-8 rounded-full border border-slate-200" />
                    <span className="text-xs font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{currentUser.name}</span>
                </div>
            </div>
        </div>

        {/* Workspace Content */}
        <div className="flex-1 overflow-hidden relative">
            
            {/* VIEW: CHAT */}
            {activeView === 'chat' && (
                <div className="grid grid-cols-12 h-full absolute inset-0">
                    <div className="col-span-3 h-full border-r border-slate-200">
                        <SessionList 
                            sessions={MOCK_SESSIONS} 
                            activeSessionId={activeSessionId} 
                            onSelectSession={setActiveSessionId} 
                        />
                    </div>
                    <div className="col-span-6 h-full flex flex-col">
                        <ChatArea 
                            session={activeSession}
                            messages={messages.filter(m => m.sessionId === activeSessionId)}
                            currentUser={currentUser}
                            onSendMessage={handleSendMessage}
                            onDeleteMessage={handleDeleteMessage}
                            onUpdateMessage={handleUpdateMessage}
                        />
                    </div>
                    <div className="col-span-3 h-full border-l border-slate-200 bg-white">
                        <RightSidebar 
                            session={activeSession}
                            currentUser={currentUser}
                            history={MOCK_HISTORY}
                        />
                    </div>
                </div>
            )}

            {/* VIEW: MY TICKETS (Split Layout) */}
            {activeView === 'my_tickets' && (
                <div className="grid grid-cols-12 h-full absolute inset-0">
                     <div className="col-span-3 h-full border-r border-slate-200">
                         <TicketList 
                            title={ticketListTitle}
                            tickets={visibleTickets}
                            activeTicketId={activeTicketId}
                            onSelectTicket={handleTicketSelect}
                            onCreateClick={() => handleTicketSelect('new')}
                         />
                     </div>
                     <div className="col-span-9 h-full">
                         <TicketDetail 
                            ticket={activeTicket}
                            isCreating={isCreatingTicket}
                            currentUser={currentUser}
                            onSave={handleSaveTicket}
                            onCancel={() => {
                                if (isCreatingTicket) setActiveTicketId(visibleTickets[0]?.id || null);
                            }}
                            onOpenInNewTab={() => activeTicket && openTicketInNewTab(activeTicket.id)}
                         />
                     </div>
                </div>
            )}

            {/* VIEW: ALL TICKETS (Grid Layout + Drawer) */}
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
                        className={`absolute top-0 right-0 h-full w-[650px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-slate-200 ${
                            isTicketDrawerOpen ? 'translate-x-0' : 'translate-x-full'
                        }`}
                    >
                         {/* Drawer Close Button (Alternative to using TicketDetail's cancel/back) */}
                         <button 
                            onClick={() => setIsTicketDrawerOpen(false)}
                            className="absolute top-4 right-4 z-[60] p-1.5 bg-white rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-sm"
                        >
                            <X size={18} />
                        </button>

                         {/* Reuse TicketDetail inside drawer */}
                         <div className="h-full pt-10">
                            <TicketDetail 
                                ticket={activeTicket}
                                isCreating={false} // Drawer usually for viewing/editing existing
                                currentUser={currentUser}
                                onSave={handleSaveTicket}
                                onCancel={() => setIsTicketDrawerOpen(false)}
                                onOpenInNewTab={() => activeTicket && openTicketInNewTab(activeTicket.id)}
                            />
                         </div>
                    </div>
                </div>
            )}

        </div>
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