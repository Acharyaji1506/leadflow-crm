import { cn } from '@/utils/cn';
import { SCORE_TIER } from '@/constants';

interface LeadScoreProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LeadScore({ score, showLabel = true, size = 'md' }: LeadScoreProps) {
  const tier = SCORE_TIER(score);
  const radius = size === 'lg' ? 22 : size === 'md' ? 16 : 10;
  const strokeWidth = size === 'lg' ? 3 : 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const dim = (radius + strokeWidth) * 2;

  const colorClass =
    score >= 60
      ? 'stroke-emerald-500'
      : score >= 35
      ? 'stroke-amber-500'
      : 'stroke-blue-500';

  return (
    <div className="flex items-center gap-2">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-muted"
          />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn('transition-all duration-500', colorClass)}
          />
        </svg>
        <span
          className={cn(
            'absolute inset-0 flex items-center justify-center font-bold',
            size === 'lg' ? 'text-sm' : size === 'md' ? 'text-xs' : 'text-[9px]'
          )}
        >
          {score}
        </span>
      </div>
      {showLabel && (
        <span className={cn('text-xs font-medium', tier.color)}>{tier.label}</span>
      )}
    </div>
  );
}
