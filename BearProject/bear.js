"use strict";

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;

var thetaView = vec3(0,0,0);

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis;


// motion variables

var thetaLoc;
var sideBodyPosition = 0;
var prevscratch = 0;
var prevAngle = 0;
var angularPosition = 0;
var scratchPos = 0;
var pos = 0;
var headDif = 0;
var noseDif = 0;
var headPos = 0;
var headPosition;
var prev = 0;

// textures

var texBearBody;
var texBearHead;
var texTreeBody;
var texTreeLeaves;
var texRoad;

var numVertices = 24;
var vertices = [

    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0)
];

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

//  Body parts' id-s
var torsoId = 0;
var headId = 1;
var noseId = 2;
var mouthId = 3;
var leftEarId = 4;
var rightEarId = 5;
var frontBodyId = 6;
var backBodyId = 7;
var rightBodyId = 8;
var leftBodyId = 9;
var tailId = 10;
var leftUpperArmId = 11;
var leftLowerArmId = 12;
var rightUpperArmId = 13;
var rightLowerArmId = 14;
var leftUpperLegId = 15;
var leftLowerLegId = 16;
var rightUpperLegId = 17;
var rightLowerLegId = 18;

// torso parameters
var torsoHeight = 5.0;
var torsoWidth = 2.0;
var torsoDepth = 2.5;
var bodyBackHeight = 0.5;
var bodyBackWidth = 1.8;
var bodyBackDepth = 1.0;
var bodyFrontHeight = 0.5;
var bodyFrontWidth = 1.8;
var bodyFrontDepth = 1.0;
var bodyRightHeight = 4.5;
var bodyRightWidth = 1;
var bodyRightDepth = 0.4;
var bodyLeftHeight = 4.5;
var bodyLeftWidth = 1.0;
var bodyLeftDepth = 0.4;
// arm parameters
var upperArmHeight = 2.2;
var lowerArmHeight = 1.5;
var upperArmWidth = 0.5;
var lowerArmWidth = 0.5;
var upperArmDepth = 1.0;
var lowerArmDepth = 0.5;
// leg parameters
var upperLegWidth = 0.7;
var lowerLegWidth = 0.5;
var lowerLegHeight = 1.5;
var upperLegHeight = 2.2;
var upperLegDepth = 1.0;
var lowerLegDepth = 0.5;
// head parameters
var headHeight = 1.4;
var headWidth = 1.2;
var headDepth = 1.2;
var earHeight = 0.3;
var earWidth = 0.2;
var noseHeight = 0.5;
var noseWidth = 0.6;
var noseDepth = 0.3;
var mouthHeight = 0.4;
var mouthWidth = 0.5;
var mouthDepth = 0.25;
// bear configurations
var numNodes = 19;
var numAngles = 19;
var angle = 0;

// initial angles for separate parts
var theta = [90, 0, 0, 0, 0, 0, 90, 90, 90, 90, 90, 90, 0, 90, 0, 90, 0, 90, 0];



// tail parameters
var tailHeight = 0.4;
var tailWidth = 0.6;

// road parameters
var roadWidth = 10;
var roadHeight = 40;
var roadDepth = 0.5;




// initial angles for separate parts of tree
var thetaTree = [90, 90, 90, 90, 90];


// model view matrix parameters
var eye = vec3(-1, -1, 1);
var at = vec3(0, 0, 0);
var up = vec3(-1, 0, 0);

// projection coefficient
var coeff = 1.5;

// tree parts' id-s
var roadBodyId = 0;
var treeBodyId = 1;
var treeLeavesId = 2;
var treeLeavesMidId = 3;
var treeLeavesTopId = 4;
// tree parameters
var treeBodyWidth = 3.0;
var treeBodyHeight = 15.0;
var treeBodyDepth = 4.0;

var treeLeavesWidth = 8.0;
var treeLeavesHeight = 2.0;
var treeLeavesDepth = 8.0;

var treeLeavesMidHeight = 4.0;
var treeLeavesMidWidth = 12.0;
var treeLeavesMidDepth = 12.0;

var treeLeavesTopHeight = 3.0;
var treeLeavesTopWidth = 9.0;
var treeLeavesTopDepth = 9.0;



var stack = [];
var treeNodes = 5;

var figure = [];
var figureTree = [];


for (var i = 0; i < numNodes; i++) figure[i] = createNode(null, null, null, null);
for (var k = 0; k < treeNodes; k++) figureTree[k] = createNode(null, null, null, null);
// for (var t = 0; t < roadNodes; t++) figureRoad[k] = createNode(null, null, null, null);


