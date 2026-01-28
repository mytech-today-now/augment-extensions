# Python Async Patterns

Comprehensive guide to asynchronous programming in Python using async/await, asyncio, and related patterns.

## Async/Await Basics

### Defining Async Functions

```python
import asyncio
from typing import List

# Async function definition
async def fetch_data(url: str) -> dict:
    """Fetch data from URL asynchronously.

    Args:
        url: URL to fetch from

    Returns:
        Fetched data as dictionary
    """
    # Simulate async I/O operation
    await asyncio.sleep(1)
    return {"url": url, "data": "..."}

# Calling async functions
async def main():
    # Must use 'await' to call async functions
    result = await fetch_data("https://api.example.com")
    print(result)

# Running async code
if __name__ == "__main__":
    # Python 3.7+
    asyncio.run(main())

    # Python 3.6 (older style)
    # loop = asyncio.get_event_loop()
    # loop.run_until_complete(main())
```

### Async vs Sync

```python
# Synchronous - Blocks execution
def sync_fetch(url: str) -> dict:
    time.sleep(1)  # Blocks the entire thread
    return {"url": url}

# Asynchronous - Allows other tasks to run
async def async_fetch(url: str) -> dict:
    await asyncio.sleep(1)  # Yields control to event loop
    return {"url": url}

# Synchronous execution - Takes 3 seconds
def sync_main():
    results = []
    for url in ["url1", "url2", "url3"]:
        results.append(sync_fetch(url))  # Each takes 1 second
    return results

# Asynchronous execution - Takes 1 second total
async def async_main():
    tasks = [async_fetch(url) for url in ["url1", "url2", "url3"]]
    results = await asyncio.gather(*tasks)  # All run concurrently
    return results
```

## Running Async Tasks

### asyncio.gather() - Run Multiple Tasks

```python
# Run multiple tasks concurrently
async def fetch_all_data():
    # Create multiple tasks
    task1 = fetch_data("https://api1.example.com")
    task2 = fetch_data("https://api2.example.com")
    task3 = fetch_data("https://api3.example.com")

    # Wait for all tasks to complete
    results = await asyncio.gather(task1, task2, task3)
    return results

# With list comprehension
async def fetch_multiple_urls(urls: List[str]):
    tasks = [fetch_data(url) for url in urls]
    results = await asyncio.gather(*tasks)
    return results

# Handle exceptions in gather
async def fetch_with_error_handling():
    tasks = [fetch_data(url) for url in urls]

    # return_exceptions=True: Return exceptions instead of raising
    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Process results and exceptions
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            logger.error(f"Task {i} failed: {result}")
        else:
            process_result(result)
```

### asyncio.create_task() - Create Background Tasks

```python
# Create tasks that run in background
async def background_task(name: str):
    while True:
        print(f"{name} running")
        await asyncio.sleep(1)

async def main():
    # Create background tasks
    task1 = asyncio.create_task(background_task("Task 1"))
    task2 = asyncio.create_task(background_task("Task 2"))

    # Do other work
    await asyncio.sleep(5)

    # Cancel background tasks
    task1.cancel()
    task2.cancel()

    # Wait for cancellation to complete
    await asyncio.gather(task1, task2, return_exceptions=True)
```

### asyncio.wait() - Advanced Task Management

```python
# Wait for tasks with more control
async def wait_for_tasks():
    tasks = [fetch_data(url) for url in urls]

    # Wait for all tasks
    done, pending = await asyncio.wait(tasks)

    # Wait for first task to complete
    done, pending = await asyncio.wait(
        tasks,
        return_when=asyncio.FIRST_COMPLETED
    )

    # Wait with timeout
    done, pending = await asyncio.wait(
        tasks,
        timeout=5.0
    )

    # Cancel pending tasks
    for task in pending:
        task.cancel()
```

## Async Context Managers

Async context managers use `async with` for asynchronous resource management.

### Defining Async Context Managers

