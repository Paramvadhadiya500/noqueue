import { NextResponse } from 'next/server';

// ⚠️ PASTE YOUR AWS LAMBDA FUNCTION URL HERE:
const LAMBDA_URL = "https://aw6kb2lefpb6lu2iesiu7p6bt40fpuji.lambda-url.ap-south-1.on.aws/";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const fetchUrl = `${LAMBDA_URL}?${url.searchParams.toString()}`;
    
    const response = await fetch(fetchUrl);
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to connect to AWS Lambda" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const response = await fetch(LAMBDA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to connect to AWS Lambda" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    const response = await fetch(LAMBDA_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to connect to AWS Lambda" }, { status: 500 });
  }
}