<template>
    <el-card>
        <!-- 搜索框和添加商品按钮 -->
        <div class="search">
            <el-input 
            placeholder="请输入内容" 
            v-model="queryInfo.query" 
            clearable
            @clear="getGoodslist">
                <el-button slot="append" icon="el-icon-search" @click="getGoodslist"></el-button>
            </el-input>
            <el-button class="add_btn" type="primary" @click="toAddGoods">添加商品</el-button>
        </div>
        <!-- 商品列表 -->
        <el-table
        :data="goodslist"
        style="width: 100%"
        stripe>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="goods_name" label="商品名称"></el-table-column>
            <el-table-column prop="goods_price" label="商品价格（元）" width="120px"></el-table-column>
            <el-table-column prop="goods_weight" label="商品重量" width="100px"></el-table-column>
            <el-table-column prop="upd_time" label="创建时间" width="130px"></el-table-column>
            <el-table-column label="操作" width="200px">
                <template slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteGoodsById(scope.row.goods_id)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页 -->
        <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
        </el-pagination>
    </el-card>
</template>

<script>
export default {
    name: 'goodsList',
    created() {
        this.getGoodslist();
    },
    data() {
        return {
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 10,
            },
            goodslist: [],
            total: 0,
        }
    },
    methods: {
        // 向服务器发送请求，获取商品列表
        async getGoodslist() {
            const {data: res} = await this.$http.get('goods', {
                params: this.queryInfo
            });
            if (res.meta.status !== 200) {
                return this.$message.error('获取商品列表失败！');
            }
            console.log('goodslist:', res.data);
            this.goodslist = res.data.goods;
            this.total = res.data.total;
            // this.$message.success('获取商品列表成功！');
        },
        // 分页回调函数
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize;
            this.getGoodslist();
        },
        // 分页回调函数
        handleCurrentChange(newPagenum) {
            this.queryInfo.pagenum = newPagenum;
            this.getGoodslist();
        },
        async deleteGoodsById(goodsId) {
            const result = await this.$confirm('此操作将永久删除该商品 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch(err => err);
            if (result !== 'confirm') {
                return this.$message.info('已取消删除操作！');
            }
            const {data: res} = await this.$http.delete(`goods/${goodsId}`);
            if (res.meta.status !== 200) {
                return this.$message.error('删除商品失败！');
            }
            this.$message.success('删除商品成功！');
            this.getGoodslist();
        },
        toAddGoods() {
            // 路由导航至添加商品页面
            this.$router.push('/addGoods');
        }
    },
}
</script>

<style lang='less' scoped>
    .el-input{
        width: 400px;
    }
    .add_btn{
        margin-left: 20px;
    }
</style>