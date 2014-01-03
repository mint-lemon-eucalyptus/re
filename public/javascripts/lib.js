var Morph = Morph || {};

Morph.Graph = Morph.Graph || {};
Morph.svgns = "http://www.w3.org/2000/svg";
Morph.xlinkns = "http://www.w3.org/1999/xlink";

Morph.Graph.version = '0.4.1';
Morph.lazyExtend = function (target, options) {
    var key;
    if (!target) {
        target = {};
    }
    if (options) {
        for (key in options) {
            if (options.hasOwnProperty(key)) {
                var targetHasIt = target.hasOwnProperty(key),
                    optionsValueType = typeof options[key],
                    shouldReplace = !targetHasIt || (typeof target[key] !== optionsValueType);

                if (shouldReplace) {
                    target[key] = options[key];
                } else if (optionsValueType === 'object') {
                    target[key] = Morph.lazyExtend(target[key], options[key]);
                }
            }
        }
    }

    return target;
};

Morph.BrowserInfo = (function () {
    if (typeof window === "undefined" || !window.hasOwnProperty("navigator")) {
        return {
            browser: "",
            version: "0"
        };
    }
    var ua = window.navigator.userAgent.toLowerCase(),
        rwebkit = /(webkit)[ \/]([\w.]+)/,
        ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
        rmsie = /(msie) ([\w.]+)/,
        rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,
        match = rwebkit.exec(ua) ||
            ropera.exec(ua) ||
            rmsie.exec(ua) ||
            (ua.indexOf("compatible") < 0 && rmozilla.exec(ua)) || [];
    return {
        browser: match[1] || "",
        version: match[2] || "0"
    };
}());

Morph.Graph.Utils = Morph.Graph.Utils || {};

Morph.Graph.Utils.getDimension = function (container) {
    return {
        left: 0,
        top: 0,
        width: container.clientWidth,
        height: container.clientHeight
    };
};

Morph.Graph.Utils.findElementPosition = function (obj) {
    var curleft = 0,
        curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while ((obj = obj.offsetParent) !== null);
    }
    return [curleft, curtop];
};
Morph.Graph.Utils.events = function (element) {
    var eventuality = function (that) {
        var registry = {};
        that.emit = function (eventName, parameters) {
            var registeredHandlers,
                callback,
                handler,
                i;

            if (registry.hasOwnProperty(eventName)) {
                registeredHandlers = registry[eventName];
                for (i = 0; i < registeredHandlers.length; ++i) {
                    handler = registeredHandlers[i];
                    callback = handler.method;
                    callback(parameters);
                }
            }

            return this;
        };

        that.addEventListener = function (eventName, callback) {
            var handler = {
                method: callback
            };
            if (registry.hasOwnProperty(eventName)) {
                registry[eventName].push(handler);
            } else {
                registry[eventName] = [handler];
            }

            return this;
        };

        that.removeEventListener = function (eventName, callback) {
            if (registry.hasOwnProperty(eventName)) {
                var handlers = registry[eventName],
                    i;

                for (i = 0; i < handlers.length; ++i) {
                    if (handlers[i].callback === callback) {
                        handlers.splice(i);
                        break;
                    }
                }
            }
            return this;
        };

        that.removeAllListeners = function () {
            var eventName;
            for (eventName in registry) {
                delete registry[eventName];
            }
        };
        return that;
    };

    return {
        on: function (eventName, callback) {
            if (element.addEventListener) {// W3C DOM and eventuality objecets.
                element.addEventListener(eventName, callback, false);
            } else if (element.attachEvent) {
                element.attachEvent("on" + eventName, callback);
            }
            return this;
        },
        stop: function (eventName, callback) {
            if (element.removeEventListener) {
                element.removeEventListener(eventName, callback, false);
            } else if (element.detachEvent) {
                element.detachEvent("on" + eventName, callback);
            }
        },
        extend: function () {
            return eventuality(element);
        }
    };
};

