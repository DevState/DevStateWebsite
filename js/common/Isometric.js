/**
 * Created by sakri on 25-10-13.
 */

(function (window){

    //=========================::ABSTRACT ISOMETRIC SPACE::============================

    var AbstractIsometricSpace = function(stageWidth, stageHeight, width, height, depth) {
        //console.log("AbstractIsometricSpace.constructor()",stageWidth, stageHeight, width, height, depth);
        this.frontLeftTop = new SimpleGeometry.Point();
        this.frontLeftBottom = new SimpleGeometry.Point();
        this.backLeftTop = new SimpleGeometry.Point();
        this.backLeftBottom = new SimpleGeometry.Point();
        this.frontRightTop = new SimpleGeometry.Point();
        this.frontRightBottom = new SimpleGeometry.Point();
        this.backRightTop = new SimpleGeometry.Point();
        this.backRightBottom = new SimpleGeometry.Point();
        this.stageWidth = stageWidth;
        this.stageHeight = stageHeight;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.updatePoints();
    };

    AbstractIsometricSpace.prototype.updateStage = function (stageWidth, stageHeight) {
        this.stageWidth = stageWidth;
        this.stageHeight = stageHeight;
        this.updatePoints();
    };

    AbstractIsometricSpace.prototype.updateSpaceContainer = function (width, height, depth) {
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.updatePoints();
    };

    AbstractIsometricSpace.prototype.updatePoints = function () {
        console.error("AbstractIsometricSpace.updatePoints() ERROR : subclasses must override this method");
    };

    //only used to for calculation in the project method
    AbstractIsometricSpace.prototype.frontLeft = new SimpleGeometry.Point();
    AbstractIsometricSpace.prototype.backLeft = new SimpleGeometry.Point();
    AbstractIsometricSpace.prototype.frontRight = new SimpleGeometry.Point();
    AbstractIsometricSpace.prototype.backRight = new SimpleGeometry.Point();
    AbstractIsometricSpace.prototype.leftZ = new SimpleGeometry.Point();
    AbstractIsometricSpace.prototype.rightZ = new SimpleGeometry.Point();

    AbstractIsometricSpace.prototype.project = function (point3d, point) {
        //console.log("AbstractIsometricSpace.project() point3d:" + point3d + " , point : " + point);
        this.frontLeft.x = this.frontLeftBottom.x;
        this.frontLeft.y = SimpleGeometry.interpolate(point3d.y, this.frontLeftBottom.y, this.frontLeftTop.y);
        //console.log("\tfrontLeft:" + this.frontLeft);
        this.backLeft.x = this.backLeftBottom.x;
        this.backLeft.y = SimpleGeometry.interpolate(point3d.y, this.backLeftBottom.y, this.backLeftTop.y);
        //console.log("\tthis.backLeft:" + this.backLeft);
        this.frontRight.x = this.frontRightBottom.x;
        this.frontRight.y = SimpleGeometry.interpolate(point3d.y, this.frontRightBottom.y, this.frontRightTop.y);
        //console.log("\tthis.frontRight:" + this.frontRight);
        this.backRight.x = this.backRightBottom.x;
        this.backRight.y = SimpleGeometry.interpolate(point3d.y, this.backRightBottom.y, this.backRightTop.y);
        //console.log("\tthis.backRight:" + this.backRight);
        this.leftZ.x = SimpleGeometry.interpolate(point3d.z, this.frontLeft.x, this.backLeft.x);
        this.leftZ.y = SimpleGeometry.interpolate(point3d.z, this.frontLeft.y, this.backLeft.y);
        //console.log("\tthis.leftZ:" + this.leftZ);
        this.rightZ.x = SimpleGeometry.interpolate(point3d.z, this.frontRight.x, this.backRight.x);
        this.rightZ.y = SimpleGeometry.interpolate(point3d.z, this.frontRight.y, this.backRight.y);
        //console.log("\tthis.rightZ:" + this.rightZ);
        point.x = SimpleGeometry.interpolate(point3d.x, this.leftZ.x, this.rightZ.x);
        point.y = SimpleGeometry.interpolate(point3d.x, this.leftZ.y, this.rightZ.y);
        //console.log("\tpoint:" + point);
    };

    AbstractIsometricSpace.prototype.renderWireframe = function (context, strokeStyle) {
        context.strokeStyle = strokeStyle==undefined ?  SimpleGeometry.getRgbaStyleString(0xFF,0x00,0x00,.3) : strokeStyle;
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(this.frontLeftTop.x, this.frontLeftTop.y);
        context.lineTo(this.frontLeftBottom.x, this.frontLeftBottom.y);
        context.lineTo(this.backLeftBottom.x, this.backLeftBottom.y);
        context.lineTo(this.backLeftTop.x, this.backLeftTop.y);
        context.lineTo(this.frontLeftTop.x, this.frontLeftTop.y);
        context.closePath();
        context.stroke();
        context.beginPath();
        context.moveTo(this.frontRightTop.x, this.frontRightTop.y);
        context.lineTo(this.frontRightBottom.x, this.frontRightBottom.y);
        context.lineTo(this.backRightBottom.x, this.backRightBottom.y);
        context.lineTo(this.backRightTop.x, this.backRightTop.y);
        context.lineTo(this.frontRightTop.x, this.frontRightTop.y);
        context.stroke();
        context.closePath();
        context.moveTo(this.backLeftTop.x,this.backLeftTop.y);
        context.lineTo(this.backRightTop.x,this.backRightTop.y);
        context.stroke();
        context.moveTo(this.backLeftBottom.x,this.backLeftBottom.y);
        context.lineTo(this.backRightBottom.x,this.backRightBottom.y);
        context.stroke();
        context.moveTo(this.frontLeftTop.x,this.frontLeftTop.y);
        context.lineTo(this.frontRightTop.x,this.frontRightTop.y);
        context.stroke();
        context.moveTo(this.frontLeftBottom.x,this.frontLeftBottom.y);
        context.lineTo(this.frontRightBottom.x,this.frontRightBottom.y);
        context.stroke();
    };

    window.AbstractIsometricSpace = AbstractIsometricSpace;

    //=========================::ISOMETRIC SPACE LEFT::============================

    var IsometricSpaceLeft = function (stageWidth, stageHeight, width, height, depth) {
        AbstractIsometricSpace.call(this, stageWidth, stageHeight, width, height, depth); //call super constructor.
        //console.log("IsometricSpaceLeft constructor", stageWidth, stageHeight, width, height, depth);
    };

    //subclass extends superclass
    IsometricSpaceLeft.prototype = Object.create(AbstractIsometricSpace.prototype);
    IsometricSpaceLeft.prototype.constructor = AbstractIsometricSpace;

    IsometricSpaceLeft.prototype.updatePoints = function () {
        var middle = SimpleGeometry.map(this.depth, 0, (this.width + this.depth), 0, this.stageWidth);
        var isometricFrontLength = -middle / Math.cos(SimpleGeometry.degreesToRadians(150));
        var isometricMappingUnit = SimpleGeometry.map(1, 0, this.depth, 0, isometricFrontLength);
        var isometricHeightLength = isometricMappingUnit * this.height;
        var isometricSideLength = isometricMappingUnit * this.width;
        this.backLeftTop.x = middle;
        this.backLeftTop.y = 0;
        this.backLeftBottom.x = middle;
        this.backLeftBottom.y = isometricHeightLength;
        this.frontLeftTop.x = 0;
        this.frontLeftTop.y = isometricFrontLength * Math.sin(SimpleGeometry.degreesToRadians(150));
        this.frontLeftBottom.x = 0;
        this.frontLeftBottom.y = this.frontLeftTop.y + isometricHeightLength;
        this.backRightTop.x = middle + isometricSideLength * Math.cos(SimpleGeometry.degreesToRadians(30));
        this.backRightTop.y = isometricSideLength * Math.sin(SimpleGeometry.degreesToRadians(30));
        this.backRightBottom.x = this.backRightTop.x;
        this.backRightBottom.y = this.backRightTop.y + isometricHeightLength;
        this.frontRightTop.x = isometricSideLength * Math.cos(SimpleGeometry.degreesToRadians(30));
        this.frontRightTop.y = this.frontLeftTop.y + isometricSideLength * Math.sin(SimpleGeometry.degreesToRadians(30));
        this.frontRightBottom.x = this.frontRightTop.x;
        this.frontRightBottom.y = this.frontRightTop.y + isometricHeightLength;
    };

    window.IsometricSpaceLeft = IsometricSpaceLeft;




    //=========================::ISOMETRIC PLANE::============================

    var IsometricPlane = function(context, space, pointA, pointB, pointC, pointD) {
        if (typeof pointA === "undefined") { pointA = null; }
        if (typeof pointB === "undefined") { pointB = null; }
        this.lineWeight = 1;
        this.lineColor = "#000000";
        this.lineAlpha = 1;
        this.fillAlpha = 1;
        this.context = context;
        this.space = space;
        this.pointA = pointA ? pointA : new SimpleGeometry.Point3d();
        this.pointB = pointB ? pointB : new SimpleGeometry.Point3d();
        this.pointC = pointC ? pointC : new SimpleGeometry.Point3d();
        this.pointD = pointD ? pointD : new SimpleGeometry.Point3d();
        this.points = [this.pointA, this.pointB, this.pointC, this.pointD];
    };


    IsometricPlane.prototype.setStyles = function (fillColor, fillAlpha, lineColor, lineWeight, lineAlpha) {
        if (typeof fillAlpha === "undefined") { fillAlpha = 1; }
        if (typeof lineColor === "undefined") { lineColor = "#000000"; }
        if (typeof lineWeight === "undefined") { lineWeight = 1; }
        if (typeof lineAlpha === "undefined") { lineAlpha = 1; }
        this.fillColor = fillColor;
        this.fillAlpha = fillAlpha;
        this.lineColor = lineColor;
        this.lineWeight = lineWeight;
        this.lineAlpha = lineAlpha;
    };

    IsometricPlane.renderPoint = new SimpleGeometry.Point();//only used inside render(), optimization rather than creating a local variable everytime

    IsometricPlane.prototype.render = function () {
        this.prepareRender();

        this.context.beginPath();
        for(var i=0;i<4;i++){
            this.space.project(this.points[i], IsometricPlane.renderPoint);
            //console.log("\tIsometricPlane.renderPoint : " + IsometricPlane.renderPoint);
            if(i==0){
                this.context.moveTo(IsometricPlane.renderPoint.x, IsometricPlane.renderPoint.y);
            }else{
                this.context.lineTo(IsometricPlane.renderPoint.x, IsometricPlane.renderPoint.y);
            }
        }
        this.context.closePath();
        this.context.fill();
        this.context.stroke();
    };

    IsometricPlane.prototype.prepareRender = function () {
        if(this.fillAlpha > 0) {
            this.context.fillStyle = this.fillColor;
        }
        if(this.lineAlpha > 0) {
            this.context.strokeStyle = this.lineColor;
            this.context.lineWidth = this.lineWeight;
        }
    };

    window.IsometricPlane = IsometricPlane;


    //=========================::ISOMETRIC SQUARE::============================

    var IsometricSquare = function(context, space, x, y, z, width, height, depth){
        this.context = context;
        this.space = space;
        this.x = x;
        this.y = y;
        this.z = z;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.planeLeft = new IsometricPlane(context, space);
        this.planeRight = new IsometricPlane(context, space);
        this.planeTop = new IsometricPlane(context, space);
        this.updatePlanes();
    };

    IsometricSquare.prototype.updatePlanes = function(){
        this.planeLeft.pointA.updateValues(this.x, this.y, this.z);
        this.planeLeft.pointB.updateValues(this.x+this.width, this.y, this.z);
        this.planeLeft.pointC.updateValues(this.x+this.width, this.y+this.height, this.z);
        this.planeLeft.pointD.updateValues(this.x, this.y+this.height, this.z);

        this.planeRight.pointA.updateValues(this.x+this.width, this.y, this.z);
        this.planeRight.pointB.updateValues(this.x+this.width, this.y, this.z+this.depth);
        this.planeRight.pointC.updateValues(this.x+this.width, this.y+this.height, this.z+this.depth);
        this.planeRight.pointD.updateValues(this.x+this.width, this.y+this.height, this.z);

        this.planeTop.pointA.updateValues(this.x, this.y+this.height, this.z);
        this.planeTop.pointB.updateValues(this.x, this.y+this.height, this.z+this.depth);
        this.planeTop.pointC.updateValues(this.x+this.width, this.y+this.height, this.z+this.depth);
        this.planeTop.pointD.updateValues(this.x+this.width, this.y+this.height, this.z);

    }

    IsometricSquare.prototype.setLeftPlaneStyle = function (fillColor, fillAlpha, lineColor, lineWeight, lineAlpha) {
        this.planeLeft.setStyles(fillColor, fillAlpha, lineColor, lineWeight, lineAlpha);
    };
    IsometricSquare.prototype.setRightPlaneStyle = function (fillColor, fillAlpha, lineColor, lineWeight, lineAlpha) {
        this.planeRight.setStyles(fillColor, fillAlpha, lineColor, lineWeight, lineAlpha);
    };
    IsometricSquare.prototype.setTopPlaneStyle = function (fillColor, fillAlpha, lineColor, lineWeight, lineAlpha) {
        this.planeTop.setStyles(fillColor, fillAlpha, lineColor, lineWeight, lineAlpha);
    };

    IsometricSquare.prototype.setHeight = function(value){
        this.height = value;
        this.updatePlanes();
    }

    IsometricSquare.prototype.render = function(){
        this.planeLeft.render();
        this.planeRight.render();
        this.planeTop.render();
    };

    window.IsometricSquare = IsometricSquare;

}(window));