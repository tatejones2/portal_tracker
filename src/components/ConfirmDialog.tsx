type Props = {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export const ConfirmDialog = ({ open, title, body, confirmLabel = 'Confirm', onCancel, onConfirm }: Props) => {
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation">
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <h2 id="dialog-title">{title}</h2>
        <p>{body}</p>
        <div className="button-row">
          <button className="button ghost" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="button danger" type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
