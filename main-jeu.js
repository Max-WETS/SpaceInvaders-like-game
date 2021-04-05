window.addEventListener('DOMContentLoaded', grossFonctionDeJeu);


function grossFonctionDeJeu() {

const standAlone = true;
var quitterLeJeu = false;

// début programme
const canvas = document. getElementById('canvas1');
const ctx = canvas.getContext('2d');

canvas.style.width = '900px';
canvas.style.height = '700px';
const cWidth = canvas.width = parseFloat(canvas.style.width);
const cHeight = canvas.height = parseFloat(canvas.style.height);

const fps = 60;
const dessins = false;
const tempsRefroidissement = 0.1; // temps de refroidissement des canons en s
const friction = 0.1;
const vitesseJeu = 4.0;
const debutJeu = Date.now();
const dureeIntro = 10000;
const intervalleApparition = 1000;
const tempsEntreDeuxParties = 3000;
const periodeVagueAsteroides = 20000;
const palierNiveauSuivant = 10;
const scoreVictoire = 30;

//// toutes les images et la plupart des sons ont été conçus par Kenney Vleugels (www.kenney.nl) et téléchargées sur www.OpenGameArt.com ////
// charger les images
const images = {};
// image vaisseau joueur
images.player = new Image();
images.player.src = "./assets/SpaceShooterRedux/PNG/playerShip2_blue.png";
// images propulseur
images.prop1 = new Image(), images.prop2 = new Image(), images.prop3 = new Image();
images.prop1.src = "./assets/SpaceShooterRedux/PNG/Effects/fire08.png";
images.prop2.src = "./assets/SpaceShooterRedux/PNG/Effects/fire09.png";
images.prop3.src = "./assets/SpaceShooterRedux/PNG/Effects/fire10.png";
// images laser
images.laser = new Image();
images.laser.src = "./assets/SpaceShooterRedux/PNG/Lasers/laserBlue07.png";
images.laserOVNI = new Image();
images.laserOVNI.src = "./assets/SpaceShooterRedux/PNG/Lasers/laserGreen05.png";
images.laserOVNI2 = new Image();
images.laserOVNI2.src = "./assets/SpaceShooterRedux/PNG/Lasers/laserRed03.png";
// image impact laser
images.impact = new Image();
images.impact.src = "./assets/SpaceShooterRedux/PNG/Lasers/laserBlue10.png";
// image OVNI
images.OVNI1 = new Image();
images.OVNI1.src = "./assets/SpaceShooterRedux/PNG/ufoGreen.png";
images.OVNI2 = new Image();
images.OVNI2.src = "./assets/SpaceShooterRedux/PNG/ufoRed.png";
// image explosion
images.explosion = new Image();
images.explosion.src = "./assets/Explosion03.png";
// images chiffres score
images.numScores = new Image();
images.numScores.src = "./assets/SpaceShooterRedux/PNG/UI/spritesheet/NumeralsSprite+Operator.png";
var spriteScore = {
    frameWidth: 21,
    frameHeight: 21,
}
// images nombre de vies restantes
images.vie = new Image();
images.vie.src = "./assets/SpaceShooterRedux/PNG/UI/spritesheet/playerLife2_blue.png";
// images astéroïdes
images.asteroidesBig1 = new Image();
images.asteroidesBig1.src = "./assets/SpaceShooterRedux/PNG/Meteors/meteorBrown_big3.png";
images.asteroidesBig2 = new Image();
images.asteroidesBig2.src = "./assets/SpaceShooterRedux/PNG/Meteors/meteorBrown_big4.png";
images.asteroidesSmall1 = new Image();
images.asteroidesSmall1.src = "./assets/SpaceShooterRedux/PNG/Meteors/meteorBrown_med1.png";
images.asteroidesSmall2 = new Image();
images.asteroidesSmall2.src = "./assets/SpaceShooterRedux/PNG/Meteors/meteorBrown_med3.png";
// images bonus bouclier
images.bonusBouclier = new Image();
images.bonusBouclier.src = "./assets/SpaceShooterRedux/PNG/Power-ups/shield_gold.png";
var bonusBouclierDim = {
    frameWidth: 30,
    frameHeight: 30,
};
// spritesheet bouclier
images.spriteBouclier = new Image();
images.spriteBouclier.src = "./assets/SpaceShooterRedux/PNG/Effects/spritesheet/spriteBouclier.png";
var spriteBouclierDim = {
    frameWidth: 135,
    frameHeight: 139,
    frameTiming: 200,
};

//// tous les bruitages qui n'ont pas été conçus par Kenney Vleugels l'ont été par Frank Poth et récupérés depuis sa chaîne YouTube PothOnProgramming (https://www.youtube.com/channel/UCdS3ojA8RL8t1r18Gj1cl6w) ////
// charger les sons
var musiqueDeFond = new Audio("./sounds/PeachesInRegalia.mp3");
var musiqueVictoire = new Audio("./sounds/Ultimate-Victory-WST010901.mp3")
var laserAudio = new Audio("./sounds/laser.m4a");
var explosionAudio = new Audio("./sounds/explode.m4a");
var impactAudio = new Audio("./sounds/hit.m4a");
var propulseurAudio = new Audio("./sounds/thrust.m4a");
var gameOverAudio = new Audio("./sounds/sfx_lose.ogg");
var bouclierActif = new Audio("./sounds/sfx_shieldUp.ogg");
var bouclierDesactive = new Audio("./sounds/sfx_shieldDown.ogg");

// paramètres jeu
var introJeu = true;
var jeuEnCours = false;
var gameOver = false;
var victoire = false;
var tempsFinDePartie = 0;
var score = 0;
var vies = 3;
var niveau = 1;

var etoiles = [];
var asteroides = [];
var OVNIs = [];
var lasersOVNI = [];
var tabBonus = [];
var then = 0;
if (!introJeu) musiqueDeFond.play();

//fonction nombre aléatoire
function random(numbers) {
    return numbers[Math.floor(Math.random()*numbers.length)];
}

// fonction distance entre deux points
function distanceEntrePoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

//// Les modèles mathématiques utilisés pour construire les fonctions de détection de collision entre diverses figures géométriques sont repris de ceux compilés - initialement en Java - sur le site de Jeffrey Thompson: http://www.jeffreythompson.org/collision-detection/license.php ////
// fonction collision entre une ligne et un point
function collLignePoint(x1,y1,x2,y2,px,py) {
    var d1 = distanceEntrePoints(px,py, x1,y1);
    var d2 = distanceEntrePoints(px,py, x2,y2);

    var lineLen = distanceEntrePoints(x1,y1, x2,y2);

    var buffer = 0.1;

    if (d1+d2 >= lineLen-buffer && d1+d2 <= lineLen+buffer) {
        return true;
    }
    return false;
}

// fonction collision entre un point et un cercle
function collPointCercle(px,py,cx,cy,r) {
    var distX = px - cx;
    var distY = py - cy;
    var distance = Math.sqrt( (distX * distX) + (distY * distY) );

    if (distance < r) {
        return true;
    }
    return false;
}

// fonction collision entre une ligne et un cercle
function collLigneCercle(x1,y1,x2,y2,cx,cy,r) {
    var inside1 = collPointCercle(x1,y1, cx,cy,r);
    var inside2 = collPointCercle(x2,y2, cx,cy,r);
    if (inside1 || inside2) return true;

    var distX = x1 - x2;
    var distY = y1 - y2;
    var len = Math.sqrt( (distX*distX) + (distY*distY) );

    var produitScalaire = ( ((cx-x1)*(x2-x1)) + ((cy-y1)*(y2-y1)) ) / Math.power(len,2);

    var closestX = x1 + (produitScalaire * (x2-x1));
    var closestY = y1 + (produitScalaire * (y2-y1));

    var onSegment = collLignePoint(x1,y1,x2,y2, closestX,closestY);
    if (!onSegment) return false;

    distX = closestX - cx;
    distY = closestY - cy;
    var distance = Math.sqrt( (distX*distX) + (distY*distY));

    if (distance <= r) {
        return true;
    }
    return false;
}

// fonction collision entre un polygone et un point
function collPointPolygone(sommets,px,py) {
    var collision = false;

    var suivant = 0;

        for (var actuel = 0; actuel < sommets.length; actuel++) {
            suivant = actuel + 1;
            if (suivant == sommets.length) suivant = 0;

            var sa = sommets[actuel];
            var ss = sommets[suivant];

            if (((sa.y > py && ss.y < py) || (sa.y < py && ss.y > py)) &&
                (px < (ss.x - sa.x) * (py - sa.y) / (ss.y - sa.y) + sa.x)) {
                    collision = !collision;
        }
    }
    return collision;
}    

// fonction collision entre un polygone et un cercle
function collCerclePolygone(sommets,cx,cy,r) {
    var suivant = 0;

    for (var actuel = 0; actuel < sommets.length; actuel++) {
        suivant = actuel + 1;
        if (suivant == sommets.length) suivant = 0;

        var sa = sommets[actuel];
        var ss = sommets[suivant];
        
        collision = collLignePoint(sa.x,sa.y, ss.x,ss.y, cx,cy,r);
        if (collision) return true;

        var centerInside = collPointPolygone(sommets, cx,cy);
        if (centerInside) return true;
    }
    return false;
}

// fonction collision entre un cercle et un cercle
function collCercleCercle(c1x,c1y,c1r, c2x,c2y,c2r) {
    var distX = c1x - c2x;
    var distY = c1y - c2y;
    var distance = Math.sqrt( (distX*distX) + (distY*distY));

    if (distance <= c1r+c2r) {
        return true;
    }
    return false;
}

// fonction d'explosion
 // paramètres spritesheet explosion
 var spriteExplosion = {
 frameWidth: 128,
 frameheight: 128,
 frameTiming: 10,
 framesPerRow: 4,
 rows: 4,
 }


// constructeur de l'objet étoile
function Etoile() { 
    this.x = Math.random()*cWidth;
    this.y = Math.random()*cHeight;
    this.r = parseInt(Math.random()*170+70);
    this.g = parseInt(Math.random()*170+70);
    this.b = 230;
    this.couleur = 'rgb(' + `${this.r},` + `${this.g},` + `${this.b},1)`;
    this.largeur = Math.round((Math.random()*0.5+0.4)*100)/100;
    this.hauteur = Math.round((Math.random()*0.5+0.4)*100)/100;

    this.render = function() {
        ctx.fillStyle = this.couleur;
        ctx.fillRect(this.x,this.y,this.largeur,this.hauteur);     
    };
    

    this.update = function() {  // création d'un champ d'étoiles de vitesses variables
        if (this.y - this.hauteur > cHeight) {
            this.y = 0 - this.hauteur;
            this.y += random([1.0,1.7,2.2])*vitesseJeu;
        } else {
            this.y += random([1.0,1.7,2.2])*vitesseJeu;
        }
    };

}

// créer les étoiles
for (var i = 0;i < 1100; i++) {
    etoiles.push(new Etoile());
}


// constructeur du vaisseau du joueur
function VaisseauJoueur() {
    this.x = cWidth / 2;
    this.y = 3 * cHeight / 4;

    this.pv = 10;
    this.detruit = false;
    this.explose = false;

    this.image = images.player;
    this.image.src = images.player.src;
    this.imgRatio = 112 / 75; 
    
    this.largeur = 65;
    this.hauteur = Math.round((this.largeur / this.imgRatio)*10)/10;
    this.xOff = this.x - this.largeur / 2;
    this.yOff = this.y - this.hauteur / 2;
    this.rayon = this.hauteur/2;
    this.vitesse = 7;
    
    // commutateurs de mouvement
    this.enTranslationG = false;
    this.enTranslationD = false;
    this.pousseeAv = false;
    this.pousseeAr = false;
    this.tirer = false;
    
    this.frameProp = 0;
    
    this.lasers = [];
    this.bouclier = [];
    this.refroidissement = parseInt(tempsRefroidissement * 1000 / fps) * fps; // pour simplifier, le temps de refroidissement est un multiple du fps
    this.then = 0;
    
    this.inertie = { // l'inertie conserve temporairement le mouvement après arrêt
    gauche: 0,
    droite: 0,
    haut: 0,
    bas: 0,
    }         

    // paramètres explosion
    this.frame = 0;
    this.row = 0;
    this.then = 0;
    this.explose = false;
    this.momentExplosion = 0;

    // invincibilité temporaire de réinitialisation
    this.tempsReinitialisation = 1500;
    this.invincible = false;
    this.periodeClignotement = 150;
    this.thenReinit = 0;

    // fonction explosion
    this.explode = function() {
        var now = Date.now();
        var diffExp = now - this.then;
        
        if (diffExp > spriteExplosion.frameTiming) {

            
            if (!this.explose) {

                if (this.frame == 0 && this.row == 0) explosionAudio.play();
                
                ctx.drawImage(images.explosion,this.frame * spriteExplosion.frameWidth,this.row * spriteExplosion.frameheight,128,128,this.x - this.largeur/2 * 1.5,this.y - this.hauteur/2 * 2.0,this.largeur / this.imgRatio * 2.5,this.hauteur * 2.5);
                
                if (this.frame < 3) {
                    this.frame++;
                }
                
                else if (this.frame == 3 && this.row < 3) {
                    
                    this.row++;
                    this.frame = 0;
                    
                }

                else {
                    this.explose  = true;
                    this.frame = 0;
                    this.row = 0;
                    this.momentExplosion = Date.now();
                    vies--;
                }
            }

            this.then = Date.now() - diffExp % spriteExplosion.frameTiming;
        }

    }

this.update = function() {

    // déclencheur victoire
    if (score >= scoreVictoire && !victoire) { 
        victoire = true;
        tempsFinDePartie = Date.now();
    };

    
    if (!this.detruit) {
        
        // transmission mouvement à gauche
        if (this.enTranslationG) {
            this.inertie.gauche = this.vitesse;
            this.x -= this.vitesse;
        } else if (this.inertie.gauche != 0) {
            this.inertie.gauche -= friction * this.inertie.gauche;
            this.x -= this.inertie.gauche;
        }
        
        // transmission mouvement à droite
        if (this.enTranslationD) {
            this.inertie.droite = this.vitesse;
            this.x += this.vitesse;
        } else if (this.inertie.droite != 0) {
            this.inertie.droite -= friction * this.inertie.droite;
            this.x += this.inertie.droite;
        }
        
        // transmission mouvement avant
        if (this.pousseeAv) {
            this.inertie.haut = this.vitesse;
            this.y -= this.vitesse;
        } else if (this.inertie.haut != 0) {
            this.inertie.haut -= friction * this.inertie.haut;
            this.y -= this.inertie.haut;
        }
        
        // transmission mouvement arrière
        if (this.pousseeAr) {
            this.inertie.bas = this.vitesse;
            this.y += this.vitesse;
        } else if (this.inertie.bas != 0) {
            this.inertie.bas -= friction * this.inertie.bas;
            this.y += this.inertie.bas;
        }
        
        // bords de l'écran
        if (this.x <= 0 + this.largeur/2) {
            this.x = this.largeur/2;
        } else if (this.x >= cWidth - this.largeur/2) {
            this.x = cWidth - this.largeur/2;
        }
        if (this.y <= 0 + this.hauteur/2) {
            this.y = this.hauteur/2;
        } else if (this.y >= cHeight - this.hauteur/2) {
            this.y = cHeight - this.hauteur/2;
        }
        
        // gestion du bouclier
        if (this.bouclier.length > 0) {
            if (!this.bouclier[0].desactive) {
                this.bouclier[0].update();
                this.bouclier[0].x = this.x - this.largeur/2;
                this.bouclier[0].y = this.y - this.largeur/2;
            }
            else {
                this.bouclier.splice(0,1);
            }
        }
    }
    
        // vérifier collision avec des lasers ennemis //

        // sommets du polygone de collision
        this.sommets = [
            {x: this.x, y: this.y - this.hauteur/2},
            {x: this.x + this.largeur/2, y: this.y},
            {x: this.x + this.largeur/3, y: this.y + this.hauteur/2},
            {x: this.x - this.largeur/3, y: this.y + this.hauteur/2},
            {x: this.x - this.largeur/2, y: this.y}
        ];

        // vérifier collision avec des vaisseaux ennemis
        this.collision = false;
        
        if (OVNIs.length > 0) {

            for (var i = 0; i < OVNIs.length; i++) {
                var cx = OVNIs[i].x + OVNIs[i].rayon;
                var cy = OVNIs[i].y + OVNIs[i].rayon;
                var r = OVNIs[i].rayon;
                
                this.collision = collCerclePolygone(this.sommets,cx,cy,r);
                
                // gestion des dégâts
                if (this.collision) {
                    this.pv = 0;
                    this.detruit = true;
                    OVNIs[i].detruit = true;
                }
            }
        }

        // vérifier collision avec des astéroïdes
        if (asteroides.length > 0) {

            for (var i = 0; i < asteroides.length; i++) {
                var cx = asteroides[i].x + asteroides[i].rayon;
                var cy = asteroides[i].y + asteroides[i].rayon;
                var r = asteroides[i].rayon;
                
                this.collision = collCercleCercle(this.x,this.y,this.rayon, cx,cy,r);
                
                // gestion des dégâts
                if (this.collision) {
                    this.pv = 0;
                    this.detruit = true;
                    asteroides[i].hit = true;
                }
            }
        }

        // vérifier interception avec un bonus
        this.bonusActif = false;
        this.debutBonus = false;
        this.tempsDebutBonus = 0;

        if (tabBonus.length > 0) {
            for (var i = 0; i < tabBonus.length; i++) {
                var bx = tabBonus[i].x + 25;
                var by = tabBonus[i].y + 25;

            this.bonusActif = collPointPolygone(this.sommets,bx,by);
            if (this.bonusActif) {
                this.debutBonus;
                this.tempsDebutBonus = Date.now();
                tabBonus.splice(i, 1);
                bouclierActif.play();

                if (this.bouclier.length < 1) {
                    this.bouclier.push(new Bouclier(this.x - this.largeur/2, this.y - this.hauteur/2, this.tempsDebutBonus))
                }
            }
        }
    }

        // formule de comparaison entre un laser et chaque côté du polygone

        if (lasersOVNI.length > 0) {
            
                for (var i = 0; i < lasersOVNI.length; i++) {
                    var lx = lasersOVNI[i].x + 1.5;
                    var ly = lasersOVNI[i].y + 19;

                this.collision = collPointPolygone(this.sommets,lx,ly);

                
                
                // gestion des dégâts
                if (this.collision) {
                    if (this.bouclier.length > 0) {
                        this.bouclier[0].pvBouclier -= lasersOVNI[i].puissance;
                    }
                    else {
                    this.pv -= lasersOVNI[i].puissance;
                    }

                    lasersOVNI.splice(i,1);

                    impactAudio.play();
                } 
                // vérifier s'il reste de la vie
                if (this.pv <= 0) {
                    this.detruit = true;
                }
            }
        }

        // génération lasers
        if (this.tirer) {
            var now = Date.now();
            var diff = now - this.then;
    
            if (diff / this.refroidissement >= 1) {
                this.lasers.push(new Laser(this.x - 1.5, this.y - this.hauteur/2, 2, 'laser'));              
                this.then = Date.now();
                laserAudio.play();
            }
        }
    
        if (this.lasers.length > 0) {
    
        for (var i = this.lasers.length - 1; i >= 0; i--) {
            this.lasers[i].y -= this.lasers[i].vitesse;
            
            if (!this.lasers[i].touche) {
            this.lasers[i].render();
            }

           // vérifier si collision avec OVNIs
            if (OVNIs.length > 0 && !this.lasers[i].touche) {
    
            for (var j = 0; j < OVNIs.length; j++) {
            
                var xLaser = this.lasers[i].x;
                var yLaser = this.lasers[i].y;
                var xOVNI = OVNIs[j].x + OVNIs[j].largeur/2;
                var yOVNI = OVNIs[j].y + OVNIs[j].hauteur/2;
                var dist = distanceEntrePoints(xLaser, yLaser, xOVNI, yOVNI);
                
                    if ( dist < OVNIs[j].rayon + 3){
                        OVNIs[j].pv -= this.lasers[i].puissance;
                        this.lasers[i].touche = true;
                        ctx.drawImage(images.impact,0,0,37,37,xLaser,yLaser,10,10);
                    }
                }
            }  

            // vérifier si collision avec des astéroïdes
            if (asteroides.length > 0 && !this.lasers[i].touche) {
    
                for (var j = 0; j < asteroides.length; j++) {
                
                    var xLaser = this.lasers[i].x;
                    var yLaser = this.lasers[i].y;
                    var xAster = asteroides[j].x + asteroides[j].rayon/2;
                    var yAster = asteroides[j].y + asteroides[j].rayon/2;
                    var dist = distanceEntrePoints(xLaser, yLaser, xAster, yAster);
                    
                        if ( dist < asteroides[j].rayon + 3){
                            asteroides[j].hit -= true;
                            this.lasers[i].touche = true;
                            ctx.drawImage(images.impact,0,0,37,37,xLaser,yLaser,10,10);
                        }
                    }
                }  


                if (this.lasers[i].y < - 19) { // on supprime les lasers à leur sortie du canvas
                    this.lasers.splice(i, 1);
                }
            }
        }
    }
    
    this.render = function() {

    if (victoire) {
        var nowVictoire = Date.now();
            diffVictoire = nowVictoire - tempsFinDePartie;
                
            if (diffVictoire < tempsEntreDeuxParties) {
                gameOver = true;
                ctx.font = "25px Arial";
                ctx.fillStyle = 'white';
                ctx.fillText('Bravo, vous avez gagné', 320, canvas.height / 2 - 10);

                musiqueDeFond.pause();
                musiqueVictoire.play();
            }
            else {
                if (gameOver) jeuEnCours = false;
            }
    }

    else {
        
            if (!this.detruit) {

                if (!this.invincible) {
                // dessin vaisseau
                ctx.drawImage(this.image,0,0,112,75,this.x - this.largeur/2,this.y - this.hauteur/2,this.largeur,this.hauteur);

                // dessin bouclier
                if (this.bouclier.length > 0) {
                    this.bouclier[0].render();
                }

                // dessin propulseur
                if (this.pousseeAv) {
                    ctx.drawImage(images.prop1,0,0,16,40, this.x - 4, this.y + this.hauteur/2,8,20);
                    //propulseurAudio.play();

                } else if (this.inertie.haut > 0.99) { // extinction du propulseur après arrêt
                    switch(this.frameProp) {
                        case 0:
                            ctx.drawImage(images.prop1,0,0,16,40, this.x - 4, this.y + this.hauteur/2,8,20);
                            this.frameProp = 1;
                            break;
                        case 1:
                            ctx.drawImage(images.prop2,0,0,16,40, this.x - 4, this.y + this.hauteur/2,8,20);
                            this.frameProp = 2;
                            break;
                        case 2:
                            ctx.drawImage(images.prop3,0,0,16,40, this.x - 4, this.y + this.hauteur/2,8,20);
                            this.frameProp = 0;
                            break;
                    }
                }
                
                if (dessins) {
                    // polygone de collision
                    ctx.strokeStyle = "lime";
                        ctx.beginPath();
                        ctx.moveTo(this.sommets[0].x ,this.sommets[0].y);
                        ctx.lineTo(this.sommets[1].x ,this.sommets[1].y);
                        ctx.lineTo(this.sommets[2].x ,this.sommets[2].y);
                        ctx.lineTo(this.sommets[3].x ,this.sommets[3].y);
                        ctx.lineTo(this.sommets[4].x ,this.sommets[4].y);
                        ctx.lineTo(this.sommets[0].x ,this.sommets[0].y);
                        ctx.closePath();
                        ctx.stroke();
                    }
                
            }  
        } 
        
            else if (this.detruit) {
                
                if (!this.explose) {

                this.explode(); 
                
                } 
            
                else if (vies > 0) {
                this.pv = 10;
                this.invincible = true;
                this.x = cWidth / 2;
                this.y = 3 * cHeight / 4;

                var nowReinit = Date.now();
                var diffReinit = nowReinit - this.momentExplosion;
                var diffPeriode = nowReinit - this.thenReinit;
            
                    if (diffReinit < this.tempsReinitialisation) {
                        if (diffPeriode > this.periodeClignotement) {
                            ctx.drawImage(this.image,0,0,112,75,this.x - this.largeur/2,this.y - this.hauteur/2,this.largeur,this.hauteur);
                        }
                        this.thenReinit = Date.now() - diffReinit % this.periodeClignotement;
                    }
                
                    else {
                        this.detruit = false;
                        this.invincible = false;
                        this.explose = false;
                    }
                }

                else {
                    var nowGameOver = Date.now();
                    diffGameOver = nowGameOver - this.momentExplosion;
                    
                    if (diffGameOver < tempsEntreDeuxParties) {
                        gameOver = true;
                        ctx.font = "25px Arial";
                        ctx.fillStyle = 'white';
                        ctx.fillText('Game over', 390, canvas.height / 2 - 10);
                        gameOverAudio.play();
                    }
                    else {
                        if (gameOver) jeuEnCours = false;
                    }
                }
            }   
        }
    }
}

// constructeur de l'objet laser
function Laser(x,y,vitesse,image) {
    this.x = x;
    this.y = y;
    this.image = images[image];
    this.image.src = images[image].src;
    this.vitesse = vitesse + joueur1.vitesse;
    this.puissance = 1;
    this.touche = false;
    this.render = function() {
        ctx.drawImage(this.image,0,0,9,57,this.x,this.y,3,19);
    }
}

// constructeur de l'objet OVNI
function OVNI(x,y,image,vitesse,puissance,translation) {
    this.x = x;
    this.y = y;
    
    this.image = images[image];
    this.image.src = images[image].src;
    this.imgRatio = 1; 
    
    this.largeur = 65;
    this.hauteur = 65;
    this.rayon = this.largeur / 2;

    this.vitesse = vitesse;
    this.puissance = puissance;
    this.translationHoriz = translation;
    this.periodeTranslation = 4000;
    this.thenTranslation = 0;
    this.pv = 8;
    this.detruit = false;
    this.explose = false;
    this.detruitParAsteroide = false;

    this.lasers = [];
    this.refroidissement = 500;

    // paramètres explosion
    this.frame = 0;
    this.row = 0;
    this.then = 0;

    this.explode = function() {
        var now = Date.now();
        var diffExp = now - this.then;
        
        if (diffExp > spriteExplosion.frameTiming) {

            if (!this.explose) {

                if (this.frame == 0 && this.row == 0) explosionAudio.play();
                
                ctx.drawImage(images.explosion,this.frame * spriteExplosion.frameWidth,this.row * spriteExplosion.frameheight,128,128,this.x,this.y,this.largeur,this.hauteur);
                
                if (this.frame < 3) {
                    this.frame++;
                }
                
                else if (this.frame == 3 && this.row < 3) {
                    
                    this.row++;
                    this.frame = 0;
                    
                }
                
                else {
                    this.explose  = true;
                    this.frame = 0;
                    this.row = 0;
                }
            }

            this.then = Date.now() - diffExp % spriteExplosion.frameTiming;
        }

    }

    this.render = function() {
        ctx.drawImage(this.image,0,0,91,91,this.x,this.y,this.largeur,this.hauteur);

    }

    this.update = function() {

    if (!this.detruit) {
        this.y += this.vitesse;

        if (this.translationHoriz) {
            var nowTranslation = Date.now();
            var diffTranslation = nowTranslation - this.thenTranslation;

            if (diffTranslation < this.periodeTranslation) {

                if (diffTranslation < this.periodeTranslation/2) {
                    this.x += this.vitesse * 0.75 ;
                }
                else if (diffTranslation > this.periodeTranslation/2) {
                    this.x -= this.vitesse * 0.75;
                }
            }

            else {
                this.thenTranslation = Date.now();
            }
            
        }

        // bords de l'écran
        if (this.x <= 0) {
            this.x = this.largeur;
        } else if (this.x >= cWidth - this.largeur) {
            this.x = cWidth - this.largeur;
        }

        // création de lasers 
        var now = Date.now();
        var diffTemps = now - then;
    
        if (diffTemps > this.refroidissement) {
            
            if (niveau == 1) {
                lasersOVNI.push(new Laser(this.x + this.largeur/2,this.y + this.hauteur/2, 2, 'laserOVNI'));
            }

            else {
                lasersOVNI.push(new Laser(this.x + this.largeur/2,this.y + this.hauteur/2, 3, 'laserOVNI2')); 
            }
        
            then = Date.now() - diffTemps % this.refroidissement;
        }

        // gestion des pv
        if (this.pv <= 0) {
            this.detruit = true;
        }
    } 

    }
}

// constructeur de l'objet bonus
function Bonus(x,y,image) {
    this.x = x,
    this.y = y,
    this.largeur = 25,
    this.hauteur = 25,
    this.vitesse = vitesseJeu;
    this.absorbe = false;

    this.image = images[image];
    
    this.update = function() {
        
        this.y += this.vitesse;
    }

    this.render = function() {
        ctx.drawImage(this.image,0,0,30,30, this.x,this.y,this.largeur,this.hauteur);
    }
}

// constructeur de l'objet bouclier
function Bouclier(x,y,tempsApparition) {
    this.x = x;
    this.y = y;
    this.rayon = 72;
    this.pvBouclier = 5;
    this.dureeActif = 10000;
    this.tempsApparition = tempsApparition;
    this.thenBouclier = 0;
    this.periodeEntreFrames = spriteBouclierDim.frameTiming;
    this.frameBouclierOn = 0;
    this.frameBouclierOff = 2;

    this.image = images.spriteBouclier;

    this.etape = 'apparition';
    this.desactive = false;

    this.calculTempsEcoule = function() {
        var nowBouclier = Date.now();
        var diffBouclier = nowBouclier - this.tempsApparition;

        return diffBouclier < this.dureeActif;
    }

    this.update = function() {
        var enCours = this.calculTempsEcoule();

        if (!this.desactive) {

            if (this.etape == 'apparition' && this.pvBouclier > 0) this.etape = 'activation';

            else if (enCours && this.pvBouclier > 0) this.etape = 'actif';

            else if (!enCours || this.pvBouclier <= 0) {
                this.etape = 'désactivation';
            }
        }
    }

    this.render = function() {

        if (!this.desactive) {
        
            if (this.etape == 'actif') {
                
                ctx.drawImage(this.image,0,0,spriteBouclierDim.frameWidth,spriteBouclierDim.frameHeight, this.x - 4,this.y,this.rayon,this.rayon);
            }
            
            else {
                var nowRenderBouclier = Date.now();
                var diffPeriode = nowRenderBouclier - this.thenBouclier;

                if (diffPeriode > this.periodeEntreFrames) {
                    if (this.etape == 'activation') {
                        ctx.drawImage(this.image,this.frameBouclierOn*spriteBouclierDim.frameWidth,0,spriteBouclierDim.frameWidth,spriteBouclierDim.frameHeight, this.x - 4,this.y,this.rayon,this.rayon);
                        
                        if (this.frameBouclierOn < 3) this.frameBouclierOn++;
                    }

                    else if (this.etape == 'désactivation') {
                        ctx.drawImage(this.image,this.frameBouclierOff*spriteBouclierDim.frameWidth,0,spriteBouclierDim.frameWidth*this.frameBouclierOff,spriteBouclierDim.frameHeight, this.x - 4,this.y,this.rayon,this.rayon);
                        
                        if (this.frameBouclierOff >= 0) {
                            this.frameBouclierOff--;

                            if (this.frameBouclierOff == 1) {
                                bouclierDesactive.play();
                            }
                        } 
                        else {
                            this.desactive = true;
                            this.etape = '';
                        }
                    }
                }

                this.thenBouclier = Date.now() - diffPeriode % this.periodeEntreFrames;
                
            }
        }
    }
}

// contructeur de l'objet astéroïdes
function Asteroide(x,y,taille,image,contBonus) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = vitesseJeu;
    this.rayon = 0;
    this.taille = taille;
    this.hit = false;
    this.conteneurBonus = contBonus;

    this.image = images[image];

    this.update = function() {
        switch(taille) {
            case 'big':
                this.vx = 7;
                this.rayon = 80;
                break;
            case 'small1':
                this.vx = 10;
                this.rayon = 50;
                break;
            case 'small2':
                this.vx = -10;
                this.rayon = 50;
                break;
        }
    }

    this.render = function() {
        switch(taille) {
            case 'big':
                ctx.drawImage(this.image,0,0,85,95, this.x,this.y,this.rayon,this.rayon);
                break;
            case 'small1':
            case 'small2':
                ctx.drawImage(this.image,0,0,45,45, this.x,this.y,this.rayon,this.rayon);
                break;
        }
    }
}

