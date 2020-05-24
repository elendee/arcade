class Popup {
    constructor(options = {}) {

        this.title = ""
        this.html = "" // used as content html string (if not empty)
        this.showTopbar = true
        this.showTopbarOnHover = true
        this.showTitle = true
        this.showClose = true
        this.w = 200
        this.h = 124

        this.removeOnHide = false

        this.mousedown = false
        this.lastX = 0
        this.lastY = 0
        this.x = 100
        this.y = 100
        this.diffX = 0
        this.diffY = 0
        
        this.minMax = options.minMax ?? {
            min: {
                w: 0,
                h: 0,
            },
            max: {
                w: Infinity,
                h: Infinity,
            }
        };
        
        this.anchorMode = "";
        
        this.forceRatio = 0;

        Object.assign(this, options)

        
        
        this.init()
    }

    initElements() {
        this.element = document.createElement('div')
        this.element.classList.add('popup')
        this.element.style.position = "fixed"
        this.element.style.display = "flex"
        this.element.style.flexDirection = "column"
        
        this.resize()
        this.reposition()

        this.topbar = document.createElement('div')
        this.topbar.classList.add('topbar_div')
        this.element.appendChild(this.topbar)
        if (this.showTopbar || this.showTopbarOnHover) {
            if (this.showTitle) {
                this.titleElement = document.createElement('div')
                this.titleElement.classList.add('title_div')
                this.titleElement.classList.add('textShadow')
                this.titleElement.innerHTML = this.title
                this.topbar.appendChild(this.titleElement)
            }
            if (this.showClose) {
                this.close = document.createElement('div')
                this.close.classList.add('close_button')
                this.close.classList.add('textShadow')
                this.close.innerHTML = 'X'
                this.topbar.appendChild(this.close)
            }
            if (!this.showTopbar && this.showTopbarOnHover) {
                this.topbarHide();
            }
        }

        this.content = document.createElement('div')
        this.content.classList.add('content_div')
        this.content.style.backgroundColor = this.contentBackground ?? ""
        this.content.style.display = "flex"
        this.content.style.flex = "1"
        if (this.contentId) {
            this.content.id = this.contentId
        }
        if (this.html) {
            this.content.innerHTML = this.html
        }
        this.element.appendChild(this.content)
    }
    resize() {
        let w;
        let h;
        let rect;
        if(this.target) {
            const _rect = this.target.getBoundingClientRect();
            w = _rect.width;
            h = _rect.height;
        } else {
            w = window.innerWidth;
            h = window.innerHeight;
        }
        rect = ratioToRect(
            w,
            h,
            this.topLeft,
            this.bottomRight,
            this.minMax,
            this.anchorMode,
            this.forceRatio
        );
        this.w = rect.w;
        this.h = rect.h;
        this.x = rect.x;
        this.y = rect.y;
        
    }
    
    reposition() {
        this.element.style.width = this.w + "px";
        this.element.style.height = this.h + "px";
        this.element.style.left = this.x + "px";
        this.element.style.top = this.y + "px";
    }
    
    topbarShow() {
        this.topbar.style.visibility = "visible";
    }
    
    topbarHide() {
        this.topbar.style.position = "absolute";
        this.topbar.style.visibility = "hidden";
        this.topbar.style.zIndex = "1000";
    }
    
    initEvents() {
        const mousedown = e => {
            this.mousedown = true
            this.startX = e.clientX
            this.startY = e.clientY
            const rect = this.element.getBoundingClientRect();
            this.left = rect.left
            this.top = rect.top
            this.diffX = this.startX - this.left
            this.diffY = this.startY - this.top
        };
        const mousemove = e => {
            if (typeof e.buttons !== "undefined" && e.buttons === 0) {
                this.mousedown = false
            }
            if (this.mousedown) {
                this.x = e.clientX - this.diffX
                this.y = e.clientY - this.diffY
                this.element.style.top = Math.floor(this.y) + 'px'
                this.element.style.left = Math.floor(this.x) + 'px'
            }
        };
        const mouseup = e => {
            this.mousedown = false
        };
        
        if (!this.showTopbar && this.showTopbarOnHover) {
            
            this.topbar.addEventListener('mouseenter', e => {
                this.topbarShow();
            })
            this.topbar.addEventListener('mouseleave', e => {
                this.topbarHide();
            })
        }

        this.topbar.addEventListener('mousedown', mousedown)
        window.addEventListener('mousemove', mousemove)
        window.addEventListener('mouseup', mouseup)
        
        this.topbar.addEventListener('touchstart', mousedown)
        window.addEventListener('touchmove', mousemove)
        window.addEventListener('touchend', mouseup)

        if (this.showClose) {
            this.close.addEventListener('click', () => {
                this.hide()
            })
        }
        
        const resizeCallback = e => {
            this.resize();
            this.reposition();
        }
        
        if(this.target) {
            this.target.addEventListener('resize', resizeCallback)
        } else {
            window.addEventListener('resize', resizeCallback)
        }
    }

    show() {
        if (this.element) {
            this.element.style.display = 'inline-block'
            this.element.style.left = this.x + 'px'
            this.element.style.top = this.y + 'px'
        } else {
            this.init();
        }
    }

    hide() {
        if (this.removeOnHide) {
            this.remove();
        } else {
            this.element.style.display = 'none'
        }
    }

    init() {
        this.initElements()
        this.initEvents()
        if (this.element) {
            document.body.appendChild(this.element)
        }
    }

    remove() {
        this.element.remove()
        this.element = undefined;
    }

    toggle() {
        if (this.element) {
            if (this.removeOnHide) {
                this.remove()
            } else if (this.element.style.display === 'none') {
                this.show()
            } else {
                this.hide()
            }
        } else {
            this.render()
        }
    }
}

function ratioToRect(w, h, start, end, minMax, anchorMode, forceRatio) {
    
    const ret = {
        x: w * start.x,
        y: h * start.y,
        w: (end.x * w) - (start.x * w),
        h: (end.y * h) - (start.y * h)
    };
    if(anchorMode === "bottom-left"){
    
            console.log("before:",ret,`${minMax.min.w} > ${ret.w}`);   
    }
    if (minMax.max.w < ret.w){ret.w = minMax.max.w;}
    else if (minMax.min.w > ret.w){
        console.log("made it here");
        ret.w = minMax.min.w;
    }
    if (minMax.max.h < ret.h){ret.h = minMax.max.h;}
    else if (minMax.min.h > ret.h){ret.h = minMax.min.h;}
    if(anchorMode === "bottom-left"){
    
            console.log("after:",ret);   
    }
    if (forceRatio) {
        const widthIsLowest = ret.w < ret.h;
        if (widthIsLowest) {
           ret.h = ret.w / forceRatio;
        }else{
           ret.w = ret.h * forceRatio;
        }
    }
    switch (anchorMode) {
        case "top-right":
            ret.x = w - ret.w;
            ret.y = 0;
            break;
        case "bottom-right":
            ret.x = w - ret.w;
            ret.y = h - ret.h;
            break;
        case "bottom-left":
            console.log(ret);
            ret.x = 0;
            ret.y = h - ret.h;
            break;
        case "top-left":
            ret.x = 0;
            ret.y = 0;
            break;
    }
    
    return ret;
}
