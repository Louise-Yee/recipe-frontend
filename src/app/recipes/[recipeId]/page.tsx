// src/app/recipes/[recipeId]/page.tsx

type RecipeParams = Promise<{ recipeId: string }>;

export default async function RecipePage({ params }: { params: RecipeParams }) {
    const { recipeId } = await params;
    return (
        <div>
            <RecipeClient recipeId={recipeId} />
        </div>
    );
}

import RecipeClient from './client';