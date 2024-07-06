
import {
    describe,
    expect,
    test,
    jest,
    beforeEach,
    afterEach,
} from '@jest/globals';

import {
    getHomepage,
    showAllUsers,
    createAUser,
    updateUser,
    userFetchMock,
    userPayload,
    hashedPasswordMock,
    PasswordEnumTest,
    changeUserProfile,
    userPayloadWrong,
    changeUserPassword,
    getUserProfile,
    deleteUser,
    deletedUser,
} from './helpers';

import * as Utils from '../src/utils/utils';
import * as ENUM from '../src/utils/enum';
import { GenTokenEnum } from './helpers';
const jwt = require('jsonwebtoken');

describe('Test Hompage', () => {

    test('get response from home endpoint', async() => {

        return await getHomepage().then(data => {
            const response = {"message": "Welcome to my site!"}
                expect(data).toEqual(response)
            });
    });
})

describe('Test list users endpoints', () => {

    beforeEach(() => {
        jest.spyOn(global, 'fetch')
        .mockImplementation(userFetchMock)
    })

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test('show all users in databases', async() => {
        return await showAllUsers().then(data => {
            const response: object = userPayload
            expect(data).toEqual(response)
        });
    });

    test('test get user profile', async() => {
        await getUserProfile(4).then((data) => {
            expect(data).toEqual(userPayload);
        })
    })

});

describe('Test CRUD users', () => {

    beforeEach(() => {
        jest.spyOn(global, 'fetch')
        .mockImplementation(userFetchMock)
        
    });
 
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        
    });

    test('create a new user', async() => {
            await createAUser(userPayload).then(data => {
            expect(data).toEqual(userPayload)
        });
        
    });

    test('test update user profile', async() => {

        await updateUser(19, userPayload).then(data => {
            expect(data).toEqual(userPayload);
        })
    });

    test('test change user profile', async() => {
        await changeUserProfile(19, userPayload)
        .then((data) => {
            expect(data).toEqual(userPayload)
        })
    });

    test('test change password', async() => {
        const new_password = 'newPassword1234';
        userPayload['password'] = new_password;
        await changeUserPassword(3, userPayload).then(data => {
            expect(data).toEqual(userPayload);
        })
    });

})

describe('Test delete user', () => {

    beforeEach(() => {
        jest.spyOn(global, 'fetch')
        .mockImplementation(deletedUser)
    })

    test('test delete user', async() => {
        await deleteUser(1, userPayload).then((data) => {
            expect(data).toEqual(ENUM.SuccessMsgEnum.USER_DELETED)
        })
    })
    
})

describe('Test CRUD failed', () => {

    test('test create user profile failed', async() => {
        await createAUser(userPayloadWrong)
        .catch((err) => {
            expect(err).toEqual({message: ENUM.ErrorMsgEnum.FIELD_SHOULDNOT_EMPTY})
        })
    });

    test('test change password failed', async() => {
        userPayload['password'] = "";
        await changeUserPassword(3, userPayload).catch(err => {
            expect(err).toEqual({message: ENUM.ErrorMsgEnum.FIELD_SHOULDNOT_EMPTY});
        })
    })
})

describe('Test Encrypt password', () => {
    
    beforeEach(() => {
        jest.spyOn(Utils, 'encryptUserPassword')
        .mockImplementation(hashedPasswordMock);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test('test encrypting password & show hashed password', async() => {
        const password = userPayload.password;

        return await Utils.encryptUserPassword(password).then(data => {
            expect(data).toEqual(PasswordEnumTest.HASHED_PASSWORD);
        })
    })
})

describe('Test JWT Token', () => {
    let mockGenToken: any = undefined;
    let mockDecodedToken: any;
    const email = userPayload.email;
    

    beforeEach(() => {
        mockGenToken = jest.spyOn(jwt, 'sign').mockImplementation(() => GenTokenEnum.GENERATED_TOKEN)
        mockDecodedToken = jest.spyOn(jwt, 'verify').mockImplementation(() => userPayload.email)
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test('test generate access key token', () => {
        const generate_token = new Utils.EncodeDecodeJWTToken(email);
        const token = generate_token.generateJWTToken(30);
        expect(token).toEqual(GenTokenEnum.GENERATED_TOKEN);
        expect(mockGenToken).toHaveBeenCalled();
    });

    test('test decode generated token', async() => {
        const generate_token = new Utils.EncodeDecodeJWTToken(email);
        const token = generate_token.generateJWTToken(10);
        
        const decode_token = new Utils.EncodeDecodeJWTToken(token);
        return await decode_token.decodeJWTToken().then((data) => {
            expect(data).toEqual(userPayload.email);
            expect(mockGenToken).toHaveBeenCalled();
            expect(mockDecodedToken).toHaveBeenCalled();
        })

    })
})

describe('Test decode JWT with wrong token', () => {
    test('Decode jwt with wrong token', async() => {
        const token = GenTokenEnum.WRONG_TOKEN    
        const decode_token = new Utils.EncodeDecodeJWTToken(token);
        return await decode_token.decodeJWTToken().catch((error) => {
            expect(error).toEqual(ENUM.ErrorMsgEnum.TOKEN_EXPIRED);
        });
    })
})