var vBuffer;
var modelViewLoc;
var tBuffer;
var pointsArray = [];
var flagRender = false;
//-------------------------------------------

function scale4(a, b, c) {
    var result = mat4();
    result[0] = a;
    result[5] = b;
    result[10] = c;
    return result;
}

//--------------------------------------------


function createNode(transform, render, sibling, child) {
    var node = {
        transform: transform,
        render: render,
        sibling: sibling,   
        child: child,
    }
    return node;
}




function configureTexture(image) {
    var texture;
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
        gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);


    return texture;
}




function initTree(Id) {
    var m = mat4();
    switch (Id) {
        case roadBodyId:
            m = rotate(thetaTree[roadBodyId], vec3(0,1,0));
            m = mult(m, translate(0, 0, -torsoWidth-0.3));
            // m = mult(m, rotate(thetaTree[roadBodyId], vec3(0, 1, 0)));
            figureTree[roadBodyId] = createNode(m, road, null, treeBodyId);
        case treeBodyId:
            m = translate(0, 0.5*roadHeight-1, 0.5*treeBodyHeight);
            m = mult(m, rotate(thetaTree[treeBodyId], vec3(1, 0, 0)));
            figureTree[treeBodyId] = createNode(m, treeBody, null, treeLeavesId);
            break;
        case treeLeavesId:
            m = translate(0, -0.5*treeBodyHeight,0);
            m = mult(m, rotate(thetaTree[treeLeavesId], vec3(0, 1, 0)));
            figureTree[treeLeavesId] = createNode(m, treeLeaves, treeLeavesMidId, null);

            break;
        case treeLeavesMidId:
            m = translate(0, -0.5*treeBodyHeight - 1.5*treeLeavesHeight,0);
            m = mult(m, rotate(thetaTree[treeLeavesMidId], vec3(0, 1, 0)));
            figureTree[treeLeavesMidId] = createNode(m, treeLeavesMid, treeLeavesTopId, null);

            break;
        case treeLeavesTopId:
            m = translate(0, -0.5*treeBodyHeight - 1.5*treeLeavesHeight - 0.8*treeLeavesMidHeight, 0);
            m = mult(m, rotate(thetaTree[treeLeavesTopId], vec3(0, 1, 0)));
            figureTree[treeLeavesTopId] = createNode(m, treeLeavesTop, null, null);

            break;


    }
}


