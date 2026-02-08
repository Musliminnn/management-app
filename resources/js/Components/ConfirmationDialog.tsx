import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

type DialogType = 'confirm' | 'approve' | 'reject' | 'delete' | 'info';

interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    type?: DialogType;
    confirmText?: string;
    cancelText?: string;
    processing?: boolean;
}

const dialogConfig: Record<
    DialogType,
    {
        icon: React.ReactNode;
        iconBg: string;
        confirmBg: string;
        confirmHover: string;
    }
> = {
    confirm: {
        icon: <Info className="h-6 w-6 text-blue-600" />,
        iconBg: 'bg-blue-100',
        confirmBg: 'bg-blue-600',
        confirmHover: 'hover:bg-blue-700',
    },
    approve: {
        icon: <CheckCircle className="h-6 w-6 text-green-600" />,
        iconBg: 'bg-green-100',
        confirmBg: 'bg-green-600',
        confirmHover: 'hover:bg-green-700',
    },
    reject: {
        icon: <XCircle className="h-6 w-6 text-red-600" />,
        iconBg: 'bg-red-100',
        confirmBg: 'bg-red-600',
        confirmHover: 'hover:bg-red-700',
    },
    delete: {
        icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
        iconBg: 'bg-red-100',
        confirmBg: 'bg-red-600',
        confirmHover: 'hover:bg-red-700',
    },
    info: {
        icon: <Info className="h-6 w-6 text-gray-600" />,
        iconBg: 'bg-gray-100',
        confirmBg: 'bg-gray-600',
        confirmHover: 'hover:bg-gray-700',
    },
};

export default function ConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'confirm',
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    processing = false,
}: ConfirmationDialogProps) {
    if (!isOpen) return null;

    const config = dialogConfig[type];

    const handleConfirm = () => {
        onConfirm();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div
                className="w-full max-w-md transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with Icon */}
                <div className="flex flex-col items-center px-6 pt-6">
                    <div
                        className={`flex h-14 w-14 items-center justify-center rounded-full ${config.iconBg}`}
                    >
                        {config.icon}
                    </div>
                    <h3 className="mt-4 text-center text-lg font-semibold text-gray-900">
                        {title}
                    </h3>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={processing}
                        className={`flex flex-1 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${config.confirmBg} ${config.confirmHover}`}
                    >
                        {processing ? (
                            <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                Memproses...
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
