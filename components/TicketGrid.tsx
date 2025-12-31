import React, { useState } from 'react';
import { Ticket } from '../types';
import { Search, Filter, AlertCircle, Clock, CheckCircle, XCircle, Users, Calendar, ArrowRight, RotateCcw } from 'lucide-react';
import { useI18n } from '../i18n';

interface TicketGridProps {
  tickets: Ticket[];
  onSelectTicket: (ticketId: string) => void;
}

type AssigneeFilter = 'all' | 'unassigned';
type DateFilterType = 'created' | 'updated';

const TicketGrid: React.FC<TicketGridProps> = ({ tickets, onSelectTicket }) => {
  const { t } = useI18n();

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<AssigneeFilter>('all');
  
  // Date Filters State
  const [dateType, setDateType] = useState<DateFilterType>('created');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const resetFilters = () => {
      setSearchTerm('');
      setStatusFilter('all');
      setPriorityFilter('all');
      setAssigneeFilter('all');
      setStartDate('');
      setEndDate('');
      setDateType('created');
  };

  const filteredTickets = tickets.filter(t => {
    // 1. Search Filter (ID, Subject, Customer Name)
    const matchesSearch = searchTerm === '' || 
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    // 2. Status Filter
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;

    // 3. Priority Filter
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

    // 4. Assignee Filter
    if (assigneeFilter === 'unassigned' && t.assignee) return false;
    
    // 5. Date Range Filter
    if (startDate || endDate) {
        const targetDate = dateType === 'created' ? t.createdAt : t.updatedAt;
        // Strip time for simpler day-based comparison or use direct comparison
        // Here we do simple string/timestamp comparison
        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0,0,0,0);
            if (targetDate < start) return false;
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23,59,59,999);
            if (targetDate > end) return false;
        }
    }

    return true;
  });

  // Sort Logic: Unassigned First, then by Updated Date
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    // Priority 1: Unassigned comes first
    if (!a.assignee && b.assignee) return -1;
    if (a.assignee && !b.assignee) return 1;

    // Priority 2: Newest first
    return b.updatedAt.getTime() - a.updatedAt.getTime();
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
      
      {/* 1. Header & Filters Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 space-y-4">
        
        {/* Top Row: Title & Search (Main Primary Actions) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-800">{t('nav_all_tickets')}</h2>
            
            <div className="flex items-center gap-3">
                 <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder={t('ticket_grid_search_placeholder')} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    />
                </div>
            </div>
        </div>

        {/* Second Row: Detailed Filters */}
        <div className="flex flex-wrap items-end gap-3 pt-2">
            
            {/* Status */}
            <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{t('filter_label_status')}</label>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-9 pl-2 pr-8 text-sm bg-white border border-slate-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer min-w-[120px]"
                >
                    <option value="all">{t('ticket_status_all')}</option>
                    <option value="open">{t('ticket_status_open')}</option>
                    <option value="in_progress">{t('ticket_status_in_progress')}</option>
                    <option value="resolved">{t('ticket_status_resolved')}</option>
                    <option value="closed">{t('ticket_status_closed')}</option>
                </select>
            </div>

            {/* Priority */}
            <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{t('filter_label_priority')}</label>
                <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="h-9 pl-2 pr-8 text-sm bg-white border border-slate-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer min-w-[120px]"
                >
                    <option value="all">{t('priority_all')}</option>
                    <option value="low">{t('priority_low')}</option>
                    <option value="medium">{t('priority_medium')}</option>
                    <option value="high">{t('priority_high')}</option>
                    <option value="critical">{t('priority_critical')}</option>
                </select>
            </div>

            {/* Assignee */}
            <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{t('filter_label_assignee')}</label>
                <select
                    value={assigneeFilter}
                    onChange={(e) => setAssigneeFilter(e.target.value as AssigneeFilter)}
                    className="h-9 pl-2 pr-8 text-sm bg-white border border-slate-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer min-w-[140px]"
                >
                    <option value="all">{t('filter_assignee_all')}</option>
                    <option value="unassigned">{t('filter_assignee_unassigned')}</option>
                </select>
            </div>

            <div className="w-px h-8 bg-slate-200 mx-1"></div>

            {/* Date Range Group */}
            <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{t('filter_label_date')}</label>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-md p-1 px-2 h-9">
                    <select 
                        value={dateType}
                        onChange={(e) => setDateType(e.target.value as DateFilterType)}
                        className="text-xs font-medium text-slate-700 bg-transparent border-none outline-none cursor-pointer focus:ring-0 pr-1"
                    >
                        <option value="created">{t('filter_date_created')}</option>
                        <option value="updated">{t('filter_date_updated')}</option>
                    </select>
                    
                    <div className="w-px h-4 bg-slate-200"></div>

                    <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="text-xs text-slate-600 outline-none bg-transparent w-[100px]"
                    />
                    <ArrowRight size={12} className="text-slate-300"/>
                    <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="text-xs text-slate-600 outline-none bg-transparent w-[100px]"
                    />
                </div>
            </div>

            <div className="ml-auto flex items-end">
                <button 
                    onClick={resetFilters}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded transition-colors h-9"
                    title="Reset all filters"
                >
                    <RotateCcw size={14} /> {t('filter_reset')}
                </button>
            </div>
        </div>
      </div>

      {/* 2. Data Table */}
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
                    {sortedTickets.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                <Filter size={32} className="mx-auto mb-2 opacity-50"/>
                                <p className="font-medium">{t('no_tickets')}</p>
                                <p className="text-xs mt-1">Try adjusting your filters</p>
                            </td>
                        </tr>
                    ) : (
                        sortedTickets.map((ticket) => (
                            <tr 
                                key={ticket.id} 
                                onClick={() => onSelectTicket(ticket.id)}
                                className={`cursor-pointer transition-colors group ${
                                    !ticket.assignee ? 'bg-orange-50/30 hover:bg-orange-50' : 'hover:bg-blue-50/50'
                                }`}
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
                                        <span className="text-orange-600 bg-orange-100 border border-orange-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                                            Unassigned
                                        </span>
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