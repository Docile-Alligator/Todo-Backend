import jwt from 'jsonwebtoken';


export const setSessionCookie = (res, {userID, sessionStarted}) => {
    const { COOKIE_LIFETIME, COOKIE_DOMAIN } = process.env;

    let options = {
        // COOKIE_LIFETIME is in days, convert it to ms
        maxAge: COOKIE_LIFETIME * 24 * 60 * 60 * 1000, 
        secure: true
    };

    if (COOKIE_DOMAIN) {
        options.domain = COOKIE_DOMAIN;
    }

    res.cookie('todox-session', generateSessionToken({userID, sessionStarted}), options);
};

export const deleteCookies = (res) => {
    const { COOKIE_DOMAIN } = process.env;

    let options = {
        secure: true
    }
    if (COOKIE_DOMAIN) {
        options.domain = COOKIE_DOMAIN;
    }

    res.clearCookie('todox-session', options);
}

export const decodeToken = (token) => {
    return jwt.decode(token);
};

export const verifyToken = (token, options={}) => {
    const { TOKEN_SECRET } = process.env;
    return jwt.verify(token, TOKEN_SECRET, options);
};

export const validateToken = (token, options={}) => {
    const { TOKEN_SECRET } = process.env;
    if (jwt.verify(token, TOKEN_SECRET, options)) {
        return true;
    }
    else {
        return false;
    }
};

export const generateSessionToken = ({userID, sessionStarted}) => {
    const { COOKIE_LIFETIME, TOKEN_SECRET } = process.env;
    return jwt.sign({
        userID,
        sessionStarted: sessionStarted ? sessionStarted : Date.now()
    }, 
    TOKEN_SECRET, 
    {expiresIn: `${COOKIE_LIFETIME}d`});
};