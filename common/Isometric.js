/**
 * Created by sakri on 25-10-13.
 */

var Isometry;
(function (Isometry) {
    var AbstractIsometricSpace = (function () {
        function AbstractIsometricSpace(stageWidth, stageHeight, width, height, depth) {
            this._frontLeftTop = new Geometry.Point();
            this._frontLeftBottom = new Geometry.Point();
            this._backLeftTop = new Geometry.Point();
            this._backLeftBottom = new Geometry.Point();
            this._frontRightTop = new Geometry.Point();
            this._frontRightBottom = new Geometry.Point();
            this._backRightTop = new Geometry.Point();
            this._backRightBottom = new Geometry.Point();
            this._stageWidth = stageWidth;
            this._stageHeight = stageHeight;
            this._width = width;
            this._height = height;
            this._depth = depth;
            this.updatePoints();
        }
        AbstractIsometricSpace.prototype.updateStage = function (stageWidth, stageHeight) {
            this._stageWidth = stageWidth;
            this._stageHeight = stageHeight;
            this.updatePoints();
        };
        AbstractIsometricSpace.prototype.updateSpaceContainer = function (width, height, depth) {
            this._width = width;
            this._height = height;
            this._depth = depth;
            this.updatePoints();
        };
        AbstractIsometricSpace.prototype.updatePoints = function () {
            console.error("AbstractIsometricSpace.updatePoints() ERROR : subclasses must override this method");
        };
        AbstractIsometricSpace.frontLeft = new Geometry.Point();
        AbstractIsometricSpace.backLeft = new Geometry.Point();
        AbstractIsometricSpace.frontRight = new Geometry.Point();
        AbstractIsometricSpace.backRight = new Geometry.Point();
        AbstractIsometricSpace.leftZ = new Geometry.Point();
        AbstractIsometricSpace.rightZ = new Geometry.Point();
        AbstractIsometricSpace.prototype.convert3Dto2D = function (point3D, point) {
            console.log("AbstractIsometricSpace.convert3Dto2D() point3D:" + point3D + " , point : " + point);
            AbstractIsometricSpace.frontLeft.x = this._frontLeftBottom.x;
            AbstractIsometricSpace.frontLeft.y = MathUtil.interpolate(point3D.y, this._frontLeftBottom.y, this._frontLeftTop.y);
            console.log("\tfrontLeft:" + AbstractIsometricSpace.frontLeft);
            AbstractIsometricSpace.backLeft.x = this._backLeftBottom.x;
            AbstractIsometricSpace.backLeft.y = MathUtil.interpolate(point3D.y, this._backLeftBottom.y, this._backLeftTop.y);
            console.log("\tAbstractIsometricSpace.backLeft:" + AbstractIsometricSpace.backLeft);
            AbstractIsometricSpace.frontRight.x = this._frontRightBottom.x;
            AbstractIsometricSpace.frontRight.y = MathUtil.interpolate(point3D.y, this._frontRightBottom.y, this._frontRightTop.y);
            console.log("\tAbstractIsometricSpace.frontRight:" + AbstractIsometricSpace.frontRight);
            AbstractIsometricSpace.backRight.x = this._backRightBottom.x;
            AbstractIsometricSpace.backRight.y = MathUtil.interpolate(point3D.y, this._backRightBottom.y, this._backRightTop.y);
            console.log("\tAbstractIsometricSpace.backRight:" + AbstractIsometricSpace.backRight);
            AbstractIsometricSpace.leftZ.x = MathUtil.interpolate(point3D.z, AbstractIsometricSpace.frontLeft.x, AbstractIsometricSpace.backLeft.x);
            AbstractIsometricSpace.leftZ.y = MathUtil.interpolate(point3D.z, AbstractIsometricSpace.frontLeft.y, AbstractIsometricSpace.backLeft.y);
            console.log("\tAbstractIsometricSpace.leftZ:" + AbstractIsometricSpace.leftZ);
            AbstractIsometricSpace.rightZ.x = MathUtil.interpolate(point3D.z, AbstractIsometricSpace.frontRight.x, AbstractIsometricSpace.backRight.x);
            AbstractIsometricSpace.rightZ.y = MathUtil.interpolate(point3D.z, AbstractIsometricSpace.frontRight.y, AbstractIsometricSpace.backRight.y);
            console.log("\tAbstractIsometricSpace.rightZ:" + AbstractIsometricSpace.rightZ);
            point.x = MathUtil.interpolate(point3D.x, AbstractIsometricSpace.leftZ.x, AbstractIsometricSpace.rightZ.x);
            point.y = MathUtil.interpolate(point3D.x, AbstractIsometricSpace.leftZ.y, AbstractIsometricSpace.rightZ.y);
            console.log("\tpoint:" + point);
        };
        AbstractIsometricSpace.prototype.renderSpaceWireframeToContext = function (context) {
            context.strokeStyle = "#FF0000";
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(this._frontLeftTop.x, this._frontLeftTop.y);
            context.lineTo(this._frontLeftBottom.x, this._frontLeftBottom.y);
            context.lineTo(this._backLeftBottom.x, this._backLeftBottom.y);
            context.lineTo(this._backLeftTop.x, this._backLeftTop.y);
            context.lineTo(this._frontLeftTop.x, this._frontLeftTop.y);
            context.stroke();
            context.closePath();
            context.fillRect(this._frontLeftBottom.x, this._frontLeftBottom.y, 10, 10);
            context.fillRect(this._backLeftBottom.x, this._backLeftBottom.y, 10, 10);
            context.strokeStyle = "#0000FF";
            context.beginPath();
            context.moveTo(this._frontRightTop.x, this._frontRightTop.y);
            context.lineTo(this._frontRightBottom.x, this._frontRightBottom.y);
            context.lineTo(this._backRightBottom.x, this._backRightBottom.y);
            context.lineTo(this._backRightTop.x, this._backRightTop.y);
            context.lineTo(this._frontRightTop.x, this._frontRightTop.y);
            context.stroke();
            context.closePath();
            context.fillRect(this._frontRightBottom.x, this._frontRightBottom.y, 10, 10);
            context.fillRect(this._backRightBottom.x, this._backRightBottom.y, 10, 10);
        };
        return AbstractIsometricSpace;
    })();
    Isometry.AbstractIsometricSpace = AbstractIsometricSpace;
    var IsometricSpaceLeft = (function (_super) {
        __extends(IsometricSpaceLeft, _super);
        function IsometricSpaceLeft(stagewidth, stageHeight, width, height, depth) {
            _super.call(this, stagewidth, stageHeight, width, height, depth);
        }
        IsometricSpaceLeft.prototype.updatePoints = function () {
            var middle = MathUtil.map(this._depth, 0, (this._width + this._depth), 0, this._stageWidth);
            var isometricFrontLength = -middle / Math.cos(MathUtil.degreesToRadians(150));
            var isometricMappingUnit = MathUtil.map(1, 0, this._depth, 0, isometricFrontLength);
            var isometricHeightLength = isometricMappingUnit * this._height;
            var isometricSideLength = isometricMappingUnit * this._width;
            this._backLeftTop.x = middle;
            this._backLeftTop.y = 0;
            this._backLeftBottom.x = middle;
            this._backLeftBottom.y = isometricHeightLength;
            this._frontLeftTop.x = 0;
            this._frontLeftTop.y = isometricFrontLength * Math.sin(MathUtil.degreesToRadians(150));
            this._frontLeftBottom.x = 0;
            this._frontLeftBottom.y = this._frontLeftTop.y + isometricHeightLength;
            this._backRightTop.x = middle + isometricSideLength * Math.cos(MathUtil.degreesToRadians(30));
            this._backRightTop.y = isometricSideLength * Math.sin(MathUtil.degreesToRadians(30));
            this._backRightBottom.x = this._backRightTop.x;
            this._backRightBottom.y = this._backRightTop.y + isometricHeightLength;
            this._frontRightTop.x = isometricSideLength * Math.cos(MathUtil.degreesToRadians(30));
            this._frontRightTop.y = this._frontLeftTop.y + isometricSideLength * Math.sin(MathUtil.degreesToRadians(30));
            this._frontRightBottom.x = this._frontRightTop.x;
            this._frontRightBottom.y = this._frontRightTop.y + isometricHeightLength;
        };
        return IsometricSpaceLeft;
    })(AbstractIsometricSpace);
    Isometry.IsometricSpaceLeft = IsometricSpaceLeft;
})(Isometry || (Isometry = {}));