```python
from typing import AsyncGenerator

# Class-based async context manager
class AsyncDatabaseConnection:
    """Async context manager for database connections."""

    def __init__(self, db_url: str):
        self.db_url = db_url
        self.conn = None

    async def __aenter__(self):
        """Establish connection when entering context."""
        self.conn = await async_connect(self.db_url)
        logger.info(f"Connected to {self.db_url}")
        return self.conn

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Close connection when exiting context."""
        if self.conn is not None:
            await self.conn.close()
            logger.info(f"Closed connection to {self.db_url}")
        return False

# Usage
async def fetch_users():
    async with AsyncDatabaseConnection("postgresql://...") as conn:
        return await conn.fetch("SELECT * FROM users")

# Generator-based async context manager
from contextlib import asynccontextmanager

@asynccontextmanager
async def async_database_connection(
    db_url: str
) -> AsyncGenerator[AsyncConnection, None]:
    """Async context manager for database connections.

    Args:
        db_url: Database connection URL

    Yields:
        Active database connection
    """
    conn = await async_connect(db_url)
    try:
        logger.info(f"Connected to {db_url}")
        yield conn
    except Exception as e:
        logger.error(f"Database error: {e}")
        raise
    finally:
        await conn.close()
        logger.info(f"Closed connection to {db_url}")

# Usage
async def fetch_data():
    async with async_database_connection("postgresql://...") as conn:
        return await conn.fetch("SELECT * FROM users")
```

### Common Async Context Manager Patterns

```python
# Async file operations (Python 3.9+ with aiofiles)
import aiofiles

async def read_file_async(file_path: str) -> str:
    async with aiofiles.open(file_path, mode='r') as f:
        contents = await f.read()
    return contents

async def write_file_async(file_path: str, data: str) -> None:
    async with aiofiles.open(file_path, mode='w') as f:
        await f.write(data)

# Async HTTP client (with aiohttp)
import aiohttp

async def fetch_url(url: str) -> dict:
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.json()

# Async lock
async def critical_section():
    lock = asyncio.Lock()

    async with lock:
        # Only one coroutine can execute this at a time
        await modify_shared_resource()

# Async semaphore - Limit concurrent operations
async def rate_limited_fetch(urls: List[str], max_concurrent: int = 5):
    semaphore = asyncio.Semaphore(max_concurrent)

    async def fetch_with_semaphore(url: str):
        async with semaphore:
            # Only max_concurrent tasks run simultaneously
            return await fetch_data(url)

    tasks = [fetch_with_semaphore(url) for url in urls]
    return await asyncio.gather(*tasks)
```

### Async Context Manager with Timeout

```python
@asynccontextmanager
async def async_timeout(seconds: float) -> AsyncGenerator[None, None]:
    """Context manager with timeout.

    Args:
        seconds: Timeout in seconds

    Raises:
        asyncio.TimeoutError: If operation exceeds timeout
    """
    try:
        async with asyncio.timeout(seconds):  # Python 3.11+
            yield
    except asyncio.TimeoutError:
        logger.error(f"Operation timed out after {seconds} seconds")
        raise

# For Python < 3.11, use asyncio.wait_for
async def with_timeout_legacy(coro, seconds: float):
    try:
        return await asyncio.wait_for(coro, timeout=seconds)
    except asyncio.TimeoutError:
        logger.error(f"Operation timed out after {seconds} seconds")
        raise

# Usage
async def fetch_with_timeout():
    async with async_timeout(5.0):
        return await fetch_data("https://api.example.com")
```

## Task Cancellation

### Basic Cancellation

```python
# Cancel a task
async def long_running_task():
    try:
        while True:
            await asyncio.sleep(1)
            print("Working...")
    except asyncio.CancelledError:
        print("Task was cancelled")
        # Cleanup code here
        raise  # Re-raise to complete cancellation

async def main():
    # Create task
    task = asyncio.create_task(long_running_task())

    # Let it run for a bit
    await asyncio.sleep(3)

    # Cancel the task
    task.cancel()

    # Wait for cancellation to complete
    try:
        await task
    except asyncio.CancelledError:
        print("Task cancelled successfully")
```

### Graceful Cancellation

