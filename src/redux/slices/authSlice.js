import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api_call'; // Assuming you have an API service set up
import { setProfile, clearProfile } from './userSlice'; // Import actions from userSlice

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      console.log(credentials);
      
      const response = await api.post('/auth/login', credentials);
      // Store token and user data in localStorage      
      localStorage.setItem('access_token', response.data.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      localStorage.setItem('orgId', response.data.data.user.orgId);
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      localStorage.setItem('timezone', timezone);
    

     
      
      



     
      
      

      // Sync user profile with userSlice
      dispatch(setProfile(response.data.data.user));

      return response.data.data;
    } catch (error) {
      console.log(error);
      
      return rejectWithValue(
        error.response?.data?.message || 'Invalid user or password.'
      );
    }
  }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // You might want to call a logout endpoint here
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      localStorage.removeItem('orgId');
      localStorage.removeItem('elapsedTime');
    
      

 
      // Clear user profile in userSlice when logging out
      dispatch(clearProfile());

      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Check if user is already logged in
export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');
      const user = localStorage.getItem('user');


      if (!token || !user) {
        console.log('Check Auth Status - No token or user data found');
        return false;
      }

      const response = await api.get('/token/check', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.message==="Token is valid") {
        const parsedUser = JSON.parse(user);
        dispatch(setProfile(parsedUser));
        return { token, user: parsedUser };
      } else {
        localStorage.removeItem('access_token');
        dispatch(clearProfile());
        console.log('Auth check failed - Invalid token');
        return false;
      }
    } catch (error) {
      localStorage.removeItem('access_token');
      dispatch(clearProfile());
      console.error('Check Auth Status - Error:', error.message);
      return rejectWithValue(error.message);
    }
  }
);


const initialState = () => {
  try {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    const token = localStorage.getItem('access_token');
    return {
      user,
      token,
      isAuthenticated: !!token,
      loading: false,
      error: null
    };
  } catch (error) {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null
    };
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: initialState(),
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Check auth status cases
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
  }
});

export const { clearErrors } = authSlice.actions;
export default authSlice.reducer;
