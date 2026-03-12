import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  Timestamp,
  orderBy
} from 'firebase/firestore'

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered'

export interface OrderItem {
  productId: string
  name: string      // snapshot del nombre al momento de crear
  price: number     // snapshot del precio al momento de crear
  qty: number
}

export interface Order {
  id: string
  tenantId: string
  customerId: string
  customerName: string   // snapshot
  items: OrderItem[]
  total: number
  status: OrderStatus
  notes?: string
  createdAt: Timestamp
}

export const useOrders = () => {
  const { $db } = useNuxtApp()
  const { tenantId } = useAuth()
  const orders = ref<Order[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const getAll = async () => {
    if (!tenantId.value) return
    isLoading.value = true
    error.value = null
    try {
      const q = query(
        collection($db, 'orders'), 
        where('tenantId', '==', tenantId.value),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      orders.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[]
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching orders:', err)
    } finally {
      isLoading.value = false
    }
  }

  const getById = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      const docRef = doc($db, 'orders', id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Order
      } else {
        throw new Error('Order not found')
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const create = async (data: Omit<Order, 'id' | 'tenantId' | 'createdAt'>) => {
    if (!tenantId.value) throw new Error('Tenant not identified')
    isLoading.value = true
    try {
      const newOrder: Omit<Order, 'id'> = {
        ...data,
        tenantId: tenantId.value,
        createdAt: Timestamp.now()
      }
      const docRef = await addDoc(collection($db, 'orders'), newOrder)
      return docRef.id
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateStatus = async (id: string, status: OrderStatus) => {
    isLoading.value = true
    try {
      const docRef = doc($db, 'orders', id)
      await updateDoc(docRef, { status })
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
      const docRef = doc($db, 'orders', id)
      await deleteDoc(docRef)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    orders,
    isLoading,
    error,
    getAll,
    getById,
    create,
    updateStatus,
    remove
  }
}
