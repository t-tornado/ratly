import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { RequestType } from "../lib/types";

@Injectable()
export class RejectUnknownUsers implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext) {
    const rType = context.getType();

    console.log(" < < < < < < ", { rType });
    // const req = context.switchToHttp().getRequest<RequestType>();
    // // guard for socket connections
    // if (!req.headers) return true;
    // const userId = req.headers["x-user-id"];
    // if (!userId) {
    //   throw new Error("No User Id");
    // }

    return true;
  }
}
