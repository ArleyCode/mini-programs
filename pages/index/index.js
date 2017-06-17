
var App = getApp()

Page({
    data: {
        proGroup: null,
        selectItems: null,
        titleImgs: [
            '../../assets/images/title_img_01.jpg',
            '../../assets/images/title_img_02.jpg',
        ],
        rotate: 0,
        page_no: 1,
        page_size: 20,
        total:0,
        selectIndex: -1,
        animationData: {},
        windowWidth: 200,
        windowHeight: 200
    },
    onLoad() {
        this.myTools = App.myTools;
        this.$wuxProductBuyItem = App.wux(this).$wuxProductBuyItem;
        this.$wuxProductBuyItem.render().show();
        var animation = wx.createAnimation({
            duration: 300,
            timingFunction: 'linear',
        });
        this.animation = animation;
        this.setData({
            windowWidth: App.globalData.systemInfo.windowWidth,
            windowHeight: App.globalData.systemInfo.windowHeight
        });
        this.loadData();

    },
    loadData() {
        var that = this;
        that.myTools.wxRequest("GetProductGroup", {
            hasPro: false,
            page_size: that.data.page_size,
            minproductnum: 10
        }, function (data, code) {
            that.setData({
                proGroup: data.data.rows,
                selectItems: { classify_name: '金松电器', classify_id: '',}
            });
            that.doLoadProduct();
        }, {
                loadingText: '加载中……'
            });
    },
    onOpenSearchView: function () {
        wx.navigateTo({
            url: '/pages/search/search',
        });
    },
    onSelectItem(event) {
        let that = this;
        if (this.$isLoadding) return;
        let sdata = that.data.proGroup[event.currentTarget.dataset.index] || {
            classify_name: '金松电器',
            classify_id: '',
        };;

        this.setData({
            page_no:1,
            selectIndex: event.currentTarget.dataset.index,
            selectItems: sdata
        });
        this.doLoadProduct();
    },
    doLoadProduct() {
        let that = this;
        that.$isLoadding = true;
        let selectItems = that.data.selectItems;
        that.myTools.wxRequest("GetProduct", {
            page_size: that.data.page_size,
            page_no: that.data.page_no,
            classify_id: selectItems.classify_id,
            total: that.data.total,
        }, function (data, code) {
            selectItems.products = selectItems.products || []
            data.data.rows = data.data.rows || [];
            selectItems.subGrounds = data.data.subGrounds.slice(0,8);
            for (var i = 0; i < data.data.rows.length; i++) {
                selectItems.products.push(data.data.rows[i])
            }
            that.setData({
                page_no: data.data.page_no,
                total: data.data.total,
                selectItems: selectItems
            });
            that.$isLoadding = false;
        }, {
                loadingText: '加载中……'
            });
    },
    onShowAllgroup() {
        let rotate = 180 - this.data.rotate;
        console.log(rotate)
        this.animation.rotate(rotate).step();
        this.setData({
            rotate: rotate,
            animationData: this.animation.export(),
        })
    },
    onToLower() {
        if (!this.$isLoadding) {
            this.doLoadProduct();
        }
    },
    onShowSubPro (event){
        wx.navigateTo({
            url: '/pages/search/search?classify_id=' + event.currentTarget.dataset.classify_id,
        });
    }
})
