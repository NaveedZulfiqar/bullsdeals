import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { Category } = await connectToDatabase();
    const categories = await Category.find({}).sort({ name: 1 });
    return NextResponse.json({ success: true, data: categories }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { Category } = await connectToDatabase();
    const body = await request.json();
    const { name, type } = body;
    
    if (!name || !type) {
      return NextResponse.json(
        { success: false, message: 'Name and type are required' },
        { status: 400 }
      );
    }
    
    const category = await Category.create({ name, type });
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'Category with this name already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
