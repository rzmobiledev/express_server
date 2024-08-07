const fs = require('fs');
import Redis from 'ioredis';
import amqplib, { Channel, Connection } from 'amqplib';
const { mkdir, unlink } = require('node:fs/promises');
const path = require('path');
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import {NextFunction, Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { ErrorMsgEnum, PasswordEnum, SuccessMsgEnum, UserLevelEnum, ArticleEnum, RedisName } from './enum';
import * as types from './type';


dotenv.config();

export const redis = new Redis(
    Number(process.env.REDIS_PORT),
    String(process.env.REDIS_HOST),
    {
        password: String(process.env.REDIS_PASSWORD)
    }
);

// rabbitmq to be global variables
export let channel: Channel, connection: Connection
const User = require("../models").User;
const Level = require("../models").AuthLevel;
const Article = require('../models').Article;
const Category = require('../models').Category;
const Tag = require('../models').Tag;
const ArticleTag = require('../models').ArticleTag;
const Gallery = require('../models').Gallery;
const jwt = require("jsonwebtoken");

export class UserResponseObject implements types.UserObjNoPasswordType{
    readonly id: number;
    readonly email: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly username: string;
    readonly role: number;
    readonly active: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly Authlevel: number;

    constructor(user: typeof User){
        this.id = user.id;
        this.email = user.email;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.username = user.username;
        this.role = user.role;
        this.active = user.active;
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
        this.Authlevel = user.AuthLevel;
    }  
    
}

export class UserBodyParams implements types.UserBodyInterface{
    private userId: string;
    private email: string;
    private firstName: string;
    private lastName: string;
    private username: string;
    private password: string;
    private role: number;
    private active: boolean;

    constructor(req: Request, active: boolean = false){
        this.userId = req.params.id;
        this.email = req.body.email;
        this.firstName = req.body.firstName;
        this.lastName = req.body.lastName;
        this.username = req.body.username;
        this.password = req.body.password;
        this.role = req.body.role;
        this.active = active;
    }

    json(): object {
        return {
            userId: this.getUserId,
            email: this.getEmail,
            firstName: this.getFirstName,
            lastName: this.getLastName,
            username: this.getUsername,
            role: this.getRole,
            active: this.getActive
        };
    }
    getUserId(): string {
        return this.userId;
    }
    getEmail(): string {
        return this.email;
    }
    getFirstName(): string {
        return this.firstName
    }
    getLastName(): string {
        return this.lastName;
    }
    getUsername(): string {
        return this.username;
    }
    getPassword(): string {
        return this.password;
    }
    getRole(): number {
        return this.role;
    }
    getActive(): boolean {
        return this.active
    }
}
export class EncodeDecodeJWTToken {
    private key: types.JWTType;

    constructor(key: types.JWTType){
        this.key = key
    }

    public generateJWTToken(expiresInMins: number){
        return jwt.sign({
            key: this.key
            }, PasswordEnum.SECRET_KEY,
            {
                expiresIn: 60 * expiresInMins,
                algorithm: "HS256"
            }
        )
    }

    public async decodeJWTToken(): Promise<types.DecodedKeyResponseType> {
        return await jwt.verify(this.key.email, PasswordEnum.SECRET_KEY, (err: types.jwtErrorType, decoded: types.decodedKeyParamsType) => {
            if(err) throw(ErrorMsgEnum.TOKEN_EXPIRED)
            return decoded;
        })
    }
}

export function isPasswordLengthSatisfied(myPassword: string): boolean {
    return myPassword.length > PasswordEnum.MIN_PASSWORD_LENGTH;
}

export async function encryptUserPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, PasswordEnum.SALT_GENERATED, (err, hash) => {
            if(err) reject(err);
            resolve(hash);
        });
    });
}

export async function verifyJWTToken(req: Request, res: Response, next: NextFunction){
    const token = req.header("Authorization")?.replace("Bearer ","");
    if(!token) return res.status(403).json({message: ErrorMsgEnum.ACCESS_DENIED});
    const encoded_token: types.JWTType = { id:0, email: token, level: 1 }
    const decodeToken = new EncodeDecodeJWTToken(encoded_token);
    
    try{
        const decodedToken: types.DecodedKeyResponseType = await decodeToken.decodeJWTToken();
        res.locals.auth = decodedToken.key;
        next();
    } catch(err){
        res.status(401).json({message: err});
    }
}

