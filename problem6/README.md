# Scoreboard System - API Service Specification

## Overview
Real-time leaderboard system that displays top 10 users based on their scores from completed actions.

## High-Level Architecture

```mermaid
graph TB
    subgraph "Actors"
        User[👤 User<br/>Performs Actions]
        Viewer[👁️ Viewer<br/>Watches Leaderboard]
    end
    
    subgraph "API Layer"
        ActionAPI[Action API]
        LeaderboardAPI[Leaderboard API<br/>+ SSE Endpoint]
    end
    
    subgraph "Score Processing"
        SQS1[SQS<br/>score-change]
        Worker1[Score Worker]
        SQS2[SQS<br/>top-10-update]
        Worker2[Top 10 Worker]
    end
    
    subgraph "Data"
        DB[(MySQL)]
        Redis[(Redis<br/>ALL users in sorted set<br/>Top 10 cached)]
        PubSub[Redis Pub/Sub]
    end
    
    User -->|1. Action| ActionAPI
    ActionAPI -->|2. Send| SQS1
    
    SQS1 -->|3. Process| Worker1
    Worker1 -->|4. Update| DB
    Worker1 -->|5. Update| Redis
    Worker1 -->|6. Send| SQS2
    
    SQS2 -->|7. Process| Worker2
    Worker2 -->|8. Calculate Top 10| Redis
    Worker2 -->|9. Publish| PubSub
    
    Viewer -.->|A. Connect| LeaderboardAPI
    LeaderboardAPI -.->|B. Subscribe| PubSub
    PubSub -.->|C. Push| LeaderboardAPI
    LeaderboardAPI -.->|D. Stream| Viewer
    
    style User fill:#87CEEB,color:#000
    style Viewer fill:#FFA07A,color:#000
    style Worker1 fill:#DDA0DD,color:#000
    style Worker2 fill:#DDA0DD,color:#000
    style Redis fill:#FFB6C1,color:#000
    style ActionAPI fill:#FFD700,color:#000
    style LeaderboardAPI fill:#FFD700,color:#000
    style SQS1 fill:#98FB98,color:#000
    style SQS2 fill:#98FB98,color:#000
    style DB fill:#F4A460,color:#000
    style PubSub fill:#FFB6C1,color:#000
```

## Execution Flow

```mermaid
sequenceDiagram
    participant User
    participant ActionAPI
    participant SQS1 as SQS: score-change
    participant Worker1 as Score Worker
    participant DB as MySQL
    participant Redis
    participant SQS2 as SQS: top-10-update
    participant Worker2 as Top 10 Worker
    participant PubSub as Redis Pub/Sub
    participant SSE as SSE Endpoint
    participant Viewer
    
    %%{init: {'theme':'base', 'themeVariables': { 'noteBkgColor':'#fff','noteTextColor':'#000'}}}%%
    
    Note over Viewer,SSE: Viewer already connected via SSE
    
    rect rgb(230, 245, 255)
    Note right of User: User Action Flow
    User->>ActionAPI: 1. POST /api/action (actionType, userId)
    ActionAPI->>ActionAPI: 2. Validate authorization
    ActionAPI->>SQS1: 3. Send message (userId, scoreIncrement)
    ActionAPI->>User: 4. Return 200 OK
    end
    
    rect rgb(255, 245, 230)
    Note right of SQS1: Score Processing Flow
    SQS1->>Worker1: 5. Poll message
    Worker1->>DB: 6. UPDATE users SET score = score + X
    Worker1->>Redis: 7. ZINCRBY leaderboard userId X
    Worker1->>Redis: 8. Check if user in top 15?
    Redis-->>Worker1: 9. Return rank
    
    alt User affects top 10
        Worker1->>SQS2: 10. Send leaderboard update message
    end
    Worker1->>SQS1: 11. Delete message from queue
    end
    
    rect rgb(245, 255, 245)
    Note right of SQS2: Leaderboard Update Flow
    SQS2->>Worker2: 12. Poll message
    Worker2->>Redis: 13. ZREVRANGE leaderboard 0 9
    Redis-->>Worker2: 14. Return top 10 user IDs + scores
    Worker2->>DB: 15. Get user details (username, avatar)
    Worker2->>Redis: 16. Compare with cached top 10
    
    alt Top 10 changed
        Worker2->>Redis: 17. Update top10_cache
        Worker2->>PubSub: 18. PUBLISH leaderboard-update
    end
    Worker2->>SQS2: 19. Delete message from queue
    end
    
    rect rgb(255, 240, 240)
    Note right of PubSub: Real-time Update Flow
    PubSub->>SSE: 20. Push new top 10 data
    SSE->>Viewer: 21. Stream event (Server-Sent Event)
    Viewer->>Viewer: 22. Update UI with new leaderboard
    end
```

## Key Components

### 1. Action API
- Receives user actions
- Validates authorization (prevents malicious score updates)
- Sends messages to SQS

### 2. Score Worker
- Processes score updates
- Updates user total score in database
- Updates Redis leaderboard (sorted set)
- Triggers top 10 recalculation if needed

### 3. Top 10 Worker
- Calculates top 10 from Redis
- Compares with cached version
- Only publishes if leaderboard changed
- Broadcasts via Redis Pub/Sub

### 4. SSE Endpoint
- Provides real-time updates to viewers
- Subscribes to Redis Pub/Sub
- Streams leaderboard changes to connected clients

## Data Storage

### Database (MySQL)
- `users` table: user_id, username, avatar, total_score
- `actions` table: action_id, user_id, action_type, score, timestamp

### Redis
- Sorted Set `leaderboard`: stores userId → score for fast ranking
- String `top10_cache`: cached JSON of current top 10
- Pub/Sub channel `leaderboard-update`: broadcasts changes

## Security Considerations
- Action API requires authentication (JWT)
- Validates user authorization before accepting actions
- Rate limiting to prevent abuse
- Idempotency keys for duplicate prevention

## Scalability
- Horizontal scaling of workers
- Redis for fast leaderboard queries (O(log N))
- SQS for reliable message processing
- Conditional updates (only broadcast when top 10 changes)

## Improvements for Future
- Add rate limiting per user
- Implement action validation rules
- Add monitoring and alerting
- Consider batch processing for high volume