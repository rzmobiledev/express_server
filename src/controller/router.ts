require('dotenv').config();
import express, {Request} from 'express';
import { verifyJWTToken, cacheAllArticlesMiddleware, cacheOneArticleMiddleware } from '../utils/utils';
const UserRoutes = require('./users');
const LevelRoutes = require('./authlevels');
const Articles = require('./articles');
const Categories = require('./categories');
const Galleries = require('./galleries');
const router = express.Router();

const fs = require("fs")
const YAML = require('yaml')
let file  = fs.readFileSync(require.resolve('../utils/swagger.yaml'), {encoding: 'utf8'});
const swaggerDocument = YAML.parse(file)
const swaggerUi = require('swagger-ui-express');
const port: number = Number(process.env.HOST_PORT)


// importing controller`
router.post('/users/login', UserRoutes.login);
router.get('/users', verifyJWTToken, UserRoutes.listUser);
router.get('/users/all', verifyJWTToken, UserRoutes.listSoftDeletedUser);
router.get('/users/:id', verifyJWTToken, UserRoutes.getUser);
router.post('/users', verifyJWTToken, UserRoutes.addUser);
router.put('/users/:id', verifyJWTToken, UserRoutes.changeUserProfile);
router.put('/users/:id/password', verifyJWTToken, UserRoutes.changePassword);
router.put('/users/assignlevel/:id', verifyJWTToken, UserRoutes.assignUserLevel);
router.delete('/users/:id', verifyJWTToken, UserRoutes.softDeleteUser);
router.delete('/users/user/:id', verifyJWTToken, UserRoutes.hardDeleteUser);

router.get('/levelauth', verifyJWTToken, LevelRoutes.getAllLevelsAccess);
router.get('/levelauth/:id', verifyJWTToken, LevelRoutes.getOneLevelAccess);
router.post('/levelauth', verifyJWTToken, LevelRoutes.createLevelAccessUser);
router.put('/levelauth/:id', verifyJWTToken, LevelRoutes.editLevelAccess);
router.delete('/levelauth/:id', verifyJWTToken, LevelRoutes.removeLevelAccess);

router.post('/article', verifyJWTToken, Articles.createNewArticle);
router.put('/article/:id', verifyJWTToken, Articles.updateArticle);
router.get('/article', cacheAllArticlesMiddleware, Articles.getAllArticles);
router.get('/article/:id', cacheOneArticleMiddleware, Articles.getOneArticle);
router.delete('/article/:id', verifyJWTToken, Articles.deleteArticle);

router.post('/category', verifyJWTToken, Categories.createCategory);
router.get('/category/:id', Categories.getCategById);
router.get('/category', Categories.getAllCategories);
router.put('/category/:id', verifyJWTToken, Categories.updateCategory);
router.delete('/category/:id', verifyJWTToken, Categories.deleteCategory);

router.post('/gallery', verifyJWTToken, Galleries.uploadGallery);
router.get('/gallery', verifyJWTToken, Galleries.showAllGallery);
router.delete('/gallery', verifyJWTToken, Galleries.deleteAllGallery);
router.delete('/gallery/:id', verifyJWTToken, Galleries.deleteOneGallery);
router.get('/gallery/:id', Galleries.showGalleryByID);

router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument));

export default router;