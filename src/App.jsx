// App.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import { Toaster } from 'react-hot-toast';

import { auth, db } from './firebase/config';
import { setUser, setLoading, clearUser } from './store/features/userSlice';
import { setAuth, setReferralCode, clearReferralCode } from './store/features/appSlice';

import Login from './pages/Login';
import Home from './pages/Home';
import Wallet from './pages/Wallet';
import Send from './pages/Send';
import Receive from './pages/Receive';
import Referrals from './pages/Referrals';
import Hashrate from './pages/Hashrate';
import Leaderboard from './pages/Leaderboard';
import BottomNavbar from './components/BottomNavbar';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, referralCode } = useSelector((state) => state.app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      dispatch(setLoading(true));

      if (firebaseUser) {
        const { uid, email, displayName, photoURL } = firebaseUser;
        const walletAddress = `ANJROT-${uid.slice(0, 8)}-${uid.slice(-8)}`;
        const referralCodeGen = uid.slice(0, 8).toUpperCase();

        const userRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          // 🔥 CEK REFERRAL CODE DARI URL (disimpan di app.referralCode)
          let referredBy = null;
          const refCode = referralCode;

          if (refCode) {
            try {
              const usersRef = collection(db, 'users');
              const q = query(usersRef, where('referralCode', '==', refCode));
              const querySnapshot = await getDocs(q);
              
              if (!querySnapshot.empty) {
                const referrerDoc = querySnapshot.docs[0];
                const referrerData = referrerDoc.data();
                
                // 🔥 CEK APAKAH USER SUDAH PERNAH DI-REFER
                const isAlreadyReferred = referrerData.referrals && referrerData.referrals[uid];
                
                if (!isAlreadyReferred) {
                  referredBy = referrerDoc.id;
                  
                  // 🔥 BONUS 2 ANJROT UNTUK REFERRER
                  await updateDoc(doc(db, 'users', referrerDoc.id), {
                    balance: (referrerData.balance || 0) + 2,
                    [`referrals.${uid}`]: {
                      uid,
                      displayName: displayName || 'User',
                      joinedAt: new Date().toISOString(),
                      bonus: 2,
                    },
                    transactions: arrayUnion({
                      id: `tx_${Date.now()}`,
                      type: 'receive',
                      asset: 'ANJROT',
                      amount: 2,
                      status: 'completed',
                      timestamp: new Date().toISOString(),
                      note: `Bonus referral dari ${displayName || 'User'}`,
                    }),
                  });
                }
              }
            } catch (error) {
              console.error('Error processing referral:', error);
            }
            
            // 🔥 CLEAR REFERRAL CODE
            dispatch(clearReferralCode());
          }

          // 🔥 CREATE NEW USER
          const newUser = {
            uid,
            email,
            displayName: displayName || 'User',
            photoURL: photoURL || null,
            walletAddress,
            balance: 0,
            assets: {
              ANJROT: { symbol: 'ANJROT', balance: 0, usdValue: 0 },
              BTC: { symbol: 'BTC', balance: 0, usdValue: 0 },
              SOL: { symbol: 'SOL', balance: 0, usdValue: 0 },
              USDT: { symbol: 'USDT', balance: 0, usdValue: 0 },
            },
            transactions: [],
            mining: {
              isActive: false,
              rate: 0,
              totalHashrate: 0,
              hashPacks: [],
              startedAt: null,
              lastClaimedAt: null,
              totalEarned: 0,
              claimable: 0,
            },
            referralCode: referralCodeGen,
            referredBy: referredBy,
            referrals: {},
            daily: {
              streak: 0,
              lastClaimedAt: null,
            },
            createdAt: new Date().toISOString(),
          };

          await setDoc(userRef, newUser);
          dispatch(setUser(newUser));
        } else {
          // 🔥 REAL-TIME LISTENER
          const unsubscribeUser = onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
              dispatch(setUser(doc.data()));
            }
          });
          return () => unsubscribeUser();
        }

        dispatch(setAuth(true));
      } else {
        dispatch(clearUser());
        dispatch(setAuth(false));
      }

      dispatch(setLoading(false));
    });

    return () => unsubscribe();
  }, [dispatch, referralCode]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-orange-400 text-sm">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{ style: { background: '#1a1a2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" replace />} />
        <Route path="/wallet" element={isAuthenticated ? <Wallet /> : <Navigate to="/login" replace />} />
        <Route path="/send" element={isAuthenticated ? <Send /> : <Navigate to="/login" replace />} />
        <Route path="/receive" element={isAuthenticated ? <Receive /> : <Navigate to="/login" replace />} />
        <Route path="/referrals" element={isAuthenticated ? <Referrals /> : <Navigate to="/login" replace />} />
        <Route path="/hashrate" element={isAuthenticated ? <Hashrate /> : <Navigate to="/login" replace />} />
        <Route path="/leaderboard" element={isAuthenticated ? <Leaderboard /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {isAuthenticated && <BottomNavbar />}
    </BrowserRouter>
  );
}

export default App;