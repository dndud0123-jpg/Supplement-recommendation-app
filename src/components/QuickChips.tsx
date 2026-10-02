interface QuickChipsProps {
  onSelect: (text: string) => void;
  disabled?: boolean;
}

const CHIPS = [
  { label: '#만성피로', query: '만성적으로 피곤하고 에너지가 부족해요' },
  { label: '#눈건조', query: '하루종일 모니터 보다보니 눈이 건조하고 침침해요' },
  { label: '#수면장애', query: '잠들기 어렵고 자꾸 깨서 깊이 못 자요' },
  { label: '#소화불량', query: '소화가 잘 안되고 더부룩한 느낌이 자주 들어요' },
  { label: '#면역력강화', query: '환절기마다 감기에 잘 걸리고 면역력이 약한 것 같아요' },
  { label: '#관절건강', query: '무릎과 관절이 시큰거리고 뻣뻣해요' },
  { label: '#피부트러블', query: '피부가 건조하고 트러블이 자주 나요' },
  { label: '#스트레스', query: '스트레스를 많이 받아서 긴장이 안 풀려요' },
];

export default function QuickChips({ onSelect, disabled }: QuickChipsProps) {
  return (
    <div className="px-4 py-3">
      <p className="text-xs text-gray-400 mb-2 font-medium">💡 빠른 증상 선택</p>
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {CHIPS.map((chip) => (
          <button
            key={chip.label}
            onClick={() => onSelect(chip.query)}
            disabled={disabled}
            className="flex-shrink-0 px-3.5 py-2 bg-vita-50 text-vita-700 text-sm font-medium rounded-full 
                       hover:bg-vita-100 active:bg-vita-200 active:scale-95 
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-all duration-150 touch-manipulation"
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}
