import { NextResponse } from 'next/server';
import Contact from '@/src/modules/contacts/model';
import dbConnect from '@/src/config/db';

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const contacts = await Contact.find(type ? { type } : {});
  return NextResponse.json(contacts);
}

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();
  const contact = await Contact.create(body);
  return NextResponse.json(contact);
}
