import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cookieParser from 'cookie-parser';
import connectDB from './src/functions/connectDB.js';

import createTodoRepository from './src/repositories/todo.js';
import createUserRepository from './src/repositories/user.js';

import todoRouter from './src/routers/todo.js';
import userRouter from './src/routers/user.js';


(async () => {
    const {FRONTEND_DOMAIN, FRONTEND_URL, PORT, TODOX_DB_NAME} = process.env;
    const app = express();
    app.set('trust proxy', true);
    app.use(cookieParser());
    app.use(express.json({ limit: '100mb' }));
    
    // Prevent CORS issues
    app.use((req, res, next) => {
        if (FRONTEND_URL) {
            // Handle other subdomains like www in addition to root domain
            if (req.headers.origin && req.headers.origin.includes(FRONTEND_DOMAIN)) {
                res.append('Access-Control-Allow-Origin', req.headers.origin);
            }
            else {
                res.append('Access-Control-Allow-Origin', FRONTEND_URL);
            }
        }
        res.append('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, Accept, Origin, X-Requested-With');
        res.append('Access-Control-Allow-Credentials', true);
        res.append('Access-Control-Allow-Methods', 'DELETE, GET, POST, OPTIONS, PUT, PATCH');
        
        next();
    });

    // Accept pre-flight requests
    app.options('/*', (_, res) => {
        res.sendStatus(200);
    });

    // Connect database
    const todoxDB = await connectDB(TODOX_DB_NAME);

    const todoRepository = createTodoRepository(todoxDB);
    const userRepository = createUserRepository(todoxDB);

    // Initialize routers
    app.use('/health', (req, res) => {
        res.status(200).send("Ok");
    });
    app.use('/todo', todoRouter({todoRepository}));
    app.use('/user', userRouter({userRepository}));

    app.listen(PORT, () => {
        console.log(`TodoX API listening at http://localhost:${PORT}`);
    });
})();