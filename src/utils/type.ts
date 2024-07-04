
export function ObjectType<X extends string, T>(url: X, arg: T): T {
    return arg;
}

export type UserObjectType = {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
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
   