function initNodes(Id, destination = 0, newAngledata = 0, scratchAngle = 0, scratch = 0, resetPos = 0, headAngle = 0, noseAngle = 0, headMove = 0) {

    var m = mat4();

    switch (Id) {

        case torsoId:

            m = rotate(theta[torsoId], vec3(0, 1, 0));
            m = mult(m, translate(0, prev + destination, pos + resetPos));
            m = mult(m, rotate(prevAngle + newAngledata, vec3(-1, 0, 0)));
            m = mult(m, rotate(prevscratch + scratchAngle, vec3(0, 1, 0)));
            // m = mult(m, translate(0, pos + resetPos, 0));
            m = mult(m, translate(0, scratch + scratchPos, 0));
            figure[torsoId] = createNode(m, torso, null, headId);
            prev = prev + destination;
            prevAngle = prevAngle + newAngledata;
            prevscratch = prevscratch + scratchAngle;
            angularPosition = 0.03 * Math.sin(prevAngle * Math.PI / 180);
            scratchPos = scratchPos + scratch;
            pos = pos + resetPos;
            break;



        case headId:
            m = translate(0.0, 0.8*torsoHeight -0.5*headHeight , headMove + headPos);
            m = mult(m, rotate(theta[headId], vec3(0, 1, 0)));
            m = mult(m, rotate(headAngle + headDif, vec3(1, 0, 0)));
            // m = mult(m, translate(0.0, -0.5 * headHeight, 0.0));
            headDif = headAngle + headDif;
            figure[headId] = createNode(m, head, frontBodyId, noseId);
            headPosition = m;
            headPos = headPos + headMove;
            break;

        case noseId:
            m = headPosition;
            m = translate(0.0, 0.5*headHeight, 0.0);
            m = mult(m, rotate(theta[noseId], vec3(0, 1, 0)));
            m = mult(m, translate(0.0, 0.5 * noseHeight, 0.0));
            m = mult(m, rotate(noseAngle + noseDif, vec3(0, 0, -1)));
            noseDif = noseDif + noseAngle;
            figure[noseId] = createNode(m, nose, mouthId, null);
            break;

        case mouthId:
            m = headPosition;
            m = translate(0.0, 0.5 * headHeight, -noseWidth + 0.5 * mouthWidth);
            m = mult(m, rotate(theta[mouthId], vec3(0, 1, 0)));
            m = mult(m, translate(0.0, 0.5 * mouthHeight, 0.0));
            figure[mouthId] = createNode(m, mouth, leftEarId, null);
            break;


        case leftEarId:
            m = headPosition;
            m = translate(-(0.5 * headWidth - earWidth), -0.5*earHeight, 0.3 * headHeight + earHeight);
            m = mult(m, rotate(theta[leftEarId], vec3(0, 1, 0)));
            figure[leftEarId] = createNode(m, leftEar, rightEarId, null);
            break;

        case rightEarId:
            m = headPosition;
            m = translate(0.5 * headWidth - earWidth,  -0.5*earHeight, 0.3 * headHeight + earHeight);
            m = mult(m, rotate(theta[rightEarId], vec3(0, 1, 0)));
            figure[rightEarId] = createNode(m, rightEar, null, null);
            break;

        case frontBodyId:
            m = translate(0.0, 0.5 * torsoHeight, 0.0);
            m = mult(m, rotate(theta[frontBodyId], vec3(0, 1, 0)));
            m = mult(m, translate(0.0, 0.5 * bodyFrontHeight, 0.0));
            figure[frontBodyId] = createNode(m, bodyFront, backBodyId, null);
            break;

        case backBodyId:
            m = translate(0.0, -0.55 * torsoHeight, 0.0);
            m = mult(m, rotate(theta[backBodyId], vec3(0, 1, 0)));
            // m = mult(m, translate(0.0, 0.5 * bodyBackHeight, 0.0));
            figure[backBodyId] = createNode(m, bodyBack, rightBodyId, null);
            break;

        case rightBodyId:
            m = translate(bodyRightWidth,  -0.5*torsoHeight, 0.0);
            m = mult(m, rotate(theta[rightBodyId], vec3(0, 1, 0)));
            m = mult(m, translate(0.0, 0.5 * bodyRightHeight, 0.0));
            figure[rightBodyId] = createNode(m, bodyRight, leftBodyId, null);
            
            break;
        case leftBodyId:
            m = translate(-bodyLeftWidth, -0.5*torsoHeight, 0.0);
            m = mult(m, rotate(theta[leftBodyId], vec3(0, 1, 0)));
            m = mult(m, translate(0.0, 0.5 * bodyLeftHeight, 0.0));
            figure[leftBodyId] = createNode(m, bodyLeft, tailId, null);
            break;


        case tailId:
            m = translate(0.0, -0.5*torsoHeight - 2*tailHeight, 0.5);
            m = mult(m, rotate(theta[tailId], vec3(0, 1, 0)));
            m = mult(m, translate(0.0, 0.5 * tailHeight, 0.0));
            figure[tailId] = createNode(m, tail, leftUpperArmId, null);
            break;

        case leftUpperArmId:
            
            m = translate(-0.4 * (torsoWidth + bodyLeftWidth), torsoHeight - 3.5, -0.1 * upperArmHeight);
            m = mult(m, rotate(theta[leftUpperArmId], vec3(1, 0, 0)));
            figure[leftUpperArmId] = createNode(m, leftUpperArm, rightUpperArmId, leftLowerArmId);
            break;

        case rightUpperArmId:
            m = translate(0.4 * (torsoWidth + bodyRightWidth), torsoHeight - 3.5, -0.1 * upperArmHeight);
            m = mult(m, rotate(theta[rightUpperArmId], vec3(1, 0, 0)));
            figure[rightUpperArmId] = createNode(m, rightUpperArm, leftUpperLegId, rightLowerArmId);
            break;

        case leftUpperLegId:
            m = translate(-0.4 * (torsoWidth + bodyLeftWidth), torsoHeight - 7, -0.1 * upperLegHeight);
            m = mult(m, rotate(theta[leftUpperLegId], vec3(1, 0, 0)));
            figure[leftUpperLegId] = createNode(m, leftUpperLeg, rightUpperLegId, leftLowerLegId);
            break;

        case rightUpperLegId:
            m = translate(0.4 * (torsoWidth + bodyRightWidth), torsoHeight - 7.0, -0.1 * upperLegHeight);
            m = mult(m, rotate(theta[rightUpperLegId], vec3(1, 0, 0)));
            figure[rightUpperLegId] = createNode(m, rightUpperLeg, null, rightLowerLegId);
            break;

        case leftLowerArmId:
            m = translate(0.0, 0.7 * upperArmHeight, -0.2);
            m = mult(m, rotate(theta[leftLowerArmId], vec3(1, 0, 0)));
            figure[leftLowerArmId] = createNode(m, leftLowerArm, null, null);
            break;

        case rightLowerArmId:
            m = translate(0.0, 0.7 * upperArmHeight, -0.2);
            m = mult(m, rotate(theta[rightLowerArmId], vec3(1, 0, 0)));
            figure[rightLowerArmId] = createNode(m, rightLowerArm, null, null);
            break;

        case leftLowerLegId:
            m = translate(0.0, 0.7 * upperLegHeight, -0.2);
            m = mult(m, rotate(theta[leftLowerLegId], vec3(1, 0, 0)));
            figure[leftLowerLegId] = createNode(m, leftLowerLeg, null, null);
            break;

        case rightLowerLegId:
            m = translate(0.0, 0.7 * upperLegHeight, -0.2);
            m = mult(m, rotate(theta[rightLowerLegId], vec3(1, 0, 0)));
            figure[rightLowerLegId] = createNode(m, rightLowerLeg, null, null);
            break;
    }

}

