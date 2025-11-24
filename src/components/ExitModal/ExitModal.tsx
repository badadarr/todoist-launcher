interface ExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reason: string;
  setReason: (reason: string) => void;
}

export const ExitModal = ({ isOpen, onClose, onConfirm, reason, setReason }: ExitModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
        <h3 className="text-xl font-bold mb-2 text-zinc-900">Tunggu Dulu! ✋</h3>
        <p className="text-zinc-600 mb-6 text-sm">
          Tugas belum selesai. Agar tidak jadi kebiasaan buruk (bouncing),
          <span className="font-bold text-black"> catat progress stabil</span> apa yang sudah kamu capai sampai detik ini?
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Contoh: Riset selesai, tinggal coding besok..."
          className="w-full border-2 border-zinc-200 rounded-xl p-4 mb-4 focus:border-black outline-none min-h-[100px] text-sm"
          autoFocus
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-zinc-500 hover:bg-zinc-100 rounded-lg"
          >
            Batal (Lanjut Fokus)
          </button>
          <button
            onClick={onConfirm}
            disabled={!reason.trim() || reason.length < 5}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Catat & Keluar
          </button>
        </div>
      </div>
    </div>
  );
};