// generateur d'astéroïdes
var thenAster = 10000;

function geneAster() {
    var nowAster = Date.now();
    var diffTempsAster = nowAster - thenAster;
    
    if (diffTempsAster > periodeVagueAsteroides) {
        yRand1 = - 150 + Math.random() * 50;
        yRand2 = 50 + Math.random() * 50;
        xRand1 =  cWidth + Math.random() * 300;
        xRand2 =  cWidth + Math.random() * 300;

        var choixTexture1 = random([2,1]);
        var choixTexture2 = 1;
        choixTexture1 == 1 ? choixTexture2 = 2 : choixTexture2 = 1;
        var texture1 = 'asteroidesBig' + `${choixTexture1}`;
        var texture2 = 'asteroidesBig' + `${choixTexture2}`;

        asteroides.push(new Asteroide(xRand1,yRand1,'big',texture1,true));
        asteroides.push(new Asteroide(xRand2,yRand2,'big',texture2,false));
        
        thenAster = Date.now() - diffTempsAster % periodeVagueAsteroides;
    }
}

// gestion des astéroiïdes
function gestAster() {
    if (asteroides.length > 0) {
        for (var i = asteroides.length - 1; i >= 0; i--) {
            
            if (!asteroides[i].hit) {
                
                asteroides[i].update();
                asteroides[i].x -= asteroides[i].vx;
                asteroides[i].y += asteroides[i].vy;

                asteroides[i].render();
                if (asteroides[i].y > cWidth - 80) { // on supprime les astéroïdes à leur sortie du canvas
                    asteroides.splice(i, 1);
                }  

                // vérifier collision avec des vaisseaux ennemis
                if (OVNIs.length > 0) {

                    for (var j = 0; j < OVNIs.length; j++) {
                        var cx = OVNIs[j].x + OVNIs[j].rayon;
                        var cy = OVNIs[j].y + OVNIs[j].rayon;
                        var r = OVNIs[j].rayon;
                        
                        asteroides[i].hit = collCercleCercle(asteroides[i].x - asteroides[i].rayon/2,asteroides[i].y - asteroides[i].rayon/2,asteroides[i].rayon, cx,cy,r);
                        
                        // gestion des dégâts
                        if (asteroides[i].hit) {
                            OVNIs[j].pv = 0;
                            OVNIs[j].detruit = true;
                            OVNIs[j].detruitParAsteroide = true;
                        }
                    }
                }
            } 

            else if (asteroides[i].hit) {
                explosionAudio.play();
                
                if (asteroides[i].taille == 'big') { 
                var geneBonus = asteroides[i].conteneurBonus;
                var xOr = asteroides[i].x;
                var yOr = asteroides[i].y;
                asteroides.splice(i, 1);

                var choixTexture1 = random([2,1]);
                var choixTexture2 = 1;
                choixTexture1 == 1 ? choixTexture2 = 2 : choixTexture2 = 1;
                var texture1 = 'asteroidesSmall' + `${choixTexture1}`;
                var texture2 = 'asteroidesSmall' + `${choixTexture2}`;

                asteroides.push(new Asteroide(xOr - 100,yOr,'small1',texture1,false));
                asteroides.push(new Asteroide(xOr,yOr,'small2',texture2,false));

                if (geneBonus) tabBonus.push(new Bonus(xOr,yOr - 30,'bonusBouclier'));

                }

                asteroides.splice(i, 1);
                
            }
        }
    }
}

