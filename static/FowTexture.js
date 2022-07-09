import mapData from "./MapData.js"

let texture = {
    mapTexture: function(scene, map) {
        this.scene = scene
        this.map = map
       
        const textureConfig = { 
            width: scene.scale.width,  //The width of the RenderTexture
            height: scene.scale.height  //The height of the RenderTexture
        }
        const tileset = map.addTilesetImage(mapData.tileKey);
        this.roadLayer = map.createLayer(0, tileset, 0, 0); //.setPipeline('Light2D'); 

        // make a RenderTexture that is the size of the screen
        const rt = scene.make.renderTexture(textureConfig, true)  //true=add this Game Object to the Scene
        rt.fill(0x000000, 1)   // fill it with Yellow
        rt.setAlpha(0.8)
         //draw the floorLayer into it
        rt.draw(scene.roadLayer)

        // set a dark RED tint
        //rt.setTint(0xff0000)
        //rt.setTint(0x0a2948)

        return rt;
    },
    carMask(scene, rt, car){
        this.scene = scene
        this.rt = rt
        this.car = car

        //image to be used as a mask
        // const carSurrounding = scene.make.image({ 
        //     x: car.posX,
        //     y: car.posY,
        //     key: 'carSurrounding',
        //     add: false    //
        // })
        // carSurrounding.scale = 5
    
        // rt.mask = new Phaser.Display.Masks.BitmapMask(scene, carSurrounding)
        // rt.mask.invertAlpha = true
        
        
        const shape = scene.make.graphics();
        shape.fillStyle(0xffffff);

        shape.beginPath();

        shape.moveTo(3, 3);
        shape.arc(0, 0, 100, 0, Math.PI * 2);

        shape.fillPath();

        // rt.mask = shape.createGeometryMask();
        // rt.mask.invertAlpha = true
        // rt.setMask(rt.mask);
        
        rt.mask = new Phaser.Display.Masks.BitmapMask(scene, shape)
        rt.mask.invertAlpha = true

        return shape;
    },
    updateCarMask(shape, car){
        this.shape = shape
        this.car = car
        if (shape){
            shape.x = car.posX
            shape.y = car.posY
        }

    }

}
export default texture