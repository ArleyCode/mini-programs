import defaultTools from 'tools'

class myTools extends defaultTools {
    constructor() {
        super()
    }
    get host() {
        //return "http://localhost:55837/api/"
        return "https://fxws.gzjinsong.com/api/";
    }
    /**
     * 返回请求地址
     * name 
     */
    get useUrl() {
        return {
            "jscode2session": this.host + "wx/wxJscode2session",
            "GetProductGroup": this.host + "WX/wmSerachProductGroup",
            "GetProduct": this.host + "WX/wmSearchProduct",
            "submitOrder": this.host + "WX/wxSubmitOrder",
            "GetProductFull": this.host + "WX/wmGetProductFullInfo",
            "AddShopCart": this.host + "WX/wxAddShopCart",
            "InitUserData": this.host + "WX/wxInitUserData",
            "GetUserCartList": this.host + "WX/wxGetUserCartList",
            "UpdateShopCart": this.host + "wx/wxUpdateShopCart",
            "GetMyOrderist": this.host + "wx/wxGetMyOrderist",
            "GetOrderInfo": this.host + "wx/wxGetOrderInfo",
            "ReturnOrder": this.host + "wx/wxReturnOrder",
        };
    }

    /**
     * 检索字符串
     */
    get searchKey() {
        return {
            'spu_name': 'spu_code',
            'classify_name': 'classify_id',
        }

    }

    /**
     * 格式化时间
     */
    formatTime(date) {
        var year = date.getFullYear()
        var month = date.getMonth() + 1
        var day = date.getDate()

        var hour = date.getHours()
        var minute = date.getMinutes()
        var second = date.getSeconds()


        return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
    }
    /**
     * 格式化 月份
     * 5 =》 ‘05’
     */
    formatNumber(n) {
        n = n.toString()
        return n[1] ? n : '0' + n
    }


    /**
     * 记录查询关键字
     */
    saveSearchKey(data, source) {
        let value = null;
        data = data || {};

        if (source instanceof Array) {
            for (var i = 0; i < source.length; i++) {
                if (!(source[i] instanceof Array) && typeof source[i] === 'object') {
                    data = this.getKeyValue(data, source[i]);
                }
            }
        } else if (source instanceof Object) {
            data = this.getKeyValue(data, source);
        }
        /**
         * 去除重复项
         */
        wx.setStorage({
            key: "__searchKeys__",
            data: data
        })
    }

    getKeyValue(data, source) {
        var value, text, keyName;
        for (var key in source) {
            keyName = this.searchKey[key];
            if (!keyName) {
                if (typeof value === 'object') {
                    if (value instanceof Array) {
                        for (var i = 0; i < value.length; i++) {
                            if (!(arr[i] instanceof Array) && typeof arr[i] === 'object') {
                                data = this.getKeyValue(data, arr[i]);
                            }
                        }
                    } else {
                        data = this.getKeyValue(data, value);
                    }
                } else {
                    continue;
                }
            }
            text = source[key];
            value = source[keyName];
            if (!text || !value) continue;
            data[keyName + '=' + value] = text;
        }

        return data;
    }

    wxRequest_fail(data) {
        wx.showToast({
            title: '服务器请求超时。',
            mask: true,
            image: '../../assets/images/aci.png',
            duration: 2000,
            mask: true
        })
    }


    /**
     * wxRequest 请求 complete 回调函数
     */
    wxRequest_success(success, source) {
        let that = this;
        if (typeof success !== 'function') {
            success = () => { }
        }
        wx.getStorage({
            key: '__searchKeys__',
            success: function (res) {
                that.saveSearchKey(res.data, source.data.rows || source.data.data)
            },
            fail() {
                that.saveSearchKey({}, source.data.rows || source.data.data)
            }
        })
        success(source);
    }


    /**
     * wxRequest 请求
     */
    wxRequest(url, data, success, options) {
        let that = this;
        url = that.useUrl[url];
        if (!url) throw "请求地址为空！";

        options = options || {};
        if (options.loadingText)
            wx.showLoading({
                title: options.loadingText,
            })
        wx.request({
            url: url, //仅为示例，并非真实的接口地址
            data: data,
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            fail() {
                wx.hideLoading();
                that.wxRequest_fail();
            },
            success(data) {
                wx.hideLoading();
                that.wxRequest_success(success, data)
            }
        })

    }


