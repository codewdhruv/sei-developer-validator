'use client';

import { ReactNode } from 'react';

interface WizardCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
  variant?: 'default' | 'highlight' | 'success' | 'warning';
}

const variantStyles = {
  default: 'bg-white border-gray-100',
  highlight: 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100',
  success: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100',
  warning: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100',
};

export function WizardCard({
  children,
  title,
  subtitle,
  icon,
  className = '',
  variant = 'default',
}: WizardCardProps) {
  return (
    <div
      className={`
        rounded-2xl border shadow-sm
        transition-all duration-300 hover:shadow-md
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {(title || subtitle || icon) && (
        <div className="px-6 py-5 border-b border-gray-100/50">
          <div className="flex items-start gap-4">
            {icon && (
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200/50">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

interface WizardActionsProps {
  children: ReactNode;
  className?: string;
}

export function WizardActions({ children, className = '' }: WizardActionsProps) {
  return (
    <div
      className={`
        flex items-center justify-between pt-6 mt-6
        border-t border-gray-100
        ${className}
      `}
    >
      {children}
    </div>
  );
}
