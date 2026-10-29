class Player extends MonoBehaviour {
  Update() {
    this.transform.position = this.transform.position.Add(new Vector2(3, 0));
  }
}
