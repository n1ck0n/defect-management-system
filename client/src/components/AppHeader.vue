<template>
  <header class="app-header">
    <div class="header-content">
      <div class="logo">
        <router-link to="/dashboard" class="logo-link">
          🏗️ Defect Management
        </router-link>
      </div>
      
      <nav class="navigation">
        <router-link to="/dashboard" class="nav-link">Дашборд</router-link>
        <router-link to="/projects" class="nav-link">Проекты</router-link>
        <router-link to="/defects" class="nav-link">Дефекты</router-link>
        <router-link 
          v-if="authStore.canViewReports" 
          to="/reports" 
          class="nav-link"
        >
          Отчеты
        </router-link>
      </nav>
      
      <div class="user-menu">
        <span class="user-info">
          {{ authStore.user?.full_name }}
          <span class="user-role">({{ getRoleName(authStore.user?.role) }})</span>
        </span>
        <button @click="handleLogout" class="logout-btn">Выйти</button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const getRoleName = (role) => {
  const roleNames = {
    engineer: '👷 Инженер',
    manager: '👔 Менеджер',
    observer: '👀 Наблюдатель'
  };
  return roleNames[role] || role;
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.app-header {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  height: 64px;
  max-width: 1400px;
  margin: 0 auto;
}

.logo-link {
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
  text-decoration: none;
}

.logo-link:hover {
  color: #667eea;
}

.navigation {
  display: flex;
  gap: 2rem;
  flex: 1;
  justify-content: center;
}

.nav-link {
  color: #555;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-link:hover {
  color: #667eea;
  background: #f8f9fa;
}

.nav-link.router-link-active {
  color: #667eea;
  background: #f0f4ff;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  color: #333;
  font-weight: 500;
}

.user-role {
  color: #666;
  font-style: italic;
  font-size: 0.9rem;
}

.logout-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
}

.logout-btn:hover {
  background: #c82333;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
  .header-content {
    padding: 0 1rem;
    flex-wrap: wrap;
    height: auto;
    padding: 1rem;
  }
  
  .navigation {
    order: 3;
    width: 100%;
    justify-content: center;
    margin-top: 1rem;
    gap: 1rem;
  }
  
  .nav-link {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
  
  .user-menu {
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
  }
  
  .user-info {
    font-size: 0.9rem;
  }
}
</style>