"use client";

import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";



export default function Home() {

const router = useRouter();

  const [allowed, setAllowed] = useState(false);

  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // 🔐 PROTECTION FIX
  useEffect(() => {
    if (typeof window === "undefined") return;

    const auth = localStorage.getItem("auth");

    if (!auth) {
      window.location.replace("/login");
      return;
    }

    setAllowed(true);
  }, []);

   if (!allowed) return null;


  // 🔐 PROTECTION
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const auth = localStorage.getItem("auth");

    if (!auth) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, []);

  if (!ready) return null; // مهم جدًا


  // 🚪 LOGOUT
  const logout = () => {
 document.cookie = "token=; Max-Age=0; path=/";
window.location.replace("/login");
  };

  const checkDNCR = async () => {
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch(`/api/dncr?number=${number}`);
      const data = await res.json();

      if (data.error) setError(data.error);
      else setResult(data);

    } catch (err) {
      setError("Something went wrong");
    }

    setLoading(false);
  };

  const dncrStatus = result?.details?.[0]?.dncrStatus;
  const canContact = dncrStatus === "FALSE";


    return (
        <main className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
  {/* 🚪 LOGOUT BUTTON */}
      <button
        onClick={logout}
        className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-xl"
      >
        Logout
      </button>
            <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-8">

                {/* HEADER */}
                <div className="mb-8">

                    <h1 className="text-4xl font-bold text-gray-900">
                        DNCR Check
                    </h1>

                    <p className="text-gray-500 mt-2">
                        UAE Do Not Call Registry Verification
                    </p>

                </div>

                {/* INPUT */}
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Enter UAE Mobile Number (e.g. 0501234567)"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        className="w-full border border-gray-300 rounded-2xl px-5 py-4 text-lg outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition"
                    />

                    <button
                        onClick={checkDNCR}
                        disabled={loading || !number}
                        className="w-full bg-black hover:bg-gray-800 disabled:opacity-50 text-white py-4 rounded-2xl text-lg font-semibold transition"
                    >
                        {loading ? "Checking..." : "Check Number"}
                    </button>

                </div>

                {/* ERROR */}
                {error && (

                    <div className="mt-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl">
                        {error}
                    </div>

                )}

                {/* RESULT */}
                {result && (

                    <div className="mt-8">

                        <div
                            className={`rounded-3xl p-6 border ${
                                canContact
                                    ? "bg-green-50 border-green-200"
                                    : "bg-red-50 border-red-200"
                            }`}
                        >

                            {/* TOP */}
                            <div className="flex items-center justify-between gap-4">

                                <div>

                                    <p className="text-gray-500 text-sm">
                                        Phone Number
                                    </p>

                                    <h2 className="text-2xl font-bold text-gray-900 mt-1">
                                        {result.details?.[0]?.accountNumber}
                                    </h2>

                                </div>

                                <div
                                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${
                                        canContact
                                            ? "bg-green-500 text-white"
                                            : "bg-red-500 text-white"
                                    }`}
                                >

                                    {canContact
                                        ? "CAN CONTACT"
                                        : "DO NOT CONTACT"
                                    }

                                </div>

                            </div>

                            {/* MESSAGE */}
                            <div
                                className={`mt-6 rounded-2xl p-5 text-center font-semibold text-lg ${
                                    canContact
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                }`}
                            >

                                {canContact
                                    ? "You are allowed to contact this number because it is NOT registered in the DNCR."
                                    : "You are NOT allowed to contact this number because it is registered in the DNCR."
                                }

                            </div>

                            {/* DETAILS */}
                            <div className="mt-6 grid grid-cols-2 gap-4">

                                <div className="bg-white rounded-2xl p-4 border">

                                    <p className="text-gray-500 text-sm">
                                        DNCR Status
                                    </p>

                                    <p
                                        className={`text-xl font-bold mt-2 ${
                                            canContact
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }`}
                                    >
                                        {dncrStatus}
                                    </p>

                                </div>

                                <div className="bg-white rounded-2xl p-4 border">

                                    <p className="text-gray-500 text-sm">
                                        Transaction Status
                                    </p>

                                    <p className="text-sm font-semibold mt-2 break-words">
                                        {result.details?.[0]?.transactionStatus || "None"}
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                )}

            </div>

        </main>
    );
}