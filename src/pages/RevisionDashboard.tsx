import NeuronzDashboard from '@/components/NeuronzDashboard';
import BottomNav from '@/components/BottomNav';

export default function RevisionDashboard() {
  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="nf-safe-area p-4 max-w-5xl mx-auto">
        <NeuronzDashboard />
      </div>
      <BottomNav />
    </div>
  );
}
