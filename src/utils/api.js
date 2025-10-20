import api from "./api_call";



const getToken = () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }
  return token;
};
/*
 Leaves Api
*/
export const fetchLeavesEntries = async (role,employeeId) => {
  const token = getToken();
  const url = role==='user' ? `/leaves/employees/${employeeId}` : '/leaves';
  const response = await api.get(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
 if (response.status !== 200 && response.status !== 201){
        throw new Error(response.data.message);
    } 

return response.data.data;
};

export const createLeaveEntry = async (data) => {
  const token = getToken();


  const response = await api.post('/leaves', data, {
headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'

     },  });
  if (response.status !== 200 && response.status !== 201){
    throw new Error(response.data.message);
} 
  
  return response.data.data;
};

export const updateLeaveEntry = async (data) => {
  const token = getToken();
 

  const response = await api.put(`/leaves/${data.id}`, data, {
headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'

     },  });

 if (response.status !== 200 && response.status !== 201){
        throw new Error(response.data.message);
    } 

return response.data.data;
};

export const deleteLeaveEntry = async (id) => {
  const token = getToken();
 

  const response = await api.delete(`/leaves/${id}`, {
headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'

     },  });
  if (response.status !== 200 && response.status !== 201){
    throw new Error(response.data.message);
} 

return response.data.data;
};

export const fetchEmployees = async (orgId) => {
  const token = getToken();


  const response = await api.get(`/employees/organization/${orgId}`, {
headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'

     },  });
    if (response.status !== 200 && response.status !== 201){
        throw new Error(response.data.message);
    } 
  
  
  return response.data.data;
};

export const fetchEmployeesWithLeaves = async () => {
  const token = getToken();


  const response = await api.get(`/employees/leaves`, {
headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'

     },  });
    if (response.status !== 200 && response.status !== 201){
        throw new Error(response.data.message);
    } 
  
  
  return response.data.data;
};

export const updateLeaveStatus = async (leaveId,data) => {
    const token = getToken();
  
  
    const response = await api.put(`/leaves/${leaveId}/updateStatus`,data, {
  headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'

     },    });
      if (response.status !== 200 && response.status !== 201){
        throw new Error(response.data.message);
    } 
    
    
    return response.data.data;
  };

export const fetchEmployeeLeaves = async (employeeId) => {
    const token = getToken();
  
  
    const response = await api.get(`/leaves/employees/${employeeId}`, {
  headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'

     },    });
      if (response.status !== 200 && response.status !== 201){
        throw new Error(response.data.message);
    } 
    
    
    return response.data.data;
  };
export const fetchLeaveBalance = async (employeeId) => {
  const token = getToken();
  const response = await api.get(`/leaves/balance/employees/${employeeId}`, {
headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'

     },  });

     console.log(response.status);
     
    if (response.status !== 200 && response.status !== 404){
        throw new Error(response.data.message);
    } 
  
  
  return response.data.data;
};

export const fetchEmployeeRules = async (employeeId) => {
  const token = getToken();
  const response = await api.get(`/leaves/rules/employees/${employeeId}`, {
headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'

     },  });
    if (response.status !== 200 && response.status !== 201&& response.data.message!=='No leave rules found for the employee'){
        throw new Error(response.data.message);
    } 
    
    const data=response.data.data

    return data.map((item) => ({
        id: item.rule.id,
        name: item.rule.leaveType,
    
      }))
  
};

export const fetchAllLeaveRules = async (orgId) => {
  const token = getToken();
 
  const response = await api.get(`/leaves/rules/${orgId}`, {
headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'

     },  });
    if (response.status !== 200 && response.status !== 201){
        throw new Error(response.data.message);
    } 
    const data=response.data.data
    return data.map((item) => ({
        id: item.id,
        name: item.leaveType,
    
      }))
};

export const assignRule = async (employeeId, ruleId) => {
  const token = getToken();
  const response = await api.post(`/leaves/assign-rule/${employeeId}/${ruleId}`, {
headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'

     },  });
    if (response.status !== 200 && response.status !== 201){
        throw new Error(response.data.message);
    } 
  
  
  return response.data.data;
};

export const unassignLeaveRule = async (employeeId, ruleId) => {
  const token = getToken();
  const response = await api.delete(`/leaves/unassign-rule/${employeeId}/${ruleId}`, {
headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'

     },  });
    if (response.status !== 200 && response.status !== 201){
        throw new Error(response.data.message);
    } 
  
  
  return response.data.data;
};

