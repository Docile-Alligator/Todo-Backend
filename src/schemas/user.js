export default {
    "type": "object",
    "properties": {
        "userID": {
            "type": "string"
        },
        "username": {
            "type": "string"
        },
        "password": {
            "type": "string"
        },
        "created": {
            "type": "string",
            "examples": ["2021-11-30T23:39:27.060Z"] 
        }
    },
    "required": ["userID", "username", "password", "created"]
};