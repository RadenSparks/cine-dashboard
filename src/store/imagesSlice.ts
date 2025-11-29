import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { AxiosResponse } from 'axios';
import { type Image } from '../entities/type';
import { type RetrieveImageDTO, type UploadImageResponseDTO, type ImageFolderDTO, type ApiResponse } from '../dto/dto';
import apiClient, { get, post, remove } from '../client/axiosCilent';
import { normalizeImageUrl } from '../utils/imageUrl';
import type { RootState } from './store';
import { getAuthHeaders } from '../lib/auth';

const BASE_API = import.meta.env.VITE_API_URL || 'http://localhost:17000/api/v1';
const BASE_API_NO_SLASH = BASE_API.replace(/\/$/, '');
const IMAGES_API = `${BASE_API_NO_SLASH}/images`;

// function getAuthHeaders(): Record<string, string> {
//   const userDetails = localStorage.getItem('cine-user-details');
//   const accessToken = userDetails ? JSON.parse(userDetails).accessToken : null;
//   return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
// }

function mapRetrieveDtoToImage(dto: RetrieveImageDTO): Image {
  const rawUrl = dto.url ?? `${IMAGES_API}/${dto.id}`;
  const cleaned = rawUrl.replace(/\/raw$/, "");
  return {
    id: dto.id,
    name: dto.name,
    size: dto.size,
    contentType: dto.contentType,
    folderName: dto.folderName,
    url: normalizeImageUrl(cleaned, dto.id),
  };
}

export const fetchImages = createAsyncThunk<Image[], void>(
  'images/fetchImages',
  async (_, { rejectWithValue }) => {
    try {
      // Note: Backend API doesn't support paginated GET endpoint.
      // Individual images are retrieved via GET /api/v1/images/{id}
      // For now, returning empty array - UI should fetch images by folder
      return [];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch images');
    }
  }
);

export const uploadImageAsync = createAsyncThunk<Image, { file: File; name?: string }>(
  'images/uploadImage',
  async ({ file, name }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const form = new FormData();
      form.append('file', file);
      if (name) form.append('name', name);

      const res = (await post(`${IMAGES_API}`, form, {
        headers: { ...headers /* do NOT set Content-Type here */ },
      })) as unknown as AxiosResponse<ApiResponse<UploadImageResponseDTO>>;

      const dto: UploadImageResponseDTO | undefined = res.data?.data;
      const id = dto?.id;
      const rawUrl = (dto as UploadImageResponseDTO & { url?: string })?.url ?? `${IMAGES_API}/${id}`;
      const cleanedUrl = rawUrl.replace(/\/raw$/, "");
      return {
        id: id!,
        name: dto?.name ?? file.name,
        size: file.size,
        url: normalizeImageUrl(cleanedUrl, id),
        eTag: dto?.eTag,
      } as Image;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to upload image');
    }
  }
);

export const fetchImageRawAsync = createAsyncThunk<
  { id: number; blob: Blob; contentType: string; eTag?: string },
  number,
  { state: RootState }
>('images/fetchRaw', async (id, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const existing = state.images.items.find(i => i.id === id);
    const headers: Record<string, string> = { /* auth headers if needed */ };

    if (existing?.eTag) headers["If-None-Match"] = existing.eTag;

    const resourceUrl = normalizeImageUrl(existing?.url ?? undefined, id) ?? `${IMAGES_API}/${id}`;

    const res = await apiClient.get(resourceUrl, {
      responseType: "arraybuffer",
      headers,
      // accept 200..399 and 304 so axios doesn't throw
      validateStatus: status => (status >= 200 && status < 400) || status === 304,
    });

    if (res.status === 304) {
      // server says not modified — use existing blob if available
      if (existing?.blob) {
        return { id, blob: existing.blob, contentType: existing.contentType ?? "application/octet-stream", eTag: existing.eTag };
      }
      // no cached blob — request again without If-None-Match
      const retry = await apiClient.get(`/api/v1/images/${id}`, { responseType: "arraybuffer", headers: { /* auth */ } });
      const blobRetry = new Blob([retry.data], { type: retry.headers["content-type"] });
      return { id, blob: blobRetry, contentType: retry.headers["content-type"], eTag: retry.headers["etag"] };
    }

    const blob = new Blob([res.data], { type: res.headers["content-type"] });
    return { id, blob, contentType: res.headers["content-type"], eTag: res.headers["etag"] };
  } catch (err) {
    return rejectWithValue(err);
  }
});

export const deleteImageAsync = createAsyncThunk<number, number>(
  'images/deleteImage',
  async (id, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = (await remove(`${IMAGES_API}/${id}`, { headers })) as unknown as AxiosResponse<ApiResponse<{ id: number }>>;
      const returned = res.data?.data?.id ?? id;
      return returned;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete image');
    }
  }
);

