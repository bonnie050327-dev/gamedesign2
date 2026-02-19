
import React from 'react';

interface StatsProps {
  morale: number;
  progress: number;
  conflict: number;
}

const ProgressBar = ({ label, value, color, icon }: { label: string, value: number, color: string, icon: string }) => (
  <div className="flex-1 min-w-[120px]">
    <div className="flex items-center justify-between mb-1 text-xs font-semibold text-gray-600 uppercase">
      <span><i className={`${icon} mr-1`}></i> {label}</span>
      <span>{value}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`${color} h-2 rounded-full transition-all duration-500`} 
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      ></div>
    </div>
  </div>
);

export const Stats: React.FC<StatsProps> = ({ morale, progress, conflict }) => {
  return (
    <div className="bg-white border-b p-4 shadow-sm flex flex-wrap gap-4 sticky top-0 z-10">
      <ProgressBar 
        label="Team Morale" 
        value={morale} 
        color="bg-emerald-500" 
        icon="fas fa-smile"
      />
      <ProgressBar 
        label="Project Progress" 
        value={progress} 
        color="bg-blue-500" 
        icon="fas fa-tasks"
      />
      <ProgressBar 
        label="Conflict Level" 
        value={conflict} 
        color="bg-rose-500" 
        icon="fas fa-fire"
      />
    </div>
  );
};
