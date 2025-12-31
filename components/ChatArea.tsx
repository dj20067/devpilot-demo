import React, { useState, useRef, useEffect } from 'react';
import { Session, Message, User, ConsultationForm } from '../types';
import { Send, Paperclip, Smile, Reply, Trash2, X, MoreHorizontal, FileText, ArrowRightLeft, Ticket, Power, Clock, CheckCircle, AlertCircle, ArrowLeft, Info, Image as ImageIcon, Phone, ClipboardList } from 'lucide-react';
import { useI18n } from '../i18n';
import { NoteModal, TransferModal, TicketModal } from './ActionModals';

interface ChatAreaProps {
  session: Session | undefined;
  messages: Message[];
  currentUser: User;
  onSendMessage: (text: string, type?: Message['type'], metadata?: any) => void;
  onDeleteMessage: (msgId: string) => void;
  // Callback to update a message content (for card interaction)
  onUpdateMessage?: (msgId: string, updates: Partial<Message>) => void;
  // Mobile handlers
  onBack?: () => void;
  onToggleContext?: () => void;
  onOutboundCall?: (number: string) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({ session, messages, currentUser, onSendMessage, onDeleteMessage, onUpdateMessage, onBack, onToggleContext, onOutboundCall }) => {
  const [inputText, setInputText] = useState('');
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  
  // Modal States
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      const metadata = replyTo ? { replyToId: replyTo.id } : {};
      onSendMessage(inputText, 'text', metadata);
      setInputText('');
      setReplyTo(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEndSessionRequest = () => {
      // Send a system message that acts as the card
      onSendMessage('System: End Session Request', 'system_end_confirmation', { endConfirmationStatus: 'pending' });
  };

  const handleSystemMessageSubmit = (text: string) => {
      onSendMessage(text, 'system');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const metadata = {
        fileName: file.name,
        fileUrl: url,
        ...(replyTo ? { replyToId: replyTo.id } : {})
      };
      onSendMessage(file.name, 'file', metadata);
      // Reset value so same file can be selected again if needed
      e.target.value = '';
      setReplyTo(null);
    }
  };

  const isImageFile = (fileName?: string) => {
    return /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(fileName || '');
  };

  // Helper to render message content with phone numbers processing
  const renderMessageWithContentProcessing = (content: string, isMe: boolean) => {
      // 1. Split by Code Blocks (triple backticks)
      const blocks = content.split(/(```[\s\S]*?```)/g);
    
      return blocks.map((block, blockIndex) => {
          if (block.startsWith('```') && block.endsWith('```')) {
              const code = block.slice(3, -3).replace(/^\n/, '');
              return (
                  <div key={blockIndex} className="my-2 rounded-lg overflow-hidden border border-slate-700 shadow-sm relative bg-slate-800">
                     <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/50 border-b border-slate-700">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                     </div>
                     <div className="p-3 overflow-x-auto">
                          <code className="text-xs font-mono text-slate-200 whitespace-pre">{code}</code>
                     </div>
                  </div>
              );
          }
        
          // Process text blocks line by line (to handle Lists and Newlines)
          return (
              <div key={blockIndex} className="whitespace-pre-wrap"> 
                  {block.split('\n').map((line, lineIndex) => {
                      // Check for List Item (e.g. "- item" or "* item")
                      const listMatch = line.match(/^(\s*)([-*])\s+(.+)$/);
                      if (listMatch) {
                         return (
                             <div key={lineIndex} className="flex items-start gap-2 pl-2 my-0.5">
                                 <span className="opacity-60 mt-1.5 w-1.5 h-1.5 rounded-full bg-current shrink-0"></span>
                                 <span className="flex-1 min-w-0">{formatInline(listMatch[3], isMe, onOutboundCall)}</span>
                             </div>
                         );
                      }
                      
                      // Normal text line
                      if (line === '') {
                          return <div key={lineIndex} className="h-[1em]"></div>;
                      }

                      return (
                          <div key={lineIndex}>
                              {formatInline(line, isMe, onOutboundCall)}
                          </div>
                      );
                  })}
              </div>
          );
      });
  };

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-400 flex-col">
        <MoreHorizontal size={48} className="mb-4 opacity-20" />
        <p>{t('select_session')}</p>
      </div>
    );
  }

  const getQuotedMessageContent = (id: string | undefined) => {
    if (!id) return null;
    const msg = messages.find(m => m.id === id);
    if (!msg) return t('msg_withdrawn');
    return msg.type === 'file' ? `[File] ${msg.fileName}` : msg.content;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header with Actions */}
      <div className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 shadow-sm z-10">
        <div className="flex items-center gap-3">
            {/* Mobile Back Button */}
            {onBack && (
                <button onClick={onBack} className="md:hidden p-1 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full">
                    <ArrowLeft size={20} />
                </button>
            )}
            
            <h2 className="font-bold text-slate-800 text-base md:text-lg truncate max-w-[120px] md:max-w-none">{session.customer.name}</h2>
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium hidden sm:inline">
                {session.customer.tier}
            </span>
            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block"></div>
            <div className="text-sm text-slate-500 hidden sm:block">
             {t('ticket_prefix')} #{session.id.split('-')[1]}
            </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-1 md:gap-2">
            <ActionButton icon={FileText} label={t('action_note')} onClick={() => setShowNoteModal(true)} />
            <ActionButton icon={ArrowRightLeft} label={t('action_transfer')} onClick={() => setShowTransferModal(true)} />
            <ActionButton icon={Ticket} label={t('action_ticket')} onClick={() => setShowTicketModal(true)} />
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            <ActionButton icon={Power} label={t('action_end')} onClick={handleEndSessionRequest} variant="danger" />
            
            {/* Mobile Context Toggle */}
            {onToggleContext && (
                <button 
                    onClick={onToggleContext} 
                    className="md:hidden ml-2 p-2 text-slate-500 hover:bg-slate-100 rounded-full"
                >
                    <Info size={20} />
                </button>
            )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            
            // Render System Messages (Notes, Transfer Logs, etc)
            if (msg.type === 'system') {
                return (
                    <div key={msg.id} className="flex justify-center my-4">
                        <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full border border-slate-200 text-center max-w-[90%]">
                            {msg.content}
                        </span>
                    </div>
                );
            }

            // Render End Confirmation Card
            if (msg.type === 'system_end_confirmation') {
                return (
                    <EndConfirmationCard 
                        key={msg.id} 
                        message={msg} 
                        onUpdate={(updates) => onUpdateMessage && onUpdateMessage(msg.id, updates)} 
                    />
                );
            }

            // Render Consultation Form Card
            if (msg.type === 'consultation_card') {
                return (
                    <ConsultationCard 
                        key={msg.id}
                        form={msg.consultationData || session.consultationForm}
                        onCall={onOutboundCall}
                    />
                );
            }

            if (msg.isDeleted) {
                return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className="bg-slate-100 text-slate-400 text-xs py-1 px-3 rounded-full italic border border-slate-200">
                            {t('msg_withdrawn')}
                        </div>
                    </div>
                )
            }

            return (
                <div key={msg.id} className={`group flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                    {!isMe && (
                        <img src={session.customer.avatar} className="w-8 h-8 rounded-full border border-slate-200 mb-1" alt="Avatar"/>
                    )}
                    
                    <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {/* Quote Display */}
                        {msg.replyToId && (
                            <div className={`mb-1 text-xs p-2 rounded-md border-l-2 bg-white/50 text-slate-500 ${isMe ? 'border-blue-300' : 'border-slate-300'}`}>
                                <div className="font-bold mb-0.5">{t('replying_to')}:</div>
                                <div className="line-clamp-1 italic">{getQuotedMessageContent(msg.replyToId)}</div>
                            </div>
                        )}

                        {/* Bubble */}
                        <div className={`relative px-4 py-3 text-sm shadow-sm
                            ${isMe 
                                ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
                                : 'bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-tl-sm'
                            }
                        `}>
                            {msg.type === 'file' ? (
                                <div className="flex flex-col gap-2">
                                    {isImageFile(msg.fileName) && (
                                        <div className="mt-1 rounded-lg overflow-hidden border border-black/10 bg-black/5 max-w-[240px]">
                                            <img 
                                                src={msg.fileUrl} 
                                                alt={msg.fileName} 
                                                className="w-full h-auto max-h-[200px] object-contain"
                                                loading="lazy"
                                            />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 min-w-[200px]">
                                        <div className={`p-2 rounded ${isMe ? 'bg-white/20' : 'bg-slate-100'}`}>
                                            {isImageFile(msg.fileName) ? (
                                                <ImageIcon size={24} className={isMe ? 'text-white' : 'text-slate-500'} />
                                            ) : (
                                                <FileText size={24} className={isMe ? 'text-white' : 'text-slate-500'} />
                                            )}
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="font-medium underline cursor-pointer truncate max-w-[160px]" title={msg.fileName}>{msg.fileName}</span>
                                            <a 
                                                href={msg.fileUrl} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className={`text-xs mt-0.5 hover:underline ${isMe ? 'text-blue-100' : 'text-blue-500'}`}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {t('download')}
                                            </a> 
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                renderMessageWithContentProcessing(msg.content, isMe)
                            )}
                            
                            {/* Message Tools (Hover) */}
                            <div className={`absolute top-0 ${isMe ? '-left-16' : '-right-16'} h-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                                <button 
                                    onClick={() => setReplyTo(msg)}
                                    className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-100 rounded-full hover:bg-blue-50 transition-colors"
                                    title="Reply"
                                >
                                    <Reply size={14} />
                                </button>
                                {isMe && (
                                    <button 
                                        onClick={() => onDeleteMessage(msg.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-600 bg-slate-100 rounded-full hover:bg-red-50 transition-colors"
                                        title="Withdraw"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        {/* Time */}
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                            {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>

                    {isMe && (
                        <img src={currentUser.avatar} className="w-8 h-8 rounded-full border border-slate-200 mb-1" alt="My Avatar"/>
                    )}
                </div>
            );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange}
        />
        {replyTo && (
             <div className="flex items-center justify-between bg-slate-50 p-2 rounded-t-md border-b border-slate-100 text-xs text-slate-600 mb-2">
                <span className="truncate">{t('replying_to')}: <span className="font-medium italic">"{replyTo.content}"</span></span>
                <button onClick={() => setReplyTo(null)} className="text-slate-400 hover:text-slate-600">
                    <X size={14} />
                </button>
            </div>
        )}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <div className="flex gap-2 mb-2 px-2 pt-1">
                 <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-200 transition-colors"
                 >
                     <Paperclip size={18} />
                 </button>
                 <button className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-200 transition-colors">
                     <Smile size={18} />
                 </button>
            </div>
            <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('type_placeholder')}
                className="w-full bg-transparent border-none focus:ring-0 resize-none text-sm text-slate-700 max-h-32 min-h-[60px]"
            />
            <div className="flex justify-between items-center px-2 pb-1">
                <span className="text-xs text-slate-400 hidden sm:inline">{t('markdown_support')}</span>
                <button 
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                    className="ml-auto bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {t('send_btn')} <Send size={14} />
                </button>
            </div>
        </div>
      </div>

      {/* Modals */}
      {showNoteModal && (
          <NoteModal 
            onClose={() => setShowNoteModal(false)} 
            onSubmit={(note) => { 
                handleSystemMessageSubmit(`${t('toast_note_saved')}: ${note.substring(0, 20)}...`); 
                setShowNoteModal(false); 
            }} 
          />
      )}
      {showTransferModal && (
          <TransferModal 
            onClose={() => setShowTransferModal(false)} 
            onSubmit={(agent) => { 
                handleSystemMessageSubmit(`${t('toast_transferred')} -> ${agent}`); 
                setShowTransferModal(false); 
            }} 
          />
      )}
      {showTicketModal && (
          <TicketModal 
            onClose={() => setShowTicketModal(false)} 
            onSubmit={() => { 
                handleSystemMessageSubmit(`${t('toast_ticket_created')} #Ticket-${Math.floor(Math.random()*10000)}`); 
                setShowTicketModal(false); 
            }} 
          />
      )}
    </div>
  );
};

// --- Helper Functions for Markdown & Phone Rendering ---

const formatInline = (text: string, isMe: boolean, onCall?: (n: string) => void) => {
    // 0. Detect Phone Numbers first (Format: +86 138-0000-0001 or general 11 digit)
    // Regex matches the specific mock format or general Chinese mobile
    const phoneRegex = /(\+86\s\d{3}-\d{4}-\d{4})|(\d{3}-\d{4}-\d{4})/g;

    const parts = text.split(phoneRegex);
    
    return parts.map((part, index) => {
        if (!part) return null;

        if (part.match(phoneRegex)) {
            return (
                <span key={`phone-${index}`} className="inline-flex items-center gap-1 align-baseline mx-1">
                    <span className="underline decoration-slate-300">{part}</span>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onCall && onCall(part); }}
                        className={`p-0.5 rounded-full hover:bg-black/10 transition-colors ${isMe ? 'text-white' : 'text-green-600'}`}
                        title={`Call ${part}`}
                    >
                        <Phone size={12} className="fill-current"/>
                    </button>
                </span>
            )
        }

        // Standard formatting for non-phone parts
        return formatTextStyles(part, isMe, index);
    });
};

