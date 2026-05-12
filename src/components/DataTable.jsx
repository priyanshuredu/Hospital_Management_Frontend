import React from 'react';
import { Edit, Power, Trash2, Eye } from 'lucide-react';
import { useTheme } from './ThemeContext';
import '../styles/DataTable.css';

const DataTable = ({ 
  title, 
  data, 
  columns, 
  onEdit, 
  onDeactivate, 
  onDelete,
  onView 
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`data-table-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="table-header">
        <h2>{title}</h2>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index}>{col.label}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                {columns.map((col, index) => (
                  <td key={index}>{item[col.key]}</td>
                ))}
                <td className="actions">
                  <button 
                    className="action-btn edit"
                    onClick={() => onEdit(item)}
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    className="action-btn deactivate"
                    onClick={() => onDeactivate(item)}
                    title={item.status === 'active' ? 'Deactivate' : 'Activate'}
                  >
                    <Power size={18} />
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => onDelete(item)}
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;