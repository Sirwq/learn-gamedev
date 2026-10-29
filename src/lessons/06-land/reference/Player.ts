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

    const box = GameObject.FindGameObjectsWithTag("Platform")[0];
    if (this.velocityY < 0 && Overlaps(this.gameObject, box)) {
      this.transform.position = new Vector2(this.transform.position.x, box.transform.position.y + box.h);
      this.velocityY = 0;
      this.onGround = true;
    }
  }
}