export async function checkEmailifExists(email: string): Promise<boolean> { 
    const userExists = await User.findOne({
        where: {email: email},
        attributes: ['email']
        });
    return Boolean(userExists)
    
}

export async function isCategoryExists(categoryId: number): Promise<boolean> { 
    const categoryExists = await Category.findOne({
        where: {id: categoryId},
        attributes: ['id']
        });
    return Boolean(categoryExists)
    
}

export async function checkLevelifExists(id: number): Promise<boolean> { 
    const userExists = await Level.findOne({
        where: {id: id},
        attributes: ['id']   
        });
    return Boolean(userExists)
    
}

export function isAllUserFieldsSatisfied(firstName: string, lastName: string, email: string, password: string): boolean {
    if(firstName && lastName && email && password) {
        return true;
    }
    return false;
}

export async function compareUserPassword(req: Request, res: Response){
    const { email, password } = req.body;
    const userExists = await User.findOne({ where: {email: email} });
    if(userExists){
        const hashed_password = userExists.dataValues?.password;
        const data_to_encode: types.JWTType = {
            id: userExists.id,
            email: email, 
            level: userExists.dataValues?.role,
        }

        bcrypt.compare(password, hashed_password, (err, result) => {
            if(err) return res.status(400).send({message: ErrorMsgEnum.COMPARING_PASSWDERROR});
            if(result) {
                const token = encodedUserPassword(data_to_encode);
                return res.status(200).json({access: token});
            }
            else {
                return res.status(400).send({message: ErrorMsgEnum.PASSWORD_NOT_MATCH})
            }
        });
        
    } else return res.status(400).send({message: ErrorMsgEnum.UNAUTHORIZED});
}

function encodedUserPassword(payload: types.JWTType): string{
    const encode_token = new EncodeDecodeJWTToken(payload);
    const token = encode_token.generateJWTToken(120);
    return token;
}

export class ErrResHandler implements types.ErrorType{
    private res: Response;

    constructor(res: Response){
        this.res = res
    }

    get_globalError(err: any): Response {
        const error = 'errors';
        const name = 'name';
        const isForeignKeyError: boolean = name in err && err.name === 'SequelizeForeignKeyConstraintError';
        if(error in err) return this.res.status(400).send({message: ErrorMsgEnum.SOFT_DELETED_DETECT});
        else if(isForeignKeyError) return this.res.status(400).send({message: err.parent.detail});
        else if(err instanceof multer.MulterError) return this.res.status(400).send({message: err.message});
        return this.res.status(400).send({message: ErrorMsgEnum.UNKNOWN_ERROR});
    }
    get_404_articleNotFound(): Response {
        return this.res.status(404).json({message: ErrorMsgEnum.ARTICLE_NOT_FOUND});
    }
    get_404_categoryNotFound(): Response {
        return this.res.status(404).json({message: ErrorMsgEnum.CATEGORY_NOT_FOUND});
    }
    get_404_fileNotFound(): Response {
        return this.res.status(404).json({message: ErrorMsgEnum.NO_FILE_FOUND});
    }
    get_404_userNotFound(): Response {
        return this.res.status(404).json({message: ErrorMsgEnum.ID_NOT_FOUND});
    }
    get_404_galleryNotFound(): Response {
        return this.res.status(404).json({message: ErrorMsgEnum.GALLERY_NOT_FOUND});
    }
    get_404_levelNotFound(): Response {
        return this.res.status(404).json({message: ErrorMsgEnum.LEVEL_NOT_FOUND});
    }
    get_400_fieldNotEmpty(): Response {
        return this.res.status(400).send({message: ErrorMsgEnum.FIELD_SHOULDNOT_EMPTY});
    }
    get_401_emailExist(): Response {
        return this.res.status(401).send({message: ErrorMsgEnum.EMAIL_ALREADY_REGISTERED});
    }
    get_401_levelExists(): Response {
        return this.res.status(401).send({message: ErrorMsgEnum.LEVEL_EXISTS});
    }
    get_401_unAuthorized(): Response {
        return this.res.status(401).send({message: ErrorMsgEnum.UNAUTHORIZED});
    }
    get_401_onlySuperUser(): Response {
        return this.res.status(401).send({message: ErrorMsgEnum.SUPERUSER_ONLY});
    }
    get_401_galleryCantBeDeleted(): Response {
        return this.res.status(401).send({message: ErrorMsgEnum.GALLERY_CANTBE_DELETED});
    }
    get_404_roleNotFound(): Response {
        return this.res.status(405).send({message: ErrorMsgEnum.ROLE_NOT_FOUND})
    }
    get_405_passwdEmpty(): Response {
        return this.res.status(405).send({message: ErrorMsgEnum.PASSWORD_EMPTY})
    }
}

