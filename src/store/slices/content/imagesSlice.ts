import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { AxiosResponse } from 'axios';
import { type Image } from '@/shared/types/entities';
import { type RetrieveImageDTO, type UploadImageResponseDTO, type ImageFolderDTO, type ApiResponse } from '@/shared/types/dto';
import apiClient, { get, post, remove } from '@/shared/api/apiClient';
import { normalizeImageUrl } from '@/shared/utils/imageUrl';
import { getAuthHeaders, API_ENDPOINTS, BASE_API_URL } from '@/store/utils/apiConfig';
import type { RootState } from '../../store';

const IMAGES_API = API_ENDPOINTS.IMAGES;
const FOLDERS_API = `${BASE_API_URL}/folders`;

/**
 * Maps RetrieveImageDTO from API to frontend Image type
 */
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
      const form = new FormData();
      form.append('file', file);
      if (name) form.append('name', name);

      const res = (await post(`${IMAGES_API}`, form)) as unknown as AxiosResponse<ApiResponse<UploadImageResponseDTO>>;

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
    const headers: Record<string, string> = {};

    if (existing?.eTag) headers["If-None-Match"] = existing.eTag;

    const resourceUrl = normalizeImageUrl(existing?.url ?? undefined, id) ?? `${IMAGES_API}/${id}`;

    const res = await apiClient.get(resourceUrl, {
      responseType: "arraybuffer",
      headers,
      validateStatus: status => (status >= 200 && status < 400) || status === 304,
    });

    if (res.status === 304) {
      if (existing?.blob) {
        return { id, blob: existing.blob, contentType: existing.contentType ?? "application/octet-stream", eTag: existing.eTag };
      }
      const retry = await apiClient.get(`${IMAGES_API}/${id}`, { responseType: "arraybuffer", headers: {} });
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
      return res.data?.data?.id ?? id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete image');
    }
  }
);

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

export const fetchFoldersAsync = createAsyncThunk<Image[], void>(
  'images/fetchFolders',
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = (await get(`${FOLDERS_API}`, { headers })) as unknown as AxiosResponse<
        ApiResponse<{ content: FolderWithImages[] }>
      >;

      const folders = res.data?.data?.content ?? [];
      const allImages: Image[] = [];

      folders.forEach((folder: FolderWithImages) => {
        if (Array.isArray(folder.images)) {
          folder.images.forEach((img: RetrieveImageDTO) => {
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

      allImages.sort((a: Image, b: Image) => a.id - b.id);
      return allImages;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch folders');
    }
  }
);

export const fetchFolderListAsync = createAsyncThunk<FolderWithImages[], void>(
  'images/fetchFolderList',
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = (await get(`${FOLDERS_API}`, { headers })) as unknown as AxiosResponse<
        ApiResponse<{ content: FolderWithImages[] }>
      >;
      return res.data?.data?.content ?? [];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch folder list');
    }
  }
);

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

export const moveImagesToFolderAsync = createAsyncThunk<
  Image[],
  { imageIds: number[]; targetFolderName: string }
>(
  'images/moveToFolder',
  async ({ imageIds, targetFolderName }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      let res;
      const payload = { imageIds, targetFolderName };

      try {
        res = (await post(`${IMAGES_API}/move`, payload, { headers })) as unknown as AxiosResponse<
          ApiResponse<RetrieveImageDTO[]>
        >;
      } catch (err1) {
        try {
          res = (await post(`${IMAGES_API}/move-to-folder`, payload, { headers })) as unknown as AxiosResponse<
            ApiResponse<RetrieveImageDTO[]>
          >;
        } catch {
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

export const uploadImageToFolderAsync = createAsyncThunk<Image, { file: File; folderName?: string }>(
  'images/uploadImageToFolder',
  async ({ file, folderName }, { rejectWithValue }) => {
    try {
      const form = new FormData();
      form.append('file', file);
      if (folderName && folderName !== 'root') {
        form.append('folder', folderName);
        form.append('folderName', folderName);
      }

      const res = (await post(`${IMAGES_API}`, form)) as unknown as AxiosResponse<ApiResponse<UploadImageResponseDTO>>;

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
      .addCase(fetchImageRawAsync.fulfilled, (s, action: PayloadAction<{ id: number; blob: Blob; contentType: string; eTag?: string }>) => {
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
        const idx = s.items.findIndex((it: Image) => it.id === id);
        if (idx !== -1) s.items.splice(idx, 1);
      })
      .addCase(deleteImageAsync.rejected, (s, action) => {
        s.error = action.error.message ?? 'Failed to delete image';
      })
      .addCase(fetchFoldersAsync.pending, (s) => {
        s.folderLoading = true;
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchFoldersAsync.fulfilled, (s, action: PayloadAction<Image[]>) => {
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
        if (!s.folders.find((f: ImageFolderDTO) => f.id === action.payload.id)) {
          s.folders.push(action.payload);
        }
        if (!s.folderList.find((f: FolderWithImages) => f.id === action.payload.id)) {
          s.folderList.push({
            ...action.payload,
            images: [],
          });
        }
      })
      .addCase(deleteFolderAsync.fulfilled, (s, action: PayloadAction<number>) => {
        s.folders = s.folders.filter((f: ImageFolderDTO) => f.id !== action.payload);
        s.folderList = s.folderList.filter((f: FolderWithImages) => f.id !== action.payload);
      })
      .addCase(moveImagesToFolderAsync.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(moveImagesToFolderAsync.fulfilled, (s, action: PayloadAction<Image[]>) => {
        action.payload.forEach((movedImg: Image) => {
          const idx = s.items.findIndex((img: Image) => img.id === movedImg.id);
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
