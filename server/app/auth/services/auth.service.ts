import { UserCredentials } from '@app/auth/user-credentials.interface';
import { USER_CREDS_COLLECTION } from '@app/constants';
import { MongoDBClientService } from '@app/database/mongodb-client.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ObjectId } from 'mongodb';
import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { Service } from 'typedi';

interface Session {
    userId: string;
}

@Service()
export class AuthService {
    constructor(private mongoService: MongoDBClientService) {}

    private get collection() {
        return this.mongoService.db.collection(USER_CREDS_COLLECTION);
    }
    // TODO add validation for crash ?
    async addCredentialsToUser(userdId: string, credentials: UserCredentials) {
        const result = await this.collection.insertOne({ ...credentials, _id: new ObjectId(userdId) });
        return result.insertedId.toString();
    }

    // TODO: add object login result
    async validateCredentials(userCredentials: UserCredentials) {
        const actualCredentials = await this.getUserCredentials(userCredentials.email);
        if (!actualCredentials) {
            return false;
        }
        return actualCredentials.password === userCredentials.password;
    }

    async getUserCredentials(userEmail: string) {
        const [userCredentials] = await this.collection.find({ email: userEmail }).project({ _id: 0 }).toArray();
        return userCredentials;
    }

    get authGuard() {
        return (req: Request, res: Response, next: NextFunction): void => {
            const session = req.session as unknown as { userId: string };
            if (session.userId === undefined) {
                res.sendStatus(StatusCodes.UNAUTHORIZED);
                return;
            }
            next();
        };
    }

    get socketAuthGuard() {
        return (socket: Socket, next: (err?: ExtendedError | undefined) => void) => {
            const session = (socket.request as unknown as { session: Session }).session;
            console.log('socket connection from userId:', session.userId);
            if (session.userId === undefined) {
                next(new Error('Unauthorized'));
                return;
            }
            next();
        };
    }
}
