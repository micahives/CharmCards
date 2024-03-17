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

    }
};

export default resolvers;