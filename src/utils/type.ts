import {Response} from 'express';
import { FileFilterCallback } from 'multer';

export function ObjectType<X extends string, T>(url: X, arg: T): T {
    return arg;
}

export type UserObjectType = {
    readonly id: number;
    readonly firstName: string;
    readonly lastName: string;
    readonly username: string;
    readonly email: string;
    readonly password: string;
    readonly role: number;
    readonly active: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}

type NoReadOnlyType<T> = {
    -readonly [Property in keyof T]: T[Property]
}

export type UserObjNoReadOnlyType = NoReadOnlyType<UserObjectType>

type NoPasswordFieldType<T> = {
    [Property in keyof T as Exclude<Property, "password">]: T[Property]
}

export type UserObjNoPasswordType = NoPasswordFieldType<UserObjectType>

export type ListUserObjectType = {
    getAllUser(arg: UserObjNoPasswordType[]) : Response;
}

export type jwtErrorType = {
    message: {
        name?: string;
        message?: string,
        expiredAt?: string;
    }
}

export type decodedKeyParamsType = JWTType

export type JWTType = {
    email: string;
    level: number;
}

export interface UserBodyInterface {
    getUserId() : string;
    getEmail() : string;
    getFirstName() : string;
    getLastName() : string;
    getUsername() : string;
    getPassword() : string;
    json(): object
}

export type ErrorType = {
    get_400_fieldNotEmpty(): Response;
    get_401_emailExist(): Response;
    get_404_userNotFound(): Response;
    get_404_levelNotFound(): Response;
    get_404_articleNotFound(): Response;
    get_405_passwdEmpty(): Response;
    get_globalError(err: any): Response;
}

export type UserSuccessType = {
    get_200_userDeleted(): Response;
    get_200_userResObject(userObject: UserObjNoPasswordType): Response;
    get_201_userResObject(userObject: UserObjNoPasswordType): Response;
    get_201_passwordUpdated(): Response;
}

export type ArticleSuccessType = {
    get_200_articleDeleted(): Response;
}


export type LevelSuccessType = {
    get_200_levelDeleted(): Response;
    get_200_levelResObject(levelObject: LevelAccessType): Response;
    get_201_levelResObject(levelObject: LevelAccessType): Response;
}

type NoIdType<T> = {
    [Property in keyof T as Exclude<Property, 'id'>]: T[Property]
}

type NoReadonly<T> = {
    -readonly [Property in keyof T]: T[Property]
}

export type LevelAccessType = {
    readonly id: number;
    readonly name: string;
    readonly level: number;
}

export type LevelAccessNoIdType = NoIdType<LevelAccessType>

export type LevelAccessNoIdNoReadonlyType = NoReadonly<LevelAccessNoIdType>

export type CategoryType = {
    readonly id: number;
    readonly name: string
}

export type CategoryNoIdType = NoIdType<CategoryType>

export type ArticleFieldType = {
    readonly id: number;
    readonly userId: number;
    readonly categoryId: number;
    readonly title: string;
    readonly subtitle: string;
    readonly description: string;
    readonly tags: TagObjNoId[];
}

export type ArticleFieldNoIdType = NoIdType<ArticleFieldType>
export type ArticleFieldNoIdNoRoType = NoReadOnlyType<NoIdType<ArticleFieldType>>

export type ArticleMethodGetType = {
    getId(): number;
    getUserId(): number;
    getTitle(): string;
    getSubtitle(): string;
    getDescription(): string;
    getTags(): TagObject[]
}

export type TagObject = {
    id: number;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export type TagObjNoId = NoIdType<TagObject>

export type ArticleTagsType = {
    readonly id: number;
    readonly name: string;
    readonly createdAt?: Date;
    readonly updatedAt?: Date;
}

export type UserLoginType = {
    email: string;
    password: string
}

export type DestinationCallback = (error: Error | null, destination: string) => void;
export type FileNameCallback = (error: Error | null, filename: string) => void;