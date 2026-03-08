<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { customers, isLoading, error, getAll, create, remove, update } = useCustomers()

onMounted(() => {
  getAll()
})

const isDialogOpen = ref(false)
const isEditing = ref(false)
const currentId = ref<string | null>(null)

const form = reactive({
  name: '',
  phone: '',
  address: '',
  notes: ''
})

const resetForm = () => {
  form.name = ''
  form.phone = ''
  form.address = ''
  form.notes = ''
  isEditing.value = false
  currentId.value = null
}

const openCreate = () => {
  resetForm()
  isDialogOpen.value = true
}

const openEdit = (customer: any) => {
  form.name = customer.name
  form.phone = customer.phone
  form.address = customer.address || ''
  form.notes = customer.notes || ''
  isEditing.value = true
  currentId.value = customer.id
  isDialogOpen.value = true
}

const handleSubmit = async () => {
  try {
    if (isEditing.value && currentId.value) {
      await update(currentId.value, { ...form })
    } else {
      await create({ ...form })
    }
    isDialogOpen.value = false
    getAll()
  } catch (err) {
    alert('Error al guardar cliente')
  }
}

const handleDelete = async (id: string) => {
  if (confirm('¿Estás seguro de eliminar este cliente?')) {
    await remove(id)
    getAll()
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-3xl font-bold">Clientes</h2>
      <button 
        @click="openCreate"
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
      >
        Nuevo Cliente
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-10 text-gray-500">
      Cargando clientes...
    </div>

    <div v-else-if="error" class="bg-red-50 text-red-700 p-4 rounded-md">
      {{ error }}
    </div>

    <div v-else-if="customers.length === 0" class="text-center py-10 text-gray-500 bg-white border rounded-lg">
      No hay clientes registrados.
    </div>

    <div v-else class="bg-white border rounded-lg overflow-hidden shadow-sm">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50 border-b">
            <th class="p-4 font-bold text-sm text-gray-700">Nombre</th>
            <th class="p-4 font-bold text-sm text-gray-700">Teléfono</th>
            <th class="p-4 font-bold text-sm text-gray-700">Dirección</th>
            <th class="p-4 font-bold text-sm text-gray-700 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="customer in customers" :key="customer.id" class="border-b hover:bg-gray-50 transition-colors">
            <td class="p-4 text-sm">{{ customer.name }}</td>
            <td class="p-4 text-sm">{{ customer.phone }}</td>
            <td class="p-4 text-sm text-gray-600">{{ customer.address || '-' }}</td>
            <td class="p-4 text-sm text-right space-x-2">
              <button @click="openEdit(customer)" class="text-blue-600 hover:underline">Editar</button>
              <button @click="handleDelete(customer.id!)" class="text-red-600 hover:underline">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Cliente -->
    <div v-if="isDialogOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
        <h3 class="text-xl font-bold mb-4">{{ isEditing ? 'Editar Cliente' : 'Nuevo Cliente' }}</h3>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Nombre Completo</label>
            <input v-model="form.name" type="text" required class="w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Teléfono</label>
            <input v-model="form.phone" type="tel" required class="w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Dirección</label>
            <input v-model="form.address" type="text" class="w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Notas</label>
            <textarea v-model="form.notes" class="w-full border rounded-md px-3 py-2" rows="3"></textarea>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button type="button" @click="isDialogOpen = false" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Cancelar</button>
            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium">
              {{ isEditing ? 'Guardar Cambios' : 'Crear Cliente' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
