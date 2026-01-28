/**
 * DOM Manipulation Examples
 * 
 * Demonstrates modern DOM manipulation patterns including:
 * - querySelector and querySelectorAll
 * - Event delegation
 * - Event listener cleanup
 * - Data attributes for JS hooks
 * - Creating and modifying elements
 * - Performance best practices
 */

// ============================================================================
// SELECTING ELEMENTS
// ============================================================================

/**
 * querySelector - Select single element (returns first match)
 */
function selectSingleElement() {
    // By ID (prefer getElementById for IDs)
    const header = document.querySelector('#header');
    
    // By class
    const firstButton = document.querySelector('.btn');
    
    // By attribute
    const submitButton = document.querySelector('[type="submit"]');
    
    // By data attribute (preferred for JS hooks)
    const userCard = document.querySelector('[data-user-id="123"]');
    
    // Complex selector
    const activeNavLink = document.querySelector('nav .nav-link.active');
    
    return { header, firstButton, submitButton, userCard, activeNavLink };
}

/**
 * querySelectorAll - Select multiple elements (returns NodeList)
 */
function selectMultipleElements() {
    // All elements with class
    const buttons = document.querySelectorAll('.btn');
    
    // All elements with data attribute
    const userCards = document.querySelectorAll('[data-user-card]');
    
    // Convert NodeList to Array for array methods
    const buttonsArray = Array.from(buttons);
    
    // Or use spread operator
    const cardsArray = [...userCards];
    
    return { buttons, userCards, buttonsArray, cardsArray };
}

/**
 * Prefer specific methods when available
 */
function useSpecificMethods() {
    // Faster than querySelector
    const element = document.getElementById('my-element');
    const elements = document.getElementsByClassName('my-class');
    const tags = document.getElementsByTagName('div');
    
    return { element, elements, tags };
}

// ============================================================================
// DATA ATTRIBUTES FOR JS HOOKS
// ============================================================================

/**
 * Use data attributes to separate styling from behavior
 * DON'T use classes for JS hooks (they might change for styling)
 * DO use data-* attributes
 */

// HTML: <button data-action="delete" data-user-id="123">Delete</button>

function handleDataAttributes() {
    const deleteButton = document.querySelector('[data-action="delete"]');
    
    if (deleteButton) {
        // Get data attribute value
        const userId = deleteButton.dataset.userId; // "123"
        const action = deleteButton.dataset.action; // "delete"
        
        // Set data attribute
        deleteButton.dataset.status = 'pending';
        
        // Remove data attribute
        delete deleteButton.dataset.status;
    }
}

// ============================================================================
// EVENT DELEGATION
// ============================================================================

/**
 * Event delegation - attach listener to parent instead of each child
 * Benefits: Better performance, works with dynamically added elements
 */
function setupEventDelegation() {
    const todoList = document.querySelector('[data-todo-list]');
    
    if (!todoList) return;
    
    // Single listener on parent handles all child clicks
    todoList.addEventListener('click', (event) => {
        const target = event.target;
        
        // Check if clicked element matches selector
        if (target.matches('[data-action="delete"]')) {
            const todoItem = target.closest('[data-todo-item]');
            const todoId = todoItem?.dataset.todoId;
            
            console.log(`Delete todo: ${todoId}`);
            todoItem?.remove();
        }
        
        if (target.matches('[data-action="complete"]')) {
            const todoItem = target.closest('[data-todo-item]');
            todoItem?.classList.toggle('completed');
        }
    });
}

/**
 * Event delegation with multiple event types
 */
function setupMultipleEventDelegation() {
    const form = document.querySelector('[data-form]');
    
    if (!form) return;
    
    // Handle different events on form children
    form.addEventListener('input', (event) => {
        if (event.target.matches('[data-validate]')) {
            validateField(event.target);
        }
    });
    
    form.addEventListener('blur', (event) => {
        if (event.target.matches('[data-validate]')) {
            validateField(event.target);
        }
    }, true); // Use capture phase for blur
}

function validateField(field) {
    // Validation logic
    console.log('Validating:', field.name);
}

// ============================================================================
// EVENT LISTENER CLEANUP
// ============================================================================

/**
 * Proper event listener cleanup to prevent memory leaks
 */
class ComponentWithCleanup {
    constructor(element) {
        this.element = element;
        this.boundHandleClick = this.handleClick.bind(this);
        this.boundHandleResize = this.handleResize.bind(this);
    }
    
    init() {
        // Store bound functions to remove later
        this.element.addEventListener('click', this.boundHandleClick);
        window.addEventListener('resize', this.boundHandleResize);
    }
    
    destroy() {
        // Clean up event listeners
        this.element.removeEventListener('click', this.boundHandleClick);
        window.removeEventListener('resize', this.boundHandleResize);
    }
    
    handleClick(event) {
        console.log('Clicked:', event.target);
    }
    
