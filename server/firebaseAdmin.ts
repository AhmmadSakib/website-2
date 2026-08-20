import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: App | null = null;

export function getFirebaseAdmin(): App {
  if (!adminApp) {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      adminApp = existingApps[0]!;
    } else {
      try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
          const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
          adminApp = initializeApp({
            credential: cert(serviceAccount),
            projectId: 'gen-lang-client-0648006148',
            storageBucket: 'gen-lang-client-0648006148.firebasestorage.app',
          });
        } else {
          adminApp = initializeApp({
            projectId: 'gen-lang-client-0648006148',
            storageBucket: 'gen-lang-client-0648006148.firebasestorage.app',
          });
        }
        console.log('[FIREBASE ADMIN] Initialized successfully for project gen-lang-client-0648006148');
      } catch (err) {
        console.warn('[FIREBASE ADMIN] Initialization warning:', err);
        adminApp = initializeApp({
          projectId: 'gen-lang-client-0648006148',
        });
      }
    }
  }
  return adminApp;
}

export async function verifyToken(idToken: string) {
  const app = getFirebaseAdmin();
  const auth = getAuth(app);
  return await auth.verifyIdToken(idToken);
}

export async function assignOwnerCustomClaim(uid: string, email: string) {
  const app = getFirebaseAdmin();
  const auth = getAuth(app);
  console.log(`[FIREBASE ADMIN] Assigning OWNER custom claim to UID: ${uid} (email: ${email})`);
  
  await auth.setCustomUserClaims(uid, {
    role: 'OWNER',
    owner: true,
    status: 'active',
  });

  // Also sync with Firestore if Firestore Admin is accessible
  try {
    const firestore = getFirestore(app);
    await firestore.collection('users').doc(uid).set(
      {
        uid,
        email,
        role: 'OWNER',
        status: 'active',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (dbErr) {
    console.warn('[FIREBASE ADMIN] Note: Firestore doc sync via Admin SDK:', dbErr);
  }

  return { success: true, uid, role: 'OWNER', status: 'active' };
}

export async function assignUserCustomClaim(uid: string, role: 'TRUSTED' | 'LIMITED', status: string) {
  const app = getFirebaseAdmin();
  const auth = getAuth(app);
  await auth.setCustomUserClaims(uid, {
    role,
    owner: false,
    status,
  });

  try {
    const firestore = getFirestore(app);
    await firestore.collection('users').doc(uid).set(
      {
        uid,
        role,
        status,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (e) {
    console.warn('[FIREBASE ADMIN] Note: Firestore user doc update:', e);
  }

  return { success: true, uid, role, status };
}
