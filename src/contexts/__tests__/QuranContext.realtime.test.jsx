import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { QuranProvider, useQuranData } from '../QuranContext';

vi.mock('../../lib/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  onSnapshot: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  serverTimestamp: vi.fn()
}));
vi.mock('../../data/quran-data.js', () => ({
  getAllSurahsInfo: () => []
}));
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() }
}));

const snapshotDoc = (data) => ({ id: data.id, data: () => data });

describe('QuranContext live audio deletions', () => {
  let records;
  let listeners;
  let storage;

  beforeEach(() => {
    vi.clearAllMocks();
    storage = new Map();
    localStorage.getItem.mockImplementation((key) => storage.get(key) ?? null);
    localStorage.setItem.mockImplementation((key, value) => storage.set(key, value));
    localStorage.removeItem.mockImplementation((key) => storage.delete(key));
    records = {
      custom_urls: [
        { id: 'custom-1', url: 'https://example.com/custom.mp3' },
        { id: 'custom-2', url: 'https://example.com/other.mp3' }
      ],
      audio_mappings: [
        {
          id: 'mapping-1',
          surah_number: 1,
          ayah_number: 1,
          audio_url: 'https://example.com/override.mp3',
          custom_url_id: 'custom-1'
        },
        {
          id: 'mapping-2',
          surah_number: 1,
          ayah_number: 2,
          audio_url: 'https://example.com/keep.mp3'
        }
      ],
      tafseer_entries: []
    };
    listeners = {};
    collection.mockImplementation((_db, name) => ({ name, filters: [] }));
    where.mockImplementation((field, _operator, value) => ({ field, value }));
    query.mockImplementation((ref, ...filters) => ({ ...ref, filters }));
    getDocs.mockImplementation(async ({ name, filters }) => {
      const docs = records[name]
        .filter((record) => filters.every(({ field, value }) => record[field] === value))
        .map(snapshotDoc);
      return { docs, empty: docs.length === 0 };
    });
    onSnapshot.mockImplementation(({ name }, callback) => {
      listeners[name] = callback;
      return vi.fn();
    });
  });

  const mountReader = async () => {
    const hook = renderHook(() => useQuranData(), { wrapper: QuranProvider });
    await waitFor(() => {
      expect(hook.result.current.getAudioUrl(1, 1)).toBe('https://example.com/custom.mp3');
    });
    return hook;
  };

  const emit = async (name, type, data) => {
    await act(async () => {
      listeners[name]({ docChanges: () => [{ type, doc: snapshotDoc(data) }] });
    });
  };

  it('removes deleted mappings from the reader and saved cache, preserving other ayahs', async () => {
    const { result } = await mountReader();
    storage.set('quran_audio_mappings', JSON.stringify(result.current.audioMappings));
    const removed = records.audio_mappings.shift();

    await emit('audio_mappings', 'removed', removed);

    expect(result.current.audioMappings['1:1']).toBeUndefined();
    expect(result.current.getAudioUrl(1, 1)).toBe(
      'https://everyayah.com/data/Alafasy_128kbps/001001.mp3'
    );
    expect(result.current.getAudioUrl(1, 2)).toBe('https://example.com/keep.mp3');
    expect(JSON.parse(storage.get('quran_audio_mappings'))).toEqual(result.current.audioMappings);
  });

  it('tolerates a deletion for an ayah that is not in the local mapping cache', async () => {
    const { result } = await mountReader();
    const before = result.current.audioMappings;

    await emit('audio_mappings', 'removed', {
      id: 'unknown', surah_number: 2, ayah_number: 1
    });

    expect(result.current.audioMappings).toEqual(before);
  });

  it('removes deleted custom URLs from the list and stops using them for playback', async () => {
    const { result } = await mountReader();
    const removed = records.custom_urls.shift();

    await emit('custom_urls', 'removed', removed);

    await waitFor(() => {
      expect(result.current.customUrls.map(({ id }) => id)).toEqual(['custom-2']);
      expect(result.current.getAudioUrl(1, 1)).toBe('https://example.com/override.mp3');
    });
    expect(result.current.getAudioUrl(1, 2)).toBe('https://example.com/keep.mp3');
    expect(JSON.parse(storage.get('quran_audio_mappings'))['1:1'].customUrl).toBeNull();
  });

  it.each(['added', 'modified'])('still applies %s audio mappings', async (type) => {
    const { result } = await mountReader();
    const mapping = records.audio_mappings[1];
    mapping.audio_url = 'https://example.com/updated.mp3';

    await emit('audio_mappings', type, mapping);

    await waitFor(() => {
      expect(result.current.getAudioUrl(1, 2)).toBe('https://example.com/updated.mp3');
    });
  });
});