// générateur de bonus
var thenBonus = 0;
var intervalleApparitionBonus = 5000;
function geneBonus() {
    var nowBonus = Date.now();
    var diffTempsBonus = nowBonus - thenBonus;
    
    if (diffTempsBonus > intervalleApparitionBonus) {
        xRand = cWidth * Math.random() + 30;
        tabBonus.push(new Bonus(xRand,-30,'bonusBouclier'));
        
        thenBonus = Date.now() - diffTempsBonus % intervalleApparitionBonus;
    }
}

// gestion des bonus
function gestBonus() {
    if (tabBonus.length > 0) {
        for (var i = tabBonus.length - 1; i >= 0; i--) {
            
            if (!tabBonus[i].absorbe) {
                
                tabBonus[i].update();
                tabBonus[i].render();
                if (tabBonus[i].y > cHeight + 20) { // on supprime les lasers à leur sortie du canvas
                    tabBonus.splice(i, 1);
                }  
            } 
        }
    }
}

// générateur d'OVNI
function geneOVNI() {
    var now = Date.now();
    var diffTemps = now - then;
    
    if (diffTemps > intervalleApparition) {
        xRand = cWidth * Math.random() + 65;

        if (niveau == 1) {
        OVNIs.push(new OVNI(xRand,-65,'OVNI1',5,1,false));
        }
        else {
        OVNIs.push(new OVNI(xRand,-65,'OVNI2',5,2,true));
        }
        
        then = Date.now() - diffTemps % intervalleApparition;
    }
}


