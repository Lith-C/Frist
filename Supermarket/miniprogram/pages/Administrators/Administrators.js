// miniprogram/pages/Administrators/Administrators.js
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: '../index/user-unlogin.png',
    userInfo: {},
    openid: '',
    button:[{'button':'库存查询',"butid":"1"},{'button':'库存修改',"butid":"2"},{'button':'订单查询',"butid":"3"}],
    butid:4,
    queryResult: {},
    query:{},
    but:{},
    order:{},
    target:{},
    butcid:0,
    counterId:'',
    step:0,
    steps:1,
    keyid:0,
    meteId:'',
    newname:'',
    newprice:0,
    newvalue:0
  },
// 获取用户信息
   
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    const db = wx.cloud.database()
    var app = getApp();
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo,
              })
            }
          })
        }
      }
    })
    db.collection('button').get({
      success: res=> {
        // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
        this.setData({
          but: res.data,
          counterId:res.data[0].counterId,
        })
        console.log(this.data.counterId)          
    db.collection(this.data.counterId).get({
        success: res=>{
          // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
          console.log(res.data)
          this.setData({
            queryResult: res.data,
          })
        }
      })
      }
    })
  },

  onQuery: function (e) {
    var that = this;
    const db = wx.cloud.database()
    var app = getApp();
    this.setData({
      butid:e.target.dataset.idx,
    })
    if(this.data.butid==0){
      this.setData({
        step:1,
        steps:1
      })
    }if(this.data.butid==1){
      this.setData({
        step:2,
        steps:1
      })
    }if(this.data.butid==2){
      this.setData({
        step:3,
        steps:1
      })
      db.collection('order').get().then(res=>{
        console.log(res.data)
        this.setData({
          order:res.data,
          target:res.data[0].target
        })
      })
    }
    },
  itemonQuery: function (e) {
    var that = this;
    const db = wx.cloud.database()
    var app = getApp();
    db.collection('button').get({
      success: res=> {
        // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
        this.setData({
          but: res.data,
          counterId:res.data[e.target.dataset.idx].counterId,
          butcid: e.target.dataset.idx
        })
        console.log(this.data.counterId)  
            
    db.collection(this.data.counterId).get({
        success: res=>{
          // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
          this.setData({
            queryResult: res.data,
          })
        }
      })
      }
    })
},
  revise: function(e){
    var that = this;
    const db = wx.cloud.database();
    const goods = db.collection(this.data.counterId);
    var app = getApp();
    this.setData({
      keyid: e.target.dataset.idx,
      steps:2
    })
    goods.where({
      keyid: e.target.dataset.idx
    })
    .field({
      _id: true,
      name: true,
      price: true,
      value: true
    })
    .get()
    .then((res) => {
      this.setData({
        query:res.data[0],
        meteId:res.data[0]._id,
        newname:res.data[0].name,
        newprice:res.data[0].price,
        newvalue:res.data[0].value
      })
      console.log(this.data.query)
    })
},
//输入的货品名
newname:function(e){
  var that = this;
    that.setData({
      newname: e.detail.value
    })
},
//输入的价格
newprice:function(e){
  var that = this;
  that.formatNum(e)
  let price = e.detail.value
  that.setData({
    newprice : price
  })
},
 formatNum(e){
    e.detail.value = e.detail.value.replace(/^(\-)*(\d+)\.(\d{6}).*$/, '$1$2.$3');
    e.detail.value = e.detail.value.replace(/[\u4e00-\u9fa5]+/g, ""); //清除汉字
    e.detail.value = e.detail.value.replace(/[^\d.]/g, ""); //清楚非数字和小数点
    e.detail.value = e.detail.value.replace(/^\./g, ""); //验证第一个字符是数字而不是  
    e.detail.value = e.detail.value.replace(".", "$#$").replace(/\./g, "").replace("$#$", "."); //只保留第一个小数点, 清除多余的 
 },
//输入的库存
newvalue:function(e){
  var that = this;
  let value = this.validateNumber(e.detail.value)
  that.setData({
    newvalue: parseInt(value)
  })
},
  validateNumber(val){
    return val.replace(/\D/g,'')
  },
Ok:function(){
  var that = this;
    const db = wx.cloud.database();
    const goods = db.collection(this.data.counterId);
    const orders = db.collection('order');
    var app = getApp();
    goods.doc(this.data.meteId).update({
      data:{
        name:this.data.newname,
        price:Number(this.data.newprice),
        value:this.data.newvalue
      }
    }).then(res=>{
      orders.where({
        'order':false,
        'target.id': this.data.meteId
      })
    .update({
        data:{
          'target.$.price': this.data.newprice
        }
      })
      wx.showToast({
        icon: 'none',
        title: '修改成功',
      })
      this.setData({
        steps:1
      })
      this.read();
    })
},
Back:function(){
  this.setData({
    steps:1
  })
},

new:function(){
    this.setData({
      steps:3
    })
},
Oknew:function(){
  var that = this;
    const db = wx.cloud.database();
    const goods = db.collection(this.data.counterId);
    var app = getApp();
    goods.add({
      data: {
      name:this.data.newname,
      price:Number(this.data.newprice),
      value:this.data.newvalue,
      mete:0,
      keyid:this.data.queryResult[this.data.queryResult.length-1].keyid+1,
      openid:this.data.queryResult._openid
      }
    }).then(res=>{
      wx.showToast({
        title: '新增成功',
      })
      this.setData({
        steps:1
      })
      this.read();
    })
},
remove:function(e){
  var that = this;
  const db = wx.cloud.database();
  const goods = db.collection(this.data.counterId);
    var app = getApp();
  console.log(e.target.dataset.idx)
  goods.where({
    keyid: e.target.dataset.idx
  })
  .field({
    _id: true,
    name: true,
    price: true,
    value: true
  })
  .get()
  .then((res) => {
    this.setData({
      query:res.data[0],
      meteId:res.data[0]._id,
      steps:4
    })
  })
},
Okremove:function(){
  var that = this;
    const db = wx.cloud.database();
    const goods = db.collection(this.data.counterId);
    var app = getApp();
    goods.doc(this.data.meteId).remove().then(res=>{
      wx.showToast({
        title: '删除成功',
      })
      this.setData({
        steps:1
      })
      this.read();
    })
},

more:function(){
  this.setData({
    steps:5
  })
},
read:function(){
  var that = this;
  const db = wx.cloud.database();
  const goods = db.collection(this.data.counterId);
  var app = getApp();
  goods.get().then(res=>{
    // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
    this.setData({
      queryResult: res.data,
    })
  })
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