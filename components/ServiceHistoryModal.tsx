import React from 'react';
import { ServiceRecord } from '../types';
import { X, FileText } from 'lucide-react';
import { useI18n } from '../i18n';

interface Props {
    record: ServiceRecord;
    onClose: () => void;
}

const ServiceHistoryModal: React.FC<Props> = ({ record, onClose }) => {
    const { t } = useI18n();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-[400px] animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <FileText size={16} className="text-blue-500"/>
                        {t('modal_title')}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <span className="text-xs text-slate-400 block uppercase tracking-wider mb-1">{t('lbl_id')}</span>
                        <span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">{record.id}</span>
                    </div>
                    <div>
                        <span className="text-xs text-slate-400 block uppercase tracking-wider mb-1">{t('lbl_subject')}</span>
                        <p className="text-slate-800 font-medium">{record.summary}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-xs text-slate-400 block uppercase tracking-wider mb-1">{t('lbl_date')}</span>
                            <span className="text-sm text-slate-700">{record.date}</span>
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 block uppercase tracking-wider mb-1">{t('lbl_type')}</span>
                            <span className="text-sm text-slate-700 capitalize">{t(`hist_${record.type}` as any) || record.type}</span>
                        </div>
                    </div>
                    <div>
                        <span className="text-xs text-slate-400 block uppercase tracking-wider mb-1">{t('lbl_resolution')}</span>
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded border border-slate-100">
                             {record.status}. Handled by {record.agent}.
                            <br/><br/>
                            <span className="italic text-slate-400 text-xs">Simulated detailed content log...</span>
                        </p>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-b-lg flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-sm hover:bg-slate-50 font-medium">
                        {t('close_btn')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServiceHistoryModal;