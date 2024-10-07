import express from 'express';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import { v4 as uuidv4 } from 'uuid';
import { validateUser } from '../schemas/validators.js';
import auth from '../middleware/auth.js';
import { deleteCookies, setSessionCookie, verifyToken } from '../functions/cookies.js';
import { hashPassword, comparePassword } from '../functions/passwords.js';


dayjs.extend(utc);
const router = express.Router();

export default ({userRepository}) => {
    // Private GET route for user to retrieve their own profile details
    router.get('/me', auth, async (req, res) => {
        try {
            let session = verifyToken(req.cookies['todox-session']);

            const user = await userRepository.findOneById(session.userID);
            
            if (user) {
                delete user._id;
                delete user.password;
                return res.status(200).send(user);
            }
            else {
                return res.status(400).send({});
            }
        }
        catch (err) {
            console.error(err);
            res.status(500).send({error: "Failed to fetch user."});
        }
    });

    // GET route to refresh session cookie for already signed-in user
    router.get('/session', auth, async (req, res) => {
        try {
            let session = verifyToken(req.cookies['todox-session']);
            
            const user = await userRepository.findOneById(session.userID);

            if (user && user.archived !== true) {
                setSessionCookie(res, {
                    userID: user.userID
                });
                res.status(200).send({});
            }
            else {
                res.status(401).send({error: "Unauthorized."});
            }
        }
        catch (err) {
            console.error(err);
            res.status(500).send({error: "An unexpected error occurred."});
        }
    });

    // Login route for non-signed-in users
    router.post('/session', async (req, res) => {
        try {
            let user = await userRepository.findOneByUsername(req.body.username);
            
            if (user) {
                const isPassCorrect = await comparePassword(req.body.password, user.password);
                if (!isPassCorrect) {
                    return res.status(401).send({error: "Incorrect username and password combo."});
                }

                setSessionCookie(res, {
                    userID: user.userID
                });
                delete user._id;
                delete user.password;
                return res.status(200).send(user);
            }
            return res.status(401).send({error: "Unauthorized."});
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({});
        }
    });

    // Logout route
    router.delete('/session', async (req, res) => {
        try {
            deleteCookies(res);
            return res.status(200).send({});
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({});
        }
    });

    // Create new user account
    router.post('/', async (req, res) => {
        try {
            const userID = uuidv4();
            const created = dayjs().utc().toISOString();

            let newUser = {
                ...req.body,
                userID,
                created
            };

            if (validateUser(newUser)) {
                newUser.password = await hashPassword(newUser.password);
                
                let resultUser = await userRepository.createIfNotExists(newUser);
                
                if (!resultUser) {
                    return res.status(400).send({error: "Username already in use."});
                }

                setSessionCookie(res, {userID: resultUser.userID});
                delete resultUser._id;
                delete resultUser.password;
                return res.status(201).send(resultUser);
            }
            console.error(validateUser.errors);
            return res.status(400).send({error: "Invalid field used."});
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({error: "Account creation failed."});
        }
    });

    return router;
}
