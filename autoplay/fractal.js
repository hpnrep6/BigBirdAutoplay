import { ShaderSprite2DRenderer } from '../z0/graphics/shadersprite2d.js';
import { getGL, getCanvas } from '../z0/var.js';
import { TextureManager } from '../z0/graphics/texturemanager.js';
import { Main } from '../index.js';

const kali = `
#define iterations 50.

precision highp float;

varying vec2 vTexCoord;
varying float vAlpha;

uniform sampler2D uSampler;

uniform mediump vec2 uRes;
uniform mediump float uTime;
uniform mediump float uTimeDelta;

uniform vec2 uTranslate;
uniform float uScale;
uniform float uRot;


vec2 rotate(vec2 p, vec2 o, float r) {
    float c = cos(uRot), s = sin(uRot);

    p -= o;

    p = vec2(
        p.x * c - p.y * s,
        p.x * s + p.y * c
    );

    p += o;

    return p;
}

void main() {
    vec2 fragCoord = gl_FragCoord.xy;

    float iTime = uTime / 1000.;

    vec2 uv = (fragCoord/max(uRes.x, uRes.y) - .5) * 2.;

    uv *= max(uScale, 0.);

    uv += uTranslate;

    uv = rotate(uv, vec2(uTranslate), uRot);

    vec2 z;
    
    float iters;
    
    float x = abs(uv.x);
    float y = abs(uv.y);
    float m;

    float cx = -.5 + sin(iTime) *.1 + .2;
    float cy = -.5 + cos(iTime) *.1 + .2;
    
    for(float iter = 0.; iter < iterations; iter++) {
        x = abs(x);
        y = abs(y);
        m = x * x + y * y;// + abs(cy * cx);
        x = x / m + cx;
        y = y / m + cy;
        
        if(m > cos(iTime) * 100.+ 99.) {
            iters = iter;
            break;
        }
        
    }
    
    float num = iters / iterations;
    float p = pow(num, 1.);
    vec3 col;
    col = vec3(sin(iters));
    
    float a = 1.0;

    //if(col.x > .5) {
        a = 1. - col.x;
    //}

    col *= vec3(
        sin(iTime),
        sin(iTime),
        cos(iTime)
    );

    gl_FragColor = vec4(col, a);
}

`

export class Fractal extends ShaderSprite2DRenderer {
    tlX = 0;
    tlY = 0;
    scale = 1;
    rot = 0.7;

    tlLoc;
    scaleLoc;
    uRot;

    constructor(shader) {
        super(getGL(), getCanvas(), null, shader);
        this.scaleLoc = this.getUniformLocation('uScale');
        this.tlLoc = this.getUniformLocation('uTranslate');
        this.rotLoc = this.getULoc('uRot');
    }

    update(tlX, tlY, scale, rot) {
        this.tlX = tlX;
        this.tlY = tlY;
        this.scale = scale;
        this.rot = rot;
    }

    setUniforms(gl) {
        this.setVec2(this.tlLoc, this.tlX, this.tlY);
        this.setFloat(this.scaleLoc, this.scale);
        this.setFloat(this.rotLoc, this.rot);
    }
}

export class Kali extends Fractal {
    constructor() {
        super(kali);
    }

}