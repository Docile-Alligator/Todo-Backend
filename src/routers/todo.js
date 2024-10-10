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
                    // No more todos
                    return res.status(200).send({ result: result });
                } else {
                    return res.status(200).send({ result: result, before: result[0].created, after: result[result.length - 1].created });
                }
            } else {
                let result = await todoRepository.find(req.query.before, req.query.after, Number(req.query.pageSize));
                if (result.length === 0) {
                    return res.status(200).send({ result: result });
                } else {
                    return res.status(200).send({ result: result, before: result[0].created, after: result[result.length - 1].created });
                }
            }
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({error: "Fetch todos failed"});
        }
    });

    router.post('/toggleCompleted', auth, async (req, res) => {
        try {
            let session = verifyToken(req.cookies['todox-session']);

            let result = await todoRepository.toggleCompleted(req.body.todoID, session.userID, req.body.completed);
            return res.status(200).send(result);
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({error: "Toggling todo failed."});
        }
    });

    router.post('/editName', auth, async (req, res) => {
        try {
            let session = verifyToken(req.cookies['todox-session']);

            let result = await todoRepository.editName(req.body.todoID, session.userID, req.body.newTodoName);
            return res.status(200).send(result);
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({error: "Editing todo name failed."});
        }
    });

    router.delete('/delete', auth, async (req, res) => {
        try {
            let session = verifyToken(req.cookies['todox-session']);

            let result = await todoRepository.deleteTodo(req.body.todoID, session.userID);
            return res.status(200).send(result);
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({error: "Deleting todo name failed."});
        }
    });

    return router;
}