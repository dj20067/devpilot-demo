import React, { useState } from 'react';
import { Ticket } from '../types';
import { Search, Filter, AlertCircle, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';
import { useI18n } from '../i18n';

interface TicketListProps {
  title: string;
  tickets: Ticket[];
  activeTicketId: string | null;
  onSelectTicket: (ticketId: string) => void;
  onCreateClick: () => void;
}

const TicketList: React.FC<TicketListProps> = ({ title, tickets, activeTicketId, onSelectTicket, onCreateClick }) => {
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useI18n();

  const filteredTickets = tickets.filter(t => {
    const matchesStatus = filter === 'all' || t.status === filter;
    const matchesSearch = searchTerm === '' || 
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch(status) {
        case 'open': return <AlertCircle size={14} className="text-red-500" />;
        case 'in_progress': return <Clock size={14} className="text-blue-500" />;
        case 'resolved': return <CheckCircle size={14} className="text-green-500" />;
        case 'closed': return <XCircle size={14} className="text-slate-400" />;
        default: return <Clock size={14} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">{title}</h2>
            <button 
                onClick={onCreateClick}
                className="p-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                title={t('btn_create')}
            >
                <Plus size={16} />
            </button>
        </div>
        
        {/* Simple Filter */}
        <div className="flex bg-slate-100 p-1 rounded-lg mb-3">
            {['all', 'open', 'in_progress', 'resolved', 'closed'].map((s) => (
                 <button
                 key={s}
                 onClick={() => setFilter(s)}
                 className={`flex-1 text-[10px] uppercase font-bold py-1.5 rounded-md transition-all ${
                   filter === s 
                     ? 'bg-white text-slate-800 shadow-sm' 
                     : 'text-slate-500 hover:text-slate-700'
                 }`}
               >
                 {s === 'all' ? 'ALL' : t(`ticket_status_${s}` as any).slice(0,4)}
               </button>
            ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder={t('ticket_search_placeholder')} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400">
            <Filter size={24} className="mb-2 opacity-50"/>
            <span className="text-sm">{t('no_tickets')}</span>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => onSelectTicket(ticket.id)}
              className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${
                activeTicketId === ticket.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'
              }`}
            >
              <div className="flex justify-between items-start mb-1.5">
                  <span className="font-mono text-xs text-slate-400">{ticket.id}</span>
                  <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                      {getStatusIcon(ticket.status)}
                      <span className="text-[10px] font-medium text-slate-600 uppercase">{t(`ticket_status_${ticket.status}` as any)}</span>
                  </div>
              </div>
              
              <h3 className="text-sm font-semibold text-slate-800 leading-tight mb-1">{ticket.subject}</h3>
              
              <div className="flex items-center gap-2 mt-2">
                 <img src={ticket.customer.avatar} className="w-5 h-5 rounded-full" alt="Cust" />
                 <span className="text-xs text-slate-500 truncate">{ticket.customer.name}</span>
                 <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                     ticket.priority === 'critical' ? 'bg-red-100 text-red-700' :
                     ticket.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                     ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                     'bg-green-100 text-green-700'
                 }`}>
                     {t(`priority_${ticket.priority}` as any)}
                 </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TicketList;