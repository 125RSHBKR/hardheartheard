'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Flag, User, Coins } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from './ui/use-toast';
import { cn } from '@/lib/utils';
import type { AppComment, AppUser } from '@/types';

interface AdminTableProps {
  // Admin table is versatile — pass items and column definitions
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function AdminTable({ title, description, children }: AdminTableProps) {
  return (
    <div className="border border-cream/10 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-ink-100 border-b border-cream/10">
        <h3 className="font-display text-sm font-semibold text-cream">{title}</h3>
        {description && <p className="text-xs text-cream-faint mt-0.5">{description}</p>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {children}
        </table>
      </div>
    </div>
  );
}

AdminTable.Head = function AdminTableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-ink-200">
      <tr>{children}</tr>
    </thead>
  );
};

AdminTable.HeadCell = function AdminTableHeadCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        'px-4 py-2.5 text-left text-xs font-semibold text-cream-faint uppercase tracking-wider',
        className
      )}
    >
      {children}
    </th>
  );
};

AdminTable.Body = function AdminTableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-cream/5">{children}</tbody>;
};

AdminTable.Row = function AdminTableRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tr className={cn('hover:bg-cream/[0.02] transition-colors', className)}>{children}</tr>
  );
};

AdminTable.Cell = function AdminTableCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={cn('px-4 py-3 text-cream-muted', className)}>{children}</td>
  );
};
