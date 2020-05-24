
const gameScreenCache = {};
const gameScreenMeshMap = {};
const gameScreenTextureMap = {};
const defaultBanner = {
    x: 23, y: 169,
    w: 64, h: 16,
};
const defaultControls = {
    x: 23, y: 246,
    w: 64, h: 22,
};
const defaultFront = {
    x: 23, y: 270,
    w: 64, h: 83,
};
const defaultSide = {
    x: 23, y: 369,
    w: 64, h: 130,
};
const defaultPreview = {
    prefix: "/resources/images/game_screens/img",
    suffix: ".jpg",
};
const defaultModel = {
    path: "/resources/geometries/arcade4.obj",
    texturePath: "/resources/textures/arcade2c.png"
};
const slimGames = [
    ["Ultra Hold-on",21,27],
    // ["Zaxxoff",30,44],
    // ["Paper Biker",56,76],
    // ["Destiny Zone",80,100],
    // ["F1",104,124],
    // ["Age of Ramp",128,148],
    // ["Isle Rainbows",169,188],
    // ["Hokey Gong",191,212],
    // ["Shadow Prancer",215,238],
    // ["Cowabunga",244,262],
    // ["Hairy Space",268,287],
    // ["Triple Dragoon",292,312],
    // ["Chaser",316,335],
    // ["She No Be",339,360],
    // ["Galala",364,385],
    // ["Mithril Axe",389,410],
    // ["Bubble Trouble",413,436],
    // ["Ghosts n' Stuff",439,463],
    // ["Wolf Operative",468,487],
    // ["Run out",492,511],
    // ["Category R",516,537],
    // ["Ninja Time",542,561],
    // ["final fight",566,585],
    // ["Dig Dug",590,592],
    // ["Pac Person",631,649],
]
// .map(n=>[
//     n[0],
//     n[1],
//     n[1]+1
// ]);

