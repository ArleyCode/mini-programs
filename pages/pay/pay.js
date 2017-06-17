let App = getApp();

let __sessionKey = 'recevice_sessionKey';

Page({
    data: {
        pageData: {
            proinfos: [],
            recevices: [],
            useRecevice: {
                name: '',
                tel: '',
                address: '',
                zip: ''
            },
            defaultRecevice: {
                name: '张雷',
                tel: '18825088127',
                address: '财富世纪广场2703',
                area: '省、市、区',
                useArea: null,
                areaId: [18, 0, 3],
                zip: '510000'
            },
            isChooseRecevice: !0,
            visible: !1,
            opera: 'add',
            amount: 0,
        },
        windowHeight:200,
        windowHeight:200
    },
    onLoad(option) {
        let that = this;
        that.myTools = App.myTools;
        that.$wuxPickerCity = App.wux(that).$wuxPickerCity
        let pageData = that.data.pageData;
        pageData.proinfos=wx.getStorageSync(option.sessionKey);
        wx.removeStorageSync(option.sessionKey);
        pageData.amount = 0;
        for (let i = 0; i < pageData.proinfos.length; i++) {
            pageData.amount += that.myTools.convert('num', pageData.proinfos[i].amount);
            pageData.proinfos[i].amount= that.myTools.convert('rmb', pageData.proinfos[i].amount);
            pageData.proinfos[i].price = that.myTools.convert('rmb', pageData.proinfos[i].price);
        }
         pageData.amount=this.myTools.convert('rmb', pageData.amount);
        that.setData({
            pageData: pageData,
            windowWidth: App.globalData.systemInfo.windowWidth,
            windowHeight: App.globalData.systemInfo.windowHeight
        });
        wx.getStorage({
            key: __sessionKey,
            success(res) {
                that.UpdateData(res.data)
            },
            fail() {
                that.UpdateData()
            }
        })
    },
    UpdateData(data) {
        let $this = this;
        let defaults = $this.data.pageData;
        if (data instanceof Array) {
            defaults.recevices = data;
        } else if (data instanceof Object) {
            defaults.recevices.push(data);
        }
        let useRecevice = null;
        for (var i = 0; i < defaults.recevices.length; i++) {
            if (defaults.recevices[i]) {
                if (
                    useRecevice === null &&
                    (defaults.recevices[i].isUse
                        ||
                        defaults.recevices[i].isdefault)) {
                    useRecevice = defaults.recevices[i]
                    useRecevice.isUse = true;
                    $this.myTools.arrayRemove(defaults.recevices, useRecevice);
                    i--;
                } else {
                    defaults.recevices[i].isUse = false;
                }
            } else {
                $this.myTools.arrayRemove(defaults.recevices, defaults.recevices[i]);
                i--;
            }
        }
        if (!useRecevice && defaults.recevices[0]) {
            useRecevice = defaults.recevices[0];
            useRecevice.isUse = true;
            useRecevice.isdefault = 1;
        }
        if (useRecevice) {
            let arr = [useRecevice];
            arr.push(...defaults.recevices);
            defaults.recevices = arr
            defaults.useRecevice = useRecevice;
            defaults.isChooseRecevice = !0;
        } else
            defaults.isChooseRecevice = !1;
        wx.setStorage({
            key: __sessionKey,
            data: defaults.recevices
        })
        $this.setData({
            pageData: defaults
        });
        return defaults;
    },
    onCancel() {
        this.UpdateData()
        let pageData = this.data.pageData;
        if (pageData.opera == "add" && pageData.visible) {
            pageData.opera = "choose";
            this.setData({
                pageData: pageData,
            });
            this.setVisible(['weui-animate-slide-up', 'weui-animate-fade-in'])
        } else {
            this.setHidden(['weui-animate-slide-down', 'weui-animate-fade-out'])
        }

    },
    onChooseRecevice() {
        let pageData = this.data.pageData;
        if (pageData.recevices instanceof Array && pageData.recevices.length > 0) {
            pageData.opera = "choose";
        } else {
            pageData.opera = "add";
        }
        this.setData({
            pageData: pageData,
        });
        this.setVisible(['weui-animate-slide-up', 'weui-animate-fade-in'])
    },
    onChooseArea() {
        const that = this;
        var areaId = that.data.pageData.useRecevice.areaId;
        that.$wuxPickerCity.render('area', {
            title: '请选择收货地',
            value: areaId,
            bindChange(value, values, displayValues) {
                let pageData = that.data.pageData;
                pageData.defaultRecevice.areaId = value;
                pageData.defaultRecevice.useArea = displayValues;
                pageData.defaultRecevice.area = displayValues.join('、');
                that.setData({
                    pageData: pageData
                })
            },
        })
    },
    onAddRecevive() {
        let pageData = this.data.pageData;
        pageData.opera = "add";
        this.setData({
            pageData: pageData,
        });
        this.setVisible(['weui-animate-slide-up', 'weui-animate-fade-in'])
    },
    onInput(event){
        this.data.pageData.proinfos[event.target.dataset.index].notes = event.detail.value;
        this.setData({
            pageData: this.data.pageData
        });
    },
    formSubmit(e) {
        var value = e.detail.value;
        let data = this.myTools.clone(this.data.pageData.defaultRecevice);
        if (!data.useArea)
            return wx.showToast({
                title: `请选择收货省份。`,
                image: '/resources/icons/aci.png',
            })
        for (var o in value) {
            if (value[o] instanceof Array) {
                value[o] = value[o][0] || 0;
            }
            if (value[o] === '') {
                return wx.showToast({
                    title: `请填写完整。`,
                    image: '/resources/icons/aci.png',
                })
            } else {
                data[o] = value[o]
            }
        }
        data.useArea = data.useArea.join('');
        if (data.__index != undefined) {
            let recevice = this.data.pageData.recevices[data.__index];
            this.myTools.arrayRemove(this.data.pageData.recevices, recevice);
        }
        if (data.isdefault == 1) {
            for (var i = 0; i < this.data.pageData.recevices.length; i++) {
                this.data.pageData.recevices[i].isdefault = 0;
            }
        }
        this.UpdateData(data)
        let pageData = this.data.pageData;
        pageData.opera = "choose";
        this.setData({
            pageData: pageData,
        });
        this.setVisible(['weui-animate-slide-up', 'weui-animate-fade-in'])
    },
    onDelRecevice(e) {
        let index = e.target.dataset.index;
        let recevice = this.data.pageData.recevices[index];
        this.myTools.arrayRemove(this.data.pageData.recevices, recevice);
        this.UpdateData()
    },
    onEditRecevice(e) {
        let index = e.target.dataset.index;
        let pageData = this.data.pageData;
        let recevice = pageData.recevices[index];
        recevice.__index = index;
        pageData.defaultRecevice = this.myTools.clone(pageData.recevices[index]);
        pageData.opera = "add";
        this.setData({
            pageData: pageData,
        });
        this.setVisible(['weui-animate-slide-up', 'weui-animate-fade-in'])
    },
    onSetUseItem(e) {
        let index = e.currentTarget.dataset.index;
        let pageData = this.data.pageData;
        for (var i = 0; i < pageData.recevices.length; i++) {
            pageData.recevices[i].isUse = false;
        }
        let recevice = pageData.recevices[index];
        recevice.isUse = true;
        this.setData({
            pageData: pageData
        })
    },
    onPay(e) {
        let that = this;
        let pageData = this.data.pageData;
        let useRecevice = this.myTools.clone(pageData.useRecevice);
        useRecevice = useRecevice instanceof Object ? useRecevice : {};

        //是否选择收货人信息
        if (!useRecevice.address) {
            wx.showToast({
                title: '请添加收货地址',
                duration: 1000,
                image:'../../assets/images/iconfont-toptips.png',
                mask: true
            })
            return;
        }
        let proinfos = that.data.pageData.proinfos;
        proinfos = proinfos instanceof Array ? proinfos : [];
        let goods_detail = [];
        // goods_detail.push({
        //         goods_id: 'E9KJ1',//proinfos[i].sku_code,//商品的编号
        //         wxpay_goods_id: 'E9KJ1',//proinfos[i].sku_code,//微信支付定义的统一商品编号
        //         goods_name:'测试款',// 商品名称
        // imageurl:'http://shopimg.weimob.com/55976530/Goods/1706081017422547.jpg@0e_320w_320h_0c_0i_0o_90Q_1x.src',
        //         quantity: 1,
        //         price:1,////商品单价，单位为分 
        //      });
        for (let i = 0; i < proinfos.length; i++) {
            goods_detail.push({
                goods_id: proinfos[i].sku_code,//商品的编号
                wxpay_goods_id: proinfos[i].sku_code,//微信支付定义的统一商品编号
                goods_name: proinfos[i].sku_name,// 商品名称
                imageurl: proinfos[i].imageUrl,// 商品名称
                quantity: proinfos[i].qty,// 商品数量
                price:that.myTools.convert('num', proinfos[i].price) * 100,//商品单价，单位为分
                notes: proinfos[i].notes,// 商品数量
            });
        }

        if (goods_detail.length == 0) {
            wx.showToast({
                title: '抱歉，无购买商品信息',
                duration: 2000,
                mask: true
            })
            return;
        }

        that.myTools.wxRequest("submitOrder", {
            appid: App.globalData.__appid__,
            openid: wx.getStorageSync('__USERINFO__').openid,
            goods_detail: JSON.stringify(goods_detail),
            useRecevice: JSON.stringify(that.data.pageData.useRecevice)
        }, function (resp) {
            if (!resp.data.success)
                return wx.showToast({
                    title: '抱歉，购买失败。' + resp.data.message,
                    duration: 2000,
                    mask: true
                })
            var options = JSON.parse(resp.data.data);
            wx.requestPayment(
                {
                    'timeStamp': options.timeStamp,
                    'nonceStr': options.nonceStr,
                    'package': options.package,
                    'signType': 'MD5',
                    'paySign': options.paySign,
                    'success': function (res) {
                        wx.showModal({
                            title: '支付成功',
                            content: '您购买了一件商品。',
                            cancelText:'确定',
                            showCancel:true,
                            confirmText:'查看我的订单',
                            success: function (modal) {
                                if (modal.confirm) {
                                    wx.switchTab({
                                        url: '/pages/me/me',
                                    });
                                } else if (modal.cancel) {
                                    console.log('用户点击取消')
                                }
                            }
                        })
                    },
                    'fail': function (res) {
                        wx.showToast({
                            title: '支付已取消',
                            image: '/resources/icons/aci.png',
                            duration: 2000,
                            mask: true
                        })
                    }
                })
        });
    },
    setVisible(className = 'weui-animate-fade-in') {
        let pageData = this.data.pageData;
        pageData.visible = !0;
        pageData.animateCss = className
        this.setData({
            pageData: pageData
        })
    },
    /**
	 * 设置元素隐藏
	 */
    setHidden(className = 'weui-animate-fade-out', timer = 300) {
        let pageData = this.data.pageData;
        let that = this;
        pageData.animateCss = className
        that.setData({
            pageData: pageData,
        })
        pageData.visible = !1
        pageData.pay_visible = !1
        setTimeout(() => {
            that.setData({
                pageData: pageData,
            })
        }, timer)
    }
});