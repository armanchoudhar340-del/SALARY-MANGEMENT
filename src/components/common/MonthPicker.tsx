import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { formatMonthName } from '../../lib/utils';

interface MonthPickerProps {
  value: string; // 'YYYY-MM'
  onChange: (monthStr: string) => void;
}

export const MonthPicker: React.FC<MonthPickerProps> = ({ value, onChange }) => {
  const [yearStr, monthStr] = value.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const handlePrev = () => {
    let newYear = year;
    let newMonth = month - 1;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    onChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleNext = () => {
    let newYear = year;
    let newMonth = month + 1;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    onChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  return (
    <div className="inline-flex items-center bg-white/90 backdrop-blur-md border border-purple-200/80 rounded-xl p-0.5 sm:p-1 shadow-sm">
      <button
        onClick={handlePrev}
        title="Previous Month"
        className="p-1 sm:p-1.5 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>

      <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-0.5 sm:py-1">
        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 hidden xs:inline" />
        <span className="text-xs sm:text-sm font-semibold text-slate-800 tracking-tight min-w-[76px] sm:min-w-[110px] text-center">
          {formatMonthName(value)}
        </span>
      </div>

      <button
        onClick={handleNext}
        title="Next Month"
        className="p-1 sm:p-1.5 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-colors"
      >
        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
    </div>
  );
};
