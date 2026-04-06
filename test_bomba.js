import { Bomba } from './src/entities/Bomba.js';

let b = new Bomba(200, 224, []);
b.windowOpen = true;

let mario = {
    x: 275, // center of bomba is 280
    y: 190,
    width: 24,
    height: 32,
    vy: 5,
    state: 'SMALL'
};

const ex = b.goombaX + b.goombaWidth/2;
console.log('Goomba Center X:', ex, 'Mario Center X:', mario.x + mario.width/2);
console.log('Horizontal distance:', Math.abs((mario.x + mario.width/2) - ex));
console.log('Is < 30?', Math.abs((mario.x + mario.width/2) - ex) < 30);
console.log('Mario Bottom:', mario.y + mario.height, 'Goomba Top:', b.goombaY);
console.log('Is Bottom > Top?', mario.y + mario.height > b.goombaY);
console.log('mario.vy:', mario.vy);
