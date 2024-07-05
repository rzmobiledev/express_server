import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import {NextFunction, Request, Response } from 'express';
import { ErrorMsgEnum, PasswordEnum } from './enum';
import { jwtErrorType, decodedKeyParamsType, UserBodyInterface} from './type';
import { Op } from '@sequelize/core'

dotenv.config();

const User = require("../models").User;
const jwt = require("jsonwebtoken");


export class UserBodyParams implements UserBodyInterface{
    private userId: string;
    private email: string;
    private firstName: string;
    private lastName: string;
    private username: string;
    private password: string;
    private role: number;
    private active: boolean;

    constructor(req: Request, role: number = 3, active: boolean = false){
        this.userId = req.params.id;
        this.email = req.body.email;
        this.firstName = req.body.firstName;
        this.lastName = req.body.lastName;
        this.username = req.body.username;
        this.password = req.body.password;
        this.role = role;
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
        return await jwt.verify(this.key, PasswordEnum.SECRET_KEY, (err: jwtErrorType, decoded: decodedKeyParamsType) => {
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

export function isAllUserFieldsSatisfied(firstName: string, lastName: string, email: string, password: string): boolean {
    if(firstName && lastName && email && password) {
        return true;
    }
    return false;
}