var IsometricUtil;
(function (IsometricUtil) {
    function copyPoint3DValues(from, to) {
        to.x = from.x;
        to.y = from.y;
        to.z = from.z;
    }
    IsometricUtil.copyPoint3DValues = copyPoint3DValues;
    function setPoint3DValues(point3D, x, y, z) {
        point3D.x = x;
        point3D.y = y;
        point3D.z = z;
    }
    IsometricUtil.setPoint3DValues = setPoint3DValues;
    function vector3DEquals(pointA, pointB) {
        if((!pointA && !pointB) || (pointA && !pointB) || (!pointA && pointB)) {
            return false;
        }
        return (pointA.x == pointB.x && pointA.y == pointB.y && pointA.z == pointB.z);
    }
    IsometricUtil.vector3DEquals = vector3DEquals;
})(IsometricUtil || (IsometricUtil = {}));

var Isometry;
(function (Isometry) {
    var IsometricPlane = (function () {
        function IsometricPlane(context, space, pointA, pointB) {
            if (typeof pointA === "undefined") { pointA = null; }
            if (typeof pointB === "undefined") { pointB = null; }
            this.lineWeight = 1;
            this.lineColor = "#000000";
            this.lineAlpha = 1;
            this.fillAlpha = 1;
            this.context = context;
            this.space = space;
            this.pointA = pointA ? pointA : new Geometry.Point3D();
            this.pointB = pointB ? pointB : new Geometry.Point3D();
        }
        IsometricPlane.renderPoint = new Geometry.Point();
        IsometricPlane.renderPoint3D = new Geometry.Point3D();
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
        IsometricPlane.prototype.render = function () {
            this.context.beginPath();
            console.log("IsometricPlane.render() pointA : " + this.pointA + " , pointB : " + this.pointB);
            this.prepareRender();
            IsometricUtil.copyPoint3DValues(this.pointA, IsometricPlane.renderPoint3D);
            this.space.convert3Dto2D(IsometricPlane.renderPoint3D, IsometricPlane.renderPoint);
            console.log("\tIsometricPlane.renderPoint : " + IsometricPlane.renderPoint);
            this.context.moveTo(IsometricPlane.renderPoint.x, IsometricPlane.renderPoint.y);
            IsometricPlane.renderPoint3D.x = this.pointB.x;
            IsometricPlane.renderPoint3D.z = this.pointB.z;
            this.space.convert3Dto2D(IsometricPlane.renderPoint3D, IsometricPlane.renderPoint);
            console.log("\tIsometricPlane.renderPoint : " + IsometricPlane.renderPoint);
            this.context.lineTo(IsometricPlane.renderPoint.x, IsometricPlane.renderPoint.y);
            IsometricUtil.copyPoint3DValues(this.pointB, IsometricPlane.renderPoint3D);
            this.space.convert3Dto2D(IsometricPlane.renderPoint3D, IsometricPlane.renderPoint);
            console.log("\tIsometricPlane.renderPoint : " + IsometricPlane.renderPoint);
            this.context.lineTo(IsometricPlane.renderPoint.x, IsometricPlane.renderPoint.y);
            IsometricPlane.renderPoint3D.x = this.pointA.x;
            IsometricPlane.renderPoint3D.z = this.pointA.z;
            this.space.convert3Dto2D(IsometricPlane.renderPoint3D, IsometricPlane.renderPoint);
            console.log("\tIsometricPlane.renderPoint : " + IsometricPlane.renderPoint);
            this.context.lineTo(IsometricPlane.renderPoint.x, IsometricPlane.renderPoint.y);
            IsometricUtil.copyPoint3DValues(this.pointA, IsometricPlane.renderPoint3D);
            this.space.convert3Dto2D(IsometricPlane.renderPoint3D, IsometricPlane.renderPoint);
            console.log("\tIsometricPlane.renderPoint : " + IsometricPlane.renderPoint);
            this.context.lineTo(IsometricPlane.renderPoint.x, IsometricPlane.renderPoint.y);
            this.context.fill();
            this.context.stroke();
            this.context.closePath();
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
        return IsometricPlane;
    })();
    Isometry.IsometricPlane = IsometricPlane;
})(Isometry || (Isometry = {}));

var Main = (function () {
    function Main(window, document) {
        console.log("Main constructor");
        this.canvas = document.createElement('canvas');
        document.body.appendChild(this.canvas);
        this.context = this.canvas.getContext("2d");
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.space = new Isometry.IsometricSpaceLeft(500, 400, 400, 300, 400);
        var pointA = new Geometry.Point3D(0.1, 0.1, 0.1);
        var pointB = new Geometry.Point3D(0.1, 0.8, 0.8);
        this.plane = new Isometry.IsometricPlane(this.context, this.space, pointA, pointB);
        this.plane.setStyles("#CCCCAA", 1, "FF0000", 1, 1);
        this.space.renderSpaceWireframeToContext(this.context);
        this.plane.render();
    }
    return Main;
})();
window.onload = function () {
    console.log("window.onload()");
    var main = new Main(window, document);
};