export class UserSuccessResHandler implements types.UserSuccessType {

    private res: Response;

    constructor(res: Response){
        this.res = res
    }

    get_200_userDeleted(): Response {
        return this.res.status(200).json({message: SuccessMsgEnum.USER_DELETED})
    }
    get_200_userResObject(userObject: UserResponseObject): Response {
        return this.res.status(201).json(userObject);
    }
    get_200_passwordUpdated(): Response {
        return this.res.status(200).json({message: SuccessMsgEnum.PASSWORD_UPDATED})
    }
    get_201_userResObject(userObject: UserResponseObject): Response {
        return this.res.status(201).json(userObject)
    }
     
}

export class ArticleSuccessResHandler implements types.ArticleSuccessType {

    private res: Response;

    constructor(res: Response){
        this.res = res
    }

    get_200_articleDeleted(): Response {
        return this.res.status(200).json({message: SuccessMsgEnum.ARTICLE_DELETED})
    }

    get_201_articleCreated(): Response {
        return this.res.status(200).json({message: SuccessMsgEnum.ARTICLE_CREATED})
    }
}

export class LevelSuccessResHandler implements types.LevelSuccessType{
    
    private res: Response;

    constructor(res: Response){
        this.res = res
    }

    get_200_levelDeleted(): Response {
        return this.res.status(200).json({message: SuccessMsgEnum.LEVEL_DELETED});
    }
    get_200_levelResObject(levelObject: types.LevelAccessType): Response {
        return this.res.status(200).json(levelObject);
    }
    get_201_levelResObject(levelObject: types.LevelAccessType): Response {
        return this.res.status(201).json(levelObject);
    }

}

export class AuthLevel implements types.LevelAccessType{
    readonly id: number;
    readonly name: string;
    readonly level: number;

    constructor(level: typeof Level){
        this.id = level.id;
        this.name = level.name;
        this.level = level.level;
    }
}

export class Articles implements types.ArticleFieldType, types.ArticleMethodGetType {

    id: number;
    userId: number;
    categoryId: number;
    title: string;
    subtitle: string;
    description: string;
    readonly tags: types.TagObject[];

    constructor(id: number, userId: number, categoryId: number, title: string, subtitle: string, description: string, tags: types.TagObject[]){
        this.id = id;
        this.userId = userId;
        this.categoryId = categoryId;
        this.title = title;
        this.subtitle = subtitle;
        this.description = description;
        this.tags = tags;
    }
    
    getSubtitle(): string {
        return this.subtitle;
    }
    getTags(): types.TagObject[] {
        return this.tags;
    }

    getId(): number {
        return this.id;
    }
    getUserId(): number {
        return this.userId;
    }
    getTitle(): string {
        return this.title;
    }
    getDescription(): string {
        return this.description;
    }
}

export class ArticlesBodyParams implements types.ArticleMethodGetType{
    private id: number;
    private userId: number;
    private categoryId: number;
    private title: string;
    private subtitle: string;
    private description: string;
    private tags: types.TagObject[];
    
    constructor(req: Request){
        this.id = Number(req.params.id);
        this.userId = req.body.userId;
        this.categoryId = req.body.categoryId;
        this.title = req.body.title;
        this.subtitle = req.body.subtitle;
        this.description = req.body.description;
        this.tags = req.body.tags ?? [];
    }

