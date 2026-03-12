import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  type User 
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export const useAuth = () => {
  const { $auth, $db } = useNuxtApp()
  const user = useState<User | null>('auth-user', () => null)
  const tenantId = useState<string | null>('auth-tenant-id', () => null)
  const isLoading = ref(true)

  const fetchTenantId = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc($db, 'users', uid))
      if (userDoc.exists()) {
        tenantId.value = userDoc.data().tenantId
      } else {
        // Create a default tenantId (same as uid for individual users by default)
        const defaultTenantId = uid
        await setDoc(doc($db, 'users', uid), {
          tenantId: defaultTenantId,
          email: user.value?.email,
          updatedAt: new Date()
        })
        tenantId.value = defaultTenantId
      }
    } catch (error) {
      console.error('Error fetching tenantId:', error)
    }
  }

  // Initialize listener
  if (import.meta.client) {
    onAuthStateChanged($auth, async (firebaseUser) => {
      user.value = firebaseUser
      if (firebaseUser) {
        await fetchTenantId(firebaseUser.uid)
      } else {
        tenantId.value = null
      }
      isLoading.value = false
    })
  }

  const loginWithGoogle = async () => {
    isLoading.value = true
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup($auth, provider)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    isLoading.value = true
    try {
      await signOut($auth)
      user.value = null
      tenantId.value = null
      navigateTo('/login')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    tenantId,
    isLoading,
    loginWithGoogle,
    logout
  }
}
