# React Performance Optimization

Techniques for optimizing React application performance.

## React.memo

Prevent unnecessary re-renders of components.

```tsx
// Good - Memoize expensive components
interface UserCardProps {
  user: User;
  onEdit: (id: string) => void;
}

export const UserCard = React.memo<UserCardProps>(({ user, onEdit }) => {
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <button onClick={() => onEdit(user.id)}>Edit</button>
    </div>
  );
});

// Good - Custom comparison function
export const UserCard = React.memo<UserCardProps>(
  ({ user, onEdit }) => {
    return <div>{user.name}</div>;
  },
  (prevProps, nextProps) => {
    return prevProps.user.id === nextProps.user.id;
  }
);

// Bad - Memoizing everything unnecessarily
export const SimpleText = React.memo(({ text }: { text: string }) => {
  return <span>{text}</span>; // Too simple to memoize
});
```

## useCallback

Memoize callback functions to prevent child re-renders.

```tsx
// Good - Memoize callbacks passed to memoized children
const ParentComponent: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  
  const handleItemClick = useCallback((id: string) => {
    console.log('Clicked:', id);
  }, []);
  
  const handleItemDelete = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);
  
  return (
    <>
      {items.map(item => (
        <MemoizedItem
          key={item.id}
          item={item}
          onClick={handleItemClick}
          onDelete={handleItemDelete}
        />
      ))}
    </>
  );
};
```

## useMemo

Memoize expensive computations.

```tsx
// Good - Memoize expensive calculations
const ExpensiveComponent: React.FC<{ items: Item[] }> = ({ items }) => {
  const sortedAndFilteredItems = useMemo(() => {
    return items
      .filter(item => item.active)
      .sort((a, b) => a.priority - b.priority);
  }, [items]);
  
  const statistics = useMemo(() => {
    return {
      total: items.length,
      active: items.filter(i => i.active).length,
      average: items.reduce((sum, i) => sum + i.value, 0) / items.length
    };
  }, [items]);
  
  return (
    <>
      <Stats data={statistics} />
      <ItemList items={sortedAndFilteredItems} />
    </>
  );
};
```

## Code Splitting

Split code to reduce initial bundle size.

```tsx
// Good - Lazy load routes
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));

const App: React.FC = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  </Suspense>
);

// Good - Lazy load heavy components
const HeavyChart = lazy(() => import('./components/HeavyChart'));

const Analytics: React.FC = () => (
  <Suspense fallback={<ChartSkeleton />}>
    <HeavyChart data={data} />
  </Suspense>
);
```

## Virtualization

Render only visible items in long lists.

```tsx
// Good - Use react-window for long lists
import { FixedSizeList } from 'react-window';

const VirtualizedList: React.FC<{ items: Item[] }> = ({ items }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <ItemCard item={items[index]} />
    </div>
  );
  
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};
```

## Debouncing and Throttling

Limit expensive operations.

```tsx
// Good - Debounce search input
import { useDebouncedCallback } from 'use-debounce';

const SearchInput: React.FC = () => {
  const [query, setQuery] = useState('');
  
  const debouncedSearch = useDebouncedCallback(
    (value: string) => {
      performSearch(value);
    },
    500
  );
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };
  
  return <input value={query} onChange={handleChange} />;
};

// Good - Throttle scroll handler
import { useThrottledCallback } from 'use-debounce';

const ScrollTracker: React.FC = () => {
  const throttledScroll = useThrottledCallback(
    () => {
      trackScrollPosition(window.scrollY);
    },
    200
  );
  
  useEffect(() => {
    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [throttledScroll]);
  
  return null;
};
```

## Avoid Inline Objects and Functions

Prevent unnecessary re-renders.

```tsx
// Bad - Inline objects cause re-renders
const Parent: React.FC = () => (
  <Child style={{ margin: 10 }} /> // New object every render
);

// Good - Define outside or memoize
const childStyle = { margin: 10 };
const Parent: React.FC = () => (
  <Child style={childStyle} />
);

// Bad - Inline functions
const Parent: React.FC = () => (
  <Child onClick={() => console.log('clicked')} /> // New function every render
);

// Good - useCallback
const Parent: React.FC = () => {
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  
  return <Child onClick={handleClick} />;
};
```

## Image Optimization

Optimize images for better performance.

```tsx
// Good - Lazy load images
const LazyImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  return <img src={src} alt={alt} loading="lazy" />;
};

// Good - Use next/image for Next.js
import Image from 'next/image';

const OptimizedImage: React.FC = () => (
  <Image
    src="/photo.jpg"
    alt="Photo"
    width={500}
    height={300}
    placeholder="blur"
  />
);
```

## Profiling

Use React DevTools Profiler to identify performance issues.

```tsx
// Good - Wrap components to profile
import { Profiler } from 'react';

const onRenderCallback = (
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number
) => {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
};

const App: React.FC = () => (
  <Profiler id="App" onRender={onRenderCallback}>
    <Dashboard />
  </Profiler>
);
```

## Best Practices

1. **Profile first** - Use React DevTools before optimizing
2. **Use React.memo** - For expensive components
3. **Memoize callbacks** - Use useCallback for child props
4. **Memoize computations** - Use useMemo for expensive calculations
5. **Code split** - Lazy load routes and heavy components
6. **Virtualize lists** - Use react-window for long lists
7. **Debounce inputs** - Limit expensive operations
8. **Avoid inline objects** - Define outside or memoize
9. **Optimize images** - Use lazy loading and optimization
10. **Monitor bundle size** - Use webpack-bundle-analyzer