    /**
     * 金额 数字 转换
     * 100 => ￥100.00 OR ￥100.00 => 100
     * typeStr : num \ rmb
     * value  :  ￥100.00  \  100
     */
    convert(typeStr, value) {
        if (typeof typeStr !== 'string') {
            throw '调用 convert 发成错误。传入参数 typeStr is not string 。';
        }
        if (typeStr === 'num') { //value 转转 unmber
            if (typeof value === "number") return value;
            else if (typeof value === "string") {
                let _vs = this.trim(value).split("￥");
                if (_vs.length !== 2) {
                    throw '调用 convert 发成错误。传入参数 value=' + value + ' 转换数字失败，参数value格式错误，请传入"￥100.00" or "100.00" or "100"。';
                }
                let _rs = _vs[1].split(',').join('')
                return Number(_rs);
            }
            throw '调用 convert 发成错误。传入参数 value=' + value + ' 转换数字失败，value参数只支持string类型。';
        } else if (typeStr === 'rmb') {
            if ((value + '').indexOf('￥') === 0) return value;
            let _v = this.convert('num', value).toFixed(2) + '';
            return '￥' + this.splitAmount(_v);
        }
    }
    /**
    * 金额 三位逗号分隔
    */
    splitAmount(value) {
        let _v = value + '';
        let _ts = _v.split('.');
        let _vs = _ts[0].split('');
        let _r = '';
        let index = 0;
        for (var i = _vs.length - 1; i >= 0; i--) {
            _r = _vs[i] + _r;
            index++;
            if (index % 3 === 0 && i !== 0) {
                index = 0;
                _r = ',' + _r;
            }

        }
        return _r + '.' + (_ts[1] || '00');
    }

    /**
     *
     */
    removeDOCTYPE(html) {
        return html
            .replace(/<\?xml.*\?>\n/, '')
            .replace(/<.*!doctype.*\>\n/, '')
            .replace(/<.*!DOCTYPE.*\>\n/, '');
    }

    strMoreDiscode(str) {
        str = str.replace(/\r\n/g, "");
        str = str.replace(/\n/g, "");

        str = str.replace(/code/g, "wxxxcode-style");
        return str;
    }

