
import {
    describe,
    expect,
    test,
    jest,
    beforeEach,
    afterEach,
} from '@jest/globals';

import * as helpers from './helpers';

import * as Utils from '../src/utils/utils';
import * as ENUM from '../src/utils/enum';
import { GenTokenEnum } from './helpers';
const jwt = require('jsonwebtoken');

describe('Test Hompage', () => {

    test('get response from home endpoint', async() => {

        return await helpers.getHomepage().then(data => {
            const response = {message: "Welcome to my site!"}
                expect(data).toEqual(response)
            });
    });
})

describe('Test list users endpoints', () => {

    beforeEach(() => {
        jest.spyOn(global, 'fetch')
        .mockImplementation(helpers.userFetchMock)
    })

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test('show all users in databases', async() => {
        return await helpers.showAllUsers().then(data => {
            const response: object = helpers.userPayload
            expect(data).toEqual(response)
        });
    });

    test('test get user profile', async() => {
        await helpers.getUserProfile(4).then((data) => {
            expect(data).toEqual(helpers.userPayload);
        })
    })

});

describe('Test CRUD users', () => {

    beforeEach(() => {
        jest.spyOn(global, 'fetch')
        .mockImplementation(helpers.userFetchMock)
        
    });
 
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        
    });

    test('create a new user', async() => {
            await helpers.createAUser(helpers.userPayload).then(data => {
            expect(data).toEqual(helpers.userPayload)
        });
        
    });

    test('test update user profile', async() => {

        await helpers.updateUser(19, helpers.userPayload).then(data => {
            expect(data).toEqual(helpers.userPayload);
        })
    });

    test('test change user profile', async() => {
        await helpers.changeUserProfile(19, helpers.userPayload)
        .then((data) => {
            expect(data).toEqual(helpers.userPayload)
        })
    });

    test('test change password', async() => {
        const new_password = 'newPassword1234';
        helpers.userPayload['password'] = new_password;
        await helpers.changeUserPassword(3, helpers.userPayload).then(data => {
            expect(data).toEqual(helpers.userPayload);
        })
    });

})

describe('Test delete user', () => {

    beforeEach(() => {
        jest.spyOn(global, 'fetch')
        .mockImplementation(helpers.deletedUser)
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test('test delete user', async() => {
        await helpers.deleteUser(1, helpers.userPayload).then((data) => {
            expect(data).toEqual(ENUM.SuccessMsgEnum.USER_DELETED)
        })
    })
    
})

describe('Test CRUD failed', () => {

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test('test create user profile failed', async() => {
        await helpers.createAUser(helpers.userPayloadWrong)
        .catch((err) => {
            expect(err).toEqual({message: ENUM.ErrorMsgEnum.FIELD_SHOULDNOT_EMPTY})
        })
    });

    test('test change password failed', async() => {
        helpers.userPayload['password'] = "";
        await helpers.changeUserPassword(3, helpers.userPayload).catch(err => {
            expect(err).toEqual({message: ENUM.ErrorMsgEnum.FIELD_SHOULDNOT_EMPTY});
        })
    })
})

describe('Test Encrypt password', () => {
    
    beforeEach(() => {
        jest.spyOn(Utils, 'encryptUserPassword')
        .mockImplementation(helpers.hashedPasswordMock);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test('test encrypting password & show hashed password', async() => {
        const password = helpers.userPayload.password;

        return await Utils.encryptUserPassword(password).then(data => {
            expect(data).toEqual(helpers.PasswordEnumTest.HASHED_PASSWORD);
        })
    })
})

describe('Test JWT Token', () => {
    let mockGenToken: any = undefined;
    let mockDecodedToken: any;
    const email = helpers.userPayload.email;
    

    beforeEach(() => {
        mockGenToken = jest.spyOn(jwt, 'sign').mockImplementation(() => GenTokenEnum.GENERATED_TOKEN)
        mockDecodedToken = jest.spyOn(jwt, 'verify').mockImplementation(() => helpers.userPayload.email)
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
            expect(data).toEqual(helpers.userPayload.email);
            expect(mockGenToken).toHaveBeenCalled();
            expect(mockDecodedToken).toHaveBeenCalled();
        })

    })
})

describe('Test decode JWT with wrong token', () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test('Decode jwt with wrong token', async() => {
        const token = GenTokenEnum.WRONG_TOKEN    
        const decode_token = new Utils.EncodeDecodeJWTToken(token);
        return await decode_token.decodeJWTToken().catch((error) => {
            expect(error).toEqual(ENUM.ErrorMsgEnum.TOKEN_EXPIRED);
        });
    })
})

describe('Test auth level user', () => {

    beforeEach(() => {
        jest.spyOn(global, 'fetch')
        .mockImplementation((): Promise<Response> => {
            return Promise.resolve({
                ok: true,
                json: async() => helpers.LevelPayload
            } as Response)
        })
    })

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    })

    test('create level access to user', async() => {
        await helpers.createLevelAccessUser(helpers.LevelPayload)
        .then((data) => {
            expect(data).toEqual(helpers.LevelPayload);
        });
    });

    test('change level access user', async() => {
        await helpers.changeLevelAccessUser(6, helpers.LevelPayload)
        .then((data) => {
            expect(data).toEqual(helpers.LevelPayload);
        });
    });

    test('get one level user access', async() => {
        await helpers.getOneLevelAccess(3, helpers.LevelPayload)
        .then((data) => {
            expect(data).toEqual(helpers.LevelPayload);
        })
        .catch((err) => console.log(err))
        
    })
});

describe('Test delete level access', () => {

    beforeEach(() =>{
        jest.spyOn(global, 'fetch')
        .mockImplementation(helpers.deleteLevelResponse)
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test('remove level access user', async() => {
        await helpers.removeLevelAccessUser(6, helpers.LevelPayload)
        .then((data) => {
            expect(data).toEqual({message: ENUM.SuccessMsgEnum.LEVEL_DELETED});
        });
    });
});
