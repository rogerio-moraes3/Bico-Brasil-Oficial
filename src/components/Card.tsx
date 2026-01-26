import React from 'react';

export function Card({ children, className = '', ...props }) {
    return (
        <div
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all hover:shadow-md ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
