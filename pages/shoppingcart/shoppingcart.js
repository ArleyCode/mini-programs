var App = getApp();
Page({
    data: {
        UserCart: [],
        windowWidth: 200,
        windowHeight: 200,
        isChkAll: false,
        totalQty: 0,
        totalAmount: '0.00'
    },
    onLoad: function () {
        var that = this
        that.myTools = App.myTools;
        that.getSystemInfo();
    },
    onShow() {
        let that = this;
        //调用应用实例的方法获取全局数据
        that.myTools.wxRequest("GetUserCartList",
            {
                openid: wx.getStorageSync('__USERINFO__').openid,
            },
            function (resp) {
                that.setData({
                    UserCart: resp.data.rows
                });
                that.totalAmount();
            });
    },
    getSystemInfo() {
        const that = this
        wx.getSystemInfo({
            success(res) {
                that.setData({
                    windowWidth: res.windowWidth,
                    windowHeight: res.windowHeight,
                })
            }
        })
    },
    onTap(event) {
        let tapName = event.target.dataset.tap === undefined ? event.currentTarget.dataset.tap : event.target.dataset.tap;
        if (event.currentTarget.dataset.tap === tapName) {
            this[tapName](event)
        }
    },
    onShowInfo(event) {
        let data = this.data.UserCart[event.currentTarget.dataset.index] || {};
        wx.navigateTo({
            url: this.myTools.buildUrl("/pages/info/info", {
                spu_code: data.spuCode,
                is_onsale: 1,
                include_description: !0
            })
        });
    },
    onNumMinus(event) {
        let data = this.data.UserCart[event.target.dataset.index] || {};
        if (data.Qty <= 0) {
            data.isChk = !1;
            return;
        }
        data.Qty--;
        data.isChk = data.Qty !== 0;
        this.updateCartData(data)
    },
    onNumPlus(event) {
        let data = this.data.UserCart[event.target.dataset.index] || {};
        if (data.Qty >= 200) return;
        data.Qty++;
        data.isChk = data.Qty !== 0;
        this.updateCartData(data)
    },
    onCheck(event) {
        let data = this.data.UserCart[event.target.dataset.index] || {};
        data.isChk = !data.isChk;
        data.Qty = data.Qty || 1;
        this.updateCartData(data)
    },
    onCheckAll(event) {
        let that = this;
        let ischk = !this.data.isChkAll;
        for (let i = 0; i < this.data.UserCart.length; i++) {
            this.data.UserCart[i].isChk = ischk;
        }
        that.myTools.wxRequest("UpdateShopCart", {
            OpenId: wx.getStorageSync('__USERINFO__').openid,
            isChk: ischk,
            opearType:'chk',
        },
            function () {
                that.totalAmount();
            });
    },
    updateCartData(data) {
        let that = this;
        that.myTools.wxRequest("UpdateShopCart", {
            OpenId: wx.getStorageSync('__USERINFO__').openid,
            ID: data.ID,
            isChk: data.isChk,
            Qty: data.Qty,
            opearType: 'chkAndqty',
        },
            function () {
                that.totalAmount();
            });
    },
    totalAmount() {
        let amount = 0;
        let isChkAll = !0;
        let qty = 0;
        for (let i = 0; i < this.data.UserCart.length; i++) {
            if (this.data.UserCart[i].isChk) {
                this.data.UserCart[i].Qty = this.data.UserCart[i].Qty || 1;
                amount += this.myTools.convert('num', this.data.UserCart[i].Price) * this.data.UserCart[i].Qty
                qty += this.data.UserCart[i].Qty;

            }
            else
                isChkAll = !1;
            this.data.UserCart[i].Price = this.myTools.convert('rmb', this.data.UserCart[i].Price)
        }
        this.setData({
            UserCart: this.data.UserCart,
            totalAmount: this.myTools.convert('rmb', amount),
            isChkAll: isChkAll,
            totalQty: qty
        })
    },
    onChosePayway() {
        let paydata = [];
        for (let i = 0; i < this.data.UserCart.length; i++) {
            if (this.data.UserCart[i].isChk) {
                paydata.push({
                    price: this.data.UserCart[i].Price,
                    qty: this.data.UserCart[i].Qty,
                    amount: this.myTools.convert('rmb', this.myTools.convert('num', this.data.UserCart[i].Price) * this.data.UserCart[i].Qty),
                    imageUrl: this.data.UserCart[i].ImageUrl,
                    sku_code: this.data.UserCart[i].spuCode,
                    sku_name: this.data.UserCart[i].spuName,
                });
            }
        }
        wx.setStorageSync('productpayinfo', paydata);
        wx.navigateTo({
            url: '/pages/pay/pay?sessionKey=productpayinfo',
        })
    },
});