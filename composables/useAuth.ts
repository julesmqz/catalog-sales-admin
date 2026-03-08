import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  type User 
} from 'firebase/auth'

export const useAuth = () => {
  const { $auth } = useNuxtApp()
  const user = useState<User | null>('auth-user', () => null)
  const isLoading = ref(true)

  // Initialize listener
  if (import.meta.client) {
    onAuthStateChanged($auth, (firebaseUser) => {
      user.value = firebaseUser
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
      navigateTo('/login')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    isLoading,
    loginWithGoogle,
    logout
  }
}
