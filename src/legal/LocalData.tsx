import { useCallback, useEffect, useState } from 'react';
import {
  LOCAL_DATA_EVENT,
  clearLocalData,
  clearLocalKey,
  listStored,
  storageAvailable,
  type StorageKey,
} from '../lib/storage';
import { LOCAL_DATA_INFO, presentValue } from './localData';
import { LEGAL, LEGAL_ROUTES } from './config';
import LegalLayout from './LegalLayout';

export default function LocalData() {
  const [entries, setEntries] = useState(() => listStored());
  const [available, setAvailable] = useState(() => storageAvailable());
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState('');

  const refresh = useCallback(() => {
    setEntries(listStored());
    setAvailable(storageAvailable());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(LOCAL_DATA_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(LOCAL_DATA_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  const count = entries.filter((entry) => entry.value !== null).length;

  function clearOne(key: StorageKey, label: string) {
    clearLocalKey(key);
    refresh();
    setMessage(`${label} removed from this browser.`);
  }

  function exportCopy() {
    const payload = {
      exportedAt: new Date().toISOString(),
      product: 'ShiftedMind Tone Lab',
      note: 'Local storage entries from this browser. No audio is ever stored.',
      entries: entries.map((entry) => ({
        key: entry.key,
        label: LOCAL_DATA_INFO[entry.key].label,
        value: entry.value,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'shiftedmind-tone-lab-local-data.json';
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage('A copy was downloaded to your device.');
  }

  function clearAll() {
    clearLocalData();
    setConfirming(false);
    refresh();
    setMessage('All local data from this lab has been removed.');
  }

  return (
    <LegalLayout title="Local data and controls" eyebrow="Your data">
      <p>
        Everything the lab remembers about you lives in this browser, under {entries.length} namespaced keys.
        Nothing is sent to a server, so this page is the whole inventory — and the whole delete button.
      </p>

      <div
        role="note"
        className="rounded-xl border border-sage/35 bg-sage/[0.08] p-4 text-sm leading-relaxed text-cream/85"
      >
        <strong className="text-cream">No audio is stored anywhere.</strong> A recording exists only as a temporary
        in-memory clip while the tab is open, and the ambient scenes are generated live from oscillators. Neither
        is on this list because neither can be listed: they are gone when you close or reload the page. The sound
        entry below is a preference — whether sound is on, which scene, how loud — not a recording.
      </div>

      <h2>What is stored right now</h2>
      {!available && (
        <p className="rounded-xl border border-heat/40 bg-heat/10 p-4 text-sm">
          This browser is blocking local storage. Nothing can be saved, and the lab still works — your entries
          simply reset when you reload.
        </p>
      )}

      <div className="legal-table-scroll" tabIndex={0} role="group" aria-label="Local storage entries">
        <table>
          <caption className="sr-only">Local storage entries used by the lab, their purpose and current value</caption>
          <thead>
            <tr>
              <th scope="col">Entry</th>
              <th scope="col">Why it exists</th>
              <th scope="col">Current value</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const info = LOCAL_DATA_INFO[entry.key];
              return (
                <tr key={entry.key}>
                  <th scope="row" className="text-left">
                    {info.label}
                    <br />
                    <code className="text-[0.7em] break-all">{entry.key}</code>
                  </th>
                  <td data-label="Why it exists">
                    {info.purpose}
                    <br />
                    <span className="text-muted">{info.retention}</span>
                  </td>
                  <td data-label="Current value">{presentValue(entry.key, entry.value)}</td>
                  <td data-label="Action">
                    <button
                      type="button"
                      className="btn btn-quiet min-h-11! px-3! text-xs"
                      disabled={entry.value === null}
                      onClick={() => clearOne(entry.key, info.label)}
                    >
                      <span className="sr-only">Remove {info.label}</span>
                      <span aria-hidden="true">Remove</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-muted">
        {count === 0 ? 'Nothing is stored right now.' : `${count} of ${entries.length} entries stored.`}
      </p>

      <p aria-live="polite" role="status" className="min-h-6 text-sm text-sage">
        {message}
      </p>

      <h2>Take a copy</h2>
      <p>
        Download the three entries as a JSON file. This is the same data shown above, in a format you can keep.
        The download is created in your browser; nothing is uploaded.
      </p>
      <button
        type="button"
        className="btn btn-quiet min-h-11! px-3.5! text-sm"
        disabled={count === 0}
        onClick={exportCopy}
      >
        Download my local data
      </button>

      <h2>Clear everything</h2>        <p>
          This removes every key listed above and nothing else. It does not touch your browser’s saved passwords,
          other sites, or anything outside this origin. It cannot be undone.
        </p>

      {confirming ? (
        <div className="rounded-xl border border-heat/45 bg-heat/[0.09] p-4">
          <p className="text-sm font-semibold text-cream">
            Remove all {entries.length} entries now?
          </p>
          <p className="mt-1 text-xs leading-relaxed text-cream/80">
            Your saved intention and best drill score will be gone. The microphone notice will appear again before
            your next recording.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary min-h-11! px-3.5! text-sm" onClick={clearAll}>
              Yes, remove them
            </button>
            <button
              type="button"
              className="btn btn-quiet min-h-11! px-3.5! text-sm"
              onClick={() => setConfirming(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-quiet min-h-11! px-3.5! text-sm"
          disabled={count === 0}
          onClick={() => setConfirming(true)}
        >
          Clear all local data
        </button>
      )}

      <h2>Other routes to the same result</h2>
      <ul>
        <li>Clearing site data for this address in your browser settings removes all three keys at once.</li>
        <li>Using a private window means nothing survives the session.</li>
        <li>
          For anything this page cannot reach — for example a request about hosting logs — email{' '}
          <strong>{LEGAL.contactEmail}</strong>. See the <a href={LEGAL_ROUTES.privacy}>privacy notice</a> for
          what those logs contain and your rights.
        </li>
      </ul>
    </LegalLayout>
  );
}
