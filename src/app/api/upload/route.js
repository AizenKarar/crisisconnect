import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request) {
    try {
        const { imageBase64 } = await request.json();

        if (!imageBase64) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }


        const uploadResponse = await cloudinary.uploader.upload(imageBase64, {
            folder: 'crisisconnect_incidents',
        });


        return NextResponse.json({ url: uploadResponse.secure_url }, { status: 200 });

    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }
}