const games = {};
slimGames.forEach(n=>{
    games[n[0]] = {
        name: n[0],
        banner: {
            ...defaultBanner,
            canvas: canvas_bannerText({
                canvas: canvas_arcadeBanner({
                    w: defaultBanner.w,
                    h: defaultBanner.h,
                }),
                fontSize: 10,
                text: n[0],
                x: 0,
                y: 0,
                w: defaultBanner.w,
                h: defaultBanner.h,
            })
        },
        controls: {
            ...defaultControls,
            canvas: canvas_arcadeControls({
                w: defaultControls.w,
                h: defaultControls.h,
            })
        },
        front: {
            ...defaultFront,
            canvas: canvas_arcadeFront({
                w: defaultFront.w,
                h: defaultFront.h,
            })
        },
        side: {
            ...defaultSide,
            canvas: canvas_arcadeSide({
                w: defaultSide.w,
                h: defaultSide.h,
            })
        },
        model: defaultModel,
        preview: {
            ...defaultPreview,
            range: [n[1],n[2]]
        },
    };
})
let arcadeMachineCount = 0;
function initArcadeMachine(scene, scale, position, rotation, direction) {
    textureLoader.load(this.model.texturePath, _texture => {
        const texture = new THREE.CanvasTexture(
            canvas_image({
                img:_texture.image,
                inserts: [
                    {
                        x: this.banner.x,
                        y: this.banner.y,
                        canvas: this.banner.canvas
                    },
                    {
                        x: this.controls.x,
                        y: this.controls.y,
                        canvas: this.controls.canvas
                    },
                    {
                        x: this.front.x,
                        y: this.front.y,
                        canvas: this.front.canvas
                    },
                    {
                        x: this.side.x,
                        y: this.side.y,
                        canvas: this.side.canvas
                    },
                ]
            })
        );
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.encoding = THREE.sRGBEncoding;
        objLoader.load(
            this.model.path, 
            (group)=>{
                const material = new THREE.MeshBasicMaterial({ 
                    map: texture,
                    transparent: true
                });
                group.name = "arcade_machine_"+arcadeMachineCount;
                arcadeMachineCount++;
                group.scale.set(...scale);
                group.children[0].material = material;
                group.children[0].castShadow = true
                group.children[0].receiveShadow = true
                const _position = hackTheFuckingYOffset(scale, position);//TODO: replace this
                group.position.set(..._position);
                group.rotation.set(...rotation);
                scene.add(group);
            
                preloadPreviews(this);
            
                const screenGeometry = new THREE.BoxGeometry( 1, 1, 1 );
                const screenMaterial = new THREE.MeshBasicMaterial({
                    map: gameScreenTextureMap[`${this.preview.prefix}${this.preview.range[0]}${this.preview.suffix}`]
                });
            
                const screenMesh = new THREE.Mesh( screenGeometry, screenMaterial );
                const screenScale = hackTheScreenScale(scale, position, rotation, direction);
                const screenPosition = hackTheScreenPosition(scale, position, rotation, direction);
                const screenRotation = hackTheScreenRotation(scale, position, rotation, direction);
                screenMesh.scale.set(...screenScale);
                screenMesh.position.set(...screenPosition);
                screenMesh.rotation.set(...screenRotation);
                scene.add( screenMesh );
                const mapKey = position.map(n=>Math.floor(n)).join("_");
                gameScreenCache[mapKey] = {
                    position,
                    frame: 0,
                    time: Date.now(),
                    preview: {...this.preview},
                    screenMesh
                };
            });
    });
} 
function preloadPreviews(game) {
    const { prefix, suffix, range } = game.preview;
    const [ _i, _in ] = range;
    Array(_in - _i).fill(1).forEach((_,i)=>{
        const path = `${prefix}${_i + i}${suffix}`;
        if(!gameScreenTextureMap[path]){
            gameScreenTextureMap[path] = textureLoader.load(path);
        }
    })
}
function hackTheFuckingYOffset(scale, position) {
    const ret = [...position];
    ret[1] = scale[1] * 1.73;
    return ret;
}
function hackTheScreenScale(scale, position, rotation, direction) {
    const ret = [...scale];
    const rot = 0;
    switch(direction){
        case "N":
        case "S":
            ret[2] = 1;
            break;
        case "E":
        case "W":
            ret[0] = 1;
            break;
    }
    return ret;
}
function hackTheScreenPosition(scale, position, rotation, direction) {
    const ret = [...position];
    ret[1] = scale[1] * 2.43;
    return ret;
}
function hackTheScreenRotation(scale, position, rotation, direction) {
    const ret = [...rotation];
    const screenAngle = 0.5;
    switch(direction){
        case "N":
            ret[0] = ret[0] + screenAngle;
            break
        case "S":
            ret[0] = ret[0] - screenAngle;
            break;
        case "E":
            ret[1] = 0;
            ret[2] = screenAngle;
            break
        case "W":
            ret[1] = 0;
            ret[2] = -screenAngle;
            break;
    }
    return ret;
}
function randomGameName(){
    const keys = Object.keys(games);
    return keys[Math.floor(keys.length * Math.random())];
}
// const canvasImageCache = {};
function canvas_image(options){
    const src = options.img.src;
    const path = "/resources" + src.split("/resources")[1];
    // if(canvasImageCache[path])return canvasImageCache[path];

    const canvas = document.createElement('canvas');
    const img = new Image();
    img.onload = function(){
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img,0,0);
        // canvasImageCache[path] = canvas;
        options.inserts.forEach(insert=>{
            ctx.drawImage(insert.canvas, insert.x, insert.y);
        })
    }
    img.src = path;
    return canvas;
}
function canvas_arcadeBanner(options) {
    const canvas = document.createElement('canvas');
    canvas.width = options.w;
    canvas.height = options.h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#151515';
    ctx.fillRect(0,0,options.w,options.h);
    return canvas;
}
function canvas_arcadeControls(options) {
    const canvas = document.createElement('canvas');
    canvas.width = options.w;
    canvas.height = options.h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#151515';
    ctx.fillRect(0,0,options.w,options.h);
    return canvas;
}
function canvas_arcadeFront(options) {
    const canvas = document.createElement('canvas');
    canvas.width = options.w;
    canvas.height = options.h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#151515';
    ctx.fillRect(0,0,options.w,options.h);
    return canvas;
}
function canvas_arcadeSide(options) {
    const canvas = document.createElement('canvas');
    canvas.width = options.w;
    canvas.height = options.h;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#151515';
    ctx.fillRect(0,0,options.w,options.h);
    return canvas;
}
function canvas_bannerText(options){
    const ctx = options.canvas.getContext('2d');
    ctx.font = '20px Arial,sans-serif' ;
    ctx.fillStyle = 'white' ;
    ctx.textBaseline = "hanging";
    let fontSize = options.fontSize;
    ctx.font = `${fontSize}px Arial`;
    let textWidth = ctx.measureText(options.text).width;
    let safety = 0;
    while(textWidth > options.w && safety < 100 && fontSize > 1){
        safety++;
        fontSize--;
        ctx.font = `${fontSize}px Arial`;
        textWidth = ctx.measureText(options.text).width;
    }
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
        options.text,
        (options.x + (options.w/2)),
        (options.y + (options.h/2))
    );
    return options.canvas;
}