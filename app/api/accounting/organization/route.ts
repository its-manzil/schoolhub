import { NextResponse } from 'next/server';
import Organization from '@/src/modules/organization/model';
import dbConnect from '@/src/config/db';

export async function GET() {
  try {
    await dbConnect();
    const organization = await Organization.findOne();
    return NextResponse.json(organization);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch organization' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const organization = await Organization.create(body);
    return NextResponse.json(organization);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create organization' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const organization = await Organization.findOneAndUpdate({}, body, { new: true, upsert: true });
    return NextResponse.json(organization);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update organization' }, { status: 500 });
  }
}
