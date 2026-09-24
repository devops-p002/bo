import React from 'react';
import { Card } from '../common/UI';

interface ComponentTemplateProps {
  title: string;
  description?: string;
  data?: any[];
  columns?: any[];
  // Optional: field names (in `data` items) to render for each column, in
  // order. Falls back to Object.values(item) for callers that still pass
  // plain row objects shaped to match `columns` 1:1.
  rowKeys?: string[] | null;
  stats?: any[];
  actions?: any[];
  hasAddButton?: boolean;
  addButtonText?: string;
  onAdd?: () => void;
  loading?: boolean;
  error?: any;
}

const ComponentTemplate = ({
  title,
  description,
  data = [],
  columns = [],
  rowKeys = null,
  stats = [],
  actions = [],
  hasAddButton = false,
  addButtonText = "Add New",
  onAdd,
  loading = false,
  error = null,
}: ComponentTemplateProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      </div>

      {/* Stats Cards */}
      {stats.length > 0 && (
        <div className={`grid grid-cols-1 md:grid-cols-${Math.min(stats.length, 4)} gap-4`}>
          {stats.map((stat, index) => (
            <Card key={index}>
              <div className="p-4">
                <div className="text-sm font-medium text-gray-500">{stat.label}</div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Main Content */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">{title} List</h3>
            {hasAddButton && (
              <button
                onClick={onAdd}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {addButtonText}
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading…</div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((column, index) => (
                      <th 
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((item, index) => (
                    <tr key={item.id ?? index} className="hover:bg-gray-50">
                      {(rowKeys ? rowKeys.map((key) => item[key]) : Object.values(item)).map((value, valueIndex) => (
                        <td key={valueIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {value}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {actions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={() => action.onClick && action.onClick(item)}
                            className={`text-${action.color}-600 hover:text-${action.color}-900`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m14 0h-6l-2-2h2l2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No {title.toLowerCase()}</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new {title.toLowerCase()}.</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ComponentTemplate; 