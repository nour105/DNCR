import { NextResponse } from "next/server";

export async function GET(request) {

    try {

        const { searchParams } = new URL(request.url);
        const number = searchParams.get("number");

        if (!number) {
            return NextResponse.json({
                error: "No number provided"
            });
        }

        // ================= TOKEN =================

        const tokenResponse = await fetch(
            "https://apihub.etisalat.ae:9443/etisalat/serviceapis/confidential/oauth2/token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "application/json",
                    "X-TIB-RequestedSystem": "Motive",
                    "X-TIB-TransactionID": Date.now().toString(),
                },
                body: new URLSearchParams({
                    grant_type: "client_credentials",
                    scope: "apioauth",
                    client_id: process.env.CLIENT_ID,
                    client_secret: process.env.CLIENT_SECRET,
                }),
            }
        );

        const tokenData = await tokenResponse.json();

        if (!tokenData.access_token) {
            return NextResponse.json({
                error: "Token failed",
                tokenData
            });
        }

        // ================= DNCR =================

        const dncrResponse = await fetch(
            "https://apihub.etisalat.ae:9443/etisalat/serviceapis/dncr/v0/check",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${tokenData.access_token}`,
                    "clientID": process.env.CLIENT_ID,
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-TIB-RequestedSystem": "Motive",
                    "X-TIB-TransactionID": Date.now().toString(),
                },
                body: JSON.stringify({
                    accountNumber: [number],
                    count: "1"
                }),
            }
        );

        const dncrData = await dncrResponse.json();

        return NextResponse.json(dncrData);

    } catch (error) {

        return NextResponse.json({
            error: error.message
        });

    }

}