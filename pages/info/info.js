
var App = getApp();
const sliderWidth = 96
Page({
    data: {
        proInfo: {
            images: [],
            spu: {},
            skus: [],
            classifies: [],
            tags: []
        },
        position: {
            address: ' 广州市天河区',
            value: [18, 0, 3]
        },
        buyinfo: {
            min: 1,
            inventory: 0,
            disabled: !0,
            imageUrl: '',
            buyqty: 1,
            amount: 0,
            price: 0,
            disabledMin: false,
            disabledMax: false,
            visible: !1,
            animateCss: 'weui-animate-fade-out',
            comvisible: !1
        },
        tabs: ['图文详情', '商品属性', '评价(0)'],
        activeIndex: '0',
        sliderOffset: 0,
        sliderLeft: 0,
        height6: 0,
        mycartnum: 0,
        windowWidth:200,
        windowHeight:200,
    },
    onLoad(option) {
        var that = this;
        that.myTools = App.myTools;
        that.setData({
            windowWidth: App.globalData.systemInfo.windowWidth,
            windowHeight: App.globalData.systemInfo.windowHeight,
            sliderLeft: (App.globalData.systemInfo.windowWidth / that.data.tabs.length - sliderWidth) / 2,
            height6: App.globalData.systemInfo.windowHeight/ 5 * 3,
        });
        if (!option) return;
        that.$wuxPickerCity = App.wux(that).$wuxPickerCity
        that.$wuxPrompt = App.wux(that).$wuxPrompt
        that.$wuxPrompt.render('msg3', {
            icon: '../../assets/images/iconfont-empty.png',
            title: '暂无相关评价',
        }).show()

        that.myTools.wxRequest("GetProductFull",
            option, function (data, code) {
                let proInfo = data.data.rows[0];
                let buyinfo = that.data.buyinfo;
                if (!proInfo) return;
                that.myTools.wxParse('description', proInfo.spu.description, that, 5);
                buyinfo.imageUrl = proInfo.spu.default_img;
                let info = proInfo.skus[0];
                if (!info) return;
                buyinfo.price = that.myTools.convert('rmb', (info.sale_price || 0));
                buyinfo.market_price = that.myTools.convert('rmb', (info.market_price || 0));
                buyinfo.inventory = info.inventory || 0
                buyinfo.buyqty = info.inventory > 0 ? 1 : 0
                that.setData({
                    proInfo: proInfo,
                    buyinfo: buyinfo,
                    mycartnum: App.globalData.__mycartnum__
                });
            });
    },
    onTapCity() {
        const that = this;
        var value = that.data.position.value;
        that.$wuxPickerCity.render('city', {
            title: '请选择收货地',
            value: value,
            bindChange(value, values, displayValues) {
                if (displayValues.length == 3)
                    displayValues[0] = "";
                that.setData({
                    position: {
                        address: displayValues.join(''),
                        value: value
                    }

                })
            },
        })
    },
    changeBuyQty() {
        const that = this;
        var buyinfo = that.data.buyinfo;
        buyinfo.visible = true;
        buyinfo.animateCss = ['weui-animate-slide-up', 'weui-animate-fade-in'];
        that.setData({
            buyinfo: buyinfo
        })
        that.updateValues(buyinfo.buyqty);
    },
    onCancel() {
        var buyinfo = this.data.buyinfo;
        buyinfo.animateCss = ['weui-animate-slide-down', 'weui-animate-fade-out'];
        this.setData({
            buyinfo: buyinfo
        })
        buyinfo.visible = !1;
        buyinfo.comvisible = !1;
        setTimeout(() => {
            this.setData({
                buyinfo: buyinfo
            })
        }, 300)
    },
    tabClick(e) {
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex: e.currentTarget.id,
        })
    },
    onSub() {
        const buyinfo = this.data.buyinfo;
        if (buyinfo.disabledMin) return !1
        this.updateValues(buyinfo.buyqty - 1)
    },
    updateValues(value) {
        const buyinfo = this.data.buyinfo;

        // 最小值
        if (buyinfo.min && value < buyinfo.min) {
            value = buyinfo.min
        }

        // 最大值
        if (buyinfo.inventory && value > buyinfo.inventory) {
            value = buyinfo.inventory
        }
        buyinfo.disabledMin = (value <= buyinfo.min)
        buyinfo.disabledMax = (value >= buyinfo.inventory)
        buyinfo.buyqty = value;
        buyinfo.amount = value * this.myTools.convert('num',buyinfo.price);
        buyinfo.amount = this.myTools.convert('rmb', buyinfo.amount);
        // 更新数值，判断最小或最大值禁用sub或add按钮
        this.setData({
            buyinfo: buyinfo
        })


    },
    onAdd() {
        const buyinfo = this.data.buyinfo;
        if (buyinfo.disabledMax) return !1
        this.updateValues(buyinfo.buyqty + 1)
    },
    onToMyCart() {
        wx.switchTab({
            url: '/pages/shoppingcart/shoppingcart',
        });
    },
    onToMe() {
        wx.switchTab({
            url: '/pages/me/me',
        });
    },
    addMyCart() {
        let that = this;
        let paydata = {
            price: that.myTools.convert('num', that.data.buyinfo.price),
            quantity: that.data.buyinfo.buyqty,
            imageurl: that.data.buyinfo.imageUrl,
            goods_id: that.data.proInfo.skus[0].sku_code,
            goods_name: that.data.proInfo.skus[0].sku_name,
        };
        that.myTools.wxRequest("AddShopCart",
            {
                openid: wx.getStorageSync('__USERINFO__').openid,
                goods_detail: JSON.stringify(paydata)
            },
            function (resp) {
                if (resp.data.success) {
                    that.setData({
                        mycartnum: that.data.mycartnum + that.data.buyinfo.buyqty
                    })
                    
                }
                console.log(resp)
            });

        this.onCancel();
    },
    onBuyNow() {
        let buyinfo = this.data.buyinfo;
        if (!buyinfo.visible) {
            buyinfo.comvisible = !0;
            this.setData({
                buyinfo: buyinfo
            });
            return this.changeBuyQty();
        }

        let paydata = [{
            price: this.myTools.convert('num', this.data.buyinfo.price),
            qty: this.data.buyinfo.buyqty,
            amount: this.myTools.convert('num', this.data.buyinfo.amount),
            imageUrl: this.data.buyinfo.imageUrl,
            sku_code: this.data.proInfo.skus[0].sku_code,
            sku_name: this.data.proInfo.skus[0].sku_name,
        }];

        wx.setStorageSync('productpayinfo', paydata);
        wx.navigateTo({
            url: '/pages/pay/pay?sessionKey=productpayinfo',
        })

    }
});