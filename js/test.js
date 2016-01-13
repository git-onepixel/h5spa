/*! index.js fxb v1.0.1 */
(function () {
    window.dxz = {
        load: (function () {
            document.addEventListener("DOMContentLoaded", function () {
                dxz.appPath = "http://mt.emoney.cn/matches/";
                dxz.testAppPath = "http://mt.emoney.cn/matches/";
                dxz.userinfo = Parameter.getParam("webAuthToken");
                if (!dxz.userinfo) {
                    dxz.userinfo = Parameter.getParam("UsernameAndPassword")
                }
                var platform = Parameter.getParam("p");
                dxz.platform = platform ? platform : "jq";
                dxz.action = "prodadian/dadian";
                dxz.logs = "prodadian/log";
                if (dxz.platform == "zl") {
                    dxz.action = "MainEdition/BaoMainPunchLog";
                    dxz.logs = "MainEdition/UserpunchHistory"
                }
                dxz.bindHashEvent();
                dxz.initView()
            }, false)
        })(), initView: function () {
            dxz.setView();
            dxz.fixScroll();
            dxz.stopDoubleTap();
            dxz.Calendar.init();
            dxz.Topic.init(0);
            dxz.View.init();
            dxz.Score.init();
            dxz.Sign.init()
        }, setView: function () {
            dxz.currentViewId = "-main-view";
            var sqtl = document.getElementById("sqtl");
            var fx03 = document.getElementById("fx03");
            var logs = document.getElementById("sign-logs");
            var pd = Parameter.getParam("pd");
            pd = pd ? parseInt(pd) : 0;
            if (dxz.platform == "zl") {
                sqtl.style.display = "none";
                fx03.style.marginBottom = "1em"
            } else if (dxz.platform == "jq") {
                var height = sqtl.offsetHeight || 0;
                fx03.style.paddingBottom = height + "px";
                logs.style.display = "none"
            } else if (dxz.platform == "wg") {
                sqtl.style.display = "none";
                fx03.style.marginBottom = "1em";
                logs.style.display = "none"
            }
            if (Device.platform.Android) {
                document.getElementById("-main-view").className = "";
                document.getElementById("-news-view").className = "";
                document.getElementById("-zjb-view").className = "";
                document.getElementById("sqtl").style.position = "fixed";
                document.querySelector(".iphone-tip").style.display = "none"
            }
        }, fixScroll: function () {
            if (Device.platform.iOS) {
                var topScroll = 0;
                var views = document.querySelectorAll(".scroll-view");
                for (var i = 0; i < views.length; i++) {
                    var view = views[i];
                    view.addEventListener('touchstart', function (event) {
                        topScroll = this.scrollTop;
                        if (topScroll <= 0) {
                            this.scrollTop = 1
                        }
                        if (topScroll + this.offsetHeight >= this.scrollHeight) {
                            this.scrollTop = topScroll - 1
                        }
                    }, false)
                }
            }
        }, stopDoubleTap: function () {
            var lastTouch = null;
            var agent = navigator.userAgent.toLowerCase();
            if (agent.indexOf('iphone') >= 0 || agent.indexOf('ipad') >= 0) {
                document.addEventListener('touchend', function (event) {
                    var now = new Date().getTime();
                    lastTouch = lastTouch || now + 1;
                    var delta = now - lastTouch;
                    if (delta < 500 && delta > 0) {
                        event.preventDefault();
                        return false
                    }
                    lastTouch = now
                }, false)
            }
        }, Sign: (function () {
            return {
                init: function () {
                    var scope = this;
                    Ajax.request({
                        url: dxz.appPath + dxz.logs,
                        params: {
                            UsernameAndPassword: dxz.userinfo,
                            firstDate: "2015-06-15 00:00:00",
                            startDate: "2015-06-15 00:00:00",
                            batchId: 1,
                            s: 1
                        },
                        success: function (data) {
                            if (data.status == 0) {
                                window.isLogin = true;
                                if (dxz.platform == "zl") {
                                    var username = data['parameter2'];
                                    Log.enterIn(username, 'Act-20150529');
                                    scope.applyData(data)
                                } else {
                                    var username = data.data['username'];
                                    Log.enterIn(username, 'Act-20150529');
                                    scope.applyData(data.data)
                                }
                            } else {
                                Log.enterIn("Anonymous", 'Act-20150529')
                            }
                        },
                        error: function (xhr) {
                            console.log(xhr.statusText)
                        }
                    })
                }, doSign: function () {
                    if (!window.isLogin) {
                        this.goLogin();
                        return
                    }
                    var scope = this;
                    Log.click('dadian', 'Act-20150529');
                    Ajax.request({
                        url: dxz.appPath + dxz.action,
                        params: {UsernameAndPassword: dxz.userinfo, batchId: 1, s: 1},
                        loading: true,
                        success: function (data) {
                            if (data.status == 0) {
                                dxz.isSign = true;
                                var nextday = dxz.Calendar.unlockNextDay();
                                if (nextday) {
                                    Msg.alert("已为您解锁" + nextday + "风向预报啦，快去点击日期查看详情！", function () {
                                        dxz.Sign.init()
                                    })
                                } else {
                                    Msg.alert("打卡成功！", function () {
                                        dxz.Sign.init()
                                    })
                                }
                            }
                        },
                        error: function (xhr) {
                            console.log(xhr.statusText)
                        }
                    })
                }, applyData: function (data) {
                    dxz.Sign.setLogs(data);
                    var signKey = dxz.platform == "zl" ? "parameter1" : "hasSignin";
                    if (data[signKey]) {
                        dxz.isSign = true;
                        var button = document.getElementById('signbtn');
                        button.innerText = "已打卡";
                        button.style.pointerEvents = "none";
                        setTimeout(function () {
                            dxz.Calendar.unlockNextDay()
                        }, 200)
                    }
                }, setLogs: function (data) {
                    var logs = dxz.platform == "zl" ? data.data.Data.resultList : data.logs;
                    for (var i = 0; i < logs.length; i++) {
                        var td = document.getElementById("logs-" + (i + 1));
                        if (td) {
                            td.style.color = "#fff";
                            td.style.background = "rgb(228, 62, 62)"
                        }
                    }
                }, goLogin: function () {
                    if (dxz.userinfo && Device.platform.iOS) {
                        if (dxz.platform == "zl") {
                            Msg.alert("活动仅限手机号注册用户登录参加！")
                        } else {
                            Msg.alert("活动仅限自定义账号和手机号登录参加！")
                        }
                    } else {
                        goods.login("http://mt.emoney.cn/matches/fxb/index.html?p=" + dxz.platform)
                    }
                }, timeout: function (callback) {
                    Msg.confirm("请求超时，请重试", {yesButton: {text: "重试"}}, function (btn) {
                        if (btn.id == "yes") {
                            callback()
                        }
                    })
                }
            }
        })(), Calendar: (function () {
            return {
                dateArray: [], currentIndex: 0, init: function () {
                    dxz.Calendar.dateArray = ["11-29", "11-30", "12-01", "12-02", "12-03", "12-04", "12-05", "12-06", "12-07", "12-08", "12-09", "12-10", "12-11", "12-12", "12-13", "12-14", "12-15", "12-16", "12-17", "12-18", "12-19", "12-20", "12-21", "12-22", "12-23", "12-24", "12-25", "12-26", "12-27", "12-28", "12-29", "12-30"];
                    dxz.firstDate = "2015-11-29";
                    var days = ["日", "一", "二", "三", "四", "五", "六"];
                    var m = document.getElementById("m-calendar");
                    var n = document.getElementById("n-calendar");
                    var table = document.createElement("div");
                    table.className = "table";
                    for (var i = 0; i < dxz.Calendar.dateArray.length; i++) {
                        var date = dxz.Calendar.dateArray[i];
                        date = "2015-" + date;
                        var day = days[new Date(date).getDay()];
                        var td = "<div style='pointer-events:none' onclick='dxz.queryHistory(this)' title='" + date + "'>" + day + "<br>" + date.split("-")[2] + "</div>";
                        table.innerHTML += td
                    }
                    m.innerHTML = table.outerHTML;
                    m.querySelector(".table").firstChild.style.display = "none";
                    n.innerHTML = table.outerHTML.replace(/queryHistory/g, "queryHistoryN")
                }, updateM: function (day) {
                    if (!this.isStart(day)) {
                        return
                    }
                    var m = document.getElementById("m-calendar");
                    var mChilds = m.querySelector("div").children;
                    for (var i = 0; i < mChilds.length; i++) {
                        this.setUnlocked([mChilds[i]]);
                        var date = mChilds[i].title;
                        if (day == date) {
                            dxz.Calendar.currentIndex = i;
                            dxz.Calendar.nowDayIndex = i;
                            var mpos = (i - 3) * 28;
                            mpos = mpos > 0 ? mpos : 0;
                            if (m.scrollLeft == 0) {
                                m.scrollLeft = mpos
                            }
                            break
                        }
                    }
                    this.setCurrent(m.querySelectorAll("[title='" + day + "']"))
                }, updateN: function (day) {
                    if (!this.isStart(day)) {
                        return
                    }
                    var n = document.getElementById("n-calendar");
                    var nChilds = n.querySelector("div").children;
                    for (var i = 0; i < nChilds.length; i++) {
                        this.setUnlocked([nChilds[i]]);
                        var date = nChilds[i].title;
                        if (day == date) {
                            dxz.Calendar.currentNIndex = i;
                            break
                        }
                    }
                    this.setCurrent(n.querySelectorAll("[title='" + day + "']"))
                }, setCurrent: function (divs) {
                    for (var i = 0; i < divs.length; i++) {
                        divs[i].style.background = "#e43e3e";
                        divs[i].style.color = "#fae1e1";
                        divs[i].style.pointerEvents = "none";
                        divs[i].style.borderRadius = "1px"
                    }
                }, setUnlocked: function (divs) {
                    for (var d = 0; d < divs.length; d++) {
                        divs[d].style.background = "";
                        divs[d].style.color = "#000";
                        divs[d].style.pointerEvents = "auto"
                    }
                }, unlockNextDay: function () {
                    var nextDay = "";
                    var index = dxz.Calendar.nowDayIndex;
                    if (index < dxz.Calendar.dateArray.length) {
                        index += 1;
                        var date = dxz.Calendar.dateArray[index];
                        nextDay = date.replace("-", "月") + "日";
                        date = "2015-" + date;
                        var m = document.getElementById("m-calendar");
                        dxz.Calendar.setUnlocked(m.querySelectorAll("[title='" + date + "']"))
                    }
                    return nextDay
                }, isStart: function (day) {
                    var firstDate = dxz.firstDate.replace(/-/g, '');
                    var current = day.replace(/-/g, '');
                    if (parseInt(current) < parseInt(firstDate)) {
                        return false
                    }
                    return true
                }
            }
        })(), View: (function () {
            return {
                init: function (day) {
                    var scope = this;
                    day = day || "";
                    Ajax.request({
                        url: dxz.testAppPath + "MainEdition/StockMarketWindArrowRead",
                        params: {day: day},
                        dataType: 'json',
                        loading: true,
                        success: function (data) {
                            var now = data.updateTime.substr(0, 10);
                            scope.clearData(["itemlist"]);
                            if (!day) {
                                var date = now;
                                setTimeout(function () {
                                    dxz.Calendar.updateM(date);
                                    dxz.News.init(date, 0)
                                }, 0)
                            }
                            if (data.status == 0 && dxz.Calendar.isStart(now)) {
                                var jsondata = data.data;
                                scope.setData(jsondata)
                            } else {
                                scope.setEmptyData()
                            }
                        },
                        error: function (xhr) {
                            console.log(xhr.statusText)
                        }
                    })
                }, setData: function (data) {
                    data = JSON.parse(data);
                    this.setItemsData(data.items)
                }, setItemsData: function (data) {
                    var html = "";
                    for (var i = 0; i < data.length; i++) {
                        var obj = data[i];
                        var title = obj.title.trim();
                        if (title) {
                            html += ["<div class='list-item'>", "<div class='main'>", title, "</div><div class='sub'>", (function () {
                                var stocks = obj.stocks.trim();
                                stocks = stocks.split("、");
                                var list = "关联个股：";
                                for (var s in stocks) {
                                    var stock = stocks[s].indexOf('-') != -1 ? stocks[s].split("-") : stocks[s].split("-");
                                    if (stock.length == 2) {
                                        list += "<span  onclick=dxz.goStock\('" + stock[1].trim() + "'\)>" + stock[0].trim() + "</span>、"
                                    } else if (stock.length == 1) {
                                        list += "<span>" + stock[0].trim() + "</span>、"
                                    }
                                }
                                return list.substr(0, list.length - 1)
                            })(), "</div>", "</div>"].join("")
                        }
                    }
                    html = html ? html : "<div class='empty-data'>暂无更新数据！</div>";
                    dxz.View.setHtml("itemlist", html)
                }, setHtml: function (id, html) {
                    var e = document.getElementById(id);
                    if (e) {
                        if (html || html == 0) {
                            e.innerHTML = html
                        }
                    }
                }, setEmptyData: function () {
                    var html = "<div class='empty-data'>暂无更新数据！</div>";
                    this.setHtml("itemlist", html)
                }, clearData: function (divId) {
                    for (var id in divId)document.getElementById(divId[id]).innerHTML = ""
                }
            }
        })(), News: (function () {
            return {
                init: function (day, flag) {
                    var scope = this;
                    day = day || "";
                    Ajax.request({
                        url: dxz.testAppPath + "MainEdition/StockMarketWindArrowRead",
                        params: {day: day},
                        dataType: 'json',
                        loading: true,
                        success: function (data) {
                            scope.clearData(["news", "groups"]);
                            if (flag == 0) {
                                setTimeout(function () {
                                    dxz.Calendar.updateN(day)
                                }, 0)
                            }
                            var now = day.substr(5, 5).replace(/-/, ".");
                            scope.setHtml("nowday", now);
                            if (data.status == 0 && dxz.Calendar.isStart(day)) {
                                var jsondata = data.data;
                                scope.setData(jsondata)
                            } else {
                                scope.setEmptyData()
                            }
                        },
                        error: function (xhr) {
                            console.log(xhr.statusText)
                        }
                    })
                }, setData: function (data) {
                    data = JSON.parse(data);
                    this.setNewsData(data.news);
                    this.setGroupsData(data.groups)
                }, setNewsData: function (data) {
                    var html = "";
                    for (var i = 0; i < data.length; i++) {
                        var obj = data[i];
                        var title = obj.title.trim();
                        var content = obj.content.trim();
                        var stocks = obj.stocks ? obj.stocks.trim() : "";
                        if (title && content) {
                            content = content.replace(/\\n/g, "<br><i style='padding: 1em'></i>");
                            html += ["<div class='list-item'>", "<div class='code'><div>", i + 1, "</div></div>", "<div class='content'>", "<div class='title'>", title, "</div>", (function () {
                                if (stocks) {
                                    var list = "<div class='glgg'>关联个股：";
                                    stocks = stocks.split("、");
                                    for (var s in stocks) {
                                        var stock = stocks[s].indexOf('-') != -1 ? stocks[s].split("-") : stocks[s].split("-");
                                        if (stock.length == 2) {
                                            list += "<span  onclick=dxz.goStock\('" + stock[1].trim() + "'\)>" + stock[0].trim() + "</span>、"
                                        } else if (stock.length == 1) {
                                            list += "<span>" + stock[0].trim() + "</span>、"
                                        }
                                    }
                                    return list.substr(0, list.length - 1) + "</div>"
                                }
                                return ""
                            })(), "<div class='text'>", content, "</div>", "</div></div>"].join("")
                        }
                    }
                    html = html ? html : "<div class='empty-data'>暂无更新数据！</div>";
                    dxz.View.setHtml("news", html)
                }, setGroupsData: function (data) {
                    var html = "";
                    for (var i = 0; i < data.length; i++) {
                        var obj = data[i];
                        var name = obj.name.trim();
                        var rate = obj.precent.trim();
                        if (name && rate) {
                            var size = this.getBallSize(rate);
                            html += ["<div class='ball'  style='" + size + "'><div>", obj.name, "<br>", obj.precent, "%", "</div></div>"].join("")
                        }
                    }
                    var groupData = document.getElementById("group-data");
                    if (html) {
                        this.setHtml("groups", html);
                        groupData.style.display = "block"
                    } else {
                        groupData.style.display = "none"
                    }
                    var clear = document.createElement("div");
                    clear.style.clear = "both";
                    document.getElementById("groups").appendChild(clear)
                }, getBallSize: function (rate) {
                    var fontSize = 0.9;
                    rate = parseInt(rate);
                    rate = rate / 200;
                    fontSize += rate;
                    return "font-size:" + fontSize + "em"
                }, setHtml: function (id, html) {
                    var e = document.getElementById(id);
                    if (e) {
                        if (html || html == 0) {
                            e.innerHTML = html
                        }
                    }
                }, setEmptyData: function () {
                    var html = "<div class='empty-data'>暂无更新数据！</div>";
                    this.setHtml("news", html);
                    this.setHtml("groups", html)
                }, clearData: function (divId) {
                    for (var id in divId)document.getElementById(divId[id]).innerHTML = ""
                }
            }
        })(), Topic: (function () {
            return {
                init: function (type) {
                    var scope = this;
                    var url = dxz.testAppPath + "Enhanced/OnlineCountRead";
                    Ajax.request({
                        url: type ? dxz.testAppPath + "Enhanced/OnlineCountWrite" : url,
                        params: {typeName: "fxbTopic"},
                        dataType: 'json',
                        success: function (data) {
                            if (data.status == 0 && type == 0) {
                                dxz.View.setHtml("topics", data.data)
                            } else {
                                dxz.Topic.init(0)
                            }
                        },
                        error: function (xhr) {
                            console.log(xhr.statusText)
                        }
                    })
                }, go: function () {
                    var mv = Parameter.getParam("mv");
                    var m = mv ? mv.replace(/\./g, "") : "0";
                    m = parseInt(m);
                    if (m >= 270) {
                        this.init(1);
                        if (m < 280) {
                            window.location = "emstock://page?pageId=210000&type=5"
                        } else {
                            window.location = "emstock://page?pageId=210000&menuId=203"
                        }
                    } else if (m >= 200) {
                        Msg.alert("将为您跳转到“社区”首页，请切换到“知识切磋”-进入“2015股市风向标”讨论组，参与讨论！", function () {
                            dxz.Topic.init(1);
                            goods.openPage("210000")
                        })
                    } else {
                        Msg.confirm("亲，社区支持v2.0.0及以上的版本哦，请升级到最新版本再来讨论吧~ ", {
                            yesButton: {text: "现在升级"},
                            noButton: {text: "稍后再说"}
                        }, function (button) {
                            if (button.id == "yes") {
                                if (Device.platform.iOS) {
                                    window.location.href = "https://itunes.apple.com/cn/app/cao-pan-shou-jia-qiang-ban/id939983858?l=zh&ls=1&mt=8"
                                } else {
                                    window.location.href = "http://mlog.emoney.cn/download/eStockPre_118_2015-6-9.apk"
                                }
                            }
                        })
                    }
                }
            }
        })(), Score: (function () {
            return {
                init: function () {
                    var nowday = "2015-01-01";
                    var scope = this;
                    Ajax.request({
                        url: dxz.testAppPath + "MainEdition/StockMarketWindArrowRead",
                        params: {day: nowday},
                        success: function (data) {
                            if (data.status == 0) {
                                dxz.Score.initView(data.data)
                            }
                        },
                        error: function (xhr) {
                            console.log(xhr.statusText)
                        }
                    })
                }, setValue: function (className, value) {
                    var cls = document.getElementsByClassName(className);
                    for (var c = 0; c < cls.length; c++) {
                        cls[c].innerHTML = value || cls[c].innerHTML
                    }
                }, initView: function (data) {
                    data = JSON.parse(data);
                    dxz.Score.setValue("precent", data.szcgl + "%");
                    dxz.Score.setValue("ybcount", data.ybcount);
                    dxz.Score.setValue("szcount", data.szcount);
                    var box = document.getElementById("zjlist");
                    for (var i = 0; i < data.items.length; i++) {
                        var item = data.items[i];
                        var div = document.createElement("div");
                        div.className = "item-list";
                        var name = document.createElement("div");
                        var stock = item.stockname.split("-");
                        name.innerHTML = "<span  onclick=dxz.goStock\('" + stock[1].trim() + "'\)>" + stock[0].trim() + "</span>";
                        div.appendChild(name);
                        var week = document.createElement("div");
                        week.innerHTML = item.weekrate + "%";
                        if (item.weekrate.indexOf("-") != -1) {
                            week.className = "drop-data"
                        }
                        div.appendChild(week);
                        var main = document.createElement("div");
                        main.innerHTML = item.mainrate + "%";
                        if (item.mainrate.indexOf("-") != -1) {
                            main.className = "drop-data"
                        }
                        div.appendChild(main);
                        box.appendChild(div)
                    }
                    var stocks = "";
                    if (data.items.length > 0) {
                        var stock = data.items[0].stockname;
                        stocks = stock.split("-")[0]
                    } else {
                        var empty = document.createElement("div");
                        empty.innerText = "暂无数据";
                        empty.className = "empty-data";
                        box.appendChild(empty)
                    }
                    if (data.items.length > 1) {
                        var stock = data.items[1].stockname;
                        stocks += "&nbsp;" + stock.split("-")[0]
                    }
                    stocks += " ...";
                    dxz.View.setHtml("stocklist", stocks);
                    var from = data.from.substr(5, 5).replace("-", "月");
                    dxz.View.setHtml("fromto", "入选时间：" + from)
                }
            }
        })(), queryHistory: function (th) {
            var day = th.title;
            dxz.View.init(day);
            var old = dxz.Calendar.dateArray[dxz.Calendar.currentIndex];
            old = "2015-" + old;
            var n = document.getElementById("m-calendar");
            dxz.Calendar.setUnlocked(n.querySelectorAll("[title='" + old + "']"));
            dxz.Calendar.setCurrent(n.querySelectorAll("[title='" + day + "']"));
            for (var i = 0; i < dxz.Calendar.dateArray.length; i++) {
                var date = "2015-" + dxz.Calendar.dateArray[i];
                if (date == day) {
                    dxz.Calendar.currentIndex = i;
                    break
                }
            }
        }, queryHistoryN: function (th) {
            var day = th.title;
            dxz.News.init(day, 1);
            var old = dxz.Calendar.dateArray[dxz.Calendar.currentNIndex];
            old = "2015-" + old;
            var n = document.getElementById("n-calendar");
            dxz.Calendar.setUnlocked(n.querySelectorAll("[title='" + old + "']"));
            dxz.Calendar.setCurrent(n.querySelectorAll("[title='" + day + "']"));
            for (var i = 0; i < dxz.Calendar.dateArray.length; i++) {
                var date = "2015-" + dxz.Calendar.dateArray[i];
                if (date == day) {
                    dxz.Calendar.currentNIndex = i;
                    break
                }
            }
        }, goStock: function (stockId) {
            if (stockId.substr(0, 1) != "6") {
                stockId = 1 + stockId
            }
            stockId = parseInt(stockId);
            goods.showgoods(stockId, 1)
        }, goNewsView: function () {
            this.slideView("-main-view", "-news-view", "left");
            window.location.hash = "news-view";
            var calendar = document.getElementById("n-calendar");
            var pos = (dxz.Calendar.currentIndex - 3) * 43;
            pos = pos > 0 ? pos : 0;
            calendar.scrollLeft = pos;
            Log.click("xwlb", "查看新闻联播")
        }, setZjbView: function () {
            var zjbview = document.getElementById("zjbview");
            var now = new Date();
            var h = now.getHours();
            var m = now.getMinutes();
            if ((h == 9 && m > 29) || (h > 9 && h < 15) || (h == 15 && m == 0)) {
                zjbview.style.display = "-webkit-box"
            } else {
                zjbview.style.display = "none"
            }
        }, zjbViewInterval: function () {
            window.setInterval(function () {
                dxz.setZjbView()
            }, 1000 * 30)
        }, goZjb: function () {
            this.slideView("-main-view", "-zjb-view", "left");
            window.location.hash = "zjb-view"
        }, bindHashEvent: function () {
            window.addEventListener("hashchange", function () {
                var id = window.location.hash.replace("#", "-");
                if (dxz.currentViewId != "-main-view" && id != dxz.currentViewId) {
                    dxz.slideView(dxz.currentViewId, "-main-view", "right")
                }
            }, false)
        }, slideView: function (currentId, applyId, direction) {
            if (Device.platform.Android) {
                var applyView = document.getElementById(applyId);
                var currentView = document.getElementById(currentId);
                currentView.style.display = "none";
                applyView.style.display = "block";
                dxz.currentViewId = applyId
            } else {
                var delay = 200;
                var duration = 0.3;
                if (!applyId)return;
                var currentView = document.getElementById(currentId);
                var applyView = document.getElementById(applyId);
                this.Animation.init(currentView, applyView, direction, duration);
                dxz.Animation.start();
                setTimeout(function () {
                    dxz.Animation.stop()
                }, delay);
                setTimeout(function () {
                    dxz.Animation.clear();
                    dxz.currentViewId = applyId
                }, delay + duration * 1000)
            }
        }, Animation: (function () {
            var currentView, applyView, duration;
            var applyViewStart, currentViewEnd, applyViewEnd, currentViewStart;
            return {
                init: function (current, apply, direction, dura) {
                    currentView = current;
                    applyView = apply;
                    duration = dura;
                    if (direction == "left") {
                        currentViewStart = "translateX(0%)";
                        applyViewStart = "translateX(100%)";
                        currentViewEnd = "translateX(-100%)";
                        applyViewEnd = "translateX(0%)"
                    } else {
                        currentViewStart = "translateX(0%)";
                        applyViewStart = "translateX(-100%)";
                        currentViewEnd = "translateX(100%)";
                        applyViewEnd = "translateX(0%)"
                    }
                }, start: function () {
                    currentView.style.webkitTransform = currentViewStart;
                    applyView.style.webkitTransform = applyViewStart;
                    applyView.style.display = "block"
                }, stop: function () {
                    currentView.style.webkitTransform = currentViewEnd;
                    applyView.style.webkitTransform = applyViewEnd
                }, clear: function () {
                    currentView.style.display = "none"
                }
            }
        })()
    }
})();

