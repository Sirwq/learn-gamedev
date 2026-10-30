class HUD extends MonoBehaviour {
  OnGUI() {
    const players = GameObject.FindGameObjectsWithTag("Player");
    if (players.length === 0) return;
    const coins = 5 - GameObject.FindGameObjectsWithTag("Coin").length;
    GUI.Label(new Rect(16, 16, 220, 40), "Coins: " + coins);
  }
}
