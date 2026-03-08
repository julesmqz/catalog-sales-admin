export default defineNuxtRouteMiddleware((to) => {
  const { user, isLoading } = useAuth()

  // Evitar bucle de redirección
  if (to.path === '/login') return

  // Si no está cargando y no hay usuario, redirigir a login
  if (!user.value) {
    return navigateTo('/login')
  }
})
