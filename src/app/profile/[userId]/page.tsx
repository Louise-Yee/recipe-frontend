import UserProfileClient from './client';
import { notFound } from 'next/navigation';

// Define a static param to ensure Next.js generates at least one route
export function generateStaticParams() {
    return [{ userId: 'index' }];
}

// The page component without async - static export needs a sync component
export default function UserProfilePage({
    params,
}: {
    params: { userId: string };
}) {
    // Validate the parameter if needed
    if (!params.userId) {
        notFound();
    }

    return <UserProfileClient userId={params.userId} />;
}