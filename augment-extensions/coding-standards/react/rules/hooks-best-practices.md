# React Hooks Best Practices

Guidelines for using React Hooks effectively.

## useState

Manage component state with useState.

```tsx
// Good - Descriptive names, proper typing
const [isLoading, setIsLoading] = useState<boolean>(false);
const [users, setUsers] = useState<User[]>([]);
const [error, setError] = useState<Error | null>(null);

// Good - Functional updates for state based on previous state
const [count, setCount] = useState(0);
const increment = () => setCount(prev => prev + 1);

// Bad - Non-descriptive names
const [data, setData] = useState([]);
const [flag, setFlag] = useState(false);

// Bad - Direct state mutation
const [items, setItems] = useState([1, 2, 3]);
items.push(4); // Don't mutate state directly
setItems(items); // This won't trigger re-render
```

## useEffect

Handle side effects properly.

```tsx
// Good - Cleanup function
useEffect(() => {
  const subscription = api.subscribe(userId);
  
  return () => {
    subscription.unsubscribe();
  };
}, [userId]);

// Good - Separate effects for different concerns
useEffect(() => {
  fetchUserData(userId);
}, [userId]);

useEffect(() => {
  trackPageView(pageName);
}, [pageName]);

// Bad - Missing dependencies
useEffect(() => {
  fetchData(userId); // userId should be in deps
}, []); // Missing dependency

// Bad - Multiple unrelated effects
useEffect(() => {
  fetchUserData(userId);
  trackPageView(pageName);
  updateTitle(title);
}, [userId, pageName, title]);
```

## useCallback

Memoize callback functions.

```tsx
// Good - Memoize callbacks passed to child components
const handleSubmit = useCallback((data: FormData) => {
  submitForm(data);
}, [submitForm]);

// Good - Memoize event handlers with dependencies
const handleUserClick = useCallback((userId: string) => {
  navigate(`/users/${userId}`);
}, [navigate]);

// Bad - Creating new function on every render
const handleClick = () => {
  doSomething();
};

// Bad - Unnecessary useCallback
const handleClick = useCallback(() => {
  console.log('clicked');
}, []); // Not needed if not passed to memoized child
```

## useMemo

Memoize expensive computations.

```tsx
// Good - Memoize expensive calculations
const sortedUsers = useMemo(() => {
  return users.sort((a, b) => a.name.localeCompare(b.name));
}, [users]);

// Good - Memoize complex objects
const config = useMemo(() => ({
  apiUrl: process.env.API_URL,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' }
}), []);

// Bad - Unnecessary memoization
const fullName = useMemo(() => `${firstName} ${lastName}`, [firstName, lastName]);
// Simple string concatenation doesn't need memoization

// Bad - Memoizing everything
const value = useMemo(() => x + y, [x, y]); // Too simple
```

## useRef

Access DOM elements and persist values.

```tsx
// Good - DOM reference
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  inputRef.current?.focus();
}, []);

return <input ref={inputRef} />;

// Good - Persist value across renders
const previousValue = useRef<string>();

useEffect(() => {
  previousValue.current = value;
}, [value]);

// Bad - Using ref for state
const countRef = useRef(0);
countRef.current++; // Use useState instead
```

## useContext

Consume context values.

```tsx
// Good - Type-safe context
interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Usage
const { theme, toggleTheme } = useTheme();

// Bad - No error handling
const theme = useContext(ThemeContext); // Could be undefined
```

## Custom Hooks

Extract reusable logic into custom hooks.

```tsx
// Good - Custom hook for data fetching
function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let cancelled = false;
    
    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await api.getUser(userId);
        if (!cancelled) {
          setUser(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    
    fetchUser();
    
    return () => {
      cancelled = true;
    };
  }, [userId]);
  
  return { user, loading, error };
}

// Usage
const { user, loading, error } = useUser(userId);
```

## Rules of Hooks

1. **Only call hooks at the top level** - Don't call inside loops, conditions, or nested functions
2. **Only call hooks from React functions** - Components or custom hooks
3. **Name custom hooks with "use" prefix** - useCustomHook
4. **Include all dependencies** - In useEffect, useCallback, useMemo
5. **Clean up effects** - Return cleanup function when needed

## Best Practices

1. **Use ESLint plugin** - eslint-plugin-react-hooks
2. **Keep effects focused** - One effect per concern
3. **Memoize callbacks** - When passing to memoized children
4. **Extract custom hooks** - For reusable logic
5. **Type everything** - Use TypeScript for all hooks
6. **Handle cleanup** - Always clean up subscriptions/timers
7. **Avoid unnecessary memoization** - Profile before optimizing
8. **Use functional updates** - When new state depends on old state

