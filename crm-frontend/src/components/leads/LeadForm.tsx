'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lead, LeadStatus } from '@/types';
import { LEAD_STATUSES } from '@/constants';
import { cn } from '@/utils/cn';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[\+]?[\d\s\-\(\)]{7,15}$/, 'Invalid phone number'),
  company: z.string().min(1, 'Company is required').max(100),
  status: z.enum(['New', 'Contacted', 'Qualified', 'Converted', 'Lost']),
  notes: z.string().max(2000).optional().default(''),
});

type FormData = z.infer<typeof schema>;

interface LeadFormProps {
  lead?: Lead | null;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function LeadForm({ lead, onSubmit, onCancel, isLoading }: LeadFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      status: 'New',
      notes: '',
    },
  });

  useEffect(() => {
    if (lead) {
      reset({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        status: lead.status,
        notes: lead.notes || '',
      });
    } else {
      reset({ name: '', email: '', phone: '', company: '', status: 'New', notes: '' });
    }
  }, [lead, reset]);

  const inputClass = (error?: { message?: string }) =>
    cn(
      'w-full px-3 py-2 text-sm rounded-lg border bg-background transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
      'placeholder:text-muted-foreground',
      error ? 'border-destructive focus:ring-destructive/30' : 'border-input hover:border-muted-foreground/40'
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Full Name <span className="text-destructive">*</span>
          </label>
          <input
            {...register('name')}
            placeholder="John Doe"
            className={inputClass(errors.name)}
          />
          {errors.name && (
            <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Email Address <span className="text-destructive">*</span>
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder="john@company.com"
            className={inputClass(errors.email)}
          />
          {errors.email && (
            <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Phone Number <span className="text-destructive">*</span>
          </label>
          <input
            {...register('phone')}
            placeholder="+1 234 567 890"
            className={inputClass(errors.phone)}
          />
          {errors.phone && (
            <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Company Name <span className="text-destructive">*</span>
          </label>
          <input
            {...register('company')}
            placeholder="Acme Corp"
            className={inputClass(errors.company)}
          />
          {errors.company && (
            <p className="text-xs text-destructive mt-1">{errors.company.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Status</label>
        <select {...register('status')} className={inputClass(errors.status)}>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Notes</label>
        <textarea
          {...register('notes')}
          rows={3}
          placeholder="Add any relevant notes about this lead..."
          className={cn(inputClass(errors.notes), 'resize-none')}
        />
        {errors.notes && (
          <p className="text-xs text-destructive mt-1">{errors.notes.message}</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-input bg-background hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || (!isDirty && !!lead)}
          className={cn(
            'flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            'bg-primary text-primary-foreground hover:bg-primary/90',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isLoading ? 'Saving...' : lead ? 'Update Lead' : 'Create Lead'}
        </button>
      </div>
    </form>
  );
}
