import Vue from "vue";
import VueRouter from "vue-router";
import login from '../page/login'
import home from '../page/home'
import welcome from '../page/welcome'
import users from '../page/users'
import rights from '../page/rights'
import roles from '../page/roles'
import categories from '../page/categories'
import params from '../page/params'
import goodsList from '../page/goodsList'
import addGoods from '../page/addGoods'
import orders from '../page/orders'
import report from '../page/report'

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
            children: [
                {
                    path: '',
                    component: welcome,
                },
                {
                    path: '/users',
                    component: users,
                },
                {
                    path: '/rights',
                    component: rights,
                },
                {
                    path: '/roles',
                    component: roles,
                },
                {
                    path: '/categories',
                    component: categories,
                },
                {
                    path: '/params',
                    component: params,
                },
                {
                    path: '/goods',
                    component: goodsList,
                },
                {
                    path: '/addGoods',
                    component: addGoods,
                },
                {
                    path: '/orders',
                    component: orders,
                },
                {
                    path: '/reports',
                    component: report,
                },
            ]
        },
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