function traverseRoad(Id) {
    if (Id == null) return;
    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
    figure[Id].render();
    if (figure[Id].child != null) traverseRoad(figure[Id].child);
    modelViewMatrix = stack.pop();
    if (figure[Id].sibling != null) traverseRoad(figure[Id].sibling);
}

function traverse(Id) {
    if (Id == null) return;
    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
    figure[Id].render();
    if (figure[Id].child != null) traverse(figure[Id].child);
    modelViewMatrix = stack.pop();
    if (figure[Id].sibling != null) traverse(figure[Id].sibling);
}


function traverseTree(Id) {

    if (Id == null) return;
    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, figureTree[Id].transform);
    figureTree[Id].render();
    if (figureTree[Id].child != null) traverseTree(figureTree[Id].child);
    modelViewMatrix = stack.pop();
    if (figureTree[Id].sibling != null) traverseTree(figureTree[Id].sibling);
}


function road() {

    gl.uniform1i(gl.getUniformLocation(program, "boolRoad"), true);

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0 * roadHeight, -0.5));
    instanceMatrix = mult(instanceMatrix, scale(roadWidth, roadHeight, roadDepth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) {
        
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
    gl.uniform1i(gl.getUniformLocation(program, "boolRoad"), false);
}


function treeBody() {
    gl.uniform1i(gl.getUniformLocation(program, "boolTreeBody"), true);
    instanceMatrix = mult(modelViewMatrix, translate(0, 0.75, 0));
    instanceMatrix = mult(instanceMatrix, scale(treeBodyWidth, treeBodyHeight, treeBodyDepth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));

    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }

    gl.uniform1i(gl.getUniformLocation(program, "boorTreeBody"), false);

}

function treeLeaves() {
    gl.uniform1i(gl.getUniformLocation(program, "boolTreeLeaves"), true);


    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0 * treeLeavesHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(treeLeavesWidth, treeLeavesHeight, treeLeavesWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));

    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);

    }
    gl.uniform1i(gl.getUniformLocation(program, "boolTreeLeaves"), false);

}


function treeLeavesMid() {
    gl.uniform1i(gl.getUniformLocation(program, "boolTreeLeaves"), true);


    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0 * treeLeavesHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(treeLeavesMidWidth, treeLeavesMidHeight, treeLeavesMidDepth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));

    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
    gl.uniform1i(gl.getUniformLocation(program, "boolTreeLeaves"), false);

}


function treeLeavesTop() {
    gl.uniform1i(gl.getUniformLocation(program, "boolTreeLeaves"), true);


    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0 * treeLeavesHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(treeLeavesTopWidth, treeLeavesTopHeight, treeLeavesTopDepth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));

    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
    gl.uniform1i(gl.getUniformLocation(program, "boolTreeLeaves"), false);

}




function torso() {
    gl.uniform1i(gl.getUniformLocation(program, "boolTorso"), true);

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0 * torsoHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(torsoWidth, torsoHeight, torsoDepth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));

    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
    gl.uniform1i(gl.getUniformLocation(program, "boolTorso"), false);

}


function head() {
    gl.uniform1i(gl.getUniformLocation(program, "boolHead"), true);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0 * headHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(headWidth, headHeight, headDepth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));

    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
    gl.uniform1i(gl.getUniformLocation(program, "boolHead"), false);
}


