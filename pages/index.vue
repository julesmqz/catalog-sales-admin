<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { user } = useAuth()
</script>

<template>
  <div class="space-y-6">
    <header>
      <h2 class="text-3xl font-bold tracking-tight">Bienvenido, {{ user?.displayName || 'Usuario' }}</h2>
      <p class="text-muted-foreground">Aquí tienes un resumen de tu sistema de gestión de pedidos.</p>
    </header>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div class="p-6 bg-white rounded-lg shadow border">
        <h3 class="text-sm font-medium text-gray-500">Total Productos</h3>
        <p class="text-2xl font-bold">--</p>
      </div>
      <div class="p-6 bg-white rounded-lg shadow border">
        <h3 class="text-sm font-medium text-gray-500">Total Clientes</h3>
        <p class="text-2xl font-bold">--</p>
      </div>
    </div>
  </div>
</template>
