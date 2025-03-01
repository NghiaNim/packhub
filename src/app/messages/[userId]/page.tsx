'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function DirectMessage() {
  const params = useParams();
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the main messages page with the userId parameter
    router.push(`/messages?userId=${params.userId}`);
  }, [params.userId, router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-black">Loading conversation...</p>
      </div>
    </div>
  );
} 