import { NextResponse } from 'next/server';
import FiscalYear from '@/src/modules/fiscalYear/model';
import dbConnect from '@/src/config/db';

export async function GET() {
  await dbConnect();
  const fiscalYears = await FiscalYear.find({});
  return NextResponse.json(fiscalYears);
}

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();
  const fiscalYear = await FiscalYear.create(body);
  return NextResponse.json(fiscalYear);
}
