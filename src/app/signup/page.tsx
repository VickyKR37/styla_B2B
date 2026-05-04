// This page is now obsolete due to removal of user authentication
// Kept for routing integrity but directs users to main flow.
'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-full max-w-md p-6 text-center bg-card rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Account Creation Not Required</h1>
          <p className="mb-6 text-muted-foreground">
            Styla now operates without user accounts. You can directly complete the
            questionnaire and receive your report.
          </p>
          <Button asChild>
            <Link href="/questionnaire">Start Questionnaire</Link>
          </Button>
        </div>
      </div>
    </Suspense>
  );
}
