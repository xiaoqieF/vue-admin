<template>
    <el-card>
        <!-- 信息提示框 -->
        <el-alert title="添加商品信息" type="info" :closable="false" center show-icon>
        </el-alert>
        <!-- 步骤条 -->
        <el-steps :active="activeIndex - 0" align-center>
            <el-step title="基本信息"></el-step>
            <el-step title="商品参数"></el-step>
            <el-step title="商品属性"></el-step>
            <el-step title="商品图片"></el-step>
            <el-step title="商品内容"></el-step>
            <el-step title="完成"></el-step>
        </el-steps>

        <!-- 表单标签包裹tab标签 -->
        <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px" label-position="top">
            <!-- 步骤tab -->
            <el-tabs tab-position="left" 
            v-model="activeIndex" 
            :before-leave="handleLeave"
            @tab-click="tabClicked">
                <el-tab-pane label="基本信息" name="0">
                    <el-form-item label="商品名称" prop="goods_name">
                        <el-input v-model="addForm.goods_name"></el-input>
                    </el-form-item>
                    <el-form-item label="商品价格" prop="goods_price">
                        <el-input v-model.number="addForm.goods_price" type="number"></el-input>
                    </el-form-item>
                    <el-form-item label="商品重量" prop="goods_weight">
                        <el-input v-model.number="addForm.goods_weight" type="number"></el-input>
                    </el-form-item>
                    <el-form-item label="商品数量" prop="goods_number">
                        <el-input v-model.number="addForm.goods_number" type="number"></el-input>
                    </el-form-item>
                    <!-- 商品分类级联选择器 -->
                    <el-form-item label="商品分类" prop="goods_cat">
                        <el-cascader
                        v-model="addForm.goods_cat"
                        :options="catelist"
                        :props="cascaderProps"
                        @change="handleChange"></el-cascader>
                    </el-form-item>
                </el-tab-pane>
                <!-- 商品参数 many -->
                <el-tab-pane label="商品参数" name="1">
                    <el-form-item 
                    v-for="item in this.manyAttrs" 
                    :label="item.attr_name" 
                    :key="item.attr_id">
                        <el-checkbox-group v-model="item.checked_attr_vals" size="small">
                            <el-checkbox 
                            v-for="(val, i) in item.attr_vals" 
                            :key="i" 
                            :label="val"
                            border></el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                </el-tab-pane>
                <!-- 商品属性 only -->
                <el-tab-pane label="商品属性" name="2">
                    <el-form-item v-for="item in onlyAttrs" :key="item.attr_id" :label="item.attr_name">
                        <el-input v-model="item.attr_vals"></el-input>
                    </el-form-item>
                </el-tab-pane>
                <!-- 上传商品图片 -->
                <el-tab-pane label="商品图片" name="3">
                    <el-upload
                    :action="uploadUrl"
                    :on-preview="handlePreview"
                    :on-remove="handleRemove"
                    list-type="picture"
                    :headers="uploadHeader"
                    :on-success="handleSuccess">
                        <el-button size="small" type="primary">点击上传</el-button>
                    </el-upload>
                </el-tab-pane>
                <el-tab-pane label="商品内容" name="4">
                    <quill-editor v-model="addForm.goods_introduce">
                    </quill-editor>
                    <el-button type="primary" @click="addGoods">添加商品</el-button>
                </el-tab-pane>
            </el-tabs>
        </el-form>

        <el-dialog
        title="预览"
        :visible.sync="previewVisible"
        width="50%">
        <img :src="previewPath" alt="" style="width: 100%">
        </el-dialog>
    </el-card>
</template>

<script>
// 导入lodash插件，用于实现deepclone
import _ from 'lodash'

