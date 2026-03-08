<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { products, isLoading, error, getAll, create, remove, update } = useProducts()

onMounted(() => {
  getAll()
})

const isDialogOpen = ref(false)
const isEditing = ref(false)
const currentId = ref<string | null>(null)

const form = reactive({
  name: '',
  price: 0,
  description: '',
  imageUrl: ''
})

const resetForm = () => {
  form.name = ''
  form.price = 0
  form.description = ''
  form.imageUrl = ''
  isEditing.value = false
  currentId.value = null
}

const openCreate = () => {
  resetForm()
  isDialogOpen.value = true
}

const openEdit = (product: any) => {
  form.name = product.name
  form.price = product.price
  form.description = product.description || ''
  form.imageUrl = product.imageUrl || ''
  isEditing.value = true
  currentId.value = product.id
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
    alert('Error al guardar producto')
  }
}

const handleDelete = async (id: string) => {
  if (confirm('¿Estás seguro de eliminar este producto?')) {
    await remove(id)
    getAll()
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-3xl font-bold">Productos</h2>
      <button 
        @click="openCreate"
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
      >
        Nuevo Producto
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-10 text-gray-500">
      Cargando productos...
    </div>

    <div v-else-if="error" class="bg-red-50 text-red-700 p-4 rounded-md">
      {{ error }}
    </div>

    <div v-else-if="products.length === 0" class="text-center py-10 text-gray-500 bg-white border rounded-lg">
      No hay productos registrados.
    </div>

    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div v-for="product in products" :key="product.id" class="bg-white border rounded-lg overflow-hidden shadow-sm flex flex-col">
        <div class="h-48 bg-gray-100 flex items-center justify-center">
          <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name" class="h-full w-full object-cover" />
          <div v-else class="text-gray-400">Sin imagen</div>
        </div>
        <div class="p-4 flex-1">
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-bold text-lg">{{ product.name }}</h3>
            <span class="font-bold text-blue-600">${{ product.price }}</span>
          </div>
          <p class="text-sm text-gray-600 line-clamp-2 mb-4">{{ product.description }}</p>
        </div>
        <div class="p-4 border-t bg-gray-50 flex justify-end gap-2">
          <button @click="openEdit(product)" class="text-sm font-medium text-gray-700 hover:text-blue-600 px-2 py-1">Editar</button>
          <button @click="handleDelete(product.id!)" class="text-sm font-medium text-red-600 hover:text-red-800 px-2 py-1">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- Modal Simple (Reemplazo de Dialog shadcn por simplicidad en este paso) -->
    <div v-if="isDialogOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
        <h3 class="text-xl font-bold mb-4">{{ isEditing ? 'Editar Producto' : 'Nuevo Producto' }}</h3>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Nombre</label>
            <input v-model="form.name" type="text" required class="w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Precio</label>
            <input v-model.number="form.price" type="number" step="0.01" required class="w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Descripción</label>
            <textarea v-model="form.description" class="w-full border rounded-md px-3 py-2" rows="3"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">URL Imagen</label>
            <input v-model="form.imageUrl" type="url" class="w-full border rounded-md px-3 py-2" />
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button type="button" @click="isDialogOpen = false" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Cancelar</button>
            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium">
              {{ isEditing ? 'Guardar Cambios' : 'Crear Producto' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
