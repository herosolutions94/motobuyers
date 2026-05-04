import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import http from "@/helpers/http";
import { doObjToFormData, formatDate } from "@/helpers/helpers";
import { setCookie } from "cookies-next";
import Text from "@/components/text";
import toast from "react-hot-toast";

export const saveContactQuery = createAsyncThunk(
  "contact/saveContactQuery",
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      const response = await http.post(
        "save-contact-message",
        doObjToFormData(formData)
      );
      const { data } = response;
      if (data.status == 1) {
        toast.success(<Text string={data?.msg} parse={true} />);
        // setTimeout(() => {
        //   window.location.reload();
        // }, 1000);
      } else {
        toast.error(<Text string={data?.msg} parse={true} />);
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
  isComplete: false,
  // hidePopup: false,
};

const contactSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(saveContactQuery.pending, (state) => {
        state.isFormProcessing = true;
      })
      .addCase(saveContactQuery.fulfilled, (state, action) => {
        state.isFormProcessing = false;
        state.isComplete = true;
      })
      .addCase(saveContactQuery.rejected, (state) => {
        state.isFormProcessing = false;
      });
  },
});

export default contactSlice.reducer;
