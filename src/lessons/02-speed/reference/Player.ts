class Player extends MonoBehaviour {
  speed = 400;

  Update() {
    this.transform.position = this.transform.position.Add(new Vector2(this.speed * Time.deltaTime, 0));
  }
}
