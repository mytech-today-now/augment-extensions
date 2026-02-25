import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useNavigationState,
  loadNavigationState,
  saveNavigationState,
  clearNavigationState,
  NavigationState,
} from '@cli/gui/state/navigation-state';

describe('NavigationState', () => {
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

  describe('loadNavigationState', () => {
    it('should return null if no state is stored', () => {
      const result = loadNavigationState();
      expect(result).toBeNull();
    });

    it('should load state from localStorage', () => {
      const state: NavigationState = {
        currentCategory: 'coding-standards',
        currentModule: 'typescript',
        expandedCategories: new Set(['coding-standards', 'workflows']),
        focusedComponent: 'tree',
      };

      saveNavigationState(state);
      const loaded = loadNavigationState();

      expect(loaded).not.toBeNull();
      expect(loaded?.currentCategory).toBe('coding-standards');
      expect(loaded?.currentModule).toBe('typescript');
      expect(loaded?.expandedCategories).toEqual(new Set(['coding-standards', 'workflows']));
      expect(loaded?.focusedComponent).toBe('tree');
    });

    it('should handle corrupted localStorage data', () => {
      localStorageMock.setItem('augx_navigation_state', 'invalid json');
      const result = loadNavigationState();
      expect(result).toBeNull();
    });
  });

  describe('saveNavigationState', () => {
    it('should save state to localStorage', () => {
      const state: NavigationState = {
        currentCategory: 'domain-rules',
        currentModule: 'api-design',
        expandedCategories: new Set(['domain-rules']),
        focusedComponent: 'preview',
      };

      saveNavigationState(state);
      const stored = localStorageMock.getItem('augx_navigation_state');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.currentCategory).toBe('domain-rules');
      expect(parsed.currentModule).toBe('api-design');
      expect(parsed.expandedCategories).toEqual(['domain-rules']);
      expect(parsed.focusedComponent).toBe('preview');
    });

    it('should serialize Set to Array', () => {
      const state: NavigationState = {
        currentCategory: null,
        currentModule: null,
        expandedCategories: new Set(['cat1', 'cat2', 'cat3']),
        focusedComponent: 'tree',
      };

      saveNavigationState(state);
      const stored = localStorageMock.getItem('augx_navigation_state');
      const parsed = JSON.parse(stored!);
      
      expect(Array.isArray(parsed.expandedCategories)).toBe(true);
      expect(parsed.expandedCategories).toContain('cat1');
      expect(parsed.expandedCategories).toContain('cat2');
      expect(parsed.expandedCategories).toContain('cat3');
    });
  });

  describe('clearNavigationState', () => {
    it('should remove state from localStorage', () => {
      const state: NavigationState = {
        currentCategory: 'test',
        currentModule: 'test',
        expandedCategories: new Set(['test']),
        focusedComponent: 'tree',
      };

      saveNavigationState(state);
      expect(localStorageMock.getItem('augx_navigation_state')).not.toBeNull();

      clearNavigationState();
      expect(localStorageMock.getItem('augx_navigation_state')).toBeNull();
    });
  });

  describe('useNavigationState hook', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useNavigationState());
      const [state] = result.current;

      expect(state.currentCategory).toBeNull();
      expect(state.currentModule).toBeNull();
      expect(state.expandedCategories.size).toBe(0);
      expect(state.focusedComponent).toBe('tree');
    });

    it('should load persisted state on initialization', () => {
      const persistedState: NavigationState = {
        currentCategory: 'workflows',
        currentModule: 'beads',
        expandedCategories: new Set(['workflows', 'examples']),
        focusedComponent: 'version',
      };

      saveNavigationState(persistedState);

      const { result } = renderHook(() => useNavigationState());
      const [state] = result.current;

      expect(state.currentCategory).toBe('workflows');
      expect(state.currentModule).toBe('beads');
      expect(state.expandedCategories).toEqual(new Set(['workflows', 'examples']));
      expect(state.focusedComponent).toBe('version');
    });

    it('should update current category', () => {
      const { result } = renderHook(() => useNavigationState());

      act(() => {
        const [, actions] = result.current;
        actions.setCurrentCategory('coding-standards');
      });

      const [state] = result.current;
      expect(state.currentCategory).toBe('coding-standards');
    });

    it('should update current module', () => {
      const { result } = renderHook(() => useNavigationState());

      act(() => {
        const [, actions] = result.current;
        actions.setCurrentModule('typescript');
      });

      const [state] = result.current;
      expect(state.currentModule).toBe('typescript');
    });

    it('should toggle category expansion', () => {
      const { result } = renderHook(() => useNavigationState());

      act(() => {
        const [, actions] = result.current;
        actions.toggleCategory('test-category');
      });

      let [state] = result.current;
      expect(state.expandedCategories.has('test-category')).toBe(true);

      act(() => {
        const [, actions] = result.current;
        actions.toggleCategory('test-category');
      });

      [state] = result.current;
      expect(state.expandedCategories.has('test-category')).toBe(false);
    });

    it('should expand category', () => {
      const { result } = renderHook(() => useNavigationState());

      act(() => {
        const [, actions] = result.current;
        actions.expandCategory('category1');
        actions.expandCategory('category2');
      });

      const [state] = result.current;
      expect(state.expandedCategories.has('category1')).toBe(true);
      expect(state.expandedCategories.has('category2')).toBe(true);
    });

    it('should collapse category', () => {
      const { result } = renderHook(() => useNavigationState());

      act(() => {
        const [, actions] = result.current;
        actions.expandCategory('category1');
        actions.expandCategory('category2');
      });

      act(() => {
        const [, actions] = result.current;
        actions.collapseCategory('category1');
      });

      const [state] = result.current;
      expect(state.expandedCategories.has('category1')).toBe(false);
      expect(state.expandedCategories.has('category2')).toBe(true);
    });

    it('should set focused component', () => {
      const { result } = renderHook(() => useNavigationState());

      act(() => {
        const [, actions] = result.current;
        actions.setFocusedComponent('search');
      });

      const [state] = result.current;
      expect(state.focusedComponent).toBe('search');
    });

    it('should persist state changes to localStorage', () => {
      const { result } = renderHook(() => useNavigationState());

      act(() => {
        const [, actions] = result.current;
        actions.setCurrentCategory('test-category');
        actions.setCurrentModule('test-module');
        actions.expandCategory('expanded-cat');
      });

      // Wait for useEffect to run
      const stored = localStorageMock.getItem('augx_navigation_state');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.currentCategory).toBe('test-category');
      expect(parsed.currentModule).toBe('test-module');
      expect(parsed.expandedCategories).toContain('expanded-cat');
    });
  });
});


