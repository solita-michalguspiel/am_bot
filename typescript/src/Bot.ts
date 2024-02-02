import { Direction, GameState, Scene } from "./datatypes";
import { UserInput } from "./UserInput";
import { ApiClient } from "./ApiClient";
import { Logger } from "./Logger";
import { sleep } from "./util";

export class Bot {
  constructor(
    gameState: GameState,
    apiClient: ApiClient,
    userInput: UserInput,
    logger: Logger
  ) {
    this.gameState = gameState;
    this.running = false;
    this.apiClient = apiClient;
    this.userInput = userInput;
    this.logger = logger;
    this.continueDone = false;
    this.tickRate = 200;
  }
  gameState: GameState;
  running: boolean;
  apiClient: ApiClient;
  userInput: UserInput;
  logger: Logger;
  continueDone: boolean;
  tickRate: number;

  // map of collecatable in order
  arrayOfCollectables = new Array<number>(); // <<<<<
  arrayOfObstacles = new Array<number>();

  oldCollectables = new Array<number>();
  oldObstacles = new Array<number>();

  async update() {
    //REPLACE WITH YOUR CODE
    //Create a map of items in order that they appeared
    let collectible = this.gameState.collectablesX;
    let newItems = collectible.filter(
      (item) => !this.oldCollectables.includes(item)
    );
    this.arrayOfCollectables.push(...newItems);
    this.oldCollectables.push(...newItems);
    this.arrayOfCollectables = this.arrayOfCollectables.filter((item) =>
      this.gameState.collectablesX.includes(item)
    );

    // obstacle logic
    let obstacle = this.gameState.obstaclesX;
    let newObstacles = obstacle.filter(
      (item) => !this.oldObstacles.includes(item)
    );
    this.arrayOfObstacles.push(...newObstacles);
    this.oldObstacles.push(...newObstacles);
    this.arrayOfObstacles = this.arrayOfObstacles.filter((item) =>
      this.gameState.obstaclesX.includes(item)
    );

    const myPos = this.gameState.position;
    let isImmune = this.gameState.playerStatus === "immune";
    //Firsly go to bottom of the road:
    if (myPos.y < 800) {
      await this.move(Direction.Down);
      return;
    }

    // Get own X
    // first element from list
    //
    //Manouver to get closer to first collectible in mapOfCollectables
    if (this.arrayOfCollectables.length > 0) {
      let firstCollectible = this.arrayOfCollectables[0];
      if (firstCollectible > myPos.x) {
        // check if there is any obstacle between mypos.x and firstCollectible
        let obstaclesBetween = this.arrayOfObstacles.find(
          (el) => el > myPos.x && el < firstCollectible
        );
        if (!isImmune && obstaclesBetween) {
          console.log("Obstacle between - Steer Left");
          await this.move(Direction.Left);
        } else {
          console.log("Move Right");
          await this.move(Direction.Right);
        }
        return;
      }
      if (firstCollectible < myPos.x) {
        let obstaclesBetween = this.arrayOfObstacles.find(
          (el) => el < myPos.x && el > firstCollectible
        );
        if (!isImmune && obstaclesBetween) {
          console.log("Obstacle between - Steer Right");
          await this.move(Direction.Right);
        } else {
          console.log("Move Left");
          await this.move(Direction.Left);
        }
        return;
      }
    }
    if (this.arrayOfObstacles.length > 0) {
      var closestObstacle = this.arrayOfObstacles.reduce(function (prev, curr) {
        return Math.abs(curr - myPos.x) < Math.abs(prev - myPos.x)
          ? curr
          : prev;
      });

      if (closestObstacle > this.gameState.position.x) {
        console.log("Move Away Left");
        await this.move(Direction.Left);
      } else if (closestObstacle < this.gameState.position.x) {
        console.log("Move Away Right");
        await this.move(Direction.Right);
      } else {
        console.log("Stop Steering");
        await this.move(Direction.StopSteering);
      }
      return;
    }
    await this.move(Direction.StopSteering);
    await delay(50);
    // console.log(this.gameState)
    // console.log("arrayOfCollectables", this.arrayOfCollectables)
  }

  async start() {
    await this.waitForGameToStart();
    this.logger.log("Game Started! Bot is racing...");
    this.running = true;
    while (this.running) {
      if (this.gameState.scene === Scene.End && !this.continueDone) {
        await this.continueToNextGame();
      } else {
        this.continueDone = false;
        await this.update();
        await sleep(this.tickRate);
      }
    }
  }
  async waitForGameToStart() {
    this.logger.log("Waiting for game to start...");
    while (
      this.gameState.scene === Scene.Preload ||
      this.gameState.scene === Scene.End
    ) {
      this.gameState = await this.apiClient.move(Direction.StopSteering);
    }
  }

  async continueToNextGame() {
    this.logger.log("Game ended. Adding you to next game...");
    await this.apiClient.continue();
    this.logger.log("Registration to next game ok!");
    this.continueDone = true;
    await this.waitForGameToStart();
    this.logger.log("Game Started! Bot is racing...");
  }

  async move(direction: Direction) {
    this.gameState = await this.apiClient.move(direction);
  }
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
