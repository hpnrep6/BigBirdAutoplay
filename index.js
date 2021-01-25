import * as z0 from './z0/z0.js';
import { TextureManager } from './z0/graphics/texturemanager.js';
import { Scene } from './z0/tree/scene.js';
import { getMouseX, getMouseY, isMouseDown } from './z0/input/mouse.js';
import { Sprite2D } from './z0/graphics/sprite2d.js';
import { ShaderSprite2D } from './z0/graphics/shadersprite2d.js';
import { AudioManager } from './z0/audio/audiomanager.js';
import { Kali } from './autoplay/fractal.js';

let canvas = document.querySelector('canvas');

z0._init(canvas);

export class Main extends Scene {
    static bigBird;
    static image;
    static canvas;

    mouseX;
    mouseY;
    static interacted = false;

    tlX = 0; 
    tlY = 1;
    scale = 2;
    rot = 0;

    constructor() {
        super(450);
    }

    _start() {
        if(!Main.loaded) {
            Main.canvas = canvas;

            let bird = loadImage('autoplay/music/bigbird.png');

            Promise.all([bird]).then( (loaded) => {

                Main.bigBird = AudioManager.createAudio('autoplay/music/big_bird.mp3');

                Main.image = TextureManager.addTexture(loaded[0]);

                this.bkg = new Sprite2D(null, Main.image, canvas.width / 2, canvas.height / 2, canvas.width, canvas.height, 0, 0);

                this.init();

                z0._startUpdates();
            });
        } else {
            this.init();
        }
    }
    
    init() {
        this.mouseX = getMouseX();
        this.mouseY = getMouseY();

        this.kali = new Kali();
        this.sprite = new ShaderSprite2D (
            null, this.kali, canvas.width / 2, canvas.height / 2, canvas.width, canvas.height, 0, 1
        );

    }

    _update(delta) {

        if(isMouseDown()) {
            Main.interacted = true;
        }

        this.resetDimensions(delta);

        this.kali.update(this.tlX, this.tlY, this.scale, this.rot);
        this.tlX = -(getMouseX() - canvas.width / 2) / 1000;
        this.tlY = (getMouseY() + canvas.height / 2) / 1000;


        if(!Main.interacted) return;


        if(this.mouseX !== getMouseX() || this.mouseY !== getMouseY()) {
            this.mouseX = getMouseX();
            this.mouseY = getMouseY();
            AudioManager.playBurst(Main.bigBird);
        }
    }

    resetDimensions(delta) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        this.sprite.setWidth(canvas.width);
        this.sprite.setHeight(canvas.height);
        this.sprite.setLoc(canvas.width / 2, canvas.height / 2);

        this.bkg.setWidth(canvas.width);
        this.bkg.setHeight(canvas.height);
        this.bkg.setLoc(canvas.width / 2, canvas.height / 2);

        //this.sprite.setVisible(false)
    }
}

let main = z0.getTree().addScene(new Main())
z0.getTree().setActiveScene(main);

function loadImage(url) {
    return new Promise((res, rej) => {
        let image = new Image();
        image.addEventListener('load', () => {
            res(image);
        });
        image.addEventListener('error', () => {
            rej();
        })
        image.src = url;
    })
}

window.onkeydown = () => {
    Main.interacted = true;
}