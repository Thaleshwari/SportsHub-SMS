import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import tournamentReducer from './slices/tournamentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tournament: tournamentReducer,
  },
});
