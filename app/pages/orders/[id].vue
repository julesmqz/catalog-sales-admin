<script setup lang="ts">
import type { Order, OrderStatus } from '~/composables/useOrders'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const { getById, updateStatus, isLoading, error } = useOrders()
const { tenantId } = useAuth()
const order = ref<Order | null>(null)
const selectedStatus = ref<OrderStatus>('pending')

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

const fetchOrder = async () => {
  const id = route.params.id as string
  try {
    const data = await getById(id)
    order.value = data
    selectedStatus.value = data.status
  } catch (err) {
    console.error(err)
  }
}

watch(tenantId, (newId) => {
  if (newId) fetchOrder()
}, { immediate: true })

const handleUpdateStatus = async () => {
  if (!order.value) return
  try {
    await updateStatus(order.value.id, selectedStatus.value)
    order.value.status = selectedStatus.value
    alert('Estado actualizado correctamente')
  } catch (err) {
    alert('Error al actualizar estado')
  }
}

const formatDate = (timestamp: any) => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <NuxtLink to="/orders" class="text-blue-600 hover:underline">← Volver</NuxtLink>
        <h2 class="text-3xl font-bold">Detalle de Pedido</h2>
      </div>
      <div v-if="order" :class="['px-3 py-1 rounded-full text-sm font-medium border', statusColors[order.status]]">
        {{ statusLabels[order.status] }}
      </div>
    </div>

    <div v-if="isLoading && !order" class="text-center py-10 text-gray-500">
      Cargando pedido...
    </div>

    <div v-else-if="error" class="bg-red-50 text-red-700 p-4 rounded-md">
      {{ error }}
    </div>

    <div v-else-if="order" class="grid gap-8 md:grid-cols-3">
      <!-- Información General -->
      <div class="md:col-span-1 space-y-6">
        <div class="bg-white p-6 rounded-lg border shadow-sm space-y-4">
          <h3 class="font-bold border-b pb-2 text-gray-700">Información del Cliente</h3>
          <div>
            <p class="text-sm text-gray-500 uppercase font-semibold tracking-wider">Nombre</p>
            <p class="font-medium text-lg">{{ order.customerName }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 uppercase font-semibold tracking-wider">Fecha de Pedido</p>
            <p>{{ formatDate(order.createdAt) }}</p>
          </div>
          <div v-if="order.notes">
            <p class="text-sm text-gray-500 uppercase font-semibold tracking-wider">Notas</p>
            <p class="text-sm bg-gray-50 p-3 rounded mt-1 italic">{{ order.notes }}</p>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg border shadow-sm space-y-4">
          <h3 class="font-bold border-b pb-2 text-gray-700">Gestionar Estado</h3>
          <div class="space-y-3">
            <select v-model="selectedStatus" class="w-full border rounded-md px-3 py-2 text-sm">
              <option v-for="(label, value) in statusLabels" :key="value" :value="value">
                {{ label }}
              </option>
            </select>
            <button 
              @click="handleUpdateStatus"
              :disabled="isLoading || selectedStatus === order.status"
              class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
            >
              Actualizar estado
            </button>
          </div>
        </div>
      </div>

      <!-- Detalle de Productos -->
      <div class="md:col-span-2 space-y-6">
        <div class="bg-white p-6 rounded-lg border shadow-sm">
          <h3 class="font-bold border-b pb-2 text-gray-700 mb-4">Productos</h3>
          <table class="w-full text-sm text-left">
            <thead class="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th class="px-4 py-2">Producto</th>
                <th class="px-4 py-2 text-right">Precio</th>
                <th class="px-4 py-2 text-center">Cant.</th>
                <th class="px-4 py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr v-for="item in order.items" :key="item.productId">
                <td class="px-4 py-4 font-medium">{{ item.name }}</td>
                <td class="px-4 py-4 text-right">${{ item.price.toFixed(2) }}</td>
                <td class="px-4 py-4 text-center">{{ item.qty }}</td>
                <td class="px-4 py-4 text-right font-semibold">${{ (item.price * item.qty).toFixed(2) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="text-xl">
                <td colspan="3" class="px-4 py-6 text-right font-bold">Total Pagado:</td>
                <td class="px-4 py-6 text-right font-bold text-blue-600">${{ order.total.toFixed(2) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
