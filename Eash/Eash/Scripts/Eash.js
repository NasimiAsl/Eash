
// requirements
var _null = 'set null anyway';
var red = 0, yellow = 1, white = 2, cyan = 4, blue = 5, pink = 6, black = 7, green = 8;

var cnrm = 'nrm';
var sundir = 'sundir(9.0,18.0,vec3(0.,10.,0.))';

// check def and set default value if is not define
function def(a, d) {
    if (a != undefined && a != null) return (d != undefined && d != null ? a : true);
    else
        if (d != _null)
            return (d != undefined && d != null ? d : false);
    return null;
}

// make float number with integer or float number
function _cs(i) {
    if (i.toString().indexOf('.') == -1) return i + ".";
    return i.toString();
}

var False = false;
var True = true;




var shader_global = function () {
    var d = new Date();

    var d1 = d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDay();
    var d2 = d.getHours() * 10000 + d.getMinutes() * 100 + d.getSeconds();
    var d3 = 0; // weather mode ( sky mode: 0-9, air mode: 0-9 ) , ...
    var d4 = 0; // dynamic parameter

    return { x: d1, y: d2, z: d3, w: d4 };
}

//  main Part

var eash = {
    globalOption: {},
    textureReferences: {},
    ind: 0,
    shdrIndex: 0,
    defShader: function (source, scene) {

        if (def(eash.globalOption)) {

            eash.globalOption.alpha = def(eash.globalOption.alpha, def(eash.globalOption.alpha, false));
            eash.globalOption.back = def(eash.globalOption.back, def(eash.globalOption.back, false));
            eash.globalOption.wire = def(eash.globalOption.wire, def(eash.globalOption.wire, false));
        }

        shaderMaterial = new BABYLON.ShaderMaterial(def(source.name, "eash_shader"), scene, {
            vertexElement: source.shader.vtx,
            fragmentElement: source.shader.frg,
        }, source.shader.u);

        var refname = "";
        function defTexture(txop, name) {

            if (!txop) return;
             
            refname = name;
            var tx; 

            if (txop.dy) {
                var jpegUrl = txop.dy.toDataURL("image/jpeg");
                tx = new BABYLON.Texture(jpegUrl,  scene);
            }

            else if (txop.embed) {
                tx = new BABYLON.Texture(txop.embed,  scene, true,
                                                               true, BABYLON.Texture.BILINEAR_SAMPLINGMODE,
                                                               null, null, txop.embed, true);
            }
            else {
                tx = new BABYLON.Texture(txop,  scene);
            }

            shaderMaterial.setTexture(refname, tx);

            if (txop.r || (txop.rx && txop.ry)) {
                if (txop.r) {
                    txop.rx = txop.r;
                    txop.ry = txop.r;
                }
            }
        }
        function defCubeTexture(txop, name) {

            if (!txop) return;
            refname = name;

            var tx;

            if (txop ) {
                tx = new BABYLON.CubeTexture(txop ,  scene);

                tx.coordinatesMode = BABYLON.Texture.PLANAR_MODE;
            }

            shaderMaterial.setTexture(refname, tx);
            shaderMaterial.setMatrix("refmat", tx.getReflectionTextureMatrix());

        }
        if (def(eash.TextureReferences)) {
            if (def(eash.TextureReferences.ref1)) defTexture(eash.TextureReferences.ref1, "ref1");
            if (def(eash.TextureReferences.ref2)) defTexture(eash.TextureReferences.ref2, "ref2");
            if (def(eash.TextureReferences.ref3)) defTexture(eash.TextureReferences.ref3, "ref3");
            if (def(eash.TextureReferences.ref4)) defTexture(eash.TextureReferences.ref4, "ref4");
            if (def(eash.TextureReferences.ref5)) defTexture(eash.TextureReferences.ref5, "ref5");
            if (def(eash.TextureReferences.ref6)) defTexture(eash.TextureReferences.ref6, "ref6");
            if (def(eash.TextureReferences.ref7)) defTexture(eash.TextureReferences.ref7, "ref7");
            if (def(eash.TextureReferences.ref8)) defTexture(eash.TextureReferences.ref8, "ref8");

            if (def(eash.TextureReferences.refc1)) defCubeTexture(eash.TextureReferences.refc1, "refc1");
            if (def(eash.TextureReferences.refc2)) defCubeTexture(eash.TextureReferences.refc2, "refc2");
            if (def(eash.TextureReferences.refc3)) defCubeTexture(eash.TextureReferences.refc3, "refc3");

        }


        if (!eash.globalOption.alpha) {
            shaderMaterial.needAlphaBlending = function () { return false; };
        }
        else {
            shaderMaterial.needAlphaBlending = function () { return true; };
        };
        if (!eash.globalOption.back) eash.globalOption.back = false;


        shaderMaterial.needAlphaTesting = function () { return true; };

        shaderMaterial.setFloat("time", 0);
        shaderMaterial.setVector3("camera", BABYLON.Vector3.Zero());
        shaderMaterial.setVector2("mouse", BABYLON.Vector2.Zero());
        shaderMaterial.setVector2("screen", BABYLON.Vector2.Zero());

        shaderMaterial.backFaceCulling = !eash.globalOption.back;
        shaderMaterial.wireframe = eash.globalOption.wire;

        shaderMaterial.onCompiled = function () {
        }
        shaderMaterial.onError = function (sender, errors) {
        };
        return shaderMaterial;
    },
    normals: {
        nrm: 'nrm',
        not_nrm: '-1.0*nrm',
        flat: 'normalize(cross(dFdx(pos*-1.),dFdy(pos)))'
    },
    shaderBase: {
        vertex: function (fun, hp, ops, id, sysid) {
            ops = def(ops, [eash.sh_global(), hp, eash.sh_uniform(), eash.sh_varing(), eash.sh_tools(), eash.sh_main_vertex(fun, id, sysid)]);
            return ops.join('\n');
        },
        fragment: function (fun, hp, ops, id, sysid) {
            ops = def(ops, [eash.sh_global(), hp, eash.sh_uniform(), eash.sh_varing(), eash.sh_tools(), eash.sh_main_fragment(fun, id, sysid)]);
            return ops.join('\n');
        },
        shader: function (op) {
            var shaderMaterial;

            if (op && !op.u) {
                op.u = {
                    attributes: ["position", "normal", "uv"],
                    uniforms: ["view", "world", "worldView", "viewProjection", "worldViewProjection"]
                };
            }
            eash.shdrIndex++;

            var vtx = op.vtx;
            var frg = op.frg;

            op.vtx = "sh_v_" + eash.shdrIndex;
            op.frg = "sh_f_" + eash.shdrIndex;

            var vtxElement = document.createElement("Script");
            vtxElement.setAttribute("id", op.vtx);
            vtxElement.setAttribute("type", "x-shader/x-vertex");
            vtxElement.innerHTML = eash.shaderBase.vertex(vtx, op.helper, op.vtxops, def(op.id, 0), def(op.sysId, 0));
            document.getElementById('shaders').appendChild(vtxElement);

            var frgElement = document.createElement("Script");
            frgElement.setAttribute("id", op.frg);
            frgElement.setAttribute("type", "x-shader/x-fragment");
            frgElement.innerHTML = eash.shaderBase.fragment(frg, op.helper, op.frgops, def(op.id, 0), def(op.sysId, 0));
            document.getElementById('shaders').appendChild(frgElement);

            return { shader: op };
        },
    },

    isDebug: false,

    sh_global: function () {
        return [
            "precision highp float;",
            "uniform mat4 worldViewProjection;",
            "uniform mat4 worldView;          ",
            "uniform mat4 world; ",
        ].join('\n');
    },
    sh_uniform: function () {
        return [
            "uniform vec3 camera;",
            "uniform vec2 mouse; ",
            "uniform float time; ",
            "uniform vec2 screen; ",
            "uniform vec3 glb; ",
            "uniform vec3 center; ",
            "uniform samplerCube refc1; ",
            "uniform samplerCube refc2; ",
            "uniform samplerCube refc3; ",
            "uniform sampler2D ref1; ",
            "uniform sampler2D ref2; ",
            "uniform sampler2D ref3; ",
            "uniform sampler2D ref4; ",
            "uniform sampler2D ref5; ",
            "uniform sampler2D ref6; ",
            "uniform sampler2D ref7; ",
            "uniform sampler2D ref8; ",

            "uniform vec3 vrefi; ",
            "uniform mat4 refmat; ",
            "uniform mat4 view;"
        ].join('\n');
    },
    sh_varing: function () {
        return [
            "varying vec3 pos;  ",
            "varying vec3 _pos;  ",
            "varying vec3 nrm;  ",
            "varying vec3 _nrm;  ",
            "varying vec2 u;    ",
            "varying vec2 u2;    ",
            "varying mat4 wvp;  ",
            def(eash.globalOption) ? def(eash.globalOption.hlp_Varying, "") : ""
        ].join('\n');
    },
    sh_tools: function () {
        return [
            "vec3 random3(vec3 c) {   float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));   vec3 r;   r.z = fract(512.0*j); j *= .125;  r.x = fract(512.0*j); j *= .125; r.y = fract(512.0*j);  return r-0.5;  } ",
            "float rand(vec2 co){   return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453); } ",
            "const float F3 =  0.3333333;const float G3 =  0.1666667;",
            "float simplex3d(vec3 p) {   vec3 s = floor(p + dot(p, vec3(F3)));   vec3 x = p - s + dot(s, vec3(G3));  vec3 e = step(vec3(0.0), x - x.yzx);  vec3 i1 = e*(1.0 - e.zxy);  vec3 i2 = 1.0 - e.zxy*(1.0 - e);   vec3 x1 = x - i1 + G3;   vec3 x2 = x - i2 + 2.0*G3;   vec3 x3 = x - 1.0 + 3.0*G3;   vec4 w, d;    w.x = dot(x, x);   w.y = dot(x1, x1);  w.z = dot(x2, x2);  w.w = dot(x3, x3);   w = max(0.6 - w, 0.0);   d.x = dot(random3(s), x);   d.y = dot(random3(s + i1), x1);   d.z = dot(random3(s + i2), x2);  d.w = dot(random3(s + 1.0), x3);  w *= w;   w *= w;  d *= w;   return dot(d, vec4(52.0));     }  ",
            "float noise(vec3 m) {  return   0.5333333*simplex3d(m)   +0.2666667*simplex3d(2.0*m) +0.1333333*simplex3d(4.0*m) +0.0666667*simplex3d(8.0*m);   } ",
            "float dim(vec3 p1 , vec3 p2){   return sqrt((p2.x-p1.x)*(p2.x-p1.x)+(p2.y-p1.y)*(p2.y-p1.y)+(p2.z-p1.z)*(p2.z-p1.z)); }",
            "vec2  rotate_xy(vec2 pr1,vec2  pr2,float alpha) {vec2 pp2 = vec2( pr2.x - pr1.x,   pr2.y - pr1.y );return  vec2( pr1.x + pp2.x * cos(alpha*3.14159265/180.) - pp2.y * sin(alpha*3.14159265/180.),pr1.y + pp2.x * sin(alpha*3.14159265/180.) + pp2.y * cos(alpha*3.14159265/180.));} \n vec3  r_y(vec3 n, float a,vec3 c) {vec3 c1 = vec3( c.x,  c.y,   c.z );c1.x = c1.x;c1.y = c1.z;vec2 p = rotate_xy(vec2(c1.x,c1.y), vec2( n.x,  n.z ), a);n.x = p.x;n.z = p.y;return n; } \n vec3  r_x(vec3 n, float a,vec3 c) {vec3 c1 = vec3( c.x,  c.y,   c.z );c1.x = c1.y;c1.y = c1.z;vec2 p = rotate_xy(vec2(c1.x,c1.y), vec2( n.y,  n.z ), a);n.y = p.x;n.z = p.y;return n; } \n vec3  r_z(vec3 n, float a,vec3 c) {  vec3 c1 = vec3( c.x,  c.y,   c.z );vec2 p = rotate_xy(vec2(c1.x,c1.y), vec2( n.x,  n.y ), a);n.x = p.x;n.y = p.y;return n; }",
            "vec3 sundir(float da,float db,vec3 ps){ float h = floor(floor(glb.y/100.)/100.);float m =     floor(glb.y/100.) - h*100.;float s =      glb.y  - h*10000. -m*100.;float si = s *100./60.;float mi = m*100./60.;float hi = h+mi/100.+si/10000.;float dm = 180./(db-da); vec3  gp = vec3(ps.x,ps.y,ps.z);gp = r_z(gp," + (eash.isDebug ? "time*3.0" : " dm* hi -da*dm -90. ") + ",vec3(0.));gp = r_x(gp,40. ,vec3(0.)); gp.x = gp.x*-1.; gp.z = gp.z*-1.; return gp; }",

        ].join('\n');
    },

    sh_main_vertex: function (content, id, sysid) {
        return [
            "attribute vec3 position; ",
            "attribute vec3 normal;   ",
            "attribute vec2 uv;       ",
            "attribute vec2 uv2;       ",

            "void main(void) { ",
            "   vec4 result; vec4  ref; result = vec4(position.x,position.y,position.z,1.0) ;",
            "   pos = vec3(position.x,position.y,position.z);",
            "   nrm = vec3(normal.x,normal.y,normal.z);",
            "   result = vec4(pos,1.0);",

            content,
            "   ",
             "   gl_Position = worldViewProjection * vec4( result );",
            "   pos = result.xyz;",
            "   _pos = vec3(world * vec4(pos, 1.0));",
            "   _nrm = normalize(vec3(world * vec4(nrm, 0.0)));",
            "   u = uv;",
            "   u2 = uv2;",
             def(eash.globalOption) ? def(eash.globalOption.hlp_Vertex, "") : "",
            "}"
        ].join('\n');
    },

    sh_main_fragment: function (content, id, sysid) {
        return [
               "#extension GL_OES_standard_derivatives : enable",

            "void main(void) { ",
            "   vec4 result;vec4  ref; result = vec4(1.,0.,0.,0.);",
            "   ",
            content,
              "   gl_FragColor = vec4( result );",
            "}"
        ].join('\n');
    },


    shader: function (op, scene) {
        kg = { r: 0.0, g: 0.0, b: .0 };
        var id = 0, sysid = 0;
        aia = 0.0;
        eash.globalOption = def(eash.globalOption, {});

        eash.globalOption.id = id;
        eash.globalOption.sysId = sysid;
        eash.globalOption.cands = [];
        eash.globalOption.vtx = ((def(eash.globalOption) && def(eash.globalOption.vtx)) ? eash.globalOption.vtx : null);
        eash.globalOption.frg = ((def(eash.globalOption) && def(eash.globalOption.frg)) ? eash.globalOption.frg : null);

        var mat = eash.defShader(eash.shaderBase.shader({
            vtx: ((def(eash.globalOption) && def(eash.globalOption.vtx)) ? eash.globalOption.vtx : 'result = vec4(pos ,1.0);'),
            frg: op,
            helper: ''
        }), scene);

        mat.isEashMaterial = true;
        return mat;
    },

};

eash.fback = "!gl_FrontFacing";
eash.ffront = "gl_FrontFacing";
eash.discard = "discard";

// Babylonjs color struct
shcolor = function (p1, p2, p3, p4) {
    var c = {
        r: 0.0,
        g: 0.0,
        b: 0.0,
        a: 0.0
    };

    if (p1 >= 0 && (p3 == null || p3 == undefined) && (p4 == null || p4 == undefined)) { // color | color alpha
        var c1 = Color(p1);

        if (p2 == null || p2 == undefined) p2 = 1.0;

        c.r = c1.r * 1.0;
        c.g = c1.g * 1.0;
        c.b = c1.b * 1.0;
        c.a = p2;

        return c;
    }
    else if (p1.length >= 3) {
        c.r = p1[0] * 1.0;
        c.g = p1[1] * 1.0;
        c.b = p1[2] * 1.0;
        c.a = def(p1[3], 1.0) * 1.0;

        return c;

    }
    else {
        c.r = (p1 == null || p1 == undefined) ? 0 * 1.0 : p1 * 1.0;
        c.g = (p2 == null || p2 == undefined) ? 0 * 1.0 : p2 * 1.0;
        c.b = (p3 == null || p3 == undefined) ? 0 * 1.0 : p3 * 1.0;
        c.a = (p4 == null || p4 == undefined) ? 0 * 1.0 : p4 * 1.0;

        return c;

    }
};
var c = shcolor;

var cs = function (p1, p2, p3, p4) {
    var co = c(p1, p2, p3, p4);

    return {
        r: _cs(co.r),
        g: _cs(co.g),
        b: _cs(co.b),
        a: _cs(co.a),
    }
}

var cs256 = function (p1, p2, p3, p4) {
    var co = c(p1, p2, p3, p4);

    return {
        r: _cs(co.r * 256.),
        g: _cs(co.g * 256.),
        b: _cs(co.b * 256.),
        a: _cs(co.a),
    }
}

var Color = function (color) {

    if (arguments.length === 3) {

        return this.setRGB(arguments[0], arguments[1], arguments[2]);

    }

    return ColorPs.set(color)

};
var recolor = function (zn2, a) {
    var _zn2;
    a = def(a, 1.0);
    if (def(zn2.r) && def(zn2.g) && def(zn2.b))
        _zn2 = cs(zn2.r, zn2.g, zn2.b, a);
    else _zn2 = cs(zn2, a);
    return _zn2;
}

ColorPs = {

    constructor: Color,

    r: 1, g: 1, b: 1,

    set: function (value) {

        if (typeof value === 'number') {

            this.setHex(value);

        } else if (typeof value === 'string') {

            this.setStyle(value);

        }

        return this;

    },

    setHex: function (hex) {

        hex = Math.floor(hex);

        this.r = (hex >> 16 & 255) / 255;
        this.g = (hex >> 8 & 255) / 255;
        this.b = (hex & 255) / 255;

        return this;

    },

    setRGB: function (r, g, b) {

        this.r = r;
        this.g = g;
        this.b = b;

        return this;

    },

    setHSL: function (h, s, l) {

        // h,s,l ranges are in 0.0 - 1.0

        if (s === 0) {

            this.r = this.g = this.b = l;

        } else {

            var hue2rgb = function (p, q, t) {

                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * 6 * (2 / 3 - t);
                return p;

            };

            var p = l <= 0.5 ? l * (1 + s) : l + s - (l * s);
            var q = (2 * l) - p;

            this.r = hue2rgb(q, p, h + 1 / 3);
            this.g = hue2rgb(q, p, h);
            this.b = hue2rgb(q, p, h - 1 / 3);

        }

        return this;

    },

    setStyle: function (style) {

        // rgb(255,0,0)

        if (/^rgb\((\d+), ?(\d+), ?(\d+)\)$/i.test(style)) {

            var color = /^rgb\((\d+), ?(\d+), ?(\d+)\)$/i.exec(style);

            this.r = Math.min(255, parseInt(color[1], 10)) / 255;
            this.g = Math.min(255, parseInt(color[2], 10)) / 255;
            this.b = Math.min(255, parseInt(color[3], 10)) / 255;

            return this;

        }

        // rgb(100%,0%,0%)

        if (/^rgb\((\d+)\%, ?(\d+)\%, ?(\d+)\%\)$/i.test(style)) {

            var color = /^rgb\((\d+)\%, ?(\d+)\%, ?(\d+)\%\)$/i.exec(style);

            this.r = Math.min(100, parseInt(color[1], 10)) / 100;
            this.g = Math.min(100, parseInt(color[2], 10)) / 100;
            this.b = Math.min(100, parseInt(color[3], 10)) / 100;

            return this;

        }

        // #ff0000

        if (/^\#([0-9a-f]{6})$/i.test(style)) {

            var color = /^\#([0-9a-f]{6})$/i.exec(style);

            this.setHex(parseInt(color[1], 16));

            return this;

        }

        // #f00

        if (/^\#([0-9a-f])([0-9a-f])([0-9a-f])$/i.test(style)) {

            var color = /^\#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(style);

            this.setHex(parseInt(color[1] + color[1] + color[2] + color[2] + color[3] + color[3], 16));

            return this;

        }




    },

    copy: function (color) {

        this.r = color.r;
        this.g = color.g;
        this.b = color.b;

        return this;

    },

    copyGammaToLinear: function (color) {

        this.r = color.r * color.r;
        this.g = color.g * color.g;
        this.b = color.b * color.b;

        return this;

    },

    copyLinearToGamma: function (color) {

        this.r = Math.sqrt(color.r);
        this.g = Math.sqrt(color.g);
        this.b = Math.sqrt(color.b);

        return this;

    },

    convertGammaToLinear: function () {

        var r = this.r, g = this.g, b = this.b;

        this.r = r * r;
        this.g = g * g;
        this.b = b * b;

        return this;

    },

    convertLinearToGamma: function () {

        this.r = Math.sqrt(this.r);
        this.g = Math.sqrt(this.g);
        this.b = Math.sqrt(this.b);

        return this;

    },

    getHex: function () {

        return (this.r * 255) << 16 ^ (this.g * 255) << 8 ^ (this.b * 255) << 0;

    },

    getHexString: function () {

        return ('000000' + this.getHex().toString(16)).slice(-6);

    },

    getHSL: function (optionalTarget) {

        // h,s,l ranges are in 0.0 - 1.0

        var hsl = optionalTarget || { h: 0, s: 0, l: 0 };

        var r = this.r, g = this.g, b = this.b;

        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);

        var hue, saturation;
        var lightness = (min + max) / 2.0;

        if (min === max) {

            hue = 0;
            saturation = 0;

        } else {

            var delta = max - min;

            saturation = lightness <= 0.5 ? delta / (max + min) : delta / (2 - max - min);

            switch (max) {

                case r: hue = (g - b) / delta + (g < b ? 6 : 0); break;
                case g: hue = (b - r) / delta + 2; break;
                case b: hue = (r - g) / delta + 4; break;

            }

            hue /= 6;

        }

        hsl.h = hue;
        hsl.s = saturation;
        hsl.l = lightness;

        return hsl;

    },

    getStyle: function () {

        return 'rgb(' + ((this.r * 255) | 0) + ',' + ((this.g * 255) | 0) + ',' + ((this.b * 255) | 0) + ')';

    },

    offsetHSL: function (h, s, l) {

        var hsl = this.getHSL();

        hsl.h += h; hsl.s += s; hsl.l += l;

        this.setHSL(hsl.h, hsl.s, hsl.l);

        return this;

    },

    add: function (color) {

        this.r += color.r;
        this.g += color.g;
        this.b += color.b;

        return this;

    },

    addColors: function (color1, color2) {

        this.r = color1.r + color2.r;
        this.g = color1.g + color2.g;
        this.b = color1.b + color2.b;

        return this;

    },

    addScalar: function (s) {

        this.r += s;
        this.g += s;
        this.b += s;

        return this;

    },

    multiply: function (color) {

        this.r *= color.r;
        this.g *= color.g;
        this.b *= color.b;

        return this;

    },

    multiplyScalar: function (s) {

        this.r *= s;
        this.g *= s;
        this.b *= s;

        return this;

    },

    lerp: function (color, alpha) {

        this.r += (color.r - this.r) * alpha;
        this.g += (color.g - this.g) * alpha;
        this.b += (color.b - this.b) * alpha;

        return this;

    },

    equals: function (c) {

        return (c.r === this.r) && (c.g === this.g) && (c.b === this.b);

    },
    fromArray: function (array) {

        this.r = array[0];
        this.g = array[1];
        this.b = array[2];

        return this;

    },

    toArray: function () {

        return [this.r, this.g, this.b];

    },

    clone: function () {

        return new THREE.Color().setRGB(this.r, this.g, this.b);

    }

};
