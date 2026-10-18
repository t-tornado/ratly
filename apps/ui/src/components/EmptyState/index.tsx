interface EmptyStateProps {
  message?: string;
}

function EmptyState({ message = "No data to display." }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-64 gap-3 rounded-xl border border-border-default bg-bg-surface-raised px-8 py-12 text-center">
      <p className="text-base font-semibold text-text-primary">Nothing here</p>
      <p className="text-sm text-text-muted max-w-sm">{message}</p>
    </div>
  );
}

export { EmptyState, type EmptyStateProps };
