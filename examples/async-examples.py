"""
Python Async/Await Examples

This module demonstrates asynchronous programming in Python including:
- Async functions and await
- Async context managers
- Async iterators
- asyncio.gather() for concurrent operations
- Error handling in async code
"""

import asyncio
from typing import Any, AsyncIterator
from contextlib import asynccontextmanager


# ============================================================================
# BASIC ASYNC/AWAIT
# ============================================================================

async def fetch_user(user_id: int) -> dict[str, Any]:
    """Async function to fetch user data"""
    # Simulate network delay
    await asyncio.sleep(0.1)
    return {
        "id": user_id,
        "name": f"User {user_id}",
        "email": f"user{user_id}@example.com"
    }


async def basic_async_example():
    """Basic async/await usage"""
    print("Fetching user...")
    user = await fetch_user(1)
    print(f"Got user: {user['name']}")


# ============================================================================
# CONCURRENT OPERATIONS WITH asyncio.gather()
# ============================================================================

async def fetch_multiple_users(user_ids: list[int]) -> list[dict[str, Any]]:
    """Fetch multiple users concurrently"""
    # Create tasks for all user fetches
    tasks = [fetch_user(user_id) for user_id in user_ids]
    
    # Run all tasks concurrently
    users = await asyncio.gather(*tasks)
    
    return list(users)


async def concurrent_example():
    """Demonstrate concurrent execution"""
    print("\nFetching multiple users concurrently...")
    start = asyncio.get_event_loop().time()
    
    users = await fetch_multiple_users([1, 2, 3, 4, 5])
    
    end = asyncio.get_event_loop().time()
    print(f"Fetched {len(users)} users in {end - start:.2f} seconds")
    for user in users:
        print(f"  - {user['name']}")


# ============================================================================
# ASYNC CONTEXT MANAGERS
# ============================================================================

