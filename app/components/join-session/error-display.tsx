interface ErrorDisplayProps {
  error: string;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className="bg-red-50 border-3 border-red-300 rounded-2xl p-4 animate-shake">
      <p className="text-red-600 text-sm font-medium">⚠️ {error}</p>
    </div>
  );
}
