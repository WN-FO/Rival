'use client';

import React from 'react';
import Link from 'next/link';

interface PicksEmptyStateProps {
  message: string;
  actionText?: string;
  actionUrl?: string;
}

const PicksEmptyState: React.FC<PicksEmptyStateProps> = ({ message, actionText, actionUrl }) => {
  return (
    <div className="text-center py-12 px-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
      <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
      <p className="text-sm text-gray-500 mb-6">
        Join the action by making predictions for upcoming games and track your performance over time.
      </p>
      
      {actionText && actionUrl && (
        <Link
          href={actionUrl}
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
};

export default PicksEmptyState; 