const formatTextStyles = (text: string, isMe: boolean, prefixKey: number) => {
    // 1. Split by Inline Code
    const parts = text.split(/(`[^`]+`)/g);
    return parts.map((part, index) => {
        if (part.startsWith('`') && part.endsWith('`')) {
            return (
                <code key={`${prefixKey}-${index}`} className={`px-1.5 py-0.5 rounded text-xs font-mono mx-0.5 align-middle border ${
                     isMe 
                     ? 'bg-blue-800 text-blue-50 border-blue-700' 
                     : 'bg-slate-100 text-pink-600 border-slate-200'
                }`}>
                    {part.slice(1, -1)}
                </code>
            );
        }
        
        // 2. Handle Bold and Italic
        // Split by Bold (**text**)
        const subParts = part.split(/(\*\*[^*]+\*\*)/g);
        return subParts.map((subPart, j) => {
            if (subPart.startsWith('**') && subPart.endsWith('**')) {
                return <strong key={`${prefixKey}-${index}-${j}`} className="font-bold">{subPart.slice(2, -2)}</strong>;
            }
            // Split by Italic (*text*)
            const subSubParts = subPart.split(/(\*[^*]+\*)/g);
             return subSubParts.map((s, k) => {
                 if (s.startsWith('*') && s.endsWith('*')) {
                     return <em key={`${prefixKey}-${index}-${j}-${k}`} className="italic">{s.slice(1, -1)}</em>;
                 }
                 return s;
             });
        });
    });
};

// --- Sub Components ---

const ActionButton: React.FC<{ icon: any, label: string, onClick: () => void, variant?: 'default' | 'danger' }> = ({ icon: Icon, label, onClick, variant = 'default' }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center px-2 md:px-3 py-1 rounded-lg transition-colors gap-1
            ${variant === 'danger' 
                ? 'text-red-500 hover:bg-red-50' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
            }`}
        title={label}
    >
        <Icon size={18} />
        <span className="hidden md:inline text-[10px] font-medium leading-none">{label}</span>
    </button>
);