export const fetchPendingEmployeesLeaves = async (employeeIds) => {
  const token = getToken();
  const response = await api.post(`/leaves/employees/pending-leaves`,{employeeIds}, {
headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'

     },  });
    if (response.status !== 200 && response.status !== 201){
        throw new Error(response.data.message);
    } 
  
  
  return response.data.data;
};

export const fetchAttendance = async ({
  page,
  limit,
  employeeId,
  startDate,
  endDate,
}) => {
  const token = getToken();
  let url = `/attendances?page=${page}&limit=${limit}`;
  if (employeeId) url += `&employeeId=${employeeId}`;
  if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
  if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;

  const response = await api.get(url, {
headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'

     },  });
  if (response.status !== 200 && response.status !== 201) {
    throw new Error(response.data.message);
  }
  return {
    data: response.data.data,
    total: response.data.total || response.data.data.length, // Adjust based on API response structure
  };
};

export const updateAttendance = async (employeeId,data) => {
  const token = getToken();


  const response = await api.put(`/attendances/employees/${employeeId}`,data, {
headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'

     },  });
    if (response.status !== 200 && response.status !== 201){
      throw new Error(response.data.message);
  } 
  
  
  return response.data.data;
};


export const updateAttendanceTask = async (id,data) => {
  const token = getToken();


  const response = await api.put(`/attendances/${id}`,data, {
headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'

     },  });
    if (response.status !== 200 && response.status !== 201){
      throw new Error(response.data.message);
  } 
  
  
  return response.data.data;
};


export const fetchPayroll = async ({ page, limit, month, year, employeeId },orgId) => {
  const token = getToken();

  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    month: month.toString(),
    year: year.toString(),
    ...(employeeId && { employeeId }),
  });

  const response = await api.get(`/payroll/${orgId}?${queryParams}`, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'

     },
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(response.data.message);
  }

  const { data, total } = response.data.data;

  return {
    data,
    total,
  };
};



export const fetchPresignedUrlBackend = async (payslipId,signal) => {
  try {
    
    

    // Important: responseType must be 'arraybuffer' to handle binary data correctly  13.203.97.195
    const response = await api.get(`${payslipId}`, {
      headers: { 
        'Content-Type': 'application/json'
  
       },
    });

    console.log(response);
    
    
    
    
    const reader = response.data;
    console.log(reader)
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const blob = new Blob(chunks, { type: 'application/pdf' });
    return blob;

  } catch (error) {
    console.log(error);
    
    // Handle errors and provide meaningful message
    let errorMessage = 'Failed to fetch payslip PDF';
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 404) {
        errorMessage = 'Payslip PDF not found';
      } else {
        errorMessage = `Server error: ${error.response.status}`;
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No response from server';
    }
    
    throw new Error(errorMessage);
  }
};




export const bulkUpdatePayroll = async (data) => {
    const token = getToken();
    
  
    const response = await api.put(`/payroll/bulkApprove`,{data}, {
  headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
  
       },  });
      if (response.status !== 200 && response.status !== 201){
        throw new Error(response.data.message);
    } 
    
    
    return response.data.data;
  };


export const updatePayroll = async (payslipId,data) => {
    const token = getToken();
  
  
    const response = await api.patch(`/payroll/${payslipId}`,{ "otherAllowances": data.otherAllowances}, {
  headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
  
       },  });
      if (response.status !== 200 && response.status !== 201){
        throw new Error(response.data.message);
    } 
    
    
    return response.data.data;
  };

  export const deletePayroll = async (id) => {
    const token = getToken();
  
  
    const response = await api.delete(`/payroll/${id}`, {
  headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
  
       },  });
       
      if (response.status !== 200 && response.status !== 204){
        throw new Error(response.data.message);
    } 
    
    
    return response.data.data;
  };

  export const requestPasswordResetOtp = async (email) => {
  
  
      const response = await api.post('auth/otp/request', { email },{
      headers: { 
        'Content-Type': 'application/json'
  
       },  });
       
      if (response.status !== 200 && response.status !== 201){
        throw new Error(response.data.message);
    } 
    
    
    return response.data.data;
  };
  
  
  export const verifyOtp = async (email, otp) => {
  
  
    const response = await api.post('auth/otp/verify', { email,otp },{
    headers: { 
      'Content-Type': 'application/json'

     },  });

     
    if (response.status !== 200 && response.status !== 201){
      throw new Error(response.data.message);
  } 

  
  
  
  return response.data;

};
  
  export const resetPassword = async (id,password) => {
  
  
    const response = await api.put(`auth/user/${id}`, {
      password
    });
     
    if (response.status !== 200 && response.status !== 204){
      throw new Error(response.data.message);
  } 
  
  
  return response.data;
  };
  

  export const resendOtp = async (email) => {
  
  
    const response = await api.post('auth/otp/resend', { email },{
    headers: { 
      'Content-Type': 'application/json'

     },  });
     
    if (response.status !== 200 && response.status !== 201){
      throw new Error(response.data.message);
  } 
  
  
  return response.data.data;
  };
  
  export const resetEmployeePassword = async (id,oldPassword,newPassword) => {
    const token = getToken();
 
  
    const response = await api.put(`employees/user/${id}`, {
      oldPassword,
      newPassword,
    },{ headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'

     },});

     
     
    if (response.status !== 200 && response.status !== 204){
      throw new Error(response.data.message);
  } 
  
  
  return response;
  };