function nose() {
    gl.uniform1i(gl.getUniformLocation(program, "boolHead"), true);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0 * noseHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(noseWidth, noseHeight, noseWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));

    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
    gl.uniform1i(gl.getUniformLocation(program, "boolHead"), false);
}

function mouth() {
    gl.uniform1i(gl.getUniformLocation(program, "boolHead"), true);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0 * noseHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(mouthWidth, mouthHeight, mouthWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));

    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
    gl.uniform1i(gl.getUniformLocation(program, "boolHead"), false);
}

function leftEar() {
    gl.uniform1i(gl.getUniformLocation(program, "boolHead"), true);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0 * earHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(earWidth, earHeight, earWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
    gl.uniform1i(gl.getUniformLocation(program, "boolHead"), false);
}

function rightEar() {
    gl.uniform1i(gl.getUniformLocation(program, "boolHead"), true);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0 * earHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(earWidth, earHeight, earWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));

    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
    gl.uniform1i(gl.getUniformLocation(program, "boolHead"), false);
}


function bodyFront() {
    gl.uniform1i(gl.getUniformLocation(program, "boolTorso"), true);

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0 * bodyFrontHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(bodyFrontWidth, bodyFrontHeight, bodyFrontDepth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));

    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
    gl.uniform1i(gl.getUniformLocation(program, "boolTorso"), false);

}


function bodyBack() {
    gl.uniform1i(gl.getUniformLocation(program, "boolTorso"), true);

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0 * bodyBackHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(bodyBackWidth, bodyBackHeight, bodyBackDepth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));

    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
    gl.uniform1i(gl.getUniformLocation(program, "boolTorso"), false);

}


function bodyRight() {
    gl.uniform1i(gl.getUniformLocation(program, "boolTorso"), true);

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0 * bodyRightHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(bodyRightWidth, bodyRightHeight, bodyRightDepth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));

    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
    gl.uniform1i(gl.getUniformLocation(program, "boolTorso"), false);

}

function bodyLeft() {
    gl.uniform1i(gl.getUniformLocation(program, "boolTorso"), true);

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0 * bodyLeftHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(bodyLeftWidth, bodyLeftHeight, bodyLeftDepth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));

    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
    gl.uniform1i(gl.getUniformLocation(program, "boolTorso"), false);

}





function tail() {
    gl.uniform1i(gl.getUniformLocation(program, "boolTorso"), true);

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0 * tailHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(tailWidth, tailHeight, tailWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));

    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
    gl.uniform1i(gl.getUniformLocation(program, "boolTorso"), false);

}

function leftUpperArm() {
    gl.uniform1i(gl.getUniformLocation(program, "boolTorso"), true);

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0 * upperArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(upperArmWidth, upperArmHeight, upperArmDepth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));

    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
    gl.uniform1i(gl.getUniformLocation(program, "boolTorso"), false);

}

function leftLowerArm() {
    gl.uniform1i(gl.getUniformLocation(program, "boolTorso"), true);

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0 * lowerArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth, lowerArmHeight, lowerArmDepth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
    gl.uniform1i(gl.getUniformLocation(program, "boolTorso"), false);

}

function rightUpperArm() {

    gl.uniform1i(gl.getUniformLocation(program, "boolTorso"), true);

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0 * upperArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(upperArmWidth, upperArmHeight, upperArmDepth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));

    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
    gl.uniform1i(gl.getUniformLocation(program, "boolTorso"), false);
}

function rightLowerArm() {
    gl.uniform1i(gl.getUniformLocation(program, "boolTorso"), true);

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0 * lowerArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth, lowerArmHeight, lowerArmDepth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
    gl.uniform1i(gl.getUniformLocation(program, "boolTorso"), false);


}

function leftUpperLeg() {
    gl.uniform1i(gl.getUniformLocation(program, "boolTorso"), true);

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0 * upperLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegDepth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
    gl.uniform1i(gl.getUniformLocation(program, "boolTorso"), false);

}

function leftLowerLeg() {
    gl.uniform1i(gl.getUniformLocation(program, "boolTorso"), true);

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0 * lowerLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegDepth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));

    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
    gl.uniform1i(gl.getUniformLocation(program, "boolTorso"), false);

}

function rightUpperLeg() {
    gl.uniform1i(gl.getUniformLocation(program, "boolTorso"), true);

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0 * upperLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
    gl.uniform1i(gl.getUniformLocation(program, "boolTorso"), false);

}

