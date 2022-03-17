<template>
    <el-container class="home_container">
        <el-aside width="300px">
            <h3>综合管理系统</h3>
            <!-- 侧边栏导航菜单 -->
            <el-menu
                background-color="#545c64"
                text-color="#fff"
                active-text-color="#ffd04b"
                :unique-opened="true"
                :router="true"
                :default-active="activePath">
                <!-- 一级菜单 -->
                <el-submenu 
                    v-for="menuItem in menulist" 
                    :key="menuItem.id" 
                    :index="menuItem.path">
                    <template slot="title">
                        <i :class="menuItem.iconPath"></i>
                        <span>{{ menuItem.authName }}</span>
                    </template>
                    <!-- 二级菜单 -->
                    <el-menu-item-group>
                        <el-menu-item 
                            v-for="subItem in menuItem.children" 
                            :key="subItem.id" 
                            :index="subItem.path"
                            @click="handleActivePath(subItem.path)">
                            <template slot="title">
                                <i class="el-icon-menu"></i>
                                <span>{{ subItem.authName }}</span>
                            </template>
                        </el-menu-item>
                    </el-menu-item-group>
                </el-submenu>
            </el-menu>
        </el-aside>
        <el-container>
            <!-- 头部 -->
            <el-header class="header_container">
                <!-- 头部导航面包屑 -->
                <el-breadcrumb separator-class="el-icon-arrow-right">
                    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
                    <el-breadcrumb-item v-for="(item, index) in $route.meta" :key="index">{{ item }}</el-breadcrumb-item>
                </el-breadcrumb>
                <!-- 头像下拉菜单 -->
                <el-dropdown class="avater_menu" @command="handleDropMenu">
                        <img src="../assets/logo.png" alt="头像">
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="home">首页</el-dropdown-item>
                        <el-dropdown-item command="logout">退出</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </el-header>
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
    name: 'home',
    data() {
        return {
            menulist: [
                {
                    "id": 125,
                    "authName": "用户管理",
                    "path": "users",
                    "children": [
                        {
                            "id": 110,
                            "authName": "用户列表",
                            "path": "users",
                            "children": [],
                            "order": null
                        }
                    ],
                    "order": 1,
                    "iconPath": "el-icon-user-solid",
                },
                {
                    "id": 103,
                    "authName": "权限管理",
                    "path": "rights",
                    "children": [
                        {
                            "id": 111,
                            "authName": "角色列表",
                            "path": "roles",
                            "children": [],
                            "order": null
                        },
                        {
                            "id": 112,
                            "authName": "权限列表",
                            "path": "rights",
                            "children": [],
                            "order": null
                        }
                    ],
                    "order": 2,
                    "iconPath": "el-icon-s-check",
                },
                {
                    "id": 101,
                    "authName": "商品管理",
                    "path": "goods",
                    "children": [
                        {
                            "id": 104,
                            "authName": "商品列表",
                            "path": "goods",
                            "children": [],
                            "order": 1
                        },
                        {
                            "id": 115,
                            "authName": "分类参数",
                            "path": "params",
                            "children": [],
                            "order": 2
                        },
                        {
                            "id": 121,
                            "authName": "商品分类",
                            "path": "categories",
                            "children": [],
                            "order": 3
                        }
                    ],
                    "order": 3,
                    "iconPath": "el-icon-s-goods",
                },
                {
                    "id": 102,
                    "authName": "订单管理",
                    "path": "orders",
                    "children": [
                        {
                            "id": 107,
                            "authName": "订单列表",
                            "path": "orders",
                            "children": [],
                            "order": null
                        }
                    ],
                    "order": 4,
                    "iconPath": "el-icon-s-order",
                },
                {
                    "id": 145,
                    "authName": "数据统计",
                    "path": "reports",
                    "children": [
                        {
                            "id": 146,
                            "authName": "数据报表",
                            "path": "reports",
                            "children": [],
                            "order": null
                        }
                    ],
                    "order": 5,
                    "iconPath": "el-icon-s-data",
                }
            ],
            activePath: '',
        }
    },
    // created() {
    //     // 获取所有菜单
    //     this.getMenuList();
    // },
    created() {
        // 获取当前默认激活菜单项
        this.activePath = window.sessionStorage.getItem('active');
    },
    methods: {
        // 处理头像下拉菜单栏
        handleDropMenu(command) {
            if (command === 'home')
            {
                if (this.$route.path !== '/home')
                    this.$router.push('/home');
                console.log(this.$route)
            }
            else if (command === 'logout')
            {
                // 登出页面，清除token
                window.sessionStorage.clear();
                this.$router.push('/login');
            }
        },
        // 将当前激活菜单保存至session，用户刷新页面时也能回到当前激活页面
        handleActivePath(activePath) {
            window.sessionStorage.setItem('active', activePath);
            this.activePath = activePath;
        }
        // async getMenuList() {
        //     // 获取全部菜单数据
        //     const {data: res} = await this.$http.get('menus');
        //     if (res.meta.status !== 200)
        //         return this.$message.error(res.meta.msg)
        //     this.menulist = res.data
        //     console.log(this.menulist)
        // }
    },
}
</script>

<style lang='less' scoped>
    .home_container{
        height: 100%;

    }

    .el-aside{
        background-color: #545c64;
        .el-menu{
            border-right: none;
        }
        h3{
            color: #eff2f7;
            text-align: center;
        }
    }

    .el-header{
        background-color: #eff2f7;
    }

    .header_container{
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .avater_menu{
        width: 45px;
        height: 45px;
        border-radius: 50%;
        img{
            background-color: white;
            width: 100%;
            border-radius: 50%;
        }
    }

</style>