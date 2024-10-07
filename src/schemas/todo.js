export default {
    "type": "object",
    "properties": {
        "todoID": {
            "type": "string"
        },
        "userID": {
            "type": "string"
        },
        "name": {
            "type": "string"
        },
        "created": {
            "type": "string",
            "examples": ["2021-11-30T23:39:27.060Z"] 
        },
        "completed": {
            "type": "boolean"
        }
    },
    "required": ["todoID", "userID", "name", "created", "completed"]
};
