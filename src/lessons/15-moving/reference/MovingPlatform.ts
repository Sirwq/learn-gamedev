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

    const top = this.transform.position.y + this.gameObject.h;
    const players = GameObject.FindGameObjectsWithTag("Player");
    for (let i = 0; i < players.length; i++) {
      const p = players[i].transform.position;
      if (p.y === top && p.x < x + this.gameObject.w && x < p.x + players[i].w) {
        players[i].transform.position = p.Add(step);
      }
    }
  }
}
