import { NextResponse } from "next/server";
export const dynamic="force-dynamic";
export async function GET(){const required=["CLOUDFLARE_ACCOUNT_ID","CLOUDFLARE_API_TOKEN","SESSION_SECRET"];const optional=["GOOGLE_CLIENT_ID","GOOGLE_CLIENT_SECRET","PAYSTACK_SECRET_KEY"];const present=(n:string)=>Boolean(process.env[n]);return NextResponse.json({ok:true,service:"smartpoint-ai-studio",timestamp:new Date().toISOString(),production:{requiredSecretsReady:required.every(present),required,optionalConfigured:optional.filter(present)}},{headers:{"Cache-Control":"no-store"}})}
