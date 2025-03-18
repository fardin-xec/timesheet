import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginUser, registerUser, resetPassword,verifyOtp,resetPasswordWithOtp } from '../../utils/api';

const initialState = {
  isAuthenticated: false,
  token: localStorage.getItem('token') || null,
  user: null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginUser(credentials);
      localStorage.setItem('token', response.token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await registerUser(userData);
      localStorage.setItem('token', response.token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);



export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async (email, { rejectWithValue }) => {
      try {
        const response = await resetPassword(email);
        return response;
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );
  
  // You can also add these actions for OTP verification and password reset
  export const verifyOtpAction = createAsyncThunk(
    'auth/verifyOtp',
    async ({ email, otp }, { rejectWithValue }) => {
      try {
        const response = await verifyOtp(email, otp);
        return response;
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );
  
  export const resetPasswordWithOtpAction = createAsyncThunk(
    'auth/resetPasswordWithOtp',
    async ({ email, otp, newPassword }, { rejectWithValue }) => {
      try {
        const response = await resetPasswordWithOtp(email, otp, newPassword);
        return response;
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Signup cases
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Forgot password cases
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
      
  },
});



export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;

