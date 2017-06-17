// order.js

const App = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        order: {},
        modelhidden:!0,
        reInfo:{
            Qty:0,
            Amount:'￥0.00'
        },
        message: '退货数量不能为0。',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        options = {
            Amount: 8314800,
            Code: "XD-201706150010",
            ConfirmStatus: 0,
            Contacts: "张雷",
            ContactsTel: "18825088127",
            DesConfirmStatus: "商家已接到订单，准备发货",
            EditDate: "2017-06-15 02:00:20",
            ID: 339,
            ImageUrl: "http://shopimg.weimob.com/55976530/Goods/1704241726013284.jpg",
            Notes: null,
            OutDate: "2017-06-15 02:00:20",
            OutQty: 26,
            Price: 3198,
            ProductName: "Panasonic/松下 E9KJ1大1匹冷暖变频挂机空调壁挂式",
            Qty: 26,
            ReceiverAddress: "财富世纪广场2703",
            SkuCode: "E9KJ1",
            TransactionId: "",
        };
        this.myTools = App.myTools;
        options.Amount = this.myTools.convert('rmb', options.Amount);
        options.Price = this.myTools.convert('rmb', options.Price);
        this.setData({
            windowWidth: App.globalData.systemInfo.windowWidth,
            windowHeight: App.globalData.systemInfo.windowHeight,
            openid: wx.getStorageSync('__USERINFO__').openid,
            order: options,
        });
    },
    onShowTip(){
        wx.showModal({
            title: '关于退货',
            content: '如果您对订单有任何问题，可以申请退货处理。我们的工作人员在核实真实情况，同意退货后会退回您的购买金额。',
            showCancel: false,
        })
    },
    onTap(){
        this.setData({
            modelhidden: !1
        });
    },
    confirm(){
        this.setData({
            modelhidden: !0
        });
    },
    onNumMinus(event) {
        let qty = this.data.reInfo.Qty;
        qty--;
        if (qty===-1) {
            return;
        }
        this.data.reInfo.Qty=qty;
        this.data.reInfo.Amount = qty*this.myTools.convert("num",this.data.order.Price)
        this.data.reInfo.Amount = this.myTools.convert("rmb", this.data.reInfo.Amount )
        this.setData({
            reInfo: this.data.reInfo
        });
    },
    onNumPlus(event) {
        let qty = this.data.reInfo.Qty;
        qty++;
        if (qty > this.data.order.Qty) return;
        this.data.reInfo.Qty=qty;
        this.data.reInfo.Amount = this.data.reInfo.Qty * this.myTools.convert("num", this.data.order.Price)
        this.data.reInfo.Amount = this.myTools.convert("rmb", this.data.reInfo.Amount)
        this.setData({
            message: '',
            reInfo: this.data.reInfo
        });
    },
    onSubmit(event){
        if (this.data.reInfo.Qty<=0) {
            this.setData({
                message: '退货数量不能为0。',
            });
            return;
        }
        if (!event.detail.value.textarea){
            this.setData({
                message: '请描述您的退货原因，让我们能够更好的为您服务。',
            });
            return;
        }
        let values = event.detail.value;
        values["ID"] = this.data.order.ID;
        values["ConfirmStatus"] = this.data.order.ConfirmStatus;
        values["Code"] = this.data.order.Code;
        values["Qty"] = this.data.order.Qty;
        values['ReQty'] = this.data.reInfo.Qty;
        values["ReAmount"] = this.myTools.convert("num", this.data.reInfo.Amount);
        console.log(values)
    }

})