export default {
    name: 'addGoods',
    mounted() {
        this.getCateList();
    },
    data() {
        return {
            activeIndex: '0',
            addForm: {
                goods_name: '',
                goods_price: 0,
                goods_number: 0,
                goods_weight: 0,
                goods_cat: [],
                pics : [],
                goods_introduce: '',
                attrs: [],
            },
            addRules: {
                goods_name :[
                    {required: true, message: '请输入商品名称', trigger: 'blur'}
                ],
                goods_price :[
                    {required: true, message: '请输入商品价格', trigger: 'blur'}
                ],
                goods_weight :[
                    {required: true, message: '请输入商品重量', trigger: 'blur'}
                ],
                goods_number :[
                    {required: true, message: '请输入商品数量', trigger: 'blur'}
                ],
                goods_cat :[
                    {required: true, message: '请输入商品分类', trigger: 'blur'}
                ],
            },
            cascaderProps: { 
                expandTrigger: 'hover',
                label: 'cat_name',
                value: 'cat_id',
                children: 'children',
            },
            // 分类列表，用于分类选择器显示
            catelist: [],
            // 动态参数列表
            manyAttrs: [],
            // 静态属性列表
            onlyAttrs: [],
            // 上传图片URL
            uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
            // 上传图片时请求头
            uploadHeader: {
                Authorization: window.sessionStorage.getItem('token')
            },
            // 图片预览对话框是否可见
            previewVisible: false,
            // 图片预览地址
            previewPath: '',
        }
    },
    methods: {
        // 获取分类数据
        async getCateList() {
            const {data: res} = await this.$http.get('categories');
            if (res.meta.status !== 200){
                return this.$message.error('获取商品分类失败！');
            }
            console.log('categories data:', res);
            this.catelist = res.data;
        },
        // 分类选择框切换选项
        handleChange() {
            console.log('selectedKeys:', this.addForm.goods_cat);
            // 只允许选中三级分类
            if (this.addForm.goods_cat.length !== 3) {
                this.addForm.goods_cat = [];
                return;
            }
            
        },
        // tab页表切换
        handleLeave(activeName, oldActiveName) {
            console.log('active:', activeName);
            console.log('oldActive:', oldActiveName);
            // 未选择分类页面禁止跳转
            if (oldActiveName === '0' && this.addForm.goods_cat.length === 0) {
                return false;
            }
        },
        // tab被选中时回调
        async tabClicked() {
            // 当前切换至动态参数页面
            if (this.activeIndex === '1') {
                const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
                    params: {sel: 'many'}
                });
                if (res.meta.status !== 200) {
                    return this.$message.error('获取动态参数失败！');
                }
                // 将属性值由字符串分割成数组
                res.data.forEach(item => {
                    item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : [];
                    // 给每个item绑定一个checked_attr_vals属性，表示复选框组选中的属性
                    item.checked_attr_vals = item.attr_vals;                   
                });
                console.log('[many]res.data:', res.data);
                this.manyAttrs = res.data;
            } else if (this.activeIndex === '2') {  // 当前切换至商品属性页面
                const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
                    params: {sel: 'only'}
                });
                if (res.meta.status !== 200) {
                    return this.$message.error('获取静态属性失败！');
                }
                console.log('[only]res.data:', res.data);
                this.onlyAttrs = res.data;
            }
        },
        // 图片预览处理函数
        handlePreview(file) {
            console.log(file);
            this.previewPath = file.response.data.url;
            this.previewVisible = true;
        },
        // 删除上传图片
        handleRemove(file) {
            // 删除相应路径
            this.addForm.pics = this.addForm.pics.filter(item => 
                item.pic !== file.response.data.tmp_path
            );
            console.log('pics:', this.addForm.pics);
        },
        // 图片上传成功钩子
        handleSuccess(response) {
            this.addForm.pics.push({pic: response.data.tmp_path});
            console.log('pics:', this.addForm.pics);
        },
        addGoods() {
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) {
                    return this.$message.error('请填写必要信息！');
                }
                // 深拷贝一份addForm，对其中部分属性进行重新定义
                const form = _.cloneDeep(this.addForm);
                form.goods_cat = form.goods_cat.join(',');
                this.manyAttrs.forEach(item => {
                    let info = {
                        attr_id: item.attr_id,
                        // 注意值为之前注入的属性，表示用户选择的动态参数
                        attr_value: item.checked_attr_vals.join(','),
                    }
                    form.attrs.push(info);
                });
                this.onlyAttrs.forEach(item => {
                    let info = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals,
                    }
                    form.attrs.push(info);
                });
                console.log('form:', form);
                const {data: res} = await this.$http.post('goods', form);
                console.log('res:', res);
                if (res.meta.status !== 201) {
                    return this.$message.error('添加商品失败！');
                }
                this.$message.success('添加成功！');
                this.$router.push('/goods');
            })
        }
    },
    computed: {
        // 当前选中的分类id
        cateId() {
            if (this.addForm.goods_cat.length === 0) {
                return null;
            }
            return this.addForm.goods_cat[2];
        }
    }
}
</script>

<style lang='less' scoped>
    .el-step{
        margin: 20px 0;
    }
    .el-step__title{
        font-size: 14px;
    }
    .el-checkbox{
        margin: 0 5px 0 0;
    }
    .el-button{
        margin-top: 20px;
    }
</style>