function rightLowerLeg() {
    gl.uniform1i(gl.getUniformLocation(program, "boolTorso"), true);

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0 * lowerLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth))
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));

    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4)
    }
    gl.uniform1i(gl.getUniformLocation(program, "boolTorso"), false);

}


var textureArray = [];

function quad(a, b, c, d) {
    pointsArray.push(vertices[a]);
    textureArray.push(texCoord[0]);
    pointsArray.push(vertices[b]);
    textureArray.push(texCoord[1]);
    pointsArray.push(vertices[c]);
    textureArray.push(texCoord[2]);
    pointsArray.push(vertices[d]);
    textureArray.push(texCoord[3]);

}


function cube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

var rotateFlag = false;
window.addEventListener("load", init, false);
function init() {

    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) { alert("WebGL 2.0 isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.65, 0.5, 0.75, 1.0);

    gl.enable(gl.DEPTH_TEST);
    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);

    instanceMatrix = mat4();

    projectionMatrix = ortho(-20.0 * coeff, 20.0 * coeff, -20.0 * coeff, 20.0 * coeff, -20.0 * coeff, 20.0 * coeff);
    modelViewMatrix = lookAt(eye, at, up);




    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

    cube();

    vBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(textureArray), gl.STATIC_DRAW);

    var textureLoc = gl.getAttribLocation(program, "texCoord");
    gl.vertexAttribPointer(textureLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(textureLoc);



    thetaLoc = gl.getUniformLocation(program, "thetaAngles");



    var image = document.getElementById("bearBody");
    texBearBody = configureTexture(image);


    var image2 = document.getElementById("bearHead");
    texBearHead = configureTexture(image2);

    var image3 = document.getElementById("treeLeaves"); 
    texTreeLeaves = configureTexture(image3);

    var image4 = document.getElementById("treeBody");
    texTreeBody = configureTexture(image4);

    var image5 = document.getElementById("road");
    texRoad = configureTexture(image5);

    activateAndBind(gl.TEXTURE0, "texBearBody", texBearBody, 0);
    activateAndBind(gl.TEXTURE1, "texBearHead", texBearHead, 1);
    activateAndBind(gl.TEXTURE2, "texRoad", texRoad, 2);
    activateAndBind(gl.TEXTURE3, "texTreeBody", texTreeBody, 3);
    activateAndBind(gl.TEXTURE4, "texTreeLeaves", texTreeLeaves, 4);


    for (i = 0; i < numNodes; i++) {
        initNodes(i);
    }

    for (var k = 0; k < treeNodes; k++) {
        initTree(k);
    }


    
    
    document.getElementById("Start").onclick = function(){
        flagRender= true;
    };
    document.getElementById("Pause").onclick = function(){
        flagRender = false;
    };
    document.getElementById("Rotate").onclick = function(){
        rotateFlag = true;
    }
    document.getElementById("Pause Rotation").onclick = function(){
        rotateFlag = false;
    }
    document.getElementById("ByX").onclick = function(){
        axis = xAxis;
    }
    document.getElementById("ByY").onclick = function(){
        axis = yAxis;
    }
    document.getElementById("ByZ").onclick = function(){
        axis = zAxis;
    }
    // show()
    render();
}
function activateAndBind(textureNo, texSampler, texture, No){
    gl.activeTexture(textureNo);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(program, texSampler), No);
}
// var show = function () {

//     gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);5
    
//     gl.uniform3fv(thetaLoc, thetaView);
//     if(flagRender) requestAnimationFrame(render);
//     traverse(torsoId);
//     traverseTree(roadBodyId);
//     // traverseRoad(roadBodyId);
    
    
//     console.log(flagRender);
    

// }


var flagDestination = 0;
var initialRightUpperArm = theta[rightUpperArmId];
var initialLeftUpperArm = theta[leftUpperArmId];
var initialRightUpperLeg = theta[rightUpperLegId];
var initialLeftUpperLeg = theta[leftUpperLegId];
var initialRightLowerArm = theta[rightLowerArmId];
var initialLeftLowerArm = theta[leftLowerArmId];
var initialRightLowerLeg = theta[rightLowerLegId];
var initialLeftLowerLeg = theta[leftLowerLegId];
var initialTorso = theta[torsoId];
var torsopos = torsoHeight;
var angle;
var flag = 0;
var moveId = 1;