Morph.Graph.Utils.dragndrop = function (element) {
    var start,
        drag,
        end,
        scroll,
        prevSelectStart,
        prevDragStart,
        documentEvents = Morph.Graph.Utils.events(window.document),
        elementEvents = Morph.Graph.Utils.events(element),
        findElementPosition = Morph.Graph.Utils.findElementPosition,

        startX = 0,
        startY = 0,
        dragObject,
        touchInProgress = false,
        pinchZoomLength = 0,

        getMousePos = function (e) {
            var posx = 0,
                posy = 0;

            e = e || window.event;

            if (e.pageX || e.pageY) {
                posx = e.pageX;
                posy = e.pageY;
            } else if (e.clientX || e.clientY) {
                posx = e.clientX + window.document.body.scrollLeft + window.document.documentElement.scrollLeft;
                posy = e.clientY + window.document.body.scrollTop + window.document.documentElement.scrollTop;
            }

            return [posx, posy];
        },

        move = function (e, clientX, clientY) {
            if (drag) {
                drag(e, {x: clientX - startX, y: clientY - startY });
            }

            startX = clientX;
            startY = clientY;
        },

        stopPropagation = function (e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            } else {
                e.cancelBubble = true;
            }
        },
        preventDefault = function (e) {
            if (e.preventDefault) {
                e.preventDefault();
            }
        },

        handleDisabledEvent = function (e) {
            stopPropagation(e);
            return false;
        },

        handleMouseMove = function (e) {
            e = e || window.event;
            move(e, e.clientX, e.clientY);

        },

        handleMouseDown = function (e) {
            e = e || window.event;
            if (touchInProgress) {
                stopPropagation(e);
                return false;
            }
            var isLeftButton = ((e.button === 1 && window.event !== null) || e.button === 0);

            if (isLeftButton) {
                startX = e.clientX;
                startY = e.clientY;

                dragObject = e.target || e.srcElement;

                if (start) {
                    start(e, {x: startX, y: startY});
                }

                documentEvents.on('mousemove', handleMouseMove);
                documentEvents.on('mouseup', handleMouseUp);

                stopPropagation(e);
                prevSelectStart = window.document.onselectstart;
                prevDragStart = window.document.ondragstart;

                window.document.onselectstart = handleDisabledEvent;
                dragObject.ondragstart = handleDisabledEvent;

                return false;
            }
        },

        handleMouseUp = function (e) {
            e = e || window.event;

            documentEvents.stop('mousemove', handleMouseMove);
            documentEvents.stop('mouseup', handleMouseUp);

            window.document.onselectstart = prevSelectStart;
            dragObject.ondragstart = prevDragStart;
            dragObject = null;
            if (end) {
                end(e);
            }
        },

        handleMouseWheel = function (e) {
            if (typeof scroll !== 'function') {
                return;
            }

            e = e || window.event;
            if (e.preventDefault) {
                e.preventDefault();
            }

            e.returnValue = false;
            var delta,
                mousePos = getMousePos(e),
                elementOffset = findElementPosition(element),
                relMousePos = {
                    x: mousePos[0] - elementOffset[0],
                    y: mousePos[1] - elementOffset[1]
                };

            if (e.wheelDelta) {
                delta = e.wheelDelta / 360;
            } else {
                delta = e.detail / -9;
            }

            scroll(e, delta, relMousePos);
        },

        updateScrollEvents = function (scrollCallback) {
            if (!scroll && scrollCallback) {
                if (Morph.BrowserInfo.browser === 'webkit') {
                    element.addEventListener('mousewheel', handleMouseWheel, false);
                } else {
                    element.addEventListener('DOMMouseScroll', handleMouseWheel, false);
                }
            } else if (scroll && !scrollCallback) {
                if (Morph.BrowserInfo.browser === 'webkit') {
                    element.removeEventListener('mousewheel', handleMouseWheel, false);
                } else {
                    element.removeEventListener('DOMMouseScroll', handleMouseWheel, false);
                }
            }

            scroll = scrollCallback;
        },

        getPinchZoomLength = function (finger1, finger2) {
            return (finger1.clientX - finger2.clientX) * (finger1.clientX - finger2.clientX) +
                (finger1.clientY - finger2.clientY) * (finger1.clientY - finger2.clientY);
        },

        handleTouchMove = function (e) {
            if (e.touches.length === 1) {
                stopPropagation(e);

                var touch = e.touches[0];
                move(e, touch.clientX, touch.clientY);
            } else if (e.touches.length === 2) {
                var currentPinchLength = getPinchZoomLength(e.touches[0], e.touches[1]);
                var delta = 0;
                if (currentPinchLength < pinchZoomLength) {
                    delta = -1;
                } else if (currentPinchLength > pinchZoomLength) {
                    delta = 1;
                }
                scroll(e, delta, {x: e.touches[0].clientX, y: e.touches[0].clientY});
                pinchZoomLength = currentPinchLength;
                stopPropagation(e);
                preventDefault(e);
            }
        },

        handleTouchEnd = function (e) {
            touchInProgress = false;
            documentEvents.stop('touchmove', handleTouchMove);
            documentEvents.stop('touchend', handleTouchEnd);
            documentEvents.stop('touchcancel', handleTouchEnd);
            dragObject = null;
            if (end) {
                end(e);
            }
        },

        handleSignleFingerTouch = function (e, touch) {
            stopPropagation(e);
            preventDefault(e);

            startX = touch.clientX;
            startY = touch.clientY;

            dragObject = e.target || e.srcElement;

            if (start) {
                start(e, {x: startX, y: startY});
            }
            if (!touchInProgress) {
                touchInProgress = true;
                documentEvents.on('touchmove', handleTouchMove);
                documentEvents.on('touchend', handleTouchEnd);
                documentEvents.on('touchcancel', handleTouchEnd);
            }
        },

        handleTouchStart = function (e) {
            console.log('Touch start for ', element);
            if (e.touches.length === 1) {
                return handleSignleFingerTouch(e, e.touches[0]);
            } else if (e.touches.length === 2) {
                stopPropagation(e);
                preventDefault(e);

                pinchZoomLength = getPinchZoomLength(e.touches[0], e.touches[1]);

            }
        };

    elementEvents.on('mousedown', handleMouseDown);
    elementEvents.on('touchstart', handleTouchStart);

    return {
        onStart: function (callback) {
            start = callback;
            return this;
        },

        onDrag: function (callback) {
            drag = callback;
            return this;
        },

        onStop: function (callback) {
            end = callback;
            return this;
        },

        onScroll: function (callback) {
            updateScrollEvents(callback);
            return this;
        },

        release: function () {
            documentEvents.stop('mousemove', handleMouseMove);
            documentEvents.stop('mousedown', handleMouseDown);
            documentEvents.stop('mouseup', handleMouseUp);
            documentEvents.stop('touchmove', handleTouchMove);
            documentEvents.stop('touchend', handleTouchEnd);
            documentEvents.stop('touchcancel', handleTouchEnd);

            updateScrollEvents(null);
        }
    };
};
Morph.Graph.Utils.formatNodeInfo = function (node) {
    var res = JSON.stringify(node.data);

    return res;
}

Morph.Graph.Utils.mouseover = function (node, callback) {
    var start, end,
        documentEvents = Morph.Graph.Utils.events(window.document),
        elementEvents = Morph.Graph.Utils.events(node.ui),

        handleMouseOver = function (e) {
            e = e || window.event;
            if (callback) {
                callback(node);
            }
        }


    elementEvents.on('mouseover', handleMouseOver);

    return {
        onStart: function (callback) {
            start = callback;
            return this;
        },
        onStop: function (callback) {
            end = callback;
            return this;
        },
        release: function () {
            documentEvents.stop('mouseover', handleMouseOver);
        }
    };
}
;

Morph.Input = Morph.Input || {};
Morph.Input.domInputManager = function () {
    return {
        bindDragNDrop: function (node, handlers) {
            if (handlers) {
                var events = Morph.Graph.Utils.dragndrop(node.ui);
                events.onStart(handlers.onStart);
                events.onDrag(handlers.onDrag);
                events.onStop(handlers.onStop);

                node.events = events;
            } else if (node.events) {
                node.events.release();
                node.events = null;
                delete node.events;
            }
        },
        bindHover: function (node, handlers, callback) {
            if (handlers) {
//                console.log(node.ui)
                var events = Morph.Graph.Utils.mouseover(node, callback);
                events.onStart(handlers.onStart);
                events.onStop(handlers.onStop);

                node.events = events;
            } else if (node.events) {
                node.events.release();
                node.events = null;
                delete node.events;
            }
        }
    };
};

Morph.Graph.Utils = Morph.Graph.Utils || {};

