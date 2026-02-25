import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useSelectionState,
  loadSelectionState,
  saveSelectionState,
  clearSelectionState,
  SelectionState,
} from '@cli/gui/state/selection-state';

describe('SelectionState', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  beforeEach(() => {
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('loadSelectionState', () => {
    it('should return null if no state is stored', () => {
      const result = loadSelectionState();
      expect(result).toBeNull();
    });

    it('should load state from localStorage', () => {
      const state: SelectionState = {
        selectedModule: 'typescript-standards',
        selectedVersion: '1.2.0',
        availableVersions: ['1.0.0', '1.1.0', '1.2.0'],
        isLoading: true, // Should not be persisted
        error: 'test error', // Should not be persisted
      };

      saveSelectionState(state);
      const loaded = loadSelectionState();

      expect(loaded).not.toBeNull();
      expect(loaded?.selectedModule).toBe('typescript-standards');
      expect(loaded?.selectedVersion).toBe('1.2.0');
      expect(loaded?.availableVersions).toEqual(['1.0.0', '1.1.0', '1.2.0']);
      expect(loaded?.isLoading).toBe(false); // Should be reset
      expect(loaded?.error).toBeNull(); // Should be reset
    });

    it('should handle corrupted localStorage data', () => {
      localStorageMock.setItem('augx_selection_state', 'invalid json');
      const result = loadSelectionState();
      expect(result).toBeNull();
    });

    it('should handle missing availableVersions field', () => {
      localStorageMock.setItem('augx_selection_state', JSON.stringify({
        selectedModule: 'test',
        selectedVersion: '1.0.0',
      }));

      const loaded = loadSelectionState();
      expect(loaded?.availableVersions).toEqual([]);
    });
  });

  describe('saveSelectionState', () => {
    it('should save state to localStorage', () => {
      const state: SelectionState = {
        selectedModule: 'react-patterns',
        selectedVersion: '2.1.0',
        availableVersions: ['2.0.0', '2.1.0'],
        isLoading: false,
        error: null,
      };

      saveSelectionState(state);
      const stored = localStorageMock.getItem('augx_selection_state');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.selectedModule).toBe('react-patterns');
      expect(parsed.selectedVersion).toBe('2.1.0');
      expect(parsed.availableVersions).toEqual(['2.0.0', '2.1.0']);
    });

    it('should not persist loading state', () => {
      const state: SelectionState = {
        selectedModule: 'test',
        selectedVersion: '1.0.0',
        availableVersions: [],
        isLoading: true,
        error: null,
      };

      saveSelectionState(state);
      const stored = localStorageMock.getItem('augx_selection_state');
      const parsed = JSON.parse(stored!);
      
      expect(parsed.isLoading).toBeUndefined();
    });

    it('should not persist error state', () => {
      const state: SelectionState = {
        selectedModule: 'test',
        selectedVersion: '1.0.0',
        availableVersions: [],
        isLoading: false,
        error: 'Some error occurred',
      };

      saveSelectionState(state);
      const stored = localStorageMock.getItem('augx_selection_state');
      const parsed = JSON.parse(stored!);
      
      expect(parsed.error).toBeUndefined();
    });
  });

  describe('clearSelectionState', () => {
    it('should remove state from localStorage', () => {
      const state: SelectionState = {
        selectedModule: 'test',
        selectedVersion: '1.0.0',
        availableVersions: ['1.0.0'],
        isLoading: false,
        error: null,
      };

      saveSelectionState(state);
      expect(localStorageMock.getItem('augx_selection_state')).not.toBeNull();

      clearSelectionState();
      expect(localStorageMock.getItem('augx_selection_state')).toBeNull();
    });
  });

  describe('useSelectionState hook', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useSelectionState());
      const [state] = result.current;

      expect(state.selectedModule).toBeNull();
      expect(state.selectedVersion).toBeNull();
      expect(state.availableVersions).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should load persisted state on initialization', () => {
      const persistedState: SelectionState = {
        selectedModule: 'beads-workflow',
        selectedVersion: '3.0.0',
        availableVersions: ['2.0.0', '3.0.0'],
        isLoading: false,
        error: null,
      };

      saveSelectionState(persistedState);

      const { result } = renderHook(() => useSelectionState());
      const [state] = result.current;

      expect(state.selectedModule).toBe('beads-workflow');
      expect(state.selectedVersion).toBe('3.0.0');
      expect(state.availableVersions).toEqual(['2.0.0', '3.0.0']);
    });

    it('should select module and clear version', () => {
      const { result } = renderHook(() => useSelectionState());

      act(() => {
        const [, actions] = result.current;
        actions.selectModule('typescript-standards');
      });

      const [state] = result.current;
      expect(state.selectedModule).toBe('typescript-standards');
      expect(state.selectedVersion).toBeNull();
      expect(state.availableVersions).toEqual([]);
    });

    it('should select version', () => {
      const { result } = renderHook(() => useSelectionState());

      act(() => {
        const [, actions] = result.current;
        actions.selectVersion('1.5.0');
      });

      const [state] = result.current;
      expect(state.selectedVersion).toBe('1.5.0');
    });

    it('should set available versions', () => {
      const { result } = renderHook(() => useSelectionState());
      const versions = ['1.0.0', '1.1.0', '1.2.0', '2.0.0'];

      act(() => {
        const [, actions] = result.current;
        actions.setAvailableVersions(versions);
      });

      const [state] = result.current;
      expect(state.availableVersions).toEqual(versions);
    });

    it('should set loading state', () => {
      const { result } = renderHook(() => useSelectionState());

      act(() => {
        const [, actions] = result.current;
        actions.setLoading(true);
      });

      let [state] = result.current;
      expect(state.isLoading).toBe(true);

      act(() => {
        const [, actions] = result.current;
        actions.setLoading(false);
      });

      [state] = result.current;
      expect(state.isLoading).toBe(false);
    });

    it('should set error state', () => {
      const { result } = renderHook(() => useSelectionState());

      act(() => {
        const [, actions] = result.current;
        actions.setError('Failed to load versions');
      });

      let [state] = result.current;
      expect(state.error).toBe('Failed to load versions');

      act(() => {
        const [, actions] = result.current;
        actions.setError(null);
      });

      [state] = result.current;
      expect(state.error).toBeNull();
    });

    it('should clear selection', () => {
      const { result } = renderHook(() => useSelectionState());

      // Set some state first
      act(() => {
        const [, actions] = result.current;
        actions.selectModule('test-module');
        actions.selectVersion('1.0.0');
        actions.setAvailableVersions(['1.0.0', '2.0.0']);
        actions.setError('test error');
      });

      // Clear selection
      act(() => {
        const [, actions] = result.current;
        actions.clearSelection();
      });

      const [state] = result.current;
      expect(state.selectedModule).toBeNull();
      expect(state.selectedVersion).toBeNull();
      expect(state.availableVersions).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();

      // Verify localStorage was also cleared
      expect(localStorageMock.getItem('augx_selection_state')).toBeNull();
    });

    it('should persist state changes to localStorage', () => {
      const { result } = renderHook(() => useSelectionState());

      act(() => {
        const [, actions] = result.current;
        actions.selectModule('test-module');
        actions.selectVersion('2.0.0');
        actions.setAvailableVersions(['1.0.0', '2.0.0']);
      });

      // Wait for useEffect to run
      const stored = localStorageMock.getItem('augx_selection_state');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.selectedModule).toBe('test-module');
      expect(parsed.selectedVersion).toBe('2.0.0');
      expect(parsed.availableVersions).toEqual(['1.0.0', '2.0.0']);
    });
  });
});

