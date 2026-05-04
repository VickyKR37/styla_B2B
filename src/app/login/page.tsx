// This route is legacy; core consultant auth lives in the Styla mobile app.
'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-full max-w-md p-6 text-center bg-card rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Consultant sign-in (mobile)</h1>
          <p className="mb-6 text-muted-foreground">
            Image consultants sign in on the Styla app with a consultant account. This site can still help you walk
            through a client questionnaire in the browser when you need a quick sandbox.
          </p>
          <Button asChild>
            <Link href="/questionnaire">Open client questionnaire</Link>
          </Button>
        </div>
      </div>
    </Suspense>
  );
}
