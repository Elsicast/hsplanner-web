import { computeEhp, formatEhp, type DamageType } from '../../utils/build/ehp'
import { rangedMax } from '../../utils/item/stats'
import type { RangedValue } from '../../types'
import { BDLine, BDSection } from './statPrimitives'

interface EhpBreakdownProps {
  stats: Record<string, RangedValue>
  statsCombined: Record<string, RangedValue>
}

const TYPE_COLOR: Record<DamageType, string> = {
  physical: 'text-muted',
  fire: 'text-stat-red',
  cold: 'text-stat-blue',
  lightning: 'text-stat-orange',
  poison: 'text-stat-green',
  arcane: 'text-stat-purple',
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function EhpBreakdown({ stats, statsCombined }: EhpBreakdownProps) {
  const merged = { ...stats, ...statsCombined }
  const { entries, worst } = computeEhp(merged)

  if (entries.length === 0) {
    return (
      <div className="py-2 text-center text-xs text-muted italic">
        添加生命与防御属性后可查看有效生命。
      </div>
    )
  }

  const life = Math.round(rangedMax(merged['life'] ?? 0))

  return (
    <>
      <BDLine
        label="生命"
        value={
          <span className="text-stat-red">{life.toLocaleString('en-US')}</span>
        }
      />
      <div className="mt-1 md:columns-2" style={{ columnGap: '2rem' }}>
        {entries.map((entry) => {
          const weakest = worst?.type === entry.type
          return (
            <div
              key={entry.type}
              className="break-inside-avoid"
              style={{ breakInside: 'avoid' }}
            >
              <BDSection
                titleClass={TYPE_COLOR[entry.type]}
                title={
                  weakest
                    ? `${capitalize(entry.type)} · 最弱`
                    : capitalize(entry.type)
                }
              >
                <BDLine
                  label="eHP"
                  value={
                    <span
                      className={weakest ? 'text-stat-red' : 'text-accent-hot'}
                    >
                      {formatEhp(entry.ehp)}
                    </span>
                  }
                />
                {entry.layers.length === 0 ? (
                  <BDLine indent label="无减伤" value="—" />
                ) : (
                  entry.layers.map((layer) => (
                    <BDLine
                      key={layer.label}
                      indent
                      label={layer.label}
                      value={`${layer.pct}%`}
                    />
                  ))
                )}
              </BDSection>
            </div>
          )
        })}
      </div>
    </>
  )
}
