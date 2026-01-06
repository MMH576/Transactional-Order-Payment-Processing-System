'use client';

interface Props {
  icon: string;
  title: string;
  description: string;
  color?: string;
}

export function FeatureCard({ icon, title, description, color = 'blue' }: Props) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
    red: 'bg-red-50 border-red-200 text-red-600',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-600',
  };

  return (
    <div className={`p-6 rounded-xl border-2 ${colorClasses[color]} transition-transform hover:scale-105`}>
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold text-lg text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
