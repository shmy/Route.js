/**
 *   默认监听所有a标签的点击事件 默认不缓存页面
 *   通过给a标签设置data-cache="true" 告知需要缓存页面
 *   解决ajax、jsonp典型的不支持前进后退、历史记录的功能
 */

// 严格模式
'use strict';
// 路由对象
(function(global) {
    function Route(object) {
        // 要填充的父元素
        this.parent = object && object.parent || document.body;
        // 默认的过渡效果
        this.animation = object && object.animation || 'enter';
        // ajax超时时间
        this.timeout = object && object.timeout || 15000;
        // 默认的主页
        this.default = object && object.default || 'default';
        // 遮盖层元素
        this.mask = null;
        // 是否缓存 非全局设定
        this.cache = false;
        // 已经缓存的页面的集合对象
        this.pages = {};
        // 之前页的DMO对象
        this.oldPage = null;
        // 执行绑定
        this.bind();
        // 初始化
        this.init();

    }
    /**
     *   初始化
     */
    Route.prototype.init = function() {
        // 创建遮盖层
        var mask = document.createElement('div');
        mask.className = 'mask';
        this.mask = mask;
        document.body.appendChild(mask);
        // 检查哈希
        var url = window.location.hash.replace('#', '');
        // 如果不存在
        if (!url) {
            url = this.default;
            window.location.hash = url;
        } else {
            this.href(url, this.cache);
        }
    };
    /**
     *   绑定事件
     */
    Route.prototype.bind = function() {
        var _this = this;
        // 取得监听事件类型
        var eType = 'ontouchstart' in window ? 'touchstart' : 'click';
        // 当哈希值发生改变
        window.addEventListener('hashchange', function() {
            // 取得链接地址
            var url = window.location.hash.replace('#', '');
            _this.href(url, _this.cache);
        }, false);
        // 捕获窗口所有click 或者 touchstart事件
        window.addEventListener(eType, function(e) {
            // 如果事件发起者是a标签
            var srcElement = e.srcElement || e.target;
            if (srcElement.localName === 'a') {
                // 检查是否需要缓存
                _this.cache = srcElement.dataset.cache ? true : false;
            }
        }, false);
        // ↑幸好click比hashchange事件触发的早
    };
    /**
     *   打开一个新页面
     *   url: 地址
     *   cache: 是否缓存
     */
    Route.prototype.href = function(url, cache) {
        // 主页默认被缓存
        if (url === this.default) {
            cache = true;
        }
        // 判断是否有缓存
        if (this.pages[url]) {
            // 存在缓存就不执行ajax
            this.renderCache(url);
            return;
        }
        var _this = this;
        this.ajax(url + '.html', function(status, responseText) {
            // 成功
            if (status === 200) {
                // 成功后渲染DOM ，需要缓存就传入url
                _this.render(responseText, cache ? url : false);
            } else {
                // 没有数据 返回首页
                window.location.hash = _this.default;
            }
        });
    };
    /**
     *   ajax请求数据
     *   url: 连接地址
     *   callback: 回调函数
     */
    Route.prototype.ajax = function(url, callback) {
        var _this = this;
        var xhr = new XMLHttpRequest();
        // 传输开始。
        xhr.onloadstart = function() {
            _this.mask.style.display = 'block';
        };
        // 传输成功完成。
        xhr.onload = function() {
            // 完成后回调出去
            callback(this.status, this.responseText);
        };
        // 传输结束，但是不知道成功还是失败。
        xhr.onloadend = function() {
            _this.mask.style.display = 'none';
        };
        // 传输中出现错误。
        xhr.onerror = function() {
            console.log(this.status);
        };
        // 传输超时。
        xhr.ontimeout = function() {
            console.log(this.status);
        };
        xhr.timeout = this.timeout;
        xhr.open('GET', url, true);
        xhr.send();
    };
    /**
     *   渲染页面
     *   data: 页面数据
     *   url: 缓存对象的索引
     */
    Route.prototype.render = function(data, url) {
        this.setOldPage();
        var page = document.createElement('div');
        page.classList.add('page');
        page.classList.add('in-' + this.animation);
        page.innerHTML = data;
        // 如果要缓存
        if (url) {
            this.pages[url] = page;
            page.dataset.cache = 'true';
        }
        // 把当前页设置为上一个页面
        this.oldPage = page;
        this.parent.appendChild(page);
    };
    /**
     *  调用缓存渲染
     *  url: 缓存索引
     */
    Route.prototype.renderCache = function(url) {
        this.setOldPage();
        var page = this.pages[url];
        page.classList.remove('out-' + this.animation);
        page.classList.add('in-' + this.animation);
        // 把当前页设置为上一个页面
        this.oldPage = page;
    };
    /**
     *   准备跳转时，设置上一个页面的的生命周期
     */
    Route.prototype.setOldPage = function() {
        var _this = this;
        // 如果存在上一个页面
        if (!!this.oldPage) {
            // 去掉上一个页面in样式
            this.oldPage.classList.remove('in-' + this.animation);
            // 添加上一个页面out样式
            this.oldPage.classList.add('out-' + this.animation);
            // 绑定动画结束事件
            this.oldPage.addEventListener('animationend', animationEnd, false);
            // Out动画结束后
            function animationEnd() {
                // 当他不需要缓存
                if (!this.dataset.cache) {
                    try {
                        _this.parent.removeChild(this);
                    } catch (e) {
                        // 发生异常 直接遍历删除
                        Array.prototype.forEach.call(_this.parent.querySelectorAll('.out-' + _this.animation), function(element) {
                            _this.parent.removeChild(element);
                        });
                    } finally {
                        // 解绑本事件
                        this.removeEventListener('animationend', animationEnd, false);
                        return;
                    }
                }
                // 解绑本事件
                this.removeEventListener('animationend', animationEnd, false);
            }
        }
    };
    // 在全局绑定属性
    global['Route'] = Route;
})(window);
