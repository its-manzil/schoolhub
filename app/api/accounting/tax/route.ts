import { NextResponse } from 'next/server';
import Tax from '@/src/modules/tax/model';
import dbConnect from '@/src/config/db';

export async function GET() {
  try {
    await dbConnect();
    const tax = await Tax.findOne();
    return NextResponse.json(tax);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tax settings';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const tax = await Tax.findOneAndUpdate({}, body, { new: true, upsert: true });
    return NextResponse.json(tax);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update tax settings';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
