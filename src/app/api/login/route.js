import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req) {
    try {
        const { username, password } = await req.json();

        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("username", username)
            .single();

        if (error || !data) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 401 }
            );
        }

        if (password !== data.password) {
            return NextResponse.json(
                { success: false, message: "Wrong password" },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            user: data,
        });

    } catch (err) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}