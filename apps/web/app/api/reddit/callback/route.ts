import { NextResponse } from "next/server";

import { NextRequest } from "next/server";

export async function GET(req: NextRequest, res: NextResponse)
{
     const {searchParams} =  new URL(req.url);
     const code = searchParams.get("code");
}