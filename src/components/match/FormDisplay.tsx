'use client';

import type { FormResult } from '@/types';

interface Props {
  form: FormResult[];
  size?: 'sm' | 'md';
}

export function FormDisplay({ form, size = 'md' }: Props) {
  const dotSize = size === 'sm' ? 'w-5 h-5 text-[9px]' : 'w-6 h-6 text-[11px]';

  return (
    <div className="flex gap-1">
      {form.map((result, i) => (
        <div
          key={i}
          className={`${dotSize} rounded form-dot form-${result}`}
        >
          {result}
        </div>
      ))}
    </div>
  );
}
