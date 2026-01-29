// ========================================
// VARIABLE DECLARATIONS
// ========================================

// ✅ GOOD: Use const for values that won't be reassigned
const API_URL = 'https://api.example.com';
const MAX_RETRIES = 3;
const user = { name: 'John', age: 30 };
const items = [1, 2, 3, 4, 5];

// ✅ GOOD: Use let for values that will be reassigned
let count = 0;
let status = 'pending';

// ❌ BAD: Never use var
// var x = 10;

// ========================================
// ARROW FUNCTIONS
// ========================================

// ✅ GOOD: Arrow functions for callbacks
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);
const sum = numbers.reduce((acc, n) => acc + n, 0);

// ✅ GOOD: Arrow function with multiple statements
const processUser = (user) => {
  const fullName = `${user.firstName} ${user.lastName}`;
  const age = calculateAge(user.birthDate);
  return { fullName, age };
};

// ✅ GOOD: Traditional function for methods
const calculator = {
  value: 0,
  add(n) {
    this.value += n;
    return this;
  },
  multiply(n) {
    this.value *= n;
    return this;
  }
};

// ========================================
// TEMPLATE LITERALS
// ========================================

// ✅ GOOD: Template literals for string interpolation
const name = 'Alice';
const age = 25;
const greeting = `Hello, ${name}! You are ${age} years old.`;

// ✅ GOOD: Multi-line strings
const html = `
  <div class="card">
    <h2>${name}</h2>
    <p>Age: ${age}</p>
  </div>
`;

// ✅ GOOD: Expression evaluation
const price = 19.99;
const quantity = 3;
const total = `Total: $${(price * quantity).toFixed(2)}`;

// ========================================
// DESTRUCTURING
// ========================================

// ✅ GOOD: Object destructuring
const userObj = { firstName: 'John', lastName: 'Doe', email: 'john@example.com' };
const { firstName, lastName, email } = userObj;

// ✅ GOOD: Destructuring with default values
const { theme = 'light', language = 'en' } = {};

// ✅ GOOD: Nested destructuring
const response = {
  data: {
    user: { id: 1, name: 'Alice' }
  }
};
const { data: { user: { id, name } } } = response;

// ✅ GOOD: Array destructuring
const colors = ['red', 'green', 'blue'];
const [primary, secondary, tertiary] = colors;

// ✅ GOOD: Rest operator in destructuring
const [first, ...rest] = [1, 2, 3, 4, 5];
const { id: userId, ...userDetails } = { id: 1, name: 'Bob', age: 30 };

// ========================================
// SPREAD OPERATOR
// ========================================

// ✅ GOOD: Array spreading
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];

// ✅ GOOD: Object spreading
const defaults = { theme: 'light', fontSize: 14 };
const userPrefs = { fontSize: 16, language: 'en' };
const settings = { ...defaults, ...userPrefs };

// ✅ GOOD: Copying arrays/objects
const originalArray = [1, 2, 3];
const copiedArray = [...originalArray];

const originalObject = { a: 1, b: 2 };
const copiedObject = { ...originalObject };

// ========================================
// DEFAULT PARAMETERS
// ========================================

// ✅ GOOD: Default function parameters
function greet(name = 'Guest', greeting = 'Hello') {
  return `${greeting}, ${name}!`;
}

// ✅ GOOD: Default with destructuring
function createUser({ name = 'Anonymous', role = 'user' } = {}) {
  return { name, role, createdAt: new Date() };
}

// ========================================
// OPTIONAL CHAINING
// ========================================

// ✅ GOOD: Optional chaining for nested properties
const userData = { profile: { address: { city: 'New York' } } };
const city = userData?.profile?.address?.city;
const zipCode = userData?.profile?.address?.zipCode; // undefined, no error

// ✅ GOOD: Optional chaining with arrays
const firstItem = items?.[0];

// ✅ GOOD: Optional chaining with methods
const result = obj?.method?.();

