<template>
    <el-card>
        <el-button type="primary" @click="showAddDialog">添加分类</el-button>
        <!-- 树形表格 -->
        <tree-table
        :data="catelist"
        :columns="columns"
        show-index
        :selection-type="false"
        :expand-type="false"
        class="tree_table">
            <!-- 是否有效列，使用作用域插槽实现渲染 -->
            <template slot="is_ok" slot-scope="scope">
                <i v-if="scope.row.cat_deleted" class="el-icon-error" style="color: red"></i>
                <i v-else class="el-icon-success" style="color: lightgreen"></i>
            </template>

            <!-- 排序列 -->
            <template slot="level" slot-scope="scope">
                <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
                <el-tag v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
                <el-tag v-else type="warning">三级</el-tag>
            </template>

            <!-- 操作列 -->
            <template slot="opt" slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCategory(scope.row.cat_id)">删除</el-button>
            </template>
        </tree-table>

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

        <!-- 添加分类对话框 -->
        <el-dialog
        title="添加分类"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed">
            <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="addForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类">
                    <!-- 级联选择器 options为数据源 -->
                    <!-- v-model双向绑定已选择的数据项index -->
                    <el-cascader
                    v-model="selectedKeys"
                    :options="parentList"
                    :props="cascaderProps"
                    clearable
                    style="width: 100%"
                    @change="selectChanged">
                    </el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCategories">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 编辑分类对话框 -->
        <el-dialog
        title="编辑分类"
        :visible.sync="editDialogVisible"
        width="50%"
        @close='editDialogCloses'>
            <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="editForm.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editCategory">确 定</el-button>
            </span>
        </el-dialog>
    </el-card>
</template>

<script>
export default {
    name: 'categories',
    mounted() {
        this.getCateList();
    },
    data() {
        return {
            // 请求参数
            queryInfo: {
                type: 3,
                pagenum: 1,
                pagesize: 5,
            },
            // 商品分类数据列表
            catelist: [],
            // 商品总分类数
            total: 0,
            // tree-table的列配置
            columns: [
                {
                    label: '分类名称',
                    prop: 'cat_name',
                },
                {
                    label: '是否有效',
                    type: 'template',
                    template: 'is_ok',
                },
                {
                    label: '排序',
                    type: 'template',
                    template: 'level',
                },
                {
                    label: '操作',
                    type: 'template',
                    template: 'opt',
                },
            ],
            // 添加分类对话框是否可见
            addDialogVisible: false,
            // 添加分类表单数据
            addForm: {
                cat_name: '',
                cat_pid: 0,
                cat_level: 0
            },
            // 添加分类表单框验证规则
            addRules: {
                cat_name: [
                    {required: true, message: '请输入商品分类名称', trigger: 'blur'}
                ]
            },
            // 父级分类列表
            parentList: [],

            // 级联选择器已选择项
            selectedKeys: [],
            // 级联选择器配置对象
            cascaderProps: {
                // 指定选项的值为id
                value: 'cat_id',
                children: 'children',
                expandTrigger: 'hover',
                label: 'cat_name',
                checkStrictly: true,
            },
            // 编辑对话框是否可见
            editDialogVisible: false,
            // 编辑对话框表单数据
            editForm: {},
            // 编辑对话框验证规则
            editRules: {
                cat_name: [
                    {required: true, message: '请输入商品分类名称', trigger: 'blur'}
                ]
            }
        }
    },
    methods: {
        // 获取分类数据
        async getCateList() {
            const {data: res} = await this.$http.get('categories', {
                params: this.queryInfo,
            });
            if (res.meta.status !== 200){
                return this.$message.error('获取商品分类失败！');
            }
            console.log('categories data:', res);
            this.catelist = res.data.result;
            this.total = res.data.total;
        },

        // 获取父级分类列表
        async getParentList() {
            const {data: res} = await this.$http.get('categories', {
                params: {type: 2},
            });
            if (res.meta.status !== 200){
                return this.$message.error('获取父级分类失败！');
            }
            console.log('parentCategories:', res.data);
            this.parentList = res.data;
        },

        // 分页大小变化处理函数
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize;
            this.getCateList();
        },
        // 当前页面变化处理函数
        handleCurrentChange(newNum) {
            this.queryInfo.pagenum = newNum;
            this.getCateList();
        },
        showAddDialog() {
            // 获取父级分类
            this.getParentList();

            this.addDialogVisible = true;
        },
        // 级联选择器选项变化处理
        selectChanged() {
            if (this.selectedKeys.length > 0) {
                // 添加分类的父id为所选择id列表的最后元素
                this.addForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1];
                this.addForm.cat_level = this.selectedKeys.length;
            }
            else {
                // 未选择时为添加一级分类
                this.addForm.cat_pid = 0;
                this.addForm.cat_level = 0;
            }
        },
        // 添加分类对话框关闭时的回调函数
        addDialogClosed() {
            this.$refs.addFormRef.resetFields();
            this.addForm.cat_name = '';
            this.addForm.cat_pid = 0;
            this.addForm.cat_level = 0;
        },
        // 点击按钮，添加分类
        addCategories() {
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) return;
                // 校验合法，向服务器发送添加分类请求
                const {data: res} = await this.$http.post('categories', this.addForm);
                if (res.meta.status !== 201) {
                    return this.$message.error('添加分类失败！');
                }
                this.addDialogVisible = false;
                // 重新获取分类列表
                this.getCateList();
                this.$message.success('添加分类成功！');
            })
        },
        
        // 显示编辑对话框
        async showEditDialog(id) {
            // 根据id查询分类信息，显示在编辑对话框
            const {data: res} = await this.$http.get(`categories/${id}`);
            if (res.meta.status !== 200){
                return this.$message.error('获取分类信息失败！');
            }
            this.editForm = res.data;
            this.editDialogVisible = true;
        },
        // 编辑对话框关闭处理
        editDialogCloses() {
            this.$refs.editFormRef.resetFields();
        },
        // 编辑分类
        editCategory() {
            this.$refs.editFormRef.validate(async valid => {
                if (!valid) return;
                const {data: res} = await this.$http.put(`categories/${this.editForm.cat_id}`, {
                    cat_name: this.editForm.cat_name,
                });
                if (res.meta.status !== 200){
                    return this.$message.error('编辑提交失败！');
                }
                this.getCateList();
                this.editDialogVisible = false;
                this.$message.success('编辑成功！');
            })
        },
        // 删除分类
        async deleteCategory(id) {
            const result = await this.$confirm('此操作将永久删除该分类 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch(err => err);
            if (result !== 'confirm') {
                return this.$message.info('已取消删除操作！');
            }
            const {data: res} = await this.$http.delete(`categories/${id}`);
            if (res.meta.status !== 200) {
                return this.$message.error('删除分类失败！');
            }
            this.getCateList();
            this.$message.success('删除成功！');
        }
        

    },
}
</script>

<style lang='less' scoped>
    .tree_table{
        margin-top: 20px;
    }
</style>