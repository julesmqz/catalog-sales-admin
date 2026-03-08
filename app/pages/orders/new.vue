<script setup lang="ts">
import type { OrderItem, OrderStatus } from '~/composables/useOrders'

definePageMeta({
  middleware: 'auth'
})

const { customers, getAll: fetchCustomers } = useCustomers()
const { products, getAll: fetchProducts } = useProducts()
const { create, isLoading } = useOrders()
const router = useRouter()

const orderData = reactive({
  customerId: '',
  customerName: '',
  items: [] as OrderItem[],
  notes: '',
  status: 'pending' as OrderStatus
})

// Búsqueda de clientes
const customerSearch = ref('')
const filteredCustomers = computed(() => {
  if (!customerSearch.value) return customers.value
  return customers.value.filter(c => 
    c.name.toLowerCase().includes(customerSearch.value.toLowerCase())
  )
})

const selectCustomer = (customer: any) => {
  orderData.customerId = customer.id
  orderData.customerName = customer.name
  customerSearch.value = customer.name
}

// Agregar productos
const selectedProductId = ref('')
const quantity = ref(1)

const addProduct = () => {
  const product = products.value.find(p => p.id === selectedProductId.ref?.value || p.id === selectedProductId.value)
  if (!product || quantity.value < 1) return

  const existingItem = orderData.items.find(item => item.productId === product.id)
  if (existingItem) {
    existingItem.qty += quantity.value
  } else {
    orderData.items.push({
      productId: product.id!,
      name: product.name,
      price: product.price,
      qty: quantity.value
    })
  }
  
  // Reset fields
  selectedProductId.value = ''
  quantity.value = 1
}

const removeItem = (index: number) => {
  orderData.items.splice(index, 1)
}

const total = computed(() => {
  return orderData.items.reduce((sum, item) => sum + (item.price * item.qty), 0)
})

const saveOrder = async () => {
  if (!orderData.customerId) {
    alert('Por favor selecciona un cliente')
    return
  }
  if (orderData.items.length === 0) {
    alert('Agrega al menos un producto al pedido')
    return
  }

  try {
    await create({
      customerId: orderData.customerId,
      customerName: orderData.customerName,
      items: orderData.items,
      total: total.value,
      status: orderData.status,
      notes: orderData.notes
    })
    router.push('/orders')
  } catch (err) {
    alert('Error al crear el pedido')
  }
}

onMounted(() => {
  fetchCustomers()
  fetchProducts()
})
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <div class="flex items-center gap-4">
      <NuxtLink to="/orders" class="text-blue-600 hover:underline">← Volver</NuxtLink>
      <h2 class="text-3xl font-bold">Nuevo Pedido</h2>
    </div>

    <div class="grid gap-8 md:grid-cols-3">
      <!-- Columna Izquierda: Cliente y Notas -->
      <div class="md:col-span-1 space-y-6">
        <div class="bg-white p-6 rounded-lg border shadow-sm space-y-4">
          <h3 class="font-bold border-b pb-2">Cliente</h3>
          <div class="relative">
            <label class="block text-sm font-medium mb-1">Buscar Cliente</label>
            <input 
              v-model="customerSearch" 
              type="text" 
              placeholder="Nombre del cliente..."
              class="w-full border rounded-md px-3 py-2"
            />
            <div v-if="customerSearch && orderData.customerName !== customerSearch" class="absolute z-10 w-full bg-white border rounded-md mt-1 shadow-lg max-h-48 overflow-y-auto">
              <div 
                v-for="customer in filteredCustomers" 
                :key="customer.id"
                @click="selectCustomer(customer)"
                class="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              >
                {{ customer.name }}
              </div>
              <div v-if="filteredCustomers.length === 0" class="px-3 py-2 text-gray-500 text-sm">
                No se encontraron clientes
              </div>
            </div>
          </div>
          <div v-if="orderData.customerId" class="bg-blue-50 p-2 rounded text-sm text-blue-700">
            Seleccionado: <strong>{{ orderData.customerName }}</strong>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg border shadow-sm space-y-4">
          <h3 class="font-bold border-b pb-2">Notas</h3>
          <textarea 
            v-model="orderData.notes" 
            rows="4" 
            placeholder="Notas adicionales..."
            class="w-full border rounded-md px-3 py-2 text-sm"
          ></textarea>
        </div>
      </div>

      <!-- Columna Derecha: Productos -->
      <div class="md:col-span-2 space-y-6">
        <div class="bg-white p-6 rounded-lg border shadow-sm space-y-4">
          <h3 class="font-bold border-b pb-2">Productos</h3>
          
          <div class="flex gap-2">
            <div class="flex-1">
              <select v-model="selectedProductId" class="w-full border rounded-md px-3 py-2 text-sm">
                <option value="" disabled>Seleccionar producto</option>
                <option v-for="product in products" :key="product.id" :value="product.id">
                  {{ product.name }} (${{ product.price }})
                </option>
              </select>
            </div>
            <div class="w-24">
              <input 
                v-model.number="quantity" 
                type="number" 
                min="1" 
                class="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>
            <button 
              @click="addProduct"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              Agregar
            </button>
          </div>

          <!-- Tabla de items -->
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
              <thead class="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th class="px-4 py-2">Producto</th>
                  <th class="px-4 py-2">Precio</th>
                  <th class="px-4 py-2">Cant.</th>
                  <th class="px-4 py-2">Subtotal</th>
                  <th class="px-4 py-2 text-right"></th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr v-for="(item, index) in orderData.items" :key="item.productId">
                  <td class="px-4 py-3">{{ item.name }}</td>
                  <td class="px-4 py-3">${{ item.price }}</td>
                  <td class="px-4 py-3">{{ item.qty }}</td>
                  <td class="px-4 py-3 font-medium">${{ (item.price * item.qty).toFixed(2) }}</td>
                  <td class="px-4 py-3 text-right">
                    <button @click="removeItem(index)" class="text-red-500 hover:text-red-700">
                      Eliminar
                    </button>
                  </td>
                </tr>
                <tr v-if="orderData.items.length === 0">
                  <td colspan="5" class="px-4 py-8 text-center text-gray-400 italic">
                    No hay productos agregados
                  </td>
                </tr>
              </tbody>
              <tfoot v-if="orderData.items.length > 0">
                <tr class="font-bold text-lg">
                  <td colspan="3" class="px-4 py-4 text-right">Total:</td>
                  <td class="px-4 py-4 text-blue-600">${{ total.toFixed(2) }}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div class="flex justify-end">
          <button 
            @click="saveOrder"
            :disabled="isLoading"
            class="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 font-bold shadow-lg disabled:opacity-50"
          >
            {{ isLoading ? 'Guardando...' : 'Guardar pedido' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