// gestion des OVNIs
function gestOVNI() {

    // gestion vaisseaux ennemis
        if (OVNIs.length > 0) {
        for (var i = OVNIs.length - 1; i >= 0; i--) {
            
            if (!OVNIs[i].detruit) {
                
                OVNIs[i].update();
                OVNIs[i].render();
                
                if (OVNIs[i].y > cHeight + 65) { // on supprime les lasers à leur sortie du canvas
                    OVNIs.splice(i, 1);
                }
                
            } 

            else {
                if (OVNIs[i].explose) {
                if (!OVNIs[i].detruitParAsteroide) {
                    if (!OVNIs[i].translationHoriz) {
                         score++;
                    }
                    else {
                         score += 2;
                    }
                }
                OVNIs.splice(i,1);

                } else {
                OVNIs[i].update();
                OVNIs[i].explode();

                }
            }
        }
    }

    // gestion lasers ennemis
    for (var i = lasersOVNI.length - 1; i >= 0; i--) {
        lasersOVNI[i].y += lasersOVNI[i].vitesse;
        lasersOVNI[i].render();

        if (lasersOVNI[i].y > cHeight + 19) { // on supprime les lasers à leur sortie du canvas
            lasersOVNI.splice(i, 1);
        }
    }

}

// gestion interface jeu
updateScore = function() {
        if (score >= palierNiveauSuivant) { 
            niveau++;
        } else {
            niveau = 1;
        }

        scoreStr = score.toString();

        while (scoreStr.length < 4) {
            scoreStr = '0' + scoreStr;
        }
        
        for (var i = 0; i < scoreStr.length; i++) {
            var num = parseInt(scoreStr[i]);
            ctx.drawImage(images.numScores,num * spriteScore.frameWidth,0,21,21, 800 + i * 20,10,21,21);
        }

    }

