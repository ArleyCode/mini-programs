var App = getApp();
Page({
    data: {
        option: {
            page_size: '25',
            page_no: 1,
            total: 0,
        },
        windowWidth: 200,
        windowHeight: 200,
        tipHide: true,
        tipItems: null
    },
    defaultData() {
        return {
            tipHide: !0,
            tipItems: null,
            data: null,
        }
    },
    onLoad(option) {
        this.myTools = App.myTools;
        this.$wuxProductBuyItem = App.wux(this).$wuxProductBuyItem;
        this.$wuxProductBuyItem.render().show();
        this.setData({
            windowWidth: App.globalData.systemInfo.windowWidth,
            windowHeight: App.globalData.systemInfo.windowHeight
        });
        if (option instanceof Object && option.classify_id) {
            this.loadData({ classify_id: option.classify_id });
        }
    },
    onInputChange(event) {
        clearInterval(this.Interval);
        let value = this.myTools.trim(event.detail.value);
        if (!value) {
            return this.setData(this.defaultData())
        }
        let hover = 300;
        this.Interval = setInterval(function () {
            if (hover > 0) {
                hover = hover - 100;
            }
            else {
                clearInterval(this.Interval);
                this.doInputChange(value)
            }
        }.bind(this), 100);
    },
    doInputChange(value) {
        var that = this;
        wx.getStorage({
            key: '__searchKeys__',
            success: function (res) {
                if (!res.data instanceof Object) return that.loadData({ SearchValue: value });
                let data = [{ value: 'SearchValue=' + value, text: '搜索"' + value + '"' }];
                let index = -1;
                for (var name in res.data) {
                    index = res.data[name].toLowerCase().indexOf(value.toLowerCase());
                    if (index !== -1) {
                        data.push({ value: name, text: res.data[name] })
                    }
                }
                that.setData({
                    tipItems: data,
                    tipHide: !1
                });
            },
            fail() {
                that.loadData({ SearchValue: value });
            }
        })
    },
    doSearch(event) {
        let that = this;
        let option = {};
        option.page_no = 1;
        let vs = event.target.dataset.value.split('=');
        option[vs[0]] = vs[1];
        this.data.option.page_no = 1;
        this.data.option.total = 0;
        this.data.data=[];
        this.loadData(option);
    },
    onFocus(event) {
        let value = this.myTools.trim(event.detail.value);
        if (!value) {
            return this.setData(this.defaultData())
        }
        this.doInputChange(value)
    },
    getRequestOption(option) {
        let o = {};
        if (option === null || option === undefined) {
            o = Object.assign(o, (this.$requestOptions || {}));
        } else {
            this.$requestOptions = option;
            o = Object.assign(o, option);
        }
        return Object.assign(o, this.data.option);

    },
    loadData(option) {
        let that = this;
        option = that.getRequestOption(option)
        that.$isLoadding = true;

        that.myTools.wxRequest("GetProduct", option, function (data, code) {
            data = data.data;
            if (data.hsdNextPage) {
                console.log('无下一页')
            }
            that.data.option.page_no = data.page_no;
            that.data.option.total = data.total;
            data.rows = data.rows || [];
            that.data.data = that.data.data || [];
            for (var i = 0; i < data.rows.length; i++) {
                that.data.data.push(data.rows[i])
            }
            that.setData({
                data: that.data.data,
                option: that.data.option,
                tipHide: !0,
                tipItems: null,
                tipHistory: !0
            });
            that.$isLoadding = false;
        }, {
                loadingText: '加载中……'
            });
    },
    onShowGroup: function () {
        wx.navigateTo({
            url: '/pages/group/group',
        });
    },
    onToLower() {
        if (!this.$isLoadding) {
            this.loadData();
        }
    },
})