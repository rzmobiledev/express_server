import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import {NextFunction, Request, Response } from 'express';
import { ErrorMsgEnum, PasswordEnum, SuccessMsgEnum } from './enum';
import * as types from './type';
import { Model } from 'sequelize';

dotenv.config();

const User = require("../models").User;
const Level = require("../models").AuthLevel;
const Article = require('../models').Article;
const Tag = require('../models').Tag;
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

    public async decodeJWTToken(): Promise<string|object> {
        return await jwt.verify(this.key, PasswordEnum.SECRET_KEY, (err: types.jwtErrorType, decoded: types.decodedKeyParamsType) => {
            if(err) throw(ErrorMsgEnum.TOKEN_EXPIRED)
            console.log(decoded)
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
    const encoded_token: types.JWTType = { email: token, level: 1 }
    const decodeToken = new EncodeDecodeJWTToken(encoded_token);

    try{
        await decodeToken.decodeJWTToken();
        next();
    } catch(err){
        res.status(401).json({message: err});
    }
}

export async function checkEmailifExists(email: string): Promise<boolean> { 
    const userExists = await User.findOne({
        where: {email: email}
           
        });
    return Boolean(userExists)
    
}

export async function checkLevelifExists(id: number): Promise<boolean> { 
    const userExists = await Level.findOne({
        where: {id: id}
           
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
        const data_to_encode: types.JWTType = { email: email, level: userExists.dataValues?.role}

        const isMatched = isPasswordMatched(password, hashed_password);
        if(!isMatched) return res.status(400).json({message: ErrorMsgEnum.COMPARING_PASSWDERROR});
        const token = encodedUserPassword(data_to_encode);
        return res.status(200).json(token);
        
    } else return res.status(400).send({message: ErrorMsgEnum.UNAUTHORIZED});
}

function isPasswordMatched(raw_password: string, hashed_password: string): boolean{
    let isMatched: boolean = false
    bcrypt.compare(raw_password, hashed_password, (err, result) => {
       if(result) isMatched = true;
    });
    return isMatched
}

function encodedUserPassword(payload: types.JWTType){
    const encode_token = new EncodeDecodeJWTToken(payload);
    const token = encode_token.generateJWTToken(30);
    return token;
}

export function errorResHandler(res: Response, error: any): Response {
    if('errors' in error) return res.status(400).send({message: ErrorMsgEnum.SOFT_DELETED_DETECT});
    return res.status(400).send({message: ErrorMsgEnum.URL_NOT_EXISTS});
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
        return this.res.status(400).send({message: ErrorMsgEnum.UNKNOWN_ERROR});
    }
    get_404_articleNotFound(): Response {
        return this.res.status(404).json({message: ErrorMsgEnum.ARTICLE_NOT_FOUND});
    }
    get_404_categoryNotFound(): Response {
        return this.res.status(404).json({message: ErrorMsgEnum.CATEGORY_NOT_FOUND});
    }
    get_404_userNotFound(): Response {
        return this.res.status(404).json({message: ErrorMsgEnum.ID_NOT_FOUND});
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
    get_201_userResObject(userObject: UserResponseObject): Response {
        return this.res.status(201).json(userObject)
    }
    get_201_passwordUpdated(): Response {
        return this.res.status(201).json({message: SuccessMsgEnum.PASSWORD_UPDATED})
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

export class ArticlesBodyParams implements types.ArticleFieldNoIdType {
    readonly userId: number;
    readonly categoryId: number;
    readonly title: string;
    readonly subtitle: string;
    readonly description: string;
    readonly tags: types.TagObject[];
    
    constructor(req: Request){
        this.userId = req.body.userId;
        this.categoryId = req.body.categoryId;
        this.title = req.body.title;
        this.subtitle = req.body.subtitle;
        this.description = req.body.description;
        this.tags = req.body.tags;
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

export async function createUpdateArticleTags(tagObject: types.TagObject[], article: typeof Article){
        const isTagExist = tagObject.length > 0;
        if(isTagExist){ 
            for(const tagName of tagObject){
                const [tag, created] = await Tag.findOrCreate({
                    where: { name: tagName.name }
                });
                article.addTag(tag);
            }
        }
}

export function assignIdToTagsObject(articleTags: types.TagObject[], payload: types.ArticleFieldNoIdNoRoType): 
types.TagObject[]{

    const tagObjects = new Array();
    const isTagExist = payload.tags.length > 0;

    if(isTagExist){
        for(let i=0; i < payload.tags.length; i++){
            const new_articleTags = new ArticleTags(
                articleTags[i]?.id ?? undefined, 
                payload.tags[i].name,
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