const FOLDERS_API = `${BASE_API_NO_SLASH}/folders`;

export type FolderWithImages = {
  id: number;
  name: string;
  images: Array<{
    id: number;
    name: string;
    contentType: string;
    size: number;
    url: string;
    folder: string;
  }>;
};

// Fetch all folders with their images
export const fetchFoldersAsync = createAsyncThunk<Image[], void>(
  'images/fetchFolders',
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = (await get(`${FOLDERS_API}`, { headers })) as unknown as AxiosResponse<
        ApiResponse<{
          content: FolderWithImages[];
        }>
      >;
      
      // Flatten folder structure: extract all images and add folder name
      const folders = res.data?.data?.content ?? [];
      const allImages: Image[] = [];
      
      folders.forEach(folder => {
        if (Array.isArray(folder.images)) {
          folder.images.forEach(img => {
            const cleaned = img.url.replace(/\/raw$/, "");
            allImages.push({
              id: img.id,
              name: img.name,
              size: img.size,
              contentType: img.contentType,
              folderName: folder.name,
              url: normalizeImageUrl(cleaned, img.id),
            });
          });
        }
      });
      
      // Sort images by ID to ensure consistent ordering across refreshes
      allImages.sort((a, b) => a.id - b.id);
      
      return allImages;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch folders');
    }
  }
);

// Fetch folder list (for tree display) - returns empty folders too
export const fetchFolderListAsync = createAsyncThunk<FolderWithImages[], void>(
  'images/fetchFolderList',
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = (await get(`${FOLDERS_API}`, { headers })) as unknown as AxiosResponse<
        ApiResponse<{
          content: FolderWithImages[];
        }>
      >;
      return res.data?.data?.content ?? [];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch folder list');
    }
  }
);

// Create a new folder
export const createFolderAsync = createAsyncThunk<ImageFolderDTO, string>(
  'images/createFolder',
  async (folderName, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = (await post(`${FOLDERS_API}`, { name: folderName }, { headers })) as unknown as AxiosResponse<
        ApiResponse<ImageFolderDTO>
      >;
      return res.data?.data || { id: 0, name: folderName };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create folder');
    }
  }
);

// Delete a folder
export const deleteFolderAsync = createAsyncThunk<number, { folderId: number; deleteItems: boolean }>(
  'images/deleteFolder',
  async ({ folderId, deleteItems }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = (await remove(`${FOLDERS_API}/${folderId}?deleteItem=${deleteItems}`, { headers })) as unknown as AxiosResponse<
        ApiResponse<{ id: number }>
      >;
      return res.data?.data?.id ?? folderId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete folder');
    }
  }
);

// Move images to a folder
export const moveImagesToFolderAsync = createAsyncThunk<
  Image[],
  { imageIds: number[]; targetFolderName: string }
>(
  'images/moveToFolder',
  async ({ imageIds, targetFolderName }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      
      // Try the move endpoint with different variations
      let res;
      const payload = { imageIds, targetFolderName };
      
      try {
        // First try: POST to /move
        res = (await post(`${IMAGES_API}/move`, payload, { headers })) as unknown as AxiosResponse<
          ApiResponse<RetrieveImageDTO[]>
        >;
      } catch (err1) {
        try {
          // Second try: POST to /move-to-folder
          res = (await post(`${IMAGES_API}/move-to-folder`, payload, { headers })) as unknown as AxiosResponse<
            ApiResponse<RetrieveImageDTO[]>
          >;
        } catch {
          // If both fail, throw the first error
          throw err1;
        }
      }
      
      const dtos: RetrieveImageDTO[] = Array.isArray(res.data?.data) ? res.data.data : [];
      return dtos.map(mapRetrieveDtoToImage);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to move images');
    }
  }
);

// Upload image with folder support
export const uploadImageToFolderAsync = createAsyncThunk<Image, { file: File; folderName?: string }>(
  'images/uploadImageToFolder',
  async ({ file, folderName }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const form = new FormData();
      form.append('file', file);
      // Try both 'folder' and 'folderName' to handle backend variations
      if (folderName && folderName !== 'root') {
        form.append('folder', folderName);
        form.append('folderName', folderName);
      }
      console.log('FormData being sent:', { file: file.name, folderName });

      const res = (await post(`${IMAGES_API}`, form, {
        headers: { ...headers /* do NOT set Content-Type here */ },
      })) as unknown as AxiosResponse<ApiResponse<UploadImageResponseDTO>>;

      const dto: UploadImageResponseDTO | undefined = res.data?.data;
      const id = dto?.id;
      const rawUrl = (dto as UploadImageResponseDTO & { url?: string })?.url ?? `${IMAGES_API}/${id}`;
      const cleanedUrl = rawUrl.replace(/\/raw$/, "");
      return {
        id: id!,
        name: dto?.name ?? file.name,
        size: file.size,
        folderName: dto?.folder ?? dto?.folderName ?? 'root',
        url: normalizeImageUrl(cleanedUrl, id),
        eTag: dto?.eTag,
      } as Image;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to upload image');
    }
  }
);

