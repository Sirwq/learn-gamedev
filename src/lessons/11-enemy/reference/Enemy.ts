class Enemy extends MonoBehaviour {
  speed = 120;
  direction = 1;

  Update() {
    this.transform.position = this.transform.position.Add(new Vector2(this.speed * this.direction * Time.deltaTime, 0));

    const x = this.transform.position.x;
    const walls = GameObject.FindGameObjectsWithTag("Wall");
    for (let i = 0; i < walls.length; i++) {
      const wall = walls[i];
      if (x < wall.transform.position.x + wall.w && wall.transform.position.x < x + this.gameObject.w) {
        this.direction = -this.direction;
      }
    }
  }
}
