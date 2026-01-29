/**
 * Async JavaScript Examples
 * 
 * Demonstrates modern async/await patterns, Promise handling,
 * Fetch API usage, error handling, and concurrent operations.
 */

// ============================================================================
// BASIC ASYNC/AWAIT
// ============================================================================

/**
 * Simple async function that returns a promise
 */
async function fetchUserData(userId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
        id: userId,
        name: `User ${userId}`,
        email: `user${userId}@example.com`
    };
}

/**
 * Using async/await with try/catch for error handling
 */
async function getUserWithErrorHandling(userId) {
    try {
        const user = await fetchUserData(userId);
        console.log('User fetched:', user);
        return user;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error; // Re-throw if caller needs to handle it
    }
}

// ============================================================================
// FETCH API EXAMPLES
// ============================================================================

/**
 * Basic GET request using Fetch API
 */
async function fetchUsers() {
    try {
        const response = await fetch('https://api.example.com/users');
        
        // Check if response is ok (status 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const users = await response.json();
        return users;
    } catch (error) {
        console.error('Failed to fetch users:', error);
        throw error;
    }
}

/**
 * POST request with JSON body
 */
async function createUser(userData) {
    try {
        const response = await fetch('https://api.example.com/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_TOKEN_HERE'
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create user');
        }
        
        const newUser = await response.json();
        return newUser;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

/**
 * PUT request to update a resource
 */
async function updateUser(userId, updates) {
    const response = await fetch(`https://api.example.com/users/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
        throw new Error(`Failed to update user ${userId}`);
    }
    
    return response.json();
}

/**
 * DELETE request
 */
async function deleteUser(userId) {
    const response = await fetch(`https://api.example.com/users/${userId}`, {
        method: 'DELETE'
    });
    
    if (!response.ok) {
        throw new Error(`Failed to delete user ${userId}`);
    }
    
    return true;
}

// ============================================================================
// CONCURRENT OPERATIONS
// ============================================================================

/**
 * Fetch multiple users concurrently using Promise.all
 * All requests run in parallel
 */
async function fetchMultipleUsers(userIds) {
    try {
        const promises = userIds.map(id => fetchUserData(id));
        const users = await Promise.all(promises);
        return users;
    } catch (error) {
        console.error('Error fetching multiple users:', error);
        throw error;
    }
}

/**
 * Promise.allSettled - Get results even if some promises fail
 * Returns array of {status, value/reason} objects
 */
async function fetchUsersWithPartialFailure(userIds) {
    const promises = userIds.map(id => fetchUserData(id));
    const results = await Promise.allSettled(promises);
    
    const successful = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);
    
    const failed = results
        .filter(result => result.status === 'rejected')
        .map(result => result.reason);
    
    return { successful, failed };
}

/**
 * Promise.race - Return first promise to resolve
 * Useful for timeouts
 */
async function fetchWithTimeout(url, timeoutMs = 5000) {
    const fetchPromise = fetch(url);
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
    });
    
    return Promise.race([fetchPromise, timeoutPromise]);
}

/**
 * Promise.any - Return first promise to fulfill (ignore rejections)
 * Useful for trying multiple sources
 */
async function fetchFromMultipleSources(urls) {
    const promises = urls.map(url => fetch(url));

    try {
        const firstResponse = await Promise.any(promises);
        return firstResponse.json();
    } catch (error) {
        // All promises rejected
        throw new Error('All sources failed');
    }
}

// ============================================================================
// SEQUENTIAL VS PARALLEL EXECUTION
// ============================================================================

/**
 * Sequential execution - one after another
 * Use when operations depend on each other
 */
async function processUsersSequentially(userIds) {
    const results = [];

    for (const userId of userIds) {
        const user = await fetchUserData(userId);
        results.push(user);
    }

    return results;
}

/**
 * Parallel execution - all at once
 * Use when operations are independent
 */
async function processUsersInParallel(userIds) {
    const promises = userIds.map(userId => fetchUserData(userId));
    return Promise.all(promises);
}

/**
 * Controlled concurrency - limit number of parallel operations
 */
async function fetchWithConcurrencyLimit(userIds, limit = 3) {
    const results = [];

    for (let i = 0; i < userIds.length; i += limit) {
        const batch = userIds.slice(i, i + limit);
        const batchResults = await Promise.all(
            batch.map(id => fetchUserData(id))
        );
        results.push(...batchResults);
    }

    return results;
}

// ============================================================================
// ERROR HANDLING PATTERNS
// ============================================================================

/**
 * Retry logic with exponential backoff
 */
