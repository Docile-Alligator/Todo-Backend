import { validateToken } from '../functions/cookies.js'

// Middleware used to confirm the user has a valid session cookie and is thus, signed in
const auth = (req, res, next) => {
    try {
        if (req.method === "OPTIONS") {
            return next();
        }

        const sessionToken = req.cookies['todox-session'];
        
        if (sessionToken) {
            if (validateToken(sessionToken)) {
                return next();
            }
        }
        return res
            .status(401)
            .send({});
    }
    catch (err) {
        return res
            .status(401)
            .send({});
    }
}

export default auth;