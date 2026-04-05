import { NextResponse } from 'next/server';
import Coa from '@/src/modules/coa/model';
import dbConnect from '@/src/config/db';

export async function GET() {
  try {
    await dbConnect();
    const coa = await Coa.find({});
    return NextResponse.json(coa);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch accounts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const coa = await Coa.create(body);
    return NextResponse.json(coa);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create account' }, { status: 500 });
  }
}
