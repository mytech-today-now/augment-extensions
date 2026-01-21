# TypeScript with React

Best practices for using TypeScript in React applications.

## Component Props

Always type component props explicitly.

```tsx
// Good - Explicit prop types
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'primary',
  disabled = false,
  children 
}) => {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children || label}
    </button>
  );
};

// Bad - No types
export const Button = ({ label, onClick, variant }) => {
  return <button onClick={onClick}>{label}</button>;
};
```

## Event Handlers

Type event handlers correctly.

```tsx
// Good - Typed event handlers
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setQuery(e.target.value);
};

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  submitForm();
};

const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log('Clicked at', e.clientX, e.clientY);
};

const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter') {
    handleSubmit();
  }
};

// Bad - Any type
const handleChange = (e: any) => {
  setQuery(e.target.value);
};
```

## Hooks with TypeScript

Type hooks properly.

```tsx
// Good - Typed useState
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<Item[]>([]);
const [loading, setLoading] = useState<boolean>(false);

// Good - Typed useRef
const inputRef = useRef<HTMLInputElement>(null);
const timerRef = useRef<NodeJS.Timeout | null>(null);

// Good - Typed useReducer
type State = { count: number; error: string | null };
type Action = { type: 'increment' } | { type: 'error'; payload: string };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + 1 };
    case 'error':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

const [state, dispatch] = useReducer(reducer, { count: 0, error: null });

// Good - Typed custom hook
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });
  
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  
  return [value, setValue] as const;
}
```

## Children Props

Type children correctly.

```tsx
// Good - ReactNode for any children
interface CardProps {
  children: React.ReactNode;
  title: string;
}

// Good - Specific child type
interface ListProps {
  children: React.ReactElement<ItemProps> | React.ReactElement<ItemProps>[];
}

// Good - Render prop
interface DataProviderProps<T> {
  data: T[];
  children: (item: T) => React.ReactNode;
}

const DataProvider = <T,>({ data, children }: DataProviderProps<T>) => (
  <>{data.map(children)}</>
);
```

## Generic Components

Create reusable generic components.

```tsx
// Good - Generic list component
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map(item => (
        <li key={keyExtractor(item)}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}

// Usage
<List
  items={users}
  renderItem={(user) => <UserCard user={user} />}
  keyExtractor={(user) => user.id}
/>
```

## Context with TypeScript

Type context properly.

```tsx
// Good - Typed context
interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  const login = async (email: string, password: string) => {
    const user = await api.login(email, password);
    setUser(user);
  };
  
  const logout = () => {
    setUser(null);
  };
  
  const value: AuthContextValue = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

## Utility Types

Use TypeScript utility types.

```tsx
// Good - Utility types
type UserFormData = Pick<User, 'name' | 'email' | 'age'>;
type PartialUser = Partial<User>;
type ReadonlyUser = Readonly<User>;
type UserWithoutId = Omit<User, 'id'>;
type RequiredUser = Required<User>;

// Good - Component prop utilities
type ButtonVariant = 'primary' | 'secondary' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface BaseButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

type PrimaryButtonProps = BaseButtonProps & {
  variant: 'primary';
  icon?: React.ReactNode;
};

type SecondaryButtonProps = BaseButtonProps & {
  variant: 'secondary';
  outline?: boolean;
};

type ButtonProps = PrimaryButtonProps | SecondaryButtonProps;
```

## Best Practices

1. **Always type props** - Use interfaces or types
2. **Type event handlers** - Use React event types
3. **Type hooks** - Provide generic types to hooks
4. **Use strict mode** - Enable strict TypeScript settings
5. **Avoid any** - Use unknown or proper types
6. **Use utility types** - Pick, Omit, Partial, etc.
7. **Type children** - Use React.ReactNode
8. **Export types** - Make types reusable
9. **Use const assertions** - For readonly arrays/objects
10. **Enable ESLint** - Use @typescript-eslint rules

