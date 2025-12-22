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
                "description": "Number of results (default 5)"
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
    "description": "Get chronological list of user's workout dates and summaries. Use this when user asks 'what dates did I workout', 'list all my workouts', 'which days I trained', or wants to see all workout history.",
    "parameters": {
        "type": "object",
        "properties": {
            "days": {
                "type": "integer",
                "description": "Number of days to look back (default 30, max 180)"
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