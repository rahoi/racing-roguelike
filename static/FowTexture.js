import mapData from "./MapData.js"

let texture = {
    createCamera: function(scene, vision) {
        this.scene = scene
        this.vision = vision
        scene.cameras.main.setBounds(0, 0, mapData.mapWidth * mapData.tileDimension, mapData.mapHeight * mapData.tileDimension);
        scene.cameras.main.startFollow(vision, true, 0.07, 0.07);
        scene.cameras.main.setZoom(1.2);
    },
    mapTexture: function(scene, map) {
        this.scene = scene
        this.map = map
       
        const textureConfig = { 
            width: mapData.mapWidth * mapData.tileDimension,  //The width of the RenderTexture
            height: mapData.mapHeight * mapData.tileDimension  //The height of the RenderTexture
        }
        const tileset = map.addTilesetImage(mapData.tileKey)
        this.roadLayer = map.createLayer(0, tileset, 0, 0)

        const rt = scene.make.renderTexture(textureConfig, true)  //true=add this Game Object to the Scene
        rt.fill(0x000000)
        rt.setAlpha(0.8)

        //draw the roadLayer into the render texture
        rt.draw(scene.roadLayer)
        return rt;
    },
    carMask(scene, rt, car){
        this.scene = scene
        this.rt = rt
        this.car = car
        
        const carSurrounding = scene.make.graphics();
        carSurrounding.fillStyle(0xffffff);
        carSurrounding.beginPath();
        carSurrounding.arc(0, 0, 100, 0, Math.PI *2);
        carSurrounding.fillPath();

        rt.mask = new Phaser.Display.Masks.BitmapMask(scene, carSurrounding)
        rt.mask.invertAlpha = true

        return carSurrounding;
    },
    updateCarMask(carSurrounding, car){
        this.carSurrounding = carSurrounding
        this.car = car
        if (carSurrounding){
            carSurrounding.x = car.posX
            carSurrounding.y = car.posY
        }
    }

}
export default texture