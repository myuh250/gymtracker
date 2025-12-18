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
                "description": "Optional muscle group filter (CHEST, BACK, LEGS, etc.)",
                "enum": ["CHEST", "BACK", "LEGS", "SHOULDERS", "ARMS", "CORE"]
            },
            "limit": {
                "type": "integer",
                "description": "Number of results (default 5)",
                "default": 5
            }
        },
        "required": ["query"]
    }
}

USER_WORKOUT_SEARCH_TOOL = {
    "name": "search_user_workouts",
    "description": "Search user's past workout history and logs. Use this when user asks about their own workout history, progress, or past sessions.",
    "parameters": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "Search query (e.g., 'my chest workouts', 'leg day last week')"
            },
            "limit": {
                "type": "integer",
                "description": "Number of results (default 5)",
                "default": 5
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
                "description": "Number of days to look back (default 30)",
                "default": 30
            }
        },
        "required": []
    }
}

# List of all available tools
ALL_TOOLS = [
    EXERCISE_SEARCH_TOOL,
    USER_WORKOUT_SEARCH_TOOL,
    USER_STATS_TOOL
]