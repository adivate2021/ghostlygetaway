Project: Ghostly Getaway

Summary of What It Is:
Ghostly Getaway is a game inspired by the mobile game Temple Run. In the game, you play as a ghost running away from an exorcist in a haunted mansion. Along the way,
the ghost encounters creatures such as ogres, witches, and bats, as well as fire and as the ghost, you must avoid these obstacles.

Features:
Ghostly Getaway has many different features:
- Left/Right Movement using A/D keys
- Jumping using SPACE (which also consists of a physics based/kinematics based system)
- Crouching toggle using C (which also slows left/right movement, disables jumping in this position)
- Dynamic Lighting (Ceiling lights are all sources of light)
- Dynamic obstacles
  - The bats are flying and moving left/right (along the x-axis)
  - Fire is stationary but also acts as a light source (and the light's color resembles the color of fire)
  - Witches move left/right on the ground
  - Ogres move back and forth on the ground (along the z-axis)
- Collision Detection
  - Uses cubes as the hitboxes for the ghost and the obstacles
  - After one collision the exorcist gets closer to the ghost. After a secoond collision, you lose (Game Over)
- Object Models for the different characters and Text for the "Game Over" screen

How to Operate:
To start the server, run host.command if on Mac or host.bat if on Windows. 
Then, go to localhost:8000.
The game should immediately start.

Once the game starts, use A to move the ghost left and D to move the ghost right. Use SPACE to jump and C to crouch. 
Try to avoid all of the obstacles on the path (which consist of witches, ogres, fire, and bats). If at any point one wants to restart the game, simply press R. 
If the ghost hits two obstacles and the GAME OVER screen pops up, press R to play again.
