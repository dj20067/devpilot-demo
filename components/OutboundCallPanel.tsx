import React, { useState, useEffect, useRef } from 'react';
import { Phone, X, PhoneOff, Delete, GripHorizontal, Link, User as UserIcon, Check } from 'lucide-react';
import { useI18n } from '../i18n';
import { Customer } from '../types';

interface OutboundCallPanelProps {
    onClose: () => void;
    contextCustomer?: Customer; // Injected from the current active session/ticket
}

type CallStage = 'idle' | 'calling' | 'post_call';

const OutboundCallPanel: React.FC<OutboundCallPanelProps> = ({ onClose, contextCustomer }) => {
    const { t } = useI18n();
    const [number, setNumber] = useState('');
    const [callStage, setCallStage] = useState<CallStage>('idle');
    const [associatedCustomer, setAssociatedCustomer] = useState<Customer | undefined>(undefined);
    
    // Position State for Dragging
    const [position, setPosition] = useState({ x: window.innerWidth - 350, y: 80 });
    const dragRef = useRef<{ isDragging: boolean; offsetX: number; offsetY: number }>({ isDragging: false, offsetX: 0, offsetY: 0 });
    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize association based on context
    useEffect(() => {
        if (contextCustomer) {
            setAssociatedCustomer(contextCustomer);
            if (contextCustomer.phone) {
                // Remove formatting for dialer display if needed, keeping simple for now
                setNumber(contextCustomer.phone.replace(/[^\d+*#]/g, ''));
            }
        }
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [contextCustomer]);

    // Dragging Logic
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!dragRef.current.isDragging) return;
            const newX = e.clientX - dragRef.current.offsetX;
            const newY = e.clientY - dragRef.current.offsetY;
            setPosition({ x: newX, y: newY });
        };
        const handleMouseUp = () => {
            if (dragRef.current.isDragging) {
                dragRef.current.isDragging = false;
                document.body.style.userSelect = '';
                document.body.style.cursor = '';
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        dragRef.current.isDragging = true;
        dragRef.current.offsetX = e.clientX - position.x;
        dragRef.current.offsetY = e.clientY - position.y;
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'grabbing';
    };

    // Input Handling
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (/^[0-9*#+\-\s]*$/.test(val)) {
            setNumber(val);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            toggleCall();
        }
    };

    const handleDigit = (digit: string) => {
        if (callStage !== 'idle') return;
        setNumber(prev => prev + digit);
        inputRef.current?.focus();
    };

    const handleDelete = () => {
        if (callStage !== 'idle') return;
        setNumber(prev => prev.slice(0, -1));
        inputRef.current?.focus();
    };

    const toggleCall = () => {
        if (callStage === 'idle') {
            if (!number) return;
            setCallStage('calling');
        } else if (callStage === 'calling') {
            // End Call Logic
            if (associatedCustomer) {
                // If already associated, just close or reset
                // For demo purposes, we close the panel or reset
                setCallStage('idle');
                onClose();
            } else {
                // If not associated, go to post-call
                setCallStage('post_call');
            }
        }
    };

    const removeAssociation = (e: React.MouseEvent) => {
        e.stopPropagation();
        setAssociatedCustomer(undefined);
    };

    const handlePostCallLink = (customer: Customer) => {
        setAssociatedCustomer(customer);
        // Simulate saving linkage
        setTimeout(() => {
            setCallStage('idle');
            onClose();
        }, 500);
    };

    const handleSkip = () => {
        setCallStage('idle');
        onClose();
    };

    const keypad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

    // Post Call View
    if (callStage === 'post_call') {
        return (
            <div 
                className="fixed z-50 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                style={{ left: position.x, top: position.y }}
            >
                <div className="bg-slate-900 text-white p-3 flex justify-between items-center cursor-move" onMouseDown={handleMouseDown}>
                    <span className="font-bold text-sm flex items-center gap-2">
                        <Link size={16} className="text-blue-400"/> {t('call_post_process')}
                    </span>
                </div>
                
                <div className="p-4 bg-white flex-1 flex flex-col">
                    <p className="text-sm text-slate-600 mb-3">{t('call_post_desc')}</p>
                    
                    {/* Search (Simulated) */}
                    <input type="text" placeholder={t('search_placeholder')} className="w-full mb-3 p-2 bg-slate-50 border border-slate-200 rounded text-sm outline-none focus:border-blue-500" />
                    
                    <div className="flex-1 overflow-y-auto space-y-2 mb-4 max-h-48">
                         <span className="text-xs font-bold text-slate-400 uppercase">{t('recent_contacts')}</span>
                         {/* Show context customer if it existed but was cleared, plus some mocks */}
                         {contextCustomer && (
                            <div 
                                onClick={() => handlePostCallLink(contextCustomer)}
                                className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer border border-transparent hover:border-slate-200 transition-colors"
                            >
                                <img src={contextCustomer.avatar} className="w-8 h-8 rounded-full"/>
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-slate-800">{contextCustomer.name}</div>
                                    <div className="text-xs text-slate-500">{contextCustomer.company}</div>
                                </div>
                                <Check size={16} className="text-slate-300"/>
                            </div>
                         )}
                         {/* Mock backup option */}
                         {!contextCustomer && (
                             <div className="p-4 text-center text-xs text-slate-400 italic">No recent contacts found.</div>
                         )}
                    </div>

                    <div className="flex justify-end gap-2 mt-auto">
                        <button onClick={handleSkip} className="text-slate-500 text-xs hover:text-slate-700 px-3 py-2 font-medium">
                            {t('btn_skip')}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div 
            className="fixed z-50 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            style={{ 
                left: position.x, 
                top: position.y,
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1), 0 0 0 1px rgb(0 0 0 / 0.05)'
            }}
        >
            {/* Header */}
            <div 
                className="bg-slate-900 text-white p-3 flex justify-between items-center cursor-move select-none active:cursor-grabbing group"
                onMouseDown={handleMouseDown}
            >
                <span className="font-bold text-sm flex items-center gap-2 pointer-events-none">
                    <GripHorizontal size={16} className="text-slate-500 group-hover:text-slate-300 transition-colors"/> 
                    {t('call_panel_title')}
                </span>
                <button 
                    onClick={onClose} 
                    className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <X size={16} />
                </button>
            </div>

            {/* Display */}
            <div className="bg-slate-50 p-6 flex flex-col items-center justify-center h-28 border-b border-slate-100 relative">
                
                {/* Context Association Pill */}
                {associatedCustomer && callStage !== 'post_call' && (
                    <div className="absolute top-2 bg-blue-50 border border-blue-100 rounded-full pl-1 pr-2 py-0.5 flex items-center gap-1.5 shadow-sm animate-in fade-in slide-in-from-top-1">
                        <img src={associatedCustomer.avatar} className="w-4 h-4 rounded-full"/>
                        <span className="text-[10px] text-blue-700 font-medium max-w-[120px] truncate">
                            {t('call_associated_with')} {associatedCustomer.name}
                        </span>
                        <button 
                            onClick={removeAssociation}
                            className="bg-white rounded-full p-0.5 text-blue-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                            <X size={10} />
                        </button>
                    </div>
                )}

                {callStage === 'calling' ? (
                    <div className="flex flex-col items-center animate-pulse mt-2">
                         <span className="text-2xl font-bold text-slate-800">{number}</span>
                         <span className="text-xs text-green-600 font-medium mt-1">{t('calling_status')}</span>
                    </div>
                ) : (
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={number}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        className="w-full text-center text-2xl font-bold text-slate-800 bg-transparent outline-none tracking-widest placeholder:text-slate-300 placeholder:font-normal mt-2"
                        placeholder={t('call_placeholder')}
                        autoComplete="off"
                    />
                )}
            </div>

            {/* Keypad */}
            <div className="p-4 bg-white grid grid-cols-3 gap-3">
                {keypad.map(key => (
                    <button
                        key={key}
                        onClick={() => handleDigit(key)}
                        disabled={callStage === 'calling'}
                        className="h-10 rounded-lg hover:bg-slate-100 text-slate-700 font-bold text-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:bg-slate-200 active:scale-95 transform duration-75"
                    >
                        {key}
                    </button>
                ))}
            </div>

            {/* Actions */}
            <div className="p-4 pt-0 grid grid-cols-3 gap-3 items-center">
                <div className="col-start-2 flex justify-center">
                    <button 
                        onClick={toggleCall}
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all transform active:scale-95 ${
                            callStage === 'calling' ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-green-500 hover:bg-green-600 shadow-green-200'
                        }`}
                        title={callStage === 'calling' ? t('btn_hangup') : t('btn_call')}
                    >
                        {callStage === 'calling' ? <PhoneOff size={24} /> : <Phone size={24} />}
                    </button>
                </div>
                <div className="col-start-3 flex justify-center">
                    {callStage === 'idle' && number.length > 0 && (
                        <button 
                            onClick={handleDelete}
                            className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                        >
                            <Delete size={20} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OutboundCallPanel;
