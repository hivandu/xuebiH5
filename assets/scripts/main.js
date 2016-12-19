// Created by Hivan Du 2015(Siso brand interactive team).

"use strict";

window.onload = window.onresize = function() {
    //  set page response
    pageResponse({
        selectors : '.scene-wrap',     //模块选择器，使用querySelectorAll的方法
        mode : 'contain',     // auto || contain || cover
        width : '375',      //输入页面的宽度，只支持输入数值，默认宽度为320px
        height : '603'      //输入页面的高度，只支持输入数值，默认高度为504px
    })

    // initEventHandler app
    if(!app.canvas.canvasDom){
        app.start()
    }
};

//  limit browser drag move
document.addEventListener('touchmove', function (e) {
    e.preventDefault();
},true);

var app = {
    sprites: [[], [], [], [], [], []],
    activeScene: 1,
    spriteNumber:18,
    canvas:{
        canvasDom:null,
        canvasCtx:null
    },
    myScroll:"null",
    loadLoadImg: function(){
        var that = this;
        var imgPath = "assets/images/",
            spritesName = "loding",
            loadImgSum  = 10,
            loadedAmounts = 0

        for (var i = 1; i <= 10; i++ ) {
            var img = new Image();
            img.src = imgPath + spritesName + i +".png";
            img.index = i;

            img.onload = function() {
                loadedAmounts++
                if( loadedAmounts == loadImgSum ) {
                    $('.loading-box').fadeIn(1000);
                    console.log("load资源加载完毕,预加载开启")
                    that.preload();
                }

            }
        }
    },
    preload: function() {
        var that = this;

        var Canvas = document.getElementById('canvas-scene');
        var Ctx = Canvas.getContext('2d');

        this.canvas.canvasDom = Canvas;

        this.canvas.canvasCtx = Ctx;

        var preloadImgSum = this.spriteNumber + $('.scene01 img[data-src]').length + 4;
        var preloadAmounts = 0;

        loadMain();
        function loadMain() {
            var imgPath = "assets/images/",
                spritesName = "sprites0",
                loadedAmounts = 0;

             ( function(){

                 $('.scene01 img[data-src]').each(function() {
                     $(this)[0].src = $(this).attr('data-src');
                     $(this)[0].onload = function() {
                         preloadAmounts++;
                         addLoadNumber();
                     }
                 })

             }())

            for (var i = 1; i<= that.spriteNumber + 4; i++) {
                var img = new Image();
                img.src = imgPath + spritesName + that.activeScene + "-" + i +".png";
                img.index = i;

                img.onload = function() {
                    loadedAmounts ++;
                    preloadAmounts ++;
                    that.sprites[ that.activeScene ][ this.index ] = this;

                    if (loadedAmounts == that.spriteNumber) {
                        loadingOver();
                    } else {
                        addLoadNumber();
                    }
                }
            }
        }

        function addLoadNumber() {
            var index =  Math.floor( preloadAmounts / preloadImgSum * 100 )
            $('.loadimg')[0].src = "assets/images/loding" + Math.floor(index / 10) + ".png";
            $('.loadText').html(index+"%");
        }

        function loadingOver() {
            console.log("加载第一个场景完毕, 进行绘制");

            $('.loading-box').fadeOut(1000);

            setTimeout(function() {
                $('.scene01').fadeIn(1000);
                that.main();
            },1000)

        }

    },

    nextLoad: function() {
        this.activeScene++;//1已经加载完毕

        var that = this;
        var imgPath = "assets/images/",
            spritesName = "sprites0",
            loadedAmounts = 16,
            sceneSum = 5

        for ( var i = loadedAmounts; i<= that.spriteNumber; i++) {
            var img = new Image();
            img.src = imgPath + spritesName + that.activeScene + "-" + i +".png";
            img.index = i;

            img.onload = function() {
                loadedAmounts ++;
                that.sprites[that.activeScene][ this.index ] = this;

                if (loadedAmounts > that.spriteNumber) {
                    console.log("第"+ that.activeScene + "场景16-17-18已经加载完毕");
                    if (that.activeScene < sceneSum ) {
                        that.nextLoad();
                    } else {
                        console.log("其他人物资源加载完毕")
                    }
                }
            }
        }
    },

    main: function (){
        var that = this;
        that.myScroll = new IScroll('#js-box', {
            scrollX: true,
            startX:-325,
            indicators: [{
                el: document.getElementById('starfield1'),
                resize: false,
                ignoreBoundaries: true,
                speedRatioX: 0.6
            }, {
                el: document.getElementById('starfield2'),
                resize: false,
                ignoreBoundaries: true,
                speedRatioX: 0.3
            }]
        });

        //create a new Shake instance:
        var myShakeEvent = new Shake({
            threshold: 7, // optional shake strength threshold
            timeout: 700 // optional, determines the frequency of event generation
        });

        //Start listening to device motion:
        myShakeEvent.start();

        window.addEventListener('shake', shakeEventDidOccur, false);

        function shakeEventDidOccur () {
            $('#bgm')[0].play();
            if ( xuebi.active == "enter" && !xuebi.isState ) {
                xuebi.statrDraw("leave");

                $('.canvas-scene').removeClass('wobble');

            } else if ( xuebi.active == "leave" && !xuebi.isState ) {
                xuebi.statrDraw("enter");

                $('#kaigai')[0].play();
                $('.canvas-scene').addClass('wobble');
            }

        }

        //  first time play BGM
        var initSound = function () {
            //  delay play

            document.removeEventListener('touchstart', initSound, false);
        };
        document.addEventListener('touchstart', initSound, false);

        //click canvas
        var xuebi = new this.Xuebi(this);

        $('.ti-icon').addClass("wobble1");

        $('.leave').click( function() {
            xuebi.statrDraw("leave");

            $('.canvas-scene').removeClass('wobble');
        })

        $('.enter').click( function() {
            xuebi.statrDraw("enter");

            $('.canvas-scene').addClass('wobble');
        })

        $('.btn01').on('touchend',function() {
            xuebi.isState = false; // 切换动画的状态
            $('.btn-box').hide();
            $('.tvLink').hide();
            $('.yx-js').fadeOut();
        })
    },

    Xuebi:function() {
        var init = function(that) {
            this.that = that;
            this.width = that.canvas.canvasDom.width;
            this.height = that.canvas.canvasDom.height;
            this.annimationIndex = 1;
            this.active = "leave";
            this.viewPosition = { 1 : -325, 2 : -329, 3:-119, 4:-280, 5:-233 }
            this.isState = false,
            this.fps = 0;
            this.activeScene = 1;
            this.initialize()
        }

        init.prototype = {
            initialize: function() {
                console.log("进入初始化");
                this.initDraw();
            },

            initDraw: function() {
                var that = this.that;
                that.canvas.canvasCtx.drawImage(that.sprites[ this.activeScene ][ this.annimationIndex ], 0, 0, this.width, this.height);
            },

            annimation: function() {
                var that = this.that;
                that.canvas.canvasCtx.clearRect(0, 0, this.width, this.height);

                if ( this.annimationIndex >= 16 ) {
                    that.canvas.canvasCtx.drawImage(that.sprites[ this.activeScene ][ this.annimationIndex ], 0, 0, this.width, this.height)
                }else{
                    that.canvas.canvasCtx.drawImage(that.sprites[ 1 ][ this.annimationIndex ], 0, 0, this.width, this.height);
                }
            },

            characterState: function(state) {
                if ( state == "enter" && this.annimationIndex == 1) {
                    $(".js-box, .starfield").css('opacity', 0);

                    $('.ti-icon').hide();


                    this.that.myScroll.scrollTo(this.viewPosition[this.activeScene],0);//重新绘制英雄位置

                } else if ( state == "enter" && this.annimationIndex == this.that.spriteNumber ) {
                    $(".js-box, .starfield").animate({
                        opacity: 1
                    }, 700);

                    //$(".text" ).hide()
                    //$(".t"+ this.activeScene ).fadeIn()

                    $('.canvas-scene').fadeOut(500); //隐藏canvas

                    this.isState = false;
                }

                if ( state == "leave" && this.annimationIndex == this.that.spriteNumber ) {
                    $(".js-box, .starfield").css('opacity', 0);

                    $('.canvas-scene').show();

                    if ( this.that.activeScene == 1) {
                        this.that.nextLoad();
                    }


                } else if ( state == "leave" && this.annimationIndex == 1 ) {
                    $(".gl-box, .starfield").css('opacity', 0);

                    // 切换场景
                    if ( this.activeScene == 5 ) {
                        this.activeScene = 1;
                    } else {
                        this.activeScene++;
                    }



                    var prev; //隐藏和显示人物index
                    if ( this.activeScene == 1) {
                        prev = 5
                    } else {
                        prev = this.activeScene - 1;
                    }

                    $('.rw0'+ prev ).hide(); //切换显示人物
                    $('.rw0'+this.activeScene).show();

                    this.that.myScroll.scrollTo(-325,0);

                    this.that.myScroll.refresh(); //刷新视区

                    //$('.ti-icon').show(); //显示摇一摇

                    $(".btn-box").fadeIn();

                    $(".yx-js").fadeIn();

                    $(".ajs").hide();
                    $(".ajs0" + prev ).fadeIn();

                    $(".tvLink").fadeIn();

                }


            },

            statrDraw: function(active) {
                var initThis = this;
                initThis.active = active;

                if ( !initThis.isState ) {
                    if( active == "enter" ) {
                        //this.that.spriteNumber
                        start(initThis.fps = 200, this.that.spriteNumber , 30, 1);
                    }

                    if (active == "leave" ) {
                        start(initThis.fps = 30, 1, 200, -1);
                    }

                    initThis.isState = true;
                }


                function start(fps, endIndex, changeFps, state) {
                    initThis.annimationInterval = setInterval(function() {

                        if ( initThis.annimationIndex == endIndex ) {

                            initThis.characterState(active);
                            clearInterval( initThis.annimationInterval );

                        }else if( initThis.annimationIndex == 4 ) {
                            clearInterval( initThis.annimationInterval );
                            initThis.annimationIndex = initThis.annimationIndex + state;
                            start(changeFps, endIndex, changeFps, state);

                        }else{
                            initThis.characterState(active);
                            initThis.annimationIndex = initThis.annimationIndex + state;
                            initThis.annimation();
                        }

                    },fps );
                }


            }

        }

        return init;
    }(),

    start: function () {
        this.loadLoadImg();
    }
};

$(function () {
    // init app

    console.log('app started success...');
});