export const leaveAPI = {
  
uploadAttachment: async (file, onProgress) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/leaves/upload-attachment', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded * 100) / event.total;
          onProgress?.(percentComplete);
        }
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Upload failed');
  }
},


  createLeave: async (leaveData) => {
    try {
      const response = await api.post('/leaves', leaveData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create leave application');
    }
  },

  updateLeave: async (id, leaveData) => {
    try {
      const response = await api.put(`/leaves/${id}`, leaveData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update leave application');
    }
  },

  updateLeaveStatus: async (id, statusData) => {
    try {
      const response = await api.put(`/leaves/${id}/updateStatus`, statusData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update leave status');
    }
  },

  deleteLeave: async (id) => {
    try {
      const response = await api.delete(`/leaves/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete leave application');
    }
  },

  getLeaveBalance: async (employeeId) => {
    try {
      const response = await api.get(`/leaves/balance/employees/${employeeId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch leave balance');
    }
  },

  getEmployeeLeaveRules: async (employeeId) => {
    try {
      const response = await api.get(`/leaves/rules/employees/${employeeId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch leave rules');
    }
  },

  getPendingLeaves: async (employeeIds) => {
    try {
      const response = await api.post(
        '/leaves/employees/pending-leaves',
        { employeeIds },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch pending leaves');
    }
  },
};

export const personalInfoAPI = {
  // ============ PERSONAL INFORMATION ============

  /**
   * Fetch personal information for an employee
   * @param {string} employeeId - Employee ID
   * @returns {Promise} Personal information data
   */
  getPersonalInfo: async (employeeId) => {
    const token = getToken();
    try {
      const response = await api.get(`/personal/employee/${employeeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (
        response.status !== 200 &&
        response.status !== 201
      ) {
        throw new Error(
          response.data.message || "Failed to fetch personal information"
        );
      }

      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch personal information"
      );
    }
  },

  /**
   * Update personal information
   * @param {string} employeeId - Employee ID
   * @param {Object} data - Personal information data
   * @returns {Promise} Updated personal information
   */
   updatePersonalPic: async (employeeId, data) => {
    const token = getToken();
    try {
     if(data.avatar!==''){
       const payload = {
        avatar: data,
      }
      // Using PUT with /personal/:id route
      const response = await api.put(`/employees/${employeeId}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (
        response.status !== 200 &&
        response.status !== 201
      ) {
        throw new Error(
          response.data.message || "Failed to update personal information"
        );
      }
      return response.data.data;

     }
     

    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update personal information"
      );
    }
  },

   updatePersonalInfo: async (employeeId, data) => {
    const token = getToken();
    try {
     

      // Using PUT with /personal/:id route
      const response = await api.put(`/personal/${employeeId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (
        response.status !== 200 &&
        response.status !== 201
      ) {
        throw new Error(
          response.data.message || "Failed to update personal information"
        );
      }

      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update personal information"
      );
    }
  },

  // ============ BANK INFORMATION ============

  /**
   * Fetch bank account information
   * @param {string} employeeId - Employee ID
   * @returns {Promise} Bank information data
   */
  getBankInfo: async (employeeId) => {
    const token = getToken();
    try {
      const response = await api.get(`/personal/bank-account`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: { employeeId },
      });

      if (
        response.status !== 200 &&
        response.status !== 201
      ) {
        throw new Error(
          response.data.message || "Failed to fetch bank information"
        );
      }

      return response.data.data || {};
    } catch (error) {
      // Return empty object if bank info doesn't exist yet
      if (error.response?.status === 404) {
        return {};
      }
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch bank information"
      );
    }
  },

  /**
   * Update bank account information
   * @param {string} employeeId - Employee ID
   * @param {Object} data - Bank information data
   * @returns {Promise} Updated bank information
   */
  updateBankInfo: async (employeeId, data) => {
    const token = getToken();
    try {
      const payload = {
        employeeId,
        accountHolderName: data.accountHolderName?.trim() || "",
        bankName: data.bankName?.trim() || "",
        city: data.city?.trim() || "",
        branchName: data.branchName?.trim() || "",
        ifscCode: data.ifscCode?.toUpperCase().trim() || "",
        accountNo: data.accountNumber?.trim() || "",
      };

      const response = await api.put(`/personal/bank-account`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: { employeeId },
      });

      if (
        response.status !== 200 &&
        response.status !== 201
      ) {
        throw new Error(
          response.data.message || "Failed to update bank information"
        );
      }

      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update bank information"
      );
    }
  },

  // ============ DOCUMENTS ============

  /**
   * Fetch all documents for an employee
   * @param {string} employeeId - Employee ID
   * @returns {Promise} Array of document objects
   */
  getDocuments: async (employeeId) => {
    const token = getToken();
    try {
      const response = await api.get(`/personal/documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: { employeeId },
      });

      if (
        response.status !== 200 &&
        response.status !== 201
      ) {
        throw new Error(
          response.data.message || "Failed to fetch documents"
        );
      }

      return response.data.data || [];
    } catch (error) {
      // Return empty array if no documents exist
      if (error.response?.status === 404) {
        return [];
      }
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch documents"
      );
    }
  },

  /**
   * Upload a new document
   * @param {string} employeeId - Employee ID
   * @param {File} file - File to upload
   * @param {string} documentType - Type of document (aadhar, pan, passport, certificate, others)
   * @returns {Promise} Uploaded document data
   */
  uploadDocument: async (employeeId, file, documentType) => {
    const token = getToken();
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentType);

      // Backend expects employeeId as query parameter
      const response = await api.post(`/personal/documents`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        params: { employeeId },
      });

      if (
        response.status !== 201 &&
        response.status !== 200
      ) {
        throw new Error(
          response.data.message || "Failed to upload document"
        );
      }

      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to upload document"
      );
    }
  },

  /**
   * Replace an existing document
   * @param {string} employeeId - Employee ID
   * @param {string} documentId - Document ID to replace
   * @param {File} file - New file to upload
   * @returns {Promise} Updated document data
   */
  replaceDocument: async (employeeId, documentId, file) => {
    const token = getToken();
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.put(
        `/personal/documents/${documentId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          params: { employeeId },
        }
      );

      if (
        response.status !== 200 &&
        response.status !== 201
      ) {
        throw new Error(
          response.data.message || "Failed to replace document"
        );
      }

      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to replace document"
      );
    }
  },

  /**
   * Delete a document
   * @param {string} employeeId - Employee ID
   * @param {string} documentId - Document ID to delete
   * @returns {Promise} Deletion confirmation
   */
  deleteDocument: async (employeeId, documentId) => {
    const token = getToken();
    try {
      const response = await api.delete(`/personal/documents/${documentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: { employeeId },
      });

      if (
        response.status !== 200 &&
        response.status !== 204
      ) {
        throw new Error(
          response.data.message || "Failed to delete document"
        );
      }

      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete document"
      );
    }
  },

  /**
   * Get a specific document by ID
   * @param {string} employeeId - Employee ID
   * @param {string} documentId - Document ID
   * @returns {Promise} Document data
   */
  getDocumentById: async (employeeId, documentId) => {
    const token = getToken();
    try {
      const response = await api.get(`/personal/documents/${documentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: { employeeId },
      });

      if (
        response.status !== 200 &&
        response.status !== 201
      ) {
        throw new Error(
          response.data.message || "Failed to fetch document"
        );
      }

      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch document"
      );
    }
  },

  /**
   * Download a document file
   * @param {string} documentId - Document ID
   * @returns {Promise} Document file blob
   */
  // downloadDocument: async (documentId) => {
  //   const token = getToken();
  //   try {
  //     const response = await api.get(
  //       `/personal/documents/${documentId}/download`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //         responseType: "blob",
  //         params: { employeeId },
  //       }
  //     );

  //     return response.data;
  //   } catch (error) {
  //     throw new Error(
  //       error.response?.data?.message ||
  //         error.message ||
  //         "Failed to download document"
  //     );
  //   }
  // },
};

export default personalInfoAPI;