```python
async def graceful_task():
    """Task that handles cancellation gracefully."""
    try:
        while True:
            await asyncio.sleep(1)
            await process_item()
    except asyncio.CancelledError:
        logger.info("Cancellation requested, cleaning up...")
        await cleanup_resources()
        logger.info("Cleanup complete")
        raise  # Re-raise to complete cancellation

async def main():
    task = asyncio.create_task(graceful_task())
    await asyncio.sleep(5)
    task.cancel()

    try:
        await task
    except asyncio.CancelledError:
        logger.info("Task cancelled gracefully")
```

### Cancellation with Timeout

```python
# Cancel task if it takes too long
async def task_with_timeout(timeout: float):
    task = asyncio.create_task(long_running_operation())

    try:
        # Python 3.11+
        async with asyncio.timeout(timeout):
            result = await task
    except asyncio.TimeoutError:
        logger.warning(f"Task timed out after {timeout} seconds")
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass
        raise

    return result

# Python < 3.11
async def task_with_timeout_legacy(timeout: float):
    task = asyncio.create_task(long_running_operation())

    try:
        result = await asyncio.wait_for(task, timeout=timeout)
    except asyncio.TimeoutError:
        logger.warning(f"Task timed out after {timeout} seconds")
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass
        raise

    return result
```

### Shield from Cancellation

```python
# Protect critical operations from cancellation
async def critical_operation():
    """Operation that should not be cancelled."""
    await save_to_database()
    await send_confirmation_email()

async def main():
    task = asyncio.create_task(critical_operation())

    # Shield the task from cancellation
    try:
        result = await asyncio.shield(task)
    except asyncio.CancelledError:
        # Even if this coroutine is cancelled, task continues
        logger.info("Main cancelled, but task continues")
        # Wait for task to complete
        result = await task

    return result
```

### Cancelling Multiple Tasks

```python
async def cancel_all_tasks(tasks: List[asyncio.Task]) -> None:
    """Cancel all tasks and wait for them to finish.

    Args:
        tasks: List of tasks to cancel
    """
    # Cancel all tasks
    for task in tasks:
        task.cancel()

    # Wait for all cancellations to complete
    await asyncio.gather(*tasks, return_exceptions=True)

    # Log results
    for i, task in enumerate(tasks):
        if task.cancelled():
            logger.info(f"Task {i} cancelled")
        elif task.exception():
            logger.error(f"Task {i} failed: {task.exception()}")

# Usage
async def main():
    tasks = [
        asyncio.create_task(worker(i))
        for i in range(10)
    ]

    # Let them run
    await asyncio.sleep(5)

    # Cancel all
    await cancel_all_tasks(tasks)
```

## Advanced Patterns

### Async Generators

```python
from typing import AsyncIterator

async def async_range(count: int) -> AsyncIterator[int]:
    """Async generator that yields numbers.

    Args:
        count: Number of items to generate

    Yields:
        Numbers from 0 to count-1
    """
    for i in range(count):
        await asyncio.sleep(0.1)  # Simulate async work
        yield i

# Usage
async def consume_async_generator():
    async for value in async_range(10):
        print(value)

# Async generator with cleanup
async def fetch_items_stream(url: str) -> AsyncIterator[dict]:
    """Stream items from API.

    Args:
        url: API endpoint URL

    Yields:
        Items from API
    """
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            async for line in response.content:
                yield json.loads(line)
```

### Async Comprehensions

```python
# Async list comprehension
async def fetch_all_users(user_ids: List[int]) -> List[User]:
    return [
        user
        async for user_id in async_user_ids()
        if await is_active(user_id)
        for user in [await fetch_user(user_id)]
    ]

# Async dict comprehension
async def fetch_user_map(user_ids: List[int]) -> dict[int, User]:
    return {
        user_id: user
        async for user_id in async_user_ids()
        for user in [await fetch_user(user_id)]
    }

# Async set comprehension
async def fetch_active_user_ids() -> set[int]:
    return {
        user_id
        async for user_id in async_user_ids()
        if await is_active(user_id)
    }
```

### Task Groups (Python 3.11+)

