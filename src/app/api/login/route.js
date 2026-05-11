import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/lib/db";

export async function POST(req) {

    try {

        const body = await req.json();

        const { username, password } = body;

        console.log("BODY:", body);

        const [rows] = await db.execute(
            "SELECT * FROM users WHERE username = ?",
            [username]
        );

        console.log("ROWS:", rows);

        if (rows.length === 0) {

            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 401 }
            );
        }

        const user = rows[0];

        if (password !== user.password) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Wrong password",
                },
                { status: 401 }
            );
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
            }
        );

        const response = NextResponse.json({
            success: true,
        });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: false,
            path: "/",
            maxAge: 60 * 60 * 24,
        });

        return response;

    } catch (error) {

        console.log("LOGIN ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                error: error.message,
            },
            { status: 500 }
        );
    }
}