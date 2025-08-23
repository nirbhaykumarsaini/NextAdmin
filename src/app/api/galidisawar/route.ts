import { NextRequest, NextResponse } from 'next/server';
import GalidisawarGame from '@/models/GalidisawarGame';
import connectDB from '@/config/db';
import ApiError from '@/lib/errors/APiError';
import logger from '@/config/logger';

connectDB();

// GET - Get all games
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const is_active = searchParams.get('is_active');
    
    let filter = {};
    if (is_active !== null) {
      filter = { is_active: is_active === 'true' };
    }
    
    const games = await GalidisawarGame.find(filter);
    return NextResponse.json({ 
      status: true, 
      data: games,
    });
  } catch (error: any) {
    logger.error('Error fetching games:', error);
    return NextResponse.json(
      { status: false, message: error.message },
    );
  }
}

// POST - Create a new game
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.game_name) {
      throw new ApiError('Game name is required');
    }
    
    if (!body.days || !Array.isArray(body.days) || body.days.length === 0) {
      throw new ApiError('At least one day configuration is required');
    }
    
    // Create the game
    const game = await GalidisawarGame.create(body);
    
    logger.info(`Game created: ${game._id}`);
    return NextResponse.json({ 
      status: true, 
      message: "Game created successfully" 
    });
  } catch (error: any) {
    logger.error('Error creating game:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { status: false, message: messages.join(', ') },
      );
    }
    
    return NextResponse.json(
      { status: false, message: error.message },
    );
  }
}

// PUT - Update a game
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      throw new ApiError('Game ID is required');
    }
    
    const body = await request.json();
    
    // Find and update the game
    const game = await GalidisawarGame.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!game) {
      throw new ApiError('Game not found');
    }
    
    logger.info(`Game updated: ${id}`);
    return NextResponse.json({ 
      status: true, 
      message: "Game updated successfully" 
    });
  } catch (error: any) {
    logger.error('Error updating game:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { status: false, message: messages.join(', ') },
      );
    }
    
    return NextResponse.json(
      { status: false, message: error.message },
    );
  }
}

// DELETE - Delete a game
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      throw new ApiError('Game ID is required');
    }
    
    const game = await GalidisawarGame.findByIdAndDelete(id);
    
    if (!game) {
      throw new ApiError('Game not found');
    }
    
    logger.info(`Game deleted: ${id}`);
    return NextResponse.json({ 
      status: true, 
      message: 'Game deleted successfully' 
    });
  } catch (error: any) {
    logger.error('Error deleting game:', error);
    return NextResponse.json(
      { status: false, message: error.message },
      { status: error.statusCode || 500 }
    );
  }
}

// PATCH - Update market status for days
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) throw new ApiError("Game ID is required");

    const body = await request.json();
    const { days } = body;

    if (!Array.isArray(days) || days.length === 0) {
      throw new ApiError("Days array is required");
    }

    const game = await GalidisawarGame.findById(id);
    if (!game) throw new ApiError("Game not found");

    // Update each day individually
    days.forEach((updatedDay) => {
      const existingDay = game.days.find((d: { day: string; }) => d.day === updatedDay.day);
      if (existingDay) {
        existingDay.open_time = updatedDay.open_time;
        existingDay.market_status = updatedDay.market_status;
      }
    });

    await game.save();

    return NextResponse.json({
      status: true,
      message: "Market days updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: false, 
        message: error.message || "Failed to update days status" 
      }
    );
  }
}

