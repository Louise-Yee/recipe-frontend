/* eslint-disable @typescript-eslint/no-explicit-any */
const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface Recipe {
  id?: string;
  title: string;
  description?: string;
  ingredients: string[];
  steps: string[];
  cookTime?: number;
  servings?: number;
  imageUrl?: string;
  author?: {
    displayName?: string;
  };
}

export interface ApiResponse<T> {
  recipe?: T;
  recipes?: T[];
  error?: string;
}

export const createRecipe = async (recipeData: Recipe) => {
  const response = await fetch(`${apiUrl}/recipes`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(recipeData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create recipe");
  }

  return response.json();
};

export const getUserRecipes = async () => {
  const response = await fetch(`${apiUrl}/recipes/user`, {
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch recipes");
  }

  return response.json();
};

export const getAllRecipes = async () => {
  const response = await fetch(`${apiUrl}/recipes`, {
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch recipes");
  }

  return response.json();
};

export const getRecipeById = async (
  id: string
): Promise<ApiResponse<Recipe>> => {
  const response = await fetch(`${apiUrl}/recipes/${id}`, {
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch recipe");
  }

  return response.json();
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
    // Create a new FormData instance
    const formData = new FormData();

    // Append the file with the field name expected by the backend
    formData.append("image", file);

    console.log("Uploading image with direct method:", {
      fileName: file.name,
      fileType: file.type,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`,
    });

    // Send the request to the new direct upload endpoint
    const response = await fetch(`${apiUrl}/upload-image`, {
      method: "POST",
      credentials: "include", // For cookies
      body: formData,
      // Let the browser set the correct Content-Type for multipart/form-data
    });

    // Handle non-successful responses
    if (!response.ok) {
      let errorMessage = "Failed to upload image";

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        console.error("Upload error:", errorData);
      } catch (e: any) {
        const errorText = await response.text();
        console.error("Upload error (text):", errorText);
        errorMessage = errorText || `Server error (${response.status})`;
        console.log(e);
      }

      throw new Error(errorMessage);
    }

    // Parse successful response
    const result = await response.json();
    console.log("Upload success:", result);
    return result;
  } catch (error) {
    // Re-throw with better message
    console.error("Image upload failed:", error);
    throw error instanceof Error ? error : new Error("Failed to upload image");
  }
};
