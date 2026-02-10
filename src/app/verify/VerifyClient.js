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
      setError('Invalid or expired PIN');
    } finally {
      setLoading(false);
    }
  }

  function resetVerification() {
    setPin('');
    setUser(null);
    setError('');
    router.replace('/verify');
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at top, #111827, #000)',
        padding: 16,
      }}
    >
      {/* CARD */}
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          padding: 28,
          borderRadius: 16,
          background: user ? '#ecfdf5' : '#0b0f19',
          boxShadow: '0 25px 50px rgba(0,0,0,.6)',
          color: user ? '#065f46' : '#fff',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: 26, marginBottom: 20 }}>
          Verify Digital ID
        </h1>

        {/* PIN INPUT */}
        {!user && (
          <>
            <input
              value={pin}
              maxLength={6}
              placeholder="Enter 6-digit PIN"
              onChange={(e) =>
                setPin(e.target.value.replace(/\D/g, ''))
              }
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: 18,
                letterSpacing: 4,
                textAlign: 'center',
                borderRadius: 10,
                border: '1px solid #374151',
                background: '#020617',
                color: '#fff',
                outline: 'none',
              }}
            />

            <button
              onClick={() => verifyPin(pin)}
              disabled={pin.length !== 6 || loading}
              style={{
                width: '100%',
                marginTop: 16,
                padding: '12px 0',
                fontSize: 16,
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                background:
                  pin.length === 6 ? '#2563eb' : '#1f2937',
                color: '#fff',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Verifying…' : 'Verify'}
            </button>
          </>
        )}

        {/* ERROR */}
        {error && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: '#fee2e2',
              color: '#7f1d1d',
              borderRadius: 8,
              border: '1px solid #fecaca',
            }}
          >
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {user && (
          <>
            <div style={{ fontSize: 42, marginBottom: 8 }}>✅</div>

            <h2 style={{ fontSize: 24, marginBottom: 20 }}>
              Verification Successful
            </h2>

            <div
              style={{
                textAlign: 'left',
                background: '#ffffff',
                padding: 16,
                borderRadius: 10,
                marginBottom: 20,
                color: '#064e3b',
              }}
            >
              <p><b>Name:</b> {user.name}</p>
              <p><b>Email:</b> {user.email}</p>
              <p><b>Phone:</b> {user.phone}</p>
              <p><b>Global ID:</b> {user.global_id}</p>
            </div>

            <button
              onClick={resetVerification}
              style={{
                width: '100%',
                padding: '12px 0',
                fontSize: 16,
                borderRadius: 10,
                border: 'none',
                background: '#16a34a',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Verify another PIN
            </button>
          </>
        )}
      </div>
    </div>
  );
}
