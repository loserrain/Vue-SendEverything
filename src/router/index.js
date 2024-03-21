import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/components/Home.vue'
import Login from '@/components/Login.vue'
import Register from '@/components/Register.vue'
import UploadFileViews from '../views/Upload.vue'
import CheckGoogle from '../components/CheckGoogle.vue';
import BulletinBoard from '../components/bulletinBoard/BulletinBoard.vue';
import RoomBoard from '../components/bulletinBoard/RoomBoard.vue'
import WorkBoard from '../components/workBoard/WorkBoard.vue'
import WorkRoomBoard from '../components/workBoard/WorkRoomBoard.vue'

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
    },
    {
      path: '/BulletinBoard',
      name: 'BulletinBoard',
      component: BulletinBoard
    },
    {
      path: '/BulletinBoard/roomboard',
      name: 'RoomBoard',
      component: RoomBoard
    },
    {
      path: '/WorkBoard',
      name: 'WorkBoard',
      component: WorkBoard
    },
    {
      path: '/WorkBoard/WorkRoomBoard',
      name: 'WorkRoomBoard',
      component: WorkRoomBoard
    }
  ]
})

export default router
