'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export default function VerifyClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

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
      if (!res.ok) throw new Error(data.error);

      setUser(data);
    } catch {
      setError('User not valid or PIN expired');
    } finally {
      setLoading(false);
    }
  }

  function resetVerification() {
    setPin('');
    setUser(null);
    setError('');
    router.replace('/verify'); // removes ?pin
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: 360, textAlign: 'center' }}>
        <h1>Verify Digital ID</h1>

        {!user && (
          <>
            <input
              value={pin}
              maxLength={6}
              placeholder="Enter 6-digit PIN"
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              style={{ padding: 10, fontSize: 18, marginTop: 12, width: '100%' }}
            />

            <button
              onClick={() => verifyPin(pin)}
              disabled={pin.length !== 6 || loading}
              style={{ marginTop: 12, width: '100%' }}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </>
        )}

        {error && <p style={{ color: 'red' }}>{error}</p>}

        {user && (
          <div
            style={{
              marginTop: 24,
              padding: 24,
              borderRadius: 8,
              backgroundColor: '#f0fdf4',
              border: '1px solid #86efac',
            }}
          >
            <div style={{ fontSize: 32 }}>✅</div>
            <h2 style={{ color: '#166534' }}>Verification Successful</h2>

            <p><b>Name:</b> {user.name}</p>
            <p><b>Email:</b> {user.email}</p>
            <p><b>Phone:</b> {user.phone}</p>
            <p><b>Global ID:</b> {user.global_id}</p>

            <button
              onClick={resetVerification}
              style={{ marginTop: 16, width: '100%' }}
            >
              Verify another PIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
