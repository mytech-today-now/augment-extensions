# React Component Patterns

Modern component design patterns for React applications.

## Functional Components

Always use functional components with hooks (not class components).

```tsx
// Good - Functional component
interface UserCardProps {
  name: string;
  email: string;
  onEdit: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({ name, email, onEdit }) => {
  return (
    <div className="user-card">
      <h3>{name}</h3>
      <p>{email}</p>
      <button onClick={onEdit}>Edit</button>
    </div>
  );
};

// Bad - Class component
class UserCard extends React.Component<UserCardProps> {
  render() {
    return (
      <div className="user-card">
        <h3>{this.props.name}</h3>
        <p>{this.props.email}</p>
        <button onClick={this.props.onEdit}>Edit</button>
      </div>
    );
  }
}
```

## Component Composition

Break down complex components into smaller, reusable pieces.

```tsx
// Good - Composition
const UserProfile = ({ user }: { user: User }) => (
  <div className="profile">
    <UserAvatar src={user.avatar} />
    <UserInfo name={user.name} email={user.email} />
    <UserActions userId={user.id} />
  </div>
);

// Bad - Monolithic component
const UserProfile = ({ user }: { user: User }) => (
  <div className="profile">
    <div className="avatar">
      <img src={user.avatar} alt={user.name} />
    </div>
    <div className="info">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
    <div className="actions">
      <button onClick={() => editUser(user.id)}>Edit</button>
      <button onClick={() => deleteUser(user.id)}>Delete</button>
    </div>
  </div>
);
```

## Container/Presenter Pattern

Separate logic from presentation.

```tsx
// Presenter - Pure UI component
interface UserListProps {
  users: User[];
  onUserClick: (id: string) => void;
  loading: boolean;
}

const UserList: React.FC<UserListProps> = ({ users, onUserClick, loading }) => {
  if (loading) return <Spinner />;
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id} onClick={() => onUserClick(user.id)}>
          {user.name}
        </li>
      ))}
    </ul>
  );
};

// Container - Logic and data fetching
const UserListContainer: React.FC = () => {
  const { data: users, isLoading } = useUsers();
  const navigate = useNavigate();
  
  const handleUserClick = (id: string) => {
    navigate(`/users/${id}`);
  };
  
  return <UserList users={users} onUserClick={handleUserClick} loading={isLoading} />;
};
```

## Compound Components

Create components that work together.

```tsx
// Compound component pattern
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

export const Tabs: React.FC<{ children: React.ReactNode; defaultTab: string }> = ({ 
  children, 
  defaultTab 
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
};

export const TabList: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="tab-list">{children}</div>
);

export const Tab: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tab must be used within Tabs');
  
  return (
    <button
      className={context.activeTab === id ? 'active' : ''}
      onClick={() => context.setActiveTab(id)}
    >
      {children}
    </button>
  );
};

export const TabPanel: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabPanel must be used within Tabs');
  
  return context.activeTab === id ? <div>{children}</div> : null;
};

// Usage
<Tabs defaultTab="profile">
  <TabList>
    <Tab id="profile">Profile</Tab>
    <Tab id="settings">Settings</Tab>
  </TabList>
  <TabPanel id="profile"><ProfileContent /></TabPanel>
  <TabPanel id="settings"><SettingsContent /></TabPanel>
</Tabs>
```

## Render Props Pattern

Share code between components using a prop whose value is a function.

```tsx
interface MouseTrackerProps {
  render: (position: { x: number; y: number }) => React.ReactNode;
}

const MouseTracker: React.FC<MouseTrackerProps> = ({ render }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return <>{render(position)}</>;
};

// Usage
<MouseTracker render={({ x, y }) => (
  <div>Mouse position: {x}, {y}</div>
)} />
```

## Best Practices

1. **Use functional components** - Always prefer functions over classes
2. **Keep components small** - Single responsibility principle
3. **Use composition** - Build complex UIs from simple components
4. **Separate concerns** - Container/Presenter pattern
5. **Type everything** - Use TypeScript for all props
6. **Avoid prop drilling** - Use Context or state management
7. **Memoize expensive renders** - Use React.memo when needed
8. **Extract custom hooks** - Reuse stateful logic