    handleResize(event) {
        console.log('Window resized');
    }
}

/**
 * Using AbortController for easy cleanup (modern approach)
 */
function setupWithAbortController() {
    const controller = new AbortController();
    const { signal } = controller;

    // Add multiple listeners with same signal
    document.addEventListener('click', handleClick, { signal });
    document.addEventListener('keydown', handleKeydown, { signal });
    window.addEventListener('resize', handleResize, { signal });

    // Later, abort all listeners at once
    function cleanup() {
        controller.abort();
    }

    return cleanup;
}

function handleClick(event) {
    console.log('Click:', event.target);
}

function handleKeydown(event) {
    console.log('Keydown:', event.key);
}

function handleResize(event) {
    console.log('Resize');
}

// ============================================================================
// CREATING AND MODIFYING ELEMENTS
// ============================================================================

/**
 * Create elements programmatically
 */
function createElements() {
    // Create element
    const div = document.createElement('div');

    // Set attributes
    div.className = 'card';
    div.id = 'user-card-123';
    div.setAttribute('data-user-id', '123');

    // Set content
    div.textContent = 'User Name';

    // Or use innerHTML (be careful with user input - XSS risk!)
    div.innerHTML = '<strong>User Name</strong>';

    // Add to DOM
    document.body.appendChild(div);

    return div;
}

/**
 * Create complex element structure
 */
function createUserCard(user) {
    // Create container
    const card = document.createElement('div');
    card.className = 'user-card';
    card.dataset.userId = user.id;

    // Create header
    const header = document.createElement('div');
    header.className = 'user-card__header';

    const name = document.createElement('h3');
    name.className = 'user-card__name';
    name.textContent = user.name;

    header.appendChild(name);

    // Create body
    const body = document.createElement('div');
    body.className = 'user-card__body';

    const email = document.createElement('p');
    email.className = 'user-card__email';
    email.textContent = user.email;

    body.appendChild(email);

    // Create footer with button
    const footer = document.createElement('div');
    footer.className = 'user-card__footer';

    const button = document.createElement('button');
    button.className = 'btn btn--primary';
    button.dataset.action = 'view-profile';
    button.dataset.userId = user.id;
    button.textContent = 'View Profile';

    footer.appendChild(button);

    // Assemble card
    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(footer);

    return card;
}

/**
 * Using template literals for complex HTML (use with caution)
 */
