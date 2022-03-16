<template>
    <el-card>
        <!-- 搜索框和添加商品按钮 -->
        <div class="search">
            <el-input 
            class="search_input"
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
            <el-table-column prop="goods_number" label="商品数量" width="100px"></el-table-column>
            <el-table-column label="创建时间" width="125px">
                <template slot-scope="scope">
                    {{ scope.row.add_time | dateFormat }}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="200px">
                <template slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.goods_id)">编辑</el-button>
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

        <el-dialog
        title="编辑"
        :visible.sync="editDialogVisible"
        width="50%">
            <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
                <el-form-item label="商品名称" prop="goods_name">
                    <el-input v-model="editForm.goods_name"></el-input>
                </el-form-item>
                <el-form-item label="商品价格（元）" prop="goods_price">
                    <el-input v-model.number="editForm.goods_price"></el-input>
                </el-form-item>
                <el-form-item label="商品重量" prop="goods_weight">
                    <el-input v-model.number="editForm.goods_weight"></el-input>
                </el-form-item>
                <el-form-item label="商品数量" prop="goods_number">
                    <el-input v-model.number="editForm.goods_number"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editGoods">确 定</el-button>
            </span>
        </el-dialog>
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
            // 编辑商品对话框是否可见
            editDialogVisible: false,
            editForm: {

            },
            editRules: {
                goods_name: [
                    {required: true, message: '请输入商品名称', trigger: 'blur'}
                ],
                goods_price: [
                    {required: true, message: '请输入商品价格', trigger: 'blur'}
                ],
                goods_weight: [
                    {required: true, message: '请输入商品重量', trigger: 'blur'}
                ],
                goods_number: [
                    {required: true, message: '请输入商品数量', trigger: 'blur'}
                ],
            },
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
        // 删除商品
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
        // 添加商品
        toAddGoods() {
            // 路由导航至添加商品页面
            this.$router.push('/addGoods');
        },
        async showEditDialog(goodsId) {
            const {data:res} = await this.$http.get(`goods/${goodsId}`);
            console.log(res);
            if (res.meta.status !== 200) {
                return this.$message.error('查询失败！');
            }
            this.editForm = res.data
            this.editDialogVisible = true;
        },
        editGoods() {
            this.$refs.editFormRef.validate(async valid => {
                if (!valid) return;
                const {data: res} = await this.$http.put(`goods/${this.editForm.goods_id}`, this.editForm);
                console.log(res);
                if (res.meta.status !== 200) {
                    return this.$message.error('编辑商品失败！');
                }
                this.$message.success('编辑成功！');
                this.editDialogVisible = false;
                this.getGoodslist();
            })
        }
    },
}
</script>

<style lang='less' scoped>
    .search_input{
        width: 400px;
    }
    .add_btn{
        margin-left: 20px;
    }
</style>