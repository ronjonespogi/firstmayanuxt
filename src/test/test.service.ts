import { Service } from "@mayajs/core";
import { MongoDbServices } from "@mayajs/mongo";

@Service()
export class TestServices {
  get model() {
    const db = this.mongo.database("con1");
    return db.instance.model("Test");
  }
  constructor(private mongo: MongoDbServices) {}

  async createNew(body: {}) {
    const res = await this.model.create(body);
    return res;
  }

  async getAll() {
    try {
      const tests = await this.model.find({});
      console.log(tests);
      return { message: tests };
    } catch (ex) {
      console.log(ex);
      return ex;
    }
  }

  testfunc() {
    return "kahitano";
  }
}
