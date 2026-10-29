class MovingPlatform extends MonoBehaviour {
  speed = 150;
  direction = 1;

  Update() {
    const step = new Vector2(this.speed * this.direction * Time.deltaTime, 0);
    this.transform.position = this.transform.position.Add(step);
    const x = this.transform.position.x;
    if (x < 300 || x > 1180) {
      this.direction = -this.direction;
    }
  }
}