```python
# Task groups provide structured concurrency
async def fetch_all_data():
    async with asyncio.TaskGroup() as tg:
        task1 = tg.create_task(fetch_data("url1"))
        task2 = tg.create_task(fetch_data("url2"))
        task3 = tg.create_task(fetch_data("url3"))

    # All tasks complete here (or exception is raised)
    return [task1.result(), task2.result(), task3.result()]

# Task groups with exception handling
async def fetch_with_error_handling():
    try:
        async with asyncio.TaskGroup() as tg:
            for url in urls:
                tg.create_task(fetch_data(url))
    except* HTTPError as eg:
        # Handle all HTTP errors
        for exc in eg.exceptions:
            logger.error(f"HTTP error: {exc}")
    except* TimeoutError as eg:
        # Handle all timeout errors
        for exc in eg.exceptions:
            logger.error(f"Timeout: {exc}")
```



### Async Queue

```python
from asyncio import Queue

# Producer-consumer pattern
async def producer(queue: Queue, n: int):
    """Produce items and put them in queue."""
    for i in range(n):
        await asyncio.sleep(0.1)
        await queue.put(i)
        logger.info(f"Produced: {i}")

    # Signal completion
    await queue.put(None)

async def consumer(queue: Queue, name: str):
    """Consume items from queue."""
    while True:
        item = await queue.get()

        if item is None:
            # Completion signal
            queue.task_done()
            break

        logger.info(f"{name} consumed: {item}")
        await process_item(item)
        queue.task_done()

async def main():
    queue = Queue(maxsize=10)

    # Create producer and consumers
    producer_task = asyncio.create_task(producer(queue, 20))
    consumer_tasks = [
        asyncio.create_task(consumer(queue, f"Consumer-{i}"))
        for i in range(3)
    ]

    # Wait for producer to finish
    await producer_task

    # Wait for queue to be empty
    await queue.join()

    # Cancel consumers
    for task in consumer_tasks:
        task.cancel()

    await asyncio.gather(*consumer_tasks, return_exceptions=True)
```

### Async Iterators

```python
class AsyncIterator:
    """Custom async iterator."""

    def __init__(self, count: int):
        self.count = count
        self.current = 0

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self.current >= self.count:
            raise StopAsyncIteration

        await asyncio.sleep(0.1)
        value = self.current
        self.current += 1
        return value

# Usage
async def use_async_iterator():
    async for value in AsyncIterator(10):
        print(value)
```

## Best Practices

### DO

✅ **Use async/await for I/O-bound operations** - Network, file I/O, database queries

✅ **Use asyncio.gather() for concurrent tasks** - Run multiple tasks simultaneously

✅ **Use async context managers** - For async resource management

✅ **Handle CancelledError properly** - Clean up resources before re-raising

✅ **Use asyncio.create_task()** - For background tasks

✅ **Use semaphores for rate limiting** - Control concurrent operations

✅ **Use task groups (Python 3.11+)** - For structured concurrency

✅ **Shield critical operations** - Use asyncio.shield() for operations that must complete

✅ **Use async generators** - For streaming data

✅ **Set timeouts** - Prevent tasks from running indefinitely

### DON'T

❌ **Don't use async for CPU-bound operations** - Use multiprocessing instead

```python
# Bad - Async doesn't help with CPU-bound work
async def cpu_intensive():
    result = 0
    for i in range(10_000_000):
        result += i
    return result

# Good - Use ProcessPoolExecutor for CPU-bound work
from concurrent.futures import ProcessPoolExecutor

async def cpu_intensive_async():
    loop = asyncio.get_event_loop()
    with ProcessPoolExecutor() as pool:
        result = await loop.run_in_executor(pool, cpu_intensive_sync)
    return result
```

❌ **Don't mix blocking and async code** - Use run_in_executor for blocking calls

```python
# Bad - Blocking call in async function
async def bad_async():
    result = requests.get("https://api.example.com")  # Blocks!
    return result.json()

# Good - Use async HTTP client
async def good_async():
    async with aiohttp.ClientSession() as session:
        async with session.get("https://api.example.com") as response:
            return await response.json()

# Good - Use run_in_executor for blocking calls
async def blocking_in_executor():
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        None,  # Use default executor
        requests.get,
        "https://api.example.com"
    )
    return result.json()
```

