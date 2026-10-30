class HUD extends MonoBehaviour {
  OnGUI() {
    // This Level starts with three coins.
    const collected = 3 - GameObject.FindGameObjectsWithTag("Coin").length;
    GUI.Label(new Rect(16, 16, 220, 40), "Coins: " + collected);
  }
}
