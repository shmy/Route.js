// 路由对象
(function(global) {
    function Route() {
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
        var url = window.location.hash.replace(this.hash, '');
        if (!url) {
            url = this.default;
            window.location.hash = url;
        }
        // 打开并缓存第一个页面
        this.href(url, true);
    };
    /**
     *   绑定事件
     */
    Route.prototype.bind = function() {
        var _this = this;
        // 当哈希值发生改变
        window.addEventListener('hashchange', function() {
            // 如果有上一个页面
            if (_this.oldPage && _this.oldPage.dataset.cache === 'false') {
                // 把他删除掉
                _this.delete(_this.oldPage);
            }
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
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            // 完成后回调出去
            callback(this.status, this.responseText);
        };
        xhr.onerror = function() {
            console.log(this.status);
        };
        xhr.ontimeout = function() {
            console.log(this.status);
        };
        xhr.open('GET', url, true);
        xhr.send();
    };
    /**
     *   渲染页面
     *   data: 页面数据
     *   url: 缓存对象中的索引
     */
    Route.prototype.render = function(data, url) {
        var page = document.createElement('div');
        page.classList.add('page');
        page.classList.add('in');
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
            this.oldPage.classList.remove('in');
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
            this.oldPage.classList.remove('in');
        }
        page.classList.add('in');
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
            // 可能从404返回
        }
    };
    // 在全局绑定属性
    global['Route'] = Route;
})(window);
