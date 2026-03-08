<script setup lang="ts">
const { user, logout } = useAuth()

const menuItems = [
  { label: 'Dashboard', path: '/' },
  { label: 'Productos', path: '/products' },
  { label: 'Clientes', path: '/customers' },
]

const handleLogout = async () => {
  await logout()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col md:flex-row">
    <!-- Mobile Header -->
    <header class="md:hidden bg-white border-b px-4 py-3 flex justify-between items-center">
      <h1 class="font-bold text-xl">Catálogo Admin</h1>
      <button @click="handleLogout" class="text-sm text-red-600 font-medium">Salir</button>
    </header>

    <!-- Sidebar (Desktop) -->
    <aside class="hidden md:flex w-64 bg-white border-r flex-col min-h-screen">
      <div class="p-6 border-b">
        <h1 class="font-bold text-xl">Catálogo Admin</h1>
        <p v-if="user" class="text-xs text-gray-500 mt-1 truncate">{{ user.email }}</p>
      </div>
      
      <nav class="flex-1 p-4 space-y-1">
        <NuxtLink 
          v-for="item in menuItems" 
          :key="item.path" 
          :to="item.path"
          class="block px-4 py-2 rounded-md transition-colors hover:bg-gray-100"
          active-class="bg-blue-50 text-blue-700 font-medium"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="p-4 border-t">
        <button 
          @click="handleLogout"
          class="w-full text-left px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-50 rounded-md transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-4 md:p-8">
      <slot />
    </main>
  </div>
</template>
