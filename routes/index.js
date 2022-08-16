import { Router } from 'express'
import { _data } from '../_mock_data.js'
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig.js'
import JWT from 'jsonwebtoken'
import crypto from 'crypto'

const db = new JsonDB(new Config("ReactProjectDB", true, true, '/'));
const router = Router()



router.post('/registration', async (request, response) => {
    try {
        response.contentType('application/json')
        const isDBPathExists = await db.exists('/users')
        if (isDBPathExists) {
            const matchedUser = await db.find('/users', (entry) => {
                return entry.email === request.body.email || entry.name === request.body.name
            })
            if (matchedUser) {
                response.status(405)
                return response.json({ success: false })
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
            expiresIn: "2 days"
        })
        return response.json({ success: true, token })
    }
    catch (error) {
        console.log(error)
        return response.status(500).json({ success: false, error })
    }

})

router.get('/regist', async (req, res) => {
    try {

        const data = await db.getData("/regist");
        res.contentType('application/json')
        res.json(data)
        return res
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ error })
    }
})
router.get('/data', async (req, res) => {
    try {

        const data = await db.getData("/data");
        res.contentType('application/json')
        res.json(data)
        return res
    }
    catch (error) {
        console.log(error)
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