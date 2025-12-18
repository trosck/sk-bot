export class UserNotFound extends Error {
  constructor() {
    super();

    this.message = "user not found";
  }
}
