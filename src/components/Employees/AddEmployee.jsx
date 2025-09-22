import React from "react";
import "../../styles/employee.css";
import EmployeeForm from "./EmployeeForm";


const AddEmployee = ({ departments,workLocation,employmentType,designations,jobTitle,subdepartment,managers, onSave, onCancel }) => {


  const handleSaveNewEmployee = (newEmployee) => {
    // Additional validation or preprocessing can be done here
    const employeeToSave = {
      ...newEmployee,
    };

    // Call the onSave prop with the new employee
    onSave(employeeToSave);
  };

  const handleCancelAdd = () => {
    // Simply call the onCancel prop passed from parent
    onCancel();
  };

  return (
    <EmployeeForm 
      departments={departments} 
      subdepartment={subdepartment}
      jobTitle={jobTitle}
      workLocation={workLocation}
      employmentType={employmentType}
      designations={designations}
      managers={managers}
      onSave={handleSaveNewEmployee} 
      onCancel={handleCancelAdd} 
    />
  );
};

export default AddEmployee;