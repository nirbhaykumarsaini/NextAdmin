import { NextRequest, NextResponse } from 'next/server';
import ManageQR from '@/models/ManageQR';
import connectDB from '@/config/db';
import ApiError from '@/lib/errors/APiError';
import {uploadToCloudinary} from '@/utils/cloudnary'
import { v2 as cloudinary } from 'cloudinary';

interface UpdateData {
  qr_code: string;
}

// GET - Fetch QR code
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const qr = await ManageQR.findById(id);
      if (!qr) throw new ApiError('QR code not found', 404);
      return NextResponse.json({ status: true, data: qr });
    }

    const qrCode = await ManageQR.findOne().sort({ createdAt: -1 });
    if (!qrCode)
      return NextResponse.json({ status: true, data: null });

    return NextResponse.json({ status: true, data: qrCode });
  } catch (error: unknown) {
    console.error('Error fetching QR code:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to fetch QR code';
    const code = error instanceof ApiError ? error.statusCode : 500;

    return NextResponse.json({ status: false, message }, { status: code });
  }
}

// POST - Create or update QR
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    const qr_image = formData.get('qr_image') as File;

    if (!qr_image) throw new ApiError('QR image is required', 400);
    if (!qr_image.type.startsWith('image/'))
      throw new ApiError('Only image files are allowed', 400);
    if (qr_image.size > 5 * 1024 * 1024)
      throw new ApiError('Image size should be less than 5MB', 400);

    // ☁️ Upload to Cloudinary
    const uploaded = await uploadToCloudinary(qr_image);

    let qrCode = await ManageQR.findOne();

    if (qrCode) {
      // Delete old image if available
      if (qrCode.qr_code) {
        try {
          const publicId = qrCode.qr_code
            .split('/')
            .pop()
            ?.split('.')[0];
          if (publicId)
            await cloudinary.uploader.destroy(`manageqr/${publicId}`);
        } catch (err) {
          console.error('Error deleting old Cloudinary image:', err);
        }
      }

      qrCode.qr_code = uploaded.secure_url;
      await qrCode.save();
    } else {
      qrCode = await ManageQR.create({
        qr_code: uploaded.secure_url,
        is_active: true,
      });
    }

    return NextResponse.json({
      status: true,
      message: 'QR code uploaded successfully',
      data: qrCode,
    });
  } catch (error: unknown) {
    console.error('Error uploading QR:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to upload QR code';
    const code = error instanceof ApiError ? error.statusCode : 500;
    return NextResponse.json({ status: false, message }, { status: code });
  }
}

// PUT - Update existing QR
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) throw new ApiError('QR code ID is required', 400);

    const formData = await request.formData();
    const qr_image = formData.get('qr_image') as File;

    const existingQR = await ManageQR.findById(id);
    if (!existingQR) throw new ApiError('QR code not found', 404);

    const updateData: UpdateData = { qr_code: existingQR.qr_code };

    if (qr_image) {
      if (!qr_image.type.startsWith('image/'))
        throw new ApiError('Only image files are allowed', 400);

      if (qr_image.size > 5 * 1024 * 1024)
        throw new ApiError('Image size should be less than 5MB', 400);

      // Delete old Cloudinary image
      if (existingQR.qr_code) {
        try {
          const publicId = existingQR.qr_code
            .split('/')
            .pop()
            ?.split('.')[0];
          if (publicId)
            await cloudinary.uploader.destroy(`manageqr/${publicId}`);
        } catch (err) {
          console.error('Error deleting old Cloudinary image:', err);
        }
      }

      const uploaded = await uploadToCloudinary(qr_image);
      updateData.qr_code = uploaded.secure_url;
    }

    const updatedQR = await ManageQR.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({
      status: true,
      message: 'QR code updated successfully',
      data: updatedQR,
    });
  } catch (error: unknown) {
    console.error('Error updating QR:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to update QR code';
    const code = error instanceof ApiError ? error.statusCode : 500;
    return NextResponse.json({ status: false, message }, { status: code });
  }
}

// PATCH - Toggle QR code status
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) throw new ApiError('QR code ID is required', 400);

    const qrCode = await ManageQR.findById(id);
    if (!qrCode) throw new ApiError('QR code not found', 404);

    const ManageUpi = (await import('@/models/ManageUpi')).default;

    if (!qrCode.is_active) {
      await ManageQR.updateMany({}, { is_active: false });
      qrCode.is_active = true;
      await ManageUpi.updateMany({}, { is_active: false });
      await qrCode.save();

      return NextResponse.json({
        status: true,
        message: 'QR code activated successfully',
        data: qrCode,
      });
    } else {
      qrCode.is_active = false;
      await qrCode.save();

      const upi = await ManageUpi.findOne();
      if (upi) {
        await ManageUpi.updateMany({}, { is_active: false });
        upi.is_active = true;
        await upi.save();
      }

      return NextResponse.json({
        status: true,
        message: 'QR code deactivated successfully and one UPI activated',
        data: qrCode,
      });
    }
  } catch (error: unknown) {
    console.error('Error toggling QR code status:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to toggle QR code status';
    const code = error instanceof ApiError ? error.statusCode : 500;
    return NextResponse.json({ status: false, message }, { status: code });
  }
}

// DELETE - Delete QR code
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) throw new ApiError('QR code ID is required', 400);

    const qrCode = await ManageQR.findById(id);
    if (!qrCode) throw new ApiError('QR code not found', 404);

    if (qrCode.qr_code) {
      try {
        const publicId = qrCode.qr_code
          .split('/')
          .pop()
          ?.split('.')[0];
        if (publicId)
          await cloudinary.uploader.destroy(`manageqr/${publicId}`);
      } catch (err) {
        console.error('Error deleting Cloudinary image:', err);
      }
    }

    await ManageQR.findByIdAndDelete(id);

    return NextResponse.json({
      status: true,
      message: 'QR code deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Error deleting QR:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to delete QR code';
    const code = error instanceof ApiError ? error.statusCode : 500;
    return NextResponse.json({ status: false, message }, { status: code });
  }
}
