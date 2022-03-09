<template>
    <div>
        <el-button type="info" @click="logout">退出</el-button>
    </div>
</template>

<script>
export default {
    name: 'name',
    methods: {
        // 登出页面，清除token
        logout(){
            window.sessionStorage.clear();
            this.$router.push('/login');
        }
    },
}
</script>

<style>

</style>