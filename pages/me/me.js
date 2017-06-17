const App = getApp()
const sliderWidth = 96

Page({
    data: {
        page_no: 1,
        page_size: 25,
        openid: '',
        list: [],
        tabs: ['全部订单', '待付款', '待收货'],
        windowWidth: 200,
        windowHeight: 200,
        activeIndex: '0',
        sliderOffset: 0,
        sliderLeft: 0
    },
    onLoad() {
        this.myTools = App.myTools;
        this.$wuxPrompt = App.wux(this).$wuxPrompt
        this.$wuxPrompts = [
            this.$wuxPrompt.render('msg1', {
                title: '您暂时还没有订单',
            }),
            this.$wuxPrompt.render('msg2', {
                icon: '../../assets/images/iconfont-order.png',
                title: '您暂时还没有待付款单',
            }),
            this.$wuxPrompt.render('msg3', {
                icon: '../../assets/images/iconfont-empty.png',
                title: '您暂时还没有待收货单',
            })];


        this.setData({
            sliderLeft: (App.globalData.systemInfo.windowWidth / this.data.tabs.length - sliderWidth) / 2,
            windowWidth: App.globalData.systemInfo.windowWidth,
            windowHeight: App.globalData.systemInfo.windowHeight,
            openid: wx.getStorageSync('__USERINFO__').openid,
        });
        this.loadData();
    },
    onShow() {
        this.loadData();
    },
    loadData() {
        let that = this;
        that.$isLoading = true;
        let option = {
            openid: this.data.openid,
            page_size: this.data.page_size,
            page_no: this.data.page_no,
            orderType: this.data.activeIndex,
        };
        this.$wuxPrompts[this.data.activeIndex].hide()
        that.myTools.wxRequest("GetMyOrderist", option, function (data, code) {
            that.data.list = that.data.list || [];
            data.data.rows = data.data.rows || []
            if (data.data.rows.length === 0) {
                that.$wuxPrompts[option.orderType].show()
                that.data.page_no--;
                that.data.page_no = that.data.page_no || 1;
            }
            for (var i = 0; i < data.data.rows.length; i++) {
                data.data.rows[i].Amount = that.myTools.convert('rmb', data.data.rows[i].Amount);
                that.data.list.push(data.data.rows[i]);
            }
            that.setData({
                list: that.data.list,
                page_no: that.data.page_no
            });
            that.$isLoading = false;
        }, {
                loadingText: '加载中……'
            });
    },
    tabClick(e) {
        this.setData({
            list: [],
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex: e.currentTarget.id,
        })
        this.loadData();
    },
    onShowOrderInfo(event) {
        let id = event.currentTarget.dataset.id;
        this.myTools.wxRequest("GetOrderInfo",{ID:id},
        (data)=>{
            if(!data.data.success){
                wx.showModal({
                    title:'提示',
                    content: data.data.message,
                    showCancel:false,
                });
                return;
            }
            let info = data.data.data;
            console.log(info)
            wx.navigateTo({
                url: this.myTools.buildUrl("/pages/order/order",info),
            })
        });
    },
    onToLower() {
        if (!that.$isLoading) {
            this.data.option.page_no++;
            this.loadData();
        }
    },

})