(function () {
    var lastTime = 0,
        vendors = ['ms', 'moz', 'webkit', 'o'],
        i,
        scope;

    if (typeof window !== 'undefined') {
        scope = window;
    } else if (typeof global !== 'undefined') {
        scope = global;
    } else {
        scope = {
            setTimeout: function () {
            },
            clearTimeout: function () {
            }
        };
    }
    for (i = 0; i < vendors.length && !scope.requestAnimationFrame; ++i) {
        var vendorPrefix = vendors[i];
        scope.requestAnimationFrame = scope[vendorPrefix + 'RequestAnimationFrame'];
        scope.cancelAnimationFrame =
            scope[vendorPrefix + 'CancelAnimationFrame'] || scope[vendorPrefix + 'CancelRequestAnimationFrame'];
    }

    if (!scope.requestAnimationFrame) {
        scope.requestAnimationFrame = function (callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = scope.setTimeout(function () {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if (!scope.cancelAnimationFrame) {
        scope.cancelAnimationFrame = function (id) {
            scope.clearTimeout(id);
        };
    }
    Morph.Graph.Utils.timer = function (callback) {
        var intervalId,
            stopTimer = function () {
                scope.cancelAnimationFrame(intervalId);
                intervalId = 0;
            },

            startTimer = function () {
                intervalId = scope.requestAnimationFrame(startTimer);
                if (!callback()) {
                    stopTimer();
                }
            };

        startTimer();
        return {
            stop: stopTimer,

            restart: function () {
                if (!intervalId) {
                    startTimer();
                }
            }
        };
    };
}());

Morph.Graph.Rect = function (x1, y1, x2, y2) {
    this.x1 = x1 || 0;
    this.y1 = y1 || 0;
    this.x2 = x2 || 0;
    this.y2 = y2 || 0;
};

Morph.Graph.Point2d = function (x, y) {
    this.x = x || 0;
    this.y = y || 0;
};

Morph.Graph.Node = function (id) {
    this.id = id;
    this.links = [];
    this.data = null;
};

Morph.Graph.Link = function (fromId, toId, id, data) {
    this.fromId = fromId;
    this.toId = toId;
    this.data = data;
    this.id = id;
};
Morph.Graph.graph = function () {
    var gr = this;
    var nodes = {},
        links = [],
        nodesCount = 0,
        changes = [],

        exitModification = function (graph) {
            graph.emit('changed', changes);
            changes.length = 0;
        },

        recordLinkChange = function (link, changeType) {
            changes.push({link: link, changeType: changeType});
        },

        isArray = function (value) {
            return value &&
                typeof value === 'object' &&
                typeof value.length === 'number' &&
                typeof value.splice === 'function' && !(value.propertyIsEnumerable('length'));
        };

    var graphPart = {
        addNode: function (nodeId, data) {
            var node = this.getNode(nodeId);
            if (!node) {
                node = new Morph.Graph.Node(nodeId);
                nodesCount++;

                changes.push({node: node, changeType: 'add'});
            } else {
                changes.push({node: node, changeType: 'update'});
            }

            if (data) {
                var augmentedData = node.data || {},
                    dataType = typeof data,
                    name;

                if (dataType === 'string' || isArray(data) ||
                    dataType === 'number' || dataType === 'boolean') {
                    augmentedData = data;
                } else if (dataType === 'undefined') {
                    augmentedData = null;
                } else {
                    for (name in data) {
                        if (data.hasOwnProperty(name)) {
                            augmentedData[name] = data[name];
                        }
                    }
                }

                node.data = augmentedData;
            }

            nodes[nodeId] = node;

            exitModification(this);
            return node;
        },


        addLink: function (fromId, toId, id, data) {
            var fromNode = this.getNode(fromId) || this.addNode(fromId);
            var toNode = this.getNode(toId) || this.addNode(toId);
            data.weight = 8.0;
            var link = new Morph.Graph.Link(fromId, toId, id, data);

            links.push(link);

            fromNode.links.push(link);
            toNode.links.push(link);

            recordLinkChange(link, 'add');

            exitModification(this);

            return link;
        },


        removeLink: function (link) {
            if (!link) {
                return false;
            }
            var idx = links.indexOf(link);
            if (idx < 0) {
                return false;
            }

            links.splice(idx, 1);

            var fromNode = this.getNode(link.fromId);
            var toNode = this.getNode(link.toId);

            if (fromNode) {
                idx = fromNode.links.indexOf(link);
                if (idx >= 0) {
                    fromNode.links.splice(idx, 1);
                }
            }

            if (toNode) {
                idx = toNode.links.indexOf(link);
                if (idx >= 0) {
                    toNode.links.splice(idx, 1);
                }
            }

            recordLinkChange(link, 'remove');

            exitModification(this);

            return true;
        },

        removeNode: function (nodeId) {
            var node = this.getNode(nodeId);
            if (!node) {
                return false;
            }
            while (node.links.length) {
                var link = node.links[0];
                this.removeLink(link);
            }
            nodes[nodeId] = null;
            delete nodes[nodeId];
            nodesCount--;
            changes.push({node: node, changeType: 'remove'});
            exitModification(this);
        },
        getNode: function (nodeId) {
            return nodes[nodeId];
        },
        getNodesCount: function () {
            return nodesCount;
        },
        getLinks: function (nodeId) {
            var node = this.getNode(nodeId);
            return node ? node.links : null;
        },
        forEachNode: function (callback) {
            var node;
            for (node in nodes) {
                if (callback(nodes[node])) {
                    return;
                }
            }
        },
        forEachLink: function (callback) {
            for (var i = 0; i < links.length; ++i) {
                callback(links[i]);
            }
        },
        clear: function () {
            var that = this;
            that.forEachNode(function (node) {
                that.removeNode(node.id);
            });
            exitModification(that);
        }, fromJSON: function (json) {
            graphPart.clear();
            var r = 0, n = 0;
            for (var i = 0; i < json.length; ++i) {
                for (var el in json[i]) {
                    if (json[i][el].start) {
                        graphPart.addLink(json[i][el].start, json[i][el].end, json[i][el].id, json[i][el].data, json[i][el].type);
                        ++r;
                    } else {
                        graphPart.addNode(json[i][el].id, json[i][el].data);
                        ++n;
                    }
                }
            }

        }
    }


    Morph.Graph.Utils.events(graphPart).extend();

    return graphPart;
}
;

Morph.Graph.Physics = Morph.Graph.Physics || {};

Morph.Graph.Physics.Vector = function (x, y) {
    this.x = x || 0;
    this.y = y || 0;
};

Morph.Graph.Physics.Vector.prototype = {
    multiply: function (k) {
        return new Morph.Graph.Physics.Vector(this.x * k, this.y * k);
    }
};

Morph.Graph.Physics.Point = function (x, y) {
    this.x = x || 0;
    this.y = y || 0;
};

Morph.Graph.Physics.Point.prototype = {
    add: function (point) {
        return new Morph.Graph.Physics.Point(this.x + point.x, this.y + point.y);
    }
};

Morph.Graph.Physics.Body = function () {
    this.mass = 1;
    this.force = new Morph.Graph.Physics.Vector();
    this.velocity = new Morph.Graph.Physics.Vector();
    this.location = new Morph.Graph.Physics.Point();
};

Morph.Graph.Physics.Body.prototype = {
    loc: function (location) {
        if (location) {
            this.location.x = location.x;
            this.location.y = location.y;

            return this;
        }

        return this.location;
    }
};

Morph.Graph.Physics.Spring = function (body1, body2, length, coeff, weight) {
    this.body1 = body1;
    this.body2 = body2;
    this.length = length;
    this.coeff = coeff;
    this.weight = weight;
};

Morph.Graph.Physics.QuadTreeNode = function () {
    this.centerOfMass = new Morph.Graph.Physics.Point();
    this.children = [];
    this.body = null;
    this.hasChildren = false;
    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 0;
    this.y2 = 0;
};
Morph.Graph.Physics = Morph.Graph.Physics || {};

Morph.Graph.Physics.eulerIntegrator = function () {
    return {
        integrate: function (simulator, timeStep) {
            var speedLimit = simulator.speedLimit,
                tx = 0,
                ty = 0,
                i,
                max = simulator.bodies.length;

            for (i = 0; i < max; ++i) {
                var body = simulator.bodies[i],
                    coeff = timeStep / body.mass;

                body.velocity.x += coeff * body.force.x;
                body.velocity.y += coeff * body.force.y;
                var vx = body.velocity.x,
                    vy = body.velocity.y,
                    v = Math.sqrt(vx * vx + vy * vy);

                if (v > speedLimit) {
                    body.velocity.x = speedLimit * vx / v;
                    body.velocity.y = speedLimit * vy / v;
                }

                tx = timeStep * body.velocity.x;
                ty = timeStep * body.velocity.y;
                body.location.x += tx;
                body.location.y += ty;
            }

            return tx * tx + ty * ty;
        }
    };
};

Morph.Graph.Physics.nbodyForce = function (options) {
    options = Morph.lazyExtend(options || {
        gravity: -1,
        theta: 0.8
    });

    function InsertStackElement(node, body) {
        this.node = node;
        this.body = body;
    }

    function InsertStack() {
        this.stack = [];
        this.popIdx = 0;
    }

    InsertStack.prototype = {
        isEmpty: function () {
            return this.popIdx === 0;
        },
        push: function (node, body) {
            var item = this.stack[this.popIdx];
            if (!item) {
                this.stack[this.popIdx] = new InsertStackElement(node, body);
            } else {
                item.node = node;
                item.body = body;
            }
            ++this.popIdx;
        },
        pop: function () {
            if (this.popIdx > 0) {
                return this.stack[--this.popIdx];
            }
        },
        reset: function () {
            this.popIdx = 0;
        }
    };


    var gravity = options.gravity,
        updateQueue = [],
        insertStack = new InsertStack(),
        theta = options.theta,

        Node = function () {
            this.body = null;
            this.quads = [];
            this.mass = 0;
            this.massX = 0;
            this.massY = 0;
            this.left = 0;
            this.top = 0;
            this.bottom = 0;
            this.right = 0;
            this.isInternal = false;
        },

        nodesCache = [],
        currentInCache = 0,
        newNode = function () {
            var node;
            if (nodesCache[currentInCache]) {
                node = nodesCache[currentInCache];
                node.quads[0] = null;
                node.quads[1] = null;
                node.quads[2] = null;
                node.quads[3] = null;
                node.body = null;
                node.mass = node.massX = node.massY = 0;
                node.left = node.right = node.top = node.bottom = 0;
                node.isInternal = false;
            } else {
                node = new Node();
                nodesCache[currentInCache] = node;
            }

            ++currentInCache;
            return node;
        },

        root = newNode(),

        isSamePosition = function (point1, point2) {
            var dx = Math.abs(point1.x - point2.x);
            var dy = Math.abs(point1.y - point2.y);

            return (dx < 0.01 && dy < 0.01);
        },

        insert = function (newBody) {
            insertStack.reset();
            insertStack.push(root, newBody);

            while (!insertStack.isEmpty()) {
                var stackItem = insertStack.pop(),
                    node = stackItem.node,
                    body = stackItem.body;

                if (node.isInternal) {
                    var x = body.location.x;
                    var y = body.location.y;
                    node.mass = node.mass + body.mass;
                    node.massX = node.massX + body.mass * x;
                    node.massY = node.massY + body.mass * y;

                    var quadIdx = 0, left = node.left,
                        right = (node.right + left) / 2,
                        top = node.top,
                        bottom = (node.bottom + top) / 2;

                    if (x > right) {// somewhere in the eastern part.
                        quadIdx = quadIdx + 1;
                        var oldLeft = left;
                        left = right;
                        right = right + (right - oldLeft);
                    }
                    if (y > bottom) {// and in south.
                        quadIdx = quadIdx + 2;
                        var oldTop = top;
                        top = bottom;
                        bottom = bottom + (bottom - oldTop);
                    }

                    var child = node.quads[quadIdx];
                    if (!child) {
                        child = newNode();
                        child.left = left;
                        child.top = top;
                        child.right = right;
                        child.bottom = bottom;

                        node.quads[quadIdx] = child;
                    }

                    insertStack.push(child, body);
                } else if (node.body) {
                    var oldBody = node.body;
                    node.body = null;
                    node.isInternal = true;

                    if (isSamePosition(oldBody.location, body.location)) {
                        var newX, newY;
                        do {
                            var angle = Math.random() * 2 * Math.PI;
                            var dx = (node.right - node.left) * 0.006 * Math.cos(angle);
                            var dy = (node.bottom - node.top) * 0.006 * Math.sin(angle);

                            newX = oldBody.location.x + dx;
                            newY = oldBody.location.y + dy;
                        } while (newX < node.left || newX > node.right ||
                            newY < node.top || newY > node.bottom);

                        oldBody.location.x = newX;
                        oldBody.location.y = newY;
                    }
                    insertStack.push(node, oldBody);
                    insertStack.push(node, body);
                } else {
                    node.body = body;
                }
            }
        },

        update = function (sourceBody) {
            var queue = updateQueue,
                v,
                dx,
                dy,
                r,
                queueLength = 1,
                shiftIdx = 0,
                pushIdx = 1;

            queue[0] = root;

            while (queueLength) {
                var node = queue[shiftIdx],
                    body = node.body;

                queueLength -= 1;
                shiftIdx += 1;

                if (body && body !== sourceBody) {
                    dx = body.location.x - sourceBody.location.x;
                    dy = body.location.y - sourceBody.location.y;
                    r = Math.sqrt(dx * dx + dy * dy);

                    if (r === 0) {
                        dx = (Math.random() - 0.5) / 50;
                        dy = (Math.random() - 0.5) / 50;
                        r = Math.sqrt(dx * dx + dy * dy);
                    }

                    v = gravity * body.mass * sourceBody.mass / (r * r * r);
                    sourceBody.force.x = sourceBody.force.x + v * dx;
                    sourceBody.force.y = sourceBody.force.y + v * dy;
                } else {
                    dx = node.massX / node.mass - sourceBody.location.x;
                    dy = node.massY / node.mass - sourceBody.location.y;
                    r = Math.sqrt(dx * dx + dy * dy);

                    if (r === 0) {
                        dx = (Math.random() - 0.5) / 50;
                        dy = (Math.random() - 0.5) / 50;
                        r = Math.sqrt(dx * dx + dy * dy);
                    }
                    if ((node.right - node.left) / r < theta) {
                        v = gravity * node.mass * sourceBody.mass / (r * r * r);
                        sourceBody.force.x = sourceBody.force.x + v * dx;
                        sourceBody.force.y = sourceBody.force.y + v * dy;
                    } else {

                        if (node.quads[0]) {
                            queue[pushIdx] = node.quads[0];
                            queueLength += 1;
                            pushIdx += 1;
                        }
                        if (node.quads[1]) {
                            queue[pushIdx] = node.quads[1];
                            queueLength += 1;
                            pushIdx += 1;
                        }
                        if (node.quads[2]) {
                            queue[pushIdx] = node.quads[2];
                            queueLength += 1;
                            pushIdx += 1;
                        }
                        if (node.quads[3]) {
                            queue[pushIdx] = node.quads[3];
                            queueLength += 1;
                            pushIdx += 1;
                        }
                    }
                }
            }
        },

        init = function (forceSimulator) {
            var x1 = Number.MAX_VALUE,
                y1 = Number.MAX_VALUE,
                x2 = Number.MIN_VALUE,
                y2 = Number.MIN_VALUE,
                i,
                bodies = forceSimulator.bodies,
                max = bodies.length;

            i = max;
            while (i--) {
                var x = bodies[i].location.x;
                var y = bodies[i].location.y;
                if (x < x1) {
                    x1 = x;
                }
                if (x > x2) {
                    x2 = x;
                }
                if (y < y1) {
                    y1 = y;
                }
                if (y > y2) {
                    y2 = y;
                }
            }

            var dx = x2 - x1,
                dy = y2 - y1;
            if (dx > dy) {
                y2 = y1 + dx;
            } else {
                x2 = x1 + dy;
            }

            currentInCache = 0;
            root = newNode();
            root.left = x1;
            root.right = x2;
            root.top = y1;
            root.bottom = y2;

            i = max;
            while (i--) {
                insert(bodies[i], root);
            }
        };

    return {
        insert: insert,
        init: init,
        update: update,
        options: function (newOptions) {
            if (newOptions) {
                if (typeof newOptions.gravity === 'number') {
                    gravity = newOptions.gravity;
                }
                if (typeof newOptions.theta === 'number') {
                    theta = newOptions.theta;
                }

                return this;
            }

            return {gravity: gravity, theta: theta};
        }
    };
};
Morph.Graph.Physics.dragForce = function (options) {
    if (!options) {
        options = {};
    }

    var currentOptions = {
        coeff: options.coeff || 0.01
    };

    return {
        init: function (forceSimulator) {
        },
        update: function (body) {
            body.force.x -= currentOptions.coeff * body.velocity.x;
            body.force.y -= currentOptions.coeff * body.velocity.y;
        },
        options: function (newOptions) {
            if (newOptions) {
                if (typeof newOptions.coeff === 'number') {
                    currentOptions.coeff = newOptions.coeff;
                }

                return this;
            }

            return currentOptions;
        }
    };
};
Morph.Graph.Physics.springForce = function (currentOptions) {
    currentOptions = Morph.lazyExtend(currentOptions, {
        length: 50,
        coeff: 0.00022
    });


    return {
        init: function (forceSimulator) {
        },

        update: function (spring) {
            var body1 = spring.body1,
                body2 = spring.body2,
                length = spring.length < 0 ? currentOptions.length : spring.length,
                dx = body2.location.x - body1.location.x,
                dy = body2.location.y - body1.location.y,
                r = Math.sqrt(dx * dx + dy * dy);

            if (r === 0) {
                dx = (Math.random() - 0.5) / 50;
                dy = (Math.random() - 0.5) / 50;
                r = Math.sqrt(dx * dx + dy * dy);
            }

            var d = r - length;
            var coeff = ((!spring.coeff || spring.coeff < 0) ? currentOptions.coeff : spring.coeff) * d / r * spring.weight;

            body1.force.x += coeff * dx;
            body1.force.y += coeff * dy;

            body2.force.x += -coeff * dx;
            body2.force.y += -coeff * dy;
        },

        options: function (newOptions) {
            if (newOptions) {
                if (typeof newOptions.length === 'number') {
                    currentOptions.length = newOptions.length;
                }
                if (typeof newOptions.coeff === 'number') {
                    currentOptions.coeff = newOptions.coeff;
                }

                return this;
            }
            return currentOptions;
        }
    };
};
Morph.Graph.Physics = Morph.Graph.Physics || {};

Morph.Graph.Physics.forceSimulator = function (forceIntegrator) {
    var integrator = forceIntegrator,
        bodies = [], springs = [], bodyForces = [], springForces = [];
    return {

        speedLimit: 1.0,

        bodies: bodies,

        accumulate: function () {
            var i, j, body;

            i = bodyForces.length;
            while (i--) {
                bodyForces[i].init(this);
            }

            i = springForces.length;
            while (i--) {
                springForces[i].init(this);
            }

            i = bodies.length;
            while (i--) {
                body = bodies[i];
                body.force.x = 0;
                body.force.y = 0;

                for (j = 0; j < bodyForces.length; j++) {
                    bodyForces[j].update(body);
                }
            }

            for (i = 0; i < springs.length; ++i) {
                for (j = 0; j < springForces.length; j++) {
                    springForces[j].update(springs[i]);
                }
            }
        },

        run: function (timeStep) {
            this.accumulate();
            return integrator.integrate(this, timeStep);
        },

        addBody: function (body) {
            if (!body) {
                throw {
                    message: 'Cannot add null body to force simulator'
                };
            }

            bodies.push(body);
            return body;
        },

        removeBody: function (body) {
            if (!body) {
                return false;
            }

            var idx = bodies.indexOf(body);
            if (idx < 0) {
                return false;
            }

            return bodies.splice(idx, 1);
        },

        addSpring: function (body1, body2, springLength, springCoefficient, springWeight) {
            springWeight = typeof springWeight === 'number' ? springWeight : 1;

            var spring = new Morph.Graph.Physics.Spring(body1, body2, springLength, springCoefficient >= 0 ? springCoefficient : -1, springWeight);
            springs.push(spring);

            return spring;
        },

        removeSpring: function (spring) {
            if (!spring) {
                return false;
            }

            var idx = springs.indexOf(spring);
            if (idx < 0) {
                return false;
            }

            return springs.splice(idx, 1);
        },

        addBodyForce: function (force) {
            if (!force) {
                throw {
                    message: 'Cannot add mighty (unknown) force to the simulator'
                };
            }

            bodyForces.push(force);
        },

        addSpringForce: function (force) {
            if (!force) {
                throw {
                    message: 'Cannot add unknown force to the simulator'
                };
            }

            springForces.push(force);
        }
    };
};

Morph.Graph.Layout = Morph.Graph.Layout || {};
Morph.Graph.Layout.forceDirected = function (graph, settings) {
    var STABLE_THRESHOLD = 0.01;
    settings = Morph.lazyExtend(settings, {
        springLength: 80,
        springCoeff: 0.002,
        gravity: -0.6,
        theta: 0.8,
        dragCoeff: 0.02
    });

    var forceSimulator = Morph.Graph.Physics.forceSimulator(Morph.Graph.Physics.eulerIntegrator()),
        nbodyForce = Morph.Graph.Physics.nbodyForce({
            gravity: settings.gravity,
            theta: settings.theta
        }),
        springForce = Morph.Graph.Physics.springForce({
            length: settings.springLength,
            coeff: settings.springCoeff
        }),
        dragForce = Morph.Graph.Physics.dragForce({
            coeff: settings.dragCoeff
        }),
        graphRect = new Morph.Graph.Rect(),

        getBestNodePosition = function (node) {
            var baseX = (graphRect.x1 + graphRect.x2) / 2,
                baseY = (graphRect.y1 + graphRect.y2) / 2,
                springLength = settings.springLength;

            if (node.links && node.links.length > 0) {
                var firstLink = node.links[0],
                    otherNode = firstLink.fromId !== node.id ? graph.getNode(firstLink.fromId) : graph.getNode(firstLink.toId);
                if (otherNode.position) {
                    baseX = otherNode.position.x;
                    baseY = otherNode.position.y;
                }
            }

            return {
                x: baseX + Math.floor(Math.random() * (springLength - springLength / 2)),
                y: baseY + Math.floor(Math.random() * (springLength - springLength / 2))
            };
        },

        updateNodeMass = function (node) {
            node.force_directed_body.mass = 1 + graph.getLinks(node.id).length / 3.0;
        },

        initNode = function (node) {
            var body = node.force_directed_body;
            if (!body) {
                node.position = node.position || getBestNodePosition(node);

                body = new Morph.Graph.Physics.Body();
                node.force_directed_body = body;
                updateNodeMass(node);

                body.loc(node.position);
                forceSimulator.addBody(body);
            }
        },

        releaseNode = function (node) {
            var body = node.force_directed_body;
            if (body) {
                node.force_directed_body = null;
                delete node.force_directed_body;

                forceSimulator.removeBody(body);
            }
        },

        initLink = function (link) {
            var from = graph.getNode(link.fromId),
                to = graph.getNode(link.toId);

            updateNodeMass(from);
            updateNodeMass(to);
            link.force_directed_spring = forceSimulator.addSpring(from.force_directed_body, to.force_directed_body, -1.0, link.weight);
        },

        releaseLink = function (link) {
            var spring = link.force_directed_spring;
            if (spring) {
                var from = graph.getNode(link.fromId),
                    to = graph.getNode(link.toId);
                if (from) {
                    updateNodeMass(from);
                }
                if (to) {
                    updateNodeMass(to);
                }

                link.force_directed_spring = null;
                delete link.force_directed_spring;

                forceSimulator.removeSpring(spring);
            }
        },

        onGraphChanged = function (changes) {
            for (var i = 0; i < changes.length; ++i) {
                var change = changes[i];
                if (change.changeType === 'add') {
                    if (change.node) {
                        initNode(change.node);
                    }
                    if (change.link) {
                        initLink(change.link);
                    }
                } else if (change.changeType === 'remove') {
                    if (change.node) {
                        releaseNode(change.node);
                    }
                    if (change.link) {
                        releaseLink(change.link);
                    }
                }
            }
        },

        initSimulator = function () {
            graph.forEachNode(initNode);
            graph.forEachLink(initLink);
            graph.addEventListener('changed', onGraphChanged);
        },

        isNodePinned = function (node) {
            if (!node) {
                return true;
            }

            return node.isPinned || (node.data && node.data.isPinned);
        },

        updateNodePositions = function () {
            var x1 = Number.MAX_VALUE,
                y1 = Number.MAX_VALUE,
                x2 = Number.MIN_VALUE,
                y2 = Number.MIN_VALUE;
            if (graph.getNodesCount() === 0) {
                return;
            }

            graph.forEachNode(function (node) {
                var body = node.force_directed_body;
                if (isNodePinned(node)) {
                    body.loc(node.position);
                }

                node.position.x = body.location.x;
                node.position.y = body.location.y;

                if (node.position.x < x1) {
                    x1 = node.position.x;
                }
                if (node.position.x > x2) {
                    x2 = node.position.x;
                }
                if (node.position.y < y1) {
                    y1 = node.position.y;
                }
                if (node.position.y > y2) {
                    y2 = node.position.y;
                }
            });

            graphRect.x1 = x1;
            graphRect.x2 = x2;
            graphRect.y1 = y1;
            graphRect.y2 = y2;
        };

    forceSimulator.addSpringForce(springForce);
    forceSimulator.addBodyForce(nbodyForce);
    forceSimulator.addBodyForce(dragForce);

    initSimulator();

    return {
        run: function (iterationsCount) {
            var i;
            iterationsCount = iterationsCount || 50;

            for (i = 0; i < iterationsCount; ++i) {
                this.step();
            }
        },

        step: function () {
            var energy = forceSimulator.run(20);
            updateNodePositions();

            return energy < STABLE_THRESHOLD;
        },

        getGraphRect: function () {
            return graphRect;
        },
        dispose: function () {
            graph.removeEventListener('change', onGraphChanged);
        },
        springLength: function (length) {
            if (arguments.length === 1) {
                springForce.options({
                    length: length
                });
                return this;
            }

            return springForce.options().length;
        },
        springCoeff: function (coeff) {
            if (arguments.length === 1) {
                springForce.options({
                    coeff: coeff
                });
                return this;
            }

            return springForce.options().coeff;
        },
        gravity: function (g) {
            if (arguments.length === 1) {
                nbodyForce.options({
                    gravity: g
                });
                return this;
            }

            return nbodyForce.options().gravity;
        },
        theta: function (t) {
            if (arguments.length === 1) {
                nbodyForce.options({
                    theta: t
                });
                return this;
            }

            return nbodyForce.options().theta;
        }
    };
};
Morph.Graph.View = Morph.Graph.View || {};

Morph.Graph.View.Renderer = function (graph, settings) {
    var FRAME_INTERVAL = 30;

    settings = settings || {};

    var renderer = this;
    var layout = settings.layout,
        graphics = settings.graphics,
        onNodeHover = settings.onNodeClick,
        container = settings.container,
        inputManager,
        animationTimer,
        rendererInitialized = false,
        updateCenterRequired = true,

        currentStep = 0,
        totalIterationsCount = 0,
        isStable = false,


        viewPortOffset = {
            x: 0,
            y: 0
        },

        transform = {
            offsetX: 0,
            offsetY: 0,
            scale: 1
        };


    var prepareSettings = function () {
            container = container || window.document.body;
            layout = layout || Morph.Graph.Layout.forceDirected(graph);
//      console.log(settings)
            graphics = graphics || Morph.Graph.View.svgGraphics(graph, settings);


            settings.prerender = settings.prerender || 0;
            inputManager = (graphics.inputManager || Morph.Input.domInputManager)(graph, graphics);
        },
        cachedFromPos = {x: 0, y: 0, node: null},
        cachedToPos = {x: 0, y: 0, node: null},
        cachedNodePos = { x: 0, y: 0},
        windowEvents = Morph.Graph.Utils.events(window),
        publicEvents = Morph.Graph.Utils.events({}).extend(),
        graphEvents,
        containerDrag,


        renderLink = function (link) {
            var fromNode = graph.getNode(link.fromId),
                toNode = graph.getNode(link.toId);
            cachedFromPos.x = fromNode.position.x;
            cachedFromPos.y = fromNode.position.y;
            cachedFromPos.node = fromNode;

            cachedToPos.x = toNode.position.x;
            cachedToPos.y = toNode.position.y;
            cachedToPos.node = toNode;
            graphics.updateLinkPosition(link.ui, cachedFromPos, cachedToPos);
        },

        renderNode = function (node) {
            cachedNodePos.x = node.position.x;
            cachedNodePos.y = node.position.y;

            graphics.updateNodePosition(node.ui, cachedNodePos);
        },

        renderGraph = function () {
            graph.forEachLink(renderLink);

            graph.forEachNode(renderNode);
        },

        onRenderFrame = function () {
            isStable = layout.step() && !userInteraction;
            renderGraph();

            return !isStable;
        },

        renderIterations = function (iterationsCount) {
            if (animationTimer) {
                totalIterationsCount += iterationsCount;
                return;
            }

            if (iterationsCount) {
                totalIterationsCount += iterationsCount;

                animationTimer = Morph.Graph.Utils.timer(function () {
                    return onRenderFrame();
                }, FRAME_INTERVAL);
            } else {
                currentStep = 0;
                totalIterationsCount = 0;
                animationTimer = Morph.Graph.Utils.timer(onRenderFrame, FRAME_INTERVAL);
            }
        },

        resetStable = function () {
            isStable = false;
            animationTimer.restart();
        },


        updateCenter = function () {
            var graphRect = layout.getGraphRect(),
                containerSize = Morph.Graph.Utils.getDimension(container);

            viewPortOffset.x = viewPortOffset.y = 0;
            transform.offsetX = containerSize.width / 2 - (graphRect.x2 + graphRect.x1) / 2;
            transform.offsetY = containerSize.height / 2 - (graphRect.y2 + graphRect.y1) / 2;
            graphics.graphCenterChanged(transform.offsetX + viewPortOffset.x, transform.offsetY + viewPortOffset.y);

            updateCenterRequired = false;
        },

        createNodeUi = function (node) {
            var nodeUI = graphics.node(node);
            node.ui = nodeUI;
            graphics.initNode(nodeUI);
            renderNode(node);
        },

        removeNodeUi = function (node) {
            graphics.releaseNode(node.ui);
            node.ui = null;
            delete node.ui;
        },

        createLinkUi = function (link) {
            var linkUI = graphics.link(link);
            link.ui = linkUI;
            graphics.initLink(linkUI);
            renderLink(link);
        },

        removeLinkUi = function (link) {
            if (link.hasOwnProperty('ui')) {
                graphics.releaseLink(link.ui);
                link.ui = null;
                delete link.ui;
            }
        },

        listenNodeEvents = function (node) {
            var wasPinned = false;

            inputManager.bindDragNDrop(node, {
                onStart: function () {
                    wasPinned = node.isPinned;
                    node.isPinned = true;
                    userInteraction = true;
                    resetStable();
                },
                onDrag: function (e, offset) {
                    node.position.x += offset.x / transform.scale;
                    node.position.y += offset.y / transform.scale;
                    userInteraction = true;

                    renderGraph();
                },
                onStop: function () {
                    node.isPinned = !wasPinned;
                    userInteraction = false;
                }
            });
            inputManager.bindHover(node, {
                onStart: function () {
                    console.log('onstart')
                },
                onStop: function () {
                    console.log('onstop')
                }
            }, onNodeHover);
        },

        releaseNodeEvents = function (node) {
            inputManager.bindDragNDrop(node, null);
            inputManager.bindHover(node, null);
        },

        initDom = function () {
            graphics.init(container);

            graph.forEachNode(createNodeUi);

            graph.forEachLink(createLinkUi);
        },

        releaseDom = function () {
            graphics.release(container);
        },

        processNodeChange = function (change) {
            var node = change.node;

            if (change.changeType === 'add') {
                createNodeUi(node);
                listenNodeEvents(node);
                if (updateCenterRequired) {
                    updateCenter();
                }
            } else if (change.changeType === 'remove') {
                releaseNodeEvents(node);
                removeNodeUi(node);
                if (graph.getNodesCount() === 0) {
                    updateCenterRequired = true;
                }
            } else if (change.changeType === 'update') {
                releaseNodeEvents(node);
                removeNodeUi(node);

                createNodeUi(node);
                listenNodeEvents(node);
            }
        },

        processLinkChange = function (change) {
            var link = change.link;
            if (change.changeType === 'add') {
                createLinkUi(link);
            } else {
                removeLinkUi(link);
            }
        },

        onGraphChanged = function (changes) {
            var i, change;
            for (i = 0; i < changes.length; i += 1) {
                change = changes[i];
                if (change.node) {
                    processNodeChange(change);
                } else if (change.link) {
                    processLinkChange(change);
                }
            }

            resetStable();
        },

        onWindowResized = function () {
            updateCenter();
            onRenderFrame();
        },

        releaseContainerDragManager = function () {
            if (containerDrag) {
                containerDrag.release();
                containerDrag = null;
            }
        },

        releaseGraphEvents = function () {
            if (graphEvents) {
                graphEvents.stop('changed', onGraphChanged);
                graphEvents = null;
            }
        },

        listenToEvents = function () {
            windowEvents.on('resize', onWindowResized);

            releaseContainerDragManager();
            containerDrag = Morph.Graph.Utils.dragndrop(container);
            containerDrag.onDrag(function (e, offset) {
                viewPortOffset.x += offset.x;
                viewPortOffset.y += offset.y;
                graphics.translateRel(offset.x, offset.y);

                renderGraph();
            });

            containerDrag.onScroll(function (e, scaleOffset, scrollPoint) {
                var scaleFactor = Math.pow(1 + 0.4, scaleOffset < 0 ? -0.2 : 0.2);
                transform.scale = graphics.scale(scaleFactor, scrollPoint);

                renderGraph();
                publicEvents.emit('scale', transform.scale);
            });

            graph.forEachNode(listenNodeEvents);

            releaseGraphEvents();
            graphEvents = Morph.Graph.Utils.events(graph);
            graphEvents.on('changed', onGraphChanged);
        },

        stopListenToEvents = function () {
            rendererInitialized = false;
            releaseGraphEvents();
            releaseContainerDragManager();
            windowEvents.stop('resize', onWindowResized);
            publicEvents.removeAllListeners();
            animationTimer.stop();

            graph.forEachLink(function (link) {
                removeLinkUi(link);
            });

            graph.forEachNode(function (node) {
                releaseNodeEvents(node);
                removeNodeUi(node);
            });

            layout.dispose();
            releaseDom();
        };

    return {
        run: function (iterationsCount) {

            if (!rendererInitialized) {
                prepareSettings();

                updateCenter();
                initDom();
                listenToEvents();

                rendererInitialized = true;
            }

            renderIterations(iterationsCount);

            return this;
        },

        reset: function () {
            graphics.resetScale();
            updateCenter();
            transform.scale = 1;
        },

        pause: function () {
            animationTimer.stop();
        },

        resume: function () {
            animationTimer.restart();
        },

        dispose: function () {
            stopListenToEvents();
        },

        on: function (eventName, callback) {
            publicEvents.addEventListener(eventName, callback);
            return this;
        },

        off: function (eventName, callback) {
            publicEvents.removeEventListener(eventName, callback);
            return this;
        }
    };
};


Morph.Graph.svg = function (element) {

    var svgElement = element;

    svgElement = window.document.createElementNS(Morph.svgns, element);

    if (svgElement.vivagraphAugmented) {
        return svgElement;
    }

    svgElement.vivagraphAugmented = true;

    svgElement.attr = function (name, value) {
        if (arguments.length === 2) {
            if (value !== null) {
                svgElement.setAttributeNS(null, name, value);
            } else {
                svgElement.removeAttributeNS(null, name);
            }

            return svgElement;
        }

        return svgElement.getAttributeNS(null, name);
    };

    svgElement.append = function (element) {
        var child = Morph.Graph.svg(element);
        svgElement.appendChild(child);
        return child;
    };

    svgElement.text = function (textContent) {
        svgElement.textContent = textContent;
        return svgElement;
    };

    svgElement.link = function (target) {
        console.log(target)
        if (arguments.length) {
            svgElement.setAttributeNS(Morph.xlinkns, "xlink:href", target);
            return svgElement;
        }

        return svgElement.getAttributeNS(Morph.xlinkns, "xlink:href");
    };

    svgElement.children = function (selector) {
        var wrappedChildren = [],
            childrenCount = svgElement.childNodes.length,
            i, j;

        if (selector === undefined && svgElement.hasChildNodes()) {
            for (i = 0; i < childrenCount; i++) {
                wrappedChildren.push(Morph.Graph.svg(svgElement.childNodes[i]));
            }
        } else if (typeof selector === "string") {
            var classSelector = (selector[0] === "."),
                idSelector = (selector[0] === "#"),
                tagSelector = !classSelector && !idSelector;

            for (i = 0; i < childrenCount; i++) {
                var el = svgElement.childNodes[i];

                if (el.nodeType === 1) {
                    var classes = el.attr("class"),
                        id = el.attr("id"),
                        tagName = el.nodeName;

                    if (classSelector && classes) {
                        classes = classes.replace(/\s+/g, " ").split(" ");
                        for (j = 0; j < classes.length; j++) {
                            if (classSelector && classes[j] === selector.substr(1)) {
                                wrappedChildren.push(Morph.Graph.svg(el));
                                break;
                            }
                        }
                    } else if (idSelector && id === selector.substr(1)) {
                        wrappedChildren.push(Morph.Graph.svg(el));
                        break;
                    } else if (tagSelector && tagName === selector) {
                        wrappedChildren.push(Morph.Graph.svg(el));
                    }

                    wrappedChildren = wrappedChildren.concat(Morph.Graph.svg(el).children(selector));
                }
            }

            if (idSelector && wrappedChildren.length === 1) {
                return wrappedChildren[0];
            }
        }

        return wrappedChildren;
    };

    return svgElement;
};

Morph.Graph.View = Morph.Graph.View || {};

Morph.Graph.View.svgGraphics = function (g, opts) {
    var svgContainer,
        svgRoot = opts.container,
        offsetX,
        offsetY,
        actualScale = 1,
        nodeSize = opts.nodeSize | 10,
        linkMaxWidth = opts.linkMaxWidth | 1;
    var nodeColor = (opts.nodeColor == null) ? "#00a2e8" : opts.nodeColor;
    var linkColor = (opts.linkColor == null) ? "#999" : opts.linkColor;
    nodeBuilder = function (node) {
        //console.log('node', node.id)
        return Morph.Graph.svg("rect")
            .attr("width", nodeSize)
            .attr("height", nodeSize)
            .attr("id", 'r' + node.id)
            .attr("fill", nodeColor);
    },

        nodePositionCallback = function (nodeUI, pos) {
            nodeUI.attr("x", pos.x - nodeSize / 2)
                .attr("y", pos.y - nodeSize / 2);
        },

        linkBuilder = function (link) {
//            console.log('link', link)
            return Morph.Graph.svg("line")
                .attr("stroke", linkColor)
                .attr("id", 'l' + link.id)
                .attr('stroke-width', link.data.weight * linkMaxWidth);
        },

        linkPositionCallback = function (linkUI, fromPos, toPos) {
            linkUI.attr("x1", fromPos.x).attr("y1", fromPos.y)
                .attr("x2", toPos.x).attr("y2", toPos.y);
        },

        fireRescaled = function (graphics) {
            graphics.emit("rescaled");
        },

        updateTransform = function () {
            if (svgContainer) {
                var transform = "matrix(" + actualScale + ", 0, 0," + actualScale + "," + offsetX + "," + offsetY + ")";
                svgContainer.attr("transform", transform);
            }
        };

    var graphics = {
        node: function (builderCallbackOrNode) {

            if (builderCallbackOrNode && typeof builderCallbackOrNode !== "function") {
                return nodeBuilder(builderCallbackOrNode);
            }

            nodeBuilder = builderCallbackOrNode;

            return this;
        },
        link: function (builderCallbackOrLink) {
            if (builderCallbackOrLink && typeof builderCallbackOrLink !== "function") {
                return linkBuilder(builderCallbackOrLink);
            }

            linkBuilder = builderCallbackOrLink;
            return this;
        },

        graphCenterChanged: function (x, y) {
            offsetX = x;
            offsetY = y;
            updateTransform();
        },

        inputManager: Morph.Input.domInputManager,

        translateRel: function (dx, dy) {
            var p = svgRoot.createSVGPoint(),
                t = svgContainer.getCTM(),
                origin = svgRoot.createSVGPoint().matrixTransform(t.inverse());
            p.x = dx;
            p.y = dy;
            p = p.matrixTransform(t.inverse());
            p.x = (p.x - origin.x) * t.a;
            p.y = (p.y - origin.y) * t.d;
            t.e += p.x;
            t.f += p.y;
            var transform = "matrix(" + t.a + ", 0, 0," + t.d + "," + t.e + "," + t.f + ")";
            svgContainer.attr("transform", transform);
        },

        scale: function (scaleFactor, scrollPoint) {
            var p = svgRoot.createSVGPoint();
            p.x = scrollPoint.x;
            p.y = scrollPoint.y;

            p = p.matrixTransform(svgContainer.getCTM().inverse());
            var k = svgRoot.createSVGMatrix().translate(p.x, p.y).scale(scaleFactor).translate(-p.x, -p.y),
                t = svgContainer.getCTM().multiply(k);

            actualScale = t.a;
            offsetX = t.e;
            offsetY = t.f;
            svgContainer.attr("transform", "matrix(" + t.a + ", 0, 0," + t.d + "," + t.e + "," + t.f + ")");

            graphics.emit("rescaled");
            return actualScale;
        },

        resetScale: function () {
            actualScale = 1;
            var transform = "matrix(1, 0, 0, 1, 0, 0)";
            svgContainer.attr("transform", transform);
            graphics.emit("rescaled");
            return this;
        },
        init: function () {
            svgContainer = Morph.Graph.svg("g")
                .attr("buffered-rendering", "dynamic");
            svgRoot.appendChild(svgContainer);
            updateTransform();
        },

        release: function (container) {
            if (svgRoot && container) {
                container.removeChild(svgRoot);
            }
        },

        initLink: function (linkUI) {
            if (!linkUI) {
                return;
            }
            if (svgContainer.childElementCount > 0) {
                svgContainer.insertBefore(linkUI, svgContainer.firstChild);
            } else {
                svgContainer.appendChild(linkUI);
            }
        },

        releaseLink: function (linkUI) {
            svgContainer.removeChild(linkUI);
        },

        initNode: function (nodeUI) {
            svgContainer.appendChild(nodeUI);
        },

        releaseNode: function (nodeUI) {
            svgContainer.removeChild(nodeUI);
        },

        updateNodePosition: function (nodeUI, pos) {
            nodePositionCallback(nodeUI, pos);
        },

        updateLinkPosition: function (link, fromPos, toPos) {
            linkPositionCallback(link, fromPos, toPos);
        }
    };

    Morph.Graph.Utils.events(graphics).extend();

    return graphics;
};