'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../config/firebase'; // adjust if your path is different

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleStart = async () => {
    if (!isValidEmail(email)) return;

    try {
      setLoading(true);
      const docRef = doc(firestore, 'questionnaire_responses', email);
      await setDoc(
        docRef,
        {
          consultantSessionEmail: email,
          email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: 'email_entered',
        },
        { merge: true },
      );

      router.push(`/questionnaire?email=${encodeURIComponent(email)}`);
    } catch (err) {
      console.error('Failed to save email:', err);
      alert('Something went wrong saving your consultant session email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-200px)]">
      <div className="flex flex-col items-center justify-center text-center">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-4xl font-bold tracking-tight text-primary">Styla for image consultants</CardTitle>
            <CardDescription className="text-lg text-muted-foreground pt-2">
              Styla helps you document your client’s line, scale, and body shape so you can deliver a polished style
              report she can take home. This analysis is designed only for women clients—complete it with her or on her
              behalf using verified measurements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-4 border rounded-lg bg-white">
                <h3 className="font-semibold text-lg mb-1">Consultant-ready workflow</h3>
                <p className="text-sm text-muted-foreground">
                  Capture proportional details once, reuse the methodology for each client wardrobe plan.
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-white">
                <h3 className="font-semibold text-lg mb-1">Structured depth</h3>
                <p className="text-sm text-muted-foreground">
                  The questionnaire mirrors professional draping cues so recommendations stay disciplined and thorough.
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-white">
                <h3 className="font-semibold text-lg mb-1">Client-facing polish</h3>
                <p className="text-sm text-muted-foreground">
                  Final narratives stay warm and personal for her while you retain the consultancy context upstream.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-left text-muted-foreground"
              >
                Consultant account email (work email you use with Styla)
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@yourstudio.co.uk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
              />
              {touched && !isValidEmail(email) && (
                <p className="text-sm text-red-600 text-left">Please enter a valid consultant email.</p>
              )}
            </div>

            <p className="text-muted-foreground text-left">
              Run through the questionnaire, then complete billing to generate exportable narratives you can hand to each
              client.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center pt-6">
            <Button
              size="lg"
              disabled={!isValidEmail(email) || loading}
              onClick={handleStart}
            >
              {loading ? 'Saving…' : 'Begin client questionnaire'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
