import { X, Lock, AlertTriangle, FileCheck, Clipboard, CheckCircle2, XCircle } from 'lucide-react';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export const AlertDialog = ({ isOpen, onClose, title, content }: AlertDialogProps) => {
  if (!isOpen) return null;

  const getIcon = () => {
    if (title.includes('TERKUNCI')) return <Lock size={20} className="text-red-500" />;
    if (title.includes('BERKURANG') || title.includes('STOP')) return <AlertTriangle size={20} className="text-yellow-500" />;
    if (title.includes('tercatat')) return <FileCheck size={20} className="text-blue-500" />;
    if (title.includes('Tersalin') || title.includes('Laporan')) return <CheckCircle2 size={20} className="text-green-500" />;
    if (title.includes('Gagal') || title.includes('Error')) return <XCircle size={20} className="text-red-500" />;
    return <CheckCircle2 size={20} className="text-blue-500" />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            {getIcon()}
            <h3 className="text-lg font-semibold text-zinc-200">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300"
          >
            <X size={20} />
          </button>
        </div>
        <div className="text-zinc-300 whitespace-pre-line text-sm leading-relaxed">
          {content}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};