updateLives = function() {
        ctx.drawImage(images.vie,0,0,37,26,20,10,30,20);
        ctx.drawImage(images.numScores,10 * spriteScore.frameWidth,0,21,21, 20 + 32,12,21,21);
        ctx.drawImage(images.numScores,vies * spriteScore.frameWidth,0,21,21, 52 + 23,10,21,21);
}

menuPrincipal = function() {

    if (!introJeu) {
            gameOver = false;
            ctx.font = "25px Arial";
            ctx.fillStyle = 'white';
            ctx.fillText('Appuyez sur [Entrée] pour jouer', 280, canvas.height / 2 - 10);
            ctx.fillText('ou sur [Q] pour quitter', 335, canvas.height / 2 + 20);
            document.addEventListener('keydown', menuJeu);
            vies = 3;
            score = 0;
            niveau = 1;
        }

    else {
            var nowIntro = Date.now();
            var diffIntro = nowIntro - debutJeu;

            if (diffIntro < dureeIntro) {
                ctx.font = "25px Arial";
                ctx.fillStyle = 'white';
                ctx.fillText('Faites un score de 30 points', 280, canvas.height / 2 - 10);
                ctx.fillText('pour récupérer le CV', 322, canvas.height / 2 + 20);
                ctx.font = '20px Arial';
                ctx.fillText('Astuce: détruisez les astéroides pour récolter un bonus', 200, canvas.height / 2 + 310);
            }

            else {
                introJeu = false;
            }
        }
    }

    
    
    // contrôles
    function keyDown(e) {
        switch(e.keyCode) {
            case 32: // tirer
            joueur1.tirer = true;
            break;
        case 37: // translation vers la gauche
            joueur1.enTranslationG = true;    
            break;
        case 38: // propulsion AV
        joueur1.pousseeAv = true;
            break;
            case 39: // translation vers la droite
            joueur1.enTranslationD = true;
            break;
        case 40: // propulsion AR
        joueur1.pousseeAr = true;
    }
}