    json(): types.ArticleFieldType {
        return {
            id: this.getId(),
            userId: this.getUserId(),
            categoryId: this.getCategoryId(),
            title: this.getTitle(),
            subtitle: this.getSubtitle(),
            description: this.getDescription(),
            tags: this.getTags(),
        }
    }

    getId(): number {
        return this.id;
    }
    getCategoryId(): number {
        return this.categoryId;
    }
    getUserId(): number {
        return this.userId
    }
    getTitle(): string {
        return this.title;
    }
    getSubtitle(): string {
        return this.subtitle;
    }
    getDescription(): string {
        return this.description;
    }
    getTags(): types.TagObject[] {
        return this.tags;
    }
    setUserId(id: number){
        this.userId = id;
    }
    setCategoryId(id: number){
        this.categoryId = id;
    }
    
}

export class ArticlesObjectResponse{
    private id: number;
    private userId: number;
    private title: string;
    private subtitle: string;
    private description: string;
    private createdAt: Date;
    private updatedAt: Date;
    private tags: types.TagObject[]
    private extraTags: types.TagObject[]

    constructor(req: Request, tags: types.TagObject[], extraTags: types.TagObject[]){
        this.id = Number(req.params.id);
        this.userId = req.body.userId;
        this.title = req.body.title;
        this.subtitle = req.body.subtitle;
        this.description = req.body.description;
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.tags = tags;
        this.extraTags = extraTags;
    }

    json(){
        return {
            id: this.id,
            userId: this.userId,
            title: this.title,
            subtitle: this.subtitle,
            description: this.description,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            tags: this.tags.length > 0 ? this.tags : this.extraTags
        }
    }
}

export class ArticleTags implements types.ArticleTagsType {
    
    readonly id: number;
    readonly name: string;
    readonly createdAt?: Date;
    readonly updatedAt?: Date;

    constructor(id: number, name: string, createdAt: Date | undefined, updatedAt: Date | undefined){
        this.id = id;
        this.name = name;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

export async function createUpdateArticleTags(tagObject: types.TagObjNoId[], article: typeof Article, status: string){
        const isTagExist = tagObject?.length > 0;
        const allTags = []
        if(isTagExist){ 
            for(const tagName of tagObject){
                const [tag, created] = await Tag.findOrCreate({
                    where: { name: tagName }
                });
                allTags.push(tag)
            }
            await article.setTags(allTags)
        }

        await crudArticleInCache(status, article, allTags);
}

export function assignIdToTagsObject(articleTags: types.TagObject[], payload: types.ArticleMethodGetType): 
types.TagObject[]{

    const tagObjects = new Array();
    const isTagExist = payload.getTags().length > 0;

    if(isTagExist){
        for(let i=0; i < payload.getTags().length; i++){
            const new_articleTags = new ArticleTags(
                articleTags[i]?.id ?? undefined, 
                payload.getTags()[i].name,
                articleTags[i]?.createdAt ?? new Date,
                articleTags[i]?.updatedAt ?? new Date
            );
            tagObjects.push(new_articleTags);
        }

    }   
    return tagObjects;
}

export function filterOnlyTagsID(articleTags: types.TagObject[]): number[]{

    const tagsIDs = [];
    for(let i=0; i < articleTags.length; i++){
        tagsIDs.push(articleTags[i].id);
    }
    return tagsIDs;
}

const fileStorage = multer.diskStorage({
    destination: async(
        request: Request,
        file: Express.Multer.File,
        callback: types.DestinationCallback
    ): Promise<void> => {
        const path = 'public/uploads'
        await createFolderIfNotExist(path, callback);
    },

    filename: (
        req: Request,
        file: Express.Multer.File,
        callback: types.FileNameCallback
    ): void => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        callback(null, uniqueSuffix+'-'+file.originalname);
    }
});

const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback
): void => {
    if(
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        callback(null, true);
    } else callback(null, false);
}

export const uploadFile = multer({storage: fileStorage, fileFilter: fileFilter, limits: { fileSize: 500000}});

export async function createFolderIfNotExist(folderName: string, callback: types.DestinationCallback){
    await fs.exists(path.join(folderName), async(exists: boolean) => {
        if(!exists){
            const paths = path.resolve(folderName)
            await mkdir(paths, {recursive: true});
        }
        callback(null, folderName)
    });
}

