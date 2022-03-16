<template>
    <el-card>
        <!-- 顶部搜索框 -->
        <el-input 
            class="search_input"
            placeholder="请输入内容" 
            v-model="queryInfo.query" 
            clearable
            @clear="getOrderList">
                <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
        </el-input>

        <el-table
        :data="orderlist"
        style="width: 100%"
        stripe>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="order_number" label="订单编号"></el-table-column>
            <el-table-column prop="order_price" label="订单价格" width="80px"></el-table-column>
            <el-table-column prop="order_pay" label="是否付款">
                <template slot-scope="scope">
                    <el-tag v-if="scope.row.order_pay" type="success">已付款</el-tag>
                    <el-tag v-else type="danger">未付款</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="is_send" label="是否发货" width="180"></el-table-column>
            <el-table-column label="下单时间" width="180">
                <template slot-scope="scope">
                    {{ scope.row.create_time | dateFormat }}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
                <template slot-scope="scope">
                    <el-button type="primary" size="mini" icon="el-icon-edit" @click="showAddressDialog"></el-button>
                    <el-button type="success" size="mini" icon="el-icon-location" @click="showTimelineDialog"></el-button>
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
        title="修改地址"
        :visible.sync="addressVisible"
        width="50%">
        <el-form :model="addressForm" :rules="addressRules" ref="addressFormRef" label-width="100px">
            <el-form-item label="省市区/县" prop="address1">
                <el-cascader :options="cityData" v-model="addressForm.address1"></el-cascader>
            </el-form-item>
            <el-form-item label="详细地址" prop="address2">
                <el-input v-model="addressForm.address2"></el-input>
            </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
            <el-button @click="addressVisible = false">取 消</el-button>
            <el-button type="primary" @click="addressVisible = false">确 定</el-button>
        </span>
        </el-dialog>

        <el-dialog
        title="物流进度"
        :visible.sync="timelineVisible"
        width="50%">
            <el-timeline reverse>
                <el-timeline-item
                v-for="(activity, index) in timelineData"
                :key="index"
                :timestamp="activity.time">
                {{activity.context}}
                </el-timeline-item>
            </el-timeline>
        </el-dialog>
    </el-card>
</template>

<script>
import cityData from '../utils/citydata'
export default {
    name:'orders',
    mounted() {
        this.getOrderList();
    },
    data() {
        return {
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 5,
            },
            orderlist: [],
            total: 0,
            addressVisible: false,
            addressForm: {
                address1: [],
                address2: ''
            },
            addressRules: {
                address1: [
                    {required: true, message: '请选择省市区县', trigger: 'blur'}
                ],
                address2: [
                    {required: true, message: '请输入详细地址', trigger: 'blur'}
                ],
            },
            // 省市区县信息
            cityData,
            // 物流信息（因后台接口有误，故直接给出数据示例）
            timelineData:[
                {
                "time": "2018-05-10 09:39:00",
                "ftime": "2018-05-10 09:39:00",
                "context": "已签收,感谢使用顺丰,期待再次为您服务",
                "location": ""
                },
                {
                "time": "2018-05-10 08:23:00",
                "ftime": "2018-05-10 08:23:00",
                "context": "[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件",
                "location": ""
                },
                {
                "time": "2018-05-10 07:32:00",
                "ftime": "2018-05-10 07:32:00",
                "context": "快件到达 [北京海淀育新小区营业点]",
                "location": ""
                },
                {
                "time": "2018-05-10 02:03:00",
                "ftime": "2018-05-10 02:03:00",
                "context": "快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]",
                "location": ""
                },
                {
                "time": "2018-05-09 23:05:00",
                "ftime": "2018-05-09 23:05:00",
                "context": "快件到达 [北京顺义集散中心]",
                "location": ""
                },
                {
                "time": "2018-05-09 21:21:00",
                "ftime": "2018-05-09 21:21:00",
                "context": "快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]",
                "location": ""
                },
                {
                "time": "2018-05-09 13:07:00",
                "ftime": "2018-05-09 13:07:00",
                "context": "顺丰速运 已收取快件",
                "location": ""
                },
                {
                "time": "2018-05-09 12:25:03",
                "ftime": "2018-05-09 12:25:03",
                "context": "卖家发货",
                "location": ""
                },
                {
                "time": "2018-05-09 12:22:24",
                "ftime": "2018-05-09 12:22:24",
                "context": "您的订单将由HLA（北京海淀区清河中街店）门店安排发货。",
                "location": ""
                },
                {
                "time": "2018-05-08 21:36:04",
                "ftime": "2018-05-08 21:36:04",
                "context": "商品已经下单",
                "location": ""
                }
            ],
            // 物流信息对话框是否可见
            timelineVisible: false,
        }
    },
    methods: {
        // 获取订单列表
        async getOrderList() {
            const {data: res} = await this.$http.get('orders', {
                params: this.queryInfo
            });
            if (res.meta.status !== 200) {
                return this.$message.error('获取订单数据失败！');
            }
            console.log(res.data);
            this.orderlist = res.data.goods;
            this.total = res.data.total;
        },
        // 分页页面大小变化处理函数
        handleSizeChange(val) {
            this.queryInfo.pagesize = val;
            this.getOrderList();
        },
        // 分页页面num变化处理函数
        handleCurrentChange(val) {
            this.queryInfo.pagenum = val;
            this.getOrderList();
        },
        showAddressDialog() {
            this.addressVisible = true;
        },
        showTimelineDialog() {
            this.timelineVisible = true;
        }
    },
    
}
</script>

<style lang='less' scoped>
    .search_input{
        width: 400px;
    }
    .el-cascader{
        width: 100%;
    }
</style>