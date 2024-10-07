import Ajv from 'ajv';

// Import schemas
import todo from './todo.js';
import user from './user.js';

// Using removeAdditional: "all" strips any fields not present in the schema upon validation
const ajv = new Ajv({removeAdditional: "all"});

const validateTodo = ajv.compile(todo);
const validateUser = ajv.compile(user);

export {
    validateTodo,
    validateUser
};