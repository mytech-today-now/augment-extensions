# DOM Manipulation

## Overview

This guide provides best practices for DOM queries, element manipulation, and event handling in vanilla JavaScript.

---

## DOM Queries

### Use querySelector and querySelectorAll

**RECOMMENDED**: Prefer `querySelector` and `querySelectorAll` over older methods:

```javascript
// ✅ GOOD: Modern selectors
const header = document.querySelector('.header');
const buttons = document.querySelectorAll('.btn');
const firstItem = document.querySelector('#list > li:first-child');

// ❌ BAD: Legacy methods
const header = document.getElementById('header');
const buttons = document.getElementsByClassName('btn');
const items = document.getElementsByTagName('li');
```

**REASON**: `querySelector` uses CSS selectors and returns static NodeLists.

### Cache DOM Queries

**RECOMMENDED**: Cache DOM queries when used multiple times:

```javascript
// ✅ GOOD: Cache the query
const container = document.querySelector('.container');
container.classList.add('active');
container.setAttribute('data-loaded', 'true');
container.appendChild(newElement);

// ❌ BAD: Repeated queries
document.querySelector('.container').classList.add('active');
document.querySelector('.container').setAttribute('data-loaded', 'true');
document.querySelector('.container').appendChild(newElement);
```

### Use Data Attributes for JavaScript Hooks

**RECOMMENDED**: Use `data-js-*` attributes for JavaScript selectors:

```html
<!-- HTML -->
<button class="btn btn-primary" data-js-submit>Submit</button>
<div class="modal" data-js-modal="user-settings"></div>
```

```javascript
// ✅ GOOD: Separation of concerns
const submitBtn = document.querySelector('[data-js-submit]');
const modal = document.querySelector('[data-js-modal="user-settings"]');

// ❌ BAD: Coupling with CSS classes
const submitBtn = document.querySelector('.btn-primary');
```

**REASON**: Separates styling concerns from JavaScript behavior.

---

## Element Manipulation

### Creating Elements

**RECOMMENDED**: Use `createElement` and set properties:

```javascript
// ✅ GOOD: Create and configure
const button = document.createElement('button');
button.textContent = 'Click me';
button.className = 'btn btn-primary';
button.setAttribute('data-js-action', 'submit');

container.appendChild(button);

// ✅ ALSO GOOD: Template literals for complex HTML
const html = `
  <div class="card">
    <h2>${title}</h2>
    <p>${description}</p>
  </div>
`;
container.insertAdjacentHTML('beforeend', html);
```

### Modifying Elements

**RECOMMENDED**: Use modern DOM APIs:

```javascript
// ✅ GOOD: classList API
element.classList.add('active');
element.classList.remove('hidden');
element.classList.toggle('expanded');
element.classList.contains('active'); // Check

// ❌ BAD: className manipulation
element.className += ' active';
element.className = element.className.replace('hidden', '');

// ✅ GOOD: dataset API
element.dataset.userId = '123';
element.dataset.status = 'active';
console.log(element.dataset.userId); // '123'

// ❌ BAD: setAttribute for data attributes
element.setAttribute('data-user-id', '123');
```

### Removing Elements

**RECOMMENDED**: Use `remove()` method:

```javascript
// ✅ GOOD: Modern removal
element.remove();

// ❌ BAD: Legacy removal
element.parentNode.removeChild(element);
```

---

## Event Handling

### Use addEventListener

**REQUIRED**: Use `addEventListener` instead of inline handlers:

```javascript
// ✅ GOOD: addEventListener
const button = document.querySelector('[data-js-submit]');
button.addEventListener('click', handleSubmit);

function handleSubmit(event) {
  event.preventDefault();
  // Handle click
}

// ❌ BAD: Inline handler
// <button onclick="handleSubmit()">Submit</button>

// ❌ BAD: Property assignment
button.onclick = handleSubmit;
```

**REASON**: `addEventListener` allows multiple listeners and better control.

### Event Delegation

**RECOMMENDED**: Use event delegation for dynamic elements:

```javascript
// ✅ GOOD: Event delegation
const list = document.querySelector('.todo-list');

list.addEventListener('click', (event) => {
  if (event.target.matches('[data-js-delete]')) {
    const item = event.target.closest('.todo-item');
    item.remove();
  }
});

// ❌ BAD: Individual listeners (memory leak for dynamic items)
const deleteButtons = document.querySelectorAll('[data-js-delete]');
deleteButtons.forEach(button => {
  button.addEventListener('click', handleDelete);
});
```

**REASON**: Event delegation works for dynamically added elements and uses less memory.

### Remove Event Listeners

**RECOMMENDED**: Remove event listeners when no longer needed:

```javascript
// ✅ GOOD: Cleanup
function setupModal() {
  const closeBtn = document.querySelector('[data-js-close]');
  
  function handleClose() {
    modal.classList.remove('open');
    closeBtn.removeEventListener('click', handleClose);
  }
  
  closeBtn.addEventListener('click', handleClose);
}

// ✅ GOOD: AbortController for cleanup
const controller = new AbortController();

button.addEventListener('click', handleClick, {
  signal: controller.signal
});

// Later: Remove all listeners
controller.abort();
```

