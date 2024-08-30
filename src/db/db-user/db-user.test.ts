import express from "express";
import {router} from "../../router";
import request from "supertest";
import {prisma} from "../../prisma";
import {Account, User} from "@prisma/client";

const app = express();
app.use(express.json());
app.use('/api', router);

const random: number = Math.floor(Math.random() * 100 * 100 * 100 * 100);

describe('db-user', () => {
    test('e2e', async () => {

        // get security-account
        const root = (await prisma.account.findUnique({
            where: {
                id: 1
            },
        })) as Account;
        expect(root).toBeDefined();

        // get token by credentials
        const responseWithRootToken = await request(app)
            .post('/api/security')
            .send({
                username: 'root',
                password: 'root',
            })
            .expect('Content-Type', /json/)
            .expect(200);
        expect(responseWithRootToken.body.token).toBeDefined();
        expect(responseWithRootToken.body.account.id).toBe(1);
        const token = responseWithRootToken.body.token;
        const headers = {'Authorization': `Bearer ${token}`}

        // create test entity
        const responseWithNewEntity = await request(app)
            .post('/api/db/user')
            .set(headers)
            .send({
                name: random.toString(),
            })
            .expect('Content-Type', /json/)
            .expect(200)
        expect(responseWithNewEntity.body.name).toBe(random.toString());
        const user: User = responseWithNewEntity.body;

        // find all
        const response3 = await request(app)
            .get('/api/db/user')
            .set(headers)
            .expect('Content-Type', /json/)
            .expect(200)
        expect(response3.body.length).toBeGreaterThan(1);

        // find test entity
        const response4 = await request(app)
            .get('/api/db/user')
            .query({
                id: user.id,
            })
            .set(headers)
            .expect('Content-Type', /json/)
            .expect(200)
        expect(response4.body.name).toBe(user.name);

        // update test entity
        const response5 = await request(app)
            .put('/api/db/user')
            .set(headers)
            .send({
                id: user.id,
                title: random.toString(),
            })
            .expect('Content-Type', /json/)
            .expect(200)
        expect(response5.body.title).toBe(random.toString());

        // delete test entity
        const response8 = await request(app)
            .delete('/api/db/user')
            .set(headers)
            .send({
                id: user.id,
            })
            .expect('Content-Type', /json/)
            .expect(200)
        expect(response8.body.deleted).toBe(1);

    });

});