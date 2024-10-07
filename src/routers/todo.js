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

    router.post('/toggleCompleted', auth, async (req, res) => {
        try {
            //let session = verifyToken(req.cookies['todox-session']);

            let resultTodo = await todoRepository.toggleCompleted(req.todoID, /*session.userID*/ "test", req.completed);
            return res.status(201).send(resultTodo);
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
                let result = await todoRepository.findAllIncomplete(Number(req.query.page), Number(req.query.pageSize));
                return res.status(200).send(result);
            } else {
                let result = await todoRepository.findAll(Number(req.query.page), Number(req.query.pageSize));
                return res.status(200).send(result);
            }
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({error: "Fetch todos failed"});
        }
    });

    return router;
}