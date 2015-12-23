eash.solid = function (color, alpha) {
    color = def(color, 0x000000);
    alpha = def(alpha, 1.0);
    var co = recolor(color);
    co.a = alpha;

    return " result = vec4(" + _cs(co.r) + ", " + _cs(co.g) + ", " + _cs(co.b) + ", " + _cs(co.a) + ");";
}

// op : { color,dark:'bool enable dark colors',dir:'def camera , vec3' , nrm:'def: normal ' ,c:capacity 0.. 1 ,s:specular,s_p:specular power,s_n:specular_number} 
eash.light = function (op) {
    op = def(op, {});
    op.color = def(op.color, 0xffffff);
    var c_c = recolor(op.color);

    if (def(op.dark, false)) { c_c.r = 1.0 - c_c.r; c_c.g = 1.0 - c_c.g; c_c.b = 1.0 - c_c.b; op.c = def(op.c, 0.5) * -1.0; }

    var k = eash.ind++;
    return [
      "  vec3 dir_" + k + "_ =normalize(" + def(op.pos, "_pos") + "- " + def(op.dir, "camera") + ");",
      "  dir_" + k + "_ =r_x(dir_" + k + "_ ," + _cs(def(op.rx, 0)) + ",vec3(0.0));",
      "  dir_" + k + "_ =r_y(dir_" + k + "_ ," + _cs(def(op.ry, 0)) + ",vec3(0.0));",
      "  dir_" + k + "_ =r_z(dir_" + k + "_ ," + _cs(def(op.rz, 0)) + ",vec3(0.0));",
      "  vec4 p1_" + k + "_ = vec4(" + def(op.dir, "camera") + ",.0);                                ",
      "  vec4 c1_" + k + "_ = vec4(" + _cs(c_c.r) + "," + _cs(c_c.g) + "," + _cs(c_c.b) + ",0.0);                                ",
      "                                                                ",
      "  vec3 vnrm_" + k + "_ = normalize(vec3(world * vec4(" + def(op.nrm, "nrm") + ", 0.0)));          ",
      "  vec3 l_" + k + "_= normalize(p1_" + k + "_.xyz- " + def(op.pos, "_pos") + ");                             ",
      "  vec3 vw_" + k + "_= normalize(camera- " + def(op.pos, "_pos") + ");                             ",
      "  vec3 aw_" + k + "_= normalize(vw_" + k + "_+ l_" + k + "_);                                    ",
      "  float sc_" + k + "_= max(0., dot(vnrm_" + k + "_, aw_" + k + "_));                             ",
      "  sc_" + k + "_= pow(sc_" + k + "_, " + _cs(def(op.s_p, 222)) + ")/" + _cs(def(op.s_n, 0.3)) + " ;                                       ",
      "  float ndl_" + k + "_ = max(0., dot(vnrm_" + k + "_, l_" + k + "_));                            ",
      "  float ls_" + k + "_ = " + (def(op.f, false) ? "" : "1.0-") + "max(0.0,min(1.0, sc_" + k + "_*" + _cs(def(op.s, 0.5)) + "  +ndl_" + k + "_*" + _cs(def(op.p, 0.5)) + ")) ;         ",
      "  result  += vec4( c1_" + k + "_.xyz*(1.0-ls_" + k + "_)*" + _cs(def(op.c, 1.0)) + "  ,1.0-ls_" + k + "_);                    ",
    ].join('\n');
}

eash.flash = function (op) {
    var k = eash.ind++;

    op = def(op, {});

    return [
        '  vec4 _nc_' + k + '_ = vec4(floor(abs(sin(pos.x+pos.y+pos.z+time*0.8)*2.)-0.1)); ',
        ' result = result + _nc_' + k + '_*0.12 ;'
    ].join('\n');

}

eash.phonge = function (n, color, back, dir) {
    dir = def(dir, sundir);

    color = def(color, 0xffffee);
    n = def(n, 2);
    back = def(back, 0x111100);

    return eash.light({ dir: dir, effect: 'pr/' + _cs(n), color: color })
     + eash.light({ dir: nat(dir), effect: 'pr/' + _cs(n), color: back });
}

