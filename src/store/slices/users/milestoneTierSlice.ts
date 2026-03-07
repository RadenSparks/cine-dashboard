import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { type MileStoneTierApiDTO } from "../../../dto/dto";
import { type ApiResponse } from "../../../entities/type";
import axios from "axios";
import { API_ENDPOINTS } from '../../utils/apiConfig';

const MILESTONE_TIERS_API = API_ENDPOINTS.MILESTONE_TIERS;

export const createMilestoneTier = createAsyncThunk<
  MileStoneTierApiDTO,
  Omit<MileStoneTierApiDTO, "id">,
  { rejectValue: string }
>("milestoneTiers/create", async (tier, { rejectWithValue }) => {
  try {
    const res = await axios.post<ApiResponse<MileStoneTierApiDTO>>(MILESTONE_TIERS_API, tier);
    return res.data.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.message || "Failed to create tier");
    }
    return rejectWithValue("Failed to create tier");
  }
});

export const updateMilestoneTier = createAsyncThunk<
  MileStoneTierApiDTO,
  MileStoneTierApiDTO,
  { rejectValue: string }
>("milestoneTiers/update", async (tier, { rejectWithValue }) => {
  try {
    const res = await axios.put<ApiResponse<MileStoneTierApiDTO>>(`${MILESTONE_TIERS_API}/${tier.id}`, tier);
    return res.data.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.message || "Failed to update tier");
    }
    return rejectWithValue("Failed to update tier");
  }
});

export const deleteMilestoneTier = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("milestoneTiers/delete", async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${MILESTONE_TIERS_API}/${id}`);
    return id;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete tier");
    }
    return rejectWithValue("Failed to delete tier");
  }
});

export interface MilestoneTierState {
  tiers: MileStoneTierApiDTO[];
  loading: boolean;
  error: string | null;
}

const initialState: MilestoneTierState = {
  tiers: [],
  loading: false,
  error: null,
};

export const fetchMilestoneTiers = createAsyncThunk<
  MileStoneTierApiDTO[],
  void,
  { rejectValue: string }
>("milestoneTiers/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get<ApiResponse<MileStoneTierApiDTO[]>>(MILESTONE_TIERS_API);
    return res.data.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch milestone tiers");
    }
    return rejectWithValue("Failed to fetch milestone tiers");
  }
});

const milestoneTierSlice = createSlice({
  name: "milestoneTiers",
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchMilestoneTiers.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMilestoneTiers.fulfilled, (state, action) => {
        state.loading = false;
        state.tiers = action.payload;
      })
      .addCase(fetchMilestoneTiers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error";
      })
      .addCase(createMilestoneTier.fulfilled, (state, action) => {
        state.tiers.push(action.payload);
      })
      .addCase(updateMilestoneTier.fulfilled, (state, action) => {
        const idx = state.tiers.findIndex((t: MileStoneTierApiDTO) => t.id === action.payload.id);
        if (idx !== -1) state.tiers[idx] = action.payload;
      })
      .addCase(deleteMilestoneTier.fulfilled, (state, action) => {
        state.tiers = state.tiers.filter((t: MileStoneTierApiDTO) => t.id !== action.payload);
      });
  },
});

export default milestoneTierSlice.reducer;
