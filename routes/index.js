import { Router } from 'express'
import { _data } from '../_mock_data.js'
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig.js'
import JWT from 'jsonwebtoken'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
//const axios = require('axios').default
const db = new JsonDB(new Config("ReactProjectDB", true, true, '/'));
const router = Router()

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
        try {
            const bearer = bearerHeader.split(' ');
            let bearerToken = bearer[1];
            JWT.verify(bearerToken, 'secretKey1', (err) => {
                if (!err) {
                    return
                }
                if (err.name === 'TokenExpiredError') {
                    const payload = JWT.decode(bearerToken)
                    delete payload.iat
                    delete payload.exp
                    const newToken = JWT.sign({
                        name: payload.name,
                        id: payload.google_id,
                        id: payload.id
                    }, 'secretKey1', {
                        expiresIn: "5000"
                    })
                    req.headers['authorization'] = `Bearer ${newToken}`
                }
            })
            next();

        } catch (error) {
            res.sendStatus(403);
        }
    }
    else {
        res.sendStatus(403);
    }
}

router.post('/registration', async (request, response) => {
    try {
        response.contentType('application/json')
        const isDBPathExists = await db.exists('/users')
        if (isDBPathExists) {
            const matchedUser = await db.find('/users', (entry) => {
                return entry.email === request.body.email
            })
            if (matchedUser) {
                response.status(405)
                return response.json({ success: false, error: { message: 'User with such email already exists!' } })
            }
        }
        const newUser = { ...request.body, id: crypto.randomBytes(8).toString('hex') }
        await db.push(
            "/users",
            [newUser],
            false
        );
        delete newUser.password
        delete newUser.email
        const token = JWT.sign(newUser, 'secretKey1', {
            expiresIn: "2d"
        })
        return response.json({ success: true, token })
    }
    catch (error) {
        return response.status(500).json({ success: false, error })
    }

})

router.post('/login', async (request, response) => {
    if (!request.body.login || !request.body.password) {
        return response.status(403).json({ success: false, error: { message: 'Credentials are not provided' } })
    }
    try {
        response.contentType('application/json')
        const isDBPathExists = await db.exists('/users')
        if (!isDBPathExists) {
            return response.status(402).json({ success: false, error: { message: 'No user records found!' } })
        }

        const matchedUser = await db.find('/users', (entry) => {

            return entry.email === request.body.login
        })
        if (!matchedUser) {
            response.status(403)
            return response.json({ success: false, error: { message: 'Password or email invalid' } })
        }
        const passwordCheck = await bcrypt.compare(request.body.password, matchedUser.password)
        if (!passwordCheck) {
            response.status(403)
            return response.json({ success: false, error: { message: 'Password or email invalid' } })
        }

        const payload = {
            name: matchedUser.name,
            id: matchedUser.id
        }
        const token = JWT.sign(payload, 'secretKey1', {
            expiresIn: '5000'
        })

        return response.json({ success: true, token })

    }
    catch (error) {
        return response.status(500).json({ success: false, error })
    }

})

router.post('/googlelogin', async (request, response) => {
    if (!request.body.google_id || !request.body.name || !request.body.email) {
        return response.status(403).json({ success: false, error: { message: 'Credentials are not provided' } })
    }
    try {
        response.contentType('application/json')
        const isDBPathExists = await db.exists('/users')
        if (!isDBPathExists) {
            return response.status(402).json({ success: false, error: { message: 'No user records found!' } })
        }

        const newUser = { ...request.body }
        const matchedUser = await db.find('/users', (entry) => {

            return entry.google_id === newUser.google_id
        })
        if (!matchedUser) {
            await db.push(
                "/users",
                [newUser],
                false
            );
        }
        const token = JWT.sign(newUser, 'secretKey1', {
            expiresIn: "5000"
        })

        return response.json({ success: true, token })
    }
    catch (error) {
        return response.status(500).json({ success: false, error })
    }
})

router.get('/data', verifyToken, async (req, res) => {
    try {
        const data = await db.getData("/data");
        const newToken = req.headers['authorization']
        res.contentType('application/json')
        res.json({ data, newToken })
        return res
    }
    catch (error) {
        return res.status(500).json({ error })
    }
})

export default router

// router.get('/users', async (req, res) => {
//     const data = await db.getData(
//         'users'
//     )


//     try {
//         res.contentType('application/json')
//         res.json(data)

//         return res
//     }
//     catch (error) {
//         console.log(error)
//         return res.status(500).json({ error })
//     }

// })