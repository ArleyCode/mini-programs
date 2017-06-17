Object.assign = Object.assign && typeof Object.assign === 'function' ? Object.assign : function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key]
      }
    }
  }
  return target
}
Array.from = Array.from && typeof Array.from === 'function' ? Array.from : obj => [].slice.call(obj)

import wux from 'components/wux'
//import WxValidate from 'assets/plugins/WxValidate'
import myTools from 'utils/util'

let appid = 'wx3a28ae89c8c6e402';
let appsercet = '193900f5c9bdba3bb1255888bc881f99';


App({
  onLaunch() {
    this.myTools = new myTools;
    this.globalData.__appid__ = appid;
    this.globalData.__appsercet__ = appsercet;
    this.wxGetSystemInfo();//获取系统信息
    this.wxCheckSession();//获取用户信息
  },
  globalData: {
    userInfo: null
  },
  onShow() { },
  onHide() { },
  wux: wux,
  wxGetSystemInfo() {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.globalData.systemInfo = res;
      }
    })
  },
  wxCheckSession() {
    var that = this;
    wx.checkSession({
      success() {
        //登录态未过期
        if (!that.GetUserInfo().openid) {
          that.wxLogin();
        } else {
          that.initData();
        }
      },
      fail() {
        //登录态过期，重新登录
        that.wxLogin();
      }
    })
  },
  wxLogin() {
    var that = this;
    wx.login({
      success(resData) {
        that.wxGetUserInfo(resData);
      },
      fail() {
        console.log('登录失败')
      }
    });
  },
  GetUserInfo(userInfo) {
    let __USERINFO__ = wx.getStorageSync('__USERINFO__') || {
      avatarUrl: "",
      city: "",
      country: "",
      expires_in: 0,
      gender: "0",
      language: "",
      nickName: "",
      openid: "",
      province: ""
    };
    if (userInfo instanceof Object) {
      Object.assign(__USERINFO__, userInfo);
      wx.setStorageSync('__USERINFO__', __USERINFO__)
    }
    return __USERINFO__;
  },
  wxGetUserInfo(userInfo) {
    let that = this;
    wx.getUserInfo({
      withCredentials: true,
      success: function (res) {
        that.myTools.wxRequest("jscode2session", {
          code: userInfo.code,
          appid: appid,
          appsercet: appsercet,
          iv: res.iv,
          encryptedData: res.encryptedData
        }, function (resp) {
          that.GetUserInfo(resp.data.data);
          that.initData();
        });
      }
    })
  },
  wxAuthorize() {
    wx.authorize({
      scope: 'scope.userLocation',
      success(res) {
        wx.chooseAddress({
          complete(res) {
          }
        })
      },
      complete(res) {
      }
    })
  },
  /**
   * 更新用户信息
   */
  initData() {
    let that = this;
    that.myTools.wxRequest("InitUserData", {
      openid: wx.getStorageSync('__USERINFO__').openid,
    }, function (resp) {
      that.globalData.__mycartnum__ = resp.data.userCartNum;

    });
  },
})