import React, { useState } from 'react';
import { Session, SessionStatus } from '../types';
import { Search, Clock, MessageSquare, CheckCircle, Filter } from 'lucide-react';
import { useI18n } from '../i18n';

interface SessionListProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
}

const SessionList: React.FC<SessionListProps> = ({ sessions, activeSessionId, onSelectSession }) => {
  const [filter, setFilter] = useState<SessionStatus>(SessionStatus.ACTIVE);
  const { t } = useI18n();

  const filteredSessions = sessions.filter(s => s.status === filter);

  const getStatusLabel = (status: SessionStatus) => {
    switch(status) {
        case SessionStatus.ACTIVE: return t('status_active');
        case SessionStatus.QUEUED: return t('status_queued');
        case SessionStatus.ENDED: return t('status_ended');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-4">{t('sessions_title')}</h2>
        
        {/* Status Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg mb-3">
          {[SessionStatus.ACTIVE, SessionStatus.QUEUED, SessionStatus.ENDED].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${
                filter === status 
                  ? 'bg-white text-slate-800 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {getStatusLabel(status)}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder={t('search_placeholder')} 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400">
            <Filter size={24} className="mb-2 opacity-50"/>
            <span className="text-sm">{t('no_sessions')}</span>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${
                activeSessionId === session.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <img 
                      src={session.customer.avatar} 
                      alt={session.customer.name} 
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    {session.status === SessionStatus.ACTIVE && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 leading-tight">{session.customer.name}</h3>
                    <span className="text-xs text-slate-500">{session.customer.company}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-400 flex flex-col items-end">
                   <span>{new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
              
              <div className="mt-2">
                 <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                   {session.lastMessage}
                 </p>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        session.status === SessionStatus.ACTIVE ? 'bg-green-100 text-green-700' : 
                        session.status === SessionStatus.QUEUED ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                        {session.consultationForm.productModule}
                    </span>
                     {session.status === SessionStatus.ACTIVE && (
                         <span className="text-[10px] text-slate-400 flex items-center gap-1">
                             <Clock size={10} /> {session.duration}
                         </span>
                     )}
                </div>
                {session.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                        {session.unreadCount}
                    </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SessionList;