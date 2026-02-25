import React from 'react';

interface StatsCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  colorClass?: string;
  subtitle?: string;
  pendingValue?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, colorClass = 'bg-white' }) => {
  const isTeal = colorClass.includes('#00B894') || colorClass.includes('teal');

  return (
    <div className={`${colorClass} rounded-[2rem] p-8 text-white shadow-xl shadow-teal-900/10 flex flex-col justify-between min-h-[160px] relative overflow-hidden group hover:scale-[1.02] transition-all duration-300`}>
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all opacity-40"></div>

      <div className="relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">{title}</p>
        <h3 className="text-4xl font-black tracking-tight">{value.toLocaleString()}</h3>
      </div>

      <div className="relative z-10 mt-4 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
        <div className="h-full bg-white/40 w-2/3 rounded-full"></div>
      </div>

      {isTeal && (
        <div className="absolute bottom-0 right-0 p-4 opacity-10">
          <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L1 21h22L12 2zm0 3.45L19.1 19H4.9L12 5.45z" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
