import React, { useState, useEffect } from 'react';
import DataTable from './DataTable';
import DynamicModal from './DynamicModal';
import { useTheme } from './ThemeContext';
import { Plus, RefreshCw, FolderPlus } from 'lucide-react';
import axios from 'axios';
import '../styles/DepartmentManagement.css';

const API_URL = 'http://localhost:5000';

const DepartmentManagement = () => {
  const { isDarkMode } = useTheme();
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
  const [isSubDepartmentModalOpen, setIsSubDepartmentModalOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    { label: 'Department Name', key: 'departmentName' },
    { label: 'Sub-Departments', key: 'subDepartments' },
    { label: 'Status', key: 'status' }
  ];

  // Fetch all departments with their sub-departments
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/department/all`);
      
      if (response.data && response.data.departments) {
        // Fetch sub-departments for each department
        const departmentsWithSubDepts = await Promise.all(
          response.data.departments.map(async (department) => {
            try {
                const id = department._id;
              const subDeptResponse = await axios.get(`${API_URL}/sub-department/dep/${id}`);
              
              const subDepartments = subDeptResponse.data.subdepartments || [];
              const subDeptNames = subDepartments.map(sub => sub.sub_departmentName).join(', ');
              
              return {
                ...department,
                subDepartments: subDeptNames || 'None',
                subDepartmentsList: subDepartments
              };
            } catch {
              return {
                ...department,
                subDepartments: 'None',
                subDepartmentsList: []
              };
            }
          })
        );
        
        setDepartments(departmentsWithSubDepts);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      alert('Error fetching departments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Handle adding new department
  const handleAddDepartment = async (departmentData) => {
    try {
      const response = await axios.post(`${API_URL}/department/create`, {
        departmentName: departmentData.departmentName,
      });
      
      if (response.data) {
        await fetchDepartments(); // Refresh the list
        alert('Department added successfully!');
        setIsDepartmentModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding department:', error);
      alert('Error adding department. Please try again.');
    }
  };

  // Handle adding new sub-department
  const handleAddSubDepartment = async (subDepartmentData) => {
    try {
      const response = await axios.post(`${API_URL}/sub-department/create`, {
        departmentId: subDepartmentData.departmentId,
        sub_departmentName: subDepartmentData.subDepartmentName
      });
      
      if (response.data) {
        await fetchDepartments(); // Refresh the list
        alert('Sub-department added successfully!');
        setIsSubDepartmentModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding sub-department:', error);
      alert('Error adding sub-department. Please try again.');
    }
  };

  const handleEdit = async (department) => {
    console.log('Edit department:', department);
    // Implement edit functionality as needed
  };

  const handleDeactivate = async (department) => {
    const newStatus = department.status === 'active' ? 'inactive' : 'active';
    try {
      const response = await axios.patch(`${API_URL}/department/update-status`, {
        id: department._id,
        status: newStatus
      });
      console.log("resp :",response)
      if (response.data.success === true) {
        setDepartments(departments.map(d => 
          d._id === department._id ? { ...d, status: newStatus } : d
        ));
        alert(`Department ${newStatus} successfully!`);
      }
    } catch (error) {
      console.error('Error updating department status:', error);
      alert('Error updating department status. Please try again.');
    }
  };

  const handleDelete = async (department) => {
    if (window.confirm(`Are you sure you want to delete ${department.departmentName}? This will also delete all associated sub-departments.`)) {
      try {
        const response = await axios.delete(`${API_URL}/department/${department._id}`);
        if (response.data) {
          setDepartments(departments.filter(d => d._id !== department._id));
          alert('Department deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting department:', error);
        alert('Error deleting department. Please try again.');
      }
    }
  };

  // Custom modal for adding department
  const DepartmentModal = ({ isOpen, onClose, onAdd }) => {
    const [departmentName, setDepartmentName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!departmentName.trim()) {
        alert('Please enter department name');
        return;
      }

      setSubmitting(true);
      await onAdd({ departmentName: departmentName.trim() });
      setDepartmentName('');
      setSubmitting(false);
    };

    if (!isOpen) return null;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Add New Department</h2>
            <button className="modal-close" onClick={onClose}>&times;</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="departmentName">Department Name *</label>
                <input
                  type="text"
                  id="departmentName"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  placeholder="Enter department name"
                  required
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Department'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Custom modal for adding sub-department
  const SubDepartmentModal = ({ isOpen, onClose, onAdd, departments }) => {
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [subDepartmentName, setSubDepartmentName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!selectedDepartment) {
        alert('Please select a department');
        return;
      }
      if (!subDepartmentName.trim()) {
        alert('Please enter sub-department name');
        return;
      }

      setSubmitting(true);
      await onAdd({
        departmentId: selectedDepartment,
        subDepartmentName: subDepartmentName.trim()
      });
      setSelectedDepartment('');
      setSubDepartmentName('');
      setSubmitting(false);
    };

    if (!isOpen) return null;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Add New Sub-Department</h2>
            <button className="modal-close" onClick={onClose}>&times;</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="department">Select Department *</label>
                <select
                  id="department"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  required
                >
                  <option value="">Select a department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.departmentName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="subDepartmentName">Sub-Department Name *</label>
                <input
                  type="text"
                  id="subDepartmentName"
                  value={subDepartmentName}
                  onChange={(e) => setSubDepartmentName(e.target.value)}
                  placeholder="Enter sub-department name"
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Sub-Department'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className={`department-management ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="department-header">
        <div className="header-buttons">
          <button className="add-department-btn" onClick={() => setIsDepartmentModalOpen(true)}>
            <Plus size={18} />
            Add Department
          </button>
          <button className="add-subdepartment-btn" onClick={() => setIsSubDepartmentModalOpen(true)}>
            <FolderPlus size={18} />
            Add Sub-Department
          </button>
          <button className="refresh-btn" onClick={fetchDepartments}>
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading departments...</div>
      ) : (
        <DataTable
          title="All Departments"
          data={departments}
          columns={columns}
          onEdit={handleEdit}
          onDeactivate={handleDeactivate}
          onDelete={handleDelete}
        />
      )}

      <DepartmentModal
        isOpen={isDepartmentModalOpen}
        onClose={() => setIsDepartmentModalOpen(false)}
        onAdd={handleAddDepartment}
      />

      <SubDepartmentModal
        isOpen={isSubDepartmentModalOpen}
        onClose={() => setIsSubDepartmentModalOpen(false)}
        onAdd={handleAddSubDepartment}
        departments={departments}
      />
    </div>
  );
};

export default DepartmentManagement;