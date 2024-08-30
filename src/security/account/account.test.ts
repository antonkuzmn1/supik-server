import express from "express";
import {router} from "../../router";
import request from "supertest";
import {prisma} from "../../prisma";
import {Account} from "@prisma/client";

const app = express();
app.use(express.json());
app.use('/api', router);

const random: number = Math.floor(Math.random() * 100 * 100 * 100 * 100);

describe('account', () => {
    test('e2e', async () => {

        // get account
        const root = (await prisma.account.findUnique({
            where: {
                id: 1
            },
        })) as Account;
        expect(root).toBeDefined();

        // get token by credentials
        const response = await request(app)
            .post('/api/security')
            .send({
                username: 'root',
                password: 'root',
            })
            .expect('Content-Type', /json/)
            .expect(200);
        expect(response.body.token).toBeDefined();
        expect(response.body.account.id).toBe(1);
        const token = response.body.token;
        const headers = {'Authorization': `Bearer ${token}`}

        // create test entity
        const response2 = await request(app)
            .post('/api/security/account')
            .set(headers)
            .send({
                username: random.toString(),
                password: random.toString(),
                fullname: random.toString(),
            })
            .expect('Content-Type', /json/)
            .expect(200)
        expect(response2.body.username).toBe(random.toString());

        // find all
        const response3 = await request(app)
            .get('/api/security/account')
            .set(headers)
            .expect('Content-Type', /json/)
            .expect(200)
        expect(response3.body.length).toBeGreaterThan(1);

        // find test entity
        const response4 = await request(app)
            .get('/api/security/account')
            .query({
                id: response2.body.id,
            })
            .set(headers)
            .expect('Content-Type', /json/)
            .expect(200)
        expect(response4.body.username).toBe(response2.body.username);

        // update test entity
        const response5 = await request(app)
            .put('/api/security/account')
            .set(headers)
            .send({
                id: response4.body.id,
                title: random.toString(),
            })
            .expect('Content-Type', /json/)
            .expect(200)
        expect(response5.body.title).toBe(random.toString());

        // delete test entity
        const response8 = await request(app)
            .delete('/api/security/account')
            .set(headers)
            .send({
                id: response5.body.id,
            })
            .expect('Content-Type', /json/)
            .expect(200)
        expect(response8.body.deleted).toBe(1);

    });

});
