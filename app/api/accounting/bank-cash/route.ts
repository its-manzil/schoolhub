import { NextResponse } from 'next/server';
import BankCash from '@/src/modules/bankCash/model';
import dbConnect from '@/src/config/db';

export async function GET() {
  await dbConnect();
  const bankCash = await BankCash.find({});
  return NextResponse.json(bankCash);
}

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();
  const bankCash = await BankCash.create(body);
  return NextResponse.json(bankCash);
}
