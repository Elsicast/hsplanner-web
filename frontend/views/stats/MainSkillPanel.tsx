import { DAMAGE_COLORS, skillHeroBg } from '../../utils/damageColors'
import { effectiveSkillCost } from './effectiveSkillCost'
import { visibleEffectiveSkillTags } from '../../utils/skills/skillTags'
import { useBuild } from '../../store/build'
import type {
  AttackSkillDamageBreakdown,
  SkillDamageBreakdown,
  WeaponDamageBreakdown,
} from '../../utils/item/stats'
import type {
  AttributeKey,
  RangedStatMap,
  RangedValue,
  Skill,
} from '../../types'
import { formatDecimal, formatRange, useFormatRangeInt } from './statFormat'
import { BDLine, BDSection, HeroStat, Panel } from './statPrimitives'
import { DamageBreakdown } from './DamageBreakdown'
import { AttackDamageBreakdown } from './AttackDamageBreakdown'

export function MainSkillSection({
  mainSkill,
  mainSkillRank,
  attributes,
  skillRanksByName,
  skillsByNormalizedName,
  rankBonuses,
  skillBreakdown,
  stats,
  mcrRange,
  paidInLifeRange,
  weaponDamage,
  attackDamage,
}: {
  mainSkill: Skill | null
  mainSkillRank: number
  attributes: Record<AttributeKey, RangedValue>
  skillRanksByName: Record<string, number>
  skillsByNormalizedName: Record<string, Skill>
  rankBonuses: Record<string, [number, number]>
  // Recomputing this locally would lose the skill-scoped subtree values, the
  // conversions and the element break that only the engine assembles.
  skillBreakdown: SkillDamageBreakdown | null
  stats: RangedStatMap
  mcrRange: RangedValue
  paidInLifeRange: RangedValue
  weaponDamage: WeaponDamageBreakdown | null
  attackDamage: AttackSkillDamageBreakdown | null
}) {
  // Attack skills first: their combined numbers already include the elemental
  // part, so they are the fuller breakdown when both exist.
  if (mainSkill && attackDamage) {
    return (
      <Panel title="主技能" meta={`${mainSkill.name}`}>
        <AttackSkillHero skill={mainSkill} breakdown={attackDamage} />
        <AttackDamageBreakdown
          skill={mainSkill}
          breakdown={attackDamage}
          currentRank={mainSkillRank}
          attributes={attributes}
          skillRanksByName={skillRanksByName}
          skillsByNormalizedName={skillsByNormalizedName}
          rankBonuses={rankBonuses}
        />
      </Panel>
    )
  }

  if (mainSkill && skillBreakdown) {
    return (
      <Panel
        title="主技能"
        meta={`${mainSkill.name}`}
      >
        <SkillDamageHero
          skill={mainSkill}
          breakdown={skillBreakdown}
          stats={stats}
          mcrRange={mcrRange}
          paidInLifeRange={paidInLifeRange}
        />
        <DamageBreakdown
          skill={mainSkill}
          breakdown={skillBreakdown}
          currentRank={mainSkillRank}
          attributes={attributes}
          skillRanksByName={skillRanksByName}
          skillsByNormalizedName={skillsByNormalizedName}
          rankBonuses={rankBonuses}
        />
      </Panel>
    )
  }

  if (weaponDamage && weaponDamage.hasWeapon) {
    return (
      <Panel
        title="主技能"
        meta={
          mainSkill
            ? `${mainSkill.name} · 无伤害`
            : '未选择主技能 · 显示武器伤害'
        }
      >
        <DamageHero breakdown={weaponDamage} />
        <DamageBuildup breakdown={weaponDamage} />
      </Panel>
    )
  }
  return (
    <Panel title="主技能" meta="无主技能或武器">
      <div className="py-6 text-center text-xs text-muted italic">
        在技能页签选择主技能，或装备一件武器，即可在此查看核心伤害构成。
      </div>
    </Panel>
  )
}

