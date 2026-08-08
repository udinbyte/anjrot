// store/authStore.js
import { create } from 'zustand';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  arrayUnion 
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const googleProvider = new GoogleAuthProvider();

const useAuthStore = create((set, get) => ({
  // 🔥 STATE
  user: null,
  isAuthenticated: false,
  isLoading: true,
  referralCode: null,

  setReferralCode: (code) => set({ referralCode: code }),
  clearReferralCode: () => set({ referralCode: null }),

  // 🔥 INIT AUTH LISTENER
  initAuth: () => {
    console.log('🔥 Zustand: Init auth listener...');

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔥 Zustand: onAuthStateChanged', firebaseUser?.uid || 'No user');
      
      try {
        set({ isLoading: true });

        if (firebaseUser) {
          const { uid, email, displayName, photoURL } = firebaseUser;
          const walletAddress = `ANJROT-${uid.slice(0, 8)}-${uid.slice(-8)}`;
          const referralCodeGen = uid.slice(0, 8).toUpperCase();

          const userRef = doc(db, 'users', uid);
          const userDoc = await getDoc(userRef);
          const refCode = get().referralCode;

          if (!userDoc.exists()) {
            let referredBy = null;

            if (refCode) {
              try {
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('referralCode', '==', refCode));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                  const referrerDoc = querySnapshot.docs[0];
                  const referrerData = referrerDoc.data();
                  const isAlreadyReferred = referrerData.referrals && referrerData.referrals[uid];

                  if (!isAlreadyReferred) {
                    referredBy = referrerDoc.id;
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
              get().clearReferralCode();
            }

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
            set({ user: newUser });
          } else {
            const unsubscribeUser = onSnapshot(userRef, (doc) => {
              if (doc.exists()) {
                set({ user: doc.data() });
              }
            });
            get()._unsubscribeUser = unsubscribeUser;
          }

          set({ 
            isAuthenticated: true, 
            isLoading: false 
          });
        } else {
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      } catch (error) {
        console.error('🔥 Auth error:', error);
        set({ 
          isAuthenticated: false, 
          isLoading: false 
        });
      }
    });

    set({ _unsubscribeAuth: unsubscribe });
  },

  // 🔥 LOGIN
  login: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  },

  // 🔥 LOGOUT
  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null, isAuthenticated: false });
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  },

  // 🔥 CLEANUP
  cleanup: () => {
    const { _unsubscribeAuth, _unsubscribeUser } = get();
    if (_unsubscribeAuth) {
      _unsubscribeAuth();
    }
    if (_unsubscribeUser) {
      _unsubscribeUser();
    }
  },

  // 🔥 UPDATE BALANCE
  updateBalance: (newBalance) => {
    set((state) => ({
      user: state.user ? { ...state.user, balance: newBalance } : null
    }));
  },

  // 🔥 ADD TRANSACTION
  addTransaction: (transaction) => {
    set((state) => ({
      user: state.user ? { 
        ...state.user, 
        transactions: [transaction, ...(state.user.transactions || [])] 
      } : null
    }));
  },

  // 🔥 UPDATE MINING
  updateMining: (data) => {
    set((state) => ({
      user: state.user ? { 
        ...state.user, 
        mining: { ...state.user.mining, ...data } 
      } : null
    }));
  },

  // 🔥 ADD HASH PACK
  addHashPack: (pack) => {
    set((state) => {
      if (!state.user) return { user: null };
      const mining = state.user.mining || {};
      const hashPacks = [...(mining.hashPacks || []), pack];
      const totalHashrate = (mining.totalHashrate || 0) + pack.hashrate;
      return {
        user: {
          ...state.user,
          mining: {
            ...mining,
            hashPacks,
            totalHashrate,
            rate: totalHashrate
          }
        }
      };
    });
  },
}));

export default useAuthStore;