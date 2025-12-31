import React, { useState } from 'react';
import { Ticket } from '../types';
import { Search, Filter, AlertCircle, Clock, CheckCircle, XCircle, Plus, Users, User } from 'lucide-react';
import { useI18n } from '../i18n';

interface TicketListProps {
  title: string;
  tickets: Ticket[];
  activeTicketId: string | null;
  onSelectTicket: (ticketId: string) => void;
  onCreateClick: () => void;
}

type AssigneeFilter = 'all' | 'unassigned' | 'me';

const TicketList: React.FC<TicketListProps> = ({ title, tickets, activeTicketId, onSelectTicket, onCreateClick }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<AssigneeFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useI18n();

  // 1. Filter Logic
  const filteredTickets = tickets.filter(t => {
    // Status Filter
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    
    // Search Filter
    const matchesSearch = searchTerm === '' || 
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.subject.toLowerCase().includes(searchTerm.toLowerCase());

    // Assignee Filter
    let matchesAssignee = true;
    if (assigneeFilter === 'unassigned') {
        matchesAssignee = !t.assignee;
    } else if (assigneeFilter === 'me') {
        // Note: In a real app we would check against currentUser.id, but here 'me' is simulated 
        // by the calling parent filtering or just basic assumption since TicketList is often context aware.
        // However, since we are doing client-side filter here:
        // Let's assume for this component that 'me' filtering happens here if we had current user ID context.
        // But the prompt says "Ticket List Page". The 'tickets' prop passed here usually is already filtered by view 'All' or 'My'.
        // To support specific "Unassigned" view inside "All Tickets", we check existence.
        // For "Me", if we are in "All Tickets" view, we need context. 
        // For simplicity in this demo component:
        matchesAssignee = true; // 'me' logic is usually handled by parent 'My Tickets' view.
        if (assigneeFilter === 'me' && t.assignee) {
             // Basic fallback: if it has an assignee, we assume it matched the parent's "My Ticket" filter logic if active,
             // or we just show assigned ones.
             matchesAssignee = !!t.assignee;
        }
    }

    return matchesStatus && matchesSearch && matchesAssignee;
  });

  // 2. Sort Logic: Unassigned First, then by Date
  const sortedTickets = [...filteredTickets].sort((a, b) => {
      // Priority 1: Unassigned comes first
      if (!a.assignee && b.assignee) return -1;
      if (a.assignee && !b.assignee) return 1;

      // Priority 2: Newest first
      return b.updatedAt.getTime() - a.updatedAt.getTime();
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

        {/* Assignee Filter (Dropdown) */}
        <div className="mb-3">
             <div className="relative">
                 <select 
                    value={assigneeFilter}
                    onChange={(e) => setAssigneeFilter(e.target.value as AssigneeFilter)}
                    className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer"
                 >
                     <option value="all">{t('filter_assignee_all')}</option>
                     <option value="unassigned">{t('filter_assignee_unassigned')}</option>
                 </select>
                 <Users className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
             </div>
        </div>
        
        {/* Status Filter (Tabs) */}
        <div className="flex bg-slate-100 p-1 rounded-lg mb-3">
            {['all', 'open', 'in_progress', 'resolved', 'closed'].map((s) => (
                 <button
                 key={s}
                 onClick={() => setStatusFilter(s)}
                 className={`flex-1 text-[10px] uppercase font-bold py-1.5 rounded-md transition-all ${
                   statusFilter === s 
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
        {sortedTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400">
            <Filter size={24} className="mb-2 opacity-50"/>
            <span className="text-sm">{t('no_tickets')}</span>
          </div>
        ) : (
          sortedTickets.map((ticket) => (
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
                 
                 {/* Unassigned Indicator in List */}
                 {!ticket.assignee && (
                     <span className="ml-auto text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold border border-slate-200">
                         Unassigned
                     </span>
                 )}

                 {ticket.assignee && (
                    <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        ticket.priority === 'critical' ? 'bg-red-100 text-red-700' :
                        ticket.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                    }`}>
                        {t(`priority_${ticket.priority}` as any)}
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

export default TicketList;