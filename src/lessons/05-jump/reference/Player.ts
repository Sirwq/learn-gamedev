class Player extends MonoBehaviour {
  speed = 400;
  gravity = 1500;
  jumpSpeed = 600;
  velocityY = 0;
  onGround = false;

  Update() {
    if (Input.GetKey(KeyCode.RightArrow)) {
      this.transform.position = this.transform.position.Add(new Vector2(this.speed * Time.deltaTime, 0));
    }
    if (Input.GetKey(KeyCode.LeftArrow)) {
      this.transform.position = this.transform.position.Add(new Vector2(-this.speed * Time.deltaTime, 0));
    }

    if (Input.GetKeyDown(KeyCode.Space) && this.onGround) {
      this.velocityY = this.jumpSpeed;
      this.onGround = false;
    }

    this.velocityY = this.velocityY - this.gravity * Time.deltaTime;
    this.transform.position = this.transform.position.Add(new Vector2(0, this.velocityY * Time.deltaTime));
    if (this.transform.position.y < 40) {
      this.transform.position = new Vector2(this.transform.position.x, 40);
      this.velocityY = 0;
      this.onGround = true;
    }
  }
}
