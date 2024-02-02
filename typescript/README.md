# TypeScript template
The template has built-in logic for registering the client and waiting for the game to start. Once a race has finished the application will automatically register to the next one. If you exit the program at any point, you can just run the program again to continue with same username. 
The playerId, server url and username are stored in a file called botconfig.json.
If you remove the file, you will need to register again.

## How to write logic

Add your own bot logic to the update() -function in Bot.ts -file. There is some placeholder code just to give you an idea how it works. This function runs once every 200ms (default).
The current state of the game can be accessed via the `gameState` -property of Bot class. It is updated automatically every time you call the `move()` -function of the Bot class.

## How to run

From within the typescript-folder (same folder as this README file), run `npm run start`. The first time you run it, it will ask for a server url and username. After this, it will check that connection to server is ok and save this configuration to a file called botconfig.json.
This configuration will be used for all communication with server. **Note: You should only do this once in the beginning, not between every game.**

## Prerequisites
- Node v21.5.0

## Troubleshooting

If you get an error such as `No player found with provided ID` when starting the bot, it's likely that the server has been restarted and your user no longer exists. In this case, remove botconfig.json and run `npm run start` to register again.

If you get an error during registration, check that your url is valid. There is only check for username.
