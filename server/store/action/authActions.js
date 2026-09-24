import { createAsyncThunk } from '@reduxjs/toolkit';
import { clientServer } from '../index.js';

export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, thunkAPI) => {
        try {
            const response = await clientServer.post('/api/auth/login', credentials);
            if (!response.data.success) {
                return thunkAPI.rejectWithValue(response.data.message);
            }
            return thunkAPI.fulfillWithValue(response.data);
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Login failed';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData, thunkAPI) => {
        try {
            const response = await clientServer.post('/api/auth/register', userData);
            if (!response.data.success) {
                return thunkAPI.rejectWithValue(response.data.message);
            }
            return thunkAPI.fulfillWithValue(response.data);
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Registration failed';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, thunkAPI) => {
        try {
            await clientServer.post('/api/auth/logout');
            return thunkAPI.fulfillWithValue(true);
        } catch (error) {
            const message = error.response?.data?.message || 'Logout failed';
            return thunkAPI.rejectWithValue(message);
        }
    }
);
