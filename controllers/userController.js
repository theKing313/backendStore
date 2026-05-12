// import User from "../models/userModel.js";
// import Brand from "../models/brandModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import userService from "../service/user-service.js";
// import { UserService } from "../service/user-service";
class UserController {
  constructor() {
    this.users = [];
  }
  async registration(req, res, next) {
    const { username, password, email } = req.body;
    console.log(username, password);
    const userData = await userService.registration(username, password, email);

    return res.json(userData);
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const userData = await userService.login(email, password);
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }
  async sendCode(req, res, next) {
    try {
      const { email } = req.body;
      const userData = await userService.sendCode(email);
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async sendPasswordResetCode(req, res, next) {
    try {
      const { email } = req.body;
      const userData = await userService.sendResetCode(email);
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { email, code, password } = req.body;
      const result = await userService.resetPassword({
        email,
        code,
        password,
      });
      return res.json(result);
    } catch (e) {
      next(e);
    }
  }

  async verifyCode(req, res, next) {
    try {
      const { email, code, username, password } = req.body;
      const userData = await userService.verifyCode({
        email,
        code,
        username,
        password,
      });
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }
  async find(req, res) {
    const user = req.user;
    console.log("Finding users...", user);
    return res.json({ user });
    // userService
    // const user = await User.findById(req.user.id);
    // if (!user) {
    //   return next(ApiError.UnauthorizedError());
    // }

    // return res.json(this.users);
    // return this.users; // Return all users for now, can be modified later
  }
}
// export const getMe = async (req, res, next) => {
//   const users = await User.find();
//   return res.json(users);
//   // const user = User.find({ user: req.user.id })
//   // console.log(user)
//   // res.json({message:user});
// };
// export const LoginUser = async (req, res) => {
//   const { email, password } = req.body;
//   console.log(password);
//   const user = await User.findOne({ email });
//   if (user != null && (await bcrypt.compare(password, user.password))) {
//     res.json({
//       message: `welcome back : ${user.name}`,
//       user: user,
//       token: generateToken(user._id),
//     });
//     return;
//   }
// };
// export const registerUser = async (req, res, next) => {
//   try {
//     const { name, email, password } = req.body;
//     if (!name || !email || !password) {
//       res.status(400).json({ message: "please add all fields" });
//       return;
//     }
//     // const userExist = await User.findOne({email})
//     // if(userExist != null){
//     //     res.status(400).json({message : 'userEmail already exists',user:userExist});
//     //     return;
//     // }
//     //Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);
//     const user = await new User({
//       name,
//       email,
//       password: hashedPassword,
//     });

//     await user.save();
//     if (user) {
//       console.log({ message: "A new user was added", user: user });
//       res.status(201).json({
//         message: "A new user was added",
//         user: user,
//         token: generateToken(user._id),
//       });
//       return;
//     }
//   } catch (error) {
//     return res.status(400).send({ message: error });
//   }
// };
// export const deleteUser = async (req, res) => {
//   const user = await User.findById(req.params.id);
//   if (user) {
//     await goal.remove();
//     res.status(200).json({ id: req.params.id });
//   }
// };
// export const setFavorites = async (req, res, next) => {
//   try {
//     const { title, text, image } = req.body;
//     console.log(title, text, image);
//     const user = await User.findById(req.params.id);
//     if (!title || !text || !image) {
//       console.log("please add all fields");
//       res.status(400).json({ message: "please add all fields" });
//       return;
//     }
//     if (user) {
//       console.log("please add all fields2");

//       user.favorites = true;
//       const brand = await new Brand({
//         img: image,
//         title,
//         text,
//       });
//       await brand.save();
//       console.log("please add all field3");
//       const brands = await Brand.find();
//       return res.status(200).json({ brands });
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };

// export const getFavorites = async (req, res, next) => {
//   const brands = await Brand.find();
//   return res.json(brands);
// };
// // Generate JWT
// const generateToken = (id) => {
//   return jwt.sign({ id }, "JWT_SECRET", {
//     expiresIn: "30d",
//   });
// };
// export const userController = new UserController();
// module.exports = new UserController();
// export const userController = new userController();
// export default userController;

export const userController = new UserController();
