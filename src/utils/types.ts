import { UserRole } from 'generated/prisma/enums';

export type JWTPaylodType = {
  id: number;
  role: UserRole;
};
