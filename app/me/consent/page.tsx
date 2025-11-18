'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type ConsentStatus = 'granted' | 'denied' | null;

interface Consent {
  categoryId: string;
  categoryKey: string;
  categoryName: string;
  description: string | null;
  status: ConsentStatus;
  updatedAt: string | null;
}

interface User {
  id: string;
  email: string;
}

export default function ConsentPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [consents, setConsents] = useState<Consent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    loadUserAndConsents();
  }, []);

  async function loadUserAndConsents() {
    try {
      const userRes = await fetch('/api/auth/me');
      if (!userRes.ok) {
        router.push('/');
        return;
      }
      const userData = await userRes.json();
      setUser(userData.user);

      const consentsRes = await fetch(`/api/users/${userData.user.id}/consents`);
      const consentsData = await consentsRes.json();
      setConsents(consentsData.consents);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleConsent(categoryId: string, currentStatus: ConsentStatus) {
    if (!user) return;

    setSaving(categoryId);
    const newStatus = currentStatus === 'granted' ? 'denied' : 'granted';

    try {
      const res = await fetch(`/api/users/${user.id}/consents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, status: newStatus }),
      });

      if (res.ok) {
        setConsents((prev) =>
          prev.map((consent) =>
            consent.categoryId === categoryId
              ? { ...consent, status: newStatus, updatedAt: new Date().toISOString() }
              : consent
          )
        );
      }
    } catch (error) {
      console.error('Failed to update consent:', error);
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Consent Management</h1>
          {user && (
            <p className="mt-2 text-gray-600">
              Logged in as: <span className="font-medium">{user.email}</span>
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Manage Your Consent Preferences
            </h2>
            <p className="text-gray-600 mb-6">
              Control how we use your data by managing your consent preferences below.
            </p>

            <div className="space-y-4">
              {consents.map((consent) => (
                <div
                  key={consent.categoryId}
                  className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{consent.categoryName}</h3>
                    {consent.description && (
                      <p className="mt-1 text-sm text-gray-600">{consent.description}</p>
                    )}
                    {consent.updatedAt && (
                      <p className="mt-2 text-xs text-gray-500">
                        Last updated: {new Date(consent.updatedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => toggleConsent(consent.categoryId, consent.status)}
                    disabled={saving === consent.categoryId}
                    className={`ml-4 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      consent.status === 'granted' ? 'bg-blue-600' : 'bg-gray-200'
                    } ${saving === consent.categoryId ? 'opacity-50' : ''}`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        consent.status === 'granted' ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <a
            href="/me/preferences"
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Manage Notification Preferences →
          </a>
          <a
            href="/"
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
