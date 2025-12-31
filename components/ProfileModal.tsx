import React, { useState } from 'react';
import { User } from '../types';
import { X, Camera, Github, Slack, Trello, Link2, Unlink } from 'lucide-react';
import { useI18n } from '../i18n';

interface ProfileModalProps {
    user: User;
    onClose: () => void;
    onSave: (updates: Partial<User>) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onSave }) => {
    const { t } = useI18n();
    const [name, setName] = useState(user.name);
    const [avatar, setAvatar] = useState(user.avatar);
    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

    // Mock integrations state
    const [integrations, setIntegrations] = useState([
        { id: 'github', name: 'GitHub', connected: true, icon: Github },
        { id: 'slack', name: 'Slack', connected: false, icon: Slack },
        { id: 'jira', name: 'Jira', connected: false, icon: Trello }, // Using Trello icon as placeholder for Jira
    ]);

    const handleToggleIntegration = (id: string) => {
        setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: !i.connected } : i));
    };

    const handleSave = () => {
        onSave({ name, avatar });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-[500px] animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-slate-800">{t('modal_profile_title')}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={18} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 px-4">
                     <button 
                        onClick={() => setActiveTab('profile')}
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'profile' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                     >
                        {t('tab_profile_general')}
                     </button>
                     <button 
                        onClick={() => setActiveTab('security')}
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'security' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                     >
                        {t('tab_profile_integrations')}
                     </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {activeTab === 'profile' ? (
                        <div className="space-y-6">
                            {/* Avatar */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="relative group">
                                    <img src={avatar} className="w-20 h-20 rounded-full border-4 border-slate-100 shadow-sm object-cover" />
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Camera className="text-white" size={24}/>
                                    </div>
                                </div>
                                <div className="w-full">
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">{t('lbl_avatar')}</label>
                                    <input 
                                        type="text" 
                                        value={avatar}
                                        onChange={(e) => setAvatar(e.target.value)}
                                        className="w-full p-2 text-sm border border-slate-200 rounded-md outline-none focus:border-blue-500 font-mono text-slate-600"
                                    />
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">{t('lbl_nickname')}</label>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-2 text-sm border border-slate-200 rounded-md outline-none focus:border-blue-500 font-medium text-slate-800"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-500 mb-4 bg-blue-50 p-3 rounded border border-blue-100">
                                {t('integration_desc')}
                            </p>
                            {integrations.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded shadow-sm">
                                            <item.icon size={20} className="text-slate-700"/>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800">{item.name}</h4>
                                            <span className={`text-xs flex items-center gap-1 ${item.connected ? 'text-green-600' : 'text-slate-400'}`}>
                                                {item.connected ? t('status_connected') : t('status_disconnected')}
                                            </span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleToggleIntegration(item.id)}
                                        className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-colors ${
                                            item.connected 
                                            ? 'bg-white border border-red-200 text-red-600 hover:bg-red-50' 
                                            : 'bg-white border border-blue-200 text-blue-600 hover:bg-blue-50'
                                        }`}
                                    >
                                        {item.connected ? <Unlink size={12}/> : <Link2 size={12}/>}
                                        {item.connected ? t('btn_disconnect') : t('btn_connect')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium">
                        {t('btn_cancel')}
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 shadow-sm">
                        {t('btn_save')}
                    </button>
                </div>
            </div>
        </div>
    );
};
