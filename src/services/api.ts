import { apiFetch, handleApiError } from "./apiUtils";

export interface Recipe {
  id?: string;
  title: string;
  description?: string;
  ingredients: string[];
  steps: string[];
  cookTime?: number;
  servings?: number;
  imageUrl?: string;
  tags?: string[];
  cuisine?: string;
  author?: {
    displayName?: string;
    uid?: string;
    username?: string;
    profileImage?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  recipe?: T;
  recipes?: T[];
  error?: string;
  success?: boolean;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

export interface SearchParams {
  query?: string;
  ingredients?: string[];
  tags?: string[];
  cuisine?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: unknown; // Add index signature to make compatible with Record<string, unknown>
}

// RECIPE OPERATIONS

export interface ImageUploadUrlResponse {
  success: boolean;
  uploadInfo?: {
    uploadUrl: string;
    fileUrl: string;
    fileName: string;
  };
  error?: string;
}

/**
 * Gets a signed URL for uploading an image directly to Firebase Storage
 */
export const getImageUploadUrl = async (fileInfo: {
  fileName: string;
  contentType: string;
  fileSize: number;
}): Promise<ImageUploadUrlResponse> => {
  try {
    // Validate file size
    if (fileInfo.fileSize > 5 * 1024 * 1024) {
      throw new Error("File size exceeds 5MB limit");
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(fileInfo.contentType)) {
      throw new Error("Only jpeg, png, jpg, or webp images are allowed");
    }

    // Get the upload URL from the backend
    const response = await apiFetch<ImageUploadUrlResponse>(
      "/recipes/image-upload-url",
      {
        method: "POST",
        body: JSON.stringify(fileInfo),
        credentials: "include",
      }
    );

    // Return the response with upload info
    return response;
  } catch (error) {
    throw new Error(handleApiError(error, "getImageUploadUrl"));
  }
};

export const createRecipe = async (
  recipeData: Recipe
): Promise<ApiResponse<Recipe>> => {
  try {
    return await apiFetch("/recipes", {
      method: "POST",
      body: JSON.stringify(recipeData),
      credentials: "include",
    });
  } catch (error) {
    throw new Error(handleApiError(error, "createRecipe"));
  }
};

export const getUserRecipes = async (params?: {
  page?: number;
  perPage?: number;
}): Promise<ApiResponse<Recipe>> => {
  try {
    return await apiFetch("/recipes/user", {
      params,
    });
  } catch (error) {
    throw new Error(handleApiError(error, "getUserRecipes"));
  }
};

export const getAllRecipes = async (params?: {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<ApiResponse<Recipe>> => {
  try {
    return await apiFetch("/recipes", {
      params,
    });
  } catch (error) {
    throw new Error(handleApiError(error, "getAllRecipes"));
  }
};

export const getRecipeById = async (
  id: string
): Promise<ApiResponse<Recipe>> => {
  try {
    return await apiFetch(`/recipes/${id}`);
  } catch (error) {
    throw new Error(handleApiError(error, "getRecipeById"));
  }
};

export const updateRecipe = async (
  id: string,
  recipeData: Partial<Recipe>
): Promise<ApiResponse<Recipe>> => {
  try {
    return await apiFetch(`recipes/${id}`, {
      method: "PUT",
      body: JSON.stringify(recipeData),
    });
  } catch (error) {
    throw new Error(handleApiError(error, "updateRecipe"));
  }
};

export const deleteRecipe = async (
  id: string
): Promise<ApiResponse<Recipe>> => {
  try {
    return await apiFetch(`/recipes/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    throw new Error(handleApiError(error, "deleteRecipe"));
  }
};

interface RecipeSearchResponse {
  success: boolean;
  recipes: Recipe[];
  count: number;
  pagination?: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

export const searchRecipes = async (
  params: SearchParams
): Promise<RecipeSearchResponse> => {
  try {
    return await apiFetch("/recipes/search", { params });
  } catch (error) {
    throw new Error(handleApiError(error, "searchRecipes"));
  }
};

// UPLOAD OPERATIONS

/**
 * Function to upload an image using the signed URL provided by the backend
 */
export const uploadImageWithSignedUrl = async (
  file: File,
  uploadUrl: string
): Promise<boolean> => {
  try {
    // Use fetch directly with the signed URL (not our apiFetch utility)
    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Error uploading image:", error);
    // Properly type check the error before accessing the message property
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(`Upload failed: ${errorMessage}`);
  }
};

export const uploadImage = async (file: File) => {
  if (!file) {
    throw new Error("No file provided");
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }

  // Validate file size
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File size exceeds 5MB limit");
  }

  try {
    // Create FormData
    const formData = new FormData();
    formData.append("image", file);

    return await apiFetch("upload-image", {
      method: "POST",
      body: formData,
      // Don't set Content-Type header for FormData
      headers: {},
    });
  } catch (error) {
    throw new Error(handleApiError(error, "uploadImage"));
  }
};

/**
 * Helper function to handle the complete image upload process
 * Gets a signed URL and uploads the image in one convenient function
 */
export const handleImageUpload = async (
  file: File,
  callbacks?: {
    onUploadStart?: () => void;
    onUploadComplete?: (fileUrl: string) => void;
    onError?: (error: Error) => void;
    onProgress?: (progress: number) => void;
  }
): Promise<string | null> => {
  try {
    callbacks?.onUploadStart?.();

    // Get the signed URL
    const response = await getImageUploadUrl({
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size,
    });

    // Upload the image using the signed URL
    await uploadImageWithSignedUrl(file, response.uploadInfo!.uploadUrl);

    // Use the fileUrl for displaying/storing the image URL
    const fileUrl = response.uploadInfo!.fileUrl;

    callbacks?.onUploadComplete?.(fileUrl);
    return fileUrl;
  } catch (error) {
    console.error("Image upload failed:", error);
    callbacks?.onError?.(error as Error);
    return null;
  }
};

// USER OPERATIONS

interface UserSearchResponse {
  success: boolean;
  users: {
    id: string;
    username: string;
    displayName: string;
    profileImage?: string;
    bio?: string;
  }[];
  count: number;
}

export const searchUsers = async (params: {
  query: string;
}): Promise<UserSearchResponse> => {
  try {
    return await apiFetch("/users/search", { params });
  } catch (error) {
    throw new Error(handleApiError(error, "searchUsers"));
  }
};

// Get all users (simplified user data for static generation)
export interface UsersResponse {
  success: boolean;
  users: {
    id: string;
    username: string;
    displayName: string;
  }[];
  count: number;
}

export const getAllUsers = async (): Promise<UsersResponse> => {
  try {
    return await apiFetch("/users");
  } catch (error) {
    throw new Error(handleApiError(error, "getAllUsers"));
  }
};

// Get public user profile data (uses the new endpoint)
export interface PublicUserProfileResponse {
  success: boolean;
  userData: {
    id: string;
    username: string;
    displayName: string;
    profileImage?: string;
    bio?: string;
    recipesCount: number;
    followersCount?: number;
    followingCount?: number;
  };
  recipes: Recipe[];
}

export const getPublicUserProfile = async (
  userId: string
): Promise<PublicUserProfileResponse> => {
  try {
    return await apiFetch(`/users/public/${userId}`);
  } catch (error) {
    throw new Error(handleApiError(error, "getPublicUserProfile"));
  }
};
