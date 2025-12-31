import React, { useState } from 'react';
import { Session, UserRole, User, ServiceRecord, Customer } from '../types';
import { Info, User as UserIcon, History, ShieldAlert, ExternalLink, Calendar, MapPin, Briefcase, Phone } from 'lucide-react';
import ServiceHistoryModal from './ServiceHistoryModal';
import { useI18n } from '../i18n';

interface RightSidebarProps {
  session: Session | undefined;
  currentUser: User;
  history: ServiceRecord[];
  onOutboundCall?: (number: string, customer?: Customer) => void;
}

type TabType = 'session' | 'customer' | 'history' | 'more';

const RightSidebar: React.FC<RightSidebarProps> = ({ session, currentUser, history, onOutboundCall }) => {
  const [activeTab, setActiveTab] = useState<TabType>('session');
  const [selectedRecord, setSelectedRecord] = useState<ServiceRecord | null>(null);
  const { t } = useI18n();

  if (!session) {
    return <div className="w-full h-full bg-white border-l border-slate-200 p-4 text-center text-slate-400 text-sm">{t('no_active_session')}</div>;
  }

  const customer = session.customer;

  const renderSessionInfo = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Form Data */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('sect_form')}</h3>
        <div className="space-y-3">
             <div>
                <span className="text-xs text-slate-500 block">{t('lbl_module')}</span>
                <span className="text-sm font-medium text-slate-800">{session.consultationForm.productModule}</span>
             </div>
             <div>
                <span className="text-xs text-slate-500 block">{t('lbl_env')}</span>
                <span className="text-sm font-medium text-slate-800">{session.consultationForm.environment}</span>
             </div>
             <div>
                <span className="text-xs text-slate-500 block">{t('lbl_version')}</span>
                <span className="text-sm font-medium text-slate-800">{session.consultationForm.version}</span>
             </div>
             <div>
                <span className="text-xs text-slate-500 block">{t('lbl_desc')}</span>
                <p className="text-sm text-slate-800 mt-1 bg-white p-2 rounded border border-slate-100">
                    {session.consultationForm.description}
                </p>
             </div>
        </div>
      </div>

      {/* Session Stats */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('sect_metrics')}</h3>
        <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white border border-slate-100 rounded shadow-sm">
                <span className="text-xs text-slate-500 block mb-1">{t('lbl_status')}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 capitalize">
                    {t(`status_${session.status}` as any) || session.status}
                </span>
            </div>
            <div className="p-3 bg-white border border-slate-100 rounded shadow-sm">
                <span className="text-xs text-slate-500 block mb-1">{t('lbl_duration')}</span>
                <span className="text-sm font-mono text-slate-700">{session.duration}</span>
            </div>
            <div className="p-3 bg-white border border-slate-100 rounded shadow-sm">
                <span className="text-xs text-slate-500 block mb-1">{t('lbl_source')}</span>
                <span className="text-sm text-slate-700">{session.source}</span>
            </div>
            <div className="p-3 bg-white border border-slate-100 rounded shadow-sm">
                <span className="text-xs text-slate-500 block mb-1">{t('lbl_handler')}</span>
                <span className="text-sm text-slate-700">{currentUser.name}</span>
            </div>
        </div>
      </div>
    </div>
  );

  const renderCustomerInfo = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col items-center py-4 border-b border-slate-100">
         <img src={customer.avatar} alt="Profile" className="w-20 h-20 rounded-full mb-3 border-4 border-slate-50" />
         <h2 className="text-lg font-bold text-slate-800">{customer.name}</h2>
         <p className="text-sm text-slate-500">{customer.company}</p>
      </div>

      <div className="space-y-4">
        <InfoRow label={t('lbl_tenant')} value={customer.tenantType} />
        <InfoRow label={t('lbl_account')} value={customer.accountType} />
        <InfoRow label={t('lbl_tier')} value={customer.tier} badge />
        <InfoRow 
            label={t('lbl_contact')} 
            value={customer.phone} 
            action={onOutboundCall && customer.phone ? () => onOutboundCall(customer.phone, customer) : undefined}
        />
        <InfoRow label={t('lbl_email')} value={customer.email} />
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="animate-in fade-in duration-300 space-y-3">
        {history.map(rec => (
            <div 
                key={rec.id} 
                onClick={() => setSelectedRecord(rec)}
                className="p-3 border border-slate-100 rounded hover:bg-slate-50 cursor-pointer transition-colors group"
            >
                <div className="flex justify-between items-start mb-1">
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        rec.type === 'chat' ? 'bg-blue-100 text-blue-700' :
                        rec.type === 'ticket' ? 'bg-purple-100 text-purple-700' :
                        'bg-orange-100 text-orange-700'
                    }`}>{t(`hist_${rec.type}` as any)}</span>
                    <span className="text-xs text-slate-400">{rec.date}</span>
                </div>
                <h4 className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors mb-1">
                    {rec.summary}
                </h4>
                <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>{rec.agent}</span>
                    <span className={`${rec.status === 'Resolved' || rec.status === '已解决' ? 'text-green-600' : 'text-slate-400'}`}>
                        {rec.status}
                    </span>
                </div>
            </div>
        ))}
    </div>
  );

  const renderMoreInfo = () => {
    if (currentUser.role !== UserRole.ADMIN) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center p-4">
                <ShieldAlert size={32} className="mb-2 text-red-300" />
                <p className="text-sm font-medium text-slate-600">{t('access_restricted')}</p>
                <p className="text-xs">{t('access_restricted_desc')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in duration-300">
             <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-4 rounded-lg shadow-md">
                 <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">{t('enterprise_insights')}</h3>
                 
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded">
                            <Briefcase size={16} className="text-blue-300" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 block">{t('lbl_cert')}</span>
                            <span className="text-sm font-medium">{customer.certificateLevel}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded">
                            <MapPin size={16} className="text-green-300" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 block">{t('lbl_region')}</span>
                            <span className="text-sm font-medium">{customer.region}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded">
                            <Calendar size={16} className="text-purple-300" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 block">{t('lbl_signed')}</span>
                            <span className="text-sm font-medium">{customer.signedYear}</span>
                        </div>
                    </div>
                 </div>
             </div>

             <div className="border-t border-slate-100 pt-4 space-y-3">
                <InfoRow label={t('lbl_partner')} value={customer.partnershipType} />
                <InfoRow label={t('lbl_cust_status')} value={customer.customerStatus} />
                <InfoRow label={t('lbl_service_grp')} value={customer.serviceGroup} />
             </div>
        </div>
    );
  };

  const tabs = [
    { id: 'session', icon: Info, label: t('tab_session') },
    { id: 'customer', icon: UserIcon, label: t('tab_profile') },
    { id: 'history', icon: History, label: t('tab_history') },
    { id: 'more', icon: ExternalLink, label: t('tab_more') },
  ];

  return (
    <>
        <div className="flex flex-col h-full bg-white border-l border-slate-200 w-full">
        {/* Tabs */}
        <div className="flex border-b border-slate-200">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`flex-1 py-3 flex justify-center items-center border-b-2 transition-colors ${
                            activeTab === tab.id 
                            ? 'border-blue-500 text-blue-600' 
                            : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                        }`}
                        title={tab.label}
                    >
                        <Icon size={18} />
                    </button>
                )
            })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'session' && renderSessionInfo()}
            {activeTab === 'customer' && renderCustomerInfo()}
            {activeTab === 'history' && renderHistory()}
            {activeTab === 'more' && renderMoreInfo()}
        </div>
        </div>

        {/* Modal */}
        {selectedRecord && (
            <ServiceHistoryModal 
                record={selectedRecord} 
                onClose={() => setSelectedRecord(null)} 
            />
        )}
    </>
  );
};

const InfoRow = ({ label, value, badge = false, action }: { label: string, value: string | undefined, badge?: boolean, action?: () => void }) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
        <span className="text-xs text-slate-500">{label}</span>
        <div className="flex items-center gap-2">
            {badge ? (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">{value}</span>
            ) : (
                <span className="text-sm text-slate-800 font-medium truncate max-w-[150px]">{value || '-'}</span>
            )}
            {action && (
                <button 
                    onClick={action} 
                    className="p-1 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                    title="Call"
                >
                    <Phone size={14} className="fill-current" />
                </button>
            )}
        </div>
    </div>
);

export default RightSidebar;