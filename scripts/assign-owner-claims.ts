import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirebaseAdmin, assignOwnerCustomClaim } from '../server/firebaseAdmin.js';

async function main() {
  const targetEmail = process.argv[2] || 'ahmmadsakib18524@gmail.com';
  console.log(`[ZERO-TRUST CLAIM ENGINE] Provisioning OWNER claims for: ${targetEmail}`);

  try {
    const adminApp = getFirebaseAdmin();
    const auth = getAuth(adminApp);
    const userRecord = await auth.getUserByEmail(targetEmail);
    console.log(`[USER FOUND] UID: ${userRecord.uid}`);

    await assignOwnerCustomClaim(userRecord.uid, targetEmail);
    console.log(`[SUCCESS] Custom claim { role: 'OWNER', owner: true, status: 'active' } set on UID: ${userRecord.uid}`);
    process.exit(0);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      console.log(`[INFO] No Firebase Auth user found with email ${targetEmail} yet.`);
      console.log(`Once the user creates their account or logs in with ${targetEmail}, the server will automatically assign OWNER claims via /api/auth/sync-claims.`);
    } else {
      console.error('[ERROR]', error);
    }
    process.exit(0);
  }
}

main();
