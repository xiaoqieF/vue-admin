<template>
    <el-card>
        <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        <!-- 角色权限表格 -->
        <el-table
        :data="roleList"
        style="width: 100%">
            <!-- 展开列，渲染权限标签 -->
            <el-table-column type="expand">
                <template slot-scope="scope">
                    <!-- 一级权限 -->
                    <el-row v-for="(item, index) in scope.row.children" 
                    :key="item.id"
                    :class="['bd_bottom', 'center', index === 0?'bd_top':'']">
                        <el-col :span="7">
                            <el-tag closable @close='deleteRightById(scope.row, item.id)' >{{item.authName}}</el-tag>
                            <i class="el-icon-caret-right"></i>
                        </el-col>
                        <el-col :span="17">
                            <!-- 二级权限 -->
                            <el-row v-for="(item1, index1) in item.children" 
                            :key="item1.id"
                            :class="[index1 === 0?'':'bd_top', 'center']">
                                <el-col :span="6">
                                    <el-tag 
                                    closable 
                                    type="success"
                                    @close='deleteRightById(scope.row, item1.id)'>{{item1.authName}}</el-tag>
                                    <i class="el-icon-caret-right"></i>
                                </el-col>
                                <el-col :span="18">
                                    <!-- 三级权限 -->
                                    <el-tag v-for="item2 in item1.children"
                                    :key="item2.id" 
                                    type="warning"
                                    closable
                                    @close='deleteRightById(scope.row, item2.id)'>
                                        {{item2.authName}}
                                    </el-tag>
                                </el-col>
                            </el-row>
                        </el-col>
                    </el-row>
                </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="roleName" label="角色名称"></el-table-column>
            <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
            <!-- 编辑、删除和分配权限操作 -->
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditForm(scope.row.id)">编辑</el-button>
                    <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteRoleById(scope.row.id)">删除</el-button>
                    <el-button size="mini" type="warning" icon="el-icon-setting" @click="showRightsDialog(scope.row)">分配权限</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 添加角色对话框 -->
        <el-dialog
            title="添加角色"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addDialogClosed">
            <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addRole">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 编辑角色对话框 -->
        <el-dialog
            title="编辑角色"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editDialogClosed">
            <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="editForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="editForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editRole">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 分配权限对话框 -->
        <el-dialog
        title="分配权限"
        :visible.sync="rightsDialogVisible"
        width="50%"
        @close="rightsDialogClosed">
            <el-tree
            :data="rightsTree"
            :props="treeProps"
            show-checkbox
            default-expand-all
            node-key="id"
            :default-checked-keys="defaultKeys"
            ref="treeRef">
            </el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="rightsDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allocateRights">确 定</el-button>
            </span>
        </el-dialog>

    </el-card>
</template>

