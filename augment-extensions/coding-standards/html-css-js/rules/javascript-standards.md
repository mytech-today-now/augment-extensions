# JavaScript Standards

## Overview

This guide provides modern JavaScript (ES6+) coding standards covering variable declarations, functions, modern features, and code organization.

---

## Variable Declarations

### Use const by Default

**REQUIRED**: Use `const` for all variables that won't be reassigned:

```javascript
// ✅ GOOD
const API_URL = 'https://api.example.com';
const user = { name: 'John', age: 30 };
const items = [1, 2, 3];

// ❌ BAD
var API_URL = 'https://api.example.com';
let user = { name: 'John', age: 30 }; // Won't be reassigned
```

### Use let for Reassignment

**REQUIRED**: Use `let` only when reassignment is needed:

```javascript
// ✅ GOOD
let count = 0;
count += 1;

let status = 'pending';
status = 'complete';

// ❌ BAD
var count = 0; // Never use var
```

### Never Use var

**PROHIBITED**: Do not use `var`:

```javascript
// ❌ BAD
var x = 10;

// ✅ GOOD
const x = 10;
```

**REASON**: `var` has function scope and hoisting issues. `const`/`let` have block scope.

### Declare Variables at Top of Scope

**RECOMMENDED**: Declare variables at the top of their scope:

```javascript
// ✅ GOOD
function processData(data) {
  const result = [];
  const threshold = 100;
  
  for (const item of data) {
    if (item.value > threshold) {
      result.push(item);
    }
  }
  
  return result;
}
```

---

## Function Declarations

### Arrow Functions for Callbacks

**RECOMMENDED**: Use arrow functions for callbacks and short functions:

```javascript
// ✅ GOOD: Arrow functions
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);

// Event listeners
button.addEventListener('click', () => {
  console.log('Clicked');
});

// ❌ BAD: Traditional function expressions
const doubled = numbers.map(function(n) {
  return n * 2;
});
```

### Function Declarations for Named Functions

**RECOMMENDED**: Use function declarations for named, reusable functions:

```javascript
// ✅ GOOD: Function declaration
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ ALSO GOOD: Named arrow function
const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price, 0);
};
```

### Default Parameters

**RECOMMENDED**: Use default parameters instead of checking for undefined:

```javascript
// ✅ GOOD: Default parameters
function greet(name = 'Guest', greeting = 'Hello') {
  return `${greeting}, ${name}!`;
}

// ❌ BAD: Manual checks
function greet(name, greeting) {
  name = name || 'Guest';
  greeting = greeting || 'Hello';
  return `${greeting}, ${name}!`;
}
```

### Rest Parameters

**RECOMMENDED**: Use rest parameters instead of `arguments` object:

```javascript
// ✅ GOOD: Rest parameters
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}

sum(1, 2, 3, 4); // 10

// ❌ BAD: arguments object
function sum() {
  const numbers = Array.from(arguments);
  return numbers.reduce((total, n) => total + n, 0);
}
```

---

## Modern JavaScript Features

### Template Literals

**RECOMMENDED**: Use template literals for string interpolation:

```javascript
// ✅ GOOD: Template literals
const name = 'John';
const age = 30;
const message = `Hello, ${name}! You are ${age} years old.`;

const multiline = `
  This is a
  multiline string
`;

// ❌ BAD: String concatenation
const message = 'Hello, ' + name + '! You are ' + age + ' years old.';
```

### Destructuring

**RECOMMENDED**: Use destructuring for objects and arrays:

```javascript
// ✅ GOOD: Object destructuring
const user = { name: 'John', age: 30, email: 'john@example.com' };
const { name, age } = user;

// With renaming
const { name: userName, age: userAge } = user;

// With defaults
const { name, role = 'user' } = user;

// ✅ GOOD: Array destructuring
const colors = ['red', 'green', 'blue'];
const [primary, secondary] = colors;

// Skip elements
const [first, , third] = colors;

// ❌ BAD: Manual extraction
const name = user.name;
const age = user.age;
```

### Spread Operator

**RECOMMENDED**: Use spread operator for copying and merging:

```javascript
// ✅ GOOD: Array copying
const original = [1, 2, 3];
const copy = [...original];

// Array merging
const combined = [...array1, ...array2];

// ✅ GOOD: Object copying
const user = { name: 'John', age: 30 };
const updatedUser = { ...user, age: 31 };

// Object merging
const merged = { ...defaults, ...options };

// ❌ BAD: Manual copying
const copy = original.slice();
const merged = Object.assign({}, defaults, options);
```

### Optional Chaining

**RECOMMENDED**: Use optional chaining for safe property access:

```javascript
// ✅ GOOD: Optional chaining
const userName = user?.profile?.name;
const firstItem = items?.[0];
const result = obj?.method?.();

// ❌ BAD: Manual checks
const userName = user && user.profile && user.profile.name;
```

