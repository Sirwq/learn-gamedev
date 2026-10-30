function Overlaps(a: GameObject, b: GameObject): boolean {
  const pa = a.transform.position;
  const pb = b.transform.position;
  return pa.x < pb.x + b.w && pb.x < pa.x + a.w && pa.y < pb.y + b.h && pb.y < pa.y + a.h;
}

class Player extends MonoBehaviour {
  speed = 400;
  gravity = 1500;
  jumpSpeed = 600;
  velocityY = 0;
  onGround = false;
  coyote = 0;
  jumpBuffer = 0;
  coins = 0;
  health = 3;
  start = new Vector2(0, 0);

  Start() {
    this.start = this.transform.position;
    this.health = 3;
  }

  Update() {
    if (Input.GetKey(KeyCode.RightArrow)) {
      this.transform.position = this.transform.position.Add(new Vector2(this.speed * Time.deltaTime, 0));
    }
    if (Input.GetKey(KeyCode.LeftArrow)) {
      this.transform.position = this.transform.position.Add(new Vector2(-this.speed * Time.deltaTime, 0));
    }

    const walls = GameObject.FindGameObjectsWithTag("Wall");
    for (let i = 0; i < walls.length; i++) {
      const wall = walls[i];
      if (Overlaps(this.gameObject, wall)) {
        if (Input.GetKey(KeyCode.RightArrow)) {
          this.transform.position = new Vector2(wall.transform.position.x - this.gameObject.w, this.transform.position.y);
        } else if (Input.GetKey(KeyCode.LeftArrow)) {
          this.transform.position = new Vector2(wall.transform.position.x + wall.w, this.transform.position.y);
        }
      }
    }

    const ground = GameObject.FindGameObjectsWithTag("Ground");
    const platformsBelow = GameObject.FindGameObjectsWithTag("Platform").concat(GameObject.FindGameObjectsWithTag("Wall"), ground);
    const feet = this.transform.position;
    this.onGround = platformsBelow.some((box) => feet.x < box.transform.position.x + box.w && feet.x + this.gameObject.w > box.transform.position.x && Math.abs(feet.y - box.transform.position.y - box.h) < 2);
    this.coyote = this.onGround ? 0.1 : Math.max(0, this.coyote - Time.deltaTime);

    this.jumpBuffer = Input.GetKeyDown(KeyCode.Space) ? 0.1 : Math.max(0, this.jumpBuffer - Time.deltaTime);
    if (this.jumpBuffer > 0 && (this.onGround || this.coyote > 0)) {
      this.velocityY = this.jumpSpeed;
      this.onGround = false;
      this.coyote = 0;
      this.jumpBuffer = 0;
      this.audio.PlayOneShot("Jump");
    }

    if (Input.GetKeyUp(KeyCode.Space) && this.velocityY > 0) this.velocityY = this.velocityY / 2;

    this.velocityY = this.velocityY - this.gravity * Time.deltaTime;
    this.transform.position = this.transform.position.Add(new Vector2(0, this.velocityY * Time.deltaTime));
    for (const box of ground) {
      if (this.velocityY < 0 && Overlaps(this.gameObject, box) && feet.y >= box.transform.position.y + box.h - 2) {
        this.transform.position = new Vector2(this.transform.position.x, box.transform.position.y + box.h);
        this.velocityY = 0;
        this.onGround = true;
      }
    }

    const platforms = GameObject.FindGameObjectsWithTag("Platform").concat(walls);
    for (let i = 0; i < platforms.length; i++) {
      const box = platforms[i];
      if (this.velocityY < 0 && Overlaps(this.gameObject, box) && feet.y >= box.transform.position.y + box.h - 2) {
        this.transform.position = new Vector2(this.transform.position.x, box.transform.position.y + box.h);
        this.velocityY = 0;
        this.onGround = true;
      }
    }

    const coins = GameObject.FindGameObjectsWithTag("Coin");
    for (let i = 0; i < coins.length; i++) {
      if (Overlaps(this.gameObject, coins[i])) {
        Destroy(coins[i]);
        this.coins = this.coins + 1;
        this.audio.PlayOneShot("Coin");
        Debug.Log("coins: " + this.coins);
      }
    }

    const enemies = GameObject.FindGameObjectsWithTag("Enemy");
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      if (this.velocityY < 0 && Overlaps(this.gameObject, enemy) && this.transform.position.y > enemy.transform.position.y + enemy.h / 2) {
        Destroy(enemy);
        this.velocityY = this.jumpSpeed / 2;
      }
    }

    const spikes = GameObject.FindGameObjectsWithTag("Spikes");
    for (let i = 0; i < spikes.length; i++) {
      if (Overlaps(this.gameObject, spikes[i])) {
        this.health = this.health - 1;
        Debug.Log("health: " + this.health);
        if (this.health <= 0) {
          Destroy(this.gameObject);
          return;
        }
        this.transform.position = this.start;
        this.velocityY = 0;
      }
    }

    if (Input.GetKeyDown(KeyCode.S)) {
      Instantiate({ tag: "Bullet", w: 8, h: 4, color: "white", script: "Bullet" }, this.transform.position.Add(new Vector2(this.gameObject.w, 14)));
    }

    Camera.main.transform.position = new Vector2(this.transform.position.x, 270);
  }
}