<script>
export default {
    name: 'roles',
    data() {
        return {
            roleList: [],
            // 添加角色对话框是否可见
            addDialogVisible: false,
            addForm: {
                roleName: '',
                roleDesc: '',
            },
            // 添加角色输入框验证规则
            addRules: {
                roleName: [
                    { required: true, message: '请输入角色名称', trigger: 'blur' },
                ],
                roleDesc: [
                    { required: true, message: '请输入角色描述', trigger: 'blur' },
                ]
            },
            // 编辑角色对话框是否可见
            editDialogVisible: false,
            editForm: {},
            editRules: {
                roleName: [
                    { required: true, message: '请输入角色名称', trigger: 'blur' },
                ],
                roleDesc: [
                    { required: true, message: '请输入角色描述', trigger: 'blur' },
                ]
            },
            // 分配角色权限对话框是否可见
            rightsDialogVisible: false,
            // 分配角色权限的权限树
            rightsTree: [],
            // 权限树配置
            treeProps: {
                children: 'children',
                label: 'authName',
            },
            // 打开分配权限对话框时默认勾选项
            defaultKeys: [],
            // 当前分配权限角色id
            roleId: '',
        }
    },
    mounted() {
        this.getRoleList();
    },
    methods: {
        // 获取角色和权限列表
        async getRoleList() {
            const {data: res} = await this.$http.get('roles');
            console.log(res);
            if (res.meta.status !== 200){
                this.$message.error('获取角色列表失败！');
            }
            this.roleList = res.data;
        },
        // 删除角色权限
        async deleteRightById(role, rightId) {
            const result = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => {
                return err;
            });
            if (result !== 'confirm') {
                return this.$message.info('取消删除操作！');
            }
            const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`);
            if (res.meta.status !== 200){
                return this.$message.error('删除失败！');
            }
            role.children = res.data;
        },
        // 添加角色对话框关闭时清空验证结果
        addDialogClosed() {
            this.$refs.addFormRef.resetFields();
        },
        // 添加角色
        addRole() {
            this.$refs.addFormRef.validate(async valid => {
                if (!valid){
                    return this.$message.error('字段验证失败！');
                }
                const {data: res} = await this.$http.post('roles', this.addForm);
                if (res.meta.status !== 201){
                    return this.$message.error('添加角色失败！');
                }
                this.$message.success('添加角色成功！');
                this.addDialogVisible = false;
                this.getRoleList();
            });
        },
        // 显示编辑对话框
        async showEditForm(id){
            const {data: res} = await this.$http.get(`roles/${id}`);
            if (res.meta.status !== 200){
                return this.$message.error('获取角色信息失败！');
            }
            this.editForm = res.data;
            console.log(this.editForm);
            this.editDialogVisible = true;
        },
        editDialogClosed() {
            this.$refs.editFormRef.resetFields();
        },
        // 编辑角色信息
        editRole(){
            this.$refs.editFormRef.validate(async valid => {
                if (!valid) {
                    return this.$message.error('字段验证失败');
                }
                const {data: res} = await this.$http.put(`roles/${this.editForm.roleId}`, {
                    roleName: this.editForm.roleName,
                    roleDesc: this.editForm.roleDesc,
                });
                if (res.meta.status !== 200) {
                    return this.$message.error('修改角色信息失败！');
                }
                this.$message.success('修改成功！');
                this.getRoleList();
                this.editDialogVisible = false;
            })
        },
        // 删除角色
        async deleteRoleById(id) {
            const result = await this.$confirm('此操作将永久删除角色, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => {
                return err;
            });
            if (result !== 'confirm'){
                return this.$message.info('取消删除操作！');
            }
            const {data: res} = await this.$http.delete(`roles/${id}`);
            if (res.meta.status !== 200){
                return this.$message.error('删除角色失败！');
            }
            this.$message.success('删除成功！');
            this.getRoleList();
        },
        // 显示角色权限对话框
        async showRightsDialog(role) {
            this.roleId = role.id;
            const {data: res} = await this.$http.get('rights/tree');
            if (res.meta.status !== 200){
                return this.$message.error('获取所有角色权限失败！');
            }
            console.log('rightsTree:', res.data);
            this.rightsTree = res.data;

            // 获取角色已有权限
            this.getLeaf(role, this.defaultKeys);
            console.log('defaultKeys:', this.defaultKeys);
            this.rightsDialogVisible = true;
        },
        // 递归获取角色已有权限id
        getLeaf(node, arr) {
            // 叶子节点加入权限列表
            if (!node.children) {
                return arr.push(node.id);
            }
            // 非叶子节点递归
            node.children.forEach(item => {
                this.getLeaf(item, arr);
            })
        },
        // 权限分配对话框关闭时清空默认数组
        rightsDialogClosed() {
            this.defaultKeys = [];
        },
        // 给角色分配权限
        async allocateRights() {
            // 获取所有勾选项的key
            let keys = [
                ...this.$refs.treeRef.getCheckedKeys(),
                ...this.$refs.treeRef.getHalfCheckedKeys(),
            ]
            console.log('allChecked Keys:', keys);
            console.log('currentRoleId:', this.roleId);
            const idStr = keys.join(',');
            const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {
                rids: idStr,
            });
            if (res.meta.status !== 200){
                return this.$message.error('角色授权失败！');
            }
            this.$message.success('分配权限成功！');
            this.getRoleList();
            this.rightsDialogVisible = false;
        }
    },  
}
</script>

<style lang='less' scoped>
    .bd_bottom{
        border-bottom: 1px solid #eee;
    }
    .bd_top{
        border-top: 1px solid #eee;
    }
    .el-tag{
        margin: 5px;
    }
    .center{
        display: flex;
        align-items: center;
    }
</style>