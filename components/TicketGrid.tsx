import React, { useState } from 'react';
import { Ticket } from '../types';
import { Search, Filter, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useI18n } from '../i18n';

interface TicketGridProps {
  tickets: Ticket[];
  onSelectTicket: (ticketId: string) => void;
}

const TicketGrid: React.FC<TicketGridProps> = ({ tickets, onSelectTicket }) => {
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useI18n();

  const filteredTickets = tickets.filter(t => {
    const matchesStatus = filter === 'all' || t.status === filter;
    const matchesSearch = searchTerm === '' || 
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const label = t(`ticket_status_${status}` as any);
    switch(status) {
        case 'open': 
            return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700"><AlertCircle size={12}/> {label}</span>;
        case 'in_progress': 
            return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700"><Clock size={12}/> {label}</span>;
        case 'resolved': 
            return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700"><CheckCircle size={12}/> {label}</span>;
        case 'closed': 
            return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500"><XCircle size={12}/> {label}</span>;
        default: 
            return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">{label}</span>;
    }
  };

  const getPriorityBadge = (p: string) => {
      const label = t(`priority_${p}` as any);
      let colorClass = "";
      switch(p) {
        case 'critical': colorClass = "text-red-600 bg-red-50 border-red-200"; break;
        case 'high': colorClass = "text-orange-600 bg-orange-50 border-orange-200"; break;
        case 'medium': colorClass = "text-yellow-600 bg-yellow-50 border-yellow-200"; break;
        default: colorClass = "text-green-600 bg-green-50 border-green-200"; break;
      }
      return <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${colorClass}`}>{label}</span>
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 w-full overflow-hidden">
      {/* Grid Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-800">{t('nav_all_tickets')}</h2>
            
            <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder={t('ticket_search_placeholder')} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors w-64"
                    />
                </div>

                {/* Filter Dropdown (Simplified as buttons for consistency) */}
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    {['all', 'open', 'in_progress', 'resolved', 'closed'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                            filter === s 
                                ? 'bg-white text-slate-800 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {s === 'all' ? 'All' : t(`ticket_status_${s}` as any)}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-3 w-24">{t('col_id')}</th>
                        <th className="px-6 py-3">{t('col_subject')}</th>
                        <th className="px-6 py-3 w-48">{t('col_customer')}</th>
                        <th className="px-6 py-3 w-32">{t('col_priority')}</th>
                        <th className="px-6 py-3 w-32">{t('col_status')}</th>
                        <th className="px-6 py-3 w-40">{t('col_assignee')}</th>
                        <th className="px-6 py-3 w-40 text-right">{t('col_updated')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredTickets.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                <Filter size={32} className="mx-auto mb-2 opacity-50"/>
                                {t('no_tickets')}
                            </td>
                        </tr>
                    ) : (
                        filteredTickets.map((ticket) => (
                            <tr 
                                key={ticket.id} 
                                onClick={() => onSelectTicket(ticket.id)}
                                className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                            >
                                <td className="px-6 py-4 font-mono text-slate-500 group-hover:text-blue-600 font-medium">
                                    {ticket.id}
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-800">
                                    {ticket.subject}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <img src={ticket.customer.avatar} className="w-6 h-6 rounded-full" alt="" />
                                        <div className="flex flex-col">
                                            <span className="text-slate-700 leading-none">{ticket.customer.name}</span>
                                            <span className="text-[10px] text-slate-400 leading-tight mt-0.5">{ticket.customer.company}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {getPriorityBadge(ticket.priority)}
                                </td>
                                <td className="px-6 py-4">
                                    {getStatusBadge(ticket.status)}
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    {ticket.assignee ? (
                                        <div className="flex items-center gap-1.5">
                                            <img src={ticket.assignee.avatar} className="w-5 h-5 rounded-full" alt=""/>
                                            <span>{ticket.assignee.name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 italic text-xs">Unassigned</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right text-slate-500 text-xs">
                                    {ticket.updatedAt.toLocaleDateString()}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default TicketGrid;
