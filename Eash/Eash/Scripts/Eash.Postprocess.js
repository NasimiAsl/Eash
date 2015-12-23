// only for postprocess

eash.cameraShot = function (op) {

    op = def(op, {});
    return "result = vec4(texture2D(textureSampler, " + def(op.uv, 'uv') + ").xyz,1.0) ;"
};

eash.cameraLayer = function (ind, op) {
    op = def(op, {});
    return "result = vec4(texture2D(ref" + ind + ", " + def(op.uv, 'uv') + ").xyz,1.0) ;"
};

eash.filters = {
    //op  {d | dispersion  :default 0.005 , r | radius : default 0.5
    glassWave: function (op) {
        op = def(op, {});
        op.radius = def(op.radius, 0.5);
        op.dispersion = def(op.dispersion, 0.005);

        op.r = def(op.r, op.radius);
        op.d = def(op.d, op.dispersion);

        return "uv+vec2(cos(gl_FragCoord.x*" + _cs(op.r) + "  )+sin(gl_FragCoord.y*" + _cs(op.r) + "  ),cos(gl_FragCoord.y*" + _cs(op.r) + " )+sin(gl_FragCoord.x*" + _cs(op.r) + "))*" + _cs(op.d);
    },

};

//op  {d | dispersion  :default 0.005 , r | radius : default 0.5 
eash.pointedBlur = function (op) {

    op = def(op, {});
    op.l = def(op.l, 0.55);
    op.dir1 = def(op.dir1, "vec2(-" + _cs(op.l) + ",-" + _cs(op.l) + ")");
    op.dir2 = def(op.dir2, "vec2(" + _cs(op.l) + "," + _cs(op.l) + ")");
    op.dir3 = def(op.dir3, "vec2(" + _cs(op.l) + ",-" + _cs(op.l) + ")");
    op.dir4 = def(op.dir4, "vec2(-" + _cs(op.l) + "," + _cs(op.l) + ")");

    op.r = def(op.r, 4.5);
    op.d = def(op.d, 0.001);

    return eash.multi([

            eash.cameraShot({ uv: eash.filters.glassWave(op) }),

            eash.cameraShot({ uv: eash.filters.glassWave(op) + '+ 0.005*' + op.dir1 }),
            eash.cameraShot({ uv: eash.filters.glassWave(op) + '+ 0.01 *' + op.dir1 }),
            eash.cameraShot({ uv: eash.filters.glassWave(op) + '+ 0.015*' + op.dir1 }),
            eash.cameraShot({ uv: eash.filters.glassWave(op) + '+ 0.02 *' + op.dir1 }),
            eash.cameraShot({ uv: eash.filters.glassWave(op) + '+ 0.025*' + op.dir1 }),

            eash.cameraShot({ uv: eash.filters.glassWave(op) + '+ 0.005*' + op.dir2 }),
            eash.cameraShot({ uv: eash.filters.glassWave(op) + '+ 0.01 *' + op.dir2 }),
            eash.cameraShot({ uv: eash.filters.glassWave(op) + '+ 0.015*' + op.dir2 }),
            eash.cameraShot({ uv: eash.filters.glassWave(op) + '+ 0.02 *' + op.dir2 }),
            eash.cameraShot({ uv: eash.filters.glassWave(op) + '+ 0.025*' + op.dir2 }),

            eash.cameraShot({ uv: eash.filters.glassWave(op) + '+ 0.005*' + op.dir3 }),
            eash.cameraShot({ uv: eash.filters.glassWave(op) + '+ 0.01 *' + op.dir3 }),
            eash.cameraShot({ uv: eash.filters.glassWave(op) + '+ 0.015*' + op.dir3 }),
            eash.cameraShot({ uv: eash.filters.glassWave(op) + '+ 0.02 *' + op.dir3 }),
            eash.cameraShot({ uv: eash.filters.glassWave(op) + '+ 0.025*' + op.dir3 }),

            eash.cameraShot({ uv: eash.filters.glassWave(op) + '+ 0.005*' + op.dir4 }),
            eash.cameraShot({ uv: eash.filters.glassWave(op) + '+ 0.01 *' + op.dir4 }),
            eash.cameraShot({ uv: eash.filters.glassWave(op) + '+ 0.015*' + op.dir4 }),
            eash.cameraShot({ uv: eash.filters.glassWave(op) + '+ 0.02 *' + op.dir4 }),
            eash.cameraShot({ uv: eash.filters.glassWave(op) + '+ 0.025*' + op.dir4 }),


    ], true)
};

