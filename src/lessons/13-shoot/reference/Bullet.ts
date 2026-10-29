class Bullet extends MonoBehaviour {
  speed = 600;

  Update() {
    this.transform.position = this.transform.position.Add(new Vector2(this.speed * Time.deltaTime, 0));

    const p = this.transform.position;
    const enemies = GameObject.FindGameObjectsWithTag("Enemy");
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i].transform.position;
      if (p.x < e.x + enemies[i].w && e.x < p.x + this.gameObject.w && p.y < e.y + enemies[i].h && e.y < p.y + this.gameObject.h) {
        Destroy(enemies[i]);
        Destroy(this.gameObject);
      }
    }

    if (p.x > Camera.main.transform.position.x + 480) {
      Destroy(this.gameObject);
    }
  }
}
