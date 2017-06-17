/**
 * wux组件
 * @param {Object} $scope 作用域对象
 */
class wux {
    constructor($scope) {
        Object.assign(this, {
            $scope,
        })
        this.__init()
    }
    /**
	 * 初始化类方法
	 */
    __init() {
        this.__initDefaults()
        this.__initTools()
        this.__initComponents()
    }

    /**
	 * 默认参数
	 */
    __initDefaults() {
        const prompt = {}

        this.$scope.setData({
            [`$wux.wuxProductBuyItem`]: prompt,
        })
    }

    /**
	 * 工具方法
	 */
    __initTools() {
        //this.tools = new tools
    }

    /**
         * 初始化所有组件
         */
    __initComponents() {
        this.__initPrompt()
    }
    __initPrompt() {
        const that = this
        const extend = that.$scope.myTools.extend
        const clone = that.$scope.myTools.clone
        const $scope = that.$scope

        that.$wuxProductBuyItem = {
            defaults: {
                "classify_id": "0",
                'default_img': null,
                'spu_name': '',
                'low_sellprice': 0,
                'high_marketprice': 0,
                "itemviewClicked": function () { },
                "itembuttonClicked": function () { }
            },
            render(opts = {}) {
                const options = extend(clone(this.defaults), opts);
                // 显示
                const showComponent = () => {
                    that.setVisible()
                }
                // 隐藏
                const hideComponent = () => {
                    that.setHidden()
                }
                // 点击事件
                const itemviewClicked = (e) => {
                    const dataset = e.currentTarget.dataset || null;
                    that.showProductFullInfo(dataset);
                    typeof options.itemviewClicked === 'function' && options.itemviewClicked(dataset)
                }
                // 点击事件
                const itembuttonClicked = (e) => {
                    const dataset = e.currentTarget.dataset || null;
                    that.showProductFullInfo(dataset);
                    typeof options.itembuttonClicked === 'function' && options.itembuttonClicked(dataset)
                }
                // 渲染组件
                $scope.setData({
                    // [`$wux.wuxProductBuyItem.data`]: options,
                    [`$wux.wuxProductBuyItem.itemviewClicked`]: `itemviewClicked`,
                    [`$wux.wuxProductBuyItem.itembuttonClicked`]: `itembuttonClicked`,
                })
                // 绑定tap事件
                $scope[`itemviewClicked`] = itemviewClicked
                // 绑定tap事件
                $scope[`itembuttonClicked`] = itembuttonClicked

                return {
                    show: showComponent,
                    hide: hideComponent,
                }
            }

        };
    }

    /**
	 * 设置元素显示
	 */
    setVisible(className = 'weui-animate-fade-in') {
        this.$scope.setData({
            [`$wux.data.visible`]: !0,
            [`$wux.data.animateCss`]: className,
        })
    }

    /**
	 * 设置元素隐藏
	 */
    setHidden(className = 'weui-animate-fade-out', timer = 300) {
        this.$scope.setData({
            [`$wux.data.animateCss`]: className,
        })

        setTimeout(() => {
            this.$scope.setData({
                [`$wux.data.visible`]: !1,
            })
        }, timer)
    }
    showProductFullInfo(option) {
        wx.navigateTo({
            url: this.$scope.myTools.buildUrl("/pages/info/info", option)
        });
    }
}


export default wux