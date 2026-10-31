interface ErrorDisplayProps {
  error: string;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className="bg-blood/20 border-3 border-blood rounded-2xl p-4 animate-shake">
      <p className="text-red-200 text-sm font-medium">💀 {error}</p>
    </div>
  );
}
