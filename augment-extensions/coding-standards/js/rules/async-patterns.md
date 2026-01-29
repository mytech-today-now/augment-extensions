# Async JavaScript Patterns

## Overview

This guide provides best practices for asynchronous JavaScript, covering promises, async/await, Fetch API, and error handling.

---

## Promises vs Async/Await

### Prefer Async/Await

**RECOMMENDED**: Use async/await over raw promises for better readability:

```javascript
// ✅ GOOD: Async/await
async function fetchUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`);
    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}

// ❌ ACCEPTABLE: Raw promises (less readable)
function fetchUser(id) {
  return fetch(`/api/users/${id}`)
    .then(response => response.json())
    .then(user => user)
    .catch(error => {
      console.error('Failed to fetch user:', error);
      throw error;
    });
}
```

### When to Use Promises Directly

**USE PROMISES** for:
- `Promise.all()` - Parallel operations
- `Promise.race()` - First to complete
- `Promise.allSettled()` - All results (success or failure)

```javascript
// ✅ GOOD: Promise.all for parallel operations
async function fetchMultipleUsers(ids) {
  const promises = ids.map(id => fetch(`/api/users/${id}`));
  const responses = await Promise.all(promises);
  const users = await Promise.all(responses.map(r => r.json()));
  return users;
}

// ✅ GOOD: Promise.allSettled for handling mixed results
async function fetchWithFallback(urls) {
  const promises = urls.map(url => fetch(url));
  const results = await Promise.allSettled(promises);
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error(`Failed to fetch ${urls[index]}:`, result.reason);
      return null;
    }
  });
}
```

---

## Error Handling

### Try/Catch with Async/Await

**REQUIRED**: Always handle errors in async functions:

```javascript
// ✅ GOOD: Try/catch
async function saveUser(userData) {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Failed to save user:', error);
    throw error; // Re-throw or handle
  }
}

// ❌ BAD: No error handling
async function saveUser(userData) {
  const response = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
  return response.json();
}
```

### Catch with Promises

**REQUIRED**: Use `.catch()` for promise chains:

```javascript
// ✅ GOOD: .catch() for promises
fetch('/api/users')
  .then(response => response.json())
  .then(users => displayUsers(users))
  .catch(error => {
    console.error('Failed to fetch users:', error);
    showErrorMessage('Unable to load users');
  });
```

### User-Friendly Error Messages

**RECOMMENDED**: Display user-friendly error messages:

```javascript
// ✅ GOOD: User-friendly errors
async function loadData() {
  try {
    const data = await fetchData();
    displayData(data);
  } catch (error) {
    console.error('Error details:', error); // Log for debugging
    showErrorMessage('Unable to load data. Please try again.'); // User message
  }
}
```

---

## Fetch API

### Basic Fetch Usage

**RECOMMENDED**: Use Fetch API for HTTP requests:

```javascript
// ✅ GOOD: GET request
async function getUsers() {
  const response = await fetch('/api/users');
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const users = await response.json();
  return users;
}

// ✅ GOOD: POST request
async function createUser(userData) {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}
```

### Check Response Status

**REQUIRED**: Always check response status:

```javascript
// ✅ GOOD: Check status
async function fetchData(url) {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

// ❌ BAD: No status check
async function fetchData(url) {
  const response = await fetch(url);
  return response.json(); // May fail silently
}
```

### Request Configuration

**RECOMMENDED**: Configure requests properly:

```javascript
// ✅ GOOD: Full configuration
async function updateUser(id, data) {
  const response = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(data),
    credentials: 'include', // Include cookies
    mode: 'cors'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Update failed');
  }
  
  return response.json();
}
```

### Timeout Handling

**RECOMMENDED**: Implement timeouts for fetch requests:

```javascript
// ✅ GOOD: Fetch with timeout
async function fetchWithTimeout(url, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}
```

---

## Parallel vs Sequential Operations

### Parallel Operations

**RECOMMENDED**: Use `Promise.all()` for independent parallel operations:

```javascript
// ✅ GOOD: Parallel (faster)
async function loadDashboard() {
  const [users, posts, comments] = await Promise.all([
    fetch('/api/users').then(r => r.json()),
    fetch('/api/posts').then(r => r.json()),
    fetch('/api/comments').then(r => r.json())
  ]);

  return { users, posts, comments };
}

