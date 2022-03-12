<template>
    <el-card>
        <!-- 顶部搜索和添加用户栏 -->
        <el-row :gutter="20">
            <el-col :span="8">
                <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
                    <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                </el-input>
            </el-col>
            <el-col :span="4">
                <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
            </el-col>
        </el-row>

        <!-- 用户列表 -->
        <el-table :data="userlist" style="width: 100%" stripe>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="username" label="姓名"></el-table-column>
            <el-table-column prop="email" label="邮箱"></el-table-column>
            <el-table-column prop="mobile" label="电话"></el-table-column>
            <el-table-column prop="role_name" label="角色"></el-table-column>
            <el-table-column label="状态">
                <!-- 通过作用域插槽获取组件内部数据 -->
                <template slot-scope="scope">
                    <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <!-- 通过作用域插槽获取组件内部数据 -->
                <template slot-scope="scope">
                    <!-- 修改、删除和分配角色按钮 -->
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUserById(scope.row.id)"></el-button>
                    <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                        <el-button type="warning" icon="el-icon-setting" size="mini" @click="showAllocateDialog(scope.row)"></el-button>
                    </el-tooltip>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页区域 -->
        <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
        </el-pagination>

        <!-- 添加用户对话框 -->
        <el-dialog
            title="添加用户"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addDialogClosed">
            
            <!-- 添加用户表单 -->
            <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px" >
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 编辑用户对话框 -->
        <el-dialog
            title="修改用户"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editDialogClosed">
            
            <!-- 修改用户表单 -->
            <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px" >
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="editForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUser">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 分配角色对话框 -->
        <el-dialog
        title="分配角色"
        :visible.sync="roleDialogVisible"
        width="50%"
        @close='roleDialogClosed'>
            <p>用户名：{{ userInfo.username }}</p>
            <p>角色：{{ userInfo.role_name }}</p>
            <el-select v-model="selectedRoleId" placeholder="请选择">
                <el-option
                v-for="item in rolelist"
                :key="item.id"
                :label="item.roleName"
                :value="item.id">
                </el-option>
            </el-select>    
            <span slot="footer" class="dialog-footer">
                <el-button @click="roleDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allocateRole">确 定</el-button>
            </span>
        </el-dialog>
    </el-card>
</template>

