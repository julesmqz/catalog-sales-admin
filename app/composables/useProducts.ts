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

export interface Product {
  id?: string
  tenantId: string
  name: string
  price: number
  description?: string
  imageUrl?: string
  createdAt: Timestamp
}

export const useProducts = () => {
  const { $db } = useNuxtApp()
  const { tenantId } = useAuth()
  const products = ref<Product[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const getAll = async () => {
    if (!tenantId.value) return
    isLoading.value = true
    error.value = null
    try {
      const q = query(
        collection($db, 'products'), 
        where('tenantId', '==', tenantId.value),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      products.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[]
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching products:', err)
    } finally {
      isLoading.value = false
    }
  }

  const create = async (data: Omit<Product, 'id' | 'tenantId' | 'createdAt'>) => {
    if (!tenantId.value) throw new Error('Tenant not identified')
    isLoading.value = true
    try {
      const newProduct: Omit<Product, 'id'> = {
        ...data,
        tenantId: tenantId.value,
        createdAt: Timestamp.now()
      }
      const docRef = await addDoc(collection($db, 'products'), newProduct)
      return docRef.id
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const update = async (id: string, data: Partial<Omit<Product, 'id' | 'tenantId' | 'createdAt'>>) => {
    isLoading.value = true
    try {
      const docRef = doc($db, 'products', id)
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
      const docRef = doc($db, 'products', id)
      await deleteDoc(docRef)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    products,
    isLoading,
    error,
    getAll,
    create,
    update,
    remove
  }
}
