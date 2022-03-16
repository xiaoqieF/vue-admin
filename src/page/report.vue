<template>
    <el-card>
        <div id="chart" style="width: 600px; height: 400px"></div>
    </el-card>
</template>

<script>
import * as echarts from 'echarts';
import _ from 'lodash'
export default {
    name: 'report',
    data() {
        return {
            options: {
                title: {
                text: '用户来源'
                },
                tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                    backgroundColor: '#E9EEF3'
                    }
                }
                },
                grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
                },
                xAxis: [
                {
                    boundaryGap: false
                }
                ],
                yAxis: [
                {
                    type: 'value'
                }
                ]
            }
        }
    },
    // 这时页面的dom元素已渲染完毕
    async mounted() {
        const {data: res} = await this.$http.get('reports/type/1');
        const result = _.merge(this.options, res.data);
        console.log(result);
        var myChart = echarts.init(document.getElementById('chart'));
        myChart.setOption(result);
    },
}
</script>

<style lang='less' scoped>

</style>