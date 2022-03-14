<template>
    <el-card>
        <!-- 信息提示框 -->
        <el-alert title="添加商品信息" type="info" :closable="false" center show-icon>
        </el-alert>
        <!-- 步骤条 -->
        <el-steps :active="currentActive" align-center>
            <el-step title="基本信息"></el-step>
            <el-step title="商品参数"></el-step>
            <el-step title="商品属性"></el-step>
            <el-step title="商品图片"></el-step>
            <el-step title="商品内容"></el-step>
            <el-step title="完成"></el-step>
        </el-steps>
        <!-- 步骤tab -->
        <el-tabs tab-position="left">
            <el-tab-pane label="基本信息">基本信息</el-tab-pane>
            <el-tab-pane label="商品参数">商品参数</el-tab-pane>
            <el-tab-pane label="商品属性">商品属性</el-tab-pane>
            <el-tab-pane label="商品图片">商品图片</el-tab-pane>
            <el-tab-pane label="商品内容">商品内容</el-tab-pane>
        </el-tabs>
    </el-card>
</template>

<script>
export default {
    name: 'addGoods',
    data() {
        return {
            currentActive: 0,
        }
    },
}
</script>

<style lang='less' scoped>
    .el-step{
        margin: 20px 0;
    }
    .el-step__title{
        font-size: 14px;
    }
</style>