EXERCISE_SEARCH_TOOL = {
    "name": "search_exercises",
    "description": "Search for exercise information, techniques, and recommendations. Use this when user asks about specific exercises, muscle groups, or workout techniques.",
    "parameters": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "Search query (e.g., 'chest exercises', 'how to do squat')"
            },
            "muscle_group": {
                "type": "string",
                "description": "Optional muscle group filter. For arms, use BICEPS or TRICEPS.",
                "enum": ["CHEST", "BACK", "LEGS", "SHOULDERS", "BICEPS", "TRICEPS", "CORE"]
            },
            "limit": {
                "type": "integer",
                "description": "Number of results (default 5)"
            }
        },
        "required": ["query"]
    }
}

USER_WORKOUT_SEARCH_TOOL = {
    "name": "search_user_workouts",
    "description": "[RAG/Semantic Search] Search user's workout history by CONTENT and training patterns. USE THIS for: 'my chest workouts', 'leg sessions', 'workouts with squats', 'upper body training', 'sessions where I did deadlifts'. DO NOT use for specific date queries - use get_user_workout_history instead. This uses AI semantic search to understand exercise content and muscle groups.",
    "parameters": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "Natural language search query about exercises, muscle groups, or training patterns (NOT dates)"
            },
            "limit": {
                "type": "integer",
                "description": "Number of results (default 5)"
            }
        },
        "required": ["query"]
    }
}

USER_STATS_TOOL = {
    "name": "get_user_stats",
    "description": "Get user's workout statistics and progress summary. Use this when user asks about their overall progress, frequency, or performance trends.",
    "parameters": {
        "type": "object",
        "properties": {
            "days": {
                "type": "integer",
                "description": "Number of days to look back (default 30)"
            }
        },
        "required": []
    }
}

GET_USER_WORKOUT_HISTORY_TOOL = {
    "name": "get_user_workout_history",
    "description": "[Date-Based Query] Get user's workout history by date range. USE THIS for: 'did I workout on 23/12?', 'what did I train on [specific date]?', 'have I been to gym on [date]?', 'show my workouts this week/month', 'list all my recent workouts', 'workout history last 7 days'. Returns chronological list with dates, exercises, and volume. Perfect for date-specific questions and time-range queries.",
    "parameters": {
        "type": "object",
        "properties": {
            "days": {
                "type": "integer",
                "description": "Number of days to look back (default 30, max 180). For 'this week' use 7, 'this month' use 30, 'today' or 'yesterday' use 2-3 days"
            },
            "limit": {
                "type": "integer",
                "description": "Maximum number of workouts to return (default 20, max 100)"
            }
        },
        "required": []
    }
}

# List of all available tools
ALL_TOOLS = [
    EXERCISE_SEARCH_TOOL,
    USER_WORKOUT_SEARCH_TOOL,
    USER_STATS_TOOL,
    GET_USER_WORKOUT_HISTORY_TOOL
]