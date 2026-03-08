<script setup lang="ts">
import type { Order } from '~/composables/useOrders'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const { getById, isLoading, error } = useOrders()
const selectedOrders = ref<Order[]>([])

const orderIds = computed(() => {
  const ids = route.query.ids as string
  return ids ? ids.split(',') : []
})

const fetchOrders = async () => {
  if (orderIds.value.length === 0) return
  
  try {
    const promises = orderIds.value.map(id => getById(id))
    selectedOrders.value = await Promise.all(promises)
  } catch (err) {
    console.error('Error fetching orders for summary:', err)
  }
}

interface SummaryItem {
  productId: string
  name: string
  totalQty: number
}

const summary = computed(() => {
  const itemsMap: Record<string, SummaryItem> = {}
  
  selectedOrders.value.forEach(order => {
    order.items.forEach(item => {
      if (itemsMap[item.productId]) {
        itemsMap[item.productId].totalQty += item.qty
      } else {
        itemsMap[item.productId] = {
          productId: item.productId,
          name: item.name,
          totalQty: item.qty
        }
      }
    })
  })
  
  return Object.values(itemsMap).sort((a, b) => b.totalQty - a.totalQty)
})

const copyToClipboard = async () => {
  const dateStr = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date()).replace('.', '')

  let text = `Resumen de compra — ${dateStr}\n`
  text += '─'.repeat(30) + '\n'
  
  summary.value.forEach(item => {
    text += `${item.name.padEnd(20)} x${item.totalQty}\n`
  })
  
  try {
    await navigator.clipboard.writeText(text)
    alert('Resumen copiado al portapapeles')
  } catch (err) {
    console.error('Failed to copy: ', err)
    alert('Error al copiar al portapapeles')
  }
}

onMounted(fetchOrders)
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-4">
        <button 
          @click="navigateTo('/orders')" 
          class="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Volver"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 class="text-3xl font-bold text-gray-900">Resumen de Compra</h2>
      </div>
      <button 
        @click="copyToClipboard"
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium flex items-center gap-2 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
        Copiar lista
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-20 text-gray-500 bg-white border rounded-lg shadow-sm">
      <div class="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
      <p>Generando resumen...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 text-red-700 p-6 rounded-lg border border-red-100">
      <p class="font-bold mb-2">Error al cargar pedidos</p>
      <p>{{ error }}</p>
      <button @click="fetchOrders" class="mt-4 text-blue-600 font-medium hover:underline">Reintentar</button>
    </div>

    <div v-else-if="summary.length === 0" class="text-center py-20 bg-white border rounded-lg text-gray-500 shadow-sm">
      No hay productos para mostrar.
    </div>

    <div v-else class="bg-white border rounded-lg shadow-sm overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-gray-50 border-b text-gray-600 uppercase text-xs font-bold">
          <tr>
            <th class="px-8 py-4">Producto</th>
            <th class="px-8 py-4 text-right">Cantidad Total</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="item in summary" :key="item.productId" class="hover:bg-gray-50 transition-colors">
            <td class="px-8 py-5 font-medium text-gray-900">
              {{ item.name }}
            </td>
            <td class="px-8 py-5 text-right font-bold text-lg text-blue-600">
              x{{ item.totalQty }}
            </td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-50 font-bold border-t">
          <tr>
            <td class="px-8 py-4 text-gray-600 italic">
              {{ selectedOrders.length }} pedidos seleccionados
            </td>
            <td class="px-8 py-4 text-right">
              Total items: {{ summary.reduce((acc, curr) => acc + curr.totalQty, 0) }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>