function createUserCardWithTemplate(user) {
    const card = document.createElement('div');
    card.className = 'user-card';
    card.dataset.userId = user.id;

    // Escape user input to prevent XSS
    const escapedName = escapeHtml(user.name);
    const escapedEmail = escapeHtml(user.email);

    card.innerHTML = `
        <div class="user-card__header">
            <h3 class="user-card__name">${escapedName}</h3>
        </div>
        <div class="user-card__body">
            <p class="user-card__email">${escapedEmail}</p>
        </div>
        <div class="user-card__footer">
            <button class="btn btn--primary" data-action="view-profile" data-user-id="${user.id}">
                View Profile
            </button>
        </div>
    `;

    return card;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================================================
// MODIFYING ELEMENTS
// ============================================================================

/**
 * Modify element classes
 */
function modifyClasses(element) {
    // Add class
    element.classList.add('active');

    // Remove class
    element.classList.remove('inactive');

    // Toggle class
    element.classList.toggle('expanded');

    // Check if has class
    if (element.classList.contains('active')) {
        console.log('Element is active');
    }

    // Replace class
    element.classList.replace('old-class', 'new-class');

    // Add multiple classes
    element.classList.add('class1', 'class2', 'class3');
}

/**
 * Modify element styles
 */
function modifyStyles(element) {
    // Set individual style
    element.style.color = 'red';
    element.style.backgroundColor = 'blue';

    // Set multiple styles
    Object.assign(element.style, {
        color: 'red',
        backgroundColor: 'blue',
        padding: '1rem',
        borderRadius: '0.5rem'
    });

    // Remove style
    element.style.color = '';

    // Get computed style
    const computedStyle = window.getComputedStyle(element);
    const color = computedStyle.color;
    const fontSize = computedStyle.fontSize;
}

/**
 * Modify element attributes
 */
function modifyAttributes(element) {
    // Set attribute
    element.setAttribute('aria-label', 'Close dialog');
    element.setAttribute('data-status', 'active');

    // Get attribute
    const status = element.getAttribute('data-status');

    // Check if has attribute
    if (element.hasAttribute('data-status')) {
        console.log('Has status attribute');
    }

    // Remove attribute
    element.removeAttribute('data-status');

    // Boolean attributes
    element.disabled = true;
    element.hidden = false;
}

// ============================================================================
// TRAVERSING THE DOM
// ============================================================================

/**
 * Navigate DOM tree
 */
function traverseDOM(element) {
    // Parent
    const parent = element.parentElement;
    const parentNode = element.parentNode;

    // Children
    const children = element.children; // HTMLCollection
    const childNodes = element.childNodes; // NodeList (includes text nodes)
    const firstChild = element.firstElementChild;
    const lastChild = element.lastElementChild;

    // Siblings
    const nextSibling = element.nextElementSibling;
    const prevSibling = element.previousElementSibling;

    // Find closest ancestor matching selector
    const form = element.closest('form');
    const card = element.closest('[data-card]');

    // Check if element matches selector
    if (element.matches('.active')) {
        console.log('Element is active');
    }
}

// ============================================================================
// INSERTING AND REMOVING ELEMENTS
// ============================================================================

/**
 * Insert elements at different positions
 */
function insertElements() {
    const container = document.querySelector('[data-container]');
    const newElement = document.createElement('div');

    // Append to end
    container.appendChild(newElement);

    // Prepend to beginning
    container.prepend(newElement);

    // Insert before specific child
    const referenceElement = container.firstElementChild;
    container.insertBefore(newElement, referenceElement);

    // Insert adjacent (modern approach)
    container.insertAdjacentElement('beforebegin', newElement); // Before container
    container.insertAdjacentElement('afterbegin', newElement);  // First child
    container.insertAdjacentElement('beforeend', newElement);   // Last child
    container.insertAdjacentElement('afterend', newElement);    // After container

    // Insert HTML
    container.insertAdjacentHTML('beforeend', '<div>New content</div>');
}

/**
 * Remove elements
 */
function removeElements() {
    const element = document.querySelector('[data-remove-me]');

    // Modern approach
    element?.remove();

    // Old approach (still works)
    element?.parentNode?.removeChild(element);

    // Remove all children
    const container = document.querySelector('[data-container]');
    container.innerHTML = ''; // Fast but loses event listeners

    // Or remove children properly
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    // Modern approach with replaceChildren
    container.replaceChildren(); // Removes all children
}

/**
 * Replace elements
 */
function replaceElements() {
    const oldElement = document.querySelector('[data-old]');
    const newElement = document.createElement('div');
    newElement.textContent = 'New content';

    // Replace element
    oldElement?.replaceWith(newElement);
}

// ============================================================================
// PERFORMANCE BEST PRACTICES
// ============================================================================

/**
 * Batch DOM updates to minimize reflows
 */
function batchDOMUpdates(items) {
    const container = document.querySelector('[data-container]');

    // BAD: Multiple reflows
    items.forEach(item => {
        const element = document.createElement('div');
        element.textContent = item.name;
        container.appendChild(element); // Reflow on each append
    });

    // GOOD: Single reflow with DocumentFragment
    const fragment = document.createDocumentFragment();
    items.forEach(item => {
        const element = document.createElement('div');
        element.textContent = item.name;
        fragment.appendChild(element);
    });
    container.appendChild(fragment); // Single reflow
}

/**
 * Use requestAnimationFrame for visual updates
 */
function animateElement(element) {
    let position = 0;

    function update() {
        position += 1;
        element.style.transform = `translateX(${position}px)`;

        if (position < 100) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

/**
 * Debounce expensive DOM operations
 */
function debounce(fn, delay = 300) {
    let timeoutId;

    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}

// Usage
const handleSearch = debounce((event) => {
    const query = event.target.value;
    // Expensive DOM operation
    updateSearchResults(query);
}, 300);

function updateSearchResults(query) {
    console.log('Searching for:', query);
}

// ============================================================================
// PRACTICAL EXAMPLES
// ============================================================================

/**
 * Complete example: Todo list with event delegation
 */
class TodoList {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.todos = [];
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Event delegation on container
        this.container.addEventListener('click', (event) => {
            const target = event.target;

            if (target.matches('[data-action="delete"]')) {
                const todoId = target.closest('[data-todo-item]')?.dataset.todoId;
                this.deleteTodo(todoId);
            }

            if (target.matches('[data-action="toggle"]')) {
                const todoId = target.closest('[data-todo-item]')?.dataset.todoId;
                this.toggleTodo(todoId);
            }
        });
    }

    addTodo(text) {
        const todo = {
            id: Date.now().toString(),
            text,
            completed: false
        };
        this.todos.push(todo);
        this.render();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.render();
    }

    toggleTodo(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.render();
        }
    }

    render() {
        const fragment = document.createDocumentFragment();

        this.todos.forEach(todo => {
            const item = document.createElement('div');
            item.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            item.dataset.todoItem = '';
            item.dataset.todoId = todo.id;

            item.innerHTML = `
                <input type="checkbox" ${todo.completed ? 'checked' : ''} data-action="toggle">
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                <button class="btn-delete" data-action="delete">Delete</button>
            `;

            fragment.appendChild(item);
        });

        this.container.replaceChildren(fragment);
    }
}

// Usage
// const todoList = new TodoList('[data-todo-list]');
// todoList.addTodo('Learn DOM manipulation');

