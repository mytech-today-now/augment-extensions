# React State Management

Patterns for managing state in React applications.

## Local State (useState)

Use for component-specific state.

```tsx
// Good - Local UI state
const SearchInput: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    />
  );
};
```

## Lifting State Up

Share state between components by moving it to common parent.

```tsx
// Good - Shared state in parent
const UserForm: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  
  return (
    <>
      <NameInput 
        value={formData.name} 
        onChange={(name) => setFormData(prev => ({ ...prev, name }))} 
      />
      <EmailInput 
        value={formData.email} 
        onChange={(email) => setFormData(prev => ({ ...prev, email }))} 
      />
      <FormPreview data={formData} />
    </>
  );
};
```

## Context API

Use for global or deeply nested state.

```tsx
// Good - Context for theme
interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);
  
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
```

## useReducer

Use for complex state logic.

```tsx
// Good - Complex state with useReducer
interface State {
  data: User[];
  loading: boolean;
  error: Error | null;
  page: number;
}

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: User[] }
  | { type: 'FETCH_ERROR'; payload: Error }
  | { type: 'SET_PAGE'; payload: number };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, data: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SET_PAGE':
      return { ...state, page: action.payload };
    default:
      return state;
  }
};

const UserList: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, {
    data: [],
    loading: false,
    error: null,
    page: 1
  });
  
  useEffect(() => {
    const fetchUsers = async () => {
      dispatch({ type: 'FETCH_START' });
      try {
        const users = await api.getUsers(state.page);
        dispatch({ type: 'FETCH_SUCCESS', payload: users });
      } catch (error) {
        dispatch({ type: 'FETCH_ERROR', payload: error as Error });
      }
    };
    
    fetchUsers();
  }, [state.page]);
  
  return (
    <>
      {state.loading && <Spinner />}
      {state.error && <Error message={state.error.message} />}
      <UserGrid users={state.data} />
      <Pagination 
        page={state.page} 
        onPageChange={(page) => dispatch({ type: 'SET_PAGE', payload: page })} 
      />
    </>
  );
};
```

## Zustand (Recommended)

Simple, fast state management library.

```tsx
// Good - Zustand store
import create from 'zustand';

interface UserStore {
  users: User[];
  loading: boolean;
  error: Error | null;
  fetchUsers: () => Promise<void>;
  addUser: (user: User) => void;
  removeUser: (id: string) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  loading: false,
  error: null,
  
  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const users = await api.getUsers();
      set({ users, loading: false });
    } catch (error) {
      set({ error: error as Error, loading: false });
    }
  },
  
  addUser: (user) => set((state) => ({ 
    users: [...state.users, user] 
  })),
  
  removeUser: (id) => set((state) => ({ 
    users: state.users.filter(u => u.id !== id) 
  }))
}));

// Usage
const UserList: React.FC = () => {
  const { users, loading, fetchUsers } = useUserStore();
  
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  return <UserGrid users={users} loading={loading} />;
};
```

## React Query

For server state management.

```tsx
// Good - React Query for data fetching
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.getUsers()
  });
};

const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (user: CreateUserInput) => api.createUser(user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};

// Usage
const UserList: React.FC = () => {
  const { data: users, isLoading, error } = useUsers();
  const createUser = useCreateUser();
  
  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;
  
  return (
    <>
      <UserGrid users={users} />
      <CreateUserForm onSubmit={createUser.mutate} />
    </>
  );
};
```

## Best Practices

1. **Start with local state** - Use useState for component state
2. **Lift state up** - When multiple components need it
3. **Use Context sparingly** - For truly global state (theme, auth)
4. **Use useReducer** - For complex state logic
5. **Consider Zustand** - For client state management
6. **Use React Query** - For server state (data fetching)
7. **Avoid prop drilling** - Use Context or state management
8. **Keep state minimal** - Derive values when possible
9. **Normalize data** - Avoid nested state structures
10. **Type everything** - Use TypeScript for all state