// ❌ BAD: Sequential (slower)
async function loadDashboard() {
  const users = await fetch('/api/users').then(r => r.json());
  const posts = await fetch('/api/posts').then(r => r.json());
  const comments = await fetch('/api/comments').then(r => r.json());

  return { users, posts, comments };
}
```

### Sequential Operations

**USE SEQUENTIAL** when operations depend on each other:

```javascript
// ✅ GOOD: Sequential (necessary)
async function createUserWithProfile(userData, profileData) {
  // Must create user first to get ID
  const user = await createUser(userData);

  // Then create profile with user ID
  const profile = await createProfile({
    ...profileData,
    userId: user.id
  });

  return { user, profile };
}
```

---

## Advanced Patterns

### Retry Logic

**RECOMMENDED**: Implement retry logic for failed requests:

```javascript
// ✅ GOOD: Retry with exponential backoff
async function fetchWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response;
      }

      // Don't retry client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Client error: ${response.status}`);
      }
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### Request Cancellation

**RECOMMENDED**: Use AbortController for cancellable requests:

```javascript
// ✅ GOOD: Cancellable request
class DataService {
  constructor() {
    this.controller = null;
  }

  async fetchData(url) {
    // Cancel previous request
    if (this.controller) {
      this.controller.abort();
    }

    this.controller = new AbortController();

    try {
      const response = await fetch(url, {
        signal: this.controller.signal
      });
      return response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request cancelled');
        return null;
      }
      throw error;
    }
  }
}
```

### Debounced Async Operations

**RECOMMENDED**: Debounce async operations (e.g., search):

```javascript
// ✅ GOOD: Debounced search
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    return new Promise((resolve) => {
      timeout = setTimeout(() => {
        resolve(func(...args));
      }, wait);
    });
  };
}

const searchUsers = debounce(async (query) => {
  const response = await fetch(`/api/users/search?q=${query}`);
  return response.json();
}, 300);

// Usage
searchInput.addEventListener('input', async (event) => {
  const results = await searchUsers(event.target.value);
  displayResults(results);
});
```

### Loading States

**RECOMMENDED**: Manage loading states properly:

```javascript
// ✅ GOOD: Loading state management
async function loadData() {
  const loadingEl = document.querySelector('[data-js-loading]');
  const contentEl = document.querySelector('[data-js-content]');
  const errorEl = document.querySelector('[data-js-error]');

  try {
    loadingEl.classList.remove('hidden');
    contentEl.classList.add('hidden');
    errorEl.classList.add('hidden');

    const data = await fetchData();

    displayData(data);
    contentEl.classList.remove('hidden');
  } catch (error) {
    console.error('Error loading data:', error);
    errorEl.textContent = 'Failed to load data';
    errorEl.classList.remove('hidden');
  } finally {
    loadingEl.classList.add('hidden');
  }
}
```

---

## Common Patterns

### API Client

```javascript
// ✅ GOOD: Reusable API client
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  get(endpoint) {
    return this.request(endpoint);
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
}

// Usage
const api = new ApiClient('https://api.example.com');
const users = await api.get('/users');
const newUser = await api.post('/users', { name: 'John' });
```

---

## Summary

**Key Principles**:
1. Prefer async/await over raw promises
2. Always handle errors with try/catch or .catch()
3. Check response status in fetch requests
4. Use Promise.all() for parallel operations
5. Use sequential await when operations depend on each other
6. Implement timeouts and retry logic
7. Use AbortController for cancellable requests
8. Debounce frequent async operations
9. Manage loading states properly
10. Create reusable API clients
