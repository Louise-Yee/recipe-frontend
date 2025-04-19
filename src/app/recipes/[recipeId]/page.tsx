// src/app/recipes/[recipeId]/page.tsx
import RecipeClient from './client';
import { getAllRecipes, Recipe } from '@/services/api';

// Define the params type
type RecipeParams = Promise<{ recipeId: string }>;

// This function tells Next.js which paths to pre-render at build time
export async function generateStaticParams() {
    // For static build, we need to provide at least some parameters
    // This can be challenging in build environments where the API isn't accessible

    try {
        // Try to fetch all recipes - but this might fail during build time
        const recipesData = await getAllRecipes();
        const recipes = recipesData.recipes || [];

        if (recipes && recipes.length > 0) {
            return recipes.map((recipe : Recipe) => ({
                recipeId: recipe?.id?.toString()
            }));
        }
    } catch (error) {
        console.warn('Unable to fetch recipes for static generation, using fallback paths');
        console.error(error);
    }

    // Fallback paths - replace these with actual recipe IDs if you know them
    // These will ensure the build succeeds even without API access
    return [
        { recipeId: '1' },
        { recipeId: '2' },
        { recipeId: '3' },
    ];
}

// The page component
export default async function RecipePage({ params }: { params: RecipeParams }) {
    const { recipeId } = await params;

    return (
        <div>
            <RecipeClient recipeId={recipeId} />
        </div>
    );
}