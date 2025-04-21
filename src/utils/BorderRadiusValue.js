export default class BorderRadiusValue{

    constructor(){
        this.brTopLeft = "0";
        this.brTopRight = "0";
        this.brBottomLeft = "0";
        this.brBottomRight = "0";
    }

    all(value){
        this.brTopLeft = value;
        this.brTopRight = value;
        this.brBottomLeft = value;
        this.brBottomRight = value;
        return this;
    }

    topLeft(value){
        this.brTopLeft = value;
        return this;
    }

    topRight(value){
        this.brTopRight = value;
        return this;
    }

    bottomLeft(value){
        this.brBottomLeft = value;
        return this;
    }

    bottomRight(value){
        this.brBottomRight = value;
        return this;
    }

    topSide(value){
        this.topLeft(value);
        this.topRight(value);
        return this
    }

    bottomSide(value){
        this.bottomLeft(value);
        this.bottomRight(value);
        return this;
    }

    leftSide(value){
        this.topLeft(value);
        this.bottomLeft(value);
        return this;
    }

    rightSide(value){
        this.topRight(value);
        this.bottomRight(value);
        return this;
    }

    toString(){
        return `${this.brTopLeft} ${this.brTopRight} ${this.brBottomRight} ${this.brBottomLeft}`;
    }
}