// ========================================
// NULLISH COALESCING
// ========================================

// ✅ GOOD: Nullish coalescing operator (??)
const userInput = null;
const value = userInput ?? 'default value';

// ✅ GOOD: Difference from || operator
const count1 = 0;
const result1 = count1 || 10;  // 10 (falsy)
const result2 = count1 ?? 10;  // 0 (only null/undefined)

const emptyString = '';
const text1 = emptyString || 'default';  // 'default'
const text2 = emptyString ?? 'default';  // ''

// ========================================
// ES6 MODULES
// ========================================

// ✅ GOOD: Named exports
export const API_KEY = 'abc123';
export function fetchData(url) {
  return fetch(url).then(res => res.json());
}

export class UserService {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }

  async getUser(id) {
    const response = await fetch(`${this.apiUrl}/users/${id}`);
    return response.json();
  }
}

// ✅ GOOD: Default export
export default class App {
  constructor() {
    this.init();
  }

  init() {
    console.log('App initialized');
  }
}

// ✅ GOOD: Importing
// import App from './App.js';
// import { fetchData, UserService } from './services.js';
// import * as utils from './utils.js';

// ========================================
// ASYNC/AWAIT PATTERNS
// ========================================

// ✅ GOOD: Async function with error handling
async function fetchUserData(userId) {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}

// ✅ GOOD: Promise.all for parallel requests
async function fetchMultipleUsers(userIds) {
  try {
    const promises = userIds.map(id => fetchUserData(id));
    const users = await Promise.all(promises);
    return users;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
}

// ✅ GOOD: Async arrow function
const loadData = async () => {
  const data = await fetchUserData(1);
  return data;
};

// ========================================
// ARRAY METHODS
// ========================================

const products = [
  { id: 1, name: 'Laptop', price: 999, category: 'electronics' },
  { id: 2, name: 'Mouse', price: 29, category: 'electronics' },
  { id: 3, name: 'Desk', price: 299, category: 'furniture' }
];

// ✅ GOOD: map - transform array
const productNames = products.map(p => p.name);

// ✅ GOOD: filter - select items
const electronics = products.filter(p => p.category === 'electronics');
const affordable = products.filter(p => p.price < 100);

// ✅ GOOD: find - get first match
const laptop = products.find(p => p.name === 'Laptop');

// ✅ GOOD: reduce - aggregate values
const totalPrice = products.reduce((sum, p) => sum + p.price, 0);

// ✅ GOOD: some - check if any match
const hasExpensive = products.some(p => p.price > 500);

// ✅ GOOD: every - check if all match
const allAffordable = products.every(p => p.price < 1000);

// ✅ GOOD: Method chaining
const expensiveElectronics = products
  .filter(p => p.category === 'electronics')
  .filter(p => p.price > 50)
  .map(p => p.name);

// ========================================
// OBJECT METHODS
// ========================================

const userProfile = {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
  role: 'admin'
};

// ✅ GOOD: Object.keys, Object.values, Object.entries
const keys = Object.keys(userProfile);
const values = Object.values(userProfile);
const entries = Object.entries(userProfile);

// ✅ GOOD: Object.assign for merging
const updated = Object.assign({}, userProfile, { role: 'superadmin' });

// ✅ GOOD: Object.fromEntries
const pairs = [['a', 1], ['b', 2]];
const obj = Object.fromEntries(pairs);

// ========================================
// DOM MANIPULATION
// ========================================

// ✅ GOOD: querySelector for single element
const header = document.querySelector('.header');
const submitBtn = document.querySelector('#submit-btn');

// ✅ GOOD: querySelectorAll for multiple elements
const cards = document.querySelectorAll('.card');
const inputs = document.querySelectorAll('input[type="text"]');

// ✅ GOOD: Event listeners with arrow functions
submitBtn?.addEventListener('click', (event) => {
  event.preventDefault();
  console.log('Form submitted');
});

// ✅ GOOD: Event delegation
document.querySelector('.card-container')?.addEventListener('click', (event) => {
  if (event.target.matches('.card__button')) {
    const cardId = event.target.dataset.cardId;
    console.log(`Card ${cardId} clicked`);
  }
});

// ✅ GOOD: Creating elements
function createCard(title, content) {
  const card = document.createElement('div');
  card.className = 'card';

  const cardHeader = document.createElement('div');
  cardHeader.className = 'card__header';
  cardHeader.textContent = title;

  const cardBody = document.createElement('div');
  cardBody.className = 'card__body';
  cardBody.textContent = content;

  card.appendChild(cardHeader);
  card.appendChild(cardBody);

  return card;
}

// ✅ GOOD: Using data attributes
const element = document.querySelector('[data-user-id="123"]');
const userId = element?.dataset.userId;

// ========================================
// ERROR HANDLING
// ========================================

// ✅ GOOD: Try-catch for synchronous code
function parseJSON(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Invalid JSON:', error.message);
    return null;
  }
}