export function mapImageWithUserId(req: Request, userAccess: types.JWTType): types.MulterResType[] {
    const articleId = req.body?.articleId ?? null;
    const imageFiles: types.MulterResType[] = req.files as Express.Multer.File[];
    
    const imageWithUserID: types.MulterResType[] = imageFiles.map(({filename: name, ...res}) => ({name, ...res, userId: userAccess.id, articleId: articleId}));
    
    return imageWithUserID;
}

export async function deleteFiles(fileName: types.MulterResType[]): Promise<void>{
    const isFileExists = fileName.length > 0;
    const folderPath = 'public/uploads/';
    if(isFileExists){
        for(let i=0; i < fileName.length; i++){
            await unlink(folderPath+fileName[i].name);
        }
    }
}

export function allowAdminAccess(userAccess: types.JWTType): boolean{
    if(
        userAccess.level === UserLevelEnum.SUPERADMIN ||
        userAccess.level === UserLevelEnum.ADMIN
    ) return true;
    return false;
}

export function allowSuperAdminAccess(userAccess: types.JWTType): boolean{
    if(userAccess.level === UserLevelEnum.SUPERADMIN) return true;
    else return false;
}

export function isAssignUserRoleAllowed(req: Request, userAccess: types.JWTType, user: typeof User): boolean {
    const { role } = req.body;
    let allowed: boolean = true

    if(role === UserLevelEnum.SUPERADMIN && userAccess.level === UserLevelEnum.ADMIN){
        allowed = false;
    }
    if(user.role === UserLevelEnum.SUPERADMIN && userAccess.level === UserLevelEnum.ADMIN){
        allowed = false;
    }
    return allowed;
}

export async function isRoleUserExist(role: number): Promise<boolean>{
    const level = await Level.findOne({ where: { level: Number(role)}, attributes: ['level'] });
    if(level != null) return true
    return false
}

export async function deleteImages(imageName: types.GalleryType[]){
    const folderPath = 'public/uploads/'
    const isImageExists: boolean = imageName.length > 0;

    if(isImageExists){
        for(let i=0; i < imageName.length; i++){
            await unlink(folderPath+imageName[i].name)
        }
    }
}

export async function delGalleryByAdmin(gallery: typeof Gallery): Promise<void>{
    await gallery.destroy();
    const format_to_galleryType: types.GalleryType[] = [];
    format_to_galleryType.push(gallery)
    await deleteImages(format_to_galleryType);
}

export async function isGalleryExistAndDeleted(user: types.JWTType, galleryID: number): Promise<boolean>{
    const galleries: types.GalleryType[] = await Gallery.findAll(
        {where: {id: galleryID, userId: user.id}}
    );
    if(galleries.length){
        await Gallery.destroy({where: {id: galleryID}});
        await deleteImages(galleries);
        return true;
    }
    return false;
}

export class Pagination{
    private limit: number;
    private page: number;
    private offset: number;

    constructor(limit: number, req: Request){
        this.limit = limit;
        this.page = this.setPage(req);
        this.offset = this.setOffset();
    }

    private setPage(req: Request){
        /* 
        if article?page=0 then it will return (0)
        if article?page=-1 then it should remains (0) 
        */
        const page = Number(req.query.page)
        return page ? (page <= 0 ? 0 : page - 1) : 0;
    }

    private setOffset(){
        return 0 + (this.page -1) * this.limit;
    }

    getLimit(){
        return this.limit
    }
    getPage(){
        return this.page;
    }
    getOffset(){
        return this.offset;
    }
}

export async function cacheAllArticlesMiddPagination(req: Request, res: Response, next: NextFunction){
    const articlePage = req.query?.page ?? 1;
    const articleInCache = await redis.get(`articles?page=${articlePage}`);
    if(articleInCache) res.status(200).json(JSON.parse(articleInCache));
    else next();
}

export async function cacheAllArticlesMiddleware(req: Request, res: Response, next: NextFunction){
    let limit = 10;
    const pagination = new Pagination(limit, req);

    const articleInCache = await redis.lrange(RedisName.ARTICLES, pagination.getPage(), pagination.getLimit());
    const articleData:any[] = articleInCache.map((data) => JSON.parse(data));
    if(articleData.length === 0 && pagination.getPage() === 0){
        next();
    }
    else res.status(200).json(articleData);
}

