import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import http from "@/helpers/http";
import { doObjToFormData, formatDate } from "@/helpers/helpers";
import { setCookie } from "cookies-next";
import Text from "@/components/text";
import toast from "react-hot-toast";

export const saveNewsletter = createAsyncThunk(
  "auth/saveNewsletter",
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      const response = await http.post(
        "save-newsletter",
        doObjToFormData(formData)
      );
      const { data } = response;
      if (data.status) {
        toast.success(data?.msg);
        // setTimeout(() => {
        //   reset();
        // }, 3000);
      } else {
        toast.error(data?.msg);
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  error: false,
  isFormProcessing: false,
};

const newsletterSlice = createSlice({
  name: "newsletter",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(saveNewsletter.pending, (state) => {
        state.isFormProcessing = true;
      })
      .addCase(saveNewsletter.fulfilled, (state, action) => {
        state.isFormProcessing = false;
        state.isComplete = true;
      })
      .addCase(saveNewsletter.rejected, (state) => {
        state.isFormProcessing = false;
      });
  },
});

export default newsletterSlice.reducer;