// ✅ GOOD: Custom error classes
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

function validateEmail(email) {
  if (!email.includes('@')) {
    throw new ValidationError('Invalid email format', 'email');
  }
  return true;
}

// ========================================
// ES6 CLASSES
// ========================================

// ✅ GOOD: Class with constructor and methods
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
    this.createdAt = new Date();
  }

  getProfile() {
    return {
      name: this.name,
      email: this.email,
      memberSince: this.createdAt
    };
  }

  updateEmail(newEmail) {
    if (!newEmail.includes('@')) {
      throw new ValidationError('Invalid email', 'email');
    }
    this.email = newEmail;
  }
}

// ✅ GOOD: Class inheritance
class AdminUser extends User {
  constructor(name, email, permissions) {
    super(name, email);
    this.permissions = permissions;
  }

  hasPermission(permission) {
    return this.permissions.includes(permission);
  }

  getProfile() {
    return {
      ...super.getProfile(),
      role: 'admin',
      permissions: this.permissions
    };
  }
}

// ✅ GOOD: Static methods
class MathUtils {
  static add(a, b) {
    return a + b;
  }

  static multiply(a, b) {
    return a * b;
  }
}

// Usage: MathUtils.add(5, 3)

// ✅ GOOD: Private fields (modern JavaScript)
class BankAccount {
  #balance = 0;  // Private field

  constructor(initialBalance) {
    this.#balance = initialBalance;
  }

  deposit(amount) {
    if (amount > 0) {
      this.#balance += amount;
    }
  }

  getBalance() {
    return this.#balance;
  }
}

// ========================================
// MODERN PATTERNS
// ========================================

// ✅ GOOD: Debounce function
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Usage
const handleSearch = debounce((query) => {
  console.log('Searching for:', query);
}, 300);

// ✅ GOOD: Throttle function
function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ✅ GOOD: Memoization
function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// ✅ GOOD: Composition
const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x);

const addOne = x => x + 1;
const double = x => x * 2;
const square = x => x * x;

const transform = compose(square, double, addOne);
// transform(3) => square(double(addOne(3))) => square(double(4)) => square(8) => 64

// ========================================
// FETCH API EXAMPLES
// ========================================

// ✅ GOOD: GET request
async function getUsers() {
  try {
    const response = await fetch(`${API_URL}/users`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const users = await response.json();
    return users;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
}

// ✅ GOOD: POST request
async function createUser(userData) {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const newUser = await response.json();
    return newUser;
  } catch (error) {
    console.error('Failed to create user:', error);
    throw error;
  }
}

// ✅ GOOD: Request with timeout
async function fetchWithTimeout(url, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// ✅ GOOD: Deep clone
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ✅ GOOD: Check if object is empty
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

// ✅ GOOD: Capitalize first letter
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ✅ GOOD: Generate unique ID
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ✅ GOOD: Format currency
function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
}

// ✅ GOOD: Format date
function formatDate(date, locale = 'en-US') {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
}

