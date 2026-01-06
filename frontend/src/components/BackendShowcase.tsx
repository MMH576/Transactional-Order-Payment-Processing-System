'use client';

import { useState } from 'react';

interface CodeStep {
  title: string;
  description: string;
  code: string;
  language?: string;
}

interface BackendShowcaseProps {
  title: string;
  description: string;
  steps: CodeStep[];
  currentStep?: number;
  showAllSteps?: boolean;
}

export function BackendShowcase({
  title,
  description,
  steps,
  currentStep,
  showAllSteps = false,
}: BackendShowcaseProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(
    currentStep ?? (showAllSteps ? null : 0)
  );

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden">
      <div className="bg-slate-800 px-4 py-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-slate-400 text-sm font-mono ml-2">{title}</span>
        </div>
      </div>

      <div className="p-4">
        <p className="text-slate-400 text-sm mb-4">{description}</p>

        <div className="space-y-2">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`rounded-lg overflow-hidden transition-all ${
                currentStep !== undefined && idx === currentStep
                  ? 'ring-2 ring-green-500'
                  : ''
              }`}
            >
              <button
                onClick={() => setExpandedStep(expandedStep === idx ? null : idx)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition ${
                  currentStep !== undefined && idx < currentStep
                    ? 'bg-green-900/30'
                    : currentStep !== undefined && idx === currentStep
                    ? 'bg-green-900/50'
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                <span
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentStep !== undefined && idx < currentStep
                      ? 'bg-green-600 text-white'
                      : currentStep !== undefined && idx === currentStep
                      ? 'bg-green-500 text-white animate-pulse'
                      : 'bg-slate-600 text-slate-300'
                  }`}
                >
                  {currentStep !== undefined && idx < currentStep ? '✓' : idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {step.title}
                  </p>
                  <p className="text-slate-400 text-xs truncate">
                    {step.description}
                  </p>
                </div>
                <span className="text-slate-500 text-lg">
                  {expandedStep === idx ? '−' : '+'}
                </span>
              </button>

              {expandedStep === idx && (
                <div className="bg-slate-950 p-3 border-t border-slate-700">
                  <pre className="text-sm text-green-400 font-mono overflow-x-auto whitespace-pre-wrap">
                    {step.code}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ApiEndpointBadge({
  method,
  path,
  description,
}: {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description?: string;
}) {
  const methodColors = {
    GET: 'bg-blue-600',
    POST: 'bg-green-600',
    PUT: 'bg-yellow-600',
    PATCH: 'bg-orange-600',
    DELETE: 'bg-red-600',
  };

  return (
    <div className="inline-flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">
      <span
        className={`${methodColors[method]} text-white text-xs font-bold px-2 py-0.5 rounded`}
      >
        {method}
      </span>
      <code className="text-green-400 text-sm font-mono">{path}</code>
      {description && (
        <span className="text-slate-400 text-xs">— {description}</span>
      )}
    </div>
  );
}

export function DatabaseOperation({
  operation,
  table,
  description,
  isActive,
}: {
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'LOCK';
  table: string;
  description: string;
  isActive?: boolean;
}) {
  const opColors = {
    SELECT: 'text-blue-400',
    INSERT: 'text-green-400',
    UPDATE: 'text-yellow-400',
    DELETE: 'text-red-400',
    LOCK: 'text-purple-400',
  };

  return (
    <div
      className={`flex items-center gap-3 p-2 rounded ${
        isActive ? 'bg-slate-800 ring-1 ring-green-500' : 'bg-slate-900'
      }`}
    >
      <span className={`font-mono text-sm font-bold ${opColors[operation]}`}>
        {operation}
      </span>
      <span className="text-slate-300 text-sm font-mono">{table}</span>
      <span className="text-slate-500 text-xs">— {description}</span>
      {isActive && (
        <span className="ml-auto flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
      )}
    </div>
  );
}

export function TransactionBlock({
  children,
  status,
}: {
  children: React.ReactNode;
  status: 'pending' | 'active' | 'committed' | 'rolled_back';
}) {
  const statusStyles = {
    pending: 'border-slate-600 bg-slate-900',
    active: 'border-yellow-500 bg-yellow-950/30',
    committed: 'border-green-500 bg-green-950/30',
    rolled_back: 'border-red-500 bg-red-950/30',
  };

  const statusLabels = {
    pending: 'Transaction Pending',
    active: 'Transaction Active',
    committed: 'Transaction Committed',
    rolled_back: 'Transaction Rolled Back',
  };

  return (
    <div className={`border-2 rounded-lg ${statusStyles[status]}`}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700">
        <span className="text-slate-400 text-xs font-mono">BEGIN TRANSACTION</span>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded ${
            status === 'pending'
              ? 'bg-slate-700 text-slate-300'
              : status === 'active'
              ? 'bg-yellow-600 text-white'
              : status === 'committed'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {statusLabels[status]}
        </span>
      </div>
      <div className="p-3 space-y-2">{children}</div>
      <div className="px-3 py-2 border-t border-slate-700">
        <span className="text-slate-400 text-xs font-mono">
          {status === 'committed' ? 'COMMIT' : status === 'rolled_back' ? 'ROLLBACK' : 'END'}
        </span>
      </div>
    </div>
  );
}
