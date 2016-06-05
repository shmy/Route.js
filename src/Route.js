// 路由对象
(function(global) {
    function Route() {
        // 默认的过渡效果
        this.animation = 'slideBefore';
        // 遮盖层元素
        this.mks = null;
        // ajax超时时间
        this.timeout = 15000;
        // 默认的哈希key
        this.hash = '#';
        // 默认的主页
        this.default = 'default';
        // 默认的404页
        this.notfound = 'notfound';
        // 已经缓存的页面的集合对象
        this.pages = {};
        // 之前页的DMO对象
        this.oldPage = null;
        // 初始化
        this.init();
        // 执行绑定
        this.bind();
    }
    /**
     *   初始化
     */
    Route.prototype.init = function() {
        // 遮盖层
        var mks = document.createElement('div');
        mks.className = 'mks';
        this.mks = mks;
        document.body.appendChild(mks);
        var url = window.location.hash.replace(this.hash, '');
        if (!url) {
            url = this.default;
            window.location.hash = url;
        } else {
            this.href(url, false);
        }

    };
    /**
     *   绑定事件
     */
    Route.prototype.bind = function() {
        var _this = this;
        // 当哈希值发生改变
        window.addEventListener('hashchange', function() {
            // 如果有上一个页面，并且上一个页面是不被缓存的
            if (_this.oldPage && _this.oldPage.dataset.cache === 'false') {
                // 把他删除掉
                _this.delete(_this.oldPage);
            }
            // 取得链接地址
            var url = window.location.hash.replace(_this.hash, '');
            _this.href(url, false);
        }, false);
    };
    /**
     *   打开一个新页面
     *   url: 地址
     *   cache: 是否缓存
     */
    Route.prototype.href = function(url, cache) {
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
                _this.render(responseText, cache ? url : null);
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
            _this.mks.style.display = 'block';
        };
        // 传输成功完成。
        xhr.onload = function() {
            // 完成后回调出去
            callback(this.status, this.responseText);
        };
        // 传输结束，但是不知道成功还是失败。
        xhr.onloadend = function() {
            _this.mks.style.display = 'none';
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
        var page = document.createElement('div');
        page.classList.add('page');
        page.classList.add('in-' + this.animation);
        page.innerHTML = data;
        // 如果要缓存
        if (url) {
            this.pages[url] = {
                'page': page
            };
        } else {
            page.dataset.cache = 'false';
        }
        // 如果存在上一个页面
        if (!!this.oldPage) {
            // 去掉上一个页面in样式
            this.oldPage.classList.remove('in-' + this.animation);
        }
        // 把当前页设置为上一个页面
        this.oldPage = page;
        document.body.appendChild(page);
    };
    /**
     *  调用缓存渲染
     *  url: 缓存索引
     */
    Route.prototype.renderCache = function(url) {
        var page = this.pages[url].page;
        // 如果存在上一个页面
        if (!!this.oldPage) {
            // 去掉上一个页面in样式
            this.oldPage.classList.remove('in-' + this.animation);
        }
        page.classList.add('in-' + this.animation);
        // 把当前页设置为上一个页面
        this.oldPage = page;
    };
    /**
     *   删除DOM上的页面
     *   page: page元素
     */
    Route.prototype.delete = function(page) {
        try {
            document.body.removeChild(page);

        } catch (e) {
            // 未知异常
        }
    };
    // 在全局绑定属性
    global['Route'] = Route;
})(window);
