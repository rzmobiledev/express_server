import express from 'express';
const UserRoutes = require('./users');
const LevelRoutes = require('./authlevels');
const Articles = require('./articles');

const router = express.Router();

// importing controller`
router.get('/users', UserRoutes.listUser);
router.get('/users/:id', UserRoutes.getUser);
router.post('/users', UserRoutes.addUser);
router.put('/users/:id', UserRoutes.changeUserProfile);
router.put('/users/:id/password', UserRoutes.changePassword);
router.delete('/users/:id', UserRoutes.softDeleteUser);

router.get('/levelauth', LevelRoutes.getAllLevelsAccess);
router.get('/levelauth/:id', LevelRoutes.getOneLevelAccess);
router.post('/levelauth', LevelRoutes.createLevelAccessUser);
router.put('/levelauth/:id', LevelRoutes.editLevelAccess);
router.delete('/levelauth/:id', LevelRoutes.removeLevelAccess);

router.post('/article', Articles.createNewArticle);

export default router;