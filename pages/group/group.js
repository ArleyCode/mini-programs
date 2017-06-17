//logs.js
var App = getApp();
Page({
  data: {
    groups: [],
    products: [],
    clickid: '192662',
    windowWidth: 200,
    windowHeight: 200,
    leftWidth:120,
  },
  onLoad: function () {
    var that = this;
    that.myTools = App.myTools;
    that.setData({
      windowWidth: App.globalData.systemInfo.windowWidth,
      windowHeight: App.globalData.systemInfo.windowHeight,
      leftWidth: App.globalData.systemInfo.windowWidth*0.04+100,
    });


    that.myTools.wxRequest("GetProductGroup", {
      hasPro: false,
      page_size: '100',
    }, function (data, code) {
      if (data.data.total != 0) {
        that.setData({
          groups: data.data.rows
        });
        that.onShowgroup(data.data.rows[0].classify_id);
      }
    }, {
        loadingText: '加载中……'
      });
  },
  onShowChilren: function (event) {
    this.onShowgroup(event.target.dataset.classify_id);
  },
  onShowgroup: function (classify_pid) {
    var that = this;
    that.myTools.wxRequest("GetProductGroup", {
      hasPro: false,
      classify_id: classify_pid,
      page_size: '100',
    }, function (data, code) {
      that.setData({
        clickid: classify_pid,
        products: data.data.rows
      })
    });
  },
  onShowProducts: function (event) {
    wx.navigateTo({
      url: '/pages/search/search?classify_id=' + event.target.dataset.classify_id,
    });
  }
})