function AttackSkillHero({
  skill,
  breakdown,
}: {
  skill: Skill
  breakdown: AttackSkillDamageBreakdown
}) {
  const formatRangeInt = useFormatRangeInt()
  const b = breakdown
  const subskillRanks = useBuild((s) => s.subskillRanks)
  const tagView = visibleEffectiveSkillTags(skill, subskillRanks)
  const accentBg = skill.damageType
    ? skillHeroBg(skill.damageType)
    : 'linear-gradient(135deg, rgba(224,184,100,0.06), transparent 60%)'
  const hasElemental = b.poisonHitMax > 0
  return (
    <div
      className="mb-3 grid grid-cols-1 overflow-hidden rounded-[3px] border border-border md:grid-cols-[1.2fr_1fr]"
      style={{ background: accentBg }}
    >
      <div className="border-b border-border px-4 py-3.5 md:border-b-0 md:border-r">
        <div className="mb-1.5 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-faint">
          <span>平均命中</span>
          {skill.damageType && (
            <span
              className={`rounded-xs border px-1.5 py-px text-[9px] font-semibold ${DAMAGE_COLORS[skill.damageType].pill}`}
            >
              {skill.damageType}
            </span>
          )}
        </div>
        <div
          className="font-mono text-[28px] font-semibold leading-none tabular-nums tracking-[0.01em] text-accent-hot"
          style={{ textShadow: '0 0 16px rgba(224,184,100,0.18)' }}
        >
          {formatRangeInt(Math.round(b.combinedAvgMin), Math.round(b.combinedAvgMax))}
        </div>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono text-[10px] tracking-widest text-muted">
          <span>
            DPS{' '}
            <span className="text-accent-hot">
              {formatRangeInt(Math.round(b.dpsMin), Math.round(b.dpsMax))}
            </span>
          </span>
          <span>
            <span className="text-text/90">
              {formatRange(b.attacksPerSecondMin, b.attacksPerSecondMax)}
            </span>{' '}
            次攻击/秒
          </span>
          {(tagView.tags.length > 0 || tagView.removed.length > 0) && (
            <div className="flex flex-wrap gap-1">
              {tagView.tags.map((tag) => (
                <span
                  key={tag}
                  title={tagView.added.has(tag) ? '由子技能添加' : undefined}
                  className={`rounded-xs border px-1.5 py-px text-[9px] font-semibold uppercase tracking-[0.14em] text-accent-hot ${
                    tagView.added.has(tag)
                      ? 'border-accent-hot/80'
                      : 'border-accent-deep/50'
                  }`}
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(58,46,24,0.4), rgba(42,36,24,0.2))',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5 px-4 py-3.5">
        <HeroStat
          k="命中伤害"
          v={formatRangeInt(b.combinedHitMin, b.combinedHitMax)}
        />
        <HeroStat
          k="攻击伤害"
          v={`${formatRange(b.weaponDamagePctMin, b.weaponDamagePctMax)}%`}
        />
        <HeroStat
          k="物理命中"
          v={formatRangeInt(b.physicalHitMin, b.physicalHitMax)}
        />
        <HeroStat
          k="元素命中"
          v={hasElemental ? formatRangeInt(b.poisonHitMin, b.poisonHitMax) : '—'}
        />
      </div>
    </div>
  )
}

function SkillDamageHero({
  skill,
  breakdown,
  stats,
  mcrRange,
  paidInLifeRange,
}: {
  skill: Skill
  breakdown: SkillDamageBreakdown
  stats: RangedStatMap
  mcrRange: RangedValue
  paidInLifeRange: RangedValue
}) {
  const formatRangeInt = useFormatRangeInt()
  const hasCrit = breakdown.critChance > 0
  const {
    effectiveManaMin,
    effectiveManaMax,
    lifeCostMin,
    lifeCostMax,
    effectiveCastRateMin,
    effectiveCastRateMax,
  } = effectiveSkillCost(
    skill,
    mcrRange,
    stats.faster_cast_rate ?? 0,
    paidInLifeRange,
    Math.max(1, breakdown.effectiveRankMin),
    Math.max(1, breakdown.effectiveRankMax),
  )
  const accentBg = skill.damageType
    ? skillHeroBg(skill.damageType)
    : 'linear-gradient(135deg, rgba(224,184,100,0.06), transparent 60%)'
  const subskillRanks = useBuild((s) => s.subskillRanks)
  const tagView = visibleEffectiveSkillTags(skill, subskillRanks)
  return (
    <div
      className="mb-3 grid grid-cols-1 overflow-hidden rounded-[3px] border border-border md:grid-cols-[1.2fr_1fr]"
      style={{ background: accentBg }}
    >
      <div className="border-b border-border px-4 py-3.5 md:border-b-0 md:border-r">
        <div className="mb-1.5 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-faint">
          <span>{hasCrit ? '平均单击' : '单击伤害'}</span>
          {skill.damageType && (
            <span
              className={`rounded-xs border px-1.5 py-px text-[9px] font-semibold ${DAMAGE_COLORS[skill.damageType].pill}`}
            >
              {skill.damageType}
            </span>
          )}
        </div>
        <div
          className="font-mono text-[28px] font-semibold leading-none tabular-nums tracking-[0.01em] text-accent-hot"
          style={{ textShadow: '0 0 16px rgba(224,184,100,0.18)' }}
        >
          {hasCrit
            ? formatRangeInt(breakdown.avgMin, breakdown.avgMax)
            : formatRangeInt(breakdown.hitMin, breakdown.hitMax)}
        </div>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono text-[10px] tracking-widest text-muted">
          {effectiveManaMin !== undefined &&
            effectiveManaMax !== undefined && (
              <span>
                <span className="text-text/90">
                  {formatRange(effectiveManaMin, effectiveManaMax)}
                </span>{' '}
                法力
              </span>
            )}
          {lifeCostMax !== undefined && lifeCostMax > 0 && (
            <span>
              <span className="text-stat-red">
                {formatRange(lifeCostMin ?? 0, lifeCostMax)}
                </span>{' '}
                生命
              </span>
          )}
          {effectiveCastRateMin !== undefined &&
            effectiveCastRateMax !== undefined && (
              <span>
                <span className="text-text/90">
                  {formatRange(effectiveCastRateMin, effectiveCastRateMax)}
                </span>{' '}
                次施放/秒
              </span>
            )}
          {(tagView.tags.length > 0 || tagView.removed.length > 0) && (
            <div className="flex flex-wrap gap-1">
              {tagView.tags.map((tag) => (
                <span
                  key={tag}
                  title={tagView.added.has(tag) ? '由子技能添加' : undefined}
                  className={`rounded-xs border px-1.5 py-px text-[9px] font-semibold uppercase tracking-[0.14em] text-accent-hot ${
                    tagView.added.has(tag)
                      ? 'border-accent-hot/80'
                      : 'border-accent-deep/50'
                  }`}
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(58,46,24,0.4), rgba(42,36,24,0.2))',
                  }}
                >
                  {tag}
                </span>
              ))}
              {tagView.removed.map((tag) => (
                <span
                  key={tag}
                  title="被子技能移除"
                  className="rounded-xs border border-border px-1.5 py-px text-[9px] font-semibold uppercase tracking-[0.14em] text-faint line-through opacity-60"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5 px-4 py-3.5">
        <HeroStat
          k="单击伤害"
          v={formatRangeInt(breakdown.hitMin, breakdown.hitMax)}
        />
        <HeroStat
          k="暴击伤害"
          v={
            hasCrit ? formatRangeInt(breakdown.critMin, breakdown.critMax) : '—'
          }
        />
        <HeroStat
          k="暴击几率"
          v={hasCrit ? `${formatDecimal(breakdown.critChance)}%` : '—'}
        />
        <HeroStat
          k="暴击倍率"
          v={
            hasCrit
              ? `+${formatDecimal(breakdown.critDamagePct)}%`
              : '—'
          }
        />
      </div>
    </div>
  )
}

function DamageHero({ breakdown }: { breakdown: WeaponDamageBreakdown }) {
  const formatRangeInt = useFormatRangeInt()
  const b = breakdown
  return (
    <div
      className="mb-3 grid grid-cols-1 overflow-hidden rounded-[3px] border border-border md:grid-cols-[1.2fr_1fr]"
      style={{
        background:
          'linear-gradient(135deg, rgba(217,107,90,0.05), transparent 60%)',
      }}
    >
      <div className="border-b border-border px-4 py-3.5 md:border-b-0 md:border-r">
        <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-faint">
          平均单击
        </div>
        <div
          className="font-mono text-[26px] font-semibold leading-none tabular-nums tracking-[0.01em] text-accent-hot"
          style={{ textShadow: '0 0 16px rgba(224,184,100,0.18)' }}
        >
          {formatRangeInt(Math.round(b.avgMin), Math.round(b.avgMax))}
        </div>
        <div className="mt-1.5 font-mono text-[10px] tracking-widest text-muted">
          DPS{' '}
          <span className="text-accent-hot">
            {formatRangeInt(Math.round(b.dpsMin), Math.round(b.dpsMax))}
          </span>{' '}
          ·{' '}
          <span className="text-text/90">
            {formatRange(b.attacksPerSecondMin, b.attacksPerSecondMax)}
          </span>{' '}
          次攻击/秒
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5 px-4 py-3.5">
        <HeroStat
          k="单击伤害"
          v={formatRangeInt(b.hitMin, b.hitMax)}
        />
        <HeroStat
          k="暴击伤害"
          v={
            b.critChance > 0
              ? formatRangeInt(b.critMin, b.critMax)
              : '—'
          }
        />
        <HeroStat
          k="暴击几率"
          v={`${formatDecimal(b.critChance)}%`}
        />
        <HeroStat
          k="暴击倍率"
          v={`×${b.critMultiplierAvg.toFixed(2)}`}
        />
      </div>
    </div>
  )
}

function DamageBuildup({ breakdown }: { breakdown: WeaponDamageBreakdown }) {
  const formatRangeInt = useFormatRangeInt()
  const b = breakdown
  return (
    <div className="mt-2 border-t border-dashed border-border pt-2.5">
      <BDSection title="伤害构成">
        <BDLine
          label="武器伤害"
          value={
            <span className="text-text">
              {formatRangeInt(b.weaponDamageMin, b.weaponDamageMax)}
            </span>
          }
        />
        {b.enhancedDamageMaxPct > 0 && (
          <BDLine
            label="强化伤害"
            value={
              <span className="text-accent-hot">
                +{formatRange(b.enhancedDamageMinPct, b.enhancedDamageMaxPct)}%
              </span>
            }
          />
        )}
        {b.additivePhysicalMax > 0 && (
          <BDLine
            label="附加物理"
            value={
              <span className="text-text">
                +{formatRangeInt(b.additivePhysicalMin, b.additivePhysicalMax)}
              </span>
            }
          />
        )}
        {b.attackDamageMaxPct > 0 && (
          <BDLine
            label="攻击伤害 %"
            value={
              <span className="text-accent-hot">
                +{formatRange(b.attackDamageMinPct, b.attackDamageMaxPct)}%
              </span>
            }
          />
        )}
      </BDSection>
      {b.additiveElementalBreakdown.length > 0 && (
        <BDSection title="附加元素">
          {b.additiveElementalBreakdown.map((s, i) => (
            <BDLine
              key={i}
              indent
              label={s.label}
              value={
                <span className="text-sky-300">+{formatDecimal(s.pct)}</span>
              }
            />
          ))}
        </BDSection>
      )}
      {b.extraDamageSources.length > 0 && (
        <BDSection title="额外伤害">
          {b.extraDamageSources.map((s, i) => (
            <BDLine
              key={i}
              indent
              label={s.label}
              value={
                <span className="text-orange-300">
                  +{formatDecimal(s.pct)}%
                </span>
              }
            />
          ))}
        </BDSection>
      )}
      {(b.crushingBlowModifier !== 1.5 ||
        b.armorBreakPct > 0 ||
        b.deadlyBlowChance > 0 ||
        b.hitChance !== 100 ||
        b.projectileCount > 1) && (
        <BDSection title="战斗修正">
          <BDLine
            label="压碎性打击"
            value={
              <span className="text-text">
                ×{b.crushingBlowModifier.toFixed(2)}
              </span>
            }
          />
          {b.armorBreakPct > 0 && (
            <BDLine
              label="破甲"
              value={
                <span className="text-accent-hot">
                  +{formatDecimal(b.armorBreakPct)}%
                </span>
              }
            />
          )}
          {b.deadlyBlowChance > 0 && (
            <BDLine
              label="致命一击几率"
              value={
                <span className="text-accent-hot">
                  {formatDecimal(b.deadlyBlowChance)}%
                </span>
              }
            />
          )}
          {b.hitChance !== 100 && (
            <BDLine
              label="命中几率"
              value={
                <span className="text-text">{formatDecimal(b.hitChance)}%</span>
              }
            />
          )}
          {b.projectileCount > 1 && (
            <BDLine
              label="投射物"
              value={<span className="text-text">×{b.projectileCount}</span>}
            />
          )}
        </BDSection>
      )}
      {b.openWoundsMax > 0 && (
        <BDSection title="撕裂伤口">
          <BDLine
            label="每次击中伤害"
            value={
              <span className="text-red-400">
                {formatRangeInt(b.openWoundsMin, b.openWoundsMax)}
              </span>
            }
          />
        </BDSection>
      )}
      {(b.enemyPhysResPct > 0 || b.physResistanceIgnoredPct > 0) && (
        <BDSection title="敌人抗性">
          <BDLine
            label="物理抗性"
            value={
              <span className="text-text">
                {formatDecimal(b.enemyPhysResPct)}%
              </span>
            }
          />
          {b.physResistanceIgnoredPct > 0 && (
            <BDLine
              label="无视"
              value={
                <span className="text-accent-hot">
                  {formatDecimal(b.physResistanceIgnoredPct)}%
                </span>
              }
            />
          )}
        </BDSection>
      )}
      <div className="mt-1.5 flex items-baseline justify-between gap-3 border-t border-border pt-1.5">
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
          单击伤害
        </span>
        <span className="font-mono text-[14px] font-semibold tabular-nums text-accent-hot">
          {formatRangeInt(b.hitMin, b.hitMax)}
        </span>
      </div>
    </div>
  )
}