class AsyncDatabaseConnection:
    """Example async context manager"""
    
    def __init__(self, db_name: str) -> None:
        self.db_name = db_name
        self.connected = False
    
    async def __aenter__(self):
        """Async enter - connect to database"""
        print(f"Connecting to {self.db_name}...")
        await asyncio.sleep(0.1)  # Simulate connection delay
        self.connected = True
        print(f"Connected to {self.db_name}")
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async exit - disconnect from database"""
        print(f"Disconnecting from {self.db_name}...")
        await asyncio.sleep(0.1)  # Simulate disconnection delay
        self.connected = False
        print(f"Disconnected from {self.db_name}")
    
    async def query(self, sql: str) -> list[dict[str, Any]]:
        """Execute query"""
        if not self.connected:
            raise RuntimeError("Not connected to database")
        await asyncio.sleep(0.05)  # Simulate query execution
        return [{"id": 1, "data": "result"}]


async def context_manager_example():
    """Demonstrate async context manager"""
    print("\nUsing async context manager...")
    async with AsyncDatabaseConnection("mydb") as db:
        results = await db.query("SELECT * FROM users")
        print(f"Query results: {results}")


# ============================================================================
# ASYNC CONTEXT MANAGER WITH DECORATOR
# ============================================================================

@asynccontextmanager
async def async_timer(name: str) -> AsyncIterator[None]:
    """Async context manager using decorator"""
    print(f"Starting {name}...")
    start = asyncio.get_event_loop().time()
    try:
        yield
    finally:
        end = asyncio.get_event_loop().time()
        print(f"{name} took {end - start:.2f} seconds")


async def timer_example():
    """Demonstrate async timer context manager"""
    print("\nUsing async timer...")
    async with async_timer("User fetch operation"):
        await fetch_user(1)


# ============================================================================
# ASYNC ITERATORS
# ============================================================================

class AsyncNumberGenerator:
    """Async iterator example"""
    
    def __init__(self, start: int, end: int) -> None:
        self.start = start
        self.end = end
        self.current = start
    
    def __aiter__(self):
        """Return async iterator"""
        return self
    
    async def __anext__(self) -> int:
        """Get next item"""
        if self.current >= self.end:
            raise StopAsyncIteration
        
        await asyncio.sleep(0.05)  # Simulate async operation
        value = self.current
        self.current += 1
        return value


async def async_iterator_example():
    """Demonstrate async iterator"""
    print("\nUsing async iterator...")
    async for num in AsyncNumberGenerator(1, 6):
        print(f"  Generated: {num}")


# ============================================================================
# ASYNC GENERATOR FUNCTION
# ============================================================================

async def async_range(start: int, end: int) -> AsyncIterator[int]:
    """Async generator function"""
    for i in range(start, end):
        await asyncio.sleep(0.05)  # Simulate async operation
        yield i


async def async_generator_example():
    """Demonstrate async generator"""
    print("\nUsing async generator...")
    async for num in async_range(1, 6):
        print(f"  Value: {num}")


# ============================================================================
# ERROR HANDLING IN ASYNC CODE
# ============================================================================

async def fetch_with_error(user_id: int) -> dict[str, Any]:
    """Async function that may raise an error"""
    await asyncio.sleep(0.1)
    if user_id < 0:
        raise ValueError(f"Invalid user ID: {user_id}")
    return {"id": user_id, "name": f"User {user_id}"}


async def error_handling_example():
    """Demonstrate error handling in async code"""
    print("\nError handling in async code...")

    # Try-except with async
    try:
        user = await fetch_with_error(-1)
        print(f"Got user: {user}")
    except ValueError as e:
        print(f"Caught error: {e}")

    # Error handling with gather
    print("\nError handling with gather...")
    results = await asyncio.gather(
        fetch_with_error(1),
        fetch_with_error(-1),
        fetch_with_error(2),
        return_exceptions=True  # Return exceptions instead of raising
    )

    for i, result in enumerate(results):
        if isinstance(result, Exception):
            print(f"  Task {i} failed: {result}")
        else:
            print(f"  Task {i} succeeded: {result['name']}")


# ============================================================================
# TIMEOUT HANDLING
# ============================================================================

async def slow_operation() -> str:
    """Slow async operation"""
    await asyncio.sleep(5)
    return "Completed"


async def timeout_example():
    """Demonstrate timeout handling"""
    print("\nTimeout handling...")

    try:
        # Wait for at most 1 second
        result = await asyncio.wait_for(slow_operation(), timeout=1.0)
        print(f"Result: {result}")
    except asyncio.TimeoutError:
        print("Operation timed out!")


# ============================================================================
# TASK MANAGEMENT
# ============================================================================

async def background_task(name: str, duration: float) -> None:
    """Background task that runs for specified duration"""
    print(f"Task {name} started")
    await asyncio.sleep(duration)
    print(f"Task {name} completed")


async def task_management_example():
    """Demonstrate task creation and management"""
    print("\nTask management...")

    # Create tasks
    task1 = asyncio.create_task(background_task("A", 0.2))
    task2 = asyncio.create_task(background_task("B", 0.3))
    task3 = asyncio.create_task(background_task("C", 0.1))

    # Wait for all tasks
    await asyncio.gather(task1, task2, task3)
    print("All tasks completed")


# ============================================================================
# ASYNC COMPREHENSIONS
# ============================================================================

async def async_comprehension_example():
    """Demonstrate async comprehensions"""
    print("\nAsync comprehensions...")

    # Async list comprehension
    results = [user async for user in async_range(1, 4)]
    print(f"Results: {results}")

    # Async dict comprehension
    user_dict = {
        i: await fetch_user(i)
        for i in range(1, 4)
    }
    print(f"User dict keys: {list(user_dict.keys())}")


# ============================================================================
# SEMAPHORE FOR RATE LIMITING
# ============================================================================

async def rate_limited_fetch(
    user_id: int,
    semaphore: asyncio.Semaphore
) -> dict[str, Any]:
    """Fetch with rate limiting using semaphore"""
    async with semaphore:
        print(f"  Fetching user {user_id}...")
        return await fetch_user(user_id)


async def rate_limiting_example():
    """Demonstrate rate limiting with semaphore"""
    print("\nRate limiting with semaphore...")

    # Allow only 2 concurrent operations
    semaphore = asyncio.Semaphore(2)

    tasks = [
        rate_limited_fetch(i, semaphore)
        for i in range(1, 6)
    ]

    users = await asyncio.gather(*tasks)
    print(f"Fetched {len(users)} users with rate limiting")


# ============================================================================
# MAIN EXECUTION
# ============================================================================

async def main():
    """Main async function running all examples"""
    await basic_async_example()
    await concurrent_example()
    await context_manager_example()
    await timer_example()
    await async_iterator_example()
    await async_generator_example()
    await error_handling_example()
    await timeout_example()
    await task_management_example()
    await async_comprehension_example()
    await rate_limiting_example()


if __name__ == "__main__":
    print("=== Python Async/Await Examples ===")
    asyncio.run(main())
    print("\n=== All examples completed ===")