    strDiscode(str) {
        str = this.strMoreDiscode(str);
        return str;
    }
    get startTag() {
        return /^<([-A-Za-z0-9_]+)((?:\s+[a-zA-Z_:][-a-zA-Z0-9_:.]*(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/
    }
    get endTag() {
        return /^<\/([-A-Za-z0-9_]+)[^>]*>/
    }
    get attr() {
        return /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g
    };
    makeMap(str) {
        var obj = {},
            items = str.split(",");
        for (var i = 0; i < items.length; i++)
            obj[items[i]] = true;
        return obj;
    }
    // Empty Elements - HTML 5
    get empty() {
        return this.makeMap("area,base,basefont,br,col,frame,hr,img,input,link,meta,param,embed,command,keygen,source,track,wbr")
    };

    // Block Elements - HTML 5
    get block() {
        return this.makeMap("a,address,code,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video")
    };

    // Inline Elements - HTML 5
    get inline() {
        return this.makeMap("abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var")
    };

    // Elements that you can, intentionally, leave open
    // (and which close themselves)
    get closeSelf() {
        return this.makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr")
    }

    // Attributes that have their values filled in disabled="disabled"
    get fillAttrs() {
        return this.makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected")
    }

    // Special Elements (can contain anything)
    get special() {
        return this.makeMap("wxxxcode-style,script,style,view,scroll-view,block")
    };


    parseStartTag(tag, tagName, rest, unary) {
        tagName = tagName.toLowerCase();

        if (this.block[tagName]) {
            while (this.$htmlStack.last() && inline[this.$htmlStack.last()]) {
                this.parseEndTag("", this.$htmlStack.last());
            }
        }

        if (this.closeSelf[tagName] && this.$htmlStack.last() == tagName) {
            this.parseEndTag("", tagName);
        }

        unary = this.empty[tagName] || !!unary;

        if (!unary)
            this.$htmlStack.push(tagName);

        if (this.$htmlHandler.start) {
            var attrs = [];

            rest.replace(this.attr, function (match, name) {
                var value = arguments[2] ? arguments[2] :
                    arguments[3] ? arguments[3] :
                        arguments[4] ? arguments[4] :
                            this.fillAttrs[name] ? name : "";

                attrs.push({
                    name: name,
                    value: value,
                    escaped: value.replace(/(^|[^\\])"/g, '$1\\\"') //"
                });
            }.bind(this));

            if (this.$htmlHandler.start) {
                this.$htmlHandler.start(tagName, attrs, unary);
            }

        }
    }

    parseEndTag(tag, tagName) {
        // If no tag name is provided, clean shop
        if (!tagName)
            var pos = 0;

        // Find the closest opened tag of the same type
        else {
            tagName = tagName.toLowerCase();
            for (var pos = this.$htmlStack.length - 1; pos >= 0; pos--)
                if (this.$htmlStack[pos] == tagName)
                    break;
        }
        if (pos >= 0) {
            // Close all the open elements, up the this.$htmlStack
            for (var i = this.$htmlStack.length - 1; i >= pos; i--)
                if (this.$htmlHandler.end)
                    this.$htmlHandler.end(this.$htmlStack[i]);

            // Remove the open elements from the this.$htmlStack
            this.$htmlStack.length = pos;
        }

    }
    HTMLParser(html, handler) {
        var index, chars, match, last = html;
        this.$htmlStack = [];
        this.$htmlHandler = handler;
        this.$htmlStack.last = function () {
            return this[this.length - 1];
        };

        while (html) {
            chars = true;
            if (!this.$htmlStack.last() || !this.special[this.$htmlStack.last()]) {
                // Comment
                if (html.indexOf("<!--") == 0) {
                    index = html.indexOf("-->");

                    if (index >= 0) {
                        if (this.$htmlHandler.comment)
                            this.$htmlHandler.comment(html.substring(4, index));
                        html = html.substring(index + 3);
                        chars = false;
                    }

                    // end tag
                } else if (html.indexOf("</") == 0) {
                    match = html.match(this.endTag);

                    if (match) {
                        html = html.substring(match[0].length);
                        match[0].replace(this.endTag, this.parseEndTag.bind(this));
                        chars = false;
                    }

                    // start tag
                } else if (html.indexOf("<") == 0) {
                    match = html.match(this.startTag);

                    if (match) {
                        html = html.substring(match[0].length);
                        match[0].replace(this.startTag, this.parseStartTag.bind(this));
                        chars = false;
                    }
                }

                if (chars) {
                    index = html.indexOf("<");
                    var text = ''
                    while (index === 0) {
                        text += "<";
                        html = html.substring(1);
                        index = html.indexOf("<");
                    }
                    text += index < 0 ? html : html.substring(0, index);
                    html = index < 0 ? "" : html.substring(index);

                    if (this.$htmlHandler.chars)
                        this.$htmlHandler.chars(text);
                }
            } else {
                html = html.replace(new RegExp("([\\s\\S]*?)<\/" + this.$htmlStack.last() + "[^>]*>"), function (all, text) {
                    text = text.replace(/<!--([\s\S]*?)-->|<!\[CDATA\[([\s\S]*?)]]>/g, "$1$2");
                    if (this.$htmlHandler.chars)
                        this.$htmlHandler.chars(text);

                    return "";
                });
                this.parseEndTag("", this.$htmlStack.last());
            }
            if (html == last)
                throw "Parse Error: " + html;
            last = html;

        }
        this.parseEndTag();

    }


    /**
     * 
     */
    html2json(htmlData, bindName) {
        var html = this.removeDOCTYPE(htmlData);
        html = this.strDiscode(html);
        var bufArray = [];
        var results = {
            node: bindName,
            nodes: [],
            images: [],
            imageUrls: []
        };
        this.HTMLParser(html, Object.assign({
            start(tag, attrs, unary) {
                var node = {
                    node: 'element',
                    tag: tag,
                    tagType: "inline"
                };


                if (attrs.length !== 0) {
                    node.attr = attrs.reduce(function (pre, attr) {
                        var name = attr.name;
                        var value = attr.value;
                        if (name == 'class') {
                            console.dir(value);
                            //  value = value.join("")
                            node.classStr = value;
                        }
                        // has multi attibutes
                        // make it array of attribute
                        if (name == 'style') {
                            console.dir(value);
                            //  value = value.join("")
                            node.styleStr = value;
                        }
                        if (value.match(/ /)) {
                            value = value.split(' ');
                        }


                        // if attr already exists
                        // merge it
                        if (pre[name]) {
                            if (Array.isArray(pre[name])) {
                                // already array, push to last
                                pre[name].push(value);
                            } else {
                                // single value, make it array
                                pre[name] = [pre[name], value];
                            }
                        } else {
                            // not exist, put it
                            pre[name] = value;
                        }

                        return pre;
                    }, {});
                }
                //对img添加额外数据
                if (node.tag === 'img') {
                    node.imgIndex = results.images.length;
                    var imgUrl = node.attr.src;
                    var patt1 = new RegExp("^//");
                    var result = patt1.test(imgUrl);
                    if (result) {
                        imgUrl = "https:" + imgUrl;
                    }
                    node.attr.src = imgUrl;
                    node.from = bindName;
                    results.images.push(node);
                    results.imageUrls.push(imgUrl);
                }
                if (unary) {
                    // if this tag dosen't have end tag
                    // like <img src="hoge.png"/>
                    // add to parents
                    var parent = bufArray[0] || results;
                    if (parent.nodes === undefined) {
                        parent.nodes = [];
                    }
                    parent.nodes.push(node);
                } else {
                    bufArray.unshift(node);
                }

            },
            end(tag) {
                var node = bufArray.shift();
                if (node.tag !== tag) console.error('invalid state: mismatch end tag');

                //当有缓存source资源时于于video补上src资源
                if (node.tag === 'video' && results.source) {
                    node.attr.src = results.source;
                    delete result.source;
                }

                if (bufArray.length === 0) {
                    results.nodes.push(node);
                } else {
                    var parent = bufArray[0];
                    if (parent.nodes === undefined) {
                        parent.nodes = [];
                    }
                    parent.nodes.push(node);
                }
            },
            chars(text) {
                var node = {
                    node: 'text',
                    text: text,
                    //textArray: transEmojiStr(text)
                };

                if (bufArray.length === 0) {
                    results.nodes.push(node);
                } else {
                    var parent = bufArray[0];
                    if (parent.nodes === undefined) {
                        parent.nodes = [];
                    }
                    parent.nodes.push(node);
                }
            },
            comment(text) {
                console.log("comment", text)
            }
        }, this));
        return results;

    }

    /**
     * html标签解析 wxml
     */
    wxParse(bindName = 'wxParseData', data = '<div class="color:red;">数据不能为空</div>', target, imagePadding) {
        var that = target;
        var transData = {}; //存放转化后的数据
        transData = this.html2json(data, bindName);
        transData.view = {};
        transData.view.imagePadding = 0;
        if (typeof (imagePadding) != 'undefined') {
            transData.view.imagePadding = imagePadding
        }
        var bindData = {};
        bindData[bindName] = transData;
        that.setData(bindData)
        that.wxParseImgLoad = this.wxParseImgLoad;
        that.wxParseImgTap = this.wxParseImgTap;
    }
    wxParseImgLoad(e) {
        var that = this;
        var tagFrom = e.target.dataset.from;
        var idx = e.target.dataset.idx;
        if (typeof (tagFrom) != 'undefined' && tagFrom.length > 0) {
            var temData = that.data[tagFrom];
            if (!temData || temData.images.length == 0) {
                return;
            }
            var temImages = temData.images;

            temImages[idx].width = e.detail.width > that.data.windowWidth ? e.detail.width : that.data.windowWidth;
            temImages[idx].height = e.detail.width / e.detail.height * that.data.windowWidth;
            temData.images = temImages;
            var bindData = {};
            bindData[tagFrom] = temData;
            that.setData(bindData);
        }
    }
    // 图片点击事件
    wxParseImgTap(e) {
        var that = this;
        var nowImgUrl = e.target.dataset.src;
        var tagFrom = e.target.dataset.from;
        if (typeof (tagFrom) != 'undefined' && tagFrom.length > 0) {
            wx.previewImage({
                current: nowImgUrl, // 当前显示图片的http链接
                urls: that.data[tagFrom].imageUrls // 需要预览的图片http链接列表
            })
        }
    }

}


export default myTools
