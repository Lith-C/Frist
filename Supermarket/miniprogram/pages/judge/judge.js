// miniprogram/pages/judge/judge.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputValue: '',
    but:{}
  },
  bindKeyInput: function (e) {
    var that = this;
    that.setData({
      inputValue: e.detail.value
    })
  },
  go: function () {
    var that = this;
    var app = getApp();
    var state = false;
    const db = wx.cloud.database();
    const admin = db.collection('admin');
    admin.doc('admin').get().then(res=>{
      let ad = res.data.admins
      console.log(ad)
      for(var i=0;i<ad.length;i++){ 
        if(this.data.inputValue==ad[i]){
          state = true
        }
      }
      if (state == true) {
        wx.hideKeyboard()
        wx.redirectTo({
          url: '../Administrators/Administrators',
        })
        //调用云函数
        wx.cloud.callFunction({
          name: 'login',
          data: {},
          success: res => {
            console.log('[云函数] [login] user openid:', res.result.openid)
            app.globalData.openid = res.result.openid
          }
        })
      }else{
        wx.showToast({
          icon: 'none',
          title: '请输入正确管理员号',
        })
      }
    })
  },
  gohome: function() {
    wx.reLaunch({
      url: '../select/select',
    })
    // wx.navigateBack()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})