'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

/* ---------------- INNER COMPONENT ---------------- */

function VerifyContent() {
  const searchParams = useSearchParams();
  const pinFromUrl = searchParams.get('pin');

  const [pin, setPin] = useState(pinFromUrl || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (pinFromUrl && pinFromUrl.length === 6) {
      verifyPin(pinFromUrl);
    }
  }, [pinFromUrl]);

  async function verifyPin(pinToVerify) {
    setLoading(true);
    setError('');
    setUser(null);

    try {
      const res = await fetch(`${API_BASE}/api/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinToVerify }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid PIN');
      }

      setUser(data);
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1>Verify Digital ID</h1>

      {!user && (
        <>
          <input
            value={pin}
            maxLength={6}
            placeholder="Enter 6-digit PIN"
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            style={{ padding: 10, fontSize: 18, marginTop: 12 }}
          />

          <button
            onClick={() => verifyPin(pin)}
            disabled={pin.length !== 6 || loading}
            style={{ marginTop: 12 }}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </>
      )}

      {error && <p style={{ color: 'red', marginTop: 12 }}>{error}</p>}

      {user && (
        <div style={{ marginTop: 20 }}>
          <p><b>Name:</b> {user.name}</p>
          <p><b>Email:</b> {user.email}</p>
          <p><b>Phone:</b> {user.phone}</p>
          <p><b>Global ID:</b> {user.global_id}</p>
        </div>
      )}
    </div>
  );
}

/* ---------------- PAGE EXPORT ---------------- */

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
