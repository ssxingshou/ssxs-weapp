const WXAPI = require('apifm-wxapi')

const appid = wx.getAccountInfoSync().miniProgram.appId;
console.log('appid=' + appid);

async function checkSession() {
  return new Promise((resolve, reject) => {
    wx.checkSession({
      success() {
        console.log('checkSession=' + true);
        return resolve(true)
      },
      fail() {
        console.log('checkSession=' + false);
        return resolve(false)
      }
    })
  })
}

// 检测登录状态，返回 true / false
async function checkHasLogined() {
  const token = wx.getStorageSync('token')
  if (!token) {
    return false
  }
  const loggined = await checkSession()
  if (!loggined) {
    wx.removeStorageSync('token')
    return false
  }
  const checkTokenRes = await WXAPI.checkToken(token, appid)
  if (checkTokenRes.meta.code != '00000') {
    wx.removeStorageSync('token')
    return false
  }
  return true
}

async function login(page) {
  const _this = this
  wx.login({
    success: function (res) {
      WXAPI.login_wx(res.code, appid).then(function (resBack) {
        if (resBack.meta.code == '10000') {
          // 去注册
          //_this.register(page)
          return;
        }
        if (resBack.meta.code != '00000') {
          // 登录错误
          wx.showModal({
            title: '无法登录',
            content: resBack.meta.msg,
            showCancel: false
          })
          return;
        }
        wx.setStorageSync('token', resBack.data.token)
        wx.setStorageSync('uid', resBack.data.uid)

        const tokenInStorageSync = wx.getStorageSync('token');
        console.log('tokenInStorageSync=' + tokenInStorageSync);

        if (page) {
          page.onShow()
        }
      })
    }
  })
}

async function register(page) {
  let _this = this;
  wx.login({
    success: function (res) {
      let code = res.code; // 微信登录接口返回的 code 参数，下面注册接口需要用到
      wx.getUserInfo({
        success: function (resBack) {
          let iv = resBack.iv;
          let encryptedData = resBack.encryptedData;
          let referrer = '' // 推荐人
          let referrer_storge = wx.getStorageSync('referrer');
          if (referrer_storge) {
            referrer = referrer_storge;
          }
          // 下面开始调用注册接口
          WXAPI.register_complex({
            appletAppId: appid,
            code: code,
            encryptedData: encryptedData,
            iv: iv,
            referrer: referrer
          }).then(function (res) {
            _this.login(page);
          })
        }
      })
    }
  })
}

function loginOut() {
  wx.removeStorageSync('token')
  wx.removeStorageSync('uid')
}

async function checkAndAuthorize(scope) {
  return new Promise((resolve, reject) => {
    wx.getSetting({
      success(res) {
        if (!res.authSetting[scope]) {
          wx.authorize({
            scope: scope,
            success() {
              resolve() // 无返回参数
            },
            fail(e) {
              console.error(e)
              wx.showModal({
                title: '无权操作',
                content: '需要获得您的授权',
                showCancel: false,
                confirmText: '立即授权',
                confirmColor: '#e64340',
                success(res) {
                  wx.openSetting();
                },
                fail(e) {
                  console.error(e)
                  reject(e)
                },
              })
            }
          })
        } else {
          resolve() // 无返回参数
        }
      },
      fail(e) {
        console.error(e)
        reject(e)
      }
    })
  })
}


module.exports = {
  checkHasLogined: checkHasLogined,
  login: login,
  register: register,
  loginOut: loginOut,
  checkAndAuthorize: checkAndAuthorize
}