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
                    meta: ['欢迎']
                },
                {
                    path: '/users',
                    component: users,
                    meta: ['用户管理','用户列表']
                },
                {
                    path: '/rights',
                    component: rights,
                    meta: ['权限管理','权限列表']
                },
                {
                    path: '/roles',
                    component: roles,
                    meta: ['权限管理','角色列表']
                },
                {
                    path: '/categories',
                    component: categories,
                    meta: ['商品管理','商品分类']
                },
                {
                    path: '/params',
                    component: params,
                    meta: ['商品管理','分类参数']
                },
                {
                    path: '/goods',
                    component: goodsList,
                    meta: ['商品管理','商品列表']
                },
                {
                    path: '/addGoods',
                    component: addGoods,
                    meta: ['商品管理','商品列表','添加商品']
                },
                {
                    path: '/orders',
                    component: orders,
                    meta: ['订单管理','订单列表']
                },
                {
                    path: '/reports',
                    component: report,
                    meta: ['数据统计','数据报表']
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