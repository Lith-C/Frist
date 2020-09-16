const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: '../index/user-unlogin.png',
    userInfo: {},
    nickName:app.globalData.nickName,
    openid: '',
    queryResult: {},
    query:{},
    but: {},
    order:{},
    jiesuan:0,
    butcid: 0,
    keyid: 0,
    mete:0,
    cart: {},
    meteId:'',
    counterId: '',
    cartId:null,
    targetlist:{},
    height:'80px',
    margintop01:'20px',
    margintop02:'10px',
    clickon:true,
    status:false,
    addstatus:true
  },
  // 获取用户信息

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    const db = wx.cloud.database()
    var app = getApp();
    var query = {};
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo,
                nickName:res.userInfo.nickName,
                // rawData:res.rawData,
                but: getApp().getbut,
                queryResult: getApp().getqueryResult
              })
              app.globalData.nickName=this.data.nickName
              // console.log(this.data.nickName)
              console.log(app.globalData.nickName)
            }
          })
        }
      }
    })
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid,
      })
    }
    db.collection('button').get({
      success:res => {
        // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
        this.setData({
          but: res.data,
          counterId:res.data[0].counterId
        })
      }
    })
    db.collection('Drinks').get({
      success:res => {
        // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
        this.setData({
          queryResult: res.data,
        })
        console.log(this.data.queryResult)
        query = res.data
        console.log(query)
        if(query.length>0){
          db.collection('order').where({'order':false,'name':this.data.nickName}).get().
          then(res=>{
          // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
          console.log(res.data)
          if(res.data.length>0&&query.length>0){
          this.setData({
            order: res.data[0].target,
            cartId:res.data[0]._id
          })
          console.log(this.data.order)
          console.log(this.data.cartId)
            if(res.data[0].target.length>0){
              for(var i=0;i<res.data[0].target.length;i++){
              this.setData({
                jiesuan:this.data.jiesuan+res.data[0].target[i].price*res.data[0].target[i].mete
              })
              }
              for(var i=0;i<query.length;i++){
                for( var j=0;j<res.data[0].target.length;j++){
                  if(query[i]._id==res.data[0].target[j].id){
                      query[i].mete = res.data[0].target[j].mete
                      this.setData({
                        queryResult : query
                      })
                    }
                }
              }
              console.log(this.data.queryResult)
            }
          }
        })
        }
      }
    })
  },
  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },
  click:function(e){
    if(this.data.clickon!=true){
      this.setData({
      height:'80px',
      clickon:true,
      margintop01:'20px',
      margintop02:'10px'
      })
    }else{
      if(this.data.order.length>2){
        this.setData({
        height:40*this.data.order.length+'px',
        clickon:false,
        margintop01:(20+40*(this.data.order.length-2))+'px',
        margintop02:(10+40*(this.data.order.length-2))+'px'
        })
        if(this.data.order.length>5){
          this.setData({
            height:'200px',
            margintop01:'140px',
            margintop02:'130px'
          })
          wx.showToast({
            icon: 'none',
            title: '数量过多只展示部分 到购物车查看所有',
          })
        }
      }
    }
  },
  itemonQuery: function (e) {
    var that = this;
    const db = wx.cloud.database()
    var app = getApp();
    db.collection('button').get().then(res=>{
        // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
        this.setData({
          but: res.data,
          counterId:res.data[e.target.dataset.idx].counterId,
          butcid: e.target.dataset.idx
        })
        console.log(this.data.counterId)       
        db.collection(res.data[e.target.dataset.idx].counterId).get({
          success: res=>{
            // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
            this.setData({
              queryResult: res.data,
            })
            console.log(this.data.queryResult)
            db.collection('order').where({'order':false,'name':this.data.nickName}).get().then(res=>{
              this.setData({
                order:res.data[0].target
              })
              console.log(res.data[0].target)
              var query = this.data.queryResult
              if(res.data[0].target.length>0){
              for(var i=0;i<this.data.queryResult.length;i++){
                for( var j=0;j<res.data[0].target.length;j++){
                  if(this.data.queryResult[i]._id==res.data[0].target[j].id){
                    query[i].mete = res.data[0].target[j].mete
                     this.setData({
                       queryResult : query
                     })
                     console.log(this.data.queryResult) 
                    }
                  }
              } 
            }
      })
          }
        })
}) 
  },
  onCounterInc: function (e) {
    var that = this;
    const db = wx.cloud.database();
    const goods = db.collection(this.data.counterId);
    const orders = db.collection('order');
    const _ = db.command
    var app = getApp(); 
    this.setData({
      keyid: e.target.dataset.idx,
    })
    if(this.data.addstatus==true){
    //判定订单是否为空
    this.setData({
      addstatus:false
    })
    orders.where({'order':false,'name':this.data.nickName}).get().then((res)=>{
    if(res.data.length !=0){
      this.setData({
        cartId:res.data[0]._id,
        order:res.data[0].target,
        status:true
      })
      console.log(this.data.cartId)
    }if(res.data.length ==0){
        this.setData({
          cartId:null,
          status:true
      })
      console.log(this.data.cartId)
      console.log(this.data.counterId)
    }
    if(this.data.status==true){
      console.log(this.data.status)
      goods.get().then(res=>{
        var query = res.data;
        for(var i=0;i<query.length;i++){
          for( var j=0;j<this.data.order.length;j++){
            if(query[i]._id==this.data.order[j].id){
              query[i].mete = this.data.order[j].mete
              this.setData({
                query:query,
              })
              }
            }
        }
    })
    goods.where({
        keyid: e.target.dataset.idx
      })
      .field({
        _id: true,
      })
      .get()
      .then((res) => {
        this.setData({
          meteId: res.data[0]._id,
        })
        console.log(this.data.meteId)
        console.log(this.data.mete)
        console.log(this.data.query)
        for(var j=0;j<this.data.query.length;j++){
          if(this.data.query[j]._id==res.data[0]._id){
            this.setData({
              mete:this.data.query[j].mete
            })
          }
        }
        console.log(this.data.mete)
      if(this.data.mete==0&&this.data.cartId==null){
        goods
          .where({
            keyid: e.target.dataset.idx
          })
          .field({
            name: true,
            price: true,
            _id: true,
            mete: true
          })
          .get()
          .then((res) => {
            console.log(res);
        db.collection('order').add({
         data: {
          target:[
          {
          id:res.data[0]._id,
          counterId:this.data.counterId,
          name:res.data[0].name,
          price:res.data[0].price,
          mete:res.data[0].mete+1
          }
          ],
          order:false,
          state:'未付款',
          name:this.data.nickName
         },
         })
        goods.doc(this.data.meteId).update({
            data: {
                value:_.inc(-1)
              }
          })
          this.read();
       })
      }
      if(this.data.mete==0&&this.data.cartId!=null){
        goods
          .where({
            keyid: e.target.dataset.idx
          })
          .field({
            name: true,
            price: true,
            _id: true,
            mete: true
          })
          .get()
          .then((res) => {
            console.log(res.data[0]);
        db.collection('order').doc(this.data.cartId)
          .update({
            data: {
              target:_.push([
           {
             id:res.data[0]._id,
             counterId:this.data.counterId,
             name:res.data[0].name,
             price:res.data[0].price,
             mete:res.data[0].mete+1
          }
          ])
         }
         })
        }).then(res=>{
          goods.doc(this.data.meteId).update({
            data:{
                value:_.inc(-1)
              }
          }).then(res=>{
            this.read();
          })
        })
      }
      if (this.data.mete>=1&&this.data.cartId!=null){
          orders.where({
              '_id':this.data.cartId,
              'target.id': this.data.meteId
            })
          .update({
              data:{
                'target.$.mete': this.data.mete + 1
              }
            })    
          goods.doc(this.data.meteId)
          .update({
              data: {
                value:_.inc(-1)
                }
            })
          this.read();
      } 
    })
    }
  })
  }else{
    console.log("等等")
  }
},
  onCounterDec: function (e) {
    var that = this;
    const db = wx.cloud.database();
    const goods = db.collection(this.data.counterId);
    const orders = db.collection('order');
    var app = getApp();
    var query;
    const _ = db.command;
    this.setData({
      keyid: e.target.dataset.idx,
    })
    if(this.data.addstatus==true){
      this.setData({
        addstatus:false
      })
    orders.where({'order':false}).get().then((res)=>{
    if(res.data.length !=0){
      this.setData({
        cartId:res.data[0]._id,
        order:res.data[0].target,
        status:true
      })
      console.log(this.data.cartId)
      if(this.data.status==true){
      goods.get().then(res=>{
        query = res.data
        console.log(this.data.order)
      for(var i=0;i<query.length;i++){
        for( var j=0;j<this.data.order.length;j++){
          if(query[i]._id==this.data.order[j].id){
              query[i].mete = this.data.order[j].mete
              this.setData({
                query:query,
              })
            }
          }
        }
        console.log(this.data.query)
        if(this.data.query.length>0){
          goods.where({
            keyid: e.target.dataset.idx
          })
          .field({
            _id: true,
           })
          .get()
          .then((res) => {
            this.setData({
              meteId: res.data[0]._id,
            })
          console.log(this.data.meteId)
          console.log(this.data.mete)
          for(var j=0;j<this.data.query.length;j++){
            if(this.data.query[j]._id==res.data[0]._id){
              this.setData({
                mete:this.data.query[j].mete
              })
            }
          }
          console.log(this.data.mete)
        if(this.data.mete>1){
          orders.where({
               '_id':this.data.cartId,
              'target.id': this.data.meteId
              }).update({
               data:{
                'target.$.mete': this.data.mete - 1
              }
            })       
            goods.doc(this.data.meteId).update({
                data: {
                  value:_.inc(1)
                }
            }).then(res=>{
              this.read();
            })
          }
        if(this.data.mete==1){
          orders.doc(this.data.cartId)
          // .where({
          //   // '_id':this.data.cartId,
          //   // 'target.id': this.data.meteId
          // })
          .get()
          .then(res=>{
            console.log(res.data.target)
            let mylist = res.data.target
            // console.log(mylist)
            for(var i=0;i<res.data.target.length;i++){
            if(res.data.target[i].id==this.data.meteId){
              mylist.splice(i,1)
              this.setData({
                targetlist:mylist
              })
            console.log(this.data.targetlist)
              orders.doc(this.data.cartId).update({
              data:{
                target:this.data.targetlist
              }
              }) 
              goods.doc(this.data.meteId).update({
                data: {
                  value:_.inc(1)
                }
              }).then(res=>{
                this.read();
              })
            break;
            }
            }
          })
        }
        if(this.data.mete==0){
          wx.showToast({
            icon: 'none',
            title: '不能再少了'
          })
        }
        })
       }
      })
      }
    }if(res.data.length ==0){
      wx.showToast({
        icon: 'none',
        title: '不能再少了'
      })
      }
    })
    }else{
    console.log("等等")
    }
  },

  read:function(){
    var that = this;
    const db = wx.cloud.database();
    const goods = db.collection(this.data.counterId);
    const orders = db.collection('order');
    var app = getApp();
    const _ = db.command;
    console.log(this.data.counterId)
    this.setData({
      addstatus:true
    })
    goods.get().then(res=>{
      this.setData({
        query: res.data,
        })
        orders.where({'order':false}).get().then(res=>{
        console.log(res.data)
        this.setData({
          order:res.data[0].target
        })
        console.log(this.data.query)
        var query = this.data.query
        if(res.data[0].target.length>0){
          var js=0;
          for(var i=0;i<res.data[0].target.length;i++){
            js = js + res.data[0].target[i].price*res.data[0].target[i].mete
          }
          console.log(js)
          this.setData({
            jiesuan : Number(js)
          })
        for(var i=0;i<this.data.query.length;i++){
          for( var j=0;j<res.data[0].target.length;j++){
            if(this.data.query[i]._id==res.data[0].target[j].id){
              query[i].mete = res.data[0].target[j].mete
              this.setData({
                queryResult : query
              })
              console.log(this.data.queryResult)
              }
            }
          }
      } 
      })
    })  
  },

  sellte:function(){
    var app = getApp();
    wx: wx.reLaunch({
      url: '../ShoppingCart/ShoppingCart'
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
    // this.read();
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