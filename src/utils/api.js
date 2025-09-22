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
 if (response.data.statusCode !== 200 && response.data.statusCode !== 201){
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
  if (response.data.statusCode !== 200 && response.data.statusCode !== 201){
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

 if (response.data.statusCode !== 200 && response.data.statusCode !== 201){
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
  if (response.data.statusCode !== 200 && response.data.statusCode !== 201){
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
    if (response.data.statusCode !== 200 && response.data.statusCode !== 201){
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
    if (response.data.statusCode !== 200 && response.data.statusCode !== 201){
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
      if (response.data.statusCode !== 200 && response.data.statusCode !== 201){
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
      if (response.data.statusCode !== 200 && response.data.statusCode !== 201){
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

     console.log(response.data.statusCode);
     
    if (response.data.statusCode !== 200 && response.data.statusCode !== 404){
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
    if (response.data.statusCode !== 200 && response.data.statusCode !== 201&& response.data.message!=='No leave rules found for the employee'){
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
    if (response.data.statusCode !== 200 && response.data.statusCode !== 201){
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
    if (response.data.statusCode !== 200 && response.data.statusCode !== 201){
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
    if (response.data.statusCode !== 200 && response.data.statusCode !== 201){
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
    if (response.data.statusCode !== 200 && response.data.statusCode !== 201){
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
  if (response.data.statusCode !== 200 && response.data.statusCode !== 201) {
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
    if (response.data.statusCode !== 200 && response.data.statusCode !== 201){
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
    if (response.data.statusCode !== 200 && response.data.statusCode !== 201){
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

  if (response.data.statusCode !== 200 && response.data.statusCode !== 201) {
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
    
    const token = getToken();

    // Important: responseType must be 'arraybuffer' to handle binary data correctly  13.203.97.195
    const response = await api.get(`/payroll/presignedUrl/${payslipId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
  
       },
    });

    console.log(response);
    
    
    
    const { url } = response.data;
    if (!url) throw new Error('No presigned URL received from backend');

    const responseData = await fetch(url);
    const reader = responseData.body.getReader();
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
      if (response.data.statusCode !== 200 && response.data.statusCode !== 201){
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
      if (response.data.statusCode !== 200 && response.data.statusCode !== 201){
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