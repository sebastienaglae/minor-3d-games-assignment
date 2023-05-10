# Rendu final mineure programmation de jeux 3D sur le Web
Sébastien Aglaé & Mike Chiappe

## Installation
```bash
npm install
```

## Lancement
```bash
npm start
```

## Espace
Fait par Sébastien Aglaé
### Controles
- Z: Monter
- S: Descendre
- Q: Tourner à gauche
- D: Tourner à droite
- Espace: Accélérer
- Shift: Ralentir
- E: Orienter le vaisseau vers la planète la plus proche

### Se qui a été fait
- Ajout d'un vaisseau avec un cockpit
- Skybox avec des étoiles
- Intégration d'un vaisseau
  - Tremblement lors de l'accélération
  - Effet de lumière devant le vaisseau (violette)
  - Dashboard
- Dialogue basique
- Intégration du systeme solaire (temporaire)
  - Orbit
  - Rotation sur lui même
  - Rotation autour du soleil
- Transition des planètes
  - Effet de fumée (GPU Particles)
  - Effet de lumière (feu lors de l'entrée dans l'atmosphère)
- Un dashboard avec les informations du vaisseau
  - Vitesse du vaisseau
  - Distance a parcourir vers la planète la plus proche
  - Nom de la planète la plus proche
  - Regime des 3 moteurs
  - L'heure réele
  - Le nombre d'fps
- Toon shader

Le dashboard fait sous figma et exporté en utilisant le plugin figma to babylonjs
https://www.figma.com/file/VDfB4SOgeenDlYsY7d6GvQ/GOW2023?type=design&node-id=0%3A1&t=iU5WZSCvmMBcvUF2-1


### Contrôles
Z: Avancer
S: Reculer
Q: Tourner à gauche
D: Tourner à droite
Clic gauche: Tirer vers l'endroit où le joueur vise

### Description
Vous avez attéri sur une planète inconnue, vous devez trouver un moyen de repartir. Attention aux monstres qui rodent !
Pas de HUD pour le moment, lorsque vous mourrez vous revenez à votre vaisseau de départ.

### Se qui a été fait
- Ajout de modèles 3Ds pour le personnage, les monstres et le niveau (la map)
- Dialogue basique
- Ajout de collision calculé via les informations sur le niveau (meshes du terrains, des objets, etc)
- IA basique qui attaque le joueur si il est à proximité des monstres
- Pathfinding pour les monstres permettant de les faire se déplacer vers le joueur
- Système de vie pour le joueur et les monstres
- Detection de collision pour le personnage principal, les monstres et les projectiles
- Système de tir pour le joueur
- Système de dégats pour les monstres et le joueur
- Système de mort pour les monstres et le joueur
- Système de respawn pour le joueur