import type { OpportunityStage } from '@/lib/types';

// ─── Stage Config ────────────────────────────────────────────────────────────

export const STAGE_CONFIG: Record<OpportunityStage, { label: string; color: string; bg: string; dot: string }> = {
  LEAD:        { label: 'Lead',        color: '#514F4D', bg: '#F3F2F1', dot: '#706E6B' },
  QUALIFIED:   { label: 'Qualified',   color: '#0176D3', bg: '#D8EDFF', dot: '#0176D3' },
  PROPOSAL:    { label: 'Proposal',    color: '#A47800', bg: '#FEF5C3', dot: '#CA8501' },
  NEGOTIATION: { label: 'Negotiation', color: '#6B3FA0', bg: '#F4E8FF', dot: '#8B5CF6' },
  WON:         { label: 'Won',         color: '#2E844A', bg: '#EEF4EE', dot: '#22C55E' },
  LOST:        { label: 'Lost',        color: '#BA0517', bg: '#FDECEC', dot: '#EF4444' },
};

export const STAGE_ORDER: OpportunityStage[] = ['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];

// ─── Stage Badge ─────────────────────────────────────────────────────────────

export function StageBadge({ stage }: { stage: OpportunityStage }) {
  const cfg = STAGE_CONFIG[stage];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

// ─── Alert Badges ────────────────────────────────────────────────────────────

export function LateBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
      style={{ color: '#BA0517', background: '#FDECEC', border: '1px solid #F4C3C3' }}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
      </svg>
      Late
    </span>
  );
}

export function StagnantBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
      style={{ color: '#A47800', background: '#FEF5C3', border: '1px solid #F0D000' }}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
      </svg>
      Stagnant
    </span>
  );
}

// ─── Client Type Badge ───────────────────────────────────────────────────────

export function ClientTypeBadge({ type }: { type: 'COMPANY' | 'INDIVIDUAL' }) {
  const isCompany = type === 'COMPANY';
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
      style={{
        color: isCompany ? '#0176D3' : '#2E844A',
        background: isCompany ? '#D8EDFF' : '#EEF4EE',
      }}>
      {isCompany ? (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
          <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 000 1.5v16.5h-.75a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5h-.75V3.75a.75.75 0 000-1.5h-15zM9 6a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm-.75 3.75A.75.75 0 019 9h1.5a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM9 12a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm3.75-5.25A.75.75 0 0113.5 6H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM13.5 9a.75.75 0 000 1.5H15A.75.75 0 0015 9h-1.5zm-.75 3.75a.75.75 0 01.75-.75H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM9 19.5v-2.25a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v2.25a.75.75 0 01-.75.75h-4.5A.75.75 0 019 19.5z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
          <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
        </svg>
      )}
      {isCompany ? 'Company' : 'Individual'}
    </span>
  );
}

// ─── Page Header ─────────────────────────────────────────────────────────────

export function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumb,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumb?: { label: string; href: string }[];
}) {
  return (
    <div className="border-b px-8 py-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      {breadcrumb && breadcrumb.length > 0 && (
        <div className="flex items-center gap-1 mb-2">
          {breadcrumb.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-gray-300 text-xs">/</span>}
              <a href={crumb.href} className="text-xs hover:underline" style={{ color: 'var(--brand-blue)' }}>
                {crumb.label}
              </a>
            </span>
          ))}
        </div>
      )}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h1>
          {subtitle && <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3 flex-shrink-0 ml-6">{actions}</div>}
      </div>
    </div>
  );
}

// ─── Buttons ─────────────────────────────────────────────────────────────────

export function PrimaryButton({
  children, onClick, href, disabled, type = 'button', className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
}) {
  const cls = `inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-all ${className}`;
  const style = {
    background: 'var(--brand-blue)',
    color: '#fff',
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer' as const,
  };
  if (href) {
    return (
      <a href={href} className={cls} style={style}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls} style={style}
      onMouseEnter={(e) => { if (!disabled) (e.currentTarget as HTMLElement).style.background = 'var(--brand-blue-dark)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--brand-blue)'; }}>
      {children}
    </button>
  );
}

export function SecondaryButton({
  children, onClick, href, disabled, type = 'button', className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
}) {
  const cls = `inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-all border ${className}`;
  const style: React.CSSProperties = {
    background: 'white',
    color: 'var(--brand-blue)',
    borderColor: 'var(--brand-blue)',
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
  if (href) {
    return <a href={href} className={cls} style={style}>{children}</a>;
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls} style={style}>
      {children}
    </button>
  );
}

export function DangerButton({
  children, onClick, disabled, type = 'button',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-all"
      style={{
        background: 'var(--danger-bg)',
        color: 'var(--danger)',
        border: '1px solid #F4C3C3',
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}>
      {children}
    </button>
  );
}

// ─── Form Field ──────────────────────────────────────────────────────────────

export function FormField({
  label, required, error, children, hint,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
      {error && <p className="text-xs font-medium" style={{ color: 'var(--danger)' }}>{error}</p>}
    </div>
  );
}

const inputBase = `w-full px-3 py-2 text-sm rounded border transition-all`;
const inputStyle = { color: 'var(--text-primary)', background: '#fff', borderColor: 'var(--border)' };

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`${inputBase} ${props.className ?? ''}`}
      style={{ ...inputStyle, ...props.style }}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select
      {...props}
      className={`${inputBase} ${props.className ?? ''}`}
      style={{ ...inputStyle, ...props.style }}
    >
      {props.children}
    </select>
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${inputBase} resize-none ${props.className ?? ''}`}
      style={{ ...inputStyle, ...props.style }}
    />
  );
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

export function MetricCard({
  label, value, subValue, icon, accent, trend,
}: {
  label: string;
  value: string;
  subValue?: string;
  icon?: React.ReactNode;
  accent?: string;
  trend?: { value: string; up: boolean };
}) {
  return (
    <div className="rounded-lg p-5 flex flex-col gap-3 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</p>
        {icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: accent || '#D8EDFF' }}>
            <span style={{ color: 'var(--brand-blue)' }}>{icon}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold font-data" style={{ color: 'var(--text-primary)' }}>{value}</p>
        {subValue && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{subValue}</p>}
        {trend && (
          <p className={`text-xs font-medium mt-1 ${trend.up ? 'text-green-600' : 'text-red-600'}`}>
            {trend.up ? '↑' : '↓'} {trend.value}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Error Banner ────────────────────────────────────────────────────────────

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="px-4 py-3 rounded-lg flex items-center justify-between border"
      style={{ background: 'var(--danger-bg)', borderColor: '#F4C3C3' }}>
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--danger)' }}>
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
        </svg>
        <p className="text-sm font-medium" style={{ color: 'var(--danger)' }}>{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="text-sm font-semibold ml-4" style={{ color: 'var(--danger)' }}>
          Retry
        </button>
      )}
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

export function EmptyState({
  title, description, action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: '#F3F2F1' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-8 h-8" style={{ color: 'var(--text-muted)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
        </svg>
      </div>
      <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      <p className="text-sm max-w-xs" style={{ color: 'var(--text-muted)' }}>{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function SkeletonRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-3.5">
          <div className="h-4 rounded animate-pulse" style={{ background: '#F3F2F1', width: i === 0 ? '70%' : '85%' }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}k`;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
}

export function formatCurrencyFull(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function clientName(client: { type: string; companyName?: string | null; firstName?: string | null; lastName?: string | null }): string {
  if (client.type === 'COMPANY') return client.companyName ?? 'Unknown';
  return [client.firstName, client.lastName].filter(Boolean).join(' ') || 'Unknown';
}