<script setup lang="ts">
import type { OrderStatus } from '~/composables/useOrders'

definePageMeta({
  middleware: 'auth'
})

const { orders, getAll, isLoading, error } = useOrders()
const filterStatus = ref<OrderStatus | 'all'>('all')
const selectedOrderIds = ref<string[]>([])

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pendiente de pago',
  paid: 'Pagado',
  shipped: 'Enviado',
  delivered: 'Entregado'
}

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  paid: 'bg-blue-100 text-blue-800 border-blue-200',
  shipped: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-green-100 text-green-800 border-green-200'
}

const filteredOrders = computed(() => {
  let result = [...orders.value]
  
  // Ordenar por fecha desc por defecto
  result.sort((a, b) => {
    const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime()
    const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime()
    return dateB - dateA
  })

  if (filterStatus.value === 'all') return result
  return result.filter(order => order.status === filterStatus.value)
})

const isAllSelected = computed(() => {
  return filteredOrders.value.length > 0 && filteredOrders.value.every(order => selectedOrderIds.value.includes(order.id))
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    const filteredIds = filteredOrders.value.map(o => o.id)
    selectedOrderIds.value = selectedOrderIds.value.filter(id => !filteredIds.includes(id))
  } else {
    const newSelected = [...selectedOrderIds.value]
    filteredOrders.value.forEach(order => {
      if (!newSelected.includes(order.id)) {
        newSelected.push(order.id)
      }
    })
    selectedOrderIds.value = newSelected
  }
}

const toggleSelectOrder = (id: string) => {
  const index = selectedOrderIds.value.indexOf(id)
  if (index > -1) {
    selectedOrderIds.value.splice(index, 1)
  } else {
    selectedOrderIds.value.push(id)
  }
}

const goToSummary = () => {
  if (selectedOrderIds.value.length === 0) return
  navigateTo({
    path: '/orders/summary',
    query: { ids: selectedOrderIds.value.join(',') }
  })
}

const formatDate = (timestamp: any) => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date).replace('.', '')
}

onMounted(getAll)
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-3xl font-bold">Pedidos</h2>
      <div class="flex gap-2">
        <button 
          v-if="selectedOrderIds.length > 0"
          @click="goToSummary"
          class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium transition-all"
        >
          Ver resumen ({{ selectedOrderIds.length }})
        </button>
        <NuxtLink 
          to="/orders/new"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
        >
          Nuevo Pedido
        </NuxtLink>
      </div>
    </div>

    <!-- Filtros -->
    <div class="flex flex-wrap gap-2 bg-white p-2 rounded-lg border shadow-sm">
      <button 
        @click="filterStatus = 'all'"
        :class="['px-4 py-2 rounded-md text-sm font-medium transition-colors', filterStatus === 'all' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-600']"
      >
        Todos
      </button>
      <button 
        v-for="(label, status) in statusLabels" 
        :key="status"
        @click="filterStatus = status"
        :class="['px-4 py-2 rounded-md text-sm font-medium transition-colors', filterStatus === status ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-600']"
      >
        {{ label }}
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-10 text-gray-500">
      Cargando pedidos...
    </div>

    <div v-else-if="error" class="bg-red-50 text-red-700 p-4 rounded-md">
      {{ error }}
    </div>

    <div v-else-if="filteredOrders.length === 0" class="text-center py-12 bg-white border rounded-lg text-gray-500">
      No se encontraron pedidos.
    </div>

    <div v-else class="bg-white border rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-gray-50 border-b text-gray-600 uppercase text-xs font-bold">
            <tr>
              <th class="px-6 py-4 w-10">
                <input 
                  type="checkbox" 
                  :checked="isAllSelected" 
                  @change="toggleSelectAll"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                >
              </th>
              <th class="px-6 py-4">Cliente</th>
              <th class="px-6 py-4">Fecha</th>
              <th class="px-6 py-4 text-right">Total</th>
              <th class="px-6 py-4 text-center">Estado</th>
              <th class="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr 
              v-for="order in filteredOrders" 
              :key="order.id"
              class="hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td class="px-6 py-4" @click.stop>
                <input 
                  type="checkbox" 
                  :checked="selectedOrderIds.includes(order.id)" 
                  @change="toggleSelectOrder(order.id)"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                >
              </td>
              <td class="px-6 py-4 font-medium text-gray-900" @click="navigateTo(`/orders/${order.id}`)">
                {{ order.customerName }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600" @click="navigateTo(`/orders/${order.id}`)">
                {{ formatDate(order.createdAt) }}
              </td>
              <td class="px-6 py-4 text-right font-bold text-blue-600" @click="navigateTo(`/orders/${order.id}`)">
                ${{ order.total.toFixed(2) }}
              </td>
              <td class="px-6 py-4" @click="navigateTo(`/orders/${order.id}`)">
                <div class="flex justify-center">
                  <span :class="['px-2 py-1 rounded-full text-xs font-semibold border', statusColors[order.status]]">
                    {{ statusLabels[order.status] }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-right text-gray-400" @click="navigateTo(`/orders/${order.id}`)">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="9 5l7 7-7 7" />
                </svg>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
