import { Settings, Pill, ListChecks } from 'lucide-react';

interface TopNavProps {
  routineCount: number;
  onOpenApiKey: () => void;
  onOpenRoutine: () => void;
}

export default function TopNav({ routineCount, onOpenApiKey, onOpenRoutine }: TopNavProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-vita-500 rounded-lg flex items-center justify-center">
          <Pill className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-900 leading-tight">VitaMobile AI</h1>
          <p className="text-[10px] text-gray-400 leading-tight">맞춤 영양제 어드바이저</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onOpenRoutine}
          className="relative p-2.5 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
          aria-label="내 루틴"
        >
          <ListChecks className="w-5 h-5 text-gray-600" />
          {routineCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] bg-vita-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {routineCount}
            </span>
          )}
        </button>
        <button
          onClick={onOpenApiKey}
          className="p-2.5 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
          aria-label="API 키 설정"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </header>
  );
}
