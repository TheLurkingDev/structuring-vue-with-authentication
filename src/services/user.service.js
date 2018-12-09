import ApiService from './api.service';
import { TokenService } from './storage.service';

class AuthenticationError extends Error {
    constructor(errorCode, message) {
        super(message);
        this.name = this.constructor.name;
        this.message = message;
        this.errorCode = errorCode;
    }
}

const UserService = {
    // Login user and store access token to TokenService
    // @returns access_token
    // @throws AuthenticationError

    login: async function(email, password) {
        const requestData = {
            method: 'post',
            url: "/o/token",
            data: {
                grant_type: 'password',
                username: email,
                password: password
            },
            auth: {
                username: process.env.VUE_APP_CLIENT_ID,
                password: process.env.VUE_APP_CLIENT_SECRET
            }
        }

        try {
            const response = await ApiService.customRequest(requestData);

            TokenService.saveToken(response.data.access_token);
            TokenService.saveRefreshToken(response.data.refresh_token);
            ApiService.setHeader();

            ApiService.mount401Interceptor();

            return response.data.access_token;
        }
        catch (error) {
            throw new AuthenticationError(error.response.status, error.response.data.detail);
        }
    },

    refreshToken: async function() {
        const refreshToken = TokenService.getRefreshToken();

        const requestData = {
            method: 'post',
            url: "/o/token",
            data: {
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            },
            auth: {
                username: process.env.VUE_APP_CLIENT_ID,
                password: process.env.VUE_APP_CLIENT_SECRET
            }
        }

        try {
            const response = await ApiService.customRequest(requestData);

            TokenService.saveToken(response.data.access_token);
            TokenService.saveRefreshToken(response.data.refresh_token);
            ApiService.setHeader();

            return response.data.access_token;
        } catch (error) {
            throw new AuthenticationError(error.response.status, error.response.data.detail);
        }
    },
    
    // Log user out by removing token from localStorage
    // and removing 'Authorization Bearer <token>' from future requests.
    logout() {
        TokenService.removeToken();
        TokenService.removeRefreshToken();
        ApiService.removeHeader();

        ApiService.unmount401Interceptor();
    }
};

export default UserService;

export { UserService, AuthenticationError };