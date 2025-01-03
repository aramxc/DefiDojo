import { Router, Request, Response } from 'express';
import { UserController } from '../controllers/user.controller';

const router = Router();
const userController = new UserController();

router.post('/', (req: Request, res: Response) => {
    try {
        userController.createUser(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create user' });
    }
});

export default router;