function keyUp(e) {
    switch(e.keyCode) {
        case 32: // rafraîchissement laser
        joueur1.tirer = false;
        break;
        case 37: // arrêt translation gauche
        joueur1.enTranslationG = false;
        break;
        case 38: // arrêt propulsion
        joueur1.pousseeAv = false;
        break;
        case 39: // arrêt translation droite
        joueur1.enTranslationD = false;
        break;
        case 40:
            joueur1.pousseeAr = false;
            break;
        }
    }
    
    function menuJeu(e) {
        switch(e.keyCode) {
        case 13: 
            jeuEnCours = true;
            victoire = false;
            musiqueVictoire.pause();
            musiqueDeFond.play();
            break;
        case 81:
            quitterLeJeu = true;
            musiqueDeFond.pause();
            musiqueVictoire.pause();

            if (standAlone) {
                canvas.style.backgroundColor = 'black';
                canvas.style.display = "none"; 
                document.getElementById("divJeu").style.display = 'none';
            } 
            
            // fonctions appelées si intégration dans une page
            else if (!standAlone && victoire) {
               document.getElementById("divJeu").style.display = 'none';
               document.getElementById('mask').style.display = 'none';
               document.getElementById('button').style.visibility = 'hidden';
               document.getElementById('preview-cv').style.opacity = '1.0';
            }

            else if(!standAlone && !victoire) {
                canvas.style.backgroundColor = 'black';
                document.getElementById("divJeu").style.display = 'none';
            }
            break;
        }
    }
    
    
    var joueur1 = new VaisseauJoueur();
    
    // dessiner 
    function animate() {
        ctx.clearRect(0,0,cWidth,cHeight);
        etoiles.forEach(etoile => etoile.update());
        etoiles.forEach(etoile => etoile.render());
        if (jeuEnCours) {
            joueur1.update();
            joueur1.render();
            if (gameOver) return;
            geneAster();
            gestAster();
            geneOVNI();
            gestOVNI();
            //geneBonus();
            gestBonus();
            updateScore();
            updateLives();
        }
    else {
        menuPrincipal();
    }
}

// gestionnaires d'événements
window.addEventListener("keydown", function(e) {
    // space and arrow keys
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

if (!quitterLeJeu) {
setInterval(() => animate(), 1000 / fps);
}

// fin programme
}
