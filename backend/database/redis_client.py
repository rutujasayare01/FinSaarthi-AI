import os
import json
import time
import logging
from typing import Optional, Any

logger = logging.getLogger("finsaarthi.redis")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

class MockRedis:
    """In-memory fallback cache and queue when Redis daemon is not running."""
    def __init__(self):
        self._store = {}
        self._expires = {}
        self._lists = {}
        logger.info("Initialized InMemory Cache/Queue (Redis Fallback Adapter)")

    def get(self, key: str) -> Optional[str]:
        if key in self._expires and time.time() > self._expires[key]:
            self._store.pop(key, None)
            self._expires.pop(key, None)
            return None
        return self._store.get(key)

    def set(self, key: str, value: Any, ex: Optional[int] = None) -> bool:
        self._store[key] = str(value)
        if ex:
            self._expires[key] = time.time() + ex
        elif key in self._expires:
            del self._expires[key]
        return True

    def delete(self, *keys) -> int:
        count = 0
        for k in keys:
            if k in self._store:
                del self._store[k]
                self._expires.pop(k, None)
                count += 1
        return count

    def lpush(self, key: str, *values) -> int:
        if key not in self._lists:
            self._lists[key] = []
        for v in values:
            self._lists[key].insert(0, str(v))
        return len(self._lists[key])

    def rpop(self, key: str) -> Optional[str]:
        if key in self._lists and self._lists[key]:
            return self._lists[key].pop()
        return None

    def incr(self, key: str) -> int:
        val = int(self.get(key) or 0) + 1
        self.set(key, val)
        return val

    def ping(self) -> bool:
        return True

def get_redis_client():
    try:
        import redis
        client = redis.Redis.from_url(REDIS_URL, decode_responses=True, socket_connect_timeout=1)
        client.ping()
        logger.info("Connected to Redis at %s", REDIS_URL)
        return client
    except Exception as e:
        logger.warning("Redis server unavailable (%s). Using InMemory fallback adapter.", e)
        return MockRedis()

redis_client = get_redis_client()
