import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';

const secret = process.env.SECRET_KEY;
const expiration = '2h';

export const AuthenticationError = () => new GraphQLError('Could not authenticate user.', {
    extensions: {
        code: 'UNAUTHENTICATED',
    },
});

export const authMiddleware = ({ req }) => {
    const token = req.body.token || req.query.token || (req.headers.authorization && req.headers.authorization.split(' ').pop().trim());

    if (!token) {
        return { ...req };
    }

    try {
        const { data } = jwt.verify(token, secret, { maxAge: expiration });
        return { ...req, profile: data }; 
    } catch (error) {
        console.log('Invalid token:', error.message);
        throw new Error('Invalid token');
    }
};

export const signToken = ({ email, username, _id }) => {
    const payload = { email, username, _id };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
};