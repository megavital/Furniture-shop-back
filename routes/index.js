import { Router } from 'express'
import { _data } from '../_mock_data.js'
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig.js'

const db = new JsonDB(new Config("ReactPtojectDB", true, false, '/'));
const router = Router()

router.get('/', async (req, res) => {
    await db.push(
        "/users",
        [{
            login: 'Test',
            pass: '$Hash'
        }],
        true
        );
    const data = await db.getData("/");
    try {
        res.contentType('application/json')
        res.json(data)
        return res
    }
    catch(error) {
        console.log(error)
        return res.status(500).json({error})
    }
    
})

router.get('/data', async (req, res) => {
    try {
        res.contentType('application/json')
        res.json(_data)
        return res
    }
    catch(error) {
        console.log(error)
        return res.status(500).json({error})
    }
})

export default router