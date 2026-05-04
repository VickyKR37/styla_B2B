// components/DiscountCodeInput.tsx
"use client";

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { DiscountCode } from '@/types/discount';

interface Props {
  baseAmount: number;
  onCodeChange: (code: string | null, percent: number) => void;
}

export default function DiscountCodeInput({ baseAmount, onCodeChange }: Props) {
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!code) {
      setMsg('');
      onCodeChange(null, 0);
      return;
    }
    const t = setTimeout(() => validate(code.toUpperCase()), 500); // debounce
    return () => clearTimeout(t);
  }, [code]);

  const validate = async (value: string) => {
    setChecking(true);
    const snap = await getDoc(doc(db, 'discountCodes', value));
    if (!snap.exists()) {
      setMsg('❌ Invalid code');
      onCodeChange(null, 0);
    } else {
      const d = snap.data() as DiscountCode;
      if (!d.isActive) setMsg('❌ Inactive');
      else if (d.expiresAt && new Date(d.expiresAt) < new Date())
        setMsg('❌ Expired');
      else if (d.maxUses && d.uses >= d.maxUses)
        setMsg('❌ Max uses reached');
      else {
        setMsg(`✅ ${d.percentOff}% off`);
        onCodeChange(d.id, d.percentOff);
        setChecking(false);
        return;
      }
      onCodeChange(null, 0);
    }
    setChecking(false);
  };

  return (
    <div className="space-y-1">
      <input
        value={code}
        onChange={e => setCode(e.target.value.trim())}
        placeholder="Discount code"
        className="w-full rounded border px-3 py-2"
      />
      <p className="text-sm">{checking ? 'Checking…' : msg}</p>
    </div>
  );
}