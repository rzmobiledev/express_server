import {Response} from 'express';

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

export type decodedKeyParamsType = {
    key: string;
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
    get_405_passwdEmpty(): Response;
    get_globalError(err: any): Response;
}

export type UserSuccessType = {
    get_200_userDeleted(): Response;
    get_200_userResObject(userObject: UserObjNoPasswordType): Response;
    get_201_userResObject(userObject: UserObjNoPasswordType): Response;
    get_201_passwordUpdated(): Response;
}


export type LevelSuccessType = {
    get_200_levelDeleted(): Response;
    get_200_levelResObject(levelObject: LevelAccessType): Response;
    get_201_levelResObject(levelObject: LevelAccessType): Response;
}


export type LevelAccessType = {
    readonly id: number;
    readonly name: string;
    readonly level: number;
}

type LevelNoIdType<T> = {
    [Property in keyof T as Exclude<Property, 'id'>]: T[Property]
}

type LevelNoIdNoReadonly<T> = {
    -readonly [Property in keyof T]: T[Property]
}

export type LevelAccessNoIdType = LevelNoIdType<LevelAccessType>

export type LevelAccessNoIdNoReadonlyType = LevelNoIdNoReadonly<LevelAccessNoIdType>