interface ImagesState {
  items: Image[];
  folders: ImageFolderDTO[];
  folderList: FolderWithImages[];
  loading: boolean;
  folderLoading: boolean;
  error: string | null;
}

const initialState: ImagesState = {
  items: [],
  folders: [],
  folderList: [],
  loading: false,
  folderLoading: false,
  error: null,
};

const imagesSlice = createSlice({
  name: 'images',
  initialState,
  reducers: {
    clearImages(state) {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchImages.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchImages.fulfilled, (s, action: PayloadAction<Image[]>) => {
        s.items = action.payload;
        s.loading = false;
      })
      .addCase(fetchImages.rejected, (s, action) => {
        s.loading = false;
        s.error = action.error.message ?? 'Failed to fetch images';
      })
      .addCase(uploadImageAsync.fulfilled, (s, action: PayloadAction<Image>) => {
        s.items.push(action.payload);
      })
      .addCase(fetchImageRawAsync.fulfilled, (s, action) => {
        const { id, blob, contentType, eTag } = action.payload;
        const idx = s.items.findIndex((it) => it.id === id);
        if (idx !== -1) {
          s.items[idx] = { ...s.items[idx], blob, eTag, contentType };
        } else {
          s.items.push({
            id,
            name: `${id}`,
            size: blob.size,
            url: normalizeImageUrl(`${IMAGES_API}/${id}`, id),
            blob,
            eTag,
            contentType,
          } as Image);
        }
      })
      .addCase(deleteImageAsync.fulfilled, (s, action: PayloadAction<number>) => {
        const id = action.payload;
        const idx = s.items.findIndex((it) => it.id === id);
        if (idx !== -1) s.items.splice(idx, 1);
      })
      .addCase(deleteImageAsync.rejected, (s, action) => {
        s.error = action.error.message ?? 'Failed to delete image';
      })
      // Folder operations
      .addCase(fetchFoldersAsync.pending, (s) => {
        s.folderLoading = true;
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchFoldersAsync.fulfilled, (s, action: PayloadAction<Image[]>) => {
        // Store the flattened images from folders
        s.items = action.payload;
        s.folderLoading = false;
        s.loading = false;
      })
      .addCase(fetchFoldersAsync.rejected, (s, action) => {
        s.folderLoading = false;
        s.loading = false;
        s.error = action.payload as string ?? 'Failed to fetch folders';
      })
      .addCase(fetchFolderListAsync.pending, (s) => {
        s.folderLoading = true;
      })
      .addCase(fetchFolderListAsync.fulfilled, (s, action: PayloadAction<FolderWithImages[]>) => {
        s.folderList = action.payload;
        s.folderLoading = false;
      })
      .addCase(fetchFolderListAsync.rejected, (s, action) => {
        s.folderLoading = false;
        s.error = action.payload as string ?? 'Failed to fetch folder list';
      })
      .addCase(createFolderAsync.fulfilled, (s, action: PayloadAction<ImageFolderDTO>) => {
        if (!s.folders.find(f => f.id === action.payload.id)) {
          s.folders.push(action.payload);
        }
        // Also add to folderList to update the tree immediately
        if (!s.folderList.find(f => f.id === action.payload.id)) {
          s.folderList.push({
            ...action.payload,
            images: [],
          });
        }
      })
      .addCase(deleteFolderAsync.fulfilled, (s, action: PayloadAction<number>) => {
        s.folders = s.folders.filter(f => f.id !== action.payload);
        // Also update folderList to reflect the deletion
        s.folderList = s.folderList.filter(f => f.id !== action.payload);
      })
      .addCase(moveImagesToFolderAsync.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(moveImagesToFolderAsync.fulfilled, (s, action: PayloadAction<Image[]>) => {
        // Update moved images with new folder info
        action.payload.forEach(movedImg => {
          const idx = s.items.findIndex(img => img.id === movedImg.id);
          if (idx !== -1) {
            s.items[idx] = movedImg;
          }
        });
        s.loading = false;
      })
      .addCase(moveImagesToFolderAsync.rejected, (s, action) => {
        s.loading = false;
        s.error = action.payload as string ?? 'Failed to move images';
      })
      .addCase(uploadImageToFolderAsync.fulfilled, (s, action: PayloadAction<Image>) => {
        s.items.push(action.payload);
      });
  },
});

export const { clearImages } = imagesSlice.actions;
export default imagesSlice.reducer;