<script>
export default {
    name: 'users',
    data() {
        // 自定义邮箱验证规则
        var checkEmail = (rule, value, callback) => {
            var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
            if (reg.test(value)){
                callback();
            }
            callback(new Error('邮箱格式错误'));
        };
        // 自定义电话验证规则
        var checkMobile = (rule, value, callback) => {
            var reg = /^[1][3,4,5,7,8][0-9]{9}$/;
            if (reg.test(value)){
                callback();
            }
            callback(new Error('手机号格式错误'));
        };
        return {
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 5,
            },
            userlist: [],
            total: 0,
            // 添加用户对话框是否可见
            addDialogVisible: false,
            // 添加用户表单数据，同时也是ajax请求参数
            addForm: {
                username: '',
                password: '',
                email: '',
                mobile: '',
            },
            // 添加用户表单验证规则
            addRules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
                ],
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    {validator: checkEmail, trigger: 'blur'},
                ],
                mobile: [
                    { required: true, message: '请输入手机号', trigger: 'blur' },
                    {validator: checkMobile, trigger: 'blur'},
                ]
            },
            editDialogVisible: false,
            editForm: {},
            editRules: {
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    {validator: checkEmail, trigger: 'blur'},
                ],
                mobile: [
                    { required: true, message: '请输入手机号', trigger: 'blur' },
                    {validator: checkMobile, trigger: 'blur'},
                ]
            },
            // 分配角色对话框是否可见
            roleDialogVisible: false,
            // 需要分配角色的用户信息
            userInfo: {},
            // 所有角色的列表
            rolelist: [],
            // 当前选中的角色ID
            selectedRoleId: '',
        }
    },
    created() {
        this.getUserList();
    },
    methods: {
        // 获取用户列表
        async getUserList() {
            const {data: res} = await this.$http.get('users', {
                params: this.queryInfo
            });
            if (res.meta.status !== 200)
                return this.$message.error('获取用户列表失败！');
            this.userlist = res.data.users;
            this.total = res.data.total;
            console.log(res.data);
        },
        // 页面大小变化处理
        handleSizeChange(val) {
            this.queryInfo.pagesize = val;
            this.getUserList();
        },
        // 当前页面数变化处理
        handleCurrentChange(val) {
            this.queryInfo.pagenum = val;
            this.getUserList();
        },
        async userStateChanged(userInfo) {
            console.log(userInfo);
            const {data: res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`);
            if (res.meta.status !== 200) {
                userInfo.mg_state = !userInfo.mg_state;
                return this.$message.error('更新用户状态失败！');
            }
            this.$message.success('更新用户状态成功！');
        },
        addDialogClosed() {
            this.$refs.addFormRef.resetFields();
        },
        // 添加新用户
        addUser() {
            this.$refs.addFormRef.validate(async valid => {
                if (!valid){
                    return this.$message.error('格式验证失败！');
                }
                const {data: res} = await this.$http.post('users', this.addForm);
                if (res.meta.status !== 201){
                    return this.$message.error('添加用户失败！');
                }
                this.addDialogVisible = false;
                this.getUserList();
                this.$message.success('添加用户成功！');
            })
        },
        // 显示修改用户对话框
        async showEditDialog(id) {
            console.log(id);
            // 通过id查询用户信息
            const {data: res} = await this.$http.get(`users/${id}`);
            if (res.meta.status !== 200){
                return this.$message.error('获取用户信息失败！');
            }
            this.editForm = res.data;
            this.editDialogVisible = true;
        },
        // 修改用户对话框关闭时清空校验结果
        editDialogClosed() {
            this.$refs.editFormRef.resetFields();
        },
        // 提交修改用户请求
        editUser(){
            this.$refs.editFormRef.validate(async valid => {
                if (!valid){
                    return this.$message.error('格式验证失败！');
                }
                const {data: res} = await this.$http.put(`users/${this.editForm.id}`, {
                    email: this.editForm.email,
                    mobile: this.editForm.mobile
                });
                console.log(res);
                if (res.meta.status !== 200){
                    return this.$message.error('更新用户信息失败！');
                }
                this.editDialogVisible = false;
                this.getUserList();
                this.$message.success('更新用户信息成功！');
            })
        },
        // 根据ID删除用户
        async deleteUserById(id) {
            const result = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => {
                return err;
            })
            console.log(result);
            if (result !== 'confirm'){
                return this.$message.info('已取消删除操作！');
            }

            const {data: res} = await this.$http.delete(`users/${id}`);
            console.log(res);
            if (res.meta.status !== 200){
                return this.$message.error('删除用户失败！');
            }
            this.$message.success('删除用户成功！');
        },
        // 打开分配角色对话框
        async showAllocateDialog(user) {
            console.log(user);
            this.userInfo = user;

            // 获取所有角色的列表
            const {data: res} = await this.$http.get('roles');
            if (res.meta.status !== 200) {
                return this.$message.error('获取所有角色列表失败！');
            }
            this.rolelist = res.data;

            this.roleDialogVisible = true;
        },
        // 分配角色
        async allocateRole() {
            if (!this.selectedRoleId) {
                return this.$message.error('请选择需要分配的角色！');
            }
            const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`, {
                rid: this.selectedRoleId
            });
            if (res.meta.status != 200) {
                return this.$message.error('分配角色失败！');
            }
            this.$message.success('分配角色成功！');
            this.getUserList();
            this.roleDialogVisible = false;

        },
        roleDialogClosed() {
            this.selectedRoleId = '';
            this.userInfo = '';
        }
    }
}
</script>

<style lang='less' socped>
    .el-table{
        margin-top: 20px;
    }
    .el-pagination{
        margin-top: 20px;
    }
</style>