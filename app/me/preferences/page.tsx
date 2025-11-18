'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type NotificationChannel = 'email' | 'sms' | 'push';
type Frequency = 'none' | 'low' | 'normal' | 'high';

interface NotificationPreference {
  id: string;
  channel: NotificationChannel;
  frequency: Frequency;
  metaJson: unknown;
  updatedAt: string;
}

interface User {
  id: string;
  email: string;
}

const FREQUENCY_OPTIONS: { value: Frequency; label: string; description: string }[] = [
  { value: 'none', label: 'None', description: 'No notifications' },
  { value: 'low', label: 'Low', description: 'Only critical updates' },
  { value: 'normal', label: 'Normal', description: 'Regular notifications' },
  { value: 'high', label: 'High', description: 'All notifications' },
];

const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  email: 'Email',
  sms: 'SMS',
  push: 'Push Notifications',
};

export default function PreferencesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    loadUserAndPreferences();
  }, []);

  async function loadUserAndPreferences() {
    try {
      const userRes = await fetch('/api/auth/me');
      if (!userRes.ok) {
        router.push('/');
        return;
      }
      const userData = await userRes.json();
      setUser(userData.user);

      const prefsRes = await fetch(`/api/users/${userData.user.id}/preferences`);
      const prefsData = await prefsRes.json();
      setPreferences(prefsData.preferences);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updatePreference(channel: NotificationChannel, frequency: Frequency) {
    if (!user) return;

    setSaving(channel);

    try {
      const res = await fetch(`/api/users/${user.id}/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, frequency }),
      });

      if (res.ok) {
        const { preference } = await res.json();
        setPreferences((prev) => {
          const existing = prev.find((p) => p.channel === channel);
          if (existing) {
            return prev.map((p) => (p.channel === channel ? preference : p));
          } else {
            return [...prev, preference];
          }
        });
      }
    } catch (error) {
      console.error('Failed to update preference:', error);
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

  const channelPreferences = ['email', 'sms', 'push'].map((channel) => {
    const pref = preferences.find((p) => p.channel === channel);
    return {
      channel: channel as NotificationChannel,
      frequency: pref?.frequency ?? 'normal',
      updatedAt: pref?.updatedAt,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Notification Preferences</h1>
          {user && (
            <p className="mt-2 text-gray-600">
              Logged in as: <span className="font-medium">{user.email}</span>
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Manage Notification Settings
            </h2>
            <p className="text-gray-600 mb-6">
              Choose how often you want to receive notifications through different channels.
            </p>

            <div className="space-y-6">
              {channelPreferences.map(({ channel, frequency, updatedAt }) => (
                <div key={channel} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{CHANNEL_LABELS[channel]}</h3>
                      {updatedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Last updated: {new Date(updatedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {FREQUENCY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updatePreference(channel, option.value)}
                        disabled={saving === channel}
                        className={`p-3 text-sm rounded-lg border-2 transition-all ${
                          frequency === option.value
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        } ${saving === channel ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs mt-1 opacity-75">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <a
            href="/me/consent"
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Manage Consent Preferences →
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
