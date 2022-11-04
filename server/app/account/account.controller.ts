import { ConnectionLog } from '@app/account/user-log/connection-logs.interface';
import { UserLogService } from '@app/account/user-log/user-log.service';
import { Session } from '@app/auth/services/session.interface';
import { Pagination } from '@app/common/interfaces/pagination.interface';
import { parseNumWithDefault } from '@app/common/utils';
import { LOGS_PAGINATION_DEFAULT_PAGE, LOGS_PAGINATION_DEFAULT_PERPAGE } from '@app/constants';
import { User } from '@app/user/interfaces/user.interface';
import { UserService } from '@app/user/user.service';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class AccountController {
    router: Router;
    constructor(private userService: UserService, private userLogService: UserLogService) {
        this.configureRouter();
    }

    private configureRouter() {
        this.router = Router();

        this.router.get('', async (req, res) => {
            const { userId } = req.session as unknown as Session;
            // Safe because of auth middleware
            const user = (await this.userService.getUser({ _id: userId })) as User;
            return res.send(user);
        });

        this.router.get('/logHistory', async (req, res) => {
            const { userId } = req.session as unknown as Session;
            const { perPage, page } = req.query;
            const pagination = this.getLogsPagination(perPage as string | undefined, page as string | undefined);
            const logs = (await this.userLogService.getLogHistory(pagination, userId)) as ConnectionLog[];
            return res.send({ pagination, logs });
        });

        this.router.patch('', async (req, res) => {
            const { userId } = req.session as unknown as Session;
            const errors: string[] = [];
            if (req.body.name) {
                errors.push(...(await this.userService.updateName(req.body, userId)));
                if (errors.length > 0) {
                    res.status(StatusCodes.CONFLICT).send({ errors });
                    return;
                }
            }
            if (req.body.avatar) {
                errors.push(...(await this.userService.updateAvatar(req.body, userId)));
                if (errors.length > 0) {
                    res.status(StatusCodes.BAD_REQUEST);
                    return;
                }
            }
            res.status(StatusCodes.OK).send({ message: 'OK' });
        });
    }

    private getLogsPagination(perPageStr: string | undefined, pageStr: string | undefined): Pagination {
        const perPage = perPageStr === undefined ? LOGS_PAGINATION_DEFAULT_PERPAGE : parseNumWithDefault(perPageStr, LOGS_PAGINATION_DEFAULT_PERPAGE);

        const page = pageStr === undefined ? LOGS_PAGINATION_DEFAULT_PAGE : parseNumWithDefault(pageStr, LOGS_PAGINATION_DEFAULT_PAGE);

        return {
            perPage,
            page,
        };
    }
}
