"use client";

/**
 * Dialog de confirmation sobre, maison — remplace `window.confirm` pour les
 * actions destructrices (révocation de clé, suppression de domaine).
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Annuler",
  loading = false,
  danger = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  loading?: boolean;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="w-full max-w-[420px] rounded-2xl border border-white/[0.09] bg-[#0C0D0F] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
        onClick={(event) => event.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <h2
          id="confirm-dialog-title"
          className="mb-2 font-heading text-lg font-semibold text-[#EDEEF0]"
        >
          {title}
        </h2>
        <p className="mb-6 text-[14px] leading-relaxed text-[#9BA1A8] text-pretty">
          {description}
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-white/[0.14] px-4 py-2 text-[13.5px] font-medium text-[#EDEEF0] transition-opacity disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-lg px-4 py-2 text-[13.5px] font-semibold transition-opacity disabled:opacity-60 ${
              danger
                ? "bg-[#E5484D] text-[#FFF5F5]"
                : "bg-[#5B7CFA] text-[#F7F9FF]"
            }`}
          >
            {loading ? "Patientez…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
