import { createSlice } from '@reduxjs/toolkit';

export const appSlice = createSlice({
  name: 'app',
  initialState: {
    password: '',
    showPassword: false
  },
  reducers: {
    startRecording: state => {
      state.showPassword = false
    },
    endRecording: (state, action) => {
      state.password = action.payload
      state.showPassword = true
    }
  }
})

export const { startRecording, endRecording } = appSlice.actions;

export default appSlice.reducer;
