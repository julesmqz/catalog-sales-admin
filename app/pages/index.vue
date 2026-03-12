<script setup lang="ts">
import type { OrderStatus } from '~/composables/useOrders'

definePageMeta({
  middleware: 'auth'
})

const { user, tenantId } = useAuth()
const { orders, getAll: getOrders, isLoading: loadingOrders } = useOrders()
const { products, getAll: getProducts } = useProducts()
const { customers, getAll: getCustomers } = useCustomers()

watch(tenantId, (newId) => {
  if (newId) {
    getOrders()
    getProducts()
    getCustomers()
  }
}, { immediate: true })

const stats = computed(() => {
  const counts = {
    pending: 0,
    paid: 0,
    shipped: 0,
    delivered: 0
  }
  
  orders.value.forEach(order => {
    if (counts[order.status] !== undefined) {
      counts[order.status]++
    }
  })
  
  return counts
})

const recentOrders = computed(() => {
  return [...orders.value]
    .sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime()
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime()
      return dateB - dateA
    })
    .slice(0, 10)
})

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

const formatDate = (timestamp: any) => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short'
  }).format(date).replace('.', '')
}
</script>

<template>
  <div class="space-y-8">
    <header>
      <h2 class="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
      <p class="text-gray-500">Bienvenido, {{ user?.displayName || user?.email || 'Usuario' }}.</p>
    </header>

    <!-- Tarjetas de Resumen -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="(label, status) in statusLabels" :key="status" class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
        <span class="text-sm font-medium text-gray-500 uppercase tracking-wider">{{ label }}</span>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-3xl font-bold text-gray-900">{{ stats[status] }}</span>
          <span class="text-sm text-gray-400">pedidos</span>
        </div>
        <div :class="['mt-4 h-1.5 w-full rounded-full', statusColors[status].split(' ')[0]]"></div>
      </div>
    </div>

    <!-- Otros Totales (Opcional, pero estaba en el original) -->
    <div class="grid gap-4 md:grid-cols-2">
      <div class="bg-white p-4 rounded-lg border border-gray-100 flex items-center gap-4">
        <div class="p-3 bg-blue-50 text-blue-600 rounded-lg">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
        </div>
        <div>
          <p class="text-sm text-gray-500 font-medium">Total Productos</p>
          <p class="text-xl font-bold">{{ products.length }}</p>
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg border border-gray-100 flex items-center gap-4">
        <div class="p-3 bg-green-50 text-green-600 rounded-lg">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        </div>
        <div>
          <p class="text-sm text-gray-500 font-medium">Total Clientes</p>
          <p class="text-xl font-bold">{{ customers.length }}</p>
        </div>
      </div>
    </div>

    <!-- Pedidos Recientes -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 class="text-lg font-bold text-gray-900">Pedidos Recientes</h3>
        <NuxtLink to="/orders" class="text-sm font-medium text-blue-600 hover:text-blue-700">Ver todos</NuxtLink>
      </div>
      
      <div v-if="loadingOrders" class="p-10 text-center text-gray-500">
        Cargando pedidos...
      </div>
      
      <div v-else-if="recentOrders.length === 0" class="p-10 text-center text-gray-500">
        No hay pedidos recientes.
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
            <tr>
              <th class="px-6 py-3">Cliente</th>
              <th class="px-6 py-3">Fecha</th>
              <th class="px-6 py-3 text-right">Total</th>
              <th class="px-6 py-3 text-center">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr 
              v-for="order in recentOrders" 
              :key="order.id"
              @click="navigateTo(`/orders/${order.id}`)"
              class="hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td class="px-6 py-4 font-medium text-gray-900">{{ order.customerName }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(order.createdAt) }}</td>
              <td class="px-6 py-4 text-right font-bold text-blue-600">${{ order.total.toFixed(2) }}</td>
              <td class="px-6 py-4 text-center">
                <span :class="['px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border', statusColors[order.status]]">
                  {{ statusLabels[order.status].split(' ')[0] }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
