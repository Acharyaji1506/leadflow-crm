'use client';
import { motion } from 'framer-motion';
import {
  Users, UserCheck, TrendingUp, TrendingDown, Star, Activity,
  ArrowUpRight, BarChart2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  Tooltip,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from 'recharts';
import { LeadStats } from '@/types';
import { StatCardSkeleton } from '@/components/common/Skeleton';
import { cn } from '@/utils/cn';

/* ─── Stat Card ──────────────────────────────────────────────────────────── */
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
  delay?: number;
}

function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'text-primary', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn('p-2 rounded-lg bg-muted', color)}>
          <Icon className="w-4 h-4" />
        </div>
        {trend && (
          <span className={cn('flex items-center gap-0.5 text-xs font-medium',
            trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-muted-foreground'
          )}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground mb-0.5">{value}</p>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </motion.div>
  );
}

/* ─── Funnel Chart ───────────────────────────────────────────────────────── */
const FUNNEL_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#10b981'];

function ConversionFunnel({ stats }: { stats: LeadStats }) {
  const data = [
    { name: 'Total Leads', value: stats.total, fill: FUNNEL_COLORS[0] },
    { name: 'Contacted', value: stats.Contacted, fill: FUNNEL_COLORS[1] },
    { name: 'Qualified', value: stats.Qualified, fill: FUNNEL_COLORS[2] },
    { name: 'Converted', value: stats.Converted, fill: FUNNEL_COLORS[3] },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card border border-border rounded-xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Conversion Funnel</h3>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <FunnelChart>
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Funnel dataKey="value" data={data} isAnimationActive>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
              <LabelList
                position="right"
                content={({ value, name }) => (
                  <text className="fill-foreground" style={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}>
                    {name}: {value}
                  </text>
                )}
              />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

/* ─── Status Bar Chart ───────────────────────────────────────────────────── */
function StatusBarChart({ stats }: { stats: LeadStats }) {
  const data = [
    { name: 'New', count: stats.New, fill: '#3b82f6' },
    { name: 'Contacted', count: stats.Contacted, fill: '#8b5cf6' },
    { name: 'Qualified', count: stats.Qualified, fill: '#f59e0b' },
    { name: 'Converted', count: stats.Converted, fill: '#10b981' },
    { name: 'Lost', count: stats.Lost, fill: '#ef4444' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-card border border-border rounded-xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Leads by Status</h3>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              cursor={{ fill: 'hsl(var(--muted))' }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

/* ─── Dashboard Stats Panel ──────────────────────────────────────────────── */
interface DashboardStatsProps {
  stats: LeadStats | null;
  isLoading: boolean;
}

export function DashboardStats({ stats, isLoading }: DashboardStatsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 9 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <StatCard title="Total Leads" value={stats.total} icon={Users} color="text-blue-600" delay={0} />
        <StatCard title="New" value={stats.New} icon={Star} color="text-blue-500" delay={0.05} />
        <StatCard title="Contacted" value={stats.Contacted} icon={Activity} color="text-violet-600" delay={0.1} />
        <StatCard title="Qualified" value={stats.Qualified} icon={TrendingUp} color="text-amber-600" delay={0.15} />
        <StatCard title="Converted" value={stats.Converted} icon={UserCheck} color="text-emerald-600" trend="up" delay={0.2} />
        <StatCard title="Lost" value={stats.Lost} icon={TrendingDown} color="text-rose-600" trend="down" delay={0.25} />
        <StatCard
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
          subtitle="Converted / Total"
          icon={TrendingUp}
          color="text-emerald-600"
          trend="up"
          delay={0.3}
        />
        <StatCard
          title="Lost Rate"
          value={`${stats.lostRate}%`}
          subtitle="Lost / Total"
          icon={TrendingDown}
          color="text-rose-600"
          delay={0.35}
        />
        <StatCard
          title="Avg / Day"
          value={stats.avgPerDay}
          subtitle="Average leads per day"
          icon={BarChart2}
          color="text-primary"
          delay={0.4}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ConversionFunnel stats={stats} />
        <StatusBarChart stats={stats} />
      </div>
    </div>
  );
}
