import api from "./api_call";



export const getToken = () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }
  return token;
};


// export const createLeaveEntry = async (data) => {
//   const token = getToken();


//   const response = await api.post('/leaves', data, {
// headers: { 
//       Authorization: `Bearer ${token}`,
//       'Content-Type': 'application/json'

//      },  });
//   if (response.status !== 200 && response.status !== 201){
//     throw new Error(response.data.message);
// } 
  
//   return response.data.data;
// };

// export const updateLeaveEntry = async (data) => {
//   const token = getToken();
 

//   const response = await api.put(`/leaves/${data.id}`, data, {
// headers: { 
//       Authorization: `Bearer ${token}`,
//       'Content-Type': 'application/json'

//      },  });

//  if (response.status !== 200 && response.status !== 201){
//         throw new Error(response.data.message);
//     } 

// return response.data.data;
// };

// export const deleteLeaveEntry = async (id) => {
//   const token = getToken();
 

//   const response = await api.delete(`/leaves/${id}`, {
// headers: { 
//       Authorization: `Bearer ${token}`,
//       'Content-Type': 'application/json'

//      },  });
//   if (response.status !== 200 && response.status !== 201){
//     throw new Error(response.data.message);
// } 

// return response.data.data;
// };

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

// export const updateLeaveStatus = async (leaveId,data) => {
//     const token = getToken();
  
  
//     const response = await api.put(`/leaves/${leaveId}/updateStatus`,data, {
//   headers: { 
//       Authorization: `Bearer ${token}`,
//       'Content-Type': 'application/json'

//      },    });
//       if (response.status !== 200 && response.status !== 201){
//         throw new Error(response.data.message);
//     } 
    
    
//     return response.data.data;
//   };

export const fetchEmployeeLeaves = async (employeeId) => {
    const token = getToken();
  
  
    const response = await api.get(`/leaves/employee/${employeeId}`, {
  headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'

     },    });
      if (response.status !== 200 && response.status !== 201){
        throw new Error(response.data.message);
    } 
    
    
    return response.data.data;
  };
// export const fetchLeaveBalance = async (employeeId) => {
//   const token = getToken();
//   const response = await api.get(`/leaves/balance/employee/${employeeId}`, {
// headers: { 
//       Authorization: `Bearer ${token}`,
//       'Content-Type': 'application/json'

//      },  });

//      console.log(response.status);
     
//     if (response.status !== 200 && response.status !== 404){
//         throw new Error(response.data.message);
//     } 
  
  
//   return response.data.data;
// };

export const fetchEmployeeRules = async (employeeId) => {
  const token = getToken();
  const response = await api.get(`/leaves/rules/employee/${employeeId}`, {
headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'

     },  });
    if (response.status !== 200 && response.status !== 201&& response.data.message!=='No leave rules found for the employee'){
        throw new Error(response.data.message);
    } 
    
    const data=response.data.data
    console.log(data)
    return data.map((item) => ({
        id: item.rule.id,
        name: item.rule.leaveType,
    
      }))
  
};

