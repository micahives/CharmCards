import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

// TS interface
interface UserDocument extends Document {
    username: string;
    email: string;
    password: string;
    isCorrectPassword(password: string): Promise<boolean>;
}

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            match: [/.+@.+\..+/, 'Must use a valid email address'],
        },
        password: {
            type: String,
            required: true,
        }
    },
);

// compare and validate password for login
userSchema.methods.isCorrectPassword = async function (password: string) {
    return bcrypt.compare(password, this.password);
};

// hash new or updated user password
userSchema.pre('save', async function (next) {
    if (this.isNew || this.isModified('password')) {
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
    }

    next();
});

const User = model<UserDocument>('User', userSchema);

export default User;