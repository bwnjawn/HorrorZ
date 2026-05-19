import Phaser from 'phaser';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setScale(0.1);

    this.setCollideWorldBounds(true); //Hay q desactivar esto cuando agrandemos el mapa

    // Propiedades de estado
    this.health = 60;
    this.estado = 'PATRULLANDO';
    this.isDead =  false; 
    
    // Propiedades de movimiento
    this.maxSpeed = 100;
    this.maxForce = 10;
    this.acceleration = new Phaser.Math.Vector2(0, 0);
    this.velocity = new Phaser.Math.Vector2(0, 0);

    // Propiedades de patrulla
    this.puntoObjetivo = new Phaser.Math.Vector2(x,y);
    this.tiempoAtascado = 0;
  }

    recibirDaño(cantidad){
        if (this.isDead) return;
        this.health -= cantidad;
        this.setTint(0xff0000);
        this.scene.time.delayedCall(150, () => this.clearTint());
        if (this.health <= 0){
            this.morirEInfectarse();
        }
    }
    morirEInfectarse(){
        this.isDead = true;
        this.setVelocity(0,0);

        this.scene.events.emit('enemigo-muerto', { x: this.x, y: this.y }); 
        this.destroy();
    }
    calcularNuevoPuntoPatrulla(player){
        let puntoValido = false;
        let intentos = 0;
        let maxIntentos = 10;

        while (!puntoValido && intentos < maxIntentos) {
            const angulo = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const distancia = Phaser.Math.Between(140, 400);
            
            const posibleX = player.x + Math.cos(angulo) * distancia;
            const posibleY = player.y + Math.sin(angulo) * distancia;
            let chocaConObstaculo = false;
            // Verificamos si el punto generado está dentro de una zona de obstáculo
            if (this.scene.obstaculos) {
                const obstaculos = this.scene.obstaculos.getChildren();
                for (let i = 0; i < obstaculos.length; i++) {
                    if (obstaculos[i].getBounds().contains(posibleX, posibleY)) {
                        chocaConObstaculo = true;
                        break; 
                    }
                }
            }
            if (!chocaConObstaculo) {
                this.puntoObjetivo.x = posibleX;
                this.puntoObjetivo.y = posibleY;
                puntoValido = true;
            }
            
            intentos++;
        }
    }
    applySeek(target) {
        const desired = new Phaser.Math.Vector2(target.x, target.y).subtract(new Phaser.Math.Vector2(this.x, this.y));
    
        // Si estamos cerca, bajamos la velocidad para no orbitar locamente
        const distance = desired.length();
        desired.normalize();
        if(distance < 50){
            const speed = Phaser.Math.Interpolation.Linear([0, this.maxSpeed],distance/50);
            desired.scale(speed);
        }else{
            desired.scale(this.maxSpeed);
        }

        //Fuerza de correccion
        const steer = desired.subtract(this.velocity);
        if (steer.length() > this.maxForce) steer.normalize().scale(this.maxForce);
        return steer;
    }
    updateBase(time,delta,player){
        if (this.isDead) return;
        this.acceleration.set(0, 0);
        if (!this.body.blocked.none) {
            this.tiempoAtascado += delta;
            if (this.tiempoAtascado >=1000){
                this.calcularNuevoPuntoPatrulla(player);
                this.tiempoAtascado = 0;
            }
        }else{
            this.tiempoAtascado = 0;
            
        }
        const distAlObjetivo = Phaser.Math.Distance.Between(this.x, this.y, this.puntoObjetivo.x, this.puntoObjetivo.y);
        if (distAlObjetivo < 50){
            this.calcularNuevoPuntoPatrulla(player);
        }
        const forceSeek = this.applySeek(this.puntoObjetivo);
        this.acceleration.add(forceSeek);
        this.velocity.add(this.acceleration);

        if (this.velocity.length() > this.maxSpeed) {
            this.velocity.normalize().scale(this.maxSpeed); 
        }
        this.setVelocity(this.velocity.x, this.velocity.y);
        this.setRotation(this.velocity.angle() + Math.PI / 2);

    }
}