export const fetchAllLeaveRules = async (orgId) => {
  const token = getToken();
 
  const response = await api.get(`/leaves/rules`, {
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
  const response = await api.post(`/leaves/assign-rule/${employeeId}/${ruleId}`,{},{
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
   if(response.data.statusCode !== 200 &&response.data.statusCode !== 201){
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



export const checkIn = async () => {
  const token = getToken();


 const response = await api.post('/attendances/start', null, {
  headers: { 
    Authorization: `Bearer ${token}`,
  },

});


if (response.status !== 200 && response.status !== 201) {
  throw new Error(JSON.stringify(response.data));
} 

return response.data.data;
}

export const checkOut = async () => {
  const token = getToken();


 const response = await api.post('/attendances/stop', null, {
  headers: { 
    Authorization: `Bearer ${token}`,
  },

});


if (response.status !== 200 && response.status !== 201) {
  throw new Error(JSON.stringify(response.data));
} 

return response.data.data;
}




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

// export const leaveAPI = {
  
// uploadAttachment: async (file, onProgress) => {
//   try {
//     const formData = new FormData();
//     formData.append('file', file);

//     const response = await api.post('/leaves/upload-attachment', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//       onUploadProgress: (event) => {
//         if (event.lengthComputable) {
//           const percentComplete = (event.loaded * 100) / event.total;
//           onProgress?.(percentComplete);
//         }
//       },
//     });

//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.message || 'Upload failed');
//   }
// },


//   createLeave: async (leaveData) => {
//     try {
//       const response = await api.post('/leaves', leaveData, {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
//       return response.data;
//     } catch (error) {
//       throw new Error(error.response?.data?.message || 'Failed to create leave application');
//     }
//   },

//   updateLeave: async (id, leaveData) => {
//     try {
//       const response = await api.put(`/leaves/${id}`, leaveData, {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
//       return response.data;
//     } catch (error) {
//       throw new Error(error.response?.data?.message || 'Failed to update leave application');
//     }
//   },

//   updateLeaveStatus: async (id, statusData) => {
//     try {
//       const response = await api.put(`/leaves/${id}/updateStatus`, statusData, {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
//       return response.data;
//     } catch (error) {
//       throw new Error(error.response?.data?.message || 'Failed to update leave status');
//     }
//   },

//   deleteLeave: async (id) => {
//     try {
//       const response = await api.delete(`/leaves/${id}`);
//       return response.data;
//     } catch (error) {
//       throw new Error(error.response?.data?.message || 'Failed to delete leave application');
//     }
//   },

//   getLeaveBalance: async (employeeId) => {
//     try {
//       const response = await api.get(`/leaves/balance/employees/${employeeId}`);
//       return response.data;
//     } catch (error) {
//       throw new Error(error.response?.data?.message || 'Failed to fetch leave balance');
//     }
//   },

//   getEmployeeLeaveRules: async (employeeId) => {
//     try {
//       const response = await api.get(`/leaves/rules/employees/${employeeId}`);
//       return response.data;
//     } catch (error) {
//       throw new Error(error.response?.data?.message || 'Failed to fetch leave rules');
//     }
//   },

//   getPendingLeaves: async (employeeIds) => {
//     try {
//       const response = await api.post(
//         '/leaves/employees/pending-leaves',
//         { employeeIds },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         }
//       );
//       return response.data;
//     } catch (error) {
//       throw new Error(error.response?.data?.message || 'Failed to fetch pending leaves');
//     }
//   },
// };

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
 updateCtC: async (employeeId, ctc,currency) => {
    const token = getToken();
    try {
     if(ctc!==''||currency!==''){
       const payload = {
        ctc,
        currency

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
          response.data.message || "Failed to update ctc of employee"
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

   updateEmployeePhone: async (employeeId, phone) => {
    const token = getToken();
    try {
     if(phone!==''){
       const payload = {
        phone,
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
          response.data.message || "Failed to update phone of employee"
        );
      }
      return response.data.data;

     }
     

    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update employee information"
      );
    }
  },

  updateEmployeeReportingManger: async (employeeId, reportTo) => {
    const token = getToken();
    try {
     if(reportTo!==''){
       const payload = {
        reportTo,
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
          response.data.message || "Failed to update phone of employee"
        );
      }
      return response.data.data;

     }
     

    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update employee information"
      );
    }
  },

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
        swiftCode:data.swiftCode?.trim() || "",
        ibanNo:data.ibanNo?.trim() || "",
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
 downloadDocument: async (documentId) => {
  const token = getToken();
  try {
    const response = await api.get(
      `/documents/${documentId}/download`,  // Updated path
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      }
    );

    return response;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to download document"
    );
  }
},
};

export default personalInfoAPI;


/**
 * Fetch today's attendance task entries
 * @returns {Promise<Array>} Array of task entries for today
 */
export const fetchTodayTasks = async () => {
  const token = getToken();
  
  const response = await api.get('/attendances/today', {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(response.data.message || 'Failed to fetch today\'s tasks');
  }

  return response.data.data;
};

/**
 * Fetch attendance task entries for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Array>} Array of task entries for the specified date
 */
export const fetchTasksByDate = async (date,employeeId) => {
  const token = getToken();
  
  const response = await api.get('/attendances/tasks', {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    params: {
      employeeId: employeeId,
      date: date
    }
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(response.data.message || 'Failed to fetch tasks for the specified date');
    
  }
  

  return response.data.data;
};

/**
 * Fetch attendance task entries for a date range
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise<Array>} Array of task entries for the date range
 */
export const fetchTasksByDateRange = async (startDate, endDate) => {
  const token = getToken();
  
  const response = await api.get('/attendances/tasks', {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    params: {
      start: startDate,
      end: endDate
    }
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(response.data.message || 'Failed to fetch tasks for the date range');
  }

  return response.data.data;
};

/**
 * Update attendance task details
 * @param {number} taskId - Task ID to update
 * @param {Object} data - Task data to update (taskDescription, project, etc.)
 * @returns {Promise<Object>} Updated task data
 */
export const updateAttendanceTask = async (taskId, data) => {
  const token = getToken();

  const response = await api.put(`/attendances/${taskId}/tasks`, data, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(response.data.message || 'Failed to update task');
  }

  return response.data.data;
};

/**
 * Start attendance timer (check-in)
 * @returns {Promise<Object>} Check-in data
 */
export const startAttendanceTimer = async () => {
  const token = getToken();

  const response = await api.post('/attendances/start', null, {
    headers: { 
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(response.data.message || 'Failed to start timer');
  }

  return response.data.data;
};

/**
 * Stop attendance timer (check-out)
 * @param {Object} taskData - Task details (taskDescription, project, etc.)
 * @returns {Promise<Object>} Check-out data
 */
export const stopAttendanceTimer = async (taskData) => {
  const token = getToken();

  const response = await api.post('/attendances/stop', taskData, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(response.data.message || 'Failed to stop timer');
  }

  return response.data.data;
};

/**
 * Fetch attendance analytics for a specific date
 * This is a mock implementation - adjust according to your actual backend endpoint
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} Analytics data (present, absent, onLeave, total)
 */
export const fetchAttendanceAnalytics = async (date) => {
  const token = getToken();
  
  try {
    // If you have a dedicated analytics endpoint, use it:
    // const response = await api.get('/attendances/analytics', {
    //   headers: { 
    //     Authorization: `Bearer ${token}`,
    //     'Content-Type': 'application/json'
    //   },
    //   params: { date }
    // });

    // For now, we'll calculate analytics from attendance data
    // You should replace this with your actual analytics endpoint
    const response = await api.get('/attendances/tasks', {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: { date }
    });

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(response.data.message || 'Failed to fetch analytics');
    }

    // Mock analytics calculation - replace with actual backend data
    const tasks = response.data.data || [];
    const uniqueEmployees = new Set(tasks.map(task => task.employeeId));
    
    // These values should come from your backend
    // This is just a placeholder calculation
    return {
      present: uniqueEmployees.size,
      absent: Math.max(0, 10 - uniqueEmployees.size), // Replace with actual logic
      onLeave: 2, // Replace with actual leave data
      total: 12 // Replace with actual total employees
    };

  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to fetch attendance analytics'
    );
  }
};

/**
 * Fetch attendance records with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.employeeId - Filter by employee ID
 * @param {string} params.startDate - Start date filter
 * @param {string} params.endDate - End date filter
 * @returns {Promise<Object>} Paginated attendance data
 */
export const fetchAttendance = async ({
  page = 1,
  limit = 10,
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
    },
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(response.data.message || 'Failed to fetch attendance records');
  }

  return {
    data: response.data.data,
    total: response.data.total || response.data.data.length,
  };
};

// GET dashboard analytics for today (used on top)
export async function getDashboard(date) {
  const params = date ? { date } : {};
  const token = getToken();
  const res = await api.get("/attendances/dashboard", { params, headers: { 
      Authorization: `Bearer ${token}`,
    }});
  return res.data.data;
}

// GET employees list for org
export async function getEmployees(orgId) {
  const token = getToken();
  const res = await api.get("/employees", { params: { orgId }, headers: { 
      Authorization: `Bearer ${token}`,
    }});
  return res.data;
}

// GET attendance export as Excel
export async function getExport(start, end) {
  const res = await api.get("/attendances/export", {
    params: {
      start: start.toISOString().substring(0, 10),
      end: end.toISOString().substring(0, 10)
    },
    responseType: "blob", // downloading Excel file
  });
  // Download file as Excel (using a blob)
  const url = window.URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = "attendance_export.xlsx";
  a.click();
  window.URL.revokeObjectURL(url);
}

// GET employee logs (by date)
export async function getTaskLogs(employeeId, date) {
  const res = await api.get("/attendances/tasks", {
    params: {
      date: date.toISOString().substring(0, 10)
    },
    headers: {
      "x-employee-id": employeeId,
    },
  });
  return res.data.data;
}

export async function fetchEmployeesAttendance(orgId, date) {
  const formattedDate = date.toISOString().substring(0, 10);
    const token = getToken();

  const res = await api.get("/attendances/employees", {
    params: { orgId, date: formattedDate },headers: { 
      Authorization: `Bearer ${token}`,
    }
  });
  return res.data.data;
}

export const fetchMonthlyLogs = async (startDate, endDate) => {
  try {
        const token = getToken();

    const response = await api.get(
      `/attendances/monthly-logs?startDate=${startDate}&endDate=${endDate}`,{
         headers: { 
      Authorization: `Bearer ${token}`,
    }
      }
    );
    console.log(response)
    if (response.status!==200) {
      const error = await response.data.json();
      throw new Error(error.message || 'Failed to fetch monthly logs');
    }

    return  response.data;
  } catch (error) {
    console.error('Error fetching monthly logs:', error);
    throw error;
  }

  
};
export const fetchEmployeeMonthlyLogs = async (startDate, endDate,employeeId) => {
  try {
        const token = getToken();

    const response = await api.get(
      `/attendances/employee-monthly-logs?startDate=${startDate}&endDate=${endDate}&employeeId=${employeeId}`,{
         headers: { 
      Authorization: `Bearer ${token}`,
    }
      }
    );
    console.log(response)
    if (response.status!==200) {
      const error = await response.data.json();
      throw new Error(error.message || 'Failed to fetch monthly logs');
    }

    return  response.data;
  } catch (error) {    
    console.error('Error fetching monthly logs:', error);
    throw error;
  }

  
};

export const fetchActiveTimer = async () => {
  const token = getToken();

  const response = await api.get('/attendances/active-timer', {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(response.data.message || 'Failed to fetch active timer');
  }

  return response.data.data;
};

export const checkExistence = async (payload) => {
  const token = getToken();

  
  const response = await api.post('/employees/check-existence', payload, {
    headers: { 
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(response.data.message || 'Failed to start timer');
  }

  return response.data.data;
};


/*
 * ==================== LEAVE RULES APIs ====================
 */

/**
 * Create a new leave rule (Admin only)
 * @param {Object} ruleData - Leave rule data
 * @returns {Promise} Created leave rule
 */
export const createLeaveRule = async (ruleData) => {
  const token = getToken();
  
  const response = await api.post('/leaves/rules', ruleData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(response.data.message || 'Failed to create leave rule');
  }

  return response.data.data;
};

/**
 * Update an existing leave rule (Admin only)
 * @param {number} ruleId - Leave rule ID
 * @param {Object} ruleData - Updated leave rule data
 * @returns {Promise} Updated leave rule
 */
export const updateLeaveRule = async (ruleId, ruleData) => {
  const token = getToken();
  
  const response = await api.put(`/leaves/rules/${ruleId}`, ruleData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(response.data.message || 'Failed to update leave rule');
  }

  return response.data.data;
};

/**
 * Get all leave rules for organization (Admin/Manager)
 * @returns {Promise} Array of leave rules
 */
export const getLeaveRules = async () => {
  const token = getToken();
  
  const response = await api.get('/leaves/rules', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(response.data.message || 'Failed to fetch leave rules');
  }

  return response.data.data;
};

/**
 * Get leave rule by type (Admin/Manager)
 * @param {string} leaveType - Leave type (e.g., 'sick', 'casual', 'annual')
 * @returns {Promise} Leave rule details
 */
export const getLeaveRuleByType = async (leaveType) => {
  const token = getToken();
  
  const response = await api.get(`/leaves/rules/${leaveType}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(response.data.message || 'Failed to fetch leave rule');
  }

  return response.data.data;
};

/**
 * Delete a leave rule (Admin only)
 * @param {number} ruleId - Leave rule ID
 * @returns {Promise} Deletion confirmation
 */
export const deleteLeaveRule = async (ruleId) => {
  const token = getToken();
  
  const response = await api.delete(`/leaves/rules/${ruleId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (response.status !== 200 && response.status !== 204) {
    throw new Error(response.data.message || 'Failed to delete leave rule');
  }

  return response.data.data;
};

/**
 * Initialize default leave rules for organization (Admin only)
 * @param {string} location - Location ('India' or 'Qatar')
 * @returns {Promise} Created default rules
 */
export const initializeDefaultLeaveRules = async (location) => {
  const token = getToken();
  
  const response = await api.post('/leaves/rules/initialize', { location }, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(response.data.message || 'Failed to initialize default rules');
  }

  return response.data.data;
};

/*
 * ==================== LEAVE APPLICATIONS APIs ====================
 */

/**
 * Apply for leave
 * @param {Object} leaveData - Leave application data
 * @returns {Promise} Created leave application
 */
export const applyLeave = async (leaveData) => {
  const token = getToken();
  
  const response = await api.post('/leaves/apply', leaveData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(response.data.message || 'Failed to apply for leave');
  }

  return response.data.data;
};

/**
 * Update leave application
 * @param {number} leaveId - Leave ID
 * @param {Object} leaveData - Updated leave data
 * @returns {Promise} Updated leave application
 */
export const updateLeaveApplication = async (leaveId, leaveData) => {
  const token = getToken();
  
  const response = await api.put(`/leaves/${leaveId}`, leaveData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(response.data.message || 'Failed to update leave application');
  }

  return response.data.data;
};

/**
 * Delete leave application
 * @param {number} leaveId - Leave ID
 * @returns {Promise} Deletion confirmation
 */
export const deleteLeaveApplication = async (leaveId) => {
  const token = getToken();
  
  const response = await api.delete(`/leaves/${leaveId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (response.status !== 200 && response.status !== 204) {
    throw new Error(response.data.message || 'Failed to delete leave application');
  }

  return response.data.data;
};

/**
 * Approve or reject leave (Admin/Manager only)
 * @param {number} leaveId - Leave ID
 * @param {Object} statusData - Status update data (status, remarks)
 * @returns {Promise} Updated leave application
 */
export const approveRejectLeave = async (leaveId, statusData) => {
  const token = getToken();
  
  const response = await api.put(`/leaves/${leaveId}/status`, statusData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(response.data.message || 'Failed to update leave status');
  }

  return response.data.data;
};

/**
 * Get current user's leaves
 * @param {Object} filter - Filter parameters (optional)
 * @returns {Promise} Array of user's leaves
 */
export const getMyLeaves = async (filter = {}) => {
  const token = getToken();
  
  const queryParams = new URLSearchParams(filter).toString();
  const url = `/leaves/my-leaves${queryParams ? `?${queryParams}` : ''}`;
  
  const response = await api.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(response.data.message || 'Failed to fetch your leaves');
  }

  return response.data;
};

/**
 * Get subordinate leaves (for managers)
 * @param {Object} filter - Filter parameters (optional)
 * @returns {Promise} Array of subordinate leaves
 */
export const getSubordinateLeaves = async (filter = {}) => {
  const token = getToken();
  
  const queryParams = new URLSearchParams(filter).toString();
  const url = `/leaves/subordinates${queryParams ? `?${queryParams}` : ''}`;
  
  const response = await api.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(response.data.message || 'Failed to fetch subordinate leaves');
  }

  return response.data.data;
};

/**
 * Get subordinate leaves with pagination (for managers)
 * @param {Object} filter - Filter parameters (optional)
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @returns {Promise} Paginated subordinate leaves with metadata
 */
export const getSubordinateLeavesWithPagination = async (filter = {}, page = 1, limit = 10) => {
  const token = getToken();
  
  const params = {
    ...filter,
    page: page.toString(),
    limit: limit.toString()
  };
  
  const queryParams = new URLSearchParams(params).toString();
  const url = `/leaves/subordinates/leaves/paginated?${queryParams}`;
  
  const response = await api.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(response.data.message || 'Failed to fetch subordinate leaves');
  }

  return response.data.data;
};

/**
 * Get leaves for a specific employee (Admin/Manager only)
 * @param {number} employeeId - Employee ID
 * @param {Object} filter - Filter parameters (optional)
 * @returns {Promise} Array of employee's leaves
 */
export const getEmployeeLeaves = async (employeeId, filter = {}) => {
  const token = getToken();
  
  const queryParams = new URLSearchParams(filter).toString();
  const url = `/leaves/employee/${employeeId}${queryParams ? `?${queryParams}` : ''}`;
  
  const response = await api.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(response.data.message || 'Failed to fetch employee leaves');
  }

  return response.data.data;
};

/**
 * Get all leaves (Admin/Manager only)
 * @param {Object} filter - Filter parameters (optional)
 * @returns {Promise} Array of all leaves
 */
export const getAllLeaves = async (filter = {}) => {
  const token = getToken();
  
  const queryParams = new URLSearchParams(filter).toString();
  const url = `/leaves${queryParams ? `?${queryParams}` : ''}`;
  
  const response = await api.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(response.data.message || 'Failed to fetch all leaves');
  }

  return response.data.data;
};

/**
 * Get leave details by ID
 * @param {number} leaveId - Leave ID
 * @returns {Promise} Leave details
 */
export const getLeaveById = async (leaveId) => {
  const token = getToken();
  
  const response = await api.get(`/leaves/${leaveId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(response.data.message || 'Failed to fetch leave details');
  }

  return response.data.data;
};

/*
 * ==================== LEAVE BALANCE & REPORTS ====================
 */

/**
 * Get leave balance for an employee
 * @param {number} employeeId - Employee ID
 * @returns {Promise} Leave balance details
 */
export const getLeaveBalance = async (employeeId) => {
  const token = getToken();
  
  const response = await api.get(`/leaves/balance/employee/${employeeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (response.status !== 200 && response.status !== 404) {
    throw new Error(response.data.message || 'Failed to fetch leave balance');
  }

  return response.data;
};

/**
 * Get compliance report (Admin only)
 * @param {Object} filter - Filter parameters
 * @returns {Promise} Compliance report data
 */
export const getComplianceReport = async (filter = {}) => {
  const token = getToken();
  
  const queryParams = new URLSearchParams(filter).toString();
  const url = `/leaves/reports/compliance${queryParams ? `?${queryParams}` : ''}`;
  
  const response = await api.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(response.data.message || 'Failed to fetch compliance report');
  }

  return response.data.data;
};

/**
 * Get audit report (Admin only)
 * @param {Object} filter - Filter parameters
 * @returns {Promise} Audit report data
 */
export const getAuditReport = async (filter = {}) => {
  const token = getToken();
  
  const queryParams = new URLSearchParams(filter).toString();
  const url = `/leaves/reports/audit${queryParams ? `?${queryParams}` : ''}`;
  
  const response = await api.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(response.data.message || 'Failed to fetch audit report');
  }

  return response.data.data;
};

export const getLeaveTypesWithBalances = async () => {
  const token = getToken();

  const response = await api.get('leaves/my-leave-types/balances', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status !== 200) {
    throw new Error(response.data.message || 'Failed to fetch leave types with balances');
  }

  return response.data.data;
};

/**
 * Validate leave dates (check weekends, holidays, sandwiching)
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise} Validation result with details
 */
export const validateLeaveDates = async (startDate, endDate) => {
  const token = getToken();
  
  const response = await api.get('/leaves/validate-dates', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    params: {
      startDate,
      endDate
    }
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(response.data.message || 'Failed to validate leave dates');
  }

  return response.data;
};

/**
 * Get organization holidays
 * @param {number} year - Year (optional, defaults to current year)
 * @returns {Promise} Array of holidays
 */
export const getHolidays = async (year) => {
  const token = getToken();
  
  const params = year ? { year: year.toString() } : {};
  
  const response = await api.get('/leaves/holidays', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    params
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(response.data.message || 'Failed to fetch holidays');
  }

  return response.data.data;
};

/**
 * Create a new holiday (Admin only)
 * @param {Object} holidayData - Holiday data { name, date, description }
 * @returns {Promise} Created holiday
 */
export const createHoliday = async (holidayData) => {
  const token = getToken();
  
  const response = await api.post('/leaves/holidays', holidayData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(response.data.message || 'Failed to create holiday');
  }

  return response.data.data;
};

/**
 * Delete a holiday (Admin only)
 * @param {number} holidayId - Holiday ID
 * @returns {Promise} Deletion confirmation
 */
export const deleteHoliday = async (holidayId) => {
  const token = getToken();
  
  const response = await api.delete(`/leaves/holidays/${holidayId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.status !== 200 && response.status !== 204) {
    throw new Error(response.data.message || 'Failed to delete holiday');
  }

  return response.data;
};


/*
 * ==================== LEGACY COMPATIBILITY ====================
 * Keep existing functions for backward compatibility
 */

export const fetchLeavesEntries = async (role, employeeId) => {
  if (role === 'user') {
    return await getMyLeaves();
  } else {
    return await getAllLeaves();
  }
};

export const createLeaveEntry = async (data) => {
  return await applyLeave(data);
};

export const updateLeaveEntry = async (data) => {
  return await updateLeaveApplication(data.id, data);
};

export const deleteLeaveEntry = async (id) => {
  return await deleteLeaveApplication(id);
};

export const updateLeaveStatus = async (leaveId, data) => {
  return await approveRejectLeave(leaveId, data);
};

export const fetchLeaveBalance = async (employeeId) => {
  return await getLeaveBalance(employeeId);
};

// Export all leave-related functions
export const leaveAPI = {
  // Leave Rules
  createLeaveRule,
  updateLeaveRule,
  getLeaveRules,
  getLeaveRuleByType,
  deleteLeaveRule,
  initializeDefaultLeaveRules,
  
  // Leave Applications
  applyLeave,
  updateLeaveApplication,
  deleteLeaveApplication,
  approveRejectLeave,
  getMyLeaves,
  getEmployeeLeaves,
  getAllLeaves,
  getLeaveById,
  getSubordinateLeaves,
  
  // Balance & Reports
  getLeaveTypesWithBalances,
  getLeaveBalance,
  getComplianceReport,
  getAuditReport,
  
  // Legacy compatibility
  fetchLeavesEntries,
  createLeaveEntry,
  updateLeaveEntry,
  deleteLeaveEntry,
  updateLeaveStatus,
  fetchLeaveBalance,

  //holidays:
  validateLeaveDates,
  getHolidays,
  createHoliday,
  deleteHoliday,
};