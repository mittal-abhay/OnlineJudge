import User from "../models/User.js"
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

//registering the user
export const register = async (req, res) => { 
    try {
        const { firstname, lastname, email, password, role } = req.body;

        if (!(firstname && lastname && email && password)) {
            return res.status(400).json("Please enter all the information");
        }
        //check if the user already exists
        const user = await User.findOne({ email });
        if(user){
            return res.status(400).json({ message: "User already exists!" });
        }
        //hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        //create a new user
        const newUser = await User.create({ 
            firstname, 
            lastname, 
            email, 
            password: hashedPassword,
            role: role || 'user'  // default role is 'user'
        });

        // generate a token for user and send it
        const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.SECRET_KEY, {
            expiresIn: "1d",
        });

        newUser.token = token;
        newUser.password = undefined;
        
        res
            .status(200)
            .json({ message: "You have successfully registered!", newUser });
    }catch(err){
        return res.status(500).json(err, { message: "Server Error!" });
    }
}


export const login = async (req, res) => {
    try {
        //get all the user data
        const { email, password } = req.body;

        // check that all the data should exists
        if (!(email && password)) {
            return res.status(400).send("Please enter all the information");
        }

        //find the user in the database
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send("User not found!");
        }

        //match the password
        const enteredPassword = await bcrypt.compare(password, user.password);
        if (!enteredPassword) {
            return res.status(401).send("Password is incorrect");
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.SECRET_KEY, {
            expiresIn: "1d",
        });

        //store cookies
        const options = {
            expires: new Date(Date.now() + 1*24*60*60*1000), //1 day
            httpOnly: true, //only manipulate by server not by client/user
        };

        //send the token
        res.status(200).cookie("access_token", token, options).json({
            message: "You have successfully logged in!",
            success: true,
            token
        });
    } catch (error) {
        res.status(500).json(error, { message: "Server Error!" });
    }
}


export const logout = async (req, res) => {
    try {
        res.clearCookie("access_token");
        res.status(200).json({ message: "You have successfully logged out!" });
    } catch (error) {
        res.status(500).json(error, { message: "Server Error!" });
    }
}


//check if a user is logged in or not. If logged in then return the user data
export const me = async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        jwt.verify(token, process.env.SECRET_KEY, async (err, user) => {
            if (err) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const userData = await User.findById(user.id).select("-password");
            res.status(200).json({ userData });
        });
    } catch (error) {
        res.status(500).json(error, { message: "Server Error!" });
    }
}