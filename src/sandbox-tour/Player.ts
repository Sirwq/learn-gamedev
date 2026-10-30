// Select Friend in the 🗺 Level tab to set its own sprite in the empty image slot.
class Player extends MonoBehaviour {
  speed = 240;
  gravity = 1400;
  jumpSpeed = 500;
  velocityY = 0;
  onGround = false;

  Update() {
    if (Input.GetKey(KeyCode.RightArrow)) this.transform.position = this.transform.position.Add(new Vector2(this.speed * Time.deltaTime, 0));
    if (Input.GetKey(KeyCode.LeftArrow)) this.transform.position = this.transform.position.Add(new Vector2(-this.speed * Time.deltaTime, 0));
    // Jump plays when the key starts the jump.
    if (Input.GetKeyDown(KeyCode.Space) && this.onGround) {
      this.velocityY = this.jumpSpeed;
      this.onGround = false;
      this.audio.PlayOneShot("Jump");
    }

    this.velocityY = this.velocityY - this.gravity * Time.deltaTime;
    this.transform.position = this.transform.position.Add(new Vector2(0, this.velocityY * Time.deltaTime));
    if (this.transform.position.y < 40) {
      this.transform.position = new Vector2(this.transform.position.x, 40);
      this.velocityY = 0;
      this.onGround = true;
    }
    for (const platform of GameObject.FindGameObjectsWithTag("Platform")) {
      const p = this.transform.position;
      const b = platform.transform.position;
      if (this.velocityY < 0 && p.x < b.x + platform.w && p.x + this.gameObject.w > b.x && p.y < b.y + platform.h && p.y + this.gameObject.h > b.y) {
        this.transform.position = new Vector2(p.x, b.y + platform.h);
        this.velocityY = 0;
        this.onGround = true;
      }
    }
    for (const coin of GameObject.FindGameObjectsWithTag("Coin")) {
      const p = this.transform.position;
      const c = coin.transform.position;
      if (p.x < c.x + coin.w && p.x + this.gameObject.w > c.x && p.y < c.y + coin.h && p.y + this.gameObject.h > c.y) {
        Destroy(coin);
        this.audio.PlayOneShot("Coin");
      }
    }
  }
}
