import { NextResponse } from 'next/server';

// Simulation of FedaPay/KKiaPay API response for Escrow payment initiation
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, amountPaid, clientPhone } = body;

    // Here we would normally interact with Supabase and FedaPay API
    // 1. Create Order in Supabase with status 'PENDING'
    // 2. Call FedaPay API to generate payment link
    // 3. Return payment link to client

    console.log(`[Escrow API] Initiated checkout for ${productId} by ${clientPhone} - Amount: ${amountPaid} CFA`);

    return NextResponse.json({
      success: true,
      transaction_id: `TL-ESCROW-${Date.now()}`,
      status: 'AWAITING_PAYMENT',
      payment_url: `https://sandbox.fedapay.com/pay/TL-${Date.now()}`,
      message: 'Fonds prêts à être mis sous séquestre.'
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Payment initiation failed' }, { status: 500 });
  }
}
