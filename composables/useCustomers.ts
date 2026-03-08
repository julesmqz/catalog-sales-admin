import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  Timestamp,
  orderBy
} from 'firebase/firestore'

export interface Customer {
  id?: string
  userId: string
  name: string
  phone: string
  address?: string
  notes?: string
  createdAt: Timestamp
}

export const useCustomers = () => {
  const { $db } = useNuxtApp()
  const { user } = useAuth()
  const customers = ref<Customer[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const getAll = async () => {
    if (!user.value) return
    isLoading.value = true
    error.value = null
    try {
      const q = query(
        collection($db, 'customers'), 
        where('userId', '==', user.value.uid),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      customers.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Customer[]
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching customers:', err)
    } finally {
      isLoading.value = false
    }
  }

  const create = async (data: Omit<Customer, 'id' | 'userId' | 'createdAt'>) => {
    if (!user.value) throw new Error('User not authenticated')
    isLoading.value = true
    try {
      const newCustomer: Omit<Customer, 'id'> = {
        ...data,
        userId: user.value.uid,
        createdAt: Timestamp.now()
      }
      const docRef = await addDoc(collection($db, 'customers'), newCustomer)
      return docRef.id
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const update = async (id: string, data: Partial<Omit<Customer, 'id' | 'userId' | 'createdAt'>>) => {
    isLoading.value = true
    try {
      const docRef = doc($db, 'customers', id)
      await updateDoc(docRef, data)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const remove = async (id: string) => {
    isLoading.value = true
    try {
      const docRef = doc($db, 'customers', id)
      await deleteDoc(docRef)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    customers,
    isLoading,
    error,
    getAll,
    create,
    update,
    remove
  }
}
