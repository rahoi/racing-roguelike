import Phaser from 'phaser'

export default class GameUI extends Phaser.Scene {

	sceneEvents: Phaser.Events.EventEmitter;
    hearts: Phaser.GameObjects.Group

	constructor() {
		super({ key: 'game-ui' })
        this.sceneEvents = new Phaser.Events.EventEmitter();
	}

	create() {
		this.add.image(6, 26, 'treasure', 'coin_anim_f0.png')
		const coinsLabel = this.add.text(12, 20, '0', { fontSize: '14'})

		this.sceneEvents.on('player-coins', (coins: number) => {
			coinsLabel.text = coins.toLocaleString()
		})

		this.hearts = this.add.group({classType: Phaser.GameObjects.Image})

		this.hearts.createMultiple({
			key: 'ui-heart-full',
			setXY: {
				x: 10,
				y: 10,
				stepX: 16
			},
			quantity: 5
		})


	}
}