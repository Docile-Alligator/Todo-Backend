import express from 'express';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import { v4 as uuidv4 } from 'uuid';
import { validateTodo, validateUser } from '../schemas/validators.js';
import auth from '../middleware/auth.js';
import { verifyToken } from '../functions/cookies.js';


dayjs.extend(utc);
const router = express.Router();

export default ({todoRepository}) => {
    // Create new todo
    router.post('/', auth, async (req, res) => {
        try {
            let session = verifyToken(req.cookies['todox-session']);

            const todoID = uuidv4();
            const created = dayjs().utc().toISOString();

            let newTodo = {
                ...req.body,
                todoID,
                userID: session.userID,
                created,
                completed: false
            };

            if (validateTodo(newTodo)) {
                let resultTodo = await todoRepository.insertOne(newTodo);
                return res.status(201).send(resultTodo);
            }
            console.error(validateTodo.errors);
            return res.status(400).send({error: "Invalid field used."});
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({error: "Todo creation failed."});
        }
    });

    // GET a list of todos based on criteria. Pagination is required.
    router.get('/', auth, async (req, res) => {
        try {
            let session = verifyToken(req.cookies['todox-session']);

            // The default pageSize is 3.
            let pageSize = req.query.pageSize === undefined ? 3 : Number(req.query.pageSize);
            pageSize = isNaN(pageSize) ? 3 : pageSize;

            if (req.query.findIncomplete === "true") {
                // Here we fetch the incomplete list
                let result = await todoRepository.find(session.userID, req.query.before, req.query.after, pageSize, { completed: false });
                if (result.length === 0) {
                    // No more todos, so we don't send before and after.
                    return res.status(200).send({ result: result });
                } else {
                    return res.status(200).send({ result: result, before: result[0].created, after: result[result.length - 1].created });
                }
            } else {
                // Here we fetch all the list
                let result = await todoRepository.find(session.userID, req.query.before, req.query.after, pageSize);
                if (result.length === 0) {
                    // No more todos, so we don't send before and after.
                    return res.status(200).send({ result: result });
                } else {
                    return res.status(200).send({ result: result, before: result[0].created, after: result[result.length - 1].created });
                }
            }
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({ error: "Fetching todos failed" });
        }
    });

    /*
        Update (PATCH) a todo.
        We combine toggling completeness and editing the todo name to this PUT endpoint since these two are basically editing a todo.
        We certainly can use two separate endpoints for editing different fields of the todo, since that separates the logic instead of
        using if else to determine the field to update, but in this case, we would like to make it more RESTful and easy to inspect the API.
        We use PATCH instead of PUT because we don't need to send all the todo fields to this endpoint.
     */
    router.patch('/', auth, async (req, res) => {
        try {
            if (req.body.todoID === undefined) {
                return res.status(400).send({ error: "Invalid field used." });
            }

            let session = verifyToken(req.cookies['todox-session']);

            let updateFields = {};
            if (req.body.completed !== undefined) {
                // Toggle completeness
                updateFields.completed = req.body.completed;
            }
            if (req.body.newTodoName !== undefined) {
                // Edit todo name
                updateFields.name = req.body.newTodoName;
            }

            if (Object.keys(updateFields).length === 0) {
                // You probably forget to send the fields that need to be updated.
                return res.status(400).send({ error: "Nothing to update." });
            }

            let result = await todoRepository.updateTodo(req.body.todoID, session.userID, updateFields);
            return res.status(200).send(result);
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({ error: "Updating todo failed." });
        }
    });

    // DELETE a todo.
    router.delete('/', auth, async (req, res) => {
        try {
            let session = verifyToken(req.cookies['todox-session']);

            let result = await todoRepository.deleteTodo(req.body.todoID, session.userID);
            return res.status(200).send(result);
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({ error: "Deleting todo name failed." });
        }
    });

    return router;
}