### Nullish Coalescing

**RECOMMENDED**: Use nullish coalescing (`??`) for default values:

```javascript
// ✅ GOOD: Nullish coalescing (only null/undefined)
const value = userInput ?? 'default';
const count = data.count ?? 0;

// ❌ BAD: OR operator (treats 0, '', false as falsy)
const value = userInput || 'default';
const count = data.count || 0; // Problem if count is 0
```

**DIFFERENCE**:
- `??` only checks for `null` or `undefined`
- `||` treats `0`, `''`, `false`, `NaN` as falsy

---

## Code Organization

### ES6 Modules

**REQUIRED**: Use ES6 modules (`import`/`export`):

```javascript
// ✅ GOOD: ES6 modules
// utils.js
export function formatDate(date) {
  return date.toISOString();
}

export const API_URL = 'https://api.example.com';

// main.js
import { formatDate, API_URL } from './utils.js';

// ❌ BAD: CommonJS (Node.js only)
const { formatDate } = require('./utils');
module.exports = { formatDate };
```

### Named Exports vs Default Exports

**RECOMMENDED**: Prefer named exports over default exports:

```javascript
// ✅ GOOD: Named exports (better for refactoring)
export function fetchUser(id) { }
export function updateUser(id, data) { }

// Import
import { fetchUser, updateUser } from './api.js';

// ✅ ACCEPTABLE: Default export for single export
export default class UserService { }

// Import
import UserService from './UserService.js';
```

**REASON**: Named exports are easier to refactor and provide better IDE support.

### One Module Per File

**RECOMMENDED**: Keep one main module/class per file:

```javascript
// ✅ GOOD: user-service.js
export class UserService {
  // ...
}

// ✅ GOOD: utils.js (related utilities)
export function formatDate(date) { }
export function parseDate(str) { }
```

### Avoid Circular Dependencies

**PROHIBITED**: Do not create circular dependencies:

```javascript
// ❌ BAD: Circular dependency
// a.js
import { b } from './b.js';
export const a = () => b();

// b.js
import { a } from './a.js';
export const b = () => a();
```

---

## File Structure

### Import Order

**RECOMMENDED**: Organize imports in a consistent order:

```javascript
// 1. External dependencies
import React from 'react';
import axios from 'axios';

// 2. Internal modules
import { UserService } from './services/user-service.js';
import { formatDate } from './utils/date.js';

// 3. Styles (if applicable)
import './styles.css';
```

### Constants at Top

**RECOMMENDED**: Define constants near the top of the file:

```javascript
// ✅ GOOD
import { fetchData } from './api.js';

const API_URL = 'https://api.example.com';
const MAX_RETRIES = 3;
const TIMEOUT = 5000;

function makeRequest() {
  // Use constants
}
```

### Logical Function Organization

**RECOMMENDED**: Organize functions logically:

```javascript
// ✅ GOOD: Group related functions
// Public API
export function createUser(data) {
  validateUser(data);
  return saveUser(data);
}

export function updateUser(id, data) {
  validateUser(data);
  return saveUser({ id, ...data });
}

// Private helpers
function validateUser(data) {
  // Validation logic
}

function saveUser(data) {
  // Save logic
}
```

---

## Best Practices

### Use Strict Equality

**REQUIRED**: Use `===` and `!==` instead of `==` and `!=`:

```javascript
// ✅ GOOD
if (value === 10) { }
if (name !== '') { }

// ❌ BAD
if (value == 10) { }
if (name != '') { }
```

### Avoid Global Variables

**RECOMMENDED**: Avoid polluting the global scope:

```javascript
// ✅ GOOD: Module scope
const config = { };

export function getConfig() {
  return config;
}

// ❌ BAD: Global scope
window.config = { };
```

### Use Descriptive Names

**RECOMMENDED**: Use clear, descriptive variable and function names:

```javascript
// ✅ GOOD
const userAge = 30;
const isAuthenticated = true;
function calculateTotalPrice(items) { }

// ❌ BAD
const a = 30;
const flag = true;
function calc(x) { }
```

### Avoid Magic Numbers

**RECOMMENDED**: Use named constants instead of magic numbers:

```javascript
// ✅ GOOD
const MAX_LOGIN_ATTEMPTS = 3;
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

if (attempts > MAX_LOGIN_ATTEMPTS) {
  lockAccount();
}

// ❌ BAD
if (attempts > 3) {
  lockAccount();
}
```

---

## Summary

**Key Principles**:
1. Use `const` by default, `let` when needed, never `var`
2. Use arrow functions for callbacks
3. Use template literals for strings
4. Use destructuring, spread, optional chaining
5. Use ES6 modules (`import`/`export`)
6. Prefer named exports
7. Use strict equality (`===`)
8. Use descriptive names and constants
9. Organize code logically



