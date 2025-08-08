const {
    userModel,
    tokenBlacklistModel
} = require('../models');

const utils = require('../utils');
const { authCookieName } = require('../app-config');

const bsonToJson = (data) => { return JSON.parse(JSON.stringify(data)) };
const removePassword = (data) => {
    const { password, __v, ...userData } = data;
    return userData
}

function register(req, res, next) {
    const { tel, email, username, password, repeatPassword } = req.body;

    return userModel.create({ tel, email, username, password })
        .then((createdUser) => {
            createdUser = bsonToJson(createdUser);
            createdUser = removePassword(createdUser);

            const token = utils.jwt.createToken({ _id: createdUser._id });
            if (process.env.NODE_ENV === 'production') {
                res.cookie(authCookieName, token, { httpOnly: true, sameSite: 'none', secure: true })
            } else {
                res.cookie(authCookieName, token, { httpOnly: true })
            }
            res.status(200)
                .send(createdUser);
        })
        .catch(err => {
            if (err.name === 'MongoError' && err.code === 11000) {
                let field = err.message.split("index: ")[1];
                field = field.split(" dup key")[0];
                field = field.substring(0, field.lastIndexOf("_"));

                res.status(409)
                    .send({ message: `This ${field} is already registered!` });
                return;
            }
            next(err);
        });
}

async function login(req, res, next) {
    try {
        console.log('LOGIN КОНТРОЛЕР СЕ ИЗВИКВА!');
        const { email, password } = req.body;

        // Ако някъде си правил select()-и, насилваме да дойде password
        const user = await userModel.findOne({ email }); // без .lean()!

        if (!user) {
            return res.status(401).send({ message: 'Wrong email or password' });
        }

        // matchPassword може да липсва, ако моделът е различен/без methods
        let match = false;
        if (typeof user.matchPassword === 'function') {
            match = await user.matchPassword(password);
        } else {
            // Fallback – директно сравнение с bcrypt
            match = await bcrypt.compare(password, user.password);
        }

        if (!match) {
            return res.status(401).send({ message: 'Wrong email or password' });
        }

        // Подготвяме чист обект без парола
        const plain = JSON.parse(JSON.stringify(user));
        const { password: _pw, __v, ...safeUser } = plain;

        // Винаги имай role (ако липсва в стар запис – user)
        const role = user.role || 'user';

        console.log('LOGIN user (safe):', { ...safeUser, role });

        const token = utils.jwt.createToken({
            _id: user._id,
            email: user.email,
            role,                // включваме ролята в токена
        });

        const cookieOpts =
            process.env.NODE_ENV === 'production'
                ? { httpOnly: true, sameSite: 'none', secure: true }
                : { httpOnly: true };

        res.cookie(authCookieName, token, cookieOpts);

        // Върни user без парола + role за фронтенда
        return res.status(200).send({ ...safeUser, role });
    } catch (err) {
        return next(err);
    }
}


function logout(req, res) {
    const token = req.cookies[authCookieName];

    tokenBlacklistModel.create({ token })
        .then(() => {
            res.clearCookie(authCookieName)
                .status(204)
                .send({ message: 'Logged out!' });
        })
        .catch(err => res.send(err));
}

function getProfileInfo(req, res, next) {
    const { _id: userId } = req.user;

    userModel.findOne({ _id: userId }, { password: 0, __v: 0 }) //finding by Id and returning without password and __v
        .then(user => { res.status(200).json(user) })
        .catch(next);
}
module.exports = {
    login,
    register,
    logout,
    getProfileInfo,
}
