import express from 'express';
const UserRoutes = require("./users");

const router = express.Router();

// importing controller`
router.get('/users', UserRoutes.listUser);
router.get('/users/:id', UserRoutes.getUser);
router.post('/users', UserRoutes.addUser);
router.put('/users/:id', UserRoutes.changeUserProfile);
router.put('/users/:id/password', UserRoutes.changePassword);
router.delete('/users/:id', UserRoutes.softDeleteUser);


export default router;