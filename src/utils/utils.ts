import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import {NextFunction, Request, Response } from 'express';
import { ErrorMsgEnum, PasswordEnum, SuccessMsgEnum } from './enum';
import * as types from './type';

dotenv.config();

const User = require("../models").User;
const Level = require("../models").AuthLevel;
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
    private key: string;

    constructor(key: string){
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
            return decoded.key;
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
    
    const decodeToken = new EncodeDecodeJWTToken(token);

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
        if('errors' in err) return this.res.status(400).send({message: ErrorMsgEnum.SOFT_DELETED_DETECT});
        return this.res.status(400).send({message: ErrorMsgEnum.UNKNOWN_ERROR});
    }
    get_404_userNotFound(): Response {
        return this.res.status(404).json({message: ErrorMsgEnum.USER_NOT_FOUND});
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

export class Articles implements types.ArticleFieldType, types.ArticleMethodType {

    id: number;
    userId: number;
    title: string;
    subtitle: string;
    description: string;
    readonly tags: types.TagObject[];

    constructor(id: number, userId: number, title: string, subtitle: string, description: string, tags: types.TagObject[]){
        this.id = id;
        this.userId = userId;
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
    readonly title: string;
    readonly subtitle: string;
    readonly description: string;
    readonly tags: types.TagObject[];
    
    constructor(req: Request){
        this.userId = req.body.userId;
        this.title = req.body.title;
        this.subtitle = req.body.subtitle;
        this.description = req.body.description;
        this.tags = req.body.tags;
    }
}

export class ArticleTags implements types.ArticleTagsType {
    
    readonly id: number;
    readonly name: string;

    constructor(id: number, name: string){
        this.id = id;
        this.name = name;
    }
}
