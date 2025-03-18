import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Avatar, Chip, Menu, MenuItem ,Card, CardContent} from '@mui/material';
import { MoreVertical, Edit, Check, X, User, UserX } from 'lucide-react';
import CommonDrawer from '../common/Drawer';
import "../../styles/employee.css"
const EmployeesView = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuEmployee, setMenuEmployee] = useState(null);

  useEffect(() => {
    const fetchEmployees = () => {
      try {
        setLoading(true);
        const data = [
          { id: 1, name: 'Alex Pires', department: 'Support', active: true, signedIn: '4 hours ago', time: 'Today at 9:50 AM', avatar: '/api/placeholder/40/40' },
          { id: 2, name: 'Betty Taylor', department: 'Sales', active: true, signedIn: '1 hour ago', time: 'Today at 12:55 AM', avatar: '/api/placeholder/40/40' },
          { id: 3, name: 'Bobby Joe', department: 'Visitor', active: false, signedIn: '3 hours ago', time: 'Today at 10:52 AM', visiting: 'Lauren Wicks', avatar: '/api/placeholder/40/40' },
          { id: 4, name: 'Carolyn Brooke', department: 'Pending Visitor', active: true, signedIn: '3 hours ago', time: 'Today at 10:49 AM', visiting: 'Betty Taylor', avatar: '/api/placeholder/40/40' },
          { id: 5, name: 'Carrie Bradshaw', department: '', active: true, signedIn: '5 hours ago', time: 'Today at 9:48 AM', avatar: '/api/placeholder/40/40' },
          { id: 6, name: 'Dee Reynolds', department: 'Visitor', active: false, signedIn: '3 hours ago', time: 'Today at 10:49 AM', visiting: 'Alex Pires', avatar: '/api/placeholder/40/40' },
          { id: 7, name: 'Fin Boyle', department: '', active: false, signedIn: '3 hours ago', time: 'Today at 10:52 AM', avatar: '/api/placeholder/40/40' }
        ];
        setEmployees(data);
        setError(null);
      } catch (err) {
        setError('Failed to load employee data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleMenuOpen = (event, employee) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuEmployee(employee);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuEmployee(null);
  };

  const handleEditEmployee = () => {
    setSelectedEmployee({...menuEmployee});
    setDrawerOpen(true);
    handleMenuClose();
  };

  const handleToggleStatus = () => {
    if (!menuEmployee) return;
    const updatedEmployees = employees.map(emp => 
      emp.id === menuEmployee.id ? { ...emp, active: !emp.active } : emp
    );
    setEmployees(updatedEmployees);
    handleMenuClose();
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedEmployee(null);
  };

  const handleSaveChanges = () => {
    if (!selectedEmployee) return;
    const updatedEmployees = employees.map(emp => 
      emp.id === selectedEmployee.id ? { ...selectedEmployee } : emp
    );
    setEmployees(updatedEmployees);
    handleCloseDrawer();
  };

  const drawerContent = (
    <Box className="employee-edit-form p-4">
      {selectedEmployee && (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar src={selectedEmployee.avatar} alt={selectedEmployee.name} className="w-12 h-12" />
            <div>
              <Typography variant="h6">{selectedEmployee.name}</Typography>
              <Chip 
                label={selectedEmployee.active ? "Active" : "Inactive"} 
                color={selectedEmployee.active ? "success" : "default"}
                size="small"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedEmployee.department}
                onChange={(e) => setSelectedEmployee({...selectedEmployee, department: e.target.value})}
              >
                <option value="">None</option>
                <option value="Support">Support</option>
                <option value="Sales">Sales</option>
                <option value="Visitor">Visitor</option>
                <option value="Pending Visitor">Pending Visitor</option>
              </select>
            </div>
            {(selectedEmployee.department === 'Visitor' || selectedEmployee.department === 'Pending Visitor') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visiting</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={selectedEmployee.visiting || ''}
                  onChange={(e) => setSelectedEmployee({...selectedEmployee, visiting: e.target.value})}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <div className="flex space-x-4">
                <button
                  className={`px-4 py-2 rounded-md ${selectedEmployee.active ? 'bg-green-100 border border-green-500' : 'bg-gray-100 border border-gray-300'}`}
                  onClick={() => setSelectedEmployee({...selectedEmployee, active: true})}
                >
                  <Check size={16} className={selectedEmployee.active ? 'text-green-500' : 'text-gray-500'} />
                  <span className="ml-2">Active</span>
                </button>
                <button
                  className={`px-4 py-2 rounded-md ${!selectedEmployee.active ? 'bg-red-100 border border-red-500' : 'bg-gray-100 border border-gray-300'}`}
                  onClick={() => setSelectedEmployee({...selectedEmployee, active: false})}
                >
                  <X size={16} className={!selectedEmployee.active ? 'text-red-500' : 'text-gray-500'} />
                  <span className="ml-2">Inactive</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Box>
  );

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <Box className="bg-blue-50 p-4 border-b">
          <Typography variant="h5" className="font-medium">
            Employees ({employees.length})
          </Typography>
        </Box>
        <Box className="p-4">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Type name to search..."
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <div className="space-y-2">
              {employees.map((employee) => (
                <div 
                  key={employee.id} 
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar 
                        src={employee.avatar} 
                        alt={employee.name}
                        className="w-10 h-10"
                      />
                      {employee.active && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-sm text-gray-500">{employee.department}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {employee.visiting && (
                      <div className="text-sm text-gray-500">
                        Visiting {employee.visiting}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      <div>Signed in {employee.signedIn}</div>
                      <div>{employee.time}</div>
                    </div>
                    <IconButton 
                      size="small"
                      onClick={(e) => handleMenuOpen(e, employee)}
                    >
                      <MoreVertical size={16} />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Box>
      </CardContent>
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditEmployee}>
          <Edit size={16} className="mr-2" />
          Edit Details
        </MenuItem>
        <MenuItem onClick={handleToggleStatus}>
          {menuEmployee?.active ? (
            <>
              <UserX size={16} className="mr-2" />
              Mark as Inactive
            </>
          ) : (
            <>
              <User size={16} className="mr-2" />
              Mark as Active
            </>
          )}
        </MenuItem>
      </Menu>
      <CommonDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        width={400}
        tabs={[
          { label: "Edit Employee", content: drawerContent }
        ]}
        footerActions={{
          primaryLabel: "Save Changes",
          primaryAction: handleSaveChanges,
          secondaryLabel: "Cancel",
          secondaryAction: handleCloseDrawer
        }}
      />
    </Card>
  );
};

export default EmployeesView;