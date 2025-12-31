import React from 'react';
import { X } from 'lucide-react';
import { useI18n } from '../i18n';

interface ModalProps {
    title: string;
    onClose: () => void;
    onSubmit: (data?: any) => void;
    children: React.ReactNode;
}

const BaseModal: React.FC<ModalProps> = ({ title, onClose, onSubmit, children }) => {
    const { t } = useI18n();
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-[400px] animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-4">
                    {children}
                </div>
                <div className="p-4 bg-slate-50 rounded-b-lg flex justify-end gap-2">
                    <button onClick={onClose} className="px-3 py-1.5 text-slate-600 hover:text-slate-800 text-sm font-medium">
                        {t('btn_cancel')}
                    </button>
                    <button onClick={() => onSubmit()} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">
                        {t('btn_submit')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const NoteModal: React.FC<{ onClose: () => void; onSubmit: (note: string) => void }> = ({ onClose, onSubmit }) => {
    const { t } = useI18n();
    const inputRef = React.useRef<HTMLTextAreaElement>(null);
    return (
        <BaseModal title={t('modal_note_title')} onClose={onClose} onSubmit={() => onSubmit(inputRef.current?.value || '')}>
            <textarea 
                ref={inputRef}
                className="w-full h-32 p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none outline-none"
                placeholder={t('modal_note_placeholder')}
            />
        </BaseModal>
    );
};

export const TransferModal: React.FC<{ onClose: () => void; onSubmit: (agent: string) => void }> = ({ onClose, onSubmit }) => {
    const { t } = useI18n();
    const selectRef = React.useRef<HTMLSelectElement>(null);
    return (
        <BaseModal title={t('modal_transfer_title')} onClose={onClose} onSubmit={() => onSubmit(selectRef.current?.value || '')}>
            <label className="block text-xs text-slate-500 mb-1">{t('modal_transfer_select')}</label>
            <select ref={selectRef} className="w-full p-2 border border-slate-200 rounded text-sm outline-none bg-white">
                <option value="Lin Xiao">林晓 (RPA 专家)</option>
                <option value="Wang Qiang">王强 (云架构团队)</option>
                <option value="Queue: Tier 2">队列: L2 技术支持</option>
            </select>
        </BaseModal>
    );
};

export const TicketModal: React.FC<{ onClose: () => void; onSubmit: (data: any) => void }> = ({ onClose, onSubmit }) => {
    const { t } = useI18n();
    return (
        <BaseModal title={t('modal_ticket_title')} onClose={onClose} onSubmit={() => onSubmit({})}>
             <div className="space-y-3">
                <div>
                    <label className="block text-xs text-slate-500 mb-1">{t('modal_ticket_subject')}</label>
                    <input type="text" className="w-full p-2 border border-slate-200 rounded text-sm outline-none" placeholder="e.g. Bug in module X" />
                </div>
                <div>
                    <label className="block text-xs text-slate-500 mb-1">{t('modal_ticket_desc')}</label>
                    <textarea className="w-full h-24 p-2 border border-slate-200 rounded text-sm resize-none outline-none" />
                </div>
             </div>
        </BaseModal>
    );
};