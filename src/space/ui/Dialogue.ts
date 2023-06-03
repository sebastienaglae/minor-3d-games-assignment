import { AdvancedDynamicTexture, Control, TextBlock } from "@babylonjs/gui";

export class Dialogue {
  private static instance: Dialogue;
  private _uiTexture: AdvancedDynamicTexture;
  private _texts: string[] = [];
  private _cloneTexts: string[] = [];
  private _textTime: number[] = [];
  private _textTimeClone: number[] = [];
  private monsterCountElement: HTMLDivElement;
  private chestCountElement: HTMLDivElement;
  private retryButton: HTMLButtonElement;
  private playerInfo: PlayerInfo;
  private dialoguesElement: HTMLDivElement;
  private hintElement: HTMLDivElement;
  private overlayElement: HTMLDivElement;
  private gameOverElement: HTMLDivElement;
  private gameEndElement: HTMLDivElement;

  private itemCollectContainer: HTMLDivElement;
  private itemCollectImage: HTMLImageElement;
  private itemCollectName: HTMLDivElement;
  private itemCollectQueue: CollectItem[] = [];
  private itemCollectNextTime: number = 0;

  private _isLooping: boolean = false;

  constructor() {
    this.monsterCountElement = document.getElementById(
      "monster-count"
    ) as HTMLDivElement;
    this.chestCountElement = document.getElementById(
        "chest-count"
    ) as HTMLDivElement;
    this.playerInfo = {
      healthBar: document.getElementById("health-bar") as HTMLDivElement,
      questTitle: document.getElementById("quest-title") as HTMLDivElement,
      questDescription: document.getElementById(
        "quest-description"
      ) as HTMLDivElement,
      playerImage: document.getElementById("player-image") as HTMLImageElement,
    };
    this.dialoguesElement = document.getElementById(
      "dialogues"
    ) as HTMLDivElement;
    this.hintElement = document.getElementById("hint-text") as HTMLDivElement;
    this.overlayElement = document.getElementById(
      "game-overlay"
    ) as HTMLDivElement;
    this.retryButton = document.getElementById(
        "retry-button"
    ) as HTMLButtonElement;
    this.gameOverElement = document.getElementById(
        "game-over"
    ) as HTMLDivElement;
    this.gameEndElement = document.getElementById(
        "game-end"
    ) as HTMLDivElement;
    this.itemCollectContainer = document.getElementById(
        "item-collect-container"
    ) as HTMLDivElement;
    this.itemCollectImage = document.getElementById(
        "item-collect-image"
    ) as HTMLImageElement;
    this.itemCollectName = document.getElementById(
        "item-collect-name"
    ) as HTMLDivElement;
  }

  public static getInstance(): Dialogue {
    if (!Dialogue.instance) {
      Dialogue.instance = new Dialogue();
    }
    return Dialogue.instance;
  }

  public set isLooping(value: boolean) {
    this._isLooping = value;
  }

  public addText(text: string, time: number) {
    this._texts.push(text);
    this._textTime.push(time);
    this._cloneTexts = [...this._texts];
    this._textTimeClone = [...this._textTime];
  }

  public update(deltaTime: number) {
    if (this._texts.length > 0) {
      this.dialoguesElement.style.display = "block";
      this.updateDialogues(this._texts[0]);
      this._textTime[0] -= deltaTime;
      if (this._textTime[0] < 0) {
        this._texts.shift();
        this._textTime.shift();
      }
    } else {
      this.clearDialogues();
      if (this._isLooping) {
        this._texts = [...this._cloneTexts];
        this._textTime = [...this._textTimeClone];
      }
    }

    if (this.itemCollectNextTime > 0) {
      this.itemCollectNextTime -= deltaTime;
      if (this.itemCollectNextTime <= 1) {
        this.itemCollectContainer.style.animation = "slideOutToLeft 1s";
      }
    }

    if (this.itemCollectNextTime <= 0) {
      if (this.itemCollectQueue.length > 0) {
        const itemCollect = this.itemCollectQueue.shift();
        this.itemCollectImage.src = itemCollect.image;
        this.itemCollectName.innerText = itemCollect.name;
        this.itemCollectContainer.style.display = "flex";
        this.itemCollectContainer.style.animation = "slideInFromLeft 1s";
        this.itemCollectNextTime = 7;
      } else {
        this.itemCollectContainer.style.display = "none";
      }
    }
  }

