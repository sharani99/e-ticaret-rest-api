import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JWTPaylodType } from "src/utils/types";


export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): JWTPaylodType => {
    const req = context.switchToHttp().getRequest();

    const payload: JWTPaylodType = req.user;

    return payload;
  },
);