var forthRightId = 1;
var forthLeftId = 2;
var standUpId = 3;
var turnBackId = 4;
var goBackWardId = 5
var initializeId = 8;
var scratchUpId = 7;
var scratchDownId = 6;
var movementFlag = 0;
var render = function (instMat) {

    gl.clear(gl.COLOR_BUFFER_BIT);



    traverse(torsoId);

    traverseTree(roadBodyId);
    // traverseRoad(roadBodyId);
    if(flagRender){
        if(rotateFlag) thetaView[axis] +=0.5;
        switch (moveId) {
            case forthRightId:
                forthMoveRight();
                moveId = initializeId;
                break;
            case forthLeftId:
                forthMoveLeft();
                moveId = initializeId;
                break;
            case standUpId:
                standUp();
                break;
            case turnBackId:
                turnBack();
                break;
            case scratchDownId:
                scratchBack();
                break;
            case scratchUpId:
                scratchBack2();
                break;
            case goBackWardId:
                goBackWard();
                break;
            case initializeId:
                initializeNodes();
                break;
    
        }
    
    }
    gl.uniform3fv(thetaLoc, thetaView);
    requestAnimationFrame(render);
    
    

}

var delay = function (limit) {

    for (var j = 0; j < limit; j++) { ; }
}

function forthMoveRight() {
    if (initialRightUpperArm - theta[rightUpperArmId] != 30) {
        theta[rightUpperArmId] -= 2;
        theta[rightUpperLegId] -= 2;
        theta[leftUpperArmId] += 2;
        theta[leftUpperLegId] += 2;
        movementFlag = 1;
    }
    else if (theta[rightLowerLegId] - initialRightLowerLeg != 30) {
        theta[rightLowerArmId] += 2;
        theta[rightLowerLegId] += 2;
        theta[leftLowerArmId] += 2;
        theta[leftLowerLegId] += 2;
        movementFlag = 1;
    }
    else if ((theta[rightLowerLegId] - initialRightLowerLeg == 30)) {
        movementFlag = 2;
    }
}
function forthMoveLeft() {
    if (initialLeftUpperArm - theta[leftUpperArmId] != 30) {
        theta[leftUpperArmId] -= 2;
        theta[leftUpperLegId] -= 2;
        theta[rightUpperArmId] += 2;
        theta[rightUpperLegId] += 2;
        movementFlag = 2;
    }
    else if (theta[leftLowerLegId] - initialLeftLowerLeg != 30) {
        theta[leftLowerArmId] += 2;
        theta[leftLowerLegId] += 2;
        theta[rightLowerArmId] += 2;
        theta[rightLowerLegId] += 2;
        movementFlag = 2;
    }
    else if (theta[leftLowerLegId] - initialLeftLowerLeg == 30) {
        movementFlag = 1;
    }
}




function standUp() {
    if (prevAngle != 90) {
        theta[leftUpperLegId] += 1;
        theta[rightUpperLegId] += 1;
        initNodes(leftUpperLegId);
        initNodes(rightUpperLegId);
        initNodes(torsoId, angularPosition, 1, 0, 0, 0.018);
        movementFlag = 3;
    }
    else {
        moveId = turnBackId;

    }
}

var initRight = 180;
var initLeft = 180;
var nextStepFlag = 0;
var strechLegs = 0;
var armsFlag = 0;
function turnBack() {
    if ((initialRightUpperArm - theta[rightUpperArmId] != -90) && (armsFlag == 0)) {
        theta[rightUpperArmId] += 1;
        theta[leftUpperArmId] += 1;
        theta[leftLowerArmId] -=0.5;
        theta[rightLowerArmId] -=0.5;
        // theta[head1Id]+=1;
        // theta[head2Id]+=1;

        initNodes(headId, 0, 0, 0, 0, 0, 1,0,-0.002);
        // initNodes(noseId, 0, 0, 0, 0, 0, 0, 1);
        

    }
    else if ((theta[rightUpperArmId] == 180) && (armsFlag == 0)) {
        armsFlag = 1;
    }
    if (prevscratch != 180 && armsFlag == 1) {
        initNodes(torsoId, 0.01, 0, 1);
        if ((initRight - theta[rightUpperLegId] != 35) && (nextStepFlag == 0)) {
            theta[rightUpperLegId] -= 1;
            theta[leftUpperLegId] += 1;
            theta[rightLowerLegId] += 0.5;
            theta[leftLowerLegId] += 0.5;
        }
        else {
            nextStepFlag = 1;
        }

        if ((initRight - theta[rightUpperLegId] !== -35) && (nextStepFlag == 1)) {
            theta[rightUpperLegId] += 1;
            theta[leftUpperLegId] -= 1;
            theta[rightLowerLegId] -= 0.5;
            theta[leftLowerLegId] -= 0.5;
        }
        else {
            nextStepFlag = 0;
        }
    }
    else {
        if (armsFlag == 1) {
            if (theta[rightUpperLegId] != 180 && strechLegs == 0) {
                theta[rightUpperLegId] += 1;
            }
            else if (theta[rightUpperLegId] == 180 && strechLegs == 0) {
                strechLegs = 1;
            }
            else if (theta[rightLowerLegId] != 0 && strechLegs == 1) {
                theta[rightLowerLegId] -= 0.5;
            }
            else if (theta[rightLowerLegId] == 0 && strechLegs == 1) {
                strechLegs = 2;
            }
            else if (theta[leftUpperLegId] != 180 && strechLegs == 2) {
                theta[leftUpperLegId] -= 1;
            }
            else if (theta[leftUpperLegId] == 180 && strechLegs == 2) {
                strechLegs = 3;
            }
            else if (theta[leftLowerLegId] != 0 && strechLegs == 3) {
                theta[leftLowerLegId] -= 0.5;
            }
            else if (theta[leftLowerLegId] == 0 && strechLegs == 3) {
                moveId = goBackWardId;
            }
        }


    }
    initNodes(rightUpperLegId);
    initNodes(leftUpperLegId);
    initNodes(rightLowerLegId);
    initNodes(leftLowerLegId);
    initNodes(leftUpperArmId);
    initNodes(rightUpperArmId);
    initNodes(rightLowerArmId);
    initNodes(leftLowerArmId);
}


