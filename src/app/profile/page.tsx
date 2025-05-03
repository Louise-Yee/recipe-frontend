'use client';

import { useSearchParams } from 'next/navigation';
import ProfileClient from './ProfileClient';

export default function Profile() {
    const searchParams = useSearchParams();
    const userId = searchParams?.get('userId');

    // If userId is provided in URL, show that user's profile
    // Otherwise show the current user's profile
    return <ProfileClient userId={userId || undefined} />;
}