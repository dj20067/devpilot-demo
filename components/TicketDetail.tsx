import React, { useState, useEffect, useRef } from 'react';
import { Ticket, User, Customer, TicketEvent } from '../types';
import { User as UserIcon, Calendar, Tag, AlertTriangle, CheckCircle, Clock, Edit, Save, X, Users, ExternalLink, Archive, Send, Lock, Globe, Paperclip, Video, FileCode, Smile, Workflow, Trash2 } from 'lucide-react';
import { useI18n } from '../i18n';

interface TicketDetailProps {
  ticket: Ticket | undefined;
  isCreating: boolean;
  currentUser: User;
  onSave: (data: Partial<Ticket>) => void;
  onCancel: () => void;
  onOpenInNewTab?: () => void;
}

const RPASnippetViewer: React.FC<{ dslString: string }> = ({ dslString }) => {
    const { t } = useI18n();
    let steps = [];
    let flowName = "Unknown Flow";
    try {
        const dsl = JSON.parse(dslString);
        steps = dsl.steps || [];
        flowName = dsl.flowName || flowName;
    } catch (e) {
        return <div className="text-red-500 text-xs p-2 border border-red-200 rounded bg-red-50">Invalid RPA DSL Data</div>;
    }

    return (
        <div className="my-3 border border-slate-300 rounded-lg overflow-hidden bg-slate-50 shadow-sm max-w-md">
            <div className="bg-slate-800 px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Workflow size={14} className="text-blue-400"/>
                    <span className="text-xs font-bold text-white tracking-wide">{t('rpa_snippet')}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{flowName}</span>
            </div>
            <div className="p-4 space-y-0 relative">
                 {/* Connector Line */}
                <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-slate-200 z-0"></div>

                {steps.map((step: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 relative z-10 mb-3 last:mb-0">
                         {/* Node Dot */}
                         <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 shadow-sm bg-white shrink-0 ${
                             idx === 0 ? 'border-green-500 text-green-700' : 
                             idx === steps.length - 1 ? 'border-red-500 text-red-700' : 
                             'border-blue-400 text-blue-600'
                         }`}>
                             {idx + 1}
                         </div>
                         
                         {/* Card */}
                         <div className="flex-1 bg-white p-2.5 rounded border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-default group">
                             <div className="flex justify-between items-center mb-1">
                                 <span className="font-bold text-xs text-slate-700">{step.action}</span>
                                 {step.parent && <span className="text-[10px] text-slate-400">Parent: {step.parent}</span>}
                             </div>
                             <div className="text-[10px] text-slate-500 font-mono bg-slate-50 p-1 rounded border border-slate-100 truncate">
                                 {JSON.stringify(step.params || step.message || step.target || step.error || {})}
                             </div>
                         </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const TicketDetail: React.FC<TicketDetailProps> = ({ ticket, isCreating, currentUser, onSave, onCancel, onOpenInNewTab }) => {
  const { t } = useI18n();
  const [isEditing, setIsEditing] = useState(false);
  
  // View State
  const [commTab, setCommTab] = useState<'internal' | 'customer'>('internal');
  const [commInput, setCommInput] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<any[]>([]);

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
            timeline: []
        });
    } else if (ticket) {
        setIsEditing(false);
        setFormData({ ...ticket });
    }
    setPendingAttachments([]);
    setCommInput('');
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

  const handleArchive = () => {
      // 1. Update status to resolved
      // 2. Add system message to timeline
      const newEvent: TicketEvent = {
          id: `evt-${Date.now()}`,
          ticketId: ticket!.id,
          sender: 'SYSTEM',
          content: t('system_msg_archive'),
          type: 'public_reply',
          createdAt: new Date()
      };
      
      onSave({ 
          status: 'resolved',
          timeline: [...(ticket!.timeline || []), newEvent]
      });
  };

  const handleSendComment = () => {
      if (!commInput.trim() && pendingAttachments.length === 0) return;
      
      const newEvent: TicketEvent = {
          id: `evt-${Date.now()}`,
          ticketId: ticket!.id,
          sender: currentUser,
          content: commInput,
          type: commTab === 'internal' ? 'internal_note' : 'public_reply',
          attachments: pendingAttachments,
          createdAt: new Date()
      };

      onSave({
          timeline: [...(ticket!.timeline || []), newEvent]
      });
      setCommInput('');
      setPendingAttachments([]);
  };

  const handleUploadRpa = () => {
      // Simulate uploading a file
      const mockDsl = JSON.stringify({
        flowName: "Inserted_Snippet_v2",
        steps: [
          { action: "Browser.Open", target: "https://example.com" },
          { action: "Input.SetText", target: "#username", params: { value: "admin" } },
          { action: "Input.Click", target: "#login-btn" }
        ]
      });
      
      const newAttachment = {
          name: "login_flow_v2.rpa",
          type: 'rpa_dsl',
          content: mockDsl
      };
      setPendingAttachments([...pendingAttachments, newAttachment]);
  };

  const removeAttachment = (idx: number) => {
      setPendingAttachments(pendingAttachments.filter((_, i) => i !== idx));
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
      if (!ticket) return null;
      const timeline = ticket.timeline || [];
      const internalEvents = timeline.filter(e => e.type === 'internal_note');
      const publicEvents = timeline.filter(e => e.type === 'public_reply' || e.type === 'system_log');
      
      const activeEvents = commTab === 'internal' ? internalEvents : publicEvents;

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
                        {ticket.status === 'resolved' && (
                            <span className="text-xs px-2 py-0.5 rounded font-bold uppercase border bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
                                <CheckCircle size={12}/> {t('ticket_status_resolved')}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {ticket.status !== 'resolved' && (
                            <button 
                                onClick={handleArchive}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                            >
                                <Archive size={14} /> {t('btn_archive')}
                            </button>
                        )}
                        {onOpenInNewTab && (
                            <button 
                                onClick={onOpenInNewTab}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                                title={t('btn_open_in_new')}
                            >
                                <ExternalLink size={14} /> 
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

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
                <div className="grid grid-cols-12 gap-6 h-full">
                    {/* Main Column: Description & Communication */}
                    <div className="col-span-8 flex flex-col gap-6">
                        
                        {/* 1. Description Section (Rich Content) */}
                        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide flex items-center justify-between">
                                {t('lbl_desc')}
                                <div className="flex gap-2">
                                    <Paperclip size={14} className="text-slate-400"/>
                                    <Video size={14} className="text-slate-400"/>
                                </div>
                            </h3>
                            <div className="text-slate-700 leading-relaxed whitespace-pre-wrap font-sans text-sm">
                                {ticket.description}
                            </div>
                            {/* Render RPA DSL if present in description */}
                            {ticket.descriptionRpaDsl && (
                                <RPASnippetViewer dslString={ticket.descriptionRpaDsl} />
                            )}
                        </div>

                        {/* 2. Communication Area */}
                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col flex-1 min-h-[500px]">
                            {/* Comm Tabs */}
                            <div className="flex border-b border-slate-200">
                                <button 
                                    onClick={() => setCommTab('internal')}
                                    className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                                        commTab === 'internal' 
                                            ? 'border-yellow-400 bg-yellow-50 text-yellow-800' 
                                            : 'border-transparent text-slate-500 hover:bg-slate-50'
                                    }`}
                                >
                                    <Lock size={14} /> {t('tab_comm_internal')}
                                </button>
                                <button 
                                    onClick={() => setCommTab('customer')}
                                    className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                                        commTab === 'customer' 
                                            ? 'border-blue-500 bg-blue-50 text-blue-800' 
                                            : 'border-transparent text-slate-500 hover:bg-slate-50'
                                    }`}
                                >
                                    <Globe size={14} /> {t('tab_comm_customer')}
                                </button>
                            </div>

                            {/* Banner */}
                            <div className={`px-4 py-2 text-xs text-center border-b ${
                                commTab === 'internal' ? 'bg-yellow-100/50 text-yellow-800 border-yellow-100' : 'bg-blue-100/50 text-blue-800 border-blue-100'
                            }`}>
                                {commTab === 'internal' ? t('comm_internal_banner') : t('comm_customer_banner')}
                            </div>

                            {/* Message List */}
                            <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${commTab === 'internal' ? 'bg-yellow-50/30' : 'bg-white'}`}>
                                {activeEvents.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                                            {commTab === 'internal' ? <Lock size={20}/> : <Globe size={20}/>}
                                        </div>
                                        <span className="text-xs">No records yet.</span>
                                    </div>
                                ) : (
                                    activeEvents.map((evt) => {
                                        const isSystem = typeof evt.sender === 'string';
                                        const senderName = isSystem ? 'System' : (evt.sender as any).name;
                                        const senderAvatar = isSystem ? '' : (evt.sender as any).avatar;
                                        const isMe = !isSystem && (evt.sender as any).id === currentUser.id;

                                        if (isSystem) {
                                            return (
                                                <div key={evt.id} className="flex justify-center my-2">
                                                    <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full border border-slate-200">
                                                        {evt.content}
                                                    </span>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div key={evt.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                                <img src={senderAvatar} className="w-8 h-8 rounded-full border border-slate-200" alt=""/>
                                                <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                                    <div className="flex items-baseline gap-2 mb-1">
                                                        <span className="text-xs font-bold text-slate-700">{senderName}</span>
                                                        <span className="text-[10px] text-slate-400">{evt.createdAt.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                                    </div>
                                                    <div className={`p-3 text-sm rounded-lg shadow-sm border ${
                                                        isMe 
                                                            ? (commTab === 'internal' ? 'bg-yellow-100 border-yellow-200 text-slate-800' : 'bg-blue-600 text-white border-blue-600') 
                                                            : 'bg-white border-slate-200 text-slate-800'
                                                    }`}>
                                                        {evt.content}
                                                        
                                                        {/* Render Attachments */}
                                                        {evt.attachments && evt.attachments.map((att, i) => (
                                                            <div key={i} className="mt-2">
                                                                {att.type === 'rpa_dsl' && att.content && (
                                                                    <RPASnippetViewer dslString={att.content} />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-white border-t border-slate-200">
                                {pendingAttachments.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2 p-2 bg-slate-50 border border-slate-100 rounded">
                                        {pendingAttachments.map((att, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-slate-200 text-xs shadow-sm">
                                                <Workflow size={12} className="text-blue-500"/>
                                                <span className="font-mono text-slate-700">{att.name}</span>
                                                <button onClick={() => removeAttachment(i)} className="text-slate-400 hover:text-red-500"><X size={12}/></button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className={`border rounded-lg p-2 focus-within:ring-2 transition-all ${
                                    commTab === 'internal' 
                                        ? 'border-yellow-200 focus-within:ring-yellow-400/30 bg-yellow-50/20' 
                                        : 'border-slate-200 focus-within:ring-blue-500/20 bg-slate-50/20'
                                }`}>
                                    <div className="flex gap-2 mb-2 px-1">
                                         <button className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100" title="Attach File"><Paperclip size={16}/></button>
                                         <button 
                                            className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 flex items-center gap-1 transition-colors"
                                            title={t('btn_insert_rpa')}
                                            onClick={handleUploadRpa}
                                         >
                                            <Workflow size={16}/> 
                                         </button>
                                         <button className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100" title="Insert Emoji"><Smile size={16}/></button>
                                    </div>
                                    <textarea 
                                        value={commInput}
                                        onChange={(e) => setCommInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if(e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendComment();
                                            }
                                        }}
                                        className="w-full bg-transparent border-none focus:ring-0 outline-none resize-none text-sm min-h-[60px]"
                                        placeholder={commTab === 'internal' ? t('comm_placeholder_internal') : t('comm_placeholder_customer')}
                                    />
                                    <div className="flex justify-end mt-1">
                                        <button 
                                            onClick={handleSendComment}
                                            disabled={!commInput.trim() && pendingAttachments.length === 0}
                                            className={`px-4 py-1.5 rounded text-xs font-bold text-white flex items-center gap-1.5 transition-colors ${
                                                commTab === 'internal' 
                                                    ? 'bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400' 
                                                    : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
                                            }`}
                                        >
                                            {t('send_btn')} <Send size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Column: Meta Info */}
                    <div className="col-span-4 space-y-4">
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
                             {/* Optional RPA DSL Edit (Simplified) */}
                             <div className="mt-4 pt-4 border-t border-slate-100">
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">RPA DSL (JSON)</label>
                                <textarea 
                                    value={formData.descriptionRpaDsl || ''}
                                    onChange={(e) => setFormData({...formData, descriptionRpaDsl: e.target.value})}
                                    className="w-full h-24 p-3 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded-md resize-none"
                                    placeholder='{"steps": [...] }'
                                />
                             </div>
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