const ConsultationCard: React.FC<{ form: ConsultationForm, onCall?: (n: string) => void }> = ({ form, onCall }) => {
    const { t } = useI18n();
    return (
        <div className="flex justify-center my-6 w-full animate-in slide-in-from-top-4 fade-in">
            <div className="w-full max-w-sm bg-slate-50 border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-2">
                    <ClipboardList size={16} className="text-slate-500"/>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('consultation_card_title')}</span>
                </div>
                <div className="p-4 space-y-3">
                    <div>
                         <div className="flex items-center gap-2 mb-1">
                             <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">{form.productModule}</span>
                             <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-600 border border-slate-300">{form.environment}</span>
                         </div>
                         <p className="text-sm text-slate-800 leading-relaxed">
                             {form.description}
                         </p>
                    </div>
                    
                    <div className="pt-3 border-t border-slate-200">
                        {form.phone ? (
                             <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-200">
                                 <div>
                                     <span className="text-[10px] text-slate-400 block uppercase">{t('lbl_phone_provided')}</span>
                                     <span className="text-sm font-mono font-medium text-slate-700">{form.phone}</span>
                                 </div>
                                 <button 
                                    onClick={() => onCall && onCall(form.phone!)}
                                    className="p-1.5 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors border border-green-200"
                                    title="Call now"
                                 >
                                     <Phone size={14} className="fill-current"/>
                                 </button>
                             </div>
                        ) : (
                            <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-100">
                                <AlertCircle size={14} />
                                <span>{t('lbl_no_phone_provided')}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

const EndConfirmationCard: React.FC<{ message: Message, onUpdate: (updates: Partial<Message>) => void }> = ({ message, onUpdate }) => {
    const { t } = useI18n();
    const [secondsLeft, setSecondsLeft] = useState(60);
    const status = message.endConfirmationStatus || 'pending';

    useEffect(() => {
        if (status !== 'pending') return;

        if (secondsLeft <= 0) {
            onUpdate({ endConfirmationStatus: 'solved' });
            return;
        }

        const timer = setInterval(() => {
            setSecondsLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [secondsLeft, status, onUpdate]);

    const handleAction = (newStatus: 'solved' | 'unsolved') => {
        if (status !== 'pending') return;
        onUpdate({ endConfirmationStatus: newStatus });
    };

    // Visual variants based on status
    const getStatusStyles = () => {
        switch(status) {
            case 'solved': return {
                borderColor: 'border-green-200',
                headerBg: 'bg-green-50',
                headerText: 'text-green-800',
                ring: '',
                icon: <CheckCircle size={18} className="text-green-600" />
            };
            case 'unsolved': return {
                borderColor: 'border-orange-200',
                headerBg: 'bg-orange-50',
                headerText: 'text-orange-800',
                ring: '',
                icon: <AlertCircle size={18} className="text-orange-600" />
            };
            default: return { // pending
                borderColor: 'border-blue-200',
                headerBg: 'bg-blue-50',
                headerText: 'text-blue-800',
                ring: 'ring-4 ring-blue-50/50',
                icon: <Clock size={18} className="text-blue-600 animate-pulse" />
            };
        }
    };

    const styles = getStatusStyles();
    const progress = (secondsLeft / 60) * 100;

    return (
        <div className="flex justify-center my-6 w-full animate-in slide-in-from-bottom-2 fade-in">
            <div className={`w-80 rounded-lg border shadow-sm overflow-hidden bg-white transition-all duration-300 ${styles.borderColor} ${styles.ring}`}>
                {/* Header */}
                <div className={`px-4 py-3 border-b ${styles.headerBg} flex items-center justify-between`}>
                    <span className={`text-sm font-bold ${styles.headerText}`}>{t('end_card_title')}</span>
                    {styles.icon}
                </div>

                {/* Content */}
                <div className="p-4">
                    <p className="text-sm text-slate-600 mb-4 text-center font-medium">
                        {status === 'pending' 
                            ? t('end_card_desc')
                            : status === 'solved' 
                                ? t('end_status_solved')
                                : t('end_status_unsolved')
                        }
                    </p>

                    {status === 'pending' && (
                        <>
                            <div className="flex gap-3 mb-4">
                                <button 
                                    onClick={() => handleAction('solved')}
                                    className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-md hover:bg-blue-700 transition-colors shadow-sm hover:shadow active:scale-[0.98] transform duration-100"
                                >
                                    {t('btn_solved')}
                                </button>
                                <button 
                                    onClick={() => handleAction('unsolved')}
                                    className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-md hover:bg-slate-50 transition-colors shadow-sm hover:shadow active:scale-[0.98] transform duration-100"
                                >
                                    {t('btn_unsolved')}
                                </button>
                            </div>
                            
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-[10px] text-slate-400 font-medium px-0.5">
                                    <span>{t('auto_confirm_hint').split('{seconds}')[0]}</span>
                                    <span className="text-blue-600 font-bold">{secondsLeft}s</span>
                                </div>
                                <div className="bg-slate-100 rounded-full h-1.5 overflow-hidden w-full">
                                    <div 
                                        className="h-full bg-blue-500 transition-all duration-1000 ease-linear rounded-full" 
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatArea;