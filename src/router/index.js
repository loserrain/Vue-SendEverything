import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/components/Home.vue'
import Login from '@/components/Login.vue'
import Register from '@/components/Register.vue'
import UploadFileViews from '../views/Upload.vue'
import CheckGoogle from '../components/CheckGoogle.vue';

const Profile = () => import('@/components/Profile.vue')
const FilesCard = () => import('../views/FilesCard.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/home',
      component: Home,
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/register',
      name: 'register',
      component: Register
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
    },
    {
      path: '/uploadfile',
      name: 'uploadfile',
      component: UploadFileViews
    },
    {
      path: '/checkGoogle',
      name: 'checkGoogle',
      component: CheckGoogle
    },
    {
      path: '/filesCard',
      name: 'fileCsard',
      component: FilesCard
    }
  ]
})

export default router