function initializeNodes() {
    if ((prev  < 0.5*roadHeight-torsoHeight - 3)) {
        initNodes(torsoId, 0.1);
        initNodes(rightUpperArmId);
        initNodes(rightUpperLegId);
        initNodes(rightLowerArmId);
        initNodes(rightLowerLegId);
        initNodes(leftUpperArmId);
        initNodes(leftUpperLegId);
        initNodes(leftLowerArmId);
        initNodes(leftLowerLegId);

        switch (movementFlag) {
            case forthRightId:
                moveId = forthRightId;
                break;
            case forthLeftId:
                moveId = forthLeftId;
                break;
        }
    }
    else {
        if (theta[leftUpperLegId] != initialLeftUpperLeg) {
            theta[leftUpperLegId] += 1;
            initNodes(leftUpperLegId);
            theta[leftUpperArmId] += 1;
            initNodes(leftUpperArmId);
        }
        else if (theta[leftLowerLegId] != initialLeftLowerLeg) {
            theta[leftLowerLegId] -= 1;
            initNodes(leftLowerLegId);
            theta[leftLowerArmId] -= 1;
            initNodes(leftLowerArmId);
        }
        else if (theta[rightUpperLegId] != initialRightUpperLeg) {
            theta[rightUpperLegId] -= 1;
            initNodes(rightUpperLegId);
            theta[rightUpperArmId] -= 1;
            initNodes(rightUpperArmId);
        }
        else if (theta[rightLowerLegId] != initialRightLowerLeg) {
            theta[rightLowerLegId] -= 1;
            initNodes(rightLowerLegId);
            theta[rightLowerArmId] -= 1;
            initNodes(rightLowerArmId);
        }
        else {
            moveId = standUpId;
        }

    }
}


function goBackWard(){
    if (prev  < 0.5*roadHeight-torsoHeight+0.7){
        initNodes(torsoId, 0.01);
    }
    else{
        moveId = scratchDownId;
    }
}
function scratchBack() {
    if ((theta[rightUpperLegId] - initialRightUpperLeg) != 20) {
        theta[rightUpperLegId] -= 1;
        theta[rightLowerLegId] += 1;
        theta[leftLowerLegId] += 1;

        theta[leftUpperLegId] -= 1;
        initNodes(rightUpperLegId);
        initNodes(leftUpperLegId);
        initNodes(rightLowerLegId);
        initNodes(leftLowerLegId);

        initNodes(torsoId, 0, 0, 0, -0.01);

    }
    else {
        moveId = scratchUpId;
    }
}
function scratchBack2() {
    if (theta[rightUpperLegId] - initialRightUpperLeg != 90) {
        theta[rightUpperLegId] += 1;
        theta[rightLowerLegId] -= 1;
        theta[leftLowerLegId] -= 1;

        theta[leftUpperLegId] += 1;
        initNodes(rightUpperLegId);
        initNodes(leftUpperLegId);
        initNodes(rightLowerLegId);
        initNodes(leftLowerLegId);

        initNodes(torsoId, 0, 0, 0, 0.01);


    }
    else {
        moveId = scratchDownId;
    }
}
