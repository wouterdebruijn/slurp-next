export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-6xl mb-4 animate-spin">🍺</div>
      <p className="text-white text-xl font-bold">Loading leaderboard...</p>
    </div>
  );
}
