import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '@/lib/apiService';

interface UserLine {
  _id: string;
  lineId: string;
  level: number;
  nextRevision: string;
  lastReviewed: string;
  streak: number;
  isMastered: boolean;
  totalSessions: number;
  totalQuizzesSolved: number;
  totalCorrectAnswers: number;
  overallAccuracy: number;
}

interface DueLinesData {
  total: number;
  byLevel: {
    L1: UserLine[];
    L2: UserLine[];
    L3: UserLine[];
    L4: UserLine[];
    L5: UserLine[];
    L6: UserLine[];
    L7: UserLine[];
  };
  lines: UserLine[];
  dailyLimit: number;
  limitReached: boolean;
}

interface MasteryProgress {
  totalLines: number;
  masteredLines: number;
  masteryPercentage: number;
  averageLevel: number;
}

interface NeuronzState {
  dueLines: DueLinesData | null;
  masteryProgress: MasteryProgress | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: NeuronzState = {
  dueLines: null,
  masteryProgress: null,
  isLoading: false,
  error: null,
};

export const loadDueLines = createAsyncThunk(
  'neuronz/loadDueLines',
  async () => {
    const response = await apiService.neuronz.getDueLines();
    return response.data.data;
  }
);

export const processLineSession = createAsyncThunk(
  'neuronz/processLineSession',
  async ({ lineId, correctAnswers, totalQuizzes = 4, timeSpent = 0, review }: { lineId: string; correctAnswers: number; totalQuizzes?: number; timeSpent?: number; review?: any[] }) => {
    const response = await apiService.neuronz.processLineSession({ lineId, correctAnswers, totalQuizzes, timeSpent, review });
    return response.data;
  }
);

export const generateMicroQuizzes = createAsyncThunk(
  'neuronz/generateMicroQuizzes',
  async (lineId: string) => {
    const response = await apiService.neuronz.generateMicroQuizzes(lineId);
    return response.data.data;
  }
);

export const getMasteryProgress = createAsyncThunk(
  'neuronz/getMasteryProgress',
  async () => {
    const response = await apiService.neuronz.getMasteryProgress();
    return response.data.data;
  }
);

export const checkDailyLimit = createAsyncThunk(
  'neuronz/checkDailyLimit',
  async () => {
    const response = await apiService.neuronz.checkDailyLimit();
    return response.data.data;
  }
);

export const resetLineLevel = createAsyncThunk(
  'neuronz/resetLineLevel',
  async (lineId: string) => {
    await apiService.neuronz.resetLineLevel(lineId);
    return lineId;
  }
);

export const trackChapter = createAsyncThunk(
  'neuronz/trackChapter',
  async (chapterId: string) => {
    const response = await apiService.neuronz.trackChapter(chapterId);
    return response.data;
  }
);

const neuronzSlice = createSlice({
  name: 'neuronz',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load due lines
      .addCase(loadDueLines.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadDueLines.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dueLines = action.payload;
      })
      .addCase(loadDueLines.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load due lines';
      })
      
      // Process line session
      .addCase(processLineSession.pending, (state) => {
        state.error = null;
      })
      .addCase(processLineSession.fulfilled, (state, action) => {
        // Reload due lines if not limit reached
        if (!action.payload.limitReached) {
          // Will be handled by subsequent loadDueLines call
        }
      })
      .addCase(processLineSession.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to process line session';
      })
      
      // Get mastery progress
      .addCase(getMasteryProgress.fulfilled, (state, action) => {
        state.masteryProgress = action.payload;
      })
      .addCase(getMasteryProgress.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to get mastery progress';
      })
      
      // Reset line level
      .addCase(resetLineLevel.fulfilled, (state) => {
        // Will reload due lines after reset
      })
      .addCase(resetLineLevel.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to reset line level';
      })

      // Track chapter
      .addCase(trackChapter.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(trackChapter.fulfilled, (state) => {
        state.isLoading = false;
        // Will reload due lines after tracking
      })
      .addCase(trackChapter.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to track chapter';
      });
  },
});

export const { clearError } = neuronzSlice.actions;
export default neuronzSlice.reducer;