### Passive Event Listeners

**RECOMMENDED**: Use passive listeners for scroll/touch events:

```javascript
// ✅ GOOD: Passive listener (better performance)
document.addEventListener('scroll', handleScroll, { passive: true });
document.addEventListener('touchstart', handleTouch, { passive: true });

// ❌ BAD: Non-passive (can block scrolling)
document.addEventListener('scroll', handleScroll);
```

**REASON**: Passive listeners improve scrolling performance by telling the browser you won't call `preventDefault()`.

### Event Object

**RECOMMENDED**: Use event object properties:

```javascript
// ✅ GOOD: Use event properties
button.addEventListener('click', (event) => {
  event.preventDefault();     // Prevent default action
  event.stopPropagation();    // Stop bubbling

  const target = event.target;           // Element that triggered event
  const currentTarget = event.currentTarget; // Element with listener

  console.log(event.type);    // 'click'
  console.log(event.key);     // For keyboard events
});
```

---

## DOM Traversal

### Modern Traversal Methods

**RECOMMENDED**: Use modern traversal methods:

```javascript
// ✅ GOOD: Modern methods
const parent = element.closest('.container');
const next = element.nextElementSibling;
const prev = element.previousElementSibling;
const children = element.children; // HTMLCollection
const firstChild = element.firstElementChild;
const lastChild = element.lastElementChild;

// ❌ BAD: Legacy methods (include text nodes)
const parent = element.parentNode;
const next = element.nextSibling;
const children = element.childNodes;
```

### Finding Elements

**RECOMMENDED**: Use `closest()` for ancestor lookup:

```javascript
// ✅ GOOD: Find ancestor
button.addEventListener('click', (event) => {
  const card = event.target.closest('.card');
  const cardId = card.dataset.id;
});

// ❌ BAD: Manual traversal
let card = event.target;
while (card && !card.classList.contains('card')) {
  card = card.parentElement;
}
```

---

## Performance Best Practices

### Batch DOM Updates

**RECOMMENDED**: Batch DOM updates to minimize reflows:

```javascript
// ✅ GOOD: Batch updates
const fragment = document.createDocumentFragment();

items.forEach(item => {
  const li = document.createElement('li');
  li.textContent = item.name;
  fragment.appendChild(li);
});

list.appendChild(fragment); // Single reflow

// ❌ BAD: Multiple reflows
items.forEach(item => {
  const li = document.createElement('li');
  li.textContent = item.name;
  list.appendChild(li); // Reflow on each append
});
```

### Read Then Write

**RECOMMENDED**: Batch reads and writes separately:

```javascript
// ✅ GOOD: Read all, then write all
const heights = elements.map(el => el.offsetHeight); // Read
elements.forEach((el, i) => {
  el.style.height = `${heights[i] * 2}px`; // Write
});

// ❌ BAD: Interleaved reads and writes (causes layout thrashing)
elements.forEach(el => {
  const height = el.offsetHeight; // Read (forces layout)
  el.style.height = `${height * 2}px`; // Write
});
```

### Debounce Expensive Operations

**RECOMMENDED**: Debounce frequent events:

```javascript
// ✅ GOOD: Debounce resize/scroll
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const handleResize = debounce(() => {
  // Expensive operation
  recalculateLayout();
}, 250);

window.addEventListener('resize', handleResize);
```

---

## Common Patterns

### Toggle Visibility

```javascript
// ✅ GOOD: Toggle with class
element.classList.toggle('hidden');

// CSS
.hidden {
  display: none;
}
```

### Show/Hide Elements

```javascript
// ✅ GOOD: Semantic classes
function showElement(element) {
  element.classList.remove('hidden');
  element.setAttribute('aria-hidden', 'false');
}

function hideElement(element) {
  element.classList.add('hidden');
  element.setAttribute('aria-hidden', 'true');
}
```

### Form Handling

```javascript
// ✅ GOOD: Form submission
const form = document.querySelector('[data-js-form]');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  try {
    await submitForm(data);
    form.reset();
  } catch (error) {
    showError(error.message);
  }
});
```

### Dynamic Content Loading

```javascript
// ✅ GOOD: Load and insert content
async function loadContent(url, container) {
  try {
    const response = await fetch(url);
    const html = await response.text();

    container.innerHTML = html;

    // Re-attach event listeners if needed
    initializeEventListeners(container);
  } catch (error) {
    container.innerHTML = '<p>Error loading content</p>';
  }
}
```

---

## Summary

**Key Principles**:
1. Use `querySelector`/`querySelectorAll` for DOM queries
2. Cache DOM queries when used multiple times
3. Use `data-js-*` attributes for JavaScript hooks
4. Use `addEventListener` (never inline handlers)
5. Use event delegation for dynamic elements
6. Remove event listeners when no longer needed
7. Use passive listeners for scroll/touch events
8. Batch DOM updates to minimize reflows
9. Use modern DOM APIs (`classList`, `dataset`, `closest`)
10. Debounce expensive operations



