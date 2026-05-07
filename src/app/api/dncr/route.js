import { NextResponse } from "next/server";

export const runtime = "nodejs"; // IMPORTANT for external APIs

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const number = searchParams.get("number");

        if (!number) {
            return NextResponse.json({
                error: "No number provided",
            });
        }

        // ================= TOKEN REQUEST =================

        const tokenResponse = await fetch(
            "https://apihub.etisalat.ae:9443/etisalat/serviceapis/confidential/oauth2/token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Accept: "application/json",
                    "X-TIB-RequestedSystem": "Motive",
                    "X-TIB-TransactionID": Date.now().toString(),
                },
                body: new URLSearchParams({
                    grant_type: "client_credentials",
                    scope: "apioauth",
                    client_id: process.env.CLIENT_ID || "",
                    client_secret: process.env.CLIENT_SECRET || "",
                }),
            }
        );

        const tokenRaw = await tokenResponse.text();

        console.log("TOKEN STATUS:", tokenResponse.status);
        console.log("TOKEN RAW RESPONSE:", tokenRaw);

        let tokenData;
        try {
            tokenData = JSON.parse(tokenRaw);
        } catch (e) {
            return NextResponse.json({
                error: "Token response is not valid JSON",
                raw: tokenRaw,
            });
        }

        if (!tokenData?.access_token) {
            return NextResponse.json({
                error: "Token failed",
                status: tokenResponse.status,
                tokenData,
            });
        }

        // ================= DNCR REQUEST =================

        const dncrResponse = await fetch(
            "https://apihub.etisalat.ae:9443/etisalat/serviceapis/dncr/v0/check",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${tokenData.access_token}`,
                    clientID: process.env.CLIENT_ID || "",
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-TIB-RequestedSystem": "Motive",
                    "X-TIB-TransactionID": Date.now().toString(),
                },
                body: JSON.stringify({
                    accountNumber: [number],
                    count: "1",
                }),
            }
        );

        const dncrRaw = await dncrResponse.text();

        console.log("DNCR STATUS:", dncrResponse.status);
        console.log("DNCR RAW RESPONSE:", dncrRaw);

        let dncrData;
        try {
            dncrData = JSON.parse(dncrRaw);
        } catch (e) {
            return NextResponse.json({
                error: "DNCR response is not valid JSON",
                raw: dncrRaw,
            });
        }

        return NextResponse.json(dncrData);
    } catch (error) {
        console.error("API ERROR:", error);

        return NextResponse.json({
            error: error.message || "Unknown error",
        });
    }
}