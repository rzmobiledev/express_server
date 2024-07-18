import express from 'express';
import { verifyJWTToken } from '../utils/utils';

const UserRoutes = require('./users');
const LevelRoutes = require('./authlevels');
const Articles = require('./articles');
const Categories = require('./categories');
const Galleries = require('./galleries');
const router = express.Router();

// importing controller`
router.post('/users/login', UserRoutes.login);
router.get('/users', verifyJWTToken, UserRoutes.listUser);
router.get('/users/:id', verifyJWTToken, UserRoutes.getUser);
router.post('/users', verifyJWTToken, UserRoutes.addUser);
router.put('/users/:id', verifyJWTToken, UserRoutes.changeUserProfile);
router.put('/users/:id/password', verifyJWTToken, UserRoutes.changePassword);
router.delete('/users/:id', verifyJWTToken, UserRoutes.softDeleteUser);
router.delete('/users/user/:id', verifyJWTToken, UserRoutes.hardDeleteUser);

router.get('/levelauth', verifyJWTToken, LevelRoutes.getAllLevelsAccess);
router.get('/levelauth/:id', verifyJWTToken, LevelRoutes.getOneLevelAccess);
router.post('/levelauth', verifyJWTToken, LevelRoutes.createLevelAccessUser);
router.put('/levelauth/:id', verifyJWTToken, LevelRoutes.editLevelAccess);
router.delete('/levelauth/:id', verifyJWTToken, LevelRoutes.removeLevelAccess);

router.post('/article', verifyJWTToken, Articles.createNewArticle);
router.put('/article/:id', verifyJWTToken, Articles.updateArticle);
router.get('/article', verifyJWTToken, Articles.getAllArticles);
router.get('/article/:id', verifyJWTToken, Articles.getOneArticle);
router.delete('/article/:id', verifyJWTToken, Articles.deleteArticle);

router.post('/category', verifyJWTToken, Categories.createCategory);
router.get('/category/:id', verifyJWTToken, Categories.getCategById);
router.get('/category', verifyJWTToken, Categories.getAllCategories);
router.put('/category/:id', verifyJWTToken, Categories.updateCategory);
router.delete('/category/:id', verifyJWTToken, Categories.deleteCategory);

router.post('/gallery', verifyJWTToken, Galleries.uploadGallery);
router.get('/gallery', verifyJWTToken, Galleries.showAllGallery);
router.delete('/gallery', verifyJWTToken, Galleries.deleteAllGallery);
router.delete('/gallery/:id', verifyJWTToken, Galleries.deleteOneGallery);
router.get('/gallery/:id', verifyJWTToken, Galleries.showGalleryByID);

export default router;