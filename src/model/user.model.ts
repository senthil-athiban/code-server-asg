import { model, Schema } from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      unique: true,
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      validate(value: string) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error(
            "Password must contain at least one letter and one number"
          );
        }
      },
    },
    isEmailVerified: {
        type: Boolean,
        default: true, // TODO: change it to false
        index: true
    }
  },
  {
    timestamps: true,
  }
);

userSchema.methods.isPasswordMatch = async function (password: string) {
  const user = this;
  return bcryptjs.compare(password, user.password);
};

userSchema.pre("save", async function (this: any & Document, next) {
  if (this.isModified("password")) {
    this.password = await bcryptjs.hash(this.password, 10);
  }
  next();
});

const User = model("User", userSchema);
export default User;
