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