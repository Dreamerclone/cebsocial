'use client';

import React from 'react';

export default function Skeleton({ type = 'post' }) {
  if (type === 'post') {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 p-7 shadow-sm animate-pulse">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gray-200 dark:bg-slate-800 rounded-xl"></div>
          <div className="space-y-2 flex-1">
            <div className="h-3 w-1/4 bg-gray-200 dark:bg-slate-800 rounded"></div>
            <div className="h-2 w-1/6 bg-gray-100 dark:bg-slate-800 rounded"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 w-full bg-gray-100 dark:bg-slate-800 rounded-xl"></div>
          <div className="h-4 w-5/6 bg-gray-100 dark:bg-slate-800 rounded-xl"></div>
          <div className="h-4 w-2/3 bg-gray-100 dark:bg-slate-800 rounded-xl"></div>
        </div>
        <div className="mt-8 flex space-x-6">
          <div className="h-4 w-12 bg-gray-50 dark:bg-slate-800 rounded"></div>
          <div className="h-4 w-12 bg-gray-50 dark:bg-slate-800 rounded"></div>
          <div className="h-4 w-12 bg-gray-50 dark:bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (type === 'market') {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 p-4 shadow-sm animate-pulse">
            <div className="aspect-square bg-gray-200 dark:bg-slate-800 rounded-[2rem] mb-4"></div>
            <div className="px-2 space-y-3">
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-slate-800 rounded"></div>
                <div className="h-3 w-1/2 bg-gray-100 dark:bg-slate-800 rounded"></div>
                <div className="h-8 w-full bg-blue-50 dark:bg-slate-800 rounded-xl mt-4"></div>
            </div>
        </div>
    )
  }

  return null;
}
