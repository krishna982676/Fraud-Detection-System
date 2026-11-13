import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Settings, Save, Shield, Bell, Radio, Eye, Volume2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { getSystemSettings, updateSystemSettings } from '../../api/settings';
import { BRAND } from '../../config/brand';
import { cn } from '../../lib/utils';

export const SettingsPage: React.FC = () => {
  const [highThreshold, setHighThreshold] = useState(0.20);
  const [medThreshold, setMedThreshold] = useState(0.12);
  const [dedupMinutes, setDedupMinutes] = useState(5);
  const [escalateMinutes, setEscalateMinutes] = useState(10);
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('sx_high_contrast') === 'true' ||
      document.documentElement.classList.contains('high-contrast');
  });
  const [audioEnabled, setAudioEnabled] = useState(() => {
    return localStorage.getItem('sx_audio_enabled') === 'true';
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    getSystemSettings()
      .then((cfg) => {
        if (cfg) {
          if (cfg.highThreshold !== undefined) setHighThreshold(cfg.highThreshold);
          if (cfg.medThreshold !== undefined) setMedThreshold(cfg.medThreshold);
          if (cfg.dedupWindowMinutes !== undefined) setDedupMinutes(cfg.dedupWindowMinutes);
          if (cfg.escalationLimitMinutes !== undefined) setEscalateMinutes(cfg.escalationLimitMinutes);
          if (cfg.highContrastMode !== undefined) setHighContrast(cfg.highContrastMode);
          if (cfg.audioAlertsEnabled !== undefined) setAudioEnabled(cfg.audioAlertsEnabled);
        }
      })
      .catch(() => {
        // Fallback to local storage
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
      localStorage.setItem('sx_high_contrast', 'true');
    } else {
      document.documentElement.classList.remove('high-contrast');
      localStorage.setItem('sx_high_contrast', 'false');
    }
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem('sx_audio_enabled', audioEnabled ? 'true' : 'false');
  }, [audioEnabled]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSystemSettings({
        highThreshold,
        medThreshold,
        dedupWindowMinutes: dedupMinutes,
        escalationLimitMinutes: escalateMinutes,
        highContrastMode: highContrast,
        audioAlertsEnabled: audioEnabled,
      });

      // Save to localStorage as well
      localStorage.setItem('sentinelx_settings', JSON.stringify({
        highThreshold,
        medThreshold,
        dedupMinutes,
        escalateMinutes,
        highContrast,
        audioEnabled,
      }));

      toast.success('Operational thresholds and security policies saved.', {
        description: `High risk cutoff set to ${(highThreshold * 100).toFixed(0)}%, Dedup: ${dedupMinutes}m.`,
      });
    } catch {
      toast.error('Failed to sync settings with backend server.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{BRAND.name} // Security System Settings</title>
      </Helmet>

      <div className="space-y-6 max-w-4xl font-mono text-sm">
        <div className="border-b border-border pb-4">
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Settings className="w-5 h-5 text-accent" />
            System Parameters &amp; Risk Policies
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Configure global risk score cutoffs, accessibility contrast modes, alert deduplication windows, and escalation automation.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Policy Group 0: Accessibility & Display */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-2xl">
            <h3 className="font-bold text-text-primary text-base mb-4 border-b border-border pb-2 flex items-center gap-2">
              <Eye className="w-4 h-4 text-accent" />
              Accessibility &amp; High Contrast Mode
            </h3>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-surface-raised border border-border-strong">
                <div>
                  <span className="text-sm font-bold text-text-primary block">
                    High Contrast Display Mode
                  </span>
                  <span className="text-xs text-text-secondary mt-0.5 block">
                    Elevates borders and text contrast to WCAG AAA levels (#3B5A48 borders, pure #FFFFFF text).
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={highContrast}
                  onClick={() => setHighContrast(!highContrast)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${
                    highContrast ? 'bg-accent' : 'bg-surface border border-border-strong'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-accent-contrast transition-transform ${
                      highContrast ? 'translate-x-6' : 'translate-x-1 bg-text-secondary'
                    }`}
                  />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-surface-raised border border-border-strong">
                <div>
                  <span className="text-sm font-bold text-text-primary block">
                    Audio Chime Alert Notifications
                  </span>
                  <span className="text-xs text-text-secondary mt-0.5 block">
                    Plays harmonic synthesized chime whenever high risk anomalous breaches are detected.
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={audioEnabled}
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${
                    audioEnabled ? 'bg-accent' : 'bg-surface border border-border-strong'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-accent-contrast transition-transform ${
                      audioEnabled ? 'translate-x-6' : 'translate-x-1 bg-text-secondary'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Policy Group 1: Scoring Thresholds */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-2xl">
            <h3 className="font-bold text-text-primary text-base mb-4 border-b border-border pb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-accent" />
              Risk Classification Thresholds
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-text-secondary font-semibold uppercase text-xs block mb-2">
                  High Risk Threshold (Alert Trigger): {(highThreshold * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0.10"
                  max="0.95"
                  step="0.05"
                  value={highThreshold}
                  onChange={(e) => setHighThreshold(parseFloat(e.target.value))}
                  className="w-full cyber-slider cursor-pointer"
                  aria-label="High risk cutoff"
                />
                <span className="text-xs text-text-muted mt-1 block">
                  Transactions scoring &ge; {(highThreshold * 100).toFixed(0)}% are classified HIGH and raise an alert.
                </span>
              </div>

              <div>
                <label className="text-text-secondary font-semibold uppercase text-xs block mb-2">
                  Medium Risk Threshold (Suspicious): {(medThreshold * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0.05"
                  max="0.80"
                  step="0.02"
                  value={medThreshold}
                  onChange={(e) => setMedThreshold(parseFloat(e.target.value))}
                  className="w-full cyber-slider cursor-pointer"
                  aria-label="Medium risk cutoff"
                />
                <span className="text-xs text-text-muted mt-1 block">
                  Transactions scoring {(medThreshold * 100).toFixed(0)}% to {(highThreshold * 100).toFixed(0)}% are routed for REVIEW.
                </span>
              </div>
            </div>
          </div>

          {/* Policy Group 2: Deduplication & Escalation Windows */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-2xl">
            <h3 className="font-bold text-text-primary text-base mb-4 border-b border-border pb-2 flex items-center gap-2">
              <Bell className="w-4 h-4 text-accent" />
              Alert Deduplication &amp; Escalation Automation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-text-secondary font-semibold uppercase text-xs block mb-2">
                  Deduplication Window: {dedupMinutes} Minutes
                </label>
                <select
                  value={dedupMinutes}
                  onChange={(e) => setDedupMinutes(parseInt(e.target.value, 10))}
                  className="w-full bg-surface-raised border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent text-xs font-mono"
                >
                  <option value={1}>1 Minute</option>
                  <option value={5}>5 Minutes (Default)</option>
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                </select>
                <span className="text-xs text-text-muted mt-1 block">
                  Repeated alerts for the same user within this window are automatically merged.
                </span>
              </div>

              <div>
                <label className="text-text-secondary font-semibold uppercase text-xs block mb-2">
                  Auto-Escalation Stale Limit: {escalateMinutes} Minutes
                </label>
                <select
                  value={escalateMinutes}
                  onChange={(e) => setEscalateMinutes(parseInt(e.target.value, 10))}
                  className="w-full bg-surface-raised border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent text-xs font-mono"
                >
                  <option value={5}>5 Minutes</option>
                  <option value={10}>10 Minutes (Default)</option>
                  <option value={20}>20 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
                <span className="text-xs text-text-muted mt-1 block">
                  Unreviewed open alerts older than this time are promoted to ESCALATED status.
                </span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="submit" variant="primary" size="md" isLoading={saving}>
              <Save className="w-4 h-4 mr-1.5" />
              Persist System Policies
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default SettingsPage;