async function fetchWithRetry(url, maxRetries = 3) {
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        } catch (error) {
            lastError = error;

            if (attempt < maxRetries - 1) {
                // Exponential backoff: 1s, 2s, 4s
                const delay = Math.pow(2, attempt) * 1000;
                console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw new Error(`Failed after ${maxRetries} attempts: ${lastError.message}`);
}

/**
 * Graceful degradation - return default value on error
 */
async function fetchUserOrDefault(userId) {
    try {
        return await fetchUserData(userId);
    } catch (error) {
        console.warn(`Failed to fetch user ${userId}, using default`);
        return {
            id: userId,
            name: 'Unknown User',
            email: 'unknown@example.com'
        };
    }
}

/**
 * Error aggregation - collect all errors
 */
async function fetchAllUsersWithErrors(userIds) {
    const results = await Promise.allSettled(
        userIds.map(id => fetchUserData(id))
    );

    const users = [];
    const errors = [];

    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            users.push(result.value);
        } else {
            errors.push({
                userId: userIds[index],
                error: result.reason
            });
        }
    });

    if (errors.length > 0) {
        console.error('Some users failed to fetch:', errors);
    }

    return { users, errors };
}

// ============================================================================
// ASYNC ITERATION
// ============================================================================

/**
 * Async generator function
 */
async function* fetchUsersInBatches(userIds, batchSize = 10) {
    for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);
        const users = await Promise.all(
            batch.map(id => fetchUserData(id))
        );
        yield users;
    }
}

/**
 * Using async iteration with for-await-of
 */
async function processUserBatches(userIds) {
    for await (const batch of fetchUsersInBatches(userIds, 5)) {
        console.log(`Processing batch of ${batch.length} users`);
        // Process batch
    }
}

// ============================================================================
// REAL-WORLD PATTERNS
// ============================================================================

/**
 * Fetch with caching
 */
class APIClient {
    constructor() {
        this.cache = new Map();
    }

    async fetchUser(userId, useCache = true) {
        const cacheKey = `user:${userId}`;

        if (useCache && this.cache.has(cacheKey)) {
            console.log('Returning cached user');
            return this.cache.get(cacheKey);
        }

        const user = await fetchUserData(userId);
        this.cache.set(cacheKey, user);
        return user;
    }

    clearCache() {
        this.cache.clear();
    }
}

/**
 * Debounced async function (useful for search)
 */
function debounceAsync(fn, delay = 300) {
    let timeoutId;

    return function(...args) {
        clearTimeout(timeoutId);

        return new Promise((resolve, reject) => {
            timeoutId = setTimeout(async () => {
                try {
                    const result = await fn.apply(this, args);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            }, delay);
        });
    };
}

// Usage example
const debouncedSearch = debounceAsync(async (query) => {
    const response = await fetch(`https://api.example.com/search?q=${query}`);
    return response.json();
}, 300);

/**
 * Polling pattern - repeatedly check for updates
 */
async function pollForStatus(taskId, interval = 1000, maxAttempts = 30) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const response = await fetch(`https://api.example.com/tasks/${taskId}`);
        const task = await response.json();

        if (task.status === 'completed') {
            return task;
        }

        if (task.status === 'failed') {
            throw new Error('Task failed');
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error('Polling timeout');
}

/**
 * Batch requests to avoid rate limiting
 */
async function batchedFetch(items, batchSize = 5, delayMs = 1000) {
    const results = [];

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);

        const batchResults = await Promise.all(
            batch.map(item => fetch(item.url).then(r => r.json()))
        );

        results.push(...batchResults);

        // Delay between batches (except for last batch)
        if (i + batchSize < items.length) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    return results;
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

async function demonstrateAsyncPatterns() {
    console.log('=== Async/Await Examples ===');

    // Basic async/await
    const user = await fetchUserData(1);
    console.log('Single user:', user);

    // Parallel fetching
    const users = await fetchMultipleUsers([1, 2, 3, 4, 5]);
    console.log('Multiple users:', users);

    // Fetch with timeout
    try {
        const response = await fetchWithTimeout('https://api.example.com/slow', 3000);
        console.log('Response:', response);
    } catch (error) {
        console.error('Request timed out:', error);
    }

    // Retry logic
    try {
        const data = await fetchWithRetry('https://api.example.com/unreliable');
        console.log('Data after retries:', data);
    } catch (error) {
        console.error('All retries failed:', error);
    }

    // API client with caching
    const client = new APIClient();
    const cachedUser = await client.fetchUser(1);
    const sameCachedUser = await client.fetchUser(1); // From cache

    console.log('Async patterns demonstrated successfully!');
}

// Run examples (uncomment to execute)
// demonstrateAsyncPatterns().catch(console.error);