❌ **Don't forget to await** - Forgetting await returns a coroutine object

```python
# Bad - Forgot to await
async def bad():
    result = fetch_data()  # Returns coroutine, doesn't execute!
    return result

# Good - Properly awaited
async def good():
    result = await fetch_data()
    return result
```

❌ **Don't swallow CancelledError** - Always re-raise after cleanup

```python
# Bad - Swallows cancellation
async def bad_cancellation():
    try:
        await long_operation()
    except asyncio.CancelledError:
        logger.info("Cancelled")
        # Forgot to re-raise!

# Good - Re-raises after cleanup
async def good_cancellation():
    try:
        await long_operation()
    except asyncio.CancelledError:
        logger.info("Cancelled, cleaning up")
        await cleanup()
        raise  # Re-raise to complete cancellation
```

❌ **Don't create tasks without tracking them** - Can lead to resource leaks

```python
# Bad - Fire and forget
async def bad():
    asyncio.create_task(background_work())  # Task not tracked!

# Good - Track tasks
async def good():
    task = asyncio.create_task(background_work())
    # Store task reference or await it later
    tasks.append(task)
```

## Common Patterns

### Retry with Exponential Backoff

```python
async def retry_with_backoff(
    coro_func,
    max_attempts: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
):
    """Retry async function with exponential backoff.

    Args:
        coro_func: Async function to retry
        max_attempts: Maximum number of attempts
        base_delay: Initial delay in seconds
        max_delay: Maximum delay in seconds

    Returns:
        Result of successful call

    Raises:
        Last exception if all attempts fail
    """
    for attempt in range(max_attempts):
        try:
            return await coro_func()
        except Exception as e:
            if attempt == max_attempts - 1:
                raise

            delay = min(base_delay * (2 ** attempt), max_delay)
            logger.warning(
                f"Attempt {attempt + 1} failed: {e}. "
                f"Retrying in {delay}s..."
            )
            await asyncio.sleep(delay)
```

### Batch Processing

```python
async def process_in_batches(
    items: List[Any],
    batch_size: int,
    process_func,
):
    """Process items in batches.

    Args:
        items: Items to process
        batch_size: Number of items per batch
        process_func: Async function to process each item

    Returns:
        List of results
    """
    results = []

    for i in range(0, len(items), batch_size):
        batch = items[i:i + batch_size]
        batch_results = await asyncio.gather(
            *[process_func(item) for item in batch]
        )
        results.extend(batch_results)

        # Optional: Add delay between batches
        if i + batch_size < len(items):
            await asyncio.sleep(0.1)

    return results
```

### Timeout for Multiple Operations

```python
async def fetch_with_individual_timeouts(
    urls: List[str],
    timeout: float = 5.0,
):
    """Fetch URLs with individual timeouts.

    Args:
        urls: List of URLs to fetch
        timeout: Timeout for each request

    Returns:
        List of results (or None for timeouts)
    """
    async def fetch_with_timeout(url: str):
        try:
            async with asyncio.timeout(timeout):
                return await fetch_data(url)
        except asyncio.TimeoutError:
            logger.warning(f"Timeout fetching {url}")
            return None

    return await asyncio.gather(
        *[fetch_with_timeout(url) for url in urls]
    )
```

## Summary

**Key Takeaways:**

1. **Use async/await for I/O-bound operations** - Not CPU-bound
2. **Use asyncio.gather()** - For running multiple tasks concurrently
3. **Use async context managers** - For async resource management
4. **Handle cancellation properly** - Clean up and re-raise CancelledError
5. **Use semaphores** - For rate limiting and controlling concurrency
6. **Set timeouts** - Prevent indefinite waiting
7. **Don't mix blocking and async code** - Use run_in_executor for blocking calls
8. **Track all tasks** - Prevent resource leaks
9. **Use task groups (Python 3.11+)** - For structured concurrency
10. **Shield critical operations** - Use asyncio.shield() when needed