export async function cacheOneArticleMiddleware(req: Request, res: Response, next: NextFunction){
    const articleID = Number(req.params?.id);
    const articleInCache = await redis.lrange(RedisName.ARTICLES, 0, -1);
    if(articleInCache.length > 0) {
        const articleArrJson = articleInCache.map((data) => JSON.parse(data));
        const article = articleArrJson.filter((item) => item['id'] === articleID)[0]
        return res.status(200).json(article);
    }
    next()
}

const RabbitSettings = {
    hostname: process.env.RABBITMQ_HOST,
    port: Number(process.env.RABBITMQ_PORT),
    username: process.env.RABBITMQ_DEFAULT_USER,
    password: process.env.RABBITMQ_DEFAULT_PASS,
}

export async function startBrokerChannel() {
  try {
    const amqpServer = `amqp://${RabbitSettings.username}:${RabbitSettings.password}@${RabbitSettings.hostname}`
    connection = await amqplib.connect(amqpServer, {timeout: 3000});
    channel = await connection.createChannel();
  } catch (error) {
    console.log(error);
  }
}

export async function createChannelBroker(channelName: string, data: any){
    await channel.assertQueue(channelName, { durable: true});
    channel.sendToQueue(channelName, Buffer.from(JSON.stringify(data)), {
        persistent: true
    },);
}

export async function consumeBroker(channelName: string, callback: CallableFunction){
    await channel.assertQueue(channelName, { durable: true});
    return await channel.consume(channelName, async(msg) => {
        let message = msg?.content.toString();
        const data = JSON.parse(message!)
        await callback(data);
    }, { noAck: true});
}

export async function createArticle(data: types.ArticleFieldNoIdNoRoType): Promise<void> {
    const article = await Article.build({
        userId: Number(data.userId),
        categoryId: Number(data.categoryId),
        title: data.title,
        subtitle: data.subtitle,  
        description: data.description
    });
    await article.save();
    await createUpdateArticleTags(data.tags, article, ArticleEnum.CREATE);
}

export async function updateArticle(data: types.ArticleFieldType){
    await Article.update(data, { where: { id: data.id}});
    const article = await Article.findByPk(data.id);
    await createUpdateArticleTags(data.tags, article, ArticleEnum.UPDATE);
} 

export async function deleteArticle(article: {id: number}){
    await ArticleTag.destroy({
        where: {articleId: article.id}
    });
    await Article.destroy({
        where: {id: article.id}
    });

    await deleteArticleInCache(article.id)
}

export async function getOneArticle(data: {id: number}){
    return await Article.findByPk(data.id, {
        include: [{
            model: Tag,
            as: 'tags',
        }]
    });
}

async function crudArticleInCache(status: string, article: typeof Article, allTags: typeof Tag[]){
    let articlesForCache = article.toJSON();
    articlesForCache['tags'] = allTags;

    if(status === ArticleEnum.CREATE){
        await redis.lpush(RedisName.ARTICLES, JSON.stringify(articlesForCache));
    }

    else if (status === ArticleEnum.UPDATE){
        await updateArticleInCache(articlesForCache, articlesForCache.id)
    }
}

async function updateArticleInCache(articlesForCache: Object, articleId: number){
    let allCachedArticles = await redis.lrange(RedisName.ARTICLES, 0, -1);
    let articleCachedToJson = allCachedArticles.map((data) => JSON.parse(data));
    let articleIndex = articleCachedToJson.findIndex((item) => item['id'] === articleId)
    const lsetIndex = articleIndex - 1;
    await redis.lset(RedisName.ARTICLES, lsetIndex, JSON.stringify(articlesForCache));
}

async function deleteArticleInCache(articleId: number){
    let allCachedArticlesObj = await redis.lrange(RedisName.ARTICLES, 0, -1);
    let articleCachedToJson = allCachedArticlesObj.map((data) => JSON.parse(data));
    let articleToDelete = articleCachedToJson.filter((item) => item['id'] === articleId)[0]
    await redis.lrem(RedisName.ARTICLES, 1, JSON.stringify(articleToDelete));
}