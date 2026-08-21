import { MAX_STARS } from '../../../store/build'
import { SectionCard } from '../SectionCard'

export function StarsSection({
  stars,
  onChange,
}: {
  stars: number
  onChange: (n: number) => void
}) {
  const bonusPct = stars * 8
  return (
    <SectionCard
      label="星辰"
      rightSlot={
        <span
          className={`font-mono text-[10px] tabular-nums tracking-[0.04em] ${
            stars > 0 ? 'text-accent-hot' : 'text-faint'
          }`}
        >
          {stars > 0 ? `词缀 +${bonusPct}%` : '无加成'}
        </span>
      }
    >
      <div className="flex items-center gap-1.5">
        {Array.from({ length: MAX_STARS }).map((_, i) => {
          const target = i + 1
          const filled = target <= stars
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(stars === target ? target - 1 : target)}
              aria-label={`${target} 星`}
              className={`text-[20px] leading-none transition-all ${
                filled
                  ? 'text-accent-hot hover:text-[#fff0c4]'
                  : 'text-muted/30 hover:text-accent-hot/50'
              }`}
              style={
                filled
                  ? {
                      textShadow:
                        '0 0 10px rgba(224,184,100,0.45), 0 0 2px rgba(224,184,100,0.6)',
                    }
                  : undefined
              }
            >
              ★
            </button>
          )
        })}
        {stars > 0 && (
          <button
            type="button"
            onClick={() => onChange(0)}
            className="ml-2 rounded-xs border border-border-2 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-faint transition-colors hover:border-stat-red hover:text-stat-red"
          >
            清空
          </button>
        )}
      </div>
      <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] leading-snug text-faint">
        每颗星对用户添加的词缀 +8% — 不含符文之语与「+X 全技能」词缀。
      </p>
    </SectionCard>
  )
}
