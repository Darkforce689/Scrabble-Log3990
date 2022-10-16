/* eslint-disable no-underscore-dangle */
import { USER_COLLECTION } from '@app/constants';
import { MongoDBClientService } from '@app/database/mongodb-client.service';
import { ObjectCrudResult } from '@app/database/object-crud-result.interface';
import { ServerLogger } from '@app/logger/logger';
import { UserCreation } from '@app/user/interfaces/user-creation.interface';
import { User } from '@app/user/interfaces/user.interface';
import { UserQuery } from '@app/user/user-query.interface';
import { ObjectId } from 'mongodb';
import { Service } from 'typedi';

export enum UserCreationError {
    NameAlreadyTaken = 'NAME_ALREADY_TAKEN',
    EmailAlreadyTaken = 'EMAIL_ALREADY_TAKEN',
}
@Service()
export class UserService {
    constructor(private mongoService: MongoDBClientService) {}

    private get collection() {
        return this.mongoService.db.collection(USER_COLLECTION);
    }

    async createUser(userCreation: UserCreation): Promise<ObjectCrudResult<User>> {
        const errors = [];
        if (await this.isEmailExists(userCreation.email)) {
            errors.push(UserCreationError.EmailAlreadyTaken);
        }

        if (await this.isNameExists(userCreation.name)) {
            errors.push(UserCreationError.NameAlreadyTaken);
        }

        if (errors.length > 0) {
            return {
                errors,
                object: undefined,
            };
        }

        try {
            await this.collection.insertOne(userCreation);
            return {
                errors,
                object: userCreation as User,
            };
        } catch (error) {
            ServerLogger.logError(error);
            return {
                errors: ['UNEXPECTED_ERROR'],
                object: undefined,
            };
        }
    }

    async getUser(query: UserQuery): Promise<User | undefined> {
        // To prevent error when reusing queries multiple times
        const queryClone = {
            ...query,
        };
        const { _id: userId } = queryClone;
        if (!(userId instanceof ObjectId) && userId !== undefined) {
            queryClone._id = new ObjectId(userId);
        }
        const result = await this.collection.findOne(queryClone);
        const user = (result ?? undefined) as User | undefined;
        if (user !== undefined) {
            user._id = user._id.toString();
        }
        return user;
    }

    async updateName(query: UserQuery, userId: string): Promise<string[]> {
        const errors = [];
        try {
            const { name } = query;
            if (!name) {
                throw Error('Name undefined');
            }

            if (await this.isNameExists(name)) {
                errors.push(UserCreationError.NameAlreadyTaken);
            }

            if (errors.length > 0) {
                return errors;
            }

            query._id = new ObjectId(userId);
            if (!this.collection.find({ _id: query._id })) {
                throw Error('No user found.');
            }
            this.collection.updateOne({ _id: query._id }, { $set: { name } });
        } catch (error) {
            ServerLogger.logError(error);
            return ['UNEXPECTED_ERROR'];
        }
        return [];
    }

    async updateAvatar(query: UserQuery, userId: string): Promise<string[]> {
        try {
            const { avatar } = query;
            query._id = new ObjectId(userId);
            if (!this.collection.find({ _id: query._id })) {
                throw Error('No user found.');
            }
            this.collection.updateOne({ _id: query._id }, { $set: { avatar } });
        } catch (error) {
            ServerLogger.logError(error);
            return ['UNEXPECTED_ERROR'];
        }
        return [];
    }

    private async isEmailExists(email: string) {
        const result = await this.collection.findOne({ email: { $eq: email } });
        return result !== null;
    }

    private async isNameExists(name: string) {
        const result = await this.collection.findOne({ name: { $eq: name } });
        return result !== null;
    }
}