eash.glowingEdges = function (op) {
    op = def(op, {});




    return eash.cameraShot({ uv: 'uv+ vec2(1.,0.)*0.0015  ' }) +
   'vec4 rs1 = result;' +
   eash.cameraShot({ uv: 'uv+ vec2(1.,1.)*0.0015  ' }) +
   'vec4 rs2 = result;' +
   eash.cameraShot({ uv: 'uv+ vec2(1.,0.)*0.0015  ' }) +
   'vec4 rs3 = result;' +
   eash.cameraShot({ uv: 'uv+ vec2(-1.,-1.)*0.0015  ' }) +
   'vec4 rs4 = result;' +
   eash.cameraShot({ uv: 'uv+ vec2(-1.,0.)*0.0015  ' }) +
   'vec4 rs5 = result;' +
   eash.cameraShot({ uv: 'uv+ vec2(0.,-1.)*0.0015  ' }) +
   'vec4 rs6 = result;' +

   eash.multi([
       ' result = vec4(vec3(pow(length(rs1.xyz-rs2.xyz),1.)),1.0) ;',
       ' result = vec4(vec3(pow(length(rs2.xyz-rs3.xyz),1.)),1.0) ;',
       ' result = vec4(vec3(pow(length(rs3.xyz-rs4.xyz),1.)),1.0) ;',
       ' result = vec4(vec3(pow(length(rs3.xyz-rs4.xyz),1.)),1.0) ;',
       ' result = vec4(vec3(pow(length(rs4.xyz-rs5.xyz),1.)),1.0) ;',
       ' result = vec4(vec3(pow(length(rs5.xyz-rs6.xyz),1.)),1.0) ;',
       ' result = vec4(vec3(pow(length(rs6.xyz-rs1.xyz),1.)),1.0) ;',
   ], true) +
   'vec4 rs7 = result; float s = max(0.,min(1.,pow(length(rs7.xyz),0.8)/0.5));' +

   eash.cameraShot({ uv: 'uv' }) +

   eash.effect({ pr: 'pow(pr,2.0)/0.5' })
               + ' result = vec4(result.xyz*( s),1.0);';

}

eash.ppsMap = function (ind, op) {

    if (ind == 0) {
        return eash.cameraShot(op);
    }
    else { return eash.cameraLayer(ind, op); }

}

eash.directionBlur = function (op) {
    op = def(op, {});

    op.mapInd = def(op.mapInd, 0);
    op.dir = def(op.dir, { x: 1.0, y: 0.0 });

    var mapRef = function (uv) {
        if (op.mapInd == 0) {
            return eash.cameraShot({ uv: uv });
        }
        else { return eash.cameraLayer(op.mapInd, { uv: uv }); }
    }

    op.percent = def(op.percent, 10.);
    op.h1 = def(op.h1, 1.);
    op.h2 = def(op.h2, 3.);

    var a = [];
    var al = 1.0;
    for (var ij = (op.h1) * op.percent / 10000.; ij < op.percent / 100.; ij += (op.h2) * op.percent / 10000.) {
        al -= 0.1;
        al = Math.max(0., al);
        var ji1 = Math.pow(ij, 0.9) / 1.33;
        a.push({ r: def(op.custom) ? op.custom('vec2(' + _cs(op.dir.x) + ',' + _cs(op.dir.y) + ')*' + _cs(ji1), ji1, al) : mapRef(' uv  +vec2(' + _cs(op.dir.x) + ',' + _cs(op.dir.y) + ')*' + _cs(ji1)), e: al });
        a.push({ r: def(op.custom) ? op.custom('-1.*vec2(' + _cs(op.dir.x) + ',' + _cs(op.dir.y) + ')*' + _cs(ji1), ji1, al) : mapRef(' uv  -vec2(' + _cs(op.dir.x) + ',' + _cs(op.dir.y) + ')*' + _cs(ji1)), e: al });
    }

    return eash.multi(a, true);

}