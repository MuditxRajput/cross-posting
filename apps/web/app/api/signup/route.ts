import { dbConnection } from "@database/database";
import { User } from "@database/database/models/user.model";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
    try {
        await dbConnection();
        const userData = await req.json();
        const { email, password, name } = userData;
        const existedEmail = await User.findOne({ email: email });
        // console.log("existed",existedEmail);
        if (existedEmail) {
            return NextResponse.json({ msg: "User already exists", success: false });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        const token = jwt.sign({ email: email }, process.env.JWT || "", { expiresIn: '1d' });
        
        return NextResponse.json({ msg: "Sign up successfully", success: true, token });

    } catch (error) {
        console.error("Error during signup:", error); // Log error
        return NextResponse.json({ msg: "Check credentials", success: false, error });
    }
}
