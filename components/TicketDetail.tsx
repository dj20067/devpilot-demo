import React, { useState, useEffect } from 'react';
import { Ticket, User, Customer } from '../types';
import { User as UserIcon, Calendar, Tag, AlertTriangle, CheckCircle, Clock, Edit, Save, X, Users, ExternalLink } from 'lucide-react';
import { useI18n } from '../i18n';

interface TicketDetailProps {
  ticket: Ticket | undefined;
  isCreating: boolean;
  currentUser: User;
  onSave: (data: Partial<Ticket>) => void;
  onCancel: () => void;
  onOpenInNewTab?: () => void;
}

const TicketDetail: React.FC<TicketDetailProps> = ({ ticket, isCreating, currentUser, onSave, onCancel, onOpenInNewTab }) => {
  const { t } = useI18n();
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Ticket>>({});

  useEffect(() => {
    if (isCreating) {
        setIsEditing(true);
        setFormData({
            subject: '',
            description: '',
            status: 'open',
            priority: 'medium',
            tags: [],
            cc: [],
            collaborators: [],
            // Defaulting customer to something for demo or null
            // In a real app, you'd pick a customer. We will leave it undefined and rely on context or mock.
        });
    } else if (ticket) {
        setIsEditing(false);
        setFormData({
            ...ticket
        });
    }
  }, [ticket, isCreating]);

  if (!ticket && !isCreating) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-400">
        {t('no_tickets')}
      </div>
    );
  }

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  const getPriorityColor = (p: string) => {
    switch(p) {
        case 'critical': return 'text-red-600 bg-red-50 border-red-200';
        case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
        case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const renderViewMode = () => {
      // Safe guard if ticket is somehow null in view mode
      if (!ticket) return null;

      return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{ticket.id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase border ${getPriorityColor(ticket.priority)}`}>
                            {t(`priority_${ticket.priority}` as any)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {onOpenInNewTab && (
                            <button 
                                onClick={onOpenInNewTab}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                                title={t('btn_open_in_new')}
                            >
                                <ExternalLink size={14} /> <span className="hidden sm:inline">{t('btn_open_in_new')}</span>
                            </button>
                        )}
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                        >
                            <Edit size={14} /> {t('btn_edit')}
                        </button>
                    </div>
                </div>
                
                <h1 className="text-2xl font-bold text-slate-800 mb-2">{ticket.subject}</h1>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                        <UserIcon size={16} />
                        <span>{ticket.customer.name} ({ticket.customer.company})</span>
                    </div>
                    <div className="w-px h-3 bg-slate-300"></div>
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-700">{t('lbl_assignee')}:</span>
                        {ticket.assignee ? (
                            <div className="flex items-center gap-1">
                                <img src={ticket.assignee.avatar} className="w-5 h-5 rounded-full" alt="Assignee" />
                                <span>{ticket.assignee.name}</span>
                            </div>
                        ) : (
                            <span className="italic">Unassigned</span>
                        )}
                    </div>
                    <div className="ml-auto text-sm text-slate-500 flex items-center gap-1">
                        <Clock size={14} /> {ticket.updatedAt.toLocaleDateString()}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-8 flex-1 overflow-y-auto">
                <div className="grid grid-cols-3 gap-6">
                    {/* Left: Description & Activity */}
                    <div className="col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">{t('lbl_desc')}</h3>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {ticket.description}
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wide">Activity Log</h3>
                            <div className="relative pl-4 border-l-2 border-slate-100 space-y-6">
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-0 w-3 h-3 bg-blue-500 rounded-full ring-4 ring-white"></div>
                                    <p className="text-sm text-slate-800 font-medium">Ticket Created</p>
                                    <p className="text-xs text-slate-400">{ticket.createdAt.toLocaleString()}</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-0 w-3 h-3 bg-slate-300 rounded-full ring-4 ring-white"></div>
                                    <p className="text-sm text-slate-800 font-medium">Status changed to <span className="uppercase">{ticket.status.replace('_', ' ')}</span></p>
                                    <p className="text-xs text-slate-400">{ticket.updatedAt.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Meta */}
                    <div className="space-y-4">
                         {/* Participants Section */}
                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                            <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase flex items-center gap-1">
                                <Users size={12}/> Participants
                            </h3>
                            
                            <div className="space-y-3">
                                <div>
                                    <span className="text-xs text-slate-500 block mb-1">{t('lbl_cc')}</span>
                                    {ticket.cc && ticket.cc.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {ticket.cc.map(u => (
                                                <div key={u.id} className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded text-xs">
                                                    <img src={u.avatar} className="w-3 h-3 rounded-full"/>
                                                    <span>{u.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <span className="text-xs text-slate-400 italic">None</span>}
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500 block mb-1">{t('lbl_collaborators')}</span>
                                    {ticket.collaborators && ticket.collaborators.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {ticket.collaborators.map(u => (
                                                <div key={u.id} className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded text-xs">
                                                    <img src={u.avatar} className="w-3 h-3 rounded-full"/>
                                                    <span>{u.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <span className="text-xs text-slate-400 italic">None</span>}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                            <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase">{t('lbl_tags')}</h3>
                            <div className="flex flex-wrap gap-2">
                                {ticket.tags.map(tag => (
                                    <span key={tag} className="flex items-center gap-1 text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                                        <Tag size={12} /> {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <h3 className="text-sm font-bold text-blue-800 mb-2">AI Summary</h3>
                            <p className="text-xs text-blue-700 leading-relaxed">
                                This ticket seems related to a known issue in the database connection pool configuration. Suggested knowledge base article: KB-9021.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  const renderEditMode = () => {
    return (
        <div className="flex flex-col h-full bg-slate-50/50">
             {/* Header */}
             <div className="bg-white border-b border-slate-200 px-8 py-6">
                 <div className="flex items-center justify-between mb-6">
                     <span className="text-sm font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                         {isCreating ? 'NEW' : ticket?.id}
                     </span>
                     <div className="flex items-center gap-2">
                         <button 
                             onClick={() => {
                                 if (isCreating) onCancel();
                                 else setIsEditing(false);
                             }}
                             className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                         >
                             <X size={14} /> {t('btn_cancel')}
                         </button>
                         <button 
                             onClick={handleSave}
                             className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                         >
                             <Save size={14} /> {t('btn_save')}
                         </button>
                     </div>
                 </div>

                 <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">{t('lbl_subject')}</label>
                     <input 
                         type="text" 
                         value={formData.subject || ''}
                         onChange={(e) => setFormData({...formData, subject: e.target.value})}
                         className="w-full text-2xl font-bold text-slate-800 border-b-2 border-slate-200 focus:border-blue-500 focus:outline-none bg-transparent py-1 transition-colors"
                         placeholder="Enter ticket subject..."
                     />
                 </div>
             </div>

             {/* Form Content */}
             <div className="p-8 flex-1 overflow-y-auto">
                 <div className="grid grid-cols-3 gap-6">
                     <div className="col-span-2 space-y-6">
                         {/* Description */}
                         <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                             <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">{t('lbl_desc')}</label>
                             <textarea 
                                 value={formData.description || ''}
                                 onChange={(e) => setFormData({...formData, description: e.target.value})}
                                 className="w-full h-64 p-3 text-slate-700 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none leading-relaxed"
                                 placeholder="Detailed description of the issue..."
                             />
                         </div>
                     </div>

                     <div className="space-y-4">
                         {/* Properties */}
                         <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4">
                             <div>
                                 <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">{t('lbl_priority')}</label>
                                 <select 
                                     value={formData.priority || 'low'}
                                     onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                                     className="w-full p-2 text-sm border border-slate-200 rounded-md bg-white outline-none focus:border-blue-500"
                                 >
                                     <option value="low">Low</option>
                                     <option value="medium">Medium</option>
                                     <option value="high">High</option>
                                     <option value="critical">Critical</option>
                                 </select>
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">{t('lbl_status')}</label>
                                 <select 
                                     value={formData.status || 'open'}
                                     onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                                     className="w-full p-2 text-sm border border-slate-200 rounded-md bg-white outline-none focus:border-blue-500"
                                 >
                                     <option value="open">Open</option>
                                     <option value="in_progress">In Progress</option>
                                     <option value="resolved">Resolved</option>
                                     <option value="closed">Closed</option>
                                 </select>
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">{t('lbl_assignee')}</label>
                                 <select 
                                     value={formData.assignee?.id || ''}
                                     onChange={(e) => {
                                         // Mock assignment: if value is current user id, set it, else null
                                         if (e.target.value === currentUser.id) {
                                            setFormData({...formData, assignee: currentUser});
                                         } else {
                                             setFormData({...formData, assignee: undefined});
                                         }
                                     }}
                                     className="w-full p-2 text-sm border border-slate-200 rounded-md bg-white outline-none focus:border-blue-500"
                                 >
                                     <option value="">Unassigned</option>
                                     <option value={currentUser.id}>{currentUser.name} (Me)</option>
                                 </select>
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">{t('lbl_tags')}</label>
                                <input 
                                    type="text" 
                                    value={formData.tags?.join(', ') || ''}
                                    onChange={(e) => setFormData({...formData, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                                    className="w-full p-2 text-sm border border-slate-200 rounded-md outline-none focus:border-blue-500"
                                    placeholder="e.g. Bug, UI (comma separated)"
                                />
                             </div>
                             {/* Simplified CC/Collaborator Editing (Just listing functionality for demo) */}
                             <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">{t('lbl_cc')}</label>
                                <div className="text-xs text-slate-400 italic p-2 border border-slate-100 rounded bg-slate-50">
                                    User selection not implemented in demo.
                                </div>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>
        </div>
    );
  };

  return isEditing ? renderEditMode() : renderViewMode();
};

export default TicketDetail;