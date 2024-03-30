// double check imports/exports on these
import User from '../models';
import { signToken, AuthenticationError } from '../utils/auth';

const resolvers = {
    Query: {
        users: async(parent, args) => {
            return User.find();
        },
        user: async(parent, { profileId }) => {
            return User.findOne({ _id: profileId });
        },
        // research this block
        me: async (parent, args, context) => {
            try {
                if (context.profile) {
                    return await User.findOne({ _id: context.profile._id });
                } else {
                    return AuthenticationError;
                }
            } catch (error) {
                console.error(error);
            }
        }
    },

    Mutation: {
        login: async (parent, { email, password }) => {
            let user = await User.findOne({ email });

            if (!user) {
                throw AuthenticationError;
            }

            const correctPassword = await user.isCorrectPassword(password);

            if (!correctPassword) {
                throw AuthenticationError;
            }

            const token = signToken(user);
            return { token, user };
            },
        addUser: async (parent, { username, email, password }) => {
            try {
                const user = await User.create({ username, email, password });
                const token = signToken(user);

                return { token, user };
            } catch (err) {
                console.error(err);
            }
        }
    }
};

export default resolvers;