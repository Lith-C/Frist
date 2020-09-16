// miniprogram/pages/ShoppingCart/ShoppingCart.js
const app = getApp()
Page({
 
  data: {
    step:1,
    order:{},
    cartId:'',
    jiesuan:0,
    vipjiesuan:0,
    inputnewValue:'',
    inputoldValue:'',
    vip:{},
    vipvalue:false,
    vipnewvalue:true,
    but:{},
    counterId:'',
    nickName:''
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const db = wx.cloud.database()
    var app = getApp();
    this.setData({
      nickName:app.globalData.nickName
    })
    console.log(this.data.nickName)
    db.collection('order').where({'order':false,'name':this.data.nickName}).get({
      success:res => {
        // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
        console.log(res.data)
        this.setData({
          order: res.data[0].target,
          cartId:res.data[0]._id
        })
        console.log(this.data.order)
        var js=0;
        for(var i=0;i<res.data[0].target.length;i++){
          js = js + res.data[0].target[i].price*res.data[0].target[i].mete
        }
        this.setData({
          jiesuan : js,
          vipjiesuan:js*8/10
        })
        console.log(this.data.jiesuan)
        console.log(this.data.vipjiesuan)
      }
    })
    db.collection('users').get({
      success: res=>{
        // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
        this.setData({
          vip: res.data[0].viplist
        })
        console.log(this.data.vip)
      }
    })
  },
  //结算按钮
  topay:function(){
    if(this.data.cartId==''){
      wx:wx.showToast({
        title: '请添加商品',   
        icon: 'none',
      })
    }else{
    this.setData({
      step:2
    })
    }
  },
  //直接普通付款
  prevStep:function(){
    const db= wx.cloud.database()
    var app = getApp();
    const _ = db.command;
    db.collection('order').doc(this.data.cartId).update({
      data:{
        jieusuan:this.data.jiesuan
      }
    })
    db.collection('order').where({'_id':this.data.cartId}).update({
      data:{
        order:true
      }
    })
    this.setData({
      step:4
    })
  },
  //判断用户符合会员申请条件
  gotoStep:function(){
    if(this.data.jiesuan>=50){
    this.setData({
      step:3
    })
   }else{
    wx:wx.showToast({
      title: '您好，您的金额不足于50元，无法申请',   
      icon: 'none',
    })
   }
  },
  //普通会员结算成功界面
  nextStep:function(){
    this.setData({
      step:5
    })
  },
  //成为会员申请信息界面
  tobeStep:function(){
    var that = this;
    const db = wx.cloud.database();
    var app = getApp();
    const _ = db.command;
    this.setData({
      vipnewvalue:true
    })
    db.collection('users').get({
      success: res=>{
        // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
        this.setData({
          vip: res.data[0].viplist
        })
        console.log(this.data.vip)
      }
    })
    console.log(this.data.inputnewValue)
    if(this.data.inputnewValue==''){
      wx.showToast({
        icon: 'none',
        title: '请输入您的手机号',
      })
    }
    if(this.data.inputnewValue!=''){
    for(var i=0;i<this.data.vip.length;i++){
      if(this.data.inputnewValue==this.data.vip[i]){
        wx.showToast({
          icon: 'none',
          title: '该会员已被注册',
        })
        this.setData({
          vipnewvalue:false
        })
        break;
      }
    }
    if(this.data.vipnewvalue==true){
        db.collection('users').doc('vip').update({
          data:{
            viplist:_.push([this.data.inputnewValue])
          }
        }).then(res=>{
          wx.showToast({
            icon: 'none',
            title: '恭喜您成为本超市的新会员',
          })
          this.setData({
            step:6
          })
        })
        db.collection('order').doc(this.data.cartId).update({
          data:{
            jieusuan:this.data.vipjiesuan
          }
        })
        db.collection('order').where({'_id':this.data.cartId}).update({
          data:{
            order:true,
            state:'已付款'
          }
        })
      }
    }
  },
  //确认vip账号
  vipStep:function(){
    var that = this;
    const db = wx.cloud.database()
    var app = getApp();
    db.collection('users').get({
      success: res=>{
        // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
        this.setData({
          vip: res.data[0].viplist
        })
        console.log(this.data.vip)
      }
    })
    for(var i=0;i<=this.data.vip.length;i++){
      if(this.data.inputoldValue==this.data.vip[i]){
        this.setData({
          vipvalue:true
        })
        break;
      }
    }
    if (this.data.vipvalue==true) {
      wx.showToast({
        icon: 'none',
        title: '您好尊贵的VIP会员',
      })
      this.setData({
        step:6,
        vipvalue:false
      })
      db.collection('order').doc(this.data.cartId).update({
        data:{
          jieusuan:this.data.vipjiesuan
        }
      })
      db.collection('order').where({'_id':this.data.cartId}).update({
        data:{
          order:true,
          state:'已付款'
        }
      })
      this.onShow();
    }else{
      wx.showToast({
        icon: 'none',
        title: '并未查询到您的会员号',
      })
    }
  },
  //返回上一步
  backStep:function(){
    const db = wx.cloud.database()
    var app = getApp();
    if(this.data.step==6||this.data.step==4||this.data.step==2){
      this.setData({
        step:1
      })
      this.Read();
    }
    if(this.data.step==5||this.data.step==3){
      this.setData({
        step:2
      })
    }
    
  },
  Inputnew: function (e) {
    var that = this;
    that.setData({
      inputnewValue: e.detail.value
    })
  },
  Inputold: function (e) {
    var that = this;
    that.setData({
      inputoldValue: e.detail.value
    })
  },
  //页面刷新
  Read:function(){
    const db = wx.cloud.database()
    var app = getApp();
    db.collection('order').where({'order':false}).get({
      success:res => {
        // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
        console.log(res.data)
        if(res.data.length>0){
        this.setData({
          order: res.data[0].target,
          cartId:res.data[0]._id
        })
        console.log(this.data.order)
        var js=0;
        for(var i=0;i<res.data[0].target.length;i++){
          js = js + res.data[0].target[i].price*res.data[0].target[i].mete
        }
        this.setData({
          jiesuan : js
        })
        }else{
          this.setData({
            order:{},
            jiesuan:0,
            vipjiesuan:0
          })
        }
      }
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
    const db = wx.cloud.database()
    var app = getApp();
    db.collection('order').where({'order':false}).get({
      success:res => {
        // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
        // console.log(res.data)
        this.setData({
          order: res.data[0].target,
          cartId:res.data[0]._id
        })
        console.log(this.data.order)
        var js=0;
        for(var i=0;i<res.data[0].target.length;i++){
          js = js + res.data[0].target[i].price*res.data[0].target[i].mete
        }
        this.setData({
          jiesuan : js
        })
        console.log(this.data.jiesuan)
      }
    })
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