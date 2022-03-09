import Vue from "vue";
import VueRouter from "vue-router";
import login from '../page/login'
import home from '../page/home'

Vue.use(VueRouter)

const router = new VueRouter({
    routes: [
        {
            path: '/',
            redirect: '/login',
        }, 
        {
            path: '/login',
            component: login,
        },
        {
            path: '/home',
            component: home,
        }
    ]
})

// 路由导航守卫，获取sessionStorage中的token来放行
router.beforeEach((to, from, next)=>{
    if(to.path === '/login') 
        return next();
    // 访问非login页面，均需要守卫
    const token = window.sessionStorage.getItem("token");
    if(!token)
        next('/login');
    else
        next();
})

export default router;