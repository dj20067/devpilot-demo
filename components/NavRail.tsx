
import React from 'react';
import { MessageSquare, Ticket, Settings, LogOut, Layers, ClipboardList } from 'lucide-react';
import { useI18n } from '../i18n';

interface NavRailProps {
    activeView: 'chat' | 'my_tickets' | 'all_tickets';
    onChangeView: (view: 'chat' | 'my_tickets' | 'all_tickets') => void;
}

const NavRail: React.FC<NavRailProps> = ({ activeView, onChangeView }) => {
    const { t } = useI18n();

    const NavItem = ({ id, icon: Icon, label }: { id: 'chat' | 'my_tickets' | 'all_tickets', icon: any, label: string }) => (
        <button
            onClick={() => onChangeView(id)}
            className={`w-full flex flex-col items-center gap-1 py-3 transition-all relative group
                ${activeView === id ? 'text-blue-200' : 'text-slate-400 hover:text-slate-100'}
            `}
        >
            <div className={`p-2.5 rounded-xl transition-all ${activeView === id ? 'bg-blue-600 shadow-lg shadow-blue-900/50 text-white' : 'hover:bg-slate-800'}`}>
                <Icon size={22} strokeWidth={activeView === id ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-medium opacity-80 text-center px-1">{label}</span>
            
            {activeView === id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"></div>
            )}
        </button>
    );

    return (
        <div className="w-20 bg-slate-900 flex flex-col items-center py-4 border-r border-slate-800 h-full flex-shrink-0 z-30">
            <div className="mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <span className="font-bold text-white text-lg">D</span>
                </div>
            </div>

            <div className="space-y-2 w-full flex-1 overflow-y-auto no-scrollbar">
                <NavItem id="chat" icon={MessageSquare} label={t('nav_chat')} />
                <div className="w-12 h-px bg-slate-800 mx-auto my-1"></div>
                <NavItem id="my_tickets" icon={Ticket} label={t('nav_my_tickets')} />
                <NavItem id="all_tickets" icon={Layers} label={t('nav_all_tickets')} />
            </div>

            <div className="mt-auto space-y-4 w-full flex flex-col items-center pb-4">
                <button className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
                    <Settings size={20} />
                </button>
            </div>
        </div>
    );
};

export default NavRail;
