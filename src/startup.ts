import {prisma} from "./prisma";
import {logger} from "./logger";
import bcrypt from "bcrypt";

export const startup = async () => {
    const account = await prisma.account.findUnique({
        where: {
            id: 1,
            username: 'root'
        },
    });
    if (!account) {
        const admin: 0 | 1 = 1;
        const username: string = 'root';
        const password: string = await bcrypt.hash('root', 10);
        await prisma.account.create({
            data: {
                username,
                password,
                admin,
            },
        });
        logger.info('Root has been created');
    }
}
