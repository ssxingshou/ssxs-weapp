const app = getApp()
const CONFIG = require('../../config.js')
const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
const TOOLS = require('../../utils/tools.js')

const appid = wx.getAccountInfoSync().miniProgram.appId;
console.log('appid=' + appid);

Page({
  data: {
    wxlogin: true,

    balance: 0.00,
    freeze: 0,
    score: 0,
    growth: 0,
    score_sign_continuous: 0,
    rechargeOpen: false // 是否开启充值[预存]功能
  },
  onLoad() {
    let rechargeOpen = wx.getStorageSync('RECHARGE_OPEN')
    if (rechargeOpen && rechargeOpen == "1") {
      rechargeOpen = true
    } else {
      rechargeOpen = false
    }
    this.setData({
      rechargeOpen: rechargeOpen
    })
  },
  onShow() {
    const _this = this
    this.setData({
      version: CONFIG.version,
      vipLevel: app.globalData.vipLevel
    })
    AUTH.checkHasLogined().then(isLogined => {
      this.setData({
        wxlogin: isLogined
      })
      if (isLogined) {
        _this.getUserApiInfo();
        //_this.getUserAmount();
      }
    })
    // 获取购物车数据，显示TabBarBadge
    TOOLS.showTabBarBadge();
  },
  aboutUs: function () {
    wx.showModal({
      title: '关于我们',
      content: '欢迎使用灵兽通会员助手！',
      showCancel: false
    })
  },
  loginOut() {
    AUTH.loginOut()
    wx.reLaunch({
      url: '/pages/my/index'
    })
  },
  getPhoneNumber: function (e) {
    if (!e.detail.errMsg || e.detail.errMsg != "getPhoneNumber:ok") {
      wx.showModal({
        title: '提示',
        content: e.detail.errMsg,
        showCancel: false
      })
      return;
    }
    WXAPI.bindMobileWxa(appid, wx.getStorageSync('token'),
      e.detail.encryptedData, e.detail.iv).then(res => {
        if (res.meta.code === 10002) {
          this.setData({
            wxlogin: false
          })
          return
        }
        if (res.meta.code == '00000') {
          wx.showToast({
            title: '绑定成功',
            icon: 'success',
            duration: 2000
          })
          this.getUserApiInfo();
        } else {
          wx.showModal({
            title: '提示',
            content: res.meta.msg,
            showCancel: false
          })
        }
      })
  },
  getUserApiInfo: function () {
    var that = this;
    WXAPI.userDetail(wx.getStorageSync('token'), appid).then(function (resBack) {
      if (resBack.meta.code == '00000') {
        let _data = {}
        _data.apiUserInfoMap = resBack.data
        console.log('apiUserInfoMap=' + _data.apiUserInfoMap);
         if (resBack.data.mobile) {
           _data.userMobile = resBack.data.mobile
         }
        that.setData(_data);
      }
    })
  },
  // 获取会员钱包信息
  getUserAmount: function () {
    var that = this;
    WXAPI.userAmount(wx.getStorageSync('token')).then(function (res) {
      if (res.code == 0) {
        that.setData({
          balance: res.data.balance.toFixed(2),
          freeze: res.data.freeze.toFixed(2),
          score: res.data.score,
          growth: res.data.growth
        });
      }
    })
  },
  goAsset: function () {
    wx.navigateTo({
      url: "/pages/asset/index"
    })
  },
  goScore: function () {
    wx.navigateTo({
      url: "/pages/score/index"
    })
  },
  goOrder: function (e) {
    wx.navigateTo({
      url: "/pages/order-list/index?type=" + e.currentTarget.dataset.type
    })
  },
  cancelLogin() {
    this.setData({
      wxlogin: true
    })
  },
  goLogin() {
    this.setData({
      wxlogin: false
    })
  },
  processLogin(e) {
    if (!e.detail.userInfo) {
      wx.showToast({
        title: '已取消',
        icon: 'none',
      })
      return;
    }
    AUTH.register(this);
  },
})