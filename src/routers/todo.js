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

    router.get('/', auth, async (req, res) => {
        try {
            verifyToken(req.cookies['todox-session']);

            if (req.query.findIncomplete === "true") {
                let result = await todoRepository.find(req.query.before, req.query.after, Number(req.query.pageSize), { completed: false });
                if (result.length === 0) {
                    // No more todos, so we don't send before and after.
                    return res.status(200).send({ result: result });
                } else {
                    return res.status(200).send({ result: result, before: result[0].created, after: result[result.length - 1].created });
                }
            } else {
                let result = await todoRepository.find(req.query.before, req.query.after, Number(req.query.pageSize));
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

    router.put('/', auth, async (req, res) => {
        try {
            if (req.body.todoID === undefined) {
                return res.status(400).send({ error: "Invalid field used." });
            }

            let session = verifyToken(req.cookies['todox-session']);

            let updateFields = {};
            if (req.body.completed !== undefined) {
                updateFields.completed = req.body.completed;
            }
            if (req.body.newTodoName !== undefined) {
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

    return router;
}