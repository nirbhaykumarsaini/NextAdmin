import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import ManageQR from '@/models/ManageQR';
import connectDB from '@/config/db';
import ApiError from '@/lib/errors/APiError';

interface UpdateData {
    qr_code:string;
}

// GET - Fetch the single QR code
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        // If ID is provided, fetch specific QR code
        if (id) {
            const qr = await ManageQR.findById(id);
            if (!qr) {
                throw new ApiError('QR code not found', 404);
            }

            // Get base URL for complete image URL
            const protocol = request.headers.get('x-forwarded-proto') || 'http';
            const host = request.headers.get('host');
            const baseUrl = `${protocol}://${host}`;

            const qrData = {
                ...qr.toObject(),
                qr_code_url: qr.qr_code ? `${baseUrl}${qr.qr_code}` : null,
            };

            return NextResponse.json({
                status: true,
                data: qrData
            });
        }

        // Fetch the single QR code (there should be only one)
        const qrCode = await ManageQR.findOne().sort({ createdAt: -1 });

        // Get base URL for complete image URL
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const host = request.headers.get('host');
        const baseUrl = `${protocol}://${host}`;

        if (!qrCode) {
            return NextResponse.json({
                status: true,
                data: null
            });
        }

        const qrData = {
            ...qrCode.toObject(),
            qr_code_url: qrCode.qr_code ? `${baseUrl}${qrCode.qr_code}` : null,
        };

        return NextResponse.json({
            status: true,
            data: qrData
        });

    } catch (error: unknown) {
        console.error('Error fetching QR code:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch QR code';
        const statusCode = error instanceof ApiError ? error.statusCode : 500;
        
        return NextResponse.json(
            { status: false, message: errorMessage },
            { status: statusCode }
        );
    }
}

// POST - Create or update the single QR code
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const formData = await request.formData();
        const qr_image = formData.get('qr_image') as File;

        if (!qr_image) {
            throw new ApiError('QR image is required', 400);
        }

        if (!qr_image.type.startsWith('image/')) {
            throw new ApiError('Only image files are allowed', 400);
        }

        // Validate file size (max 5MB)
        if (qr_image.size > 5 * 1024 * 1024) {
            throw new ApiError('Image size should be less than 5MB', 400);
        }

        // Create uploads directory
        const uploadsDir = join(process.cwd(), 'public/manageqr');
        await mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        const timestamp = Date.now();
        const extension = qr_image.name.split('.').pop();
        const filename = `qr_${timestamp}.${extension}`;
        const filePath = join(uploadsDir, filename);

        // Save file
        const bytes = await qr_image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        const relativePath = `/manageqr/${filename}`;

        // Find existing QR code
        let qrCode = await ManageQR.findOne();

        if (qrCode) {
            // Delete old image if exists
            if (qrCode.qr_code) {
                const oldFilePath = join(process.cwd(), 'public', qrCode.qr_code);
                try {
                    await unlink(oldFilePath);
                } catch (error) {
                    console.error('Error deleting old image:', error);
                }
            }

            // Update existing QR code
            qrCode.qr_code = relativePath;
            await qrCode.save();
        } else {
            // Create new QR code entry
            qrCode = await ManageQR.create({
                qr_code: relativePath,
                is_active: true
            });
        }

        return NextResponse.json({
            status: true,
            message: qrCode ? 'QR code updated successfully' : 'QR code added successfully',
            data: qrCode
        });

    } catch (error: unknown) {
        console.error('Error saving QR code:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to save QR code';
        const statusCode = error instanceof ApiError ? error.statusCode : 500;
        
        return NextResponse.json(
            { status: false, message: errorMessage },
            { status: statusCode }
        );
    }
}

