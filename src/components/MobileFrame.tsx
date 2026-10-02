import type { ReactNode } from 'react';

interface MobileFrameProps {
  children: ReactNode;
}

export default function MobileFrame({ children }: MobileFrameProps) {
  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-200 sm:py-4">
      <div className="w-full max-w-md min-h-screen sm:min-h-0 sm:h-[812px] bg-white sm:rounded-3xl sm:shadow-2xl overflow-hidden flex flex-col relative">
        {children}
      </div>
    </div>
  );
}
