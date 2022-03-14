<template>
    <el-card>
        <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false" show-icon></el-alert>
        <!-- 商品分类选择 -->
        <div class="choose_cate">
            <span>选择商品分类：</span>
            <el-cascader
            v-model="selectedKeys"
            :options="catelist"
            :props="cascaderProps"
            @change="handleChange"></el-cascader>
        </div>
        <!-- 动态参数和静态属性tab页签 -->
        <el-tabs v-model="activeTabName" @tab-click="handleClick">
            <el-tab-pane label="动态参数" name="many">
                <el-button type="primary" :disabled="isButtonDisabled" @click="addDialogVisible=true">添加参数</el-button>
                <el-table
                :data="manyAttrs"
                style="width: 100%"
                stripe>
                    <el-table-column type="expand">
                        <template slot-scope="scope">
                            <!-- 渲染参数下的标签值 -->
                            <el-tag 
                            v-for="(item, index) in scope.row.attr_vals" 
                            :key="index"
                            style="margin-right: 5px"
                            closable
                            @close="handleTagClose(scope.row, index)">
                                {{ item }}
                            </el-tag>
                            <!-- 新标签输入框 -->
                            <el-input
                            class="input-new-tag"
                            v-if="scope.row.inputVisible"
                            v-model="scope.row.inputValue"
                            ref="saveTagInput"
                            size="small"
                            @keyup.enter.native="handleInputConfirm(scope.row)"
                            @blur="handleInputConfirm(scope.row)">
                            </el-input>
                            <!-- 新标签输入按钮 -->
                            <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column type="index"></el-table-column>
                    <el-table-column prop="attr_name" label="参数名称"></el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteAttr(scope.row.attr_id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
            <el-tab-pane label="静态属性" name="only">
                <el-button type="primary" :disabled="isButtonDisabled" @click="addDialogVisible=true">添加属性</el-button>
                <el-table
                :data="onlyAttrs"
                style="width: 100%"
                stripe>
                    <el-table-column type="expand">
                        <template slot-scope="scope">
                            <!-- 渲染参数下的标签值 -->
                            <el-tag 
                            v-for="(item, index) in scope.row.attr_vals" 
                            :key="index"
                            style="margin-right: 5px"
                            closable
                            @close="handleTagClose(scope.row, index)">
                                {{ item }}
                            </el-tag>
                            <!-- 新标签输入框 -->
                            <el-input
                            class="input-new-tag"
                            v-if="scope.row.inputVisible"
                            v-model="scope.row.inputValue"
                            ref="saveTagInput"
                            size="small"
                            @keyup.enter.native="handleInputConfirm(scope.row)"
                            @blur="handleInputConfirm(scope.row)">
                            </el-input>
                            <!-- 新标签输入按钮 -->
                            <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column type="index"></el-table-column>
                    <el-table-column prop="attr_name" label="参数名称"></el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteAttr(scope.row.attr_id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
        </el-tabs>

        <!-- 添加属性对话框 -->
        <el-dialog
        :title="'添加' + titleText"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed">
            <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px">
                <el-form-item :label='titleText' prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addAttr">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 编辑属性对话框 -->
        <el-dialog
        :title="'编辑' + titleText"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed">
            <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
                <el-form-item :label='titleText' prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editAttr">确 定</el-button>
            </span>
        </el-dialog>
    </el-card>
</template>

<script>
export default {
    name: 'params',
    created() {
        this.getCateList();
    },
    data() {
        return {
            // 全部分类列表
            catelist: [],
            // 已选中项数组
            selectedKeys:[],
            cascaderProps: {
                // 指定选项的值为id
                value: 'cat_id',
                children: 'children',
                expandTrigger: 'hover',
                label: 'cat_name',
            },
            activeTabName: 'many',
            // 动态参数
            manyAttrs: [],
            // 静态属性
            onlyAttrs: [],
            // 添加属性对话框表单
            addDialogVisible: false,
            addForm: {
                attr_name: '',
            },
            addRules: {
                attr_name: {required: true, message: '请输入属性名称', trigger: 'blur'}
            },
            // 编辑属性对话框是是否可见
            editDialogVisible: false,
            editForm: {},
            editRules: {
                attr_name: {required: true, message: '请输入属性名称', trigger: 'blur'}
            },

        }
    },
    computed: {
        isButtonDisabled() {
            return this.selectedKeys.length !== 3;
        },
        // 添加参数对话框title
        titleText() {
            if (this.activeTabName === 'many')
                return '动态参数';
            return '静态属性';
        },
        // 当前选择分类的id
        cateId() {
            if (this.selectedKeys.length !== 3)
                return null;
            return this.selectedKeys[2];
        }
    },
    methods: {
        // 获取分类数据
        async getCateList() {
            const {data: res} = await this.$http.get('categories', {
                type: 3
            });
            if (res.meta.status !== 200){
                return this.$message.error('获取商品分类失败！');
            }
            console.log('categories data:', res);
            this.catelist = res.data;
        },
        // 级联选择框选项变化处理
        handleChange() {
            this.getAttrs();
        },
        // tab页签切换回调函数
        handleClick() {
            this.getAttrs();
        },
        // 获取所有属性
        async getAttrs() {
            // 当选择的不是三级分类时，重置选项
            if (this.selectedKeys.length !== 3){
                this.selectedKeys = [];
                this.manyAttrs = [];
                this.onlyAttrs = [];
                return;
            }
            const {data: res} = await this.$http.get(`categories/${this.selectedKeys[2]}/attributes`,{
                params: {sel: this.activeTabName}
            });
            if (res.meta.status !== 200) {
                return this.$message.error('获取分类属性失败！');
            }
            console.log('attributes:', res.data);
            // 将attr_vals由逗号分隔字符串转为数组
            res.data.forEach(item => {
                // 空字符串分割后的结果应该为空数组
                item.attr_vals = item.attr_vals? item.attr_vals.split(',') : [];
                console.log("attr_vals:", item.attr_vals);
                // 给每个item对象添加inputVisible和inputValue属性
                // 使每行参数中的New Tag互不干扰
                item.inputVisible = false;
                item.inputValue = '';
            });
            if (this.activeTabName === 'many'){
                this.manyAttrs = res.data;
            }else{
                this.onlyAttrs = res.data;
            }
        },
        // 添加属性对话框关闭回调
        addDialogClosed() {
            this.$refs.addFormRef.resetFields();
        },
        // 点击确定按钮，添加属性
        addAttr() {
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) return;
                const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`, {
                    attr_name: this.addForm.attr_name,
                    attr_sel: this.activeTabName,
                });
                if (res.meta.status !== 201) {
                    return this.$message.error('添加属性失败！');
                }
                this.getAttrs();
                this.$message.success('添加成功！');
                this.addDialogVisible = false;
            });
        },
        // 显示编辑参数对话框
        async showEditDialog(attrId) {
            console.log('attrId', attrId);
            const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, {
                params: {attr_sel: this.activeTabName},
            });
            if (res.meta.status !== 200){
                return this.$message.error('获取分类参数失败！');
            }
            console.log('data:', res.data);
            this.editForm = res.data;
            this.editDialogVisible = true;
        },
        // 编辑属性对话框关闭回调
        editDialogClosed() {
            this.$refs.editFormRef.resetFields();
        },
        // 点击确定，提交编辑属性请求
        editAttr() {
            this.$refs.editFormRef.validate(async valid => {
                if (!valid) return;
                const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,{
                    attr_name: this.editForm.attr_name,
                    attr_sel: this.activeTabName,
                });
                if (res.meta.status !== 200){
                    return this.$message.error('编辑参数失败！');
                }
                this.$message.success('提交编辑成功！');
                this.getAttrs();
                this.editDialogVisible = false;

            })
        },
        // 删除属性
        async deleteAttr(attrId) {
            const result = await this.$confirm('此操作将永久删除该属性 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch(err => err);
            if (result !== 'confirm') {
                return this.$message.info('已取消删除操作！');
            }
            const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`);
            if (res.meta.status !== 200){
                return this.$message.error('删除失败！');
            }
            this.$message.success('删除成功！');
            this.getAttrs();
        },
        // 删除分类属性下的标签
        handleTagClose(row, index) {
            row.attr_vals.splice(index, 1);
            // 向服务器提交删除请求
            this.submitAttrVal(row);
        },
        // 向服务器提交标签修改的请求
        async submitAttrVal(row) {
            const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
                attr_name: row.attr_name,
                attr_sel: row.attr_sel,
                attr_vals: row.attr_vals.join(',')
            });
            if (res.meta.status !== 200){
                return this.$message.error('提交请求失败！');
            }
            this.$message.success('提交请求成功！');
        },
        // 输入框确认回调函数
        handleInputConfirm(row) {
            if (row.inputValue.trim() === '') {
                row.inputValue = '';
                row.inputVisible = false;
                return;
            }
            row.attr_vals.push(row.inputValue);
            row.inputValue = '';
            row.inputVisible = false;
            // 向服务器提交请求
            this.submitAttrVal(row);
        },
        // 点击New Tag，显示输入框并获取焦点
        showInput(row) {
            row.inputVisible = true;
            // 自动获取焦点
            this.$nextTick(function(){
                this.$refs.saveTagInput.$refs.input.focus();
            })
        }
    },
}
</script>

<style lang='less' scoped>
    .choose_cate{
        margin-top: 20px;
    }
    .input-new-tag{
        width: 180px;
    }
</style>