eash.spec = function (p, n, color, dir) {
    dir = def(dir, sundir);
    color = def(color, 0xffffee);
    n = def(n, 10);
    p = def(p, 90);

    return eash.light({ dir: avg(dir, avg(camera, 'nrm')), effect: intensive(p, n), color: color });
}

eash.multi = function (contents, scaled) {
    var k = eash.ind++;

    var pre = "", ps = ["", "", "", ""], psh = 0.0;
    for (var i = 0; i < contents.length; i++) {

        if (!def(contents[i].r)) contents[i] = { r: contents[i], e: 1.0 };

        pre += " vec4 result_" + k + "_" + i + ";result_" + k + "_" + i + " = vec4(0.,0.,0.,0.); float rp_" + k + "_" + i + " = " + _cs(contents[i].e) + "; \n";
        pre += contents[i].r + "\n";
        pre += " result_" + k + "_" + i + " = result; \n";


        ps[0] += (i == 0 ? "" : " + ") + "result_" + k + "_" + i + ".x*rp_" + k + "_" + i;
        ps[1] += (i == 0 ? "" : " + ") + "result_" + k + "_" + i + ".y*rp_" + k + "_" + i;
        ps[2] += (i == 0 ? "" : " + ") + "result_" + k + "_" + i + ".z*rp_" + k + "_" + i;
        ps[3] += (i == 0 ? "" : " + ") + "result_" + k + "_" + i + ".w*rp_" + k + "_" + i;


        psh += contents[i].e;
    }

    if (def(scaled, 0) == 1) {
        ps[0] = "(" + ps[0] + ")/" + _cs(psh);
        ps[1] = "(" + ps[1] + ")/" + _cs(psh);
        ps[2] = "(" + ps[2] + ")/" + _cs(psh);
        ps[3] = "(" + ps[3] + ")/" + _cs(psh);
    }

    pre += "result = vec4(" + ps[0] + "," + ps[1] + "," + ps[2] + "," + ps[3] + ");";

    return pre;
};

eash.alpha = function () {
    eash.globalOption = def(eash.globalOption, {});
    eash.globalOption.alpha = true;
    return "";
}

eash.back = function (mat) {
    eash.globalOption = def(eash.globalOption, {});
    eash.globalOption.back = true;
    return 'if(' + eash.fback + '){' + def(mat, 'discard') + ';}';
}

eash.front = function (mat) {
    eash.globalOption = def(eash.globalOption, {});
    eash.globalOption.back = true;
    return 'if(' + eash.ffront + '){' + def(mat, 'discard') + ';}';
}

eash.wire = function (p) {
    eash.globalOption = def(eash.globalOption, {});
    eash.globalOption.wire = true;
    return "";
}

eash.range = function (op) {
    var k = eash.ind++;

    op = def(op, {});

    op.pos = def(op.pos, "_pos");
    op.point = def(op.point, "camera");
    op.start = def(op.start, 50.1);
    op.end = def(op.end, 75.1);
    op.mat1 = def(op.mat1, "result = vec4(1.0,0.,0.,1.);");
    op.mat2 = def(op.mat2, "result = vec4(0.0,0.,1.,1.);");

    return [
         "float s_r_dim_" + k + "_ = " + (!def(op.dir) ? " dim(" + op.pos + "," + op.point + ")" : op.dir) + ";",
         "if(s_r_dim_" + k + "_ > " + _cs(op.end) + "){",
             op.mat2,
         "}",
         "else { ",
            op.mat1,
         "   vec4 mat1_" + k + "_; mat1_" + k + "_  = result;",
         "   if(s_r_dim_" + k + "_ > " + _cs(op.start) + "){ ",
              op.mat2,
         "       vec4 mati2_" + k + "_;mati2_" + k + "_ = result;",
         "       float s_r_cp_" + k + "_  = (s_r_dim_" + k + "_ - (" + _cs(op.start) + "))/(" + _cs(op.end) + "-" + _cs(op.start) + ");",
         "       float s_r_c_" + k + "_  = 1.0 - s_r_cp_" + k + "_;",
         "       result = vec4(mat1_" + k + "_.x*s_r_c_" + k + "_+mati2_" + k + "_.x*s_r_cp_" + k + "_,mat1_" + k + "_.y*s_r_c_" + k + "_+mati2_" + k + "_.y*s_r_cp_" + k + "_,mat1_" + k + "_.z*s_r_c_" + k + "_+mati2_" + k + "_.z*s_r_cp_" + k + "_,mat1_" + k + "_.w*s_r_c_" + k + "_+mati2_" + k + "_.w*s_r_cp_" + k + "_);",
         "   }",
         "   else { result = mat1_" + k + "_; }",
         "}"
    ].join('\n');
};

eash.fresnel = function (op) {

    op = def(op, {});

    return eash.light({ f: true, dark: def(op.dark, true), color: def(op.color, 0x000000), c: def(op.c, 0.3), nrm: def(op.nrm, 'nrm'), p: def(op.p, 1.7) });
};

eash.map = function (op) {
    op = def(op, {});
    var k = eash.ind++;

    op.uv = def(op.uv, 'u');

    op.na = def(op.na, 1.0);
    op.n1 = def(op.n1, op.na);
    op.n2 = def(op.n2, op.na);
    op.t1 = def(op.t1, 1.0);
    op.t2 = def(op.t2, 1.0);
    op.rx = def(op.rx, 0.0);
    op.ry = def(op.ry, 0.0);
    op.rz = def(op.rz, 0.0);
    op.n = def(op.n, 0.0);
    op.p1 = def(op.p1, 'y');
    op.p2 = def(op.p2, 'z');
    op.p3 = def(op.p3, 'x');
    op.ignore = def(op.ignore, 'vec4(0.0,0.,0.,1.0);');
    op.ref = '';
    eash.TextureReferences = def(eash.TextureReferences, {});
    if (def(op.ref1)) { eash.TextureReferences.ref1 = op.ref1; op.ref = 'ref1'; }
    if (def(op.ref2)) { eash.TextureReferences.ref2 = op.ref2; op.ref = 'ref2'; }
    if (def(op.ref3)) { eash.TextureReferences.ref3 = op.ref3; op.ref = 'ref3'; }
    if (def(op.ref4)) { eash.TextureReferences.ref4 = op.ref4; op.ref = 'ref4'; }
    if (def(op.ref5)) { eash.TextureReferences.ref5 = op.ref5; op.ref = 'ref5'; }
    if (def(op.ref6)) { eash.TextureReferences.ref6 = op.ref6; op.ref = 'ref6'; }
    if (def(op.ref7)) { eash.TextureReferences.ref7 = op.ref7; op.ref = 'ref7'; }
    if (def(op.ref8)) { eash.TextureReferences.ref8 = op.ref8; op.ref = 'ref8'; }



    op.uv_ind = def(op.uv_ind, -1);
    op.uv_count = def(op.uv_count, 3);

    var iuv = op.uv == "uv" ? "uv" : "u";


    var s =
      op.uv == 'face' ? [
          "vec3 centeri_" + k + "_ = vec3(0.);",
          "vec3 ppo_" + k + "_ = r_z( pos," + _cs(op.rz) + ",centeri_" + k + "_);  ",
          " ppo_" + k + "_ = r_y( ppo_" + k + "_," + _cs(op.ry) + ",centeri_" + k + "_);  ",
          " ppo_" + k + "_ = r_x( ppo_" + k + "_," + _cs(op.rx) + ",centeri_" + k + "_);  ",
          "vec3 nrm_" + k + "_ = r_z( " + def(op.nrm, "_nrm") + "," + _cs(op.rz) + ",centeri_" + k + "_);  ",
          " nrm_" + k + "_ = r_y( nrm_" + k + "_," + _cs(op.ry) + ",centeri_" + k + "_);  ",
          " nrm_" + k + "_ = r_x( nrm_" + k + "_," + _cs(op.rx) + ",centeri_" + k + "_);  ",

      "vec4 color_" + k + "_ = texture2D(" + op.ref + ", vec2((ppo_" + k + "_." + op.p1 + "/" + _cs(op.n1) + ")+" + _cs(op.t1) + ",(ppo_" + k + "_." + op.p2 + "/" + _cs(op.n2) + ")+" + _cs(op.t2) + "));  ",
     def(op.befor) ? " color_" + k + "_ =" + op.effect.befor('pr', "rc_" + k + "_") + ";" : "",

         def(op.effect) ? " color_" + k + "_.x=" + op.effect.replaceAll('pr', "color_" + k + "_.x") + ";" : "",
         def(op.effect) ? " color_" + k + "_.y=" + op.effect.replaceAll('pr', "color_" + k + "_.y") + ";" : "",
         def(op.effect) ? " color_" + k + "_.z=" + op.effect.replaceAll('pr', "color_" + k + "_.z") + ";" : "",

      "if(nrm_" + k + "_." + op.p3 + "  <  " + _cs(op.n) + "  )                                                    ",
      "    color_" + k + "_ = " + op.ignore + ";                                              ",
      " result = color_" + k + "_; "].join("\n") :


      [
          "vec3 centeri_" + k + "_ = vec3(0.);",

          "vec3 ppo_" + k + "_ = r_z( vec3(" + iuv + ".x ," + iuv + ".y ,0.0)," + _cs(op.rz) + ",centeri_" + k + "_);  ",
          " ppo_" + k + "_ = r_y( ppo_" + k + "_," + _cs(op.ry) + ",centeri_" + k + "_);  ",
          " ppo_" + k + "_ = r_x( ppo_" + k + "_," + _cs(op.rx) + ",centeri_" + k + "_);  ",

     "vec4 color_" + k + "_ = texture2D(" + op.ref + ", vec2((ppo_" + k + "_." + op.p3 + "/" + _cs(op.n1) + ")+" + _cs(op.t1) + ",(ppo_" + k + "_." + op.p1 + "/" + _cs(op.n2) + ")+" + _cs(op.t2) + "));  ",

         def(op.effect) ? " color_" + k + "_.x=" + op.effect.replaceAll('pr', "color_" + k + "_.x") + ";" : "",
         def(op.effect) ? " color_" + k + "_.y=" + op.effect.replaceAll('pr', "color_" + k + "_.y") + ";" : "",
         def(op.effect) ? " color_" + k + "_.z=" + op.effect.replaceAll('pr', "color_" + k + "_.z") + ";" : "",

      " result = color_" + k + "_; "].join("\n")

    return s;
}

eash.noise = function (op) {
    op = def(op, {});
    var k = eash.ind++;
    op.pos = def(op.pos, 'pos');
    return [
        'float i5_' + k + '_  =   noise(' + op.pos + ') ;',
       (def(op.effect) ? '  i5_' + k + '_  =  ' + op.effect.replaceAll('pr', 'float i5_' + k + '_') + '  ;' : ''),
        'result = vec4(i5_' + k + '_);'
    ].join('\n');

}

eash.effect = function (op) {
    op = def(op, {});
    var k = eash.ind++;

    return [
    'vec4 res_' + k + '_ = vec4(0.);',

    'res_' + k + '_.x = ' + (def(op.px) ? op.px.replaceAll('px', 'result.x').replaceAll('py', 'result.y').replaceAll('pz', 'result.z').replaceAll('pw', 'result.w') + ';' : ' result.x;'),
    'res_' + k + '_.y = ' + (def(op.py) ? op.py.replaceAll('px', 'result.x').replaceAll('py', 'result.y').replaceAll('pz', 'result.z').replaceAll('pw', 'result.w') + ';' : ' result.y;'),
    'res_' + k + '_.z = ' + (def(op.pz) ? op.pz.replaceAll('px', 'result.x').replaceAll('py', 'result.y').replaceAll('pz', 'result.z').replaceAll('pw', 'result.w') + ';' : ' result.z;'),
    'res_' + k + '_.w = ' + (def(op.pw) ? op.pw.replaceAll('px', 'result.x').replaceAll('py', 'result.y').replaceAll('pz', 'result.z').replaceAll('pw', 'result.w') + ';' : ' result.w;'),
    'res_' + k + '_  = ' + (def(op.pr) ? ' vec4(' + op.pr.replaceAll('pr', 'res_' + k + '_.x') + ',' + op.pr.replaceAll('pr', 'res_' + k + '_.y') + ',' + op.pr.replaceAll('pr', 'res_' + k + '_.z') + ',' + op.pr.replaceAll('pr', 'res_' + k + '_.w') + ');' : ' res_' + k + '_*1.0;'),

     'result = res_' + k + '_ ;'
    ].join('\n');
}

eash.reference = function (name , mat) {
    name = def(name, 'ref');
    mat = def(mat, '');

    if (name != 'ref') {
        var k = eash.ind++;

        return 'vec4 res_' + name + '_ = result; ' + mat + " ref = result; result = res_" + name + "_; ";
    }
    else return mat + " ref = result; ";
}
 
eash.replace = function (op) {
    var k = eash.ind++;

    op = def(op, {});
    op.type = def(op.type, red);
    op.mat = def(op.mat, eash.solid(0xff00ff));
    op.area = def(op.area, -0.233);
    op.opacity = def(op.opacity, 0.0);
    op.level = def(op.level, 0.0);
    op.levelCount = def(op.levelCount, 1.0);
    op.levelFill = def(op.levelFill, false);
    op.live = def(op.live, false);


    if (op.live) {
        eash.reference();
    }

    var d = op.area;
    var d2 = op.opacity;
    var d3 = op.level;
    var d4 = op.levelCount;
    var ilg = op.levelFill;

    var lg = " > 0.5 + " + _cs(d) + " ";
    var lw = " < 0.5 - " + _cs(d) + " ";
    var rr = "((ref.x*" + _cs(d4) + "-" + _cs(d3) + ")>1.0 ? 0. : max(0.,(ref.x*" + _cs(d4) + "-" + _cs(d3) + ")))";
    var rg = "((ref.y*" + _cs(d4) + "-" + _cs(d3) + ")>1.0 ? 0. : max(0.,(ref.y*" + _cs(d4) + "-" + _cs(d3) + ")))";
    var rb = "((ref.z*" + _cs(d4) + "-" + _cs(d3) + ")>1.0 ? 0. : max(0.,(ref.z*" + _cs(d4) + "-" + _cs(d3) + ")))";
    if (ilg) {
        rr = "min(1.0, max(0.,(ref.x*" + _cs(d4) + "-" + _cs(d3) + ")))";
        rg = "min(1.0, max(0.,(ref.y*" + _cs(d4) + "-" + _cs(d3) + ")))";
        rb = "min(1.0, max(0.,(ref.z*" + _cs(d4) + "-" + _cs(d3) + ")))";

    }
    var a = " && ";
    var p = " + ";

    var r = "";
    var cond = "";

    switch (op.type) {
        case white: cond = rr + lg + a + rg + lg + a + rb + lg; r = "(" + rr + p + rg + p + rb + ")/3.0"; break;
        case cyan: cond = rr + lw + a + rg + lg + a + rb + lg; r = "(" + rg + p + rb + ")/2.0 - (" + rr + ")/1.0"; break;
        case pink: cond = rr + lg + a + rg + lw + a + rb + lg; r = "(" + rr + p + rb + ")/2.0 - (" + rg + ")/1.0"; break;
        case yellow: cond = rr + lg + a + rg + lg + a + rb + lw; r = "(" + rr + p + rg + ")/2.0 - (" + rb + ")/1.0"; break;
        case blue: cond = rr + lw + a + rg + lw + a + rb + lg; r = "(" + rb + ")/1.0 - (" + rr + p + rg + ")/2.0"; break;
        case red: cond = rr + lg + a + rg + lw + a + rb + lw; r = "(" + rr + ")/1.0 - (" + rg + p + rb + ")/2.0"; break;
        case green: cond = rr + lw + a + rg + lg + a + rb + lw; r = "(" + rg + ")/1.0 - (" + rr + p + rb + ")/2.0"; break;
        case black: cond = rr + lw + a + rg + lw + a + rb + lw; r = "1.0-(" + rr + p + rg + p + rb + ")/3.0"; break;
    }

    return " if( " + cond + " ) { vec4 oldrs_" + k + "_ = vec4(result);float al_" + k + "_ = max(0.0,min(1.0," + r + "+(" + _cs(d2) + "))); float  l_" + k + "_ =  1.0-al_" + k + "_;  " + op.mat + " result = result*al_" + k + "_ +  oldrs_" + k + "_ * l_" + k + "_;    }";

}

eash.vertex = function (s) {
    eash.globalOption = def(eash.globalOption, {});
    eash.globalOption.vtx = s;
    return "";
}