  updateMonsterCount(count: number) {
    this.monsterCountElement.innerText = `Monstres restants : ${count}`;
  }

  updateChestCount(count: number, total: number) {
    this.chestCountElement.innerText = `Coffres trouvés : ${count} / ${total}`;
  }

  updatePlayerInfo(
    health: number,
    questTitle: string,
    questDescription: string
  ) {
    this.playerInfo.healthBar.style.width = `${health}%`;
    this.playerInfo.questTitle.innerText = questTitle;
    this.playerInfo.questDescription.innerText = questDescription;
  }

  updateHealthBar(health: number) {
    this.playerInfo.healthBar.style.width = `${health*2}%`;
  }

  updateQuest(questTitle: string, questDescription: string) {
    this.playerInfo.questTitle.innerText = questTitle;
    this.playerInfo.questDescription.innerHTML = questDescription;
  }

  updateQuestTitle(questTitle: string) {
    this.playerInfo.questTitle.innerText = questTitle;
  }

  updateQuestDescription(questDescription: string) {
    this.playerInfo.questDescription.innerText = questDescription;
  }

  updateDialogues(dialogues: string) {
      this.dialoguesElement.style.display = "block";
    this.dialoguesElement.innerText = dialogues;
  }

  updatePlayerImage(playerImage: string) {
    this.playerInfo.playerImage.src = playerImage;
  }

  show() {
    this.monsterCountElement.style.display = "block";
    this.chestCountElement.style.display = "block";
    this.playerInfo.healthBar.style.display = "block";
    this.playerInfo.questTitle.style.display = "block";
    this.playerInfo.questDescription.style.display = "block";
    this.dialoguesElement.style.display = "block";
    this.playerInfo.playerImage.style.display = "block";
    this.hintElement.style.display = "block";
    this.overlayElement.style.display = "block";
  }

  hide() {
    this.overlayElement.style.display = "none";
    this.gameOverElement.style.display = "none";
  }

  clearDialogues() {
    this.dialoguesElement.innerText = "";
    this.dialoguesElement.style.display = "none";
  }

  showOnlyDialogues() {
    this.monsterCountElement.style.display = "none";
    this.chestCountElement.style.display = "none";
    this.playerInfo.healthBar.style.display = "none";
    this.playerInfo.questTitle.style.display = "none";
    this.playerInfo.questDescription.style.display = "none";
    this.dialoguesElement.style.display = "none";
    this.playerInfo.playerImage.style.display = "none";
    this.hintElement.style.display = "block";
    this.overlayElement.style.display = "block";
  }

  updateHint(hint: string) {
    this.hintElement.style.display = "block";
    this.hintElement.innerText = hint;
  }

  hideHint() {
    this.hintElement.style.display = "none";
  }

  public clear() {
    this._texts = [];
    this._textTime = [];
    this._cloneTexts = [];
    this._textTimeClone = [];
  }

  public get isCompleted(): boolean {
    return this._texts.length == 0;
  }

  public onRetry(callback: () => void) {
    this.retryButton.addEventListener("click", callback, {
        once: true,
    });
  }

  public showGameOver() {
    this.gameOverElement.style.display = "block";
  }

  public hideGameOver() {
    this.gameOverElement.style.display = "none";
  }

  public showGameEnd() {
    this.gameEndElement.style.display = "block";
  }

  public addCollectItem(name: string, image: string) {
    this.itemCollectQueue.push({ name, image });
  }
}

interface CollectItem {
  name: string;
  image: string;
}

interface PlayerInfo {
  healthBar: HTMLDivElement;
  questTitle: HTMLDivElement;
  questDescription: HTMLDivElement;
  playerImage: HTMLImageElement;
}
