import { NextResponse } from 'next/server';
import { createWalletClient, http, parseUnits, isAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import { CONTRACT_ADDRESSES } from '../../../contracts/addresses';
import { MOCK_USDT_ABI } from '../../../contracts/abis';

// In-memory rate-limit trackers (per IP & per Wallet Address)
const ipClaimMap = new Map();
const addressClaimMap = new Map();

const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 Hours in milliseconds

function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

// GET: Check eligibility for IP & Address
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address')?.toLowerCase();
  const clientIp = getClientIp(request);
  const now = Date.now();

  const ipLastClaim = ipClaimMap.get(clientIp) || 0;
  const addressLastClaim = address ? (addressClaimMap.get(address) || 0) : 0;

  const ipElapsed = now - ipLastClaim;
  const addressElapsed = now - addressLastClaim;

  const isIpLocked = ipElapsed < COOLDOWN_MS;
  const isAddressLocked = address ? addressElapsed < COOLDOWN_MS : false;

  const canClaim = !isIpLocked && !isAddressLocked;
  const remainingMs = Math.max(
    isIpLocked ? COOLDOWN_MS - ipElapsed : 0,
    isAddressLocked ? COOLDOWN_MS - addressElapsed : 0
  );

  return NextResponse.json({
    canClaim,
    remainingSeconds: Math.ceil(remainingMs / 1000),
    clientIp,
    cooldownPeriodHours: 24,
  });
}

// POST: Claim 100 mUSDT
export async function POST(request) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address || !isAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid recipient wallet address' },
        { status: 400 }
      );
    }

    const clientIp = getClientIp(request);
    const normalizedAddress = address.toLowerCase();
    const now = Date.now();

    // Check IP rate limit (1 per 24 hours per IP)
    const ipLastClaim = ipClaimMap.get(clientIp) || 0;
    if (now - ipLastClaim < COOLDOWN_MS) {
      const remainingSecs = Math.ceil((COOLDOWN_MS - (now - ipLastClaim)) / 1000);
      const hours = Math.floor(remainingSecs / 3600);
      const mins = Math.floor((remainingSecs % 3600) / 60);
      return NextResponse.json(
        {
          error: `IP Rate limit: Faucet can only be claimed once per 24h per IP. Please try again in ${hours}h ${mins}m.`,
          remainingSeconds: remainingSecs,
        },
        { status: 429 }
      );
    }

    // Check Address rate limit (1 per 24 hours per Wallet)
    const addressLastClaim = addressClaimMap.get(normalizedAddress) || 0;
    if (now - addressLastClaim < COOLDOWN_MS) {
      const remainingSecs = Math.ceil((COOLDOWN_MS - (now - addressLastClaim)) / 1000);
      return NextResponse.json(
        {
          error: `Wallet Rate limit: This wallet already claimed faucet within 24 hours.`,
          remainingSeconds: remainingSecs,
        },
        { status: 429 }
      );
    }

    // Check server private key configuration
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        { error: 'Server faucet configuration missing PRIVATE_KEY' },
        { status: 500 }
      );
    }

    const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    const account = privateKeyToAccount(formattedKey);

    const client = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'),
    });

    // Mint 100 mUSDT (100 * 10^6)
    const txHash = await client.writeContract({
      address: CONTRACT_ADDRESSES.MockUSDT,
      abi: MOCK_USDT_ABI,
      functionName: 'mint',
      args: [address, parseUnits('100', 6)],
    });

    // Record claim timestamp for both IP and Wallet
    ipClaimMap.set(clientIp, now);
    addressClaimMap.set(normalizedAddress, now);

    return NextResponse.json({
      success: true,
      message: '100 mUSDT transferred successfully!',
      txHash,
      recipient: address,
      clientIp,
      nextClaimTime: new Date(now + COOLDOWN_MS).toISOString(),
    });
  } catch (error) {
    console.error('Faucet error:', error);
    return NextResponse.json(
      { error: error.shortMessage || error.message || 'Faucet distribution failed' },
      { status: 500 }
    );
  }
}