// PUT - Update the QR code
export async function PUT(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            throw new ApiError('QR code ID is required', 400);
        }

        const formData = await request.formData();
        const qr_image = formData.get('qr_image') as File;

        // Find existing QR code
        const existingQR = await ManageQR.findById(id);
        if (!existingQR) {
            throw new ApiError('QR code not found', 404);
        }

        const updateData: UpdateData = {
            qr_code: ''
        };

        // If new image is provided, update it
        if (qr_image) {
            if (!qr_image.type.startsWith('image/')) {
                throw new ApiError('Only image files are allowed', 400);
            }

            if (qr_image.size > 5 * 1024 * 1024) {
                throw new ApiError('Image size should be less than 5MB', 400);
            }

            // Delete old image if exists
            if (existingQR.qr_code) {
                const oldFilePath = join(process.cwd(), 'public', existingQR.qr_code);
                try {
                    await unlink(oldFilePath);
                } catch (error) {
                    console.error('Error deleting old image:', error);
                }
            }

            // Create uploads directory
            const uploadsDir = join(process.cwd(), 'public/manageqr');
            await mkdir(uploadsDir, { recursive: true });

            // Generate unique filename
            const timestamp = Date.now();
            const extension = qr_image.name.split('.').pop();
            const filename = `qr_${timestamp}.${extension}`;
            const filePath = join(uploadsDir, filename);

            // Save new file
            const bytes = await qr_image.arrayBuffer();
            const buffer = Buffer.from(bytes);
            await writeFile(filePath, buffer);

            updateData.qr_code = `/manageqr/${filename}`;
        }

        // Update QR code
        const updatedQR = await ManageQR.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        return NextResponse.json({
            status: true,
            message: 'QR code updated successfully',
            data: updatedQR
        });

    } catch (error: unknown) {
        console.error('Error updating QR code:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to update QR code';
        const statusCode = error instanceof ApiError ? error.statusCode : 500;
        
        return NextResponse.json(
            { status: false, message: errorMessage },
            { status: statusCode }
        );
    }
}

// PATCH - Toggle QR code status
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) throw new ApiError("QR code ID is required", 400);

    const qrCode = await ManageQR.findById(id);
    if (!qrCode) throw new ApiError("QR code not found", 404);

    const ManageUpi = (await import("@/models/ManageUpi")).default;

    if (!qrCode.is_active) {
      // Activate this QR code and deactivate all UPIs
      await ManageQR.updateMany({}, { is_active: false });
      qrCode.is_active = true;
      await ManageUpi.updateMany({}, { is_active: false });
      await qrCode.save();

      return NextResponse.json({
        status: true,
        message: "QR code activated successfully",
        data: qrCode,
      });
    } else {
      // Deactivate this QR code and activate UPI instead
      qrCode.is_active = false;
      await qrCode.save();

      // Ensure at least one UPI becomes active
      const upi = await ManageUpi.findOne();
      if (upi) {
        await ManageUpi.updateMany({}, { is_active: false });
        upi.is_active = true;
        await upi.save();
      }

      return NextResponse.json({
        status: true,
        message: "QR code deactivated successfully and one UPI activated",
        data: qrCode,
      });
    }
  } catch (error: unknown) {
    console.error("Error toggling QR code status:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to toggle QR code status";
    const statusCode = error instanceof ApiError ? error.statusCode : 500;

    return NextResponse.json(
      { status: false, message: errorMessage },
      { status: statusCode }
    );
  }
}

// DELETE - Delete QR code
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            throw new ApiError('QR code ID is required', 400);
        }

        const qrCode = await ManageQR.findById(id);
        if (!qrCode) {
            throw new ApiError('QR code not found', 404);
        }

        // Delete image file if exists
        if (qrCode.qr_code) {
            const filePath = join(process.cwd(), 'public', qrCode.qr_code);
            try {
                await unlink(filePath);
            } catch (error) {
                console.error('Error deleting image file:', error);
            }
        }

        // Delete from database
        await ManageQR.findByIdAndDelete(id);

        return NextResponse.json({
            status: true,
            message: 'QR code deleted successfully'
        });

    } catch (error: unknown) {
        console.error('Error deleting QR code:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete QR code';
        const statusCode = error instanceof ApiError ? error.statusCode : 500;
        
        return NextResponse.json(
            { status: false, message: errorMessage